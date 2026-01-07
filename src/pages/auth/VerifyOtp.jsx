import { useEffect } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { resendOTP, verifyOTP } from "../../services/authService";
import toast from "react-hot-toast";

function VerifyOtp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", otp: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isResendOtpLoading, setIsResendOtpLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const { getEmailForVerification, clearPendingEmail, login } = useAuth();

  const email = getEmailForVerification();

  // Set email in form data and redirect if no email is pending verification
  useEffect(() => {
    if (!email) {
      navigate("/auth/login");
    } else {
      setFormData((prev) => ({ ...prev, email }));
    }
  }, [email, navigate]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await verifyOTP(formData.email, formData.otp);

      // Clear pending email
      clearPendingEmail();

      // If response includes user and token, log them in
      if (response.user && response.token) {
        login(response.user, response.token);
      }

      toast.success(response.message || "Email verified successfully!");

      // Navigate to dashboard or login
      setTimeout(() => {
        navigate(response.user ? "/dashboard" : "/auth/login");
      }, 500);
    } catch (error) {
      console.error(error.message || "Invalid OTP. Please try again.");
      toast.error(error.message || "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setIsResendOtpLoading(true);

    try {
      const response = await resendOTP(email);
      toast.success(
        response.message || "A new OTP has been sent to your email."
      );
      setResendCooldown(60); // 60 second cooldown
    } catch (error) {
      console.error(error.message || "Failed to resend OTP. Please try again.");
      toast.error(error.message || "Failed to resend OTP. Please try again.");
    } finally {
      setIsResendOtpLoading(false);
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
        Verify Your Email
      </h1>

      <p className="text-muted-foreground mb-6">
        Enter the verification code sent to your email
      </p>

      {/* Form */}
      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* Email (readonly) */}
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            readOnly
            className="
              w-full rounded-xl border border-border
              bg-background/50 px-4 py-3 text-sm
              text-muted-foreground
              cursor-not-allowed
            "
          />
        </div>

        {/* OTP */}
        <div className="space-y-1">
          <label htmlFor="otp" className="text-sm font-medium">
            Verification Code
          </label>
          <input
            id="text"
            type="text"
            name="otp"
            value={formData.otp}
            onChange={handleChange}
            maxLength={6}
            required
            placeholder="Enter 6-digit OTP"
            className="
              w-full rounded-xl border border-border
              bg-background px-4 py-3 text-sm
              focus:outline-none focus:ring-2 focus:ring-primary/30
            "
          />
          <p className="text-xs text-muted-foreground">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={` mt-4 w-full rounded-xl
            bg-linear-to-r from-primary to-primary/80
            py-3 text-base font-bold text-white
            shadow-md
            transition hover:-translate-y-0.5 hover:shadow-lg ${
              isLoading ? "cursor-not-allowed" : "cursor-pointer"
            }`}
        >
          {isLoading ? "Verifying..." : "VERIFY OTP"}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-6 space-y-3 text-center text-sm">
        <div className="text-muted-foreground">
          Didn&apos;t receive the code?{" "}
          {resendCooldown > 0 ? (
            <span className="text-muted-foreground">
              Resend in {resendCooldown}s
            </span>
          ) : (
            <Link
              className={`font-medium text-primary ${
                isResendOtpLoading
                  ? "cursor-not-allowed"
                  : "cursor-pointer hover:underline"
              }`}
              onClick={handleResendOTP}
              role="button"
              disabled={isResendOtpLoading}
            >
              {isResendOtpLoading ? "Resending..." : "Resend OTP"}
            </Link>
          )}
        </div>

        <div className="flex justify-center gap-6">
          <Link
            to="/auth/login"
            className="font-medium text-primary hover:underline"
          >
            Back to Login
          </Link>
          <Link
            to="/auth/register"
            className="font-medium text-primary hover:underline"
          >
            Back to Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default VerifyOtp;
