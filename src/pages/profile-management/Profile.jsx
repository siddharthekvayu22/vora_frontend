import { useState, useEffect } from "react";
import { useAuth } from "../../context/useAuth";
import { userProfile } from "../../services/userService";
import { formatDate } from "../../utils/dateFormatter";
import Icon from "../../components/Icon";
import EditProfileModal from "./components/EditProfileModal";
import ChangePasswordModal from "./components/ChangePasswordModal";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

function Profile() {
  const { user: authUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    if (authUser?.id) {
      fetchProfileData();
    }
  }, [authUser]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await userProfile();
      setProfileData(response.data.user);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-muted-foreground">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center">
          <Icon
            name="warning"
            size="48px"
            className="text-muted-foreground mb-4"
          />
          <p className="text-muted-foreground">Failed to load profile data</p>
          <Button
            onClick={fetchProfileData}
            className="mt-4 px-4 py-2 bg-primary text-white "
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const getRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "expert":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "company":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  return (
    <div className="space-y-6 my-5">
      {/* Profile Header */}
      <div className="rounded border border-border bg-linear-to-br from-background to-card shadow-xl overflow-hidden">
        {/* Cover Background */}
        <div className="h-20 bg-linear-to-r from-primary to-primary-2 relative">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -bottom-12 left-6">
            <div className="w-24 h-24 rounded-full bg-linear-to-br from-primary to-primary-2 border-4 border-background shadow-xl flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {profileData.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-14 pb-4 px-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                <h1 className="text-2xl font-bold text-foreground">
                  {profileData.name}
                </h1>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                      profileData.role,
                    )}`}
                  >
                    {profileData.role?.charAt(0)?.toUpperCase() +
                      profileData.role?.slice(1)}
                  </span>
                  {profileData.isEmailVerified && (
                    <div className="flex items-center gap-1 text-green-600">
                      <Icon name="check" size="14px" />
                      <span className="text-xs">Verified</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                <p className="text-muted-foreground flex items-center gap-2">
                  <Icon name="mail" size="14px" />
                  <span className="truncate">{profileData.email}</span>
                </p>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Icon name="phone" size="14px" />
                  {profileData.phone}
                </p>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Icon name="calendar" size="14px" />
                  Member since {formatDate(profileData.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Information */}
          <div className="rounded border border-border bg-linear-to-br from-background to-card shadow-xl">
            <div className="border-b border-border px-6 py-4">
              <h3 className="text-lg font-semibold text-foreground">
                Account Information
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="full-name"
                      className="text-sm font-medium text-muted-foreground"
                    >
                      Full Name
                    </Label>
                    <p className="text-foreground font-medium">
                      {profileData.name}
                    </p>
                  </div>
                  <div>
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-muted-foreground"
                    >
                      Email Address
                    </Label>
                    <div className="flex items-center gap-2">
                      <p className="text-foreground font-medium">
                        {profileData.email}
                      </p>
                      {profileData.isEmailVerified ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <Icon name="check" size="14px" />
                          <span className="text-xs">Verified</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-amber-600">
                          <Icon name="warning" size="14px" />
                          <span className="text-xs">Unverified</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label
                      htmlFor="number"
                      className="text-sm font-medium text-muted-foreground"
                    >
                      Phone Number
                    </Label>
                    <p className="text-foreground font-medium">
                      {profileData.phone}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="role"
                      className="text-sm font-medium text-muted-foreground"
                    >
                      Role
                    </Label>
                    <div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                          profileData.role,
                        )}`}
                      >
                        {profileData.role?.charAt(0)?.toUpperCase() +
                          profileData.role?.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label
                      htmlFor="member-since"
                      className="text-sm font-medium text-muted-foreground"
                    >
                      Member Since
                    </Label>
                    <p className="text-foreground font-medium">
                      {formatDate(profileData.createdAt)}
                    </p>
                  </div>
                  <div>
                    <Label
                      htmlFor="last-update"
                      className="text-sm font-medium text-muted-foreground"
                    >
                      Last Updated
                    </Label>
                    <p className="text-foreground font-medium">
                      {formatDate(profileData.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
              {profileData.createdBy &&
                profileData.createdBy.type === "admin" && (
                  <div className="pt-4 border-t border-border">
                    <Label
                      htmlFor="created-by"
                      className="text-sm font-medium text-muted-foreground"
                    >
                      Created By
                    </Label>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {profileData.createdBy.user.name
                            ?.charAt(0)
                            ?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-foreground font-medium">
                          {profileData.createdBy.user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {profileData.createdBy.user.email} •{" "}
                          {profileData.createdBy.user.role}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              {profileData.createdBy.type === "self" && (
                <div className="pt-4 border-t border-border">
                  <Label
                    htmlFor="created-by"
                    className="text-sm font-medium text-muted-foreground"
                  >
                    Created By
                  </Label>
                  <p className="text-foreground font-medium">
                    Self Registration
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          {/* User ID Card */}
          <div className="rounded border border-border bg-linear-to-br from-background to-card shadow-xl">
            <div className="border-b border-border px-6 py-4">
              <h3 className="text-lg font-semibold text-foreground">User ID</h3>
            </div>
            <div className="p-6">
              <div className="text-center">
                <div className="text-sm font-mono bg-accent px-3 py-2 rounded break-all">
                  {profileData.id}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded border border-border bg-linear-to-br from-background to-card shadow-xl">
            <div className="border-b border-border px-6 py-4">
              <h3 className="text-lg font-semibold text-foreground">
                Quick Actions
              </h3>
            </div>
            <div className="p-6 space-y-3">
              <Button
                onClick={() => setShowEditModal(true)}
                className=" flex items-center  p-3 "
              >
                <Icon name="edit" size="16px" />
                <span>Edit Profile</span>
              </Button>
              <Button
                onClick={() => setShowPasswordModal(true)}
                className=" flex items-center  p-3"
              >
                <Icon name="key" size="16px" />
                <span>Change Password</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        profileData={profileData}
        onUpdate={fetchProfileData}
      />

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
}

export default Profile;
