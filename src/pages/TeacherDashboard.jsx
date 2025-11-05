import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useProjects } from '../contexts/ProjectContext.jsx';
import { 
  LogOut, 
  Plus, 
  BookOpen, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Calendar,
  FileText,
  User,
  Star,
  RefreshCw
} from 'lucide-react';
import CreateProjectModal from '../components/CreateProjectModal';
import CreateTaskModal from '../components/CreateTaskModal';

const TeacherDashboard = () => {
  const { user, logout, getStudentsByTeacher } = useAuth();
  const { projects, createProject, addTask, updateTask, scoreTask, requestResubmission } = useProjects();
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [scoreInputs, setScoreInputs] = useState({});

  const teacherProjects = projects.filter(p => p.teacherId === user?.id);

  const getTaskStats = (project) => {
    const total = project.tasks.length;
    const completed = project.tasks.filter(t => t.status === 'completed').length;
    const inProgress = project.tasks.filter(t => t.status === 'in_progress').length;
    const pending = project.tasks.filter(t => t.status === 'pending').length;
    
    return { total, completed, inProgress, pending };
  };

  const handleCreateProject = (projectData) => {
    if (user) {
      createProject({
        ...projectData,
        teacherId: user.id,
        teacherName: user.name
      });
      setShowCreateProject(false);
    }
  };

  const handleCreateTask = (taskData) => {
    if (selectedProject) {
      // Get student names for the assigned students
      const students = getStudentsByTeacher(selectedProject.teacherId);
      const studentNames = taskData.assignedTo.map(studentId => {
        const student = students.find(s => s.id === studentId);
        return student ? student.name : 'Unknown Student';
      });
      
      addTask(selectedProject.id, taskData, studentNames);
      setShowCreateTask(false);
      setSelectedProject(null);
    }
  };

  const handleTaskStatusUpdate = (projectId, taskId, status) => {
    updateTask(projectId, taskId, { status });
  };

  const openFilePreview = (fileUrl) => {
    if (!fileUrl) return;
    const win = window.open('', '_blank');
    if (win) {
      win.document.title = 'Preview';
      win.document.body.style.margin = '0';
      win.document.body.innerHTML = `
        <iframe src="${fileUrl}" style="border:0;width:100%;height:100vh"></iframe>
      `;
    }
  };

  const handleScoreChange = (projectId, taskId, score) => {
    setScoreInputs(prev => ({
      ...prev,
      [`${projectId}-${taskId}`]: score
    }));
  };

  const handleSubmitScore = (projectId, taskId) => {
    const score = scoreInputs[`${projectId}-${taskId}`];
    if (score && !isNaN(score) && score >= 0 && score <= 100) {
      scoreTask(projectId, taskId, score);
      setScoreInputs(prev => {
        const newInputs = { ...prev };
        delete newInputs[`${projectId}-${taskId}`];
        return newInputs;
      });
    }
  };

  const handleRequestResubmission = (projectId, taskId) => {
    if (window.confirm('Are you sure you want to request resubmission for this task?')) {
      requestResubmission(projectId, taskId);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <BookOpen size={32} />
            <h1>ProjectFlow</h1>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span className="user-avatar">{user?.avatar}</span>
              <span className="user-name">{user?.name}</span>
            </div>
            <button onClick={logout} className="logout-button">
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-content">
          <div className="dashboard-header-section">
            <h2>Teacher Dashboard</h2>
            <button 
              onClick={() => setShowCreateProject(true)}
              className="create-button"
            >
              <Plus size={20} />
              Create
            </button>
          </div>

          {teacherProjects.length === 0 ? (
            <div className="empty-state">
              <BookOpen size={64} />
              <h3>No Projects Yet</h3>
              <p>Create your first project to get started with managing student groups.</p>
            </div>
          ) : (
            <div className="projects-grid">
              {teacherProjects.map(project => {
                const stats = getTaskStats(project);
                return (
                  <div key={project.id} className="project-card">
                    <div className="project-header">
                      <h3>{project.title}</h3>
                      <span className={`status-badge ${project.status}`}>
                        {project.status}
                      </span>
                    </div>
                    
                    <p className="project-description">{project.description}</p>
                    
                    <div className="project-meta">
                      <div className="meta-item">
                        <Calendar size={16} />
                        <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
                      </div>
                      <div className="meta-item">
                        <Users size={16} />
                        <span>{stats.total} tasks</span>
                      </div>
                    </div>

                    <div className="task-stats">
                      <div className="stat-item completed">
                        <CheckCircle size={16} />
                        <span>{stats.completed}</span>
                      </div>
                      <div className="stat-item in-progress">
                        <Clock size={16} />
                        <span>{stats.inProgress}</span>
                      </div>
                      <div className="stat-item pending">
                        <AlertCircle size={16} />
                        <span>{stats.pending}</span>
                      </div>
                    </div>

                    <div className="project-actions">
                      <button 
                        onClick={() => {
                          setSelectedProject(project);
                          setShowCreateTask(true);
                        }}
                        className="action-button"
                      >
                        <Plus size={16} />
                        Add Task
                      </button>
                    </div>

                    <div className="tasks-section">
                      <h4>Tasks</h4>
                      {project.tasks.length === 0 ? (
                        <p className="no-tasks">No tasks yet. Add your first task!</p>
                      ) : (
                        <div className="tasks-list">
                          {project.tasks.map(task => (
                            <div key={task.id} className="task-item">
                              <div className="task-info">
                                <h5>{task.title}</h5>
                                <p>{task.description}</p>
                                <div className="task-assignees">
                                  {task.assignedToNames.map((name, index) => (
                                    <span key={index} className="assignee">
                                      <User size={12} />
                                      {name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="task-status">
                                <select
                                  value={task.status}
                                  onChange={(e) => handleTaskStatusUpdate(
                                    project.id, 
                                    task.id, 
                                    e.target.value
                                  )}
                                  className="status-select"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="in_progress">In Progress</option>
                                  <option value="completed">Completed</option>
                                </select>
                                {task.submission && (
                                  <div className="submission-actions">
                                    <div className="submission-info">
                                      <FileText size={16} />
                                      <span>Submitted by {task.submission.studentName}</span>
                                    </div>
                                    <div className="submission-details">
                                      <p>File: {task.submission.fileName}</p>
                                      <p>Submitted: {new Date(task.submission.submittedAt).toLocaleString()}</p>
                                      {task.submission.fileUrl && (
                                        <p>
                                          <a
                                            href="#"
                                            className="file-link"
                                            onClick={(e) => { e.preventDefault(); openFilePreview(task.submission.fileUrl); }}
                                          >
                                            View File
                                          </a>
                                        </p>
                                      )}
                                      {task.submission.score !== null && (
                                        <div className="score-display">
                                          <Star size={16} />
                                          <span>Score: {task.submission.score}/100</span>
                                        </div>
                                      )}
                                      {task.submission.resubmissionRequired && (
                                        <div className="resubmission-badge">
                                          <RefreshCw size={14} />
                                          <span>Resubmission Required</span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="scoring-section">
                                      <div className="score-input-group">
                                        <label htmlFor={`score-${project.id}-${task.id}`}>
                                          <Star size={14} />
                                          Score (0-100):
                                        </label>
                                        <input
                                          type="number"
                                          id={`score-${project.id}-${task.id}`}
                                          min="0"
                                          max="100"
                                          value={scoreInputs[`${project.id}-${task.id}`] || task.submission.score || ''}
                                          onChange={(e) => handleScoreChange(project.id, task.id, e.target.value)}
                                          className="score-input"
                                          placeholder="Enter score"
                                        />
                                        <button
                                          onClick={() => handleSubmitScore(project.id, task.id)}
                                          className="score-submit-button"
                                          disabled={!scoreInputs[`${project.id}-${task.id}`] || scoreInputs[`${project.id}-${task.id}`] === String(task.submission.score || '')}
                                        >
                                          Save Score
                                        </button>
                                      </div>
                                      <button
                                        onClick={() => handleRequestResubmission(project.id, task.id)}
                                        className="resubmission-button"
                                        disabled={task.submission.resubmissionRequired}
                                      >
                                        <RefreshCw size={14} />
                                        Request Resubmission
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {showCreateProject && (
        <CreateProjectModal
          onClose={() => setShowCreateProject(false)}
          onSubmit={handleCreateProject}
        />
      )}

      {showCreateTask && selectedProject && (
        <CreateTaskModal
          project={selectedProject}
          onClose={() => {
            setShowCreateTask(false);
            setSelectedProject(null);
          }}
          onSubmit={handleCreateTask}
        />
      )}
    </div>
  );
};

export default TeacherDashboard;
