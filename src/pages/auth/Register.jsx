import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { register } from "../../services/authService";
import { useAuth } from "../../context/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setEmailForVerification } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!formData.password.trim()) {
      toast.error("Password is required");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      const response = await register(formData);

      if (response) {
        // Store email for OTP verification
        setEmailForVerification(formData.email);

        toast.success(
          "Registration successful! Please check your email for the verification code.",
        );
        // Navigate to OTP verification page directly
        navigate("/auth/verify-otp");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded border border-border bg-card p-8 shadow-lg animate-in fade-in duration-500">
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
        Create Account
      </h1>

      <p className="text-muted-foreground mb-6">Join us to get started</p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            disabled={loading}
            className="w-full mt-1"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            disabled={loading}
            className="w-full mt-1"
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your phone number (optional)"
            disabled={loading}
            className="w-full mt-1"
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
            disabled={loading}
            className="w-full mt-1"
          />
        </div>

        {/* Button */}
        <Button
          size="lg"
          type="submit"
          disabled={loading}
          className="mt-2 w-full cursor-pointer"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Registering...
            </>
          ) : (
            "Register"
          )}
        </Button>
      </form>

      {/* Footer */}
      <div className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
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

export default Register;
