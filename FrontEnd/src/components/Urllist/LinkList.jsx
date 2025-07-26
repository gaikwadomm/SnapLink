import { useState, useEffect } from "react";
import axios from "axios";
import { Addurl } from "../index.js";
import { useFilter } from "../../main.jsx";
import socket from "../../socket";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import Deleteurl from "../Deleteurl/Deleteurl.jsx";
import Editurl from "../Editurl/Editurl.jsx";
import CollectionList from "../CollectionList/CollectionList.jsx";

// const userLinks = await axios.get("/api/v1/links/saved-links");

export default function LinkList() {
  const { currentSort, searchTerm } = useFilter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [showTags, setShowTags] = useState(false);
  const [userLinks, setLinks] = useState([]);

  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    linkId: null,
    linkTitle: "",
    isDeleting: false,
  });

  // Edit modal state
  const [editModal, setEditModal] = useState({
    isOpen: false,
    linkData: null,
  });

  // Collection state
  const [selectedCollection, setSelectedCollection] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const linksPerPage = 7; // Adjust as needed

  // Filter links based on search term and selected collection
  const filteredLinks = userLinks.filter((link) => {
    // Collection filter
    const collectionMatch = selectedCollection
      ? link.collectionId === selectedCollection._id
      : true;

    // Search filter
    if (!searchTerm.trim()) return collectionMatch;

    const searchLower = searchTerm.toLowerCase();
    const titleMatch = link.title?.toLowerCase().includes(searchLower) || false;
    const urlMatch =
      link.decryptedUrl?.toLowerCase().includes(searchLower) || false;
    const tagsMatch =
      typeof link.tags === "string"
        ? link.tags.toLowerCase().includes(searchLower)
        : false;
    const notesMatch = link.notes?.toLowerCase().includes(searchLower) || false;

    return (
      collectionMatch && (titleMatch || urlMatch || tagsMatch || notesMatch)
    );
  });

  // Sort filtered links based on current sort option
  const sortedLinks = [...filteredLinks].sort((a, b) => {
    switch (currentSort) {
      case "a-z":
        return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
      case "z-a":
        return b.title.toLowerCase().localeCompare(a.title.toLowerCase());
      case "date":
        return new Date(b.createdAt) - new Date(a.createdAt);
      default:
        return 0; // no sorting
    }
  });

  //slice visible links
  const startIdx = (currentPage - 1) * linksPerPage;
  const endIdx = startIdx + linksPerPage;
  const paginatedLinks = sortedLinks.slice(startIdx, endIdx);

  //Total pages
  const totalPages = Math.ceil(sortedLinks.length / linksPerPage);

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
        //not authorized to access without login
        if (err.response && err.response.status === 401) {
          // Handle unauthorized access
          console.log("User not authorized");
          // Optionally, you can redirect to login or show a message
          const token = localStorage.getItem("token");
          toast.error(
            token
              ? `Invalid or expired token: ${token}`
              : "You must be logged in to view links."
          );
          setTimeout(() => {
            window.location.href = "/login"; // Redirect to login page
          }, 1000);
        }
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

  // Reset to first page when sorting changes
  useEffect(() => {
    setCurrentPage(1);
  }, [currentSort]);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleCopy = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handle delete button click - open confirmation modal
  const handleDeleteClick = (linkId, linkTitle) => {
    setDeleteModal({
      isOpen: true,
      linkId: linkId,
      linkTitle: linkTitle,
      isDeleting: false,
    });
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    setDeleteModal((prev) => ({ ...prev, isDeleting: true }));

    try {
      await axios.delete(`/api/v1/links/delete-link/${deleteModal.linkId}`);

      // Update local state immediately
      setLinks((prevLinks) =>
        prevLinks.filter((link) => (link._id || link.id) !== deleteModal.linkId)
      );

      toast.success("Link deleted successfully!");

      // Close modal
      setDeleteModal({
        isOpen: false,
        linkId: null,
        linkTitle: "",
        isDeleting: false,
      });
    } catch (error) {
      console.error("Error deleting link:", error);
      toast.error(error.response?.data?.message || "Failed to delete link");
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  // Handle delete modal close
  const handleDeleteClose = () => {
    if (!deleteModal.isDeleting) {
      setDeleteModal({
        isOpen: false,
        linkId: null,
        linkTitle: "",
        isDeleting: false,
      });
    }
  };

  // Handle edit button click - open edit modal
  const handleEditClick = (linkData) => {
    setEditModal({
      isOpen: true,
      linkData: linkData,
    });
  };

  // Handle edit success - close modal and refresh data
  const handleEditSuccess = () => {
    setEditModal({
      isOpen: false,
      linkData: null,
    });
    // Refetch links to show updated data
    const fetchLinks = async () => {
      try {
        const res = await axios.get("/api/v1/links/saved-links");
        const linksData = Array.isArray(res.data.data) ? res.data.data : [];
        setLinks(linksData);
      } catch (err) {
        console.error("Error fetching links:", err);
      }
    };
    fetchLinks();
  };

  // Handle edit cancel - close modal
  const handleEditCancel = () => {
    setEditModal({
      isOpen: false,
      linkData: null,
    });
  };

  // Handle collection selection
  const handleCollectionSelect = (collection) => {
    setSelectedCollection(collection);
    setCurrentPage(1); // Reset to first page when collection changes
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-neutral-900 to-black text-white px-4 py-8">
      <Toaster
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
      />

      {/* Collections Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <CollectionList onCollectionSelect={handleCollectionSelect} />
        </div>

        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-wide">
                {selectedCollection
                  ? selectedCollection.name
                  : "Your Saved Links"}
              </h2>
              {selectedCollection && (
                <p className="text-gray-400 text-sm mt-1">
                  {selectedCollection.description || "Collection links"}
                </p>
              )}
            </div>

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
            ) : filteredLinks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">
                  No links match your search.
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Try searching with different terms or clear your search.
                </p>
              </div>
            ) : sortedLinks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">
                  No links match the current filter.
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
                        onClick={() => handleEditClick(link)}
                      >
                        ✏️
                      </button>
                      <button
                        className="w-9 h-9 flex items-center justify-center rounded-full border-2 border-red-500 text-red-500 hover:bg-red-600 hover:text-white transition"
                        title="Delete"
                        onClick={() =>
                          handleDeleteClick(link._id || link.id, link.title)
                        }
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
            <div className="fixed inset-0 bg-opacity-5 backdrop-blur-md flex items-center justify-center z-50 p-4">
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
                  <Addurl
                    onSuccess={() => setIsModalOpen(false)}
                    selectedCollection={selectedCollection}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          <Deleteurl
            isOpen={deleteModal.isOpen}
            onClose={handleDeleteClose}
            onConfirm={handleDeleteConfirm}
            linkTitle={deleteModal.linkTitle}
            isDeleting={deleteModal.isDeleting}
          />

          {/* Edit Modal */}
          {editModal.isOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-neutral-900 border border-neutral-700 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
                {/* Close button */}
                <button
                  onClick={handleEditCancel}
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

                {/* Edit URL component */}
                <div className="p-0">
                  <Editurl
                    linkData={editModal.linkData}
                    onSuccess={handleEditSuccess}
                    onCancel={handleEditCancel}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
