import { useState, useRef, useEffect } from "react";
import Logout from "../Logout/Logout.jsx";

export default function Filterurl({
  onSortChange,
  currentSort = "none",
  onSearchChange,
  searchTerm = "",
}) {
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortOpen(false);
      }
    }
    if (sortOpen) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [sortOpen]);

  const handleSortSelect = (sortType) => {
    onSortChange?.(sortType);
    setSortOpen(false);
  };

  const handleSearchInput = (e) => {
    onSearchChange?.(e.target.value);
  };

  const getSortLabel = () => {
    switch (currentSort) {
      case "a-z":
        return "Sort A - Z";
      case "z-a":
        return "Sort Z - A";
      case "date":
        return "Sort by Date";
      default:
        return "Sort";
    }
  };

  return (
    <div className="w-full bg-gray-900/90 border-b border-gray-800 shadow-sm">
      {/* Header with App Name and Logout */}
      <div className="w-full px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-amber-400">Snaplink</h1>
          <span className="text-sm text-gray-400">Dashboard</span>
        </div>
        <Logout />
      </div>

      {/* Filter and Search Section */}
      <div className="w-full max-w-3xl mx-auto mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-4">
        {/* Search Input */}
        <div className="flex-1 flex items-center relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search links by title, URL, or notes..."
            value={searchTerm}
            onChange={handleSearchInput}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition text-sm shadow-inner"
          />
        </div>

        {/* Sort & Add Link Group for better alignment on small screens */}
        <div className="flex flex-row gap-2 sm:gap-4 md:gap-2 md:items-center md:justify-end w-full md:w-auto mt-2 md:mt-0">
          {/* Sort Dropdown */}
          <div
            className="relative flex-1 min-w-0 md:flex-none md:w-auto"
            ref={sortRef}
          >
            <button
              onClick={() => setSortOpen((v) => !v)}
              className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700 transition text-sm font-medium shadow-sm w-full md:w-auto"
            >
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
              {getSortLabel()}
            </button>

            {sortOpen && (
              <div
                className="absolute left-0 md:right-0 mt-2 w-56 max-w-xs bg-gray-900 border border-gray-800 rounded-md shadow-lg z-20 overflow-hidden animate-fade-in"
                style={{
                  minWidth: "10rem",
                  right: "auto",
                  left: 0,
                  maxWidth: "calc(100vw - 1rem)",
                }}
              >
                <button
                  onClick={() => handleSortSelect("a-z")}
                  className={`block w-full px-4 py-2 text-left text-gray-200 hover:bg-gray-800 transition text-sm ${
                    currentSort === "a-z" ? "bg-gray-800 text-blue-400" : ""
                  }`}
                >
                  Sort A - Z
                </button>
                <button
                  onClick={() => handleSortSelect("z-a")}
                  className={`block w-full px-4 py-2 text-left text-gray-200 hover:bg-gray-800 transition text-sm ${
                    currentSort === "z-a" ? "bg-gray-800 text-blue-400" : ""
                  }`}
                >
                  Sort Z - A
                </button>
                <button
                  onClick={() => handleSortSelect("date")}
                  className={`block w-full px-4 py-2 text-left text-gray-200 hover:bg-gray-800 transition text-sm ${
                    currentSort === "date" ? "bg-gray-800 text-blue-400" : ""
                  }`}
                >
                  Sort by Date Created
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
