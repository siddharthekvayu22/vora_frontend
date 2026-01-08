import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import toast from "react-hot-toast";
import { loginApi } from "../../services/authService";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await loginApi(formData.email, formData.password);
      login(response.user, response.token);
      toast.success(response.message || "Login successfull");
      
      // Role-based redirect
      if (response.user?.role === 'admin') {
        navigate("/admin-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error.message || "Invalid email or password");
      toast.error(error.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg animate-in fade-in duration-500">
      {/* Title */}
      <h1
        className="
            text-4xl
            font-bold
            bg-primary
            bg-clip-text text-transparent
            tracking-[-1px]
            leading-[1.2]
            mb-2
          "
      >
        Welcome Back
      </h1>

      <p className="text-muted-foreground mb-6">
        Sign in to your account to continue
      </p>

      {/* Form */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Email */}
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium">
            Email address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
            className="
                w-full rounded-xl border border-border
                bg-background px-4 py-3 text-sm
                focus:outline-none focus:ring-2 focus:ring-primary/30
              "
          />
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Enter your password"
            className="
                w-full rounded-xl border border-border
                bg-background px-4 py-3 text-sm
                focus:outline-none focus:ring-2 focus:ring-primary/30
              "
          />
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`mt-2 w-full rounded-xl bg-linear-to-r from-primary to-primary/80 py-3 text-base font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg ${
            isLoading ? "cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          {isLoading ? "Signing in..." : "LOGIN"}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-6 text-center text-sm">
        <div className="flex items-center justify-center gap-10">
          <Link
            to="/auth/forgot-password"
            className="font-medium text-primary hover:underline"
          >
            Forgot password?
          </Link>
          <Link
            to="/auth/verify-email"
            className="font-medium text-primary hover:underline"
          >
            Verify Email?
          </Link>
        </div>

        <div className="mt-3 text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            to="/auth/register"
            className="font-medium text-primary hover:underline"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
