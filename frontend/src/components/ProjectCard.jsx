import React from 'react';
import { ArrowRight, Folder } from 'lucide-react';

export default function ProjectCard({ project, onClick, currentUser }) {
  const formatShortDate = (dateString) => {
    if (!dateString) return 'Today';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getInitials = (name) => {
    if (!name) return 'HB';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'HB';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const isCompleted = project.status === 'completed';
  const ownerName = project.user?.name || currentUser?.name || 'Habeba Bakr';

  return (
    <div className="project-card" onClick={onClick}>
      <div>
        <div className="project-card-header">
          <div className="project-card-title-group">
            <div className="project-card-icon-box">
              <Folder size={18} />
            </div>
            <h4 className="project-card-name">{project.name}</h4>
          </div>
          <ArrowRight size={16} className="project-card-arrow" />
        </div>
        <p className="project-card-desc">
          {project.description || 'No description provided.'}
        </p>
      </div>

      <div className="project-card-footer">
        <span
          className={`project-status-badge ${
            isCompleted ? 'status-completed' : 'status-active'
          }`}
        >
          {isCompleted ? 'Completed' : 'Active'}
        </span>
        <div className="project-card-meta-right">
          <span className="project-owner-avatar" title={ownerName}>
            {getInitials(ownerName)}
          </span>
          <span className="project-card-date">
            {formatShortDate(project.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
}
