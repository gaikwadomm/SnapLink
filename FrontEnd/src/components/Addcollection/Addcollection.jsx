import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import React from "react";

export default function Addcollection({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoading) return;
    setIsLoading(true);

    // Validate required fields
    if (!formData.name.trim()) {
      toast.error("Collection name is required!");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Creating collection:", formData);
      const response = await axios.post(
        "/api/v1/links/create-link-collection",
        {
          name: formData.name.trim(),
          description: formData.description.trim() || "",
        }
      );

      console.log("Collection created:", response.data);
      toast.success("Collection created successfully!");

      // Reset form
      setFormData({ name: "", description: "" });

      // Call success callback to close modal and refresh data
      if (onSuccess) {
        onSuccess(response.data.data);
      }
    } catch (error) {
      console.error("Error creating collection:", error);
      toast.error(
        error.response?.data?.message || "Failed to create collection"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-fit bg-gradient-to-br from-slate-900 via-neutral-900 to-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Create Collection
          </h1>
          <p className="text-gray-400">
            Organize your links into themed collections
          </p>
        </div>

        {/* Form */}
        <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Collection Name Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Collection Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., College Resources, Web Development, Design Inspiration"
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                required
                disabled={isLoading}
                maxLength={50}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.name.length}/50 characters
              </p>
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what kind of links you'll save in this collection..."
                rows={4}
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition resize-none"
                disabled={isLoading}
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/200 characters
              </p>
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
                disabled={isLoading || !formData.name.trim()}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                    Creating...
                  </>
                ) : (
                  <>
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
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                    Create Collection
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Tips */}
          <div className="mt-6 p-4 bg-neutral-800 border border-neutral-600 rounded-lg">
            <h3 className="text-sm font-semibold text-purple-400 mb-2">
              💡 Collection Tips:
            </h3>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>
                • Use descriptive names like "React Resources" or "Job
                Applications"
              </li>
              <li>• Collections help you organize links by topic or project</li>
              <li>
                • You can add links to collections when creating or editing them
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
