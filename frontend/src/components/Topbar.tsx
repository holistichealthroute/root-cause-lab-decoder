import React from "react";
import { config } from "../utils/config";

const Topbar: React.FC = () => {
  const appName = config.APP_NAME || "Root Cause Lab Detector";
  const words = appName.split(" ");
  const firstTwo = words.slice(0, 2).join(" ");
  const rest = words.slice(2).join(" ");

  return (
    <header className="topbar">
      <h1 className="topbar-title">
        <span className="brand">{firstTwo}</span>{" "}
        <span style={{ color: "#6c757d" }}>{rest}</span>
      </h1>
      <div className="topbar-actions">{/* icons/actions later */}</div>
    </header>
  );
};

export default Topbar;
