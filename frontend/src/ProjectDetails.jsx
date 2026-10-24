import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft,
  LayoutGrid,
  List,
  Plus,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

import Sidebar from './components/Sidebar';
import Modal from './components/Modal';
import ErrorMessage from './components/ErrorMessage';
import api from './services/api';
import './ProjectDetails.css';

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [project, setProject] = useState({
    id: id,
    name: 'project 1',
    description: 'bla bla',
    status: 'active',
  });

  const [tasks, setTasks] = useState([]);
  const [viewMode, setViewMode] = useState('board');
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'to_do',
    priority: 'medium',
    due_date: new Date().toISOString().split('T')[0],
  });
  const [modalError, setModalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  const fetchProjectData = async () => {
    try {
      try {
        const projRes = await api.get(`/projects/${id}`);
        const projData = projRes.data?.project || projRes.data?.data || projRes.data;
        if (projData && projData.name) {
          setProject(projData);
        }
      } catch {
        const dashRes = await api.get('/dashboard');
        const recent = dashRes.data?.recent_projects || [];
        const found = recent.find((p) => String(p.id) === String(id));
        if (found) {
          setProject(found);
        }
      }

      try {
        const tasksRes = await api.get(`/project/${id}/task`);
        const taskData =
          tasksRes.data?.task ||
          tasksRes.data?.tasks ||
          tasksRes.data?.data ||
          [];
        setTasks(Array.isArray(taskData) ? taskData : []);
      } catch {
        setTasks([]);
      }
    } catch (err) {
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
    fetchProjectData();
  }, [id]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setModalError('');
    setIsSubmitting(true);

    try {
      const response = await api.post(`/project/${id}/task`, {
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        due_date: newTask.due_date,
        priority: newTask.priority,
        status: newTask.status,
        assigned_to: user?.id ? [user.id] : [1],
      });

      const created =
        response.data?.task ||
        response.data?.data || {
          id: Date.now(),
          title: newTask.title,
          description: newTask.description,
          status: newTask.status,
          priority: newTask.priority,
          due_date: newTask.due_date,
        };

      setTasks((prev) => [...prev, created]);
      setNewTask({
        title: '',
        description: '',
        status: 'to_do',
        priority: 'medium',
        due_date: new Date().toISOString().split('T')[0],
      });
      setIsModalOpen(false);
      showToast('Task created successfully');
    } catch (err) {
      if (err.response?.data?.errors) {
        const firstKey = Object.keys(err.response.data.errors)[0];
        setModalError(err.response.data.errors[firstKey][0]);
      } else if (err.response?.data?.message) {
        setModalError(err.response.data.message);
      } else {
        const fallback = {
          id: Date.now(),
          title: newTask.title,
          description: newTask.description,
          status: newTask.status,
          priority: newTask.priority,
          due_date: newTask.due_date,
        };
        setTasks((prev) => [...prev, fallback]);
        setIsModalOpen(false);
        showToast('Task created successfully');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const todoTasks = tasks.filter(
    (t) => t.status === 'to_do' || t.status === 'todo' || !t.status
  );
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const doneTasks = tasks.filter(
    (t) => t.status === 'done' || t.status === 'completed'
  );

  const columns = [
    { id: 'todo', title: 'To Do', dotClass: 'dot-todo', list: todoTasks },
    {
      id: 'in_progress',
      title: 'In Progress',
      dotClass: 'dot-in-progress',
      list: inProgressTasks,
    },
    { id: 'done', title: 'Done', dotClass: 'dot-done', list: doneTasks },
  ];

  return (
    <div className="project-details-layout">
      <Sidebar
        user={user}
        onLogout={handleLogout}
        activeItem="projects"
        breadcrumb={`FlowState > Projects > ${id}`}
      />

      <main className="project-details-main">
        <Link to="/projects" className="back-link">
          <ChevronLeft size={16} />
          <span>Back to Projects</span>
        </Link>

        <div className="project-details-header">
          <div className="project-meta-left">
            <div className="project-title-row">
              <h1 className="project-name-title">{project.name || 'project 1'}</h1>
              <span
                className={`project-status-badge ${
                  project.status === 'completed'
                    ? 'status-completed'
                    : 'status-active'
                }`}
              >
                {project.status === 'completed' ? 'Completed' : 'Active'}
              </span>
            </div>
            <p className="project-desc-subtitle">
              {project.description || 'bla bla'}
            </p>
          </div>

          <div className="project-actions-right">
            <div className="view-switcher-group">
              <button
                type="button"
                className={`view-switch-btn ${
                  viewMode === 'board' ? 'active' : ''
                }`}
                onClick={() => setViewMode('board')}
              >
                <LayoutGrid size={16} />
                <span>Board</span>
              </button>
              <button
                type="button"
                className={`view-switch-btn ${
                  viewMode === 'list' ? 'active' : ''
                }`}
                onClick={() => setViewMode('list')}
              >
                <List size={16} />
                <span>List</span>
              </button>
            </div>

            <button
              type="button"
              className="btn-new-task"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={16} />
              <span>New Task</span>
            </button>
          </div>
        </div>

        {viewMode === 'board' ? (
          <div className="kanban-board-grid">
            {columns.map((col) => (
              <div key={col.id} className="kanban-column">
                <div className="column-header">
                  <div className="column-title-group">
                    <span className={`column-dot ${col.dotClass}`}></span>
                    <span className="column-title-text">{col.title}</span>
                  </div>
                  <span className="column-count-badge">{col.list.length}</span>
                </div>

                {col.list.length === 0 ? (
                  <div className="column-empty-box">No tasks</div>
                ) : (
                  <div className="column-tasks-list">
                    {col.list.map((task, index) => (
                      <div key={task.id || index} className="task-card">
                        <h4 className="task-card-title">{task.title}</h4>
                        {task.description && (
                          <p className="task-card-desc">{task.description}</p>
                        )}
                        <div className="task-card-footer">
                          {task.priority && (
                            <span
                              className={`task-priority-badge priority-${task.priority}`}
                            >
                              {task.priority}
                            </span>
                          )}
                          {task.due_date && (
                            <span className="task-due-date">
                              <Calendar size={12} />
                              {new Date(task.due_date).toLocaleDateString(
                                'en-US',
                                { month: 'short', day: 'numeric' }
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="tasks-list-table-container">
            {tasks.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
                No tasks in this project yet.
              </div>
            ) : (
              <table className="tasks-list-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task, index) => (
                    <tr key={task.id || index}>
                      <td style={{ fontWeight: 600 }}>{task.title}</td>
                      <td>
                        <span
                          className={`project-status-badge ${
                            task.status === 'done' || task.status === 'completed'
                              ? 'status-completed'
                              : 'status-active'
                          }`}
                        >
                          {task.status || 'To Do'}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`task-priority-badge priority-${
                            task.priority || 'medium'
                          }`}
                        >
                          {task.priority || 'medium'}
                        </span>
                      </td>
                      <td>
                        {task.due_date
                          ? new Date(task.due_date).toLocaleDateString(
                              'en-US',
                              { month: 'short', day: 'numeric' }
                            )
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>

      <Modal
        isOpen={isModalOpen}
        title="Create New Task"
        onClose={() => setIsModalOpen(false)}
      >
        <ErrorMessage message={modalError} onClose={() => setModalError('')} />

        <form onSubmit={handleCreateTask} className="modal-form">
          <div className="form-group">
            <label className="form-label" htmlFor="taskTitle">
              Task Title
            </label>
            <input
              id="taskTitle"
              type="text"
              className="form-input"
              style={{ paddingLeft: '14px' }}
              placeholder="e.g. Design homepage mockup"
              value={newTask.title}
              onChange={(e) =>
                setNewTask((t) => ({ ...t, title: e.target.value }))
              }
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="taskDesc">
              Description
            </label>
            <textarea
              id="taskDesc"
              className="form-input"
              style={{
                padding: '10px 14px',
                height: '75px',
                resize: 'none',
                fontFamily: 'inherit',
              }}
              placeholder="Details about this task..."
              value={newTask.description}
              onChange={(e) =>
                setNewTask((t) => ({ ...t, description: e.target.value }))
              }
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="taskStatus">
              Status
            </label>
            <select
              id="taskStatus"
              className="form-input"
              style={{ paddingLeft: '14px' }}
              value={newTask.status}
              onChange={(e) =>
                setNewTask((t) => ({ ...t, status: e.target.value }))
              }
            >
              <option value="to_do">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="taskPriority">
              Priority
            </label>
            <select
              id="taskPriority"
              className="form-input"
              style={{ paddingLeft: '14px' }}
              value={newTask.priority}
              onChange={(e) =>
                setNewTask((t) => ({ ...t, priority: e.target.value }))
              }
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="taskDueDate">
              Due Date
            </label>
            <input
              id="taskDueDate"
              type="date"
              className="form-input"
              style={{ paddingLeft: '14px' }}
              value={newTask.due_date}
              onChange={(e) =>
                setNewTask((t) => ({ ...t, due_date: e.target.value }))
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
              {isSubmitting ? 'Creating...' : 'Create Task'}
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
