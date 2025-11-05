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
  User
} from 'lucide-react';
import CreateProjectModal from '../components/CreateProjectModal';
import CreateTaskModal from '../components/CreateTaskModal';

const TeacherDashboard = () => {
  const { user, logout, getStudentsByTeacher } = useAuth();
  const { projects, createProject, addTask, updateTask } = useProjects();
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

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
              Create Project
            </button>
          </div>

          {teacherProjects.length === 0 ? (
            <div className="empty-state">
              <BookOpen size={64} />
              <h3>No Projects Yet</h3>
              <p>Create your first project to get started with managing student groups.</p>
              <button 
                onClick={() => setShowCreateProject(true)}
                className="create-button primary"
              >
                <Plus size={20} />
                Create Your First Project
              </button>
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
                                  <div className="submission-info">
                                    <FileText size={16} />
                                    <span>Submitted by {task.submission.studentName}</span>
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
