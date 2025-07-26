import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Addcollection from "../Addcollection/Addcollection.jsx";
import socket from "../../socket";

export default function CollectionList({ onCollectionSelect }) {
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch collections from the server
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get("/api/v1/links/get-collections");
        const collectionsData = Array.isArray(res.data.data)
          ? res.data.data
          : [];
        setCollections(collectionsData);
      } catch (err) {
        console.error("Error fetching collections:", err);
        if (err.response && err.response.status === 404) {
          // No collections found is okay
          setCollections([]);
        } else {
          toast.error("Failed to load collections");
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchCollections();

    // Socket.IO listener for real-time updates
    socket.on("link-collections-changed", fetchCollections);

    // Cleanup on unmount
    return () => {
      socket.off("link-collections-changed", fetchCollections);
    };
  }, []);

  const handleCollectionSuccess = () => {
    setIsModalOpen(false);
    // Collection will be refetched via socket event
  };

  const handleCollectionSelect = (collection) => {
    setSelectedCollection(collection);
    setIsMobileMenuOpen(false); // Close mobile menu when collection is selected
    if (onCollectionSelect) {
      onCollectionSelect(collection);
    }
  };

  const handleViewAll = () => {
    setSelectedCollection(null);
    setIsMobileMenuOpen(false); // Close mobile menu when "All Links" is selected
    if (onCollectionSelect) {
      onCollectionSelect(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6">
        <div className="flex items-center justify-center py-8">
          <svg
            className="animate-spin w-8 h-8 text-purple-500"
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
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Toggle Button - Only visible on mobile */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="w-full flex items-center justify-between p-3 bg-neutral-900 border border-neutral-700 rounded-xl text-white hover:bg-neutral-800 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium">
                {selectedCollection ? selectedCollection.name : "All Links"}
              </p>
              <p className="text-xs text-gray-400">Tap to change collection</p>
            </div>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5 text-gray-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>
      </div>

      {/* Desktop Sidebar - Always visible on desktop, hidden on mobile */}
      <div className="hidden lg:block bg-neutral-900 border border-neutral-700 rounded-xl p-6 mb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Collections</h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition flex items-center gap-2"
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
            New
          </button>
        </div>

        {/* Collections Grid */}
        <div className="space-y-2">
          {/* View All Option */}
          <button
            onClick={handleViewAll}
            className={`w-full text-left p-3 rounded-lg transition ${
              selectedCollection === null
                ? "bg-purple-600 text-white"
                : "bg-neutral-800 hover:bg-neutral-700 text-gray-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium">All Links</p>
                <p className="text-sm opacity-75">View all your saved links</p>
              </div>
            </div>
          </button>

          {/* Individual Collections */}
          {collections.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <p className="text-sm">No collections yet.</p>
              <p className="text-xs mt-1">
                Create your first collection to organize your links!
              </p>
            </div>
          ) : (
            collections.map((collection) => (
              <button
                key={collection._id}
                onClick={() => handleCollectionSelect(collection)}
                className={`w-full text-left p-3 rounded-lg transition ${
                  selectedCollection?._id === collection._id
                    ? "bg-purple-600 text-white"
                    : "bg-neutral-800 hover:bg-neutral-700 text-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5 text-white"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{collection.name}</p>
                    {collection.description && (
                      <p className="text-sm opacity-75 truncate">
                        {collection.description}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Mobile Collections Slide-out Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Slide-out Panel */}
          <div className="fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-neutral-900 border-r border-neutral-700 shadow-2xl transform transition-transform duration-300 ease-out overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-700">
              <h3 className="text-lg font-semibold text-white">Collections</h3>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-800 hover:bg-neutral-700 text-gray-400 hover:text-white transition"
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
            </div>

            {/* Mobile Collections Content */}
            <div className="p-6">
              {/* New Collection Button */}
              <button
                onClick={() => {
                  setIsModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full mb-4 px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition flex items-center justify-center gap-2"
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
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                New Collection
              </button>

              {/* Collections List */}
              <div className="space-y-2">
                {/* View All Option */}
                <button
                  onClick={handleViewAll}
                  className={`w-full text-left p-3 rounded-lg transition ${
                    selectedCollection === null
                      ? "bg-purple-600 text-white"
                      : "bg-neutral-800 hover:bg-neutral-700 text-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5 text-white"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">All Links</p>
                      <p className="text-sm opacity-75">
                        View all your saved links
                      </p>
                    </div>
                  </div>
                </button>

                {/* Individual Collections */}
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <svg
                      className="animate-spin w-6 h-6 text-purple-500"
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
                  </div>
                ) : collections.length === 0 ? (
                  <div className="text-center py-6 text-gray-400">
                    <p className="text-sm">No collections yet.</p>
                    <p className="text-xs mt-1">
                      Create your first collection to organize your links!
                    </p>
                  </div>
                ) : (
                  collections.map((collection) => (
                    <button
                      key={collection._id}
                      onClick={() => handleCollectionSelect(collection)}
                      className={`w-full text-left p-3 rounded-lg transition ${
                        selectedCollection?._id === collection._id
                          ? "bg-purple-600 text-white"
                          : "bg-neutral-800 hover:bg-neutral-700 text-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-5 h-5 text-white"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0121.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {collection.name}
                          </p>
                          {collection.description && (
                            <p className="text-sm opacity-75 truncate">
                              {collection.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Collection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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

            {/* Add Collection component */}
            <div className="p-0">
              <Addcollection
                onSuccess={handleCollectionSuccess}
                onCancel={() => setIsModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
