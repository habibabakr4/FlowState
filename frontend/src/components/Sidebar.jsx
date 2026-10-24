import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, LayoutDashboard, FolderKanban, LogOut } from 'lucide-react';

export default function Sidebar({
  user,
  activeItem = 'dashboard',
  onLogout,
  breadcrumb = 'FlowState > Dashboard',
}) {
  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    const parts = fullName.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <div className="brand-icon-box">
            <Zap size={20} fill="#ffffff" />
          </div>
          <div className="brand-info">
            <span className="brand-title">FlowState</span>
            <span className="brand-subtitle">MY WORKSPACE</span>
          </div>
        </div>

        <nav className="nav-section">
          <div className="nav-section-title">MENU</div>
          <Link
            to="/dashboard"
            className={`nav-item ${activeItem === 'dashboard' ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/projects"
            className={`nav-item ${activeItem === 'projects' ? 'active' : ''}`}
          >
            <FolderKanban size={18} />
            <span>Projects</span>
          </Link>
        </nav>
      </div>

      <div className="sidebar-bottom">
        <div className="user-profile-card">
          <div className="user-info-row">
            <div className="user-avatar">{getInitials(user?.name)}</div>
            <div className="user-details">
              <span className="user-name" title={user?.name}>
                {user?.name || 'User'}
              </span>
              <span className="user-email" title={user?.email}>
                {user?.email}
              </span>
            </div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="logout-btn"
              title="Log Out"
              aria-label="Log Out"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
        <div className="sidebar-breadcrumbs">{breadcrumb}</div>
      </div>
    </aside>
  );
}
