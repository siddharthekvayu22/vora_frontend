import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword } from "../../services/authService";
import toast from "react-hot-toast";
import { useAuth } from "../../context/useAuth";

function ForgotPassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "" });
  const [isLoading, setIsLoading] = useState(false);
  const { setEmailForVerification } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await forgotPassword(formData.email);

      // Store email for reset password flow
      setEmailForVerification(formData.email);

      toast.success(
        response.message || "OTP sent to your email. Please check your inbox"
      );

      navigate("/auth/reset-password");
    } catch (error) {
      console.error(error.message || "Failed to send OTP. Please try again.");
      toast.error(error.message || "Failed to send OTP. Please try again.");
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
        Forgot Password?
      </h1>

      <p className="text-muted-foreground mb-8">
        Enter your email address and we&apos;ll send you an OTP to reset your
        password
      </p>

      {/* Form */}
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Email */}
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium">
            Email Address
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

        {/* Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`mt-2 w-full rounded-xl
            bg-linear-to-r from-primary to-primary/80
            py-3 text-base font-bold text-white
            shadow-md
            transition hover:-translate-y-0.5 hover:shadow-lg ${
              isLoading ? "cursor-not-allowed" : "cursor-pointer"
            }`}
        >
          {isLoading ? "Sending OTP..." : "SEND OTP"}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link
          to="/auth/login"
          className="font-medium text-primary hover:underline"
        >
          Login here
        </Link>
      </div>
    </div>
  );
}

export default ForgotPassword;
