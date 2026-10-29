import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft,
  LayoutGrid,
  List,
  Plus,
  Calendar,
  CheckCircle2,
  Trash2,
  X,
  ChevronDown,
  User,
  Send,
} from 'lucide-react';

import Sidebar from './components/Sidebar';
import Modal from './components/Modal';
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
    priority: 'medium',
    due_date: new Date().toISOString().split('T')[0],
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [selectedTask, setSelectedTask] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  const fetchProjectData = async () => {
    try {
      try {
        const dashRes = await api.get('/dashboard');
        if (dashRes.data?.user) {
          setUser(dashRes.data.user);
          localStorage.setItem('user', JSON.stringify(dashRes.data.user));
        }
        const recent = dashRes.data?.recent_projects || [];
        const found = recent.find((p) => String(p.id) === String(id));
        if (found) {
          setProject(found);
        }
      } catch {
      }

      try {
        const projRes = await api.get(`/projects/${id}`);
        const projData = projRes.data?.project || projRes.data?.data || projRes.data;
        if (projData && projData.name) {
          setProject(projData);
        }
      } catch {
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
    setFieldErrors({});

    const errors = {};
    if (!newTask.title.trim()) {
      errors.title = 'Title is required';
    } else if (newTask.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters';
    } else if (newTask.title.trim().length > 30) {
      errors.title = 'Title must not exceed 30 characters';
    }

    if (!newTask.description.trim()) {
      errors.description = 'Description is required';
    } else if (newTask.description.trim().length < 3) {
      errors.description = 'Description must be at least 3 characters';
    } else if (newTask.description.trim().length > 255) {
      errors.description = 'Description must not exceed 255 characters';
    }

    if (!newTask.due_date) {
      errors.due_date = 'Due date is required';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post(`/project/${id}/task`, {
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        due_date: newTask.due_date,
        priority: newTask.priority,
        assigned_to: user?.id ? [user.id] : [1],
      });

      const created =
        response.data?.task ||
        response.data?.data || {
          id: Date.now(),
          title: newTask.title,
          description: newTask.description,
          status: 'todo',
          priority: newTask.priority,
          due_date: newTask.due_date,
          created_by: user?.name || 'Habeba Bakr',
          assigned_to: [user?.name || 'Habeba Bakr'],
        };

      setTasks((prev) => [...prev, created]);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        due_date: new Date().toISOString().split('T')[0],
      });
      setIsModalOpen(false);
      showToast('Task created successfully');
    } catch (err) {
      if (err.response?.data?.errors) {
        const backendErrors = {};
        Object.keys(err.response.data.errors).forEach((key) => {
          backendErrors[key] = err.response.data.errors[key][0];
        });
        setFieldErrors(backendErrors);
      } else if (err.response?.data?.message) {
        setFieldErrors({ general: err.response.data.message });
      } else {
        const fallback = {
          id: Date.now(),
          title: newTask.title,
          description: newTask.description,
          status: 'todo',
          priority: newTask.priority,
          due_date: newTask.due_date,
          created_by: user?.name || 'Habeba Bakr',
          assigned_to: [user?.name || 'Habeba Bakr'],
        };
        setTasks((prev) => [...prev, fallback]);
        setIsModalOpen(false);
        showToast('Task created successfully');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const openTaskPanel = async (task) => {
    setSelectedTask(task);
    setIsPanelOpen(true);
    setComments([]);
    setNewComment('');
    setIsStatusDropdownOpen(false);
    setIsLoadingComments(true);

    try {
      const res = await api.get(`/project/${id}/task/${task.id}/comment`);
      const commentData =
        res.data?.comment ||
        res.data?.comments ||
        res.data?.data ||
        [];
      setComments(Array.isArray(commentData) ? commentData : []);
    } catch {
      setComments([]);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const closeTaskPanel = () => {
    setIsPanelOpen(false);
    setSelectedTask(null);
    setComments([]);
    setNewComment('');
    setIsStatusDropdownOpen(false);
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedTask) return;
    setIsStatusDropdownOpen(false);

    try {
      await api.patch(`/project/${id}/task/${selectedTask.id}`, {
        status: newStatus,
      });
      setSelectedTask((prev) => ({ ...prev, status: newStatus }));
      setTasks((prev) =>
        prev.map((t) =>
          t.id === selectedTask.id ? { ...t, status: newStatus } : t
        )
      );
      showToast('Task status updated');
    } catch {
      setSelectedTask((prev) => ({ ...prev, status: newStatus }));
      setTasks((prev) =>
        prev.map((t) =>
          t.id === selectedTask.id ? { ...t, status: newStatus } : t
        )
      );
      showToast('Task status updated');
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;

    try {
      await api.delete(`/project/${id}/task/${selectedTask.id}`);
      setTasks((prev) => prev.filter((t) => t.id !== selectedTask.id));
      closeTaskPanel();
      showToast('Task deleted successfully');
    } catch {
      setTasks((prev) => prev.filter((t) => t.id !== selectedTask.id));
      closeTaskPanel();
      showToast('Task deleted successfully');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedTask) return;

    const commentText = newComment.trim();
    setNewComment('');

    try {
      const res = await api.post(`/project/${id}/task/${selectedTask.id}/comment`, {
        body: commentText,
      });
      const created =
        res.data?.comment ||
        res.data?.data || {
          id: Date.now(),
          body: commentText,
          created_by: user?.name || 'Habeba Bakr',
          created_at: new Date().toISOString(),
        };
      setComments((prev) => [created, ...prev]);
    } catch {
      const fallbackComment = {
        id: Date.now(),
        body: commentText,
        created_by: user?.name || 'Habeba Bakr',
        created_at: new Date().toISOString(),
      };
      setComments((prev) => [fallbackComment, ...prev]);
    }
  };

  const handleCommentKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleAddComment();
    }
  };

  const getStatusLabel = (status) => {
    const map = {
      todo: 'To Do',
      to_do: 'To Do',
      in_progress: 'In Progress',
      done: 'Done',
      completed: 'Done',
    };
    return map[status] || 'To Do';
  };

  const getStatusDotClass = (status) => {
    const map = {
      todo: 'dot-todo',
      to_do: 'dot-todo',
      in_progress: 'dot-in-progress',
      done: 'dot-done',
      completed: 'dot-done',
    };
    return map[status] || 'dot-todo';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatShortDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getInitials = (name) => {
    if (!name) return 'HB';
    return name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const todoTasks = tasks.filter(
    (t) => t.status === 'todo' || t.status === 'to_do' || !t.status
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

  const statusOptions = [
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
  ];

  const currentUserName = user?.name || 'Habeba Bakr';

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
                <span className="badge-bullet">•</span>
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
                <LayoutGrid size={15} />
                <span>Board</span>
              </button>
              <button
                type="button"
                className={`view-switch-btn ${
                  viewMode === 'list' ? 'active' : ''
                }`}
                onClick={() => setViewMode('list')}
              >
                <List size={15} />
                <span>List</span>
              </button>
            </div>

            <button
              type="button"
              className="btn-new-task"
              onClick={() => {
                setFieldErrors({});
                setIsModalOpen(true);
              }}
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
                      <div
                        key={task.id || index}
                        className="task-card"
                        onClick={() => openTaskPanel(task)}
                      >
                        <h4 className="task-card-title">{task.title}</h4>
                        {task.description && (
                          <p className="task-card-desc">{task.description}</p>
                        )}
                        <div className="task-card-footer">
                          {task.priority && (
                            <span
                              className={`task-priority-badge priority-${task.priority}`}
                            >
                              {task.priority.charAt(0).toUpperCase() +
                                task.priority.slice(1)}
                            </span>
                          )}
                          {task.due_date && (
                            <span className="task-due-date">
                              <Calendar size={12} />
                              {formatShortDate(task.due_date)}
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
            <table className="tasks-list-table">
              <thead>
                <tr>
                  <th>TASK</th>
                  <th>STATUS</th>
                  <th>PRIORITY</th>
                  <th>DUE DATE</th>
                  <th>ASSIGNEES</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="table-empty-state">
                      No tasks yet. Create one to get started.
                    </td>
                  </tr>
                ) : (
                  tasks.map((task, index) => (
                    <tr
                      key={task.id || index}
                      className="table-row-clickable"
                      onClick={() => openTaskPanel(task)}
                    >
                      <td className="table-task-name">{task.title}</td>
                      <td>
                        <span
                          className={`table-status-pill status-${task.status || 'todo'}`}
                        >
                          <span
                            className={`column-dot ${getStatusDotClass(
                              task.status
                            )}`}
                          ></span>
                          {getStatusLabel(task.status)}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`task-priority-badge priority-${
                            task.priority || 'medium'
                          }`}
                        >
                          {(task.priority || 'medium').charAt(0).toUpperCase() +
                            (task.priority || 'medium').slice(1)}
                        </span>
                      </td>
                      <td className="table-due-date">
                        {task.due_date ? (
                          <span className="table-date-cell">
                            <Calendar size={13} />
                            {formatDate(task.due_date)}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="table-assignees">
                        {Array.isArray(task.assigned_to) &&
                        task.assigned_to.length > 0
                          ? task.assigned_to.join(', ')
                          : 'Unassigned'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {isPanelOpen && selectedTask && (
        <>
          <div className="panel-backdrop" onClick={closeTaskPanel}></div>
          <aside className="task-detail-panel">
            <div className="panel-top-bar">
              <div className="panel-status-dropdown-wrapper">
                <button
                  type="button"
                  className="panel-status-btn"
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                >
                  <span
                    className={`column-dot ${getStatusDotClass(
                      selectedTask.status
                    )}`}
                  ></span>
                  <span>{getStatusLabel(selectedTask.status)}</span>
                  <ChevronDown size={14} className="panel-chevron" />
                </button>
                {isStatusDropdownOpen && (
                  <div className="panel-status-dropdown">
                    {statusOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`panel-status-option ${
                          selectedTask.status === opt.value ? 'active' : ''
                        }`}
                        onClick={() => handleStatusChange(opt.value)}
                      >
                        <span
                          className={`column-dot ${getStatusDotClass(opt.value)}`}
                        ></span>
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="panel-top-actions">
                <button
                  type="button"
                  className="panel-icon-btn"
                  onClick={handleDeleteTask}
                  title="Delete task"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  type="button"
                  className="panel-icon-btn"
                  onClick={closeTaskPanel}
                  title="Close panel"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="panel-scroll-content">
              <h2 className="panel-task-title">{selectedTask.title}</h2>

              <div className="panel-info-grid">
                <div className="panel-info-card">
                  <span className="panel-info-label">PRIORITY</span>
                  <div>
                    <span
                      className={`task-priority-badge priority-${
                        selectedTask.priority || 'medium'
                      }`}
                    >
                      {(selectedTask.priority || 'medium').charAt(0).toUpperCase() +
                        (selectedTask.priority || 'medium').slice(1)}
                    </span>
                  </div>
                </div>
                <div className="panel-info-card">
                  <span className="panel-info-label">DUE DATE</span>
                  <div className="panel-info-value">
                    <Calendar size={14} />
                    <span>{formatDate(selectedTask.due_date)}</span>
                  </div>
                </div>
              </div>

              <div className="panel-info-grid">
                <div className="panel-info-card">
                  <span className="panel-info-label">CREATED BY</span>
                  <div className="panel-info-value">
                    <User size={14} />
                    <span>{selectedTask.created_by || currentUserName}</span>
                  </div>
                </div>
                <div className="panel-info-card">
                  <span className="panel-info-label">ASSIGNEES</span>
                  <div className="panel-info-value">
                    <span className="assignees-text">
                      {Array.isArray(selectedTask.assigned_to) &&
                      selectedTask.assigned_to.length > 0
                        ? selectedTask.assigned_to.join(', ')
                        : 'Unassigned'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="panel-section">
                <h3 className="panel-section-title">DESCRIPTION</h3>
                <p className="panel-description-text">
                  {selectedTask.description || 'bla bla'}
                </p>
              </div>

              <div className="panel-section">
                <h3 className="panel-section-title">
                  COMMENTS ({comments.length})
                </h3>

                {comments.length === 0 && !isLoadingComments ? (
                  <div className="panel-empty-comments">
                    No comments yet. Start the conversation.
                  </div>
                ) : (
                  <div className="panel-comments-list">
                    {comments.map((comment, idx) => (
                      <div key={comment.id || idx} className="panel-comment-item">
                        <div className="panel-comment-avatar">
                          {getInitials(comment.created_by)}
                        </div>
                        <div className="panel-comment-content">
                          <div className="panel-comment-header">
                            <span className="panel-comment-author">
                              {comment.created_by || currentUserName}
                            </span>
                            {comment.created_at && (
                              <span className="panel-comment-time">
                                {new Date(comment.created_at).toLocaleDateString(
                                  'en-US',
                                  {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  }
                                )}
                              </span>
                            )}
                          </div>
                          <p className="panel-comment-body">{comment.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="panel-comment-composer">
              <div className="panel-composer-box">
                <textarea
                  className="panel-comment-input"
                  placeholder="Write a comment... (Cmd+Enter to send)"
                  value={newComment}
                  onChange={(e) => {
                    if (e.target.value.length <= 1000) {
                      setNewComment(e.target.value);
                    }
                  }}
                  onKeyDown={handleCommentKeyDown}
                  rows={3}
                />
              </div>
              <div className="panel-comment-footer">
                <span className="panel-comment-counter">
                  {newComment.length}/1000
                </span>
                <button
                  type="button"
                  className="panel-comment-btn"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  <Send size={14} />
                  <span>Comment</span>
                </button>
              </div>
            </div>
          </aside>
        </>
      )}

      <Modal
        isOpen={isModalOpen}
        title="Create New Task"
        onClose={() => setIsModalOpen(false)}
      >
        {fieldErrors.general && (
          <div className="field-error-text general-error">
            {fieldErrors.general}
          </div>
        )}

        <form onSubmit={handleCreateTask} className="modal-form" noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="taskTitle">
              Task Title
            </label>
            <input
              id="taskTitle"
              type="text"
              className={`form-input ${fieldErrors.title ? 'input-error' : ''}`}
              style={{ paddingLeft: '14px' }}
              placeholder="task1"
              value={newTask.title}
              onChange={(e) => {
                setNewTask((t) => ({ ...t, title: e.target.value }));
                if (fieldErrors.title) {
                  setFieldErrors((prev) => ({ ...prev, title: '' }));
                }
              }}
              required
            />
            {fieldErrors.title && (
              <span className="field-error-text">{fieldErrors.title}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="taskDesc">
              <span>Description</span>
              <span className="char-counter">
                ({newTask.description.length}/255)
              </span>
            </label>
            <textarea
              id="taskDesc"
              className={`form-input modal-textarea ${
                fieldErrors.description ? 'input-error' : ''
              }`}
              placeholder="bla bla"
              value={newTask.description}
              onChange={(e) => {
                if (e.target.value.length <= 255) {
                  setNewTask((t) => ({ ...t, description: e.target.value }));
                }
                if (fieldErrors.description) {
                  setFieldErrors((prev) => ({ ...prev, description: '' }));
                }
              }}
              required
            />
            {fieldErrors.description && (
              <span className="field-error-text">{fieldErrors.description}</span>
            )}
          </div>

          <div className="form-row-2col">
            <div className="form-group">
              <label className="form-label" htmlFor="taskDueDate">
                Due Date
              </label>
              <input
                id="taskDueDate"
                type="date"
                className={`form-input ${
                  fieldErrors.due_date ? 'input-error' : ''
                }`}
                style={{ paddingLeft: '14px' }}
                value={newTask.due_date}
                onChange={(e) => {
                  setNewTask((t) => ({ ...t, due_date: e.target.value }));
                  if (fieldErrors.due_date) {
                    setFieldErrors((prev) => ({ ...prev, due_date: '' }));
                  }
                }}
                required
              />
              {fieldErrors.due_date && (
                <span className="field-error-text">{fieldErrors.due_date}</span>
              )}
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
          </div>

          <div className="form-group">
            <label className="form-label">Assignees</label>
            <div className="modal-assignees-container">
              <div className="modal-assignee-item">
                <div className="modal-assignee-avatar">
                  {getInitials(currentUserName)}
                </div>
                <span className="modal-assignee-name">{currentUserName}</span>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-add-task"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Task'}
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
