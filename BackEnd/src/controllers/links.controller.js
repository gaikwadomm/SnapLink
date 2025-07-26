import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { Link } from "../models/link.models.js";
import { linkCollection } from "../models/linkCollection.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { io } from "../app.js";

const createLinkCollection = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user._id; // Assuming user ID is stored in req.user by verifyJWT middleware

  // Validate required fields
  if (!name) {
    return res.status(400).json({ message: "Name is required." });
  }

  // Create and save the link collection
  const newLinkCollection = new linkCollection({
    userId,
    name,
    description,
  });

  const savedLinkCollection = await newLinkCollection.save();

  // Emit a socket event to notify clients about the new link collection
  io.emit("link-collections-changed");

  return res.status(201).json({
    message: "Link collection created successfully!",
    data: savedLinkCollection,
  });
});

const getUserCollections = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const collections = await linkCollection
      .find({ userId })
      .sort({ createdAt: -1 });

    if (!collections || collections.length === 0) {
      return res
        .status(404)
        .json({ message: "No collections found for this user." });
    }

    return res.status(200).json({
      message: "Collections retrieved successfully!",
      data: collections,
    });
  } catch (error) {
    console.error("Error in getUserCollections:", error);
    throw new ApiError(500, "Internal Server Error");
  }
});

const addUrl = asyncHandler(async (req, res) => {
  try {
    const { title, urlLink, tags, notes } = req.body;
    // Validate required fields
    if (!title || !urlLink) {
      return res.status(400).json({ message: "Title and URL are required." });
    }

    // Create and save the link (encryption happens in the model pre-save hook)
    const newLink = new Link({
      userId: req.user._id, // Assuming user ID is stored in req.user by verifyJWT middleware
      collectionId: req.body.collectionId || null, // Optional collection ID
      title,
      urlLink,
      tags,
      notes,
    });
    //  console.log("Adding link:", newLink);

    const savedNewLink = await newLink.save();

    //  console.log("Link added successfully:", newLink);

    // Emit a socket event to notify clients about the new link
    // server-side (after links change)
    io.emit("links-changed");
    return res.status(201).json({
      message: "Link added successfully!",
      data: {
        id: newLink._id,
        title: newLink.title,
        tags: newLink.tags,
        notes: newLink.notes,
        createdAt: newLink.createdAt,
        decryptedUrl: newLink.decryptedUrl, // virtual field
      },
    });
  } catch (error) {
    console.error("Error in addUrl:", error);
    throw new ApiError(500, "Internal Server Error");
  }
});

const getUserLinks = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const links = await Link.find({ userId });
    if (!links || links.length === 0) {
      return res.status(404).json({ message: "No links found for this user." });
    }

    // Convert each link to an object with virtuals included AND strip encryptedUrl/iv
    const processedLinks = links.map((link) => {
      const obj = link.toObject({ virtuals: true });
      delete obj.encryptedUrl;
      delete obj.iv;
      delete obj.urlLink; // Optional: hide blank/undefined urlLink column
      // Now obj.decryptedUrl contains the *real* URL :D
      return obj;
    });

    return res.status(200).json({
      message: "Links retrieved successfully!",
      data: processedLinks,
    });
  } catch (error) {
    console.error("Error in getUserLinks:", error);
    throw new ApiError(500, "Internal Server Error");
  }
});

const deleteLink = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  // Find the link by ID and ensure it belongs to the user
  const link = await Link.findOne({ _id: id, userId });
  if (!link) {
    return res.status(404).json({ message: "Link not found." });
  }

  // Delete the link
  await Link.deleteOne({ _id: id });

  // server-side (after links change)
  io.emit("links-changed");

  return res.status(200).json({
    message: "Link deleted successfully!",
    data: { id },
  });
});

const updateLink = asyncHandler(async (req, res) => {
  console.log("Update begin...");
  const { id } = req.params;
  const { title, urlLink, tags, notes } = req.body;
  const userId = req.user._id;

  console.log("Update request data:", {
    id,
    title,
    urlLink,
    tags,
    notes,
    userId,
  });

  // Find the link by ID and ensure it belongs to the user
  const link = await Link.findOne({ _id: id, userId });
  if (!link) {
    return res.status(404).json({ message: "Link not found." });
  }

  // Validate: at least one field is present (now allows null/empty string/empty array)
  if (
    title === undefined &&
    urlLink === undefined &&
    tags === undefined &&
    notes === undefined
  ) {
    return res
      .status(400)
      .json({ message: "At least one field must be provided to update." });
  }

  // Update only provided fields
  if (title !== undefined) link.title = title;
  if (urlLink !== undefined) link.urlLink = urlLink;
  if (tags !== undefined) {
    // Ensure tags is always an array
    link.tags = Array.isArray(tags) ? tags : [];
  }
  if (notes !== undefined) link.notes = notes;

  console.log("Link before save:", link);

  // Save (encryption runs if urlLink changes)
  const updatedLink = await link.save();

  // Prepare secure response
  const updatedLinkObj = updatedLink.toObject({ virtuals: true });
  delete updatedLinkObj.encryptedUrl;
  delete updatedLinkObj.iv;
  delete updatedLinkObj.urlLink; // Optional: hide plain urlLink

  console.log("Link updated successfully:", updatedLinkObj);

  // server-side (after links change)
  io.emit("links-changed");

  res.status(200).json({
    message: "Link updated successfully!",
    data: updatedLinkObj,
  });
});

const filterByTags = asyncHandler(async (req, res) => {
  const { tags } = req.query; // Expecting tags as a comma-separated string
  if (!tags) {
    return res
      .status(400)
      .json({ message: "Tags query parameter is required." });
  }
  const tagArray = tags.split(",").map((tag) => tag.trim());
  const userId = req.user._id;
  const links = await Link.find({ userId, tags: { $in: tagArray } });
  if (!links || links.length === 0) {
    return res
      .status(404)
      .json({ message: "No links found for the specified tags." });
  }
  // Convert each link to an object with virtuals included AND strip encryptedUrl/iv
  const processedLinks = links.map((link) => {
    const obj = link.toObject({ virtuals: true });
    delete obj.encryptedUrl;
    delete obj.iv;
    delete obj.urlLink; // Optional: hide blank/undefined urlLink column
    // Now obj.decryptedUrl contains the *real* URL :D
    return obj;
  });
  return res.status(200).json({
    message: "Links retrieved successfully!",
    data: processedLinks,
  });
});

export {
  addUrl,
  getUserLinks,
  deleteLink,
  updateLink,
  filterByTags,
  createLinkCollection,
  getUserCollections,
};
