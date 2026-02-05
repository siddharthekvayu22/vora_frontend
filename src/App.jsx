import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/routes";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import AppToaster from "./components/custom/AppToaster";

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <AppRoutes />
          <AppToaster />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
