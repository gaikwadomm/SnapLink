import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { Link } from "../models/link.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const addUrl = asyncHandler(async(req,res)=>{
   try {
      const { title, urlLink, tags, notes } = req.body;
     // Validate required fields
     if (!title || !urlLink) {
       return res.status(400).json({ message: "Title and URL are required." });
     }

     // Create and save the link (encryption happens in the model pre-save hook)
     const newLink = new Link({
        userId: req.user._id, // Assuming user ID is stored in req.user by verifyJWT middleware
       title,
       urlLink,
       tags,
       notes,
     });
    //  console.log("Adding link:", newLink);

     const savedNewLink = await newLink.save();

    //  console.log("Link added successfully:", newLink);

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


export { addUrl, getUserLinks };