# ProjectFlow - Student Group Project Management System

A modern web-based Student Group Project Management System built with Vite + React + TypeScript. This system helps teachers manage group projects and enables students to coordinate tasks, track progress, and submit work efficiently.

## 🚀 Features

### For Teachers:
- **Project Management**: Create and manage multiple projects
- **Task Assignment**: Assign tasks to specific students or groups
- **Progress Tracking**: Monitor task completion and project progress
- **Submission Review**: View and review student submissions
- **Real-time Updates**: See status changes as students update their work

### For Students:
- **Task Dashboard**: View all assigned tasks across projects
- **Progress Updates**: Update task status (Pending/In Progress/Completed)
- **File Submissions**: Upload and submit work files
- **Deadline Tracking**: See project and task deadlines
- **Collaboration**: Work with assigned team members

## 🛠️ Technology Stack

- **Frontend**: React 18 + JavaScript
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Styling**: Custom CSS with modern design
- **State Management**: React Context API
- **Authentication**: Custom password-based auth system

## 📋 Getting Started

### First Time Setup:
1. **Sign up as a Teacher** - Create your teacher account first
2. **Sign up as Students** - Have your students create their accounts
3. **Create Projects** - Teachers can create projects and assign tasks to registered students
4. **Manage Tasks** - Students can view assigned tasks and submit their work

## 🔐 Authentication Features

- **Sign Up**: Create new accounts with email and password
- **Sign In**: Login with existing credentials
- **Password Security**: Passwords are hashed and validated
- **Role-based Access**: Separate dashboards for teachers and students
- **Session Management**: Persistent login sessions

## 🚀 Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd projectflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to view the application.

## 📱 Usage

### Teacher Workflow:
1. **Sign Up/Login** with teacher credentials
2. **Create Projects** with descriptions and deadlines
3. **Add Tasks** to projects and assign to students
4. **Monitor Progress** through the dashboard
5. **Review Submissions** from students

### Student Workflow:
1. **Sign Up/Login** with student credentials
2. **View Assigned Tasks** on the dashboard
3. **Update Task Status** as work progresses
4. **Submit Work** by uploading files
5. **Track Deadlines** and project requirements

## 🎯 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── CreateProjectModal.jsx
│   ├── CreateTaskModal.jsx
│   ├── ProtectedRoute.jsx
│   └── TaskSubmissionModal.jsx
├── contexts/           # React Context providers
│   ├── AuthContext.js
│   └── ProjectContext.js
├── pages/              # Main application pages
│   ├── LoginPage.jsx
│   ├── TeacherDashboard.jsx
│   └── StudentDashboard.jsx
├── types/              # JavaScript type definitions
│   └── index.js
└── utils/              # Utility functions
```

## 🎨 Design Features

- **Modern UI**: Clean, professional design with gradient backgrounds
- **Responsive**: Works on desktop, tablet, and mobile devices
- **Intuitive Navigation**: Easy-to-use interface for both teachers and students
- **Status Indicators**: Color-coded task statuses and progress tracking
- **File Upload**: Drag-and-drop file submission with progress indicators
- **Real-time Updates**: Immediate feedback on status changes

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📊 User Management

The application features a clean user management system:
- **No Demo Data**: Start fresh with your own users and projects
- **Real User Registration**: Teachers and students sign up with their own credentials
- **Dynamic Student Assignment**: Teachers can assign tasks to any registered students
- **Real-time Updates**: Both dashboards update immediately when tasks are assigned or submitted

## 🚀 Deployment

To deploy the application:

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your preferred hosting service (Vercel, Netlify, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎓 Educational Context

This project was developed as part of the **FEDF-PS35: Student Group Project Management System** requirement, implementing Design Thinking & Innovation (DTI) concepts:

- **Empathize**: Understanding the needs of students and teachers in group project management
- **Define**: Identifying the core problem of task coordination and progress tracking
- **Ideate**: Creating a digital platform solution
- **Prototype**: Building a functional web application
- **Test**: Implementing with sample data and user flows

## 🔮 Future Enhancements

- Real-time notifications
- Chat/messaging system
- Advanced file management
- Grade tracking and feedback
- Calendar integration
- Mobile app development
- Advanced analytics and reporting

---

**ProjectFlow** - Streamlining student group project management for better collaboration and learning outcomes.