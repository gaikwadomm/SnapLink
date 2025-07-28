import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import axiosInstance from "../../utils/axiosInstance.js";
import toast, { Toaster } from "react-hot-toast";
import React from "react";

export default function Addurl({ onSuccess, selectedCollection }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    urlLink: "",
    tags: [""],
    notes: "",
    collectionId: "",
  });
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [collections, setCollections] = useState([]);
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);

  // Fetch collections for dropdown
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setIsLoadingCollections(true);
        const res = await axiosInstance.get("/v1/links/get-collections");
        const collectionsData = Array.isArray(res.data.data)
          ? res.data.data
          : [];
        setCollections(collectionsData);
      } catch (err) {
        console.error("Error fetching collections:", err);
        // It's okay if no collections exist
        setCollections([]);
      } finally {
        setIsLoadingCollections(false);
      }
    };

    fetchCollections();
  }, []);

  // Set pre-selected collection if provided
  useEffect(() => {
    if (selectedCollection) {
      setFormData((prev) => ({
        ...prev,
        collectionId: selectedCollection._id,
      }));
    }
  }, [selectedCollection]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagChange = (index, value) => {
    const newTags = [...formData.tags];
    newTags[index] = value;
    setFormData((prev) => ({ ...prev, tags: newTags }));
  };

  const addTagField = () => {
    if (formData.tags.length < 5) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, ""] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (buttonDisabled) return;
    setButtonDisabled(true);

    try {
      // Clean up form data before sending
      const submitData = {
        title: formData.title,
        urlLink: formData.urlLink,
        tags: formData.tags
          .filter((tag) => tag.trim())
          .map((tag) => tag.trim()),
        notes: formData.notes,
      };

      // Only include collectionId if one is selected
      if (formData.collectionId) {
        submitData.collectionId = formData.collectionId;
      }

      console.log("Submitting:", submitData);
      const response = await axiosInstance.post("/v1/links/addUrl", submitData);
      console.log("Response:", response.data);
      toast.success("Link added successfully!");

      // Reset form
      setFormData({
        title: "",
        urlLink: "",
        tags: [""],
        notes: "",
        collectionId: selectedCollection?._id || "",
      });

      // Call success callback if provided (for modal usage)
      if (onSuccess) {
        onSuccess();
      } else {
        // Navigate if used as standalone page
        setTimeout(() => {
          navigate("/UserLinks");
        }, 1000);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="w-full max-w-md bg-neutral-800 border border-neutral-700 rounded-xl shadow-lg p-8 text-white">
      {/* <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            background: "#23272a",
            color: "#fff",
            borderRadius: "8px",
            border: "1px solid #FFD580",
            boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
            fontSize: "1rem",
            padding: "16px 24px",
          },
          success: {
            iconTheme: {
              primary: "#FFD580",
              secondary: "#23272a",
            },
            style: {
              border: "1px solid #FFD580",
              background: "#23272a",
              color: "#FFD580",
            },
          },
          error: {
            iconTheme: {
              primary: "#ff4d4f",
              secondary: "#23272a",
            },
            style: {
              border: "1px solid #ff4d4f",
              background: "#23272a",
              color: "#ff4d4f",
            },
          },
        }}
      /> */}
      <h2 className="text-xl font-semibold mb-6">Add a New Link</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Link title"
          required
          className="w-full px-4 py-3 rounded-lg bg-neutral-900 text-white border border-neutral-600 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />

        <input
          type="url"
          name="urlLink"
          value={formData.urlLink}
          onChange={handleChange}
          placeholder="https://example.com"
          required
          className="w-full px-4 py-3 rounded-lg bg-neutral-900 text-white border border-neutral-600 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Collection Selection */}
        <div className="space-y-2">
          <label className="block text-sm text-gray-300">
            Collection (Optional)
          </label>
          <select
            name="collectionId"
            value={formData.collectionId}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-neutral-900 text-white border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoadingCollections}
          >
            <option value="">No Collection (General)</option>
            {collections.map((collection) => (
              <option key={collection._id} value={collection._id}>
                {collection.name}
              </option>
            ))}
          </select>
          {selectedCollection && (
            <p className="text-xs text-purple-400">
              Pre-selected: {selectedCollection.name}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm text-gray-300">Tags (max 5)</label>
          {formData.tags.map((tag, index) => (
            <input
              key={index}
              type="text"
              value={tag}
              onChange={(e) => handleTagChange(index, e.target.value)}
              placeholder={`Tag ${index + 1}`}
              className="w-full px-4 py-2 rounded-lg bg-neutral-900 text-white border border-neutral-600 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          ))}
          {formData.tags.length < 5 && (
            <button
              type="button"
              onClick={addTagField}
              className="text-sm text-amber-400 hover:underline mt-1"
            >
              + Add Tag
            </button>
          )}
        </div>

        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Additional notes (optional)"
          rows={3}
          className="w-full px-4 py-3 rounded-lg bg-neutral-900 text-white border border-neutral-600 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-slate-500 resize-none"
        />

        <button
          type="submit"
          disabled={buttonDisabled}
          className={`w-full py-3 rounded-lg font-bold shadow-md transition
    ${
      buttonDisabled
        ? "bg-gray-500 cursor-not-allowed"
        : "bg-gradient-to-r from-blue-500 to-amber-500 text-black hover:from-blue-600 hover:to-amber-600"
    }
  `}
        >
          {buttonDisabled ? "Saving..." : "Save Link"}
        </button>
      </form>
    </div>
  );
}
