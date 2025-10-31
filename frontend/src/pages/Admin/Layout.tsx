import React from "react";
import AdminSidebar from "./Sidebar";
import Topbar from "../../components/Topbar";
import { Outlet } from "react-router-dom";

const AdminLayout: React.FC = () => {
  return (
    <div className="layout">
      <AdminSidebar />
      <main className="main">
        <Topbar />
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
