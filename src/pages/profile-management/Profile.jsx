import { useState, useEffect } from "react";
import { useAuth } from "../../context/useAuth";
import { getUserById } from "../../services/userService";
import { formatDate } from "../../utils/dateFormatter";
import Icon from "../../components/Icon";
import toast from "react-hot-toast";

function Profile() {
  const { user: authUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (authUser?.id) {
      fetchProfileData();
    }
  }, [authUser]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await getUserById(authUser.id);
      setProfileData(response.user);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-muted-foreground">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Icon
            name="warning"
            size="48px"
            className="text-muted-foreground mb-4"
          />
          <p className="text-muted-foreground">Failed to load profile data</p>
          <button
            onClick={fetchProfileData}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { statistics } = profileData;
  const isAdmin = profileData.role?.toLowerCase() === "admin";

  const tabs = [
    { id: "overview", label: "Overview", icon: "dashboard" },
    { id: "statistics", label: "Statistics", icon: "chart" },
    { id: "activity", label: "Activity", icon: "clock" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-500/20 text-amber-600 border-amber-500/30";
      case "processing":
        return "bg-blue-500/20 text-blue-600 border-blue-500/30";
      case "completed":
        return "bg-green-500/20 text-green-600 border-green-500/30";
      case "failed":
        return "bg-red-500/20 text-red-600 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-600 border-gray-500/30";
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "expert":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "user":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  return (
    <div className="space-y-6 my-5">
      {/* Profile Header */}
      <div className="rounded-2xl border border-border bg-gradient-to-br from-background to-card shadow-xl overflow-hidden">
        {/* Cover Background */}
        <div className="h-32 bg-gradient-to-r from-primary to-primary-2 relative">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -bottom-16 left-8">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary-2 border-4 border-background shadow-xl flex items-center justify-center">
              <span className="text-4xl font-bold text-white">
                {profileData.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-20 pb-6 px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-foreground">
                  {profileData.name}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(
                    profileData.role
                  )}`}
                >
                  {profileData.role?.charAt(0)?.toUpperCase() +
                    profileData.role?.slice(1)}
                </span>
                {profileData.isEmailVerified && (
                  <div className="flex items-center gap-1 text-green-600">
                    <Icon name="check" size="16px" />
                    <span className="text-sm">Verified</span>
                  </div>
                )}
              </div>
              <p className="text-muted-foreground flex items-center gap-2">
                <Icon name="mail" size="16px" />
                {profileData.email}
              </p>
              <p className="text-muted-foreground flex items-center gap-2">
                <Icon name="phone" size="16px" />
                {profileData.phone}
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Icon name="calendar" size="16px" />
                Member since {formatDate(profileData.createdAt)}
              </p>
            </div>

            <div className="flex gap-3">
              <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                <Icon name="edit" size="16px" />
                Edit Profile
              </button>
              <button className="px-6 py-2 border border-border bg-background hover:bg-accent rounded-lg transition-colors flex items-center gap-2">
                <Icon name="settings" size="16px" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? "text-primary border-primary"
                : "text-muted-foreground border-transparent hover:text-foreground"
            }`}
          >
            <Icon name={tab.icon} size="16px" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Statistics */}
            <div className="rounded-2xl border border-border bg-gradient-to-br from-background to-card shadow-xl">
              <div className="border-b border-border px-6 py-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Personal Statistics
                </h3>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Icon name="file" size="24px" className="text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {statistics.documents}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Documents
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Icon
                        name="framework"
                        size="24px"
                        className="text-purple-600"
                      />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {statistics.frameworks}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Frameworks
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Icon
                        name="chart"
                        size="24px"
                        className="text-green-600"
                      />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {statistics.comparisons}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Comparisons
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Processing Status */}
            <div className="rounded-2xl border border-border bg-gradient-to-br from-background to-card shadow-xl">
              <div className="border-b border-border px-6 py-4">
                <h3 className="text-lg font-semibold text-foreground">
                  AI Processing Status
                </h3>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-4 gap-4">
                  {Object.entries(statistics.aiProcessingStatus).map(
                    ([status, count]) => (
                      <div
                        key={status}
                        className={`p-4 rounded-xl border ${getStatusColor(
                          status
                        )}`}
                      >
                        <div className="text-xl font-bold">{count}</div>
                        <div className="text-sm capitalize">{status}</div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* System Statistics (Admin Only) */}
            {isAdmin && statistics.systemStats && (
              <div className="rounded-2xl border border-border bg-gradient-to-br from-background to-card shadow-xl">
                <div className="border-b border-border px-6 py-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    System Statistics
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-500/20 flex items-center justify-center">
                        <Icon
                          name="user"
                          size="24px"
                          className="text-red-600"
                        />
                      </div>
                      <div className="text-2xl font-bold text-foreground">
                        {statistics.systemStats.totalUsers}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Users
                      </div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Icon
                          name="user"
                          size="24px"
                          className="text-blue-600"
                        />
                      </div>
                      <div className="text-2xl font-bold text-foreground">
                        {statistics.systemStats.totalExperts}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Experts
                      </div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Icon
                          name="file"
                          size="24px"
                          className="text-green-600"
                        />
                      </div>
                      <div className="text-2xl font-bold text-foreground">
                        {statistics.systemStats.totalDocuments}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Documents
                      </div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Icon
                          name="framework"
                          size="24px"
                          className="text-purple-600"
                        />
                      </div>
                      <div className="text-2xl font-bold text-foreground">
                        {statistics.systemStats.totalUserFrameworks}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        User Frameworks
                      </div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <Icon
                          name="framework"
                          size="24px"
                          className="text-amber-600"
                        />
                      </div>
                      <div className="text-2xl font-bold text-foreground">
                        {statistics.systemStats.totalExpertFrameworks}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Expert Frameworks
                      </div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-teal-500/10 border border-teal-500/20">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-teal-500/20 flex items-center justify-center">
                        <Icon
                          name="chart"
                          size="24px"
                          className="text-teal-600"
                        />
                      </div>
                      <div className="text-2xl font-bold text-foreground">
                        {statistics.systemStats.totalComparisons}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Comparisons
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile Details Sidebar */}
          <div className="space-y-6">
            {/* Account Information */}
            <div className="rounded-2xl border border-border bg-gradient-to-br from-background to-card shadow-xl">
              <div className="border-b border-border px-6 py-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Account Information
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">User ID</span>
                  <span className="text-sm font-mono bg-accent px-2 py-1 rounded">
                    {profileData.id.slice(-8)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Email Status</span>
                  <div className="flex items-center gap-2">
                    {profileData.isEmailVerified ? (
                      <>
                        <Icon
                          name="check"
                          size="16px"
                          className="text-green-600"
                        />
                        <span className="text-green-600 text-sm">Verified</span>
                      </>
                    ) : (
                      <>
                        <Icon
                          name="warning"
                          size="16px"
                          className="text-amber-600"
                        />
                        <span className="text-amber-600 text-sm">
                          Unverified
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Role</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                      profileData.role
                    )}`}
                  >
                    {profileData.role?.charAt(0)?.toUpperCase() +
                      profileData.role?.slice(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Joined</span>
                  <span className="text-sm">
                    {formatDate(profileData.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl border border-border bg-gradient-to-br from-background to-card shadow-xl">
              <div className="border-b border-border px-6 py-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Quick Actions
                </h3>
              </div>
              <div className="p-6 space-y-3">
                <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors">
                  <Icon name="edit" size="16px" />
                  <span>Edit Profile</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors">
                  <Icon name="key" size="16px" />
                  <span>Change Password</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors">
                  <Icon name="settings" size="16px" />
                  <span>Account Settings</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors">
                  <Icon name="download" size="16px" />
                  <span>Export Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "statistics" && (
        <div className="text-center py-20">
          <Icon
            name="chart"
            size="64px"
            className="text-muted-foreground mb-4 mx-auto"
          />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Detailed Statistics
          </h3>
          <p className="text-muted-foreground">Coming soon...</p>
        </div>
      )}

      {activeTab === "activity" && (
        <div className="text-center py-20">
          <Icon
            name="clock"
            size="64px"
            className="text-muted-foreground mb-4 mx-auto"
          />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Activity Timeline
          </h3>
          <p className="text-muted-foreground">Coming soon...</p>
        </div>
      )}
    </div>
  );
}

export default Profile;
