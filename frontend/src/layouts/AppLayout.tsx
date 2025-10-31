import React from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Outlet } from "react-router-dom";

const AppLayout: React.FC = () => {
  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <Topbar />
        <div className="content">
          <Outlet /> {/* renders whatever child route matches */}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
