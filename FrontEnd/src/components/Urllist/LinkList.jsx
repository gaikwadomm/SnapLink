import { useState, useEffect } from "react";
import axios from "axios";
import { Addurl } from "../index.js";
import socket from "../../socket";

// const userLinks = await axios.get("/api/v1/links/saved-links");

export default function LinkList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [showTags, setShowTags] = useState(false);
  const [userLinks, setLinks] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const linksPerPage = 7; // Adjust as needed

  //slice visible links
  const startIdx = (currentPage - 1) * linksPerPage;
  const endIdx = startIdx + linksPerPage;
  const paginatedLinks = userLinks.slice(startIdx, endIdx);

  //Total pages
  const totalPages = Math.ceil(userLinks.length / linksPerPage);

  // Fetch links from the server
  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const res = await axios.get("/api/v1/links/saved-links");
        // Ensure we're setting an array
        const linksData = Array.isArray(res.data.data) ? res.data.data : [];
        setLinks(linksData);
        // Reset to first page when links change
        setCurrentPage(1);
      } catch (err) {
        console.error("Error fetching links:", err);
        setLinks([]); // Set empty array on error
      }
    };

    // Initial fetch
    fetchLinks();

    // Socket.IO listener for real-time updates
    socket.on("links-changed", fetchLinks);

    // Cleanup on unmount
    return () => {
      socket.off("links-changed", fetchLinks);
    };
  }, []);

  const handleCopy = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-neutral-900 to-black text-white px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold tracking-wide">Your Saved Links</h2>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Add URL Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-full text-sm font-semibold transition flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Add URL
          </button>

          {/* Toggle Tags Button */}
          <button
            className="px-4 py-2 bg-gray-700 hover:bg-gray-800 rounded-full text-xs font-semibold transition"
            onClick={() => setShowTags((prev) => !prev)}
          >
            {showTags ? "Hide Tags" : "Show Tags"}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {userLinks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No links saved yet.</p>
            <p className="text-gray-500 text-sm mt-2">
              Start by adding your first link!
            </p>
          </div>
        ) : (
          paginatedLinks.map((link) => (
            <div
              key={link._id || link.id}
              className="bg-neutral-900 border border-neutral-700 rounded-xl p-5 relative group hover:border-blue-500 transition"
            >
              {/* Title and Actions */}
              <div className="flex items-start justify-between">
                <button
                  className="text-lg font-semibold text-white hover:text-blue-400 transition text-left"
                  onClick={() =>
                    handleCopy(link.decryptedUrl, link._id || link.id)
                  }
                >
                  {link.title}
                </button>

                {/* Action Buttons */}
                <div className="flex gap-3 ml-2 text-sm">
                  <button
                    className="w-9 h-9 flex items-center justify-center rounded-full border-2 border-blue-500 text-blue-500 hover:bg-blue-600 hover:text-white transition"
                    title="Edit"
                  >
                    ✏️
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

              {/* URL */}
              <p className="mt-2 text-sm text-gray-400 bg-neutral-700 px-3 py-1 rounded border border-neutral-600 inline-block">
                <a href={link.decryptedUrl} className="break-all">
                  {link.decryptedUrl}
                </a>
              </p>

              {/* Copy Confirmation */}
              {copiedId === (link._id || link.id) && (
                <span className="ml-2 bg-amber-500 text-black shadow text-xs px-2 py-1 rounded">
                  Link copied!
                </span>
              )}

              {/* Tags - Debug and display */}
              {showTags && (
                <div className="mt-4">
                  {/* Debug info
                  <div className="text-xs text-gray-500 mb-2">
                    Tags data: {JSON.stringify(link.tags)} | Type:{" "}
                    {typeof link.tags}
                  </div> */}

                  {/* Display tags if they exist */}
                  {link.tags && (
                    <div className="flex flex-wrap gap-2 text-sm">
                      {/* Handle different tag formats */}
                      {typeof link.tags === "string" ? (
                        // String tags - split by comma or space
                        link.tags
                          .split(/[,\s]+/)
                          .filter((tag) => tag.trim())
                          .map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-gray-700 rounded-full border border-gray-600 text-white"
                            >
                              #{tag.trim()}
                            </span>
                          ))
                      ) : Array.isArray(link.tags) ? (
                        // Array tags
                        link.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-gray-700 rounded-full border border-gray-600 text-white"
                          >
                            #{tag}
                          </span>
                        ))
                      ) : (
                        // Single tag or other format
                        <span className="px-3 py-1 bg-gray-700 rounded-full border border-gray-600 text-white">
                          #{String(link.tags)}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Show message if no tags */}
                  {!link.tags && (
                    <div className="text-gray-500 text-sm italic">
                      No tags available
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              {link.notes && (
                <p className="mt-3 text-sm italic text-gray-400">
                  {link.notes}
                </p>
              )}
            </div>
          ))
        )}
      </div>
      {totalPages > 1 && (
        <div className="mt-10 flex justify-center items-center gap-2 text-sm">
          {/* Previous Button */}
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded border ${
              currentPage === 1
                ? "bg-neutral-800 text-gray-500 border-gray-600 cursor-not-allowed"
                : "bg-neutral-800 text-gray-300 hover:bg-neutral-700 border-gray-600"
            } transition`}
          >
            ← Prev
          </button>

          {/* Page Numbers */}
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded border ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white border-blue-500"
                  : "bg-neutral-800 text-gray-300 hover:bg-neutral-700 border-gray-600"
              } transition`}
            >
              {i + 1}
            </button>
          ))}

          {/* Next Button */}
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded border ${
              currentPage === totalPages
                ? "bg-neutral-800 text-gray-500 border-gray-600 cursor-not-allowed"
                : "bg-neutral-800 text-gray-300 hover:bg-neutral-700 border-gray-600"
            } transition`}
          >
            Next →
          </button>
        </div>
      )}

      {/* Modal for Add URL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-neutral-800 hover:bg-neutral-700 text-gray-400 hover:text-white transition z-10"
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

            {/* Add URL component */}
            <div className="p-0">
              <Addurl onSuccess={() => setIsModalOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
