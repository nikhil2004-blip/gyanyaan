import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import LandingPage from "./LandingPage";
import MissionSelection from "./components/MissionSelection";
import MissionControl from "./components/MissionControl";
import RegisterPage from "./pages/RegisterPage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useState } from "react";

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/register" state={{ from: location }} replace />;
  }

  return children;
};

// Mission Handler Wrapper to manage state between Selection and Control
const MissionApp = () => {
  const [view, setView] = useState("selection"); // 'selection' | 'control'
  const [activeMission, setActiveMission] = useState(null);

  const handleMissionStart = (mission) => {
    setActiveMission(mission);
    setView("control");
  };

  const handleBack = () => {
    setView("selection");
    setActiveMission(null);
  };

  if (view === "control") {
    return <MissionControl mission={activeMission} onBack={handleBack} />;
  }

  return <MissionSelection onBack={() => {}} onMissionStart={handleMissionStart} />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Navigate to="/register" replace />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/missions/*"
            element={
              <ProtectedRoute>
                <MissionApp />
              </ProtectedRoute>
            }
          />

          {/* Catch all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
