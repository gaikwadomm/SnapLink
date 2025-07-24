export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      {/* Always show Filter bar at the top */}
      <Filterurl />

      {/* Nested routes will render here */}
      <div className="p-4">
        <Outlet />
      </div>
    </div>
  );
}
