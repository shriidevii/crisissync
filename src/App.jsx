import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import GuestPortal from './pages/GuestPortal';
import StaffDashboard from './pages/StaffDashboard';
import CommandCenter from './pages/CommandCenter';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/guest" element={<GuestPortal />} />
          <Route path="/staff" element={<StaffDashboard />} />
          <Route path="/admin" element={<CommandCenter />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;