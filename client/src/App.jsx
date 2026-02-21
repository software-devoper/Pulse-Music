import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { PlayerProvider } from '../context/PlayerContext';
import ProtectedRoute from '../components/ProtectedRoute';
import PlayerBar from '../components/PlayerBar';
import AuthPage from '../pages/AuthPage';
import DashboardPage from '../pages/DashboardPage';
import SearchPage from '../pages/SearchPage';
import LibraryPage from '../pages/LibraryPage';
import DownloadsPage from '../pages/DownloadsPage';
import ProfilePage from '../pages/ProfilePage';

function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <SearchPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/library"
            element={
              <ProtectedRoute>
                <LibraryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/downloads"
            element={
              <ProtectedRoute>
                <DownloadsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <PlayerBar />
      </PlayerProvider>
    </AuthProvider>
  );
}

export default App;
