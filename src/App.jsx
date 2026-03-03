import { BrowserRouter as Router } from "react-router-dom";
import { useEffect } from "react";
import AppRoutes from "./routes/routes";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { useAuth } from "./context/useAuth";
import AppToaster from "./components/custom/AppToaster";

function AppContent() {
  const { user } = useAuth();

  useEffect(() => {
    // Update document title based on user role
    if (user?.role) {
      const roleCapitalized =
        user.role.charAt(0).toUpperCase() + user.role.slice(1);
      document.title = `VORA - ${roleCapitalized}`;
    } else {
      document.title = "VORA - Authentication";
    }
  }, [user]);

  return (
    <>
      <AppRoutes />
      <AppToaster />
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
