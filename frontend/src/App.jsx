import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import LandingPage from "./LandingPage";
import MissionSelection from "./components/MissionSelection";
import LevelSelection from "./components/LevelSelection";
import MissionControl from "./components/MissionControl";
import RegisterPage from "./pages/RegisterPage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { MissionProvider } from "./context/MissionContext";
import GlobalMissionHud from "./components/ui/GlobalMissionHud";

// ── Protected Route ──────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// ── App ──────────────────────────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <MissionProvider>
        <Router>
          <GlobalMissionHud />
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Navigate to="/register" replace />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected — Mission Map */}
            <Route
              path="/missions"
              element={
                <ProtectedRoute>
                  <MissionSelection />
                </ProtectedRoute>
              }
            />

            {/* Protected — Level Selection for a mission */}
            <Route
              path="/missions/:missionId/levels"
              element={
                <ProtectedRoute>
                  <LevelSelection />
                </ProtectedRoute>
              }
            />

            {/* Protected — Play a specific level */}
            <Route
              path="/missions/:missionId/levels/:levelId"
              element={
                <ProtectedRoute>
                  <MissionControl />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </MissionProvider>
    </AuthProvider>
  );
}

export default App;
