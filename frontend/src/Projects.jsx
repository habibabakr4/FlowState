import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Folder, CheckCircle2 } from 'lucide-react';

import Sidebar from './components/Sidebar';
import ProjectCard from './components/ProjectCard';
import Modal from './components/Modal';
import ErrorMessage from './components/ErrorMessage';
import api from './services/api';
import './Projects.css';

export default function Projects() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [modalError, setModalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      const data = response.data;

      const projectList = Array.isArray(data.project)
        ? data.project
        : Array.isArray(data.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];

      setProjects(projectList);
    } catch (err) {
      if (err.response?.status === 404) {
        setProjects([]);
      } else if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        try {
          const dashRes = await api.get('/dashboard');
          if (Array.isArray(dashRes.data?.recent_projects)) {
            setProjects(dashRes.data.recent_projects);
          }
        } catch {
          setProjects([]);
        }
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
    fetchProjects();
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
      const response = await api.post('/projects', {
        name: newProject.name.trim(),
        description: newProject.description.trim(),
      });

      const created =
        response.data?.project ||
        response.data?.data || {
          id: Date.now(),
          name: newProject.name.trim(),
          description: newProject.description.trim(),
          status: 'active',
          created_at: new Date().toISOString(),
          user: user,
        };

      setProjects((prev) => [created, ...prev]);
      setNewProject({ name: '', description: '' });
      setIsModalOpen(false);
      showToast('Project created successfully');

      fetchProjects();
    } catch (err) {
      if (err.response?.data?.errors) {
        const firstKey = Object.keys(err.response.data.errors)[0];
        setModalError(err.response.data.errors[firstKey][0]);
      } else if (err.response?.data?.message) {
        setModalError(err.response.data.message);
      } else {
        const fallback = {
          id: Date.now(),
          name: newProject.name.trim(),
          description: newProject.description.trim(),
          status: 'active',
          created_at: new Date().toISOString(),
          user: user,
        };
        setProjects((prev) => [fallback, ...prev]);
        setNewProject({ name: '', description: '' });
        setIsModalOpen(false);
        showToast('Project created successfully');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === 'active') {
        return project.status !== 'completed';
      }
      if (statusFilter === 'completed') {
        return project.status === 'completed';
      }
      return true;
    });
  }, [projects, searchQuery, statusFilter]);

  const countText = `${filteredProjects.length} project${
    filteredProjects.length === 1 ? '' : 's'
  }`;

  return (
    <div className="projects-layout">
      <Sidebar
        user={user}
        onLogout={handleLogout}
        activeItem="projects"
        breadcrumb="FlowState > Projects"
      />

      <main className="projects-main">
        <div className="projects-header">
          <div className="projects-title-group">
            <h1 className="projects-title">Projects</h1>
            <p className="projects-count">{countText}</p>
          </div>
          <button
            type="button"
            className="btn-new-project"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} />
            <span>New Project</span>
          </button>
        </div>

        <div className="projects-toolbar">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-pills-group">
            <button
              type="button"
              className={`filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              All
            </button>
            <button
              type="button"
              className={`filter-pill ${
                statusFilter === 'active' ? 'active' : ''
              }`}
              onClick={() => setStatusFilter('active')}
            >
              Active
            </button>
            <button
              type="button"
              className={`filter-pill ${
                statusFilter === 'completed' ? 'active' : ''
              }`}
              onClick={() => setStatusFilter('completed')}
            >
              Completed
            </button>
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="projects-empty-container">
            <div className="projects-empty-icon">
              <Folder size={26} />
            </div>
            <h3 className="projects-empty-title">No projects yet</h3>
            <p className="projects-empty-desc">
              Create your first project to get started.
            </p>
            <button
              type="button"
              className="btn-create-project"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={16} />
              <span>Create Project</span>
            </button>
          </div>
        ) : (
          <div className="projects-grid">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id || project.name}
                project={project}
                currentUser={user}
                onClick={() => navigate(`/projects/${project.id || project.name}`)}
              />
            ))}
          </div>
        )}
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

      {toastMessage && (
        <div className="toast-notification">
          <CheckCircle2 size={18} className="toast-icon" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
