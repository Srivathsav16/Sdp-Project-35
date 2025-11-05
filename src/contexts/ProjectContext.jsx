import React, { createContext, useContext, useState, useEffect } from 'react';
import { createProject, createTask, createTaskSubmission } from '../types';

const ProjectContext = createContext(undefined);

// Load projects from localStorage or use empty array
const loadProjectsFromStorage = () => {
  try {
    const stored = localStorage.getItem('projectflow_projects');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState(() => loadProjectsFromStorage());

  // Save projects to localStorage whenever projects change
  useEffect(() => {
    localStorage.setItem('projectflow_projects', JSON.stringify(projects));
  }, [projects]);

  const addProject = (projectData) => {
    const newProject = createProject(
      Date.now().toString(),
      projectData.title,
      projectData.description,
      projectData.teacherId,
      projectData.teacherName,
      new Date().toISOString(),
      projectData.deadline,
      projectData.status,
      []
    );
    setProjects(prev => [...prev, newProject]);
  };

  const updateProject = (id, updates) => {
    setProjects(prev => prev.map(project => 
      project.id === id ? { ...project, ...updates } : project
    ));
  };

  const deleteProject = (id) => {
    setProjects(prev => prev.filter(project => project.id !== id));
  };

  const addTask = (projectId, taskData, studentNames = []) => {
    const newTask = createTask(
      Date.now().toString(),
      projectId,
      taskData.title,
      taskData.description,
      taskData.assignedTo,
      studentNames, // Use provided student names
      taskData.status,
      new Date().toISOString(),
      taskData.deadline
    );
    
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, tasks: [...project.tasks, newTask] }
        : project
    ));
  };

  const updateTask = (projectId, taskId, updates) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? {
            ...project,
            tasks: project.tasks.map(task => 
              task.id === taskId ? { ...task, ...updates } : task
            )
          }
        : project
    ));
  };

  const submitTask = (projectId, taskId, submission) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? {
            ...project,
            tasks: project.tasks.map(task => 
              task.id === taskId 
                ? { 
                    ...task, 
                    submission: {
                      ...submission,
                      // Preserve score if not provided in new submission
                      score: submission.score !== undefined ? submission.score : (task.submission?.score || null),
                      // Use resubmissionRequired from submission (will be false for resubmissions)
                      resubmissionRequired: submission.resubmissionRequired !== undefined ? submission.resubmissionRequired : false
                    }, 
                    status: submission.resubmissionRequired === false ? 'completed' : 'in_progress'
                  }
                : task
            )
          }
        : project
    ));
  };

  const scoreTask = (projectId, taskId, score) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? {
            ...project,
            tasks: project.tasks.map(task => 
              task.id === taskId && task.submission
                ? { 
                    ...task, 
                    submission: { 
                      ...task.submission, 
                      score: parseFloat(score) 
                    } 
                  }
                : task
            )
          }
        : project
    ));
  };

  const requestResubmission = (projectId, taskId) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? {
            ...project,
            tasks: project.tasks.map(task => 
              task.id === taskId && task.submission
                ? { 
                    ...task, 
                    submission: { 
                      ...task.submission, 
                      resubmissionRequired: true 
                    },
                    status: 'in_progress'
                  }
                : task
            )
          }
        : project
    ));
  };

  const getProjectsByTeacher = (teacherId) => {
    return projects.filter(project => project.teacherId === teacherId);
  };

  const getProjectsByStudent = (studentId) => {
    return projects.filter(project => 
      project.tasks.some(task => task.assignedTo.includes(studentId))
    );
  };

  const getTasksByStudent = (studentId) => {
    const result = [];
    projects.forEach(project => {
      project.tasks.forEach(task => {
        if (task.assignedTo.includes(studentId)) {
          result.push({ project, task });
        }
      });
    });
    return result;
  };

  const contextValue = {
    projects,
    createProject: addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    submitTask,
    scoreTask,
    requestResubmission,
    getProjectsByTeacher,
    getProjectsByStudent,
    getTasksByStudent
  };

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
