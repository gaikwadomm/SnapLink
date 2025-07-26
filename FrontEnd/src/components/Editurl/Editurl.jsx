import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance.js";
import toast from "react-hot-toast";
import React from "react";

export default function Editurl({ linkData, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    title: "",
    urlLink: "",
    tags: [""],
    notes: "",
  });
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Pre-fill form with existing link data
  useEffect(() => {
    if (linkData) {
      const tagsArray = linkData.tags
        ? typeof linkData.tags === "string"
          ? linkData.tags.split(/[,\s]+/).filter((tag) => tag.trim())
          : Array.isArray(linkData.tags)
          ? linkData.tags
          : []
        : [""];

      setFormData({
        title: linkData.title || "",
        urlLink: linkData.decryptedUrl || linkData.urlLink || "",
        tags: tagsArray.length > 0 ? tagsArray : [""],
        notes: linkData.notes || "",
      });
    }
  }, [linkData]);

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

  const removeTagField = (index) => {
    if (formData.tags.length > 1) {
      const newTags = formData.tags.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, tags: newTags }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (buttonDisabled || isLoading) return;
    setButtonDisabled(true);
    setIsLoading(true);

    try {
      // Clean up tags before sending to backend
      const cleanedTags = formData.tags
        .filter((tag) => tag && tag.trim()) // Remove empty/null tags
        .map((tag) => tag.trim()); // Trim whitespace

      // Prepare data for backend
      const updateData = {
        title: formData.title,
        urlLink: formData.urlLink,
        tags: cleanedTags.length > 0 ? cleanedTags : [], // Send empty array if no tags
        notes: formData.notes,
      };

      console.log("Updating link:", updateData);
      const response = await axiosInstance.patch(
        `/api/v1/links/update-link/${linkData._id || linkData.id}`,
        updateData
      );
      console.log("Response:", response.data);
      toast.success("Link updated successfully!");

      // Call success callback to close modal and refresh data
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error updating link:", error);
      toast.error(error.response?.data?.message || "Failed to update link");
    } finally {
      setButtonDisabled(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-fit bg-gradient-to-br from-slate-900 via-neutral-900 to-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Edit Link
          </h1>
          <p className="text-gray-400">Update your saved link details</p>
        </div>

        {/* Form */}
        <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter a descriptive title for your link"
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                required
                disabled={isLoading}
              />
            </div>

            {/* URL Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                URL *
              </label>
              <input
                type="url"
                name="urlLink"
                value={formData.urlLink}
                onChange={handleChange}
                placeholder="https://example.com"
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                required
                disabled={isLoading}
              />
            </div>

            {/* Tags Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Tags (Optional)
              </label>
              <div className="space-y-3">
                {formData.tags.map((tag, index) => (
                  <div key={index} className="flex gap-3 items-center">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => handleTagChange(index, e.target.value)}
                      placeholder={`Tag ${index + 1}`}
                      className="flex-1 px-4 py-3 bg-neutral-800 border border-neutral-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                      disabled={isLoading}
                    />
                    {formData.tags.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTagField(index)}
                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-50"
                        disabled={isLoading}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}

                {formData.tags.length < 5 && (
                  <button
                    type="button"
                    onClick={addTagField}
                    className="w-full py-2 border-2 border-dashed border-neutral-600 rounded-lg text-gray-400 hover:border-blue-500 hover:text-blue-400 transition disabled:opacity-50"
                    disabled={isLoading}
                  >
                    + Add Another Tag
                  </button>
                )}
              </div>
            </div>

            {/* Notes Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add any additional notes or description..."
                rows={4}
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition resize-none"
                disabled={isLoading}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 py-3 px-6 border border-neutral-600 text-gray-300 rounded-lg hover:bg-neutral-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={buttonDisabled || isLoading}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Updating...
                  </>
                ) : (
                  "Update Link"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
