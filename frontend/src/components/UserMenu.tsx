import React, { useState, useRef, useEffect } from "react";
import defaultAvatar from "../assets/images/logo.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

interface UserMenuProps {
  name: string;
  avatarUrl?: string;
  onLogout?: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ name, avatarUrl, onLogout }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="user-menu" ref={menuRef}>
      <div className="user-chip">
        <img
          src={avatarUrl || defaultAvatar}
          alt={name}
          className="user-avatar"
        />
        <span className="user-name">{name}</span>

        {/* Arrow button (only clickable part) */}
        <button
          className="arrow-btn"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
        >
          <span className={`arrow ${open ? "rotate" : ""}`} />
        </button>
      </div>

      {open && (
        <div className="dropdown above">
          <button
            className="dropdown-item"
            onClick={() =>
              user?.is_admin === 1
                ? navigate("/admin/profile")
                : navigate("/profile")
            }
          >
            My Profile
          </button>
          <button className="dropdown-item" onClick={onLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
