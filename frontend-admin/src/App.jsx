import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import PoiList from './pages/pois/PoiList';
import PoiForm from './pages/pois/PoiForm';
import PoiView from './pages/pois/PoiView';
import PoiApprovalList from './pages/pois/PoiApprovalList';
import PoiApprovalDetail from './pages/pois/PoiApprovalDetail';
import TourList from './pages/tours/TourList';
import TourForm from './pages/tours/TourForm';
import Analytics from './pages/Analytics';
import QRManagementPage from './pages/QRManagementPage';
import Users from './pages/Users';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return isAdmin ? children : <Navigate to="/pois" replace />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/pois" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/pois" replace /> : <Register />} />
      <Route path="/" element={<Navigate to="/pois" replace />} />
      <Route path="/pois" element={<ProtectedRoute><PoiList /></ProtectedRoute>} />
      <Route path="/pois/new" element={<ProtectedRoute><PoiForm /></ProtectedRoute>} />
      <Route path="/pois/:id" element={<ProtectedRoute><PoiView /></ProtectedRoute>} />
      <Route path="/pois/:id/edit" element={<ProtectedRoute><PoiForm /></ProtectedRoute>} />
      <Route path="/poi-approvals" element={<AdminRoute><PoiApprovalList /></AdminRoute>} />
      <Route path="/poi-approvals/:id" element={<AdminRoute><PoiApprovalDetail /></AdminRoute>} />
      <Route path="/tours" element={<ProtectedRoute><TourList /></ProtectedRoute>} />
      <Route path="/tours/new" element={<ProtectedRoute><TourForm /></ProtectedRoute>} />
      <Route path="/tours/:id/edit" element={<ProtectedRoute><TourForm /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/qr" element={<ProtectedRoute><QRManagementPage /></ProtectedRoute>} />
      <Route path="/users" element={<AdminRoute><Users /></AdminRoute>} />
      <Route path="*" element={<Navigate to="/pois" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
