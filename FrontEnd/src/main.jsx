import { StrictMode, useState, createContext, useContext } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
  Signup,
  Addurl,
  LinkList,
  Filterurl,
  Login,
} from "./components/index.js";

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Outlet,
  Navigate,
} from "react-router";

// Create context for sharing filter state
const FilterContext = createContext();

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilter must be used within FilterProvider");
  }
  return context;
};

function DashboardLayout() {
  const [currentSort, setCurrentSort] = useState("none");
  const [searchTerm, setSearchTerm] = useState("");

  const handleSortChange = (sortType) => {
    setCurrentSort(sortType);
  };

  const handleSearchChange = (term) => {
    setSearchTerm(term);
  };

  return (
    <FilterContext.Provider
      value={{ currentSort, handleSortChange, searchTerm, handleSearchChange }}
    >
      <div className="min-h-screen bg-neutral-900 text-white">
        {/* ✅ This is shown on all /dashboard/* pages */}
        <Filterurl
          onSortChange={handleSortChange}
          currentSort={currentSort}
          onSearchChange={handleSearchChange}
          searchTerm={searchTerm}
        />

        {/* ✅ This is the body that changes: LinkList, Addurl, etc */}
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </FilterContext.Provider>
  );
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Redirect root to login */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Legacy route support (optional) */}
      <Route path="/UserLinks" element={<Navigate to="/dashboard" />} />

      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<LinkList />} />
        <Route path="addurl" element={<Addurl />} />
      </Route>
    </>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
