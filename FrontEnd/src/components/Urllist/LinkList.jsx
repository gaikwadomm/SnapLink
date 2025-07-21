import { useState, useEffect } from "react";
import axios from "axios";

// const userLinks = await axios.get("/api/v1/links/saved-links");

export default function LinkList() {
  const [copiedId, setCopiedId] = useState(null);
  const [showTags, setShowTags] = useState(false);
  const [userLinks, setLinks] = useState([]);
useEffect(() => {
  const fetchLinks = async () => {
    try {
      const res = await axios.get("/api/v1/links/saved-links");
      setLinks(res.data.data);
    } catch (err) {
      console.error("Error fetching links:", err);
    }
  };

  // Initial fetch
  fetchLinks();

  // Poll every 5 seconds
  const interval = setInterval(fetchLinks(), 3000);

  return () => clearInterval(interval); // cleanup on unmount
}, []);
  
  const handleCopy = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 bg-neutral-800 border border-neutral-700 rounded-xl shadow-lg text-white relative">
      <h2 className="text-2xl font-bold mb-6 tracking-wide">
        Your Saved Links
      </h2>
      {/* Show Tags Toggle Button */}
      <button
        className="absolute top-4 right-6 px-4 py-2 bg-gray-700 hover:bg-gray-800 rounded-full text-xs font-semibold transition"
        onClick={() => setShowTags((prev) => !prev)}
      >
        {showTags ? "Hide Tags" : "Show Tags"}
      </button>

      <div className="space-y-6 mt-6">
        {userLinks.map((link) => (
          <div
            key={link.id}
            className="bg-neutral-900 border border-neutral-700 rounded-lg p-5 relative group transition hover:border-blue-500"
          >
            {/* Title and Actions always aligned */}
            <div className="flex items-start justify-between gap-2">
              <button
                className="block text-lg font-semibold text-white hover:text-blue-400 transition text-left"
                onClick={() => handleCopy(link.url, link.id)}
              >
                {link.title}
              </button>
              {/* Actions always aligned with title */}
              <div className="flex gap-4 text-sm ml-2">
                <button
                  className="w-9 h-9 flex items-center justify-center rounded-full border-2 border-blue-500 text-blue-500 hover:bg-blue-600 hover:text-white transition disabled:opacity-50"
                  title="Edit"
                >
                  {"✏️"}
                </button>
                <button
                  className="w-9 h-9 flex items-center justify-center rounded-full border-2 border-red-500 text-red-500 hover:bg-red-600 hover:text-white transition"
                  title="Delete"
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
                      d="M6 7h12M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2m2 0v12a2 2 0 01-2 2H8a2 2 0 01-2-2V7h12z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 11v6M14 11v6"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* URL – visible on mobile, hover-reveal on desktop */}
            <p className="inline-block text-sm mt-1 text-gray-400 bg-neutral-700 px-3 py-0.5 rounded border border-neutral-600">
              <a href={link.decryptedUrl}>{link.decryptedUrl}</a>
            </p>

            {/* Copied feedback */}
            {copiedId === link.id && (
              <span className="absolute top-2 right-3 bg-blue-600 text-white text-xs px-2 py-1 rounded shadow">
                Link copied!
              </span>
            )}

            {/* Tags */}
            {showTags && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <div className="flex flex-wrap gap-2 text-sm">
                  {link.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-700 rounded-full border border-gray-600 text-white"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {link.notes && (
              <p className="mt-3 text-sm text-gray-400 italic">{link.notes}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
