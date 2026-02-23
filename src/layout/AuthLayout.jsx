import { useLocation } from "react-router-dom";
import ForgotPassword from "../pages/auth/ForgotPassword";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ResetPassword from "../pages/auth/ResetPassword";
import VerifyEmail from "../pages/auth/VerifyEmail";
import VerifyOtp from "../pages/auth/VerifyOtp";
import { useTheme } from "../context/ThemeContext";
import Icon from "../components/Icon";
import logoImage from "../assets/loggo.png";
import { Button } from "@/components/ui/button";
import { syncUsersToAllServices } from "../services/userService";
import { toast } from "react-hot-toast";
import { useState } from "react";

function AuthLayout() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [syncLoading, setSyncLoading] = useState(false);

  const handleSyncUsers = async () => {
    setSyncLoading(true);
    try {
      const response = await syncUsersToAllServices();
      toast.success(response.message || "Users synced successfully");
    } catch (e) {
      toast.error(e.message || "Failed to sync users");
      console.error("Sync users error:", e);
    } finally {
      setSyncLoading(false);
    }
  };

  // Route ke basis pe component decide karte hain
  const renderAuthForm = () => {
    switch (location.pathname) {
      case "/auth/login":
        return <Login />;
      case "/auth/register":
        return <Register />;
      case "/auth/verify-otp":
        return <VerifyOtp />;
      case "/auth/forgot-password":
        return <ForgotPassword />;
      case "/auth/reset-password":
        return <ResetPassword />;
      case "/auth/verify-email":
        return <VerifyEmail />;
      default:
        return <Login />;
    }
  };

  return (
    <div className="relative min-h-screen flex bg-background overflow-hidden">
      {/* Theme Toggle */}
      <Button
        onClick={toggleTheme}
        size="icon"
        variant="outline"
        className="
          fixed top-6 right-6 z-50
          flex h-12 w-12 items-center justify-center
          rounded-full border border-border
          shadow-md transition
          hover:scale-110 hover:rotate-12
        "
        aria-label="Toggle theme"
      >
        <Icon name={theme === "light" ? "moon" : "sun"} size="20px" />
      </Button>
      <Button
        onClick={handleSyncUsers}
        size="icon"
        variant="outline"
        disabled={syncLoading}
        className="
          fixed top-6 right-20 z-50
          flex h-12 w-12 items-center justify-center
          rounded-full border border-border
          shadow-md transition
          hover:scale-110 hover:rotate-12
          disabled:opacity-50 disabled:cursor-not-allowed
        "
        aria-label="Sync users"
      >
        <Icon
          name={"refresh"}
          size="20px"
          className={syncLoading ? "animate-spin" : ""}
        />
      </Button>

      {/* LEFT : Branding Section */}
      <div
        className="
          relative hidden lg:flex w-1/2
          items-center justify-center
          bg-linear-to-br
          from-primary via-primary/70 to-secondary
          px-16
          overflow-hidden
        "
      >
        {/* Decorative blobs */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-20 left-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

        <div className="relative z-10 max-w-md text-center text-white animate-in fade-in slide-in-from-left duration-700">
          {/* Logo */}
          <div className="mx-auto mb-10 flex h-28 w-28 items-center justify-center rounded-3xl shadow-xl overflow-hidden">
            <img
              src={logoImage}
              alt="VORA Logo"
              className="h-full w-full object-contain rounded-3xl mix-blend-screen"
              style={{
                filter: "drop-shadow(0 0 10px rgba(255,255,255,0.3))",
                background: "transparent",
              }}
            />
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight mb-3">VORA</h1>

          <p className="text-lg text-white/90 mb-12">
            AI-Powered Compliance Auditing Platform
          </p>

          {/* Features */}
          <div className="space-y-6 text-left">
            {[
              {
                icon: "check-circle",
                title: "Automated Compliance",
                desc: "Streamline your audit processes with AI",
              },
              {
                icon: "shield",
                title: "Multi-Framework Support",
                desc: "ISO 27001, NIST, SOX, GDPR & more",
              },
              {
                icon: "chart",
                title: "Real-Time Insights",
                desc: "Monitor compliance instantly",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="
                  flex items-start gap-4 rounded-xl
                  bg-white/10 backdrop-blur
                  border border-white/20 p-4
                  transition hover:translate-x-1
                  animate-in fade-in slide-in-from-bottom
                "
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                  <Icon name={f.icon} size="24px" />
                </div>
                <div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="text-sm text-white/80">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT : Form Section */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-background">
        <div
          className="
            w-full max-w-md
            animate-in fade-in slide-in-from-right
            duration-700
          "
        >
          {renderAuthForm()}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
