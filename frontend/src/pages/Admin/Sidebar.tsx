import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { LayoutGrid, NotepadText, ClipboardPlus } from "lucide-react";
import { config } from "../../utils/config";
import Logo from "../../assets/images/logo.png";
import Profile from "../../assets/icons/profile_avatar.svg";
import UserMenu from "../../components/UserMenu";
import { useAuth } from "../../auth/AuthContext";

type NavItem = { to: string; label: string; icon: React.ReactNode };

const NAV_ITEMS: NavItem[] = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    icon: <LayoutGrid size={25} />,
  },
  {
    to: "/admin/suppliments",
    label: "Suppliments",
    icon: <NotepadText size={25} />,
  },
];

interface SidebarProps {
  currentUserName?: string;
}
const appName = config.APP_NAME;
const logoUrl = Logo;

const Sidebar: React.FC<SidebarProps> = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src={logoUrl} alt={`${appName} logo`} className="sidebar-logo" />
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const active =
            location.pathname === item.to ||
            (item.to !== "/admin/dashboard" &&
              location.pathname.startsWith(item.to));
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`sidebar-link ${active ? "active" : ""}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <UserMenu
          name={user?.name || "User"}
          avatarUrl={user?.profile_pic || Profile}
          onLogout={handleLogout}
        />
      </div>
    </aside>
  );
};

export default Sidebar;
