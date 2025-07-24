import { StrictMode } from "react";
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

function DashboardLayout() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      {/* ✅ This is shown on all /dashboard/* pages */}
      <Filterurl />

      {/* ✅ This is the body that changes: LinkList, Addurl, etc */}
      <div className="p-4">
        <Outlet />
      </div>
    </div>
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
