import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/Layout/Navbar';
import { Footer } from './components/Layout/Footer';
import { EmergencyButton } from './components/Common/EmergencyButton';
import { Home } from './pages/Home';
import { StudentDashboard } from './pages/Student/StudentDashboard';
import { Resources } from './pages/Resources';
import { About } from './pages/About';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/Admin/AdminDashboard';
import { PeerBuddy } from './pages/Student/PeerBuddy';
import Profile from './pages/Profile';
import { CounsellorDashboard } from './pages/Counsellor/CounsellorDashboard';
import { AICompanion } from './pages/Student/AICompanion';
import { Appointments } from './pages/Student/Appointments';
import { AICopilotWidget } from './components/AI/AICopilotWidget';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen transition-colors">
            <Navbar />
            
            <main className="pt-28">
              <RouteTransitions>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/student" element={<StudentDashboard />} />
                  <Route path="/student/chat" element={<AICompanion />} />
                  <Route path="/student/appointments" element={<Appointments />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/peer-buddy" element={<PeerBuddy />} />
                  <Route path="/resources" element={<Resources />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/auth/google/callback" element={<Login />} />
                  <Route path="/counsellor" element={<CounsellorDashboard />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                </Routes>
              </RouteTransitions>
            </main>
            
            <Footer />
            <AICopilotWidget />
            
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                className: 'dark:bg-gray-800 dark:text-white',
                style: {
                  background: 'var(--toast-bg, #fff)',
                  color: 'var(--toast-color, #374151)',
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

function RouteTransitions({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
