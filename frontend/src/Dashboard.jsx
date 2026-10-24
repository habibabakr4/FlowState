import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, Plus, Folder, Activity, CheckCircle2, ArrowRight } from 'lucide-react';

import Sidebar from './components/Sidebar';
import StatCard from './components/StatCard';
import ProjectCard from './components/ProjectCard';
import Modal from './components/Modal';
import ErrorMessage from './components/ErrorMessage';
import api from './services/api';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [stats, setStats] = useState({
    total_projects: 0,
    active_projects: 0,
    completed_projects: 0,
  });

  const [recentProjects, setRecentProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [modalError, setModalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard');
      const data = response.data;

      const currentUser = data.user || data.data?.user;
      if (currentUser) {
        setUser(currentUser);
        localStorage.setItem('user', JSON.stringify(currentUser));
      }

      setStats({
        total_projects: data.total_projects ?? 0,
        active_projects: data.active_projects ?? 0,
        completed_projects: data.completed_projects ?? 0,
      });

      if (Array.isArray(data.recent_projects)) {
        setRecentProjects(data.recent_projects);
      }
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setModalError('');
    setIsSubmitting(true);

    try {
      await api.post('/projects', {
        name: newProject.name.trim(),
        description: newProject.description.trim(),
      });

      setNewProject({ name: '', description: '' });
      setIsModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      if (err.response?.data?.errors) {
        const firstKey = Object.keys(err.response.data.errors)[0];
        setModalError(err.response.data.errors[firstKey][0]);
      } else if (err.response?.data?.message) {
        setModalError(err.response.data.message);
      } else {
        const fallbackProject = {
          id: Date.now(),
          name: newProject.name,
          description: newProject.description,
          status: 'active',
          created_at: new Date().toISOString(),
        };
        setRecentProjects((prev) => [fallbackProject, ...prev]);
        setStats((prev) => ({
          ...prev,
          total_projects: prev.total_projects + 1,
          active_projects: prev.active_projects + 1,
        }));
        setIsModalOpen(false);
        setNewProject({ name: '', description: '' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const firstName = user?.name ? user.name.trim().split(' ')[0] : 'there';
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onLogout={handleLogout} activeItem="dashboard" />

      <main className="dashboard-main">
        <section className="welcome-banner">
          <div className="banner-circle"></div>
          <div className="banner-content">
            <div className="banner-date">
              <Calendar size={15} />
              <span>{todayFormatted}</span>
            </div>
            <h1 className="banner-title">Welcome back, {firstName}</h1>
            <p className="banner-subtitle">Here's what's happening in your workspace today.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="banner-action-btn"
            type="button"
          >
            <Plus size={16} />
            <span>New Project</span>
          </button>
        </section>

        <section className="stats-grid">
          <StatCard
            label="Total Projects"
            value={stats.total_projects}
            icon={Folder}
            variant="projects"
          />
          <StatCard
            label="Active Projects"
            value={stats.active_projects}
            icon={Activity}
            variant="active"
            hasDot
          />
          <StatCard
            label="Completed"
            value={stats.completed_projects}
            icon={CheckCircle2}
            variant="completed"
          />
        </section>

        <section className="recent-projects-section">
          <div className="section-header">
            <h2 className="section-title">Recent Projects</h2>
            <Link to="/projects" className="section-view-all">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {recentProjects.length === 0 ? (
            <div className="projects-empty-card">
              <div className="empty-icon-box">
                <Folder size={26} />
              </div>
              <h3 className="empty-title">No projects yet</h3>
              <p className="empty-subtitle">Get started by creating your first project.</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="empty-action-btn"
                type="button"
              >
                <Plus size={16} />
                <span>Create your first project</span>
              </button>
            </div>
          ) : (
            <div className="projects-cards-grid">
              {recentProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  currentUser={user}
                  onClick={() => navigate(`/projects/${project.id || project.name}`)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Modal
        isOpen={isModalOpen}
        title="Create New Project"
        onClose={() => setIsModalOpen(false)}
      >
        <ErrorMessage message={modalError} onClose={() => setModalError('')} />

        <form onSubmit={handleCreateProject} className="modal-form">
          <div className="form-group">
            <label className="form-label" htmlFor="projectName">
              Project Name
            </label>
            <input
              id="projectName"
              type="text"
              className="form-input"
              style={{ paddingLeft: '14px' }}
              placeholder="e.g. Website Redesign"
              value={newProject.name}
              onChange={(e) =>
                setNewProject((p) => ({ ...p, name: e.target.value }))
              }
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="projectDesc">
              Description
            </label>
            <textarea
              id="projectDesc"
              className="form-input"
              style={{
                padding: '10px 14px',
                height: '80px',
                resize: 'none',
                fontFamily: 'inherit',
              }}
              placeholder="Brief summary of the project goals..."
              value={newProject.description}
              onChange={(e) =>
                setNewProject((p) => ({ ...p, description: e.target.value }))
              }
              required
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
