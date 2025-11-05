import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useProjects } from '../contexts/ProjectContext.jsx';
import { 
  LogOut, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Calendar,
  FileText,
  Upload,
  User,
  Users,
  Star,
  RefreshCw
} from 'lucide-react';
import TaskSubmissionModal from '../components/TaskSubmissionModal';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const { getTasksByStudent, submitTask } = useProjects();
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const studentTasks = user ? getTasksByStudent(user.id) : [];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} className="status-icon completed" />;
      case 'in_progress':
        return <Clock size={20} className="status-icon in-progress" />;
      case 'pending':
        return <AlertCircle size={20} className="status-icon pending" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'completed';
      case 'in_progress':
        return 'in-progress';
      case 'pending':
        return 'pending';
    }
  };

  const handleSubmitTask = (submission) => {
    if (selectedTask) {
      submitTask(selectedTask.project.id, selectedTask.task.id, submission);
      setShowSubmissionModal(false);
      setSelectedTask(null);
    }
  };

  const openSubmissionModal = (taskData) => {
    setSelectedTask(taskData);
    setShowSubmissionModal(true);
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

  // Group tasks by project
  const tasksByProject = studentTasks.reduce((acc, { project, task }) => {
    if (!acc[project.id]) {
      acc[project.id] = { project, tasks: [] };
    }
    acc[project.id].tasks.push(task);
    return acc;
  }, {});

  const totalTasks = studentTasks.length;
  const completedTasks = studentTasks.filter(({ task }) => task.status === 'completed').length;
  const inProgressTasks = studentTasks.filter(({ task }) => task.status === 'in_progress').length;
  const pendingTasks = studentTasks.filter(({ task }) => task.status === 'pending').length;

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
            <h2>Student Dashboard</h2>
            <div className="task-summary">
              <div className="summary-item">
                <span className="summary-number">{totalTasks}</span>
                <span className="summary-label">Total Tasks</span>
              </div>
              <div className="summary-item">
                <span className="summary-number">{completedTasks}</span>
                <span className="summary-label">Completed</span>
              </div>
              <div className="summary-item">
                <span className="summary-number">{inProgressTasks}</span>
                <span className="summary-label">In Progress</span>
              </div>
              <div className="summary-item">
                <span className="summary-number">{pendingTasks}</span>
                <span className="summary-label">Pending</span>
              </div>
            </div>
          </div>

          {studentTasks.length === 0 ? (
            <div className="empty-state">
              <BookOpen size={64} />
              <h3>No Assigned Tasks</h3>
              <p>You don't have any tasks assigned yet. Check back later or contact your teacher.</p>
            </div>
          ) : (
            <div className="projects-section">
              {Object.values(tasksByProject).map(({ project, tasks }) => (
                <div key={project.id} className="project-section">
                  <div className="project-header">
                    <h3>{project.title}</h3>
                    <div className="project-meta">
                      <span className="teacher-name">by {project.teacherName}</span>
                      <span className="deadline">
                        <Calendar size={16} />
                        Due: {new Date(project.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <p className="project-description">{project.description}</p>

                  <div className="tasks-grid">
                    {tasks.map(task => (
                      <div key={task.id} className={`task-card ${getStatusColor(task.status)}`}>
                        <div className="task-header">
                          <h4>{task.title}</h4>
                          {getStatusIcon(task.status)}
                        </div>
                        
                        <p className="task-description">{task.description}</p>
                        
                        <div className="task-meta">
                          {task.deadline && (
                            <div className="meta-item">
                              <Calendar size={14} />
                              <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
                            </div>
                          )}
                          <div className="meta-item">
                            <Users size={14} />
                            <span>Assigned to: {task.assignedToNames.join(', ')}</span>
                          </div>
                        </div>

                        {task.submission ? (
                          <div className="submission-info">
                            <div className="submission-header">
                              <FileText size={16} />
                              <span>Submitted</span>
                              {task.submission.resubmissionRequired && (
                                <div className="resubmission-badge">
                                  <RefreshCw size={14} />
                                  <span>Resubmission Required</span>
                                </div>
                              )}
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
                              {task.submission.comments && (
                                <p>Comments: {task.submission.comments}</p>
                              )}
                            </div>
                            {task.submission.resubmissionRequired && (
                              <div className="task-actions">
                                <button 
                                  onClick={() => openSubmissionModal({ project, task })}
                                  className="submit-button resubmit-button"
                                >
                                  <RefreshCw size={16} />
                                  Resubmit Work
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="task-actions">
                            <button 
                              onClick={() => openSubmissionModal({ project, task })}
                              className="submit-button"
                              disabled={task.status === 'completed'}
                            >
                              <Upload size={16} />
                              Submit Work
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showSubmissionModal && selectedTask && (
        <TaskSubmissionModal
          task={selectedTask.task}
          project={selectedTask.project}
          onClose={() => {
            setShowSubmissionModal(false);
            setSelectedTask(null);
          }}
          onSubmit={handleSubmitTask}
        />
      )}
    </div>
  );
};

export default StudentDashboard;
