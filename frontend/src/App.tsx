import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/useAuthStore';
import { useThemeStore } from './stores/useThemeStore';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Notes } from './pages/Notes';
import { Documents } from './pages/Documents';
import { Calendar } from './pages/Calendar';
import { Tasks } from './pages/Tasks';
import { Goals } from './pages/Goals';
import { Learning } from './pages/Learning';
import { Career } from './pages/Career';
import { Finance } from './pages/Finance';
import { KnowledgeGraph } from './pages/KnowledgeGraph';
import { Analytics } from './pages/Analytics';
import { Integrations } from './pages/Integrations';
import { MobileSimulator } from './pages/MobileSimulator';
import { Settings } from './pages/Settings';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { VerifyEmail } from './pages/VerifyEmail';
import { ResendVerification } from './pages/ResendVerification';
import { EmailInbox } from './pages/EmailInbox';

// Route Guard for authenticated users
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

// Route Guard for anonymous users (prevent login view when authenticated)
const AnonymousRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};


export const App: React.FC = () => {
  const initializeTheme = useThemeStore((state) => state.initializeTheme);

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth paths */}
        <Route
          path="/login"
          element={
            <AnonymousRoute>
              <Login />
            </AnonymousRoute>
          }
        />
        <Route
          path="/register"
          element={
            <AnonymousRoute>
              <Register />
            </AnonymousRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <AnonymousRoute>
              <ForgotPassword />
            </AnonymousRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <AnonymousRoute>
              <ResetPassword />
            </AnonymousRoute>
          }
        />
        <Route
          path="/verify-email"
          element={
            <AnonymousRoute>
              <VerifyEmail />
            </AnonymousRoute>
          }
        />
        <Route
          path="/resend-verification"
          element={
            <AnonymousRoute>
              <ResendVerification />
            </AnonymousRoute>
          }
        />

        {/* Protected Dashboard/Shell paths */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <Notes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents"
          element={
            <ProtectedRoute>
              <Documents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <Calendar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/goals"
          element={
            <ProtectedRoute>
              <Goals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learning"
          element={
            <ProtectedRoute>
              <Learning />
            </ProtectedRoute>
          }
        />
        <Route
          path="/career"
          element={
            <ProtectedRoute>
              <Career />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance"
          element={
            <ProtectedRoute>
              <Finance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/graph"
          element={
            <ProtectedRoute>
              <KnowledgeGraph />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/integrations"
          element={
            <ProtectedRoute>
              <Integrations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mobile-simulator"
          element={
            <ProtectedRoute>
              <MobileSimulator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/email"
          element={
            <ProtectedRoute>
              <EmailInbox />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
