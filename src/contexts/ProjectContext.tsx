import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Project, Task, TaskSubmission, User } from '../types';

interface ProjectContextType {
  projects: Project[];
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'tasks'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addTask: (projectId: string, task: Omit<Task, 'id' | 'createdAt' | 'assignedToNames'>) => void;
  updateTask: (projectId: string, taskId: string, updates: Partial<Task>) => void;
  submitTask: (projectId: string, taskId: string, submission: TaskSubmission) => void;
  getProjectsByTeacher: (teacherId: string) => Project[];
  getProjectsByStudent: (studentId: string) => Project[];
  getTasksByStudent: (studentId: string) => { project: Project; task: Task }[];
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Mock data for demonstration
const initialProjects: Project[] = [
  {
    id: '1',
    title: 'DBMS Mini Project',
    description: 'Design and implement a database management system for a library',
    teacherId: '1',
    teacherName: 'Dr. Sarah Johnson',
    createdAt: '2024-01-15T10:00:00Z',
    deadline: '2024-02-15T23:59:59Z',
    status: 'active',
    tasks: [
      {
        id: '1',
        projectId: '1',
        title: 'Database Schema Design',
        description: 'Create ER diagram and normalize the database schema',
        assignedTo: ['2', '3'],
        assignedToNames: ['John Smith', 'Emily Davis'],
        status: 'completed',
        createdAt: '2024-01-15T10:30:00Z',
        deadline: '2024-01-25T23:59:59Z',
        submission: {
          id: '1',
          taskId: '1',
          studentId: '2',
          studentName: 'John Smith',
          fileName: 'schema_design.pdf',
          fileUrl: '/uploads/schema_design.pdf',
          submittedAt: '2024-01-24T15:30:00Z',
          comments: 'Completed ER diagram with normalization'
        }
      },
      {
        id: '2',
        projectId: '1',
        title: 'Frontend Development',
        description: 'Create user interface for library management system',
        assignedTo: ['3', '4'],
        assignedToNames: ['Emily Davis', 'Michael Brown'],
        status: 'in_progress',
        createdAt: '2024-01-15T10:30:00Z',
        deadline: '2024-02-05T23:59:59Z'
      },
      {
        id: '3',
        projectId: '1',
        title: 'Backend API Development',
        description: 'Implement REST API for database operations',
        assignedTo: ['2'],
        assignedToNames: ['John Smith'],
        status: 'pending',
        createdAt: '2024-01-15T10:30:00Z',
        deadline: '2024-02-10T23:59:59Z'
      }
    ]
  }
];

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);

  const createProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'tasks'>) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      tasks: []
    };
    setProjects(prev => [...prev, newProject]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(project => 
      project.id === id ? { ...project, ...updates } : project
    ));
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id));
  };

  const addTask = (projectId: string, taskData: Omit<Task, 'id' | 'createdAt' | 'assignedToNames'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      assignedToNames: [] // This would be populated based on assignedTo IDs
    };
    
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, tasks: [...project.tasks, newTask] }
        : project
    ));
  };

  const updateTask = (projectId: string, taskId: string, updates: Partial<Task>) => {
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

  const submitTask = (projectId: string, taskId: string, submission: TaskSubmission) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? {
            ...project,
            tasks: project.tasks.map(task => 
              task.id === taskId 
                ? { ...task, submission, status: 'completed' as const }
                : task
            )
          }
        : project
    ));
  };

  const getProjectsByTeacher = (teacherId: string) => {
    return projects.filter(project => project.teacherId === teacherId);
  };

  const getProjectsByStudent = (studentId: string) => {
    return projects.filter(project => 
      project.tasks.some(task => task.assignedTo.includes(studentId))
    );
  };

  const getTasksByStudent = (studentId: string) => {
    const result: { project: Project; task: Task }[] = [];
    projects.forEach(project => {
      project.tasks.forEach(task => {
        if (task.assignedTo.includes(studentId)) {
          result.push({ project, task });
        }
      });
    });
    return result;
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      createProject,
      updateProject,
      deleteProject,
      addTask,
      updateTask,
      submitTask,
      getProjectsByTeacher,
      getProjectsByStudent,
      getTasksByStudent
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
