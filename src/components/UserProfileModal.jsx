import { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { getUserById, updateUser } from "../services/userService";
import toast from "react-hot-toast";
import Icon from "./Icon";

function UserProfileModal({ isOpen, onClose }) {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    role: ""
  });

  useEffect(() => {
    if (isOpen && user?.id) {
      fetchUserProfile();
    }
  }, [isOpen, user?.id]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const userId = user?.id || user?._id;
      const response = await getUserById(userId);
      
      // Handle different response structures
      const userData = response.data || response.user || response;
      
      setProfileData({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        role: userData.role || ""
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!profileData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!profileData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    try {
      setSaving(true);
      const response = await updateUser({
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone
      });

      // Update the user context with new data
      const updatedUser = { ...user, ...profileData };
      login(updatedUser, sessionStorage.getItem("token"));
      
      toast.success("Profile updated successfully!");
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000] animate-in fade-in duration-200">
      <div className="bg-background rounded-2xl shadow-2xl max-w-md w-[90%] max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-5 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary to-primary/80 text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-white/10 rounded-full transform translate-x-[40%] -translate-y-[40%]"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Icon name="user" size="24px" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white drop-shadow-sm">
                  My Profile
                </h2>
                <p className="text-white/80 text-sm">Update your account information</p>
              </div>
            </div>
            <button
              className="bg-white/10 border border-white/20 text-white backdrop-blur-sm rounded-full w-9 h-9 flex items-center justify-center hover:bg-white/20 hover:border-white/40 hover:scale-105 transition-all duration-200"
              onClick={onClose}
              title="Close"
            >
              <Icon name="close" size="20px" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-muted-foreground">Loading profile...</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Name</label>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  disabled={saving}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  disabled={saving}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  disabled={saving}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Role (Read-only) */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Role</label>
                <input
                  type="text"
                  value={profileData.role}
                  disabled
                  className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-muted-foreground cursor-not-allowed capitalize"
                />
                <p className="text-xs text-muted-foreground">Role cannot be changed</p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="flex-1 px-4 py-3 border border-border rounded-xl text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Icon name="check" size="16px" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfileModal;