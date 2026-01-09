import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Icon from "../../components/Icon";
import { getUserDetails } from "../../services/userService";
import { formatDate } from "../../utils/dateFormatter";

function UserDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchUserStatistics();
    }
  }, [userId]);

  const fetchUserStatistics = async () => {
    try {
      setLoading(true);
      const response = await getUserDetails(userId);
      setUserData(response.user);
      setStatistics(response.user.statistics);
    } catch (error) {
      console.error("Error fetching user statistics:", error);
      toast.error("Failed to load user statistics");
    } finally {
      setLoading(false);
    }
  };

  // Admin UI - when statistics has createdUsers
  const renderAdminView = () => (
    <>
      {/* Admin Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Icon name="users" size="24px" className="text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created Users</p>
              <p className="text-2xl font-bold text-foreground">
                {(statistics?.createdUsers?.user?.count || 0) +
                  (statistics?.createdUsers?.expert?.count || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Icon name="user" size="24px" className="text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Regular Users</p>
              <p className="text-2xl font-bold text-foreground">
                {statistics?.createdUsers?.user?.count || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Icon name="star" size="24px" className="text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expert Users</p>
              <p className="text-2xl font-bold text-foreground">
                {statistics?.createdUsers?.expert?.count || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Icon name="calendar" size="24px" className="text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="text-lg font-bold text-foreground">
                {formatDate(userData.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Created Regular Users */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="users" size="20px" className="text-blue-500" />
            <h3 className="text-lg font-semibold text-foreground">
              Created Regular Users (
              {statistics?.createdUsers?.user?.count || 0})
            </h3>
          </div>

          <div className="space-y-4">
            {statistics?.createdUsers?.user?.list &&
            statistics.createdUsers.user.list.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {statistics.createdUsers.user.list.map((user, index) => (
                  <div key={index} className="text-sm p-3 bg-muted rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-foreground">
                          {user.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {user.email}
                        </p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Icon
                  name="users"
                  size="32px"
                  className="mx-auto mb-2 opacity-50"
                />
                <p>No regular users created yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Created Expert Users */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="star" size="20px" className="text-purple-500" />
            <h3 className="text-lg font-semibold text-foreground">
              Created Expert Users (
              {statistics?.createdUsers?.expert?.count || 0})
            </h3>
          </div>

          <div className="space-y-4">
            {statistics?.createdUsers?.expert?.list &&
            statistics.createdUsers.expert.list.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {statistics.createdUsers.expert.list.map((expert, index) => (
                  <div key={index} className="text-sm p-3 bg-muted rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-foreground">
                          {expert.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {expert.email}
                        </p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Icon
                  name="star"
                  size="32px"
                  className="mx-auto mb-2 opacity-50"
                />
                <p>No expert users created yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  // Expert UI - when statistics has only frameworks and aiProcessingStatus
  const renderExpertView = () => (
    <>
      {/* Expert Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Frameworks */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Icon name="framework" size="24px" className="text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expert Frameworks</p>
              <p className="text-2xl font-bold text-foreground">
                {statistics?.frameworks || 0}
              </p>
            </div>
          </div>
        </div>

        {/* AI Processing Total */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Icon name="activity" size="24px" className="text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">AI Processing</p>
              <p className="text-2xl font-bold text-foreground">
                {(statistics?.aiProcessingStatus?.completed || 0) +
                  (statistics?.aiProcessingStatus?.pending || 0) +
                  (statistics?.aiProcessingStatus?.processing || 0) +
                  (statistics?.aiProcessingStatus?.failed || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Member Since */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Icon name="calendar" size="24px" className="text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expert Since</p>
              <p className="text-lg font-bold text-foreground">
                {formatDate(userData.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Expert Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Processing Status Breakdown */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="activity" size="20px" className="text-blue-500" />
            <h3 className="text-lg font-semibold text-foreground">
              AI Processing Status
            </h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex justify-between items-center border border-green-200 dark:border-green-800 rounded-lg px-3 py-2 bg-green-50 dark:bg-green-900/20">
                <span className="text-green-700 dark:text-green-400 text-sm font-medium">
                  Completed
                </span>
                <span className="font-bold text-green-800 dark:text-green-300">
                  {statistics?.aiProcessingStatus?.completed || 0}
                </span>
              </div>
              <div className="flex justify-between items-center border border-yellow-200 dark:border-yellow-800 rounded-lg px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20">
                <span className="text-yellow-700 dark:text-yellow-400 text-sm font-medium">
                  Pending
                </span>
                <span className="font-bold text-yellow-800 dark:text-yellow-300">
                  {statistics?.aiProcessingStatus?.pending || 0}
                </span>
              </div>
              <div className="flex justify-between items-center border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2 bg-blue-50 dark:bg-blue-900/20">
                <span className="text-blue-700 dark:text-blue-400 text-sm font-medium">
                  Processing
                </span>
                <span className="font-bold text-blue-800 dark:text-blue-300">
                  {statistics?.aiProcessingStatus?.processing || 0}
                </span>
              </div>
              <div className="flex justify-between items-center border border-red-200 dark:border-red-800 rounded-lg px-3 py-2 bg-red-50 dark:bg-red-900/20">
                <span className="text-red-700 dark:text-red-400 text-sm font-medium">
                  Failed
                </span>
                <span className="font-bold text-red-800 dark:text-red-300">
                  {statistics?.aiProcessingStatus?.failed || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Expert Activity Summary */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="star" size="20px" className="text-purple-500" />
            <h3 className="text-lg font-semibold text-foreground">
              Expert Activity
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Icon
                    name="framework"
                    size="16px"
                    className="text-green-500"
                  />
                </div>
                <span className="text-muted-foreground font-medium">
                  Expert Frameworks
                </span>
              </div>
              <span className="font-bold text-foreground text-lg">
                {statistics?.frameworks || 0}
              </span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Icon
                    name="activity"
                    size="16px"
                    className="text-orange-500"
                  />
                </div>
                <span className="text-muted-foreground font-medium">
                  Total AI Tasks
                </span>
              </div>
              <span className="font-bold text-foreground text-lg">
                {(statistics?.aiProcessingStatus?.completed || 0) +
                  (statistics?.aiProcessingStatus?.pending || 0) +
                  (statistics?.aiProcessingStatus?.processing || 0) +
                  (statistics?.aiProcessingStatus?.failed || 0)}
              </span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Icon
                    name="check-circle"
                    size="16px"
                    className="text-green-500"
                  />
                </div>
                <span className="text-muted-foreground font-medium">
                  Completed Tasks
                </span>
              </div>
              <span className="font-bold text-green-600 text-lg">
                {statistics?.aiProcessingStatus?.completed || 0}
              </span>
            </div>

            <div className="flex justify-between items-center py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Icon name="calendar" size="16px" className="text-blue-500" />
                </div>
                <span className="text-muted-foreground font-medium">
                  Expert Since
                </span>
              </div>
              <span className="font-medium text-foreground">
                {formatDate(userData.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // User UI - when statistics has documents, frameworks, comparisons, aiProcessingStatus
  const renderUserView = () => (
    <>
      {/* User Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Show Documents only if it exists in data */}
        {statistics.hasOwnProperty("documents") && (
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Icon name="document" size="24px" className="text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Documents</p>
                <p className="text-2xl font-bold text-foreground">
                  {statistics?.documents || 0}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Show Frameworks if it exists in data */}
        {statistics.hasOwnProperty("frameworks") && (
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Icon name="framework" size="24px" className="text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Frameworks</p>
                <p className="text-2xl font-bold text-foreground">
                  {statistics?.frameworks || 0}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Show Comparisons only if it exists in data */}
        {statistics.hasOwnProperty("comparisons") && (
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Icon
                  name="analytics"
                  size="24px"
                  className="text-purple-500"
                />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Comparisons</p>
                <p className="text-2xl font-bold text-foreground">
                  {statistics?.comparisons || 0}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Show AI Processing if it exists in data */}
        {statistics.hasOwnProperty("aiProcessingStatus") && (
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Icon name="activity" size="24px" className="text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">AI Processing</p>
                <p className="text-2xl font-bold text-foreground">
                  {(statistics?.aiProcessingStatus?.completed || 0) +
                    (statistics?.aiProcessingStatus?.pending || 0) +
                    (statistics?.aiProcessingStatus?.processing || 0) +
                    (statistics?.aiProcessingStatus?.failed || 0)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Processing Status - only show if aiProcessingStatus exists */}
        {statistics.hasOwnProperty("aiProcessingStatus") && (
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Icon name="activity" size="20px" className="text-blue-500" />
              <h3 className="text-lg font-semibold text-foreground">
                AI Processing Status
              </h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex justify-between items-center border border-green-200 dark:border-green-800 rounded-lg px-3 py-2 bg-green-50 dark:bg-green-900/20">
                  <span className="text-green-700 dark:text-green-400 text-sm font-medium">
                    Completed
                  </span>
                  <span className="font-bold text-green-800 dark:text-green-300">
                    {statistics?.aiProcessingStatus?.completed || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center border border-yellow-200 dark:border-yellow-800 rounded-lg px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20">
                  <span className="text-yellow-700 dark:text-yellow-400 text-sm font-medium">
                    Pending
                  </span>
                  <span className="font-bold text-yellow-800 dark:text-yellow-300">
                    {statistics?.aiProcessingStatus?.pending || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2 bg-blue-50 dark:bg-blue-900/20">
                  <span className="text-blue-700 dark:text-blue-400 text-sm font-medium">
                    Processing
                  </span>
                  <span className="font-bold text-blue-800 dark:text-blue-300">
                    {statistics?.aiProcessingStatus?.processing || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center border border-red-200 dark:border-red-800 rounded-lg px-3 py-2 bg-red-50 dark:bg-red-900/20">
                  <span className="text-red-700 dark:text-red-400 text-sm font-medium">
                    Failed
                  </span>
                  <span className="font-bold text-red-800 dark:text-red-300">
                    {statistics?.aiProcessingStatus?.failed || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Activity Summary */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="analytics" size="20px" className="text-green-500" />
            <h3 className="text-lg font-semibold text-foreground">
              Activity Summary
            </h3>
          </div>

          <div className="space-y-4">
            {/* Show Documents row only if it exists */}
            {statistics.hasOwnProperty("documents") && (
              <div className="flex justify-between items-center py-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Icon name="document" size="16px" className="text-blue-500" />
                  <span className="text-muted-foreground">Documents</span>
                </div>
                <span className="font-medium text-foreground">
                  {statistics?.documents || 0}
                </span>
              </div>
            )}

            {/* Show Frameworks row only if it exists */}
            {statistics.hasOwnProperty("frameworks") && (
              <div className="flex justify-between items-center py-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Icon
                    name="framework"
                    size="16px"
                    className="text-green-500"
                  />
                  <span className="text-muted-foreground">Frameworks</span>
                </div>
                <span className="font-medium text-foreground">
                  {statistics?.frameworks || 0}
                </span>
              </div>
            )}

            {/* Show Comparisons row only if it exists */}
            {statistics.hasOwnProperty("comparisons") && (
              <div className="flex justify-between items-center py-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Icon
                    name="analytics"
                    size="16px"
                    className="text-purple-500"
                  />
                  <span className="text-muted-foreground">Comparisons</span>
                </div>
                <span className="font-medium text-foreground">
                  {statistics?.comparisons || 0}
                </span>
              </div>
            )}

            {/* Always show Member Since */}
            <div className="flex justify-between items-center py-2">
              <div className="flex items-center gap-2">
                <Icon name="calendar" size="16px" className="text-orange-500" />
                <span className="text-muted-foreground">Member Since</span>
              </div>
              <span className="font-medium text-foreground">
                {formatDate(userData.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // Fallback UI - when data structure doesn't match expected patterns
  const renderFallbackView = () => (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
      <div className="text-center py-8">
        <Icon
          name="info"
          size="48px"
          className="mx-auto mb-4 text-muted-foreground"
        />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No Statistics Available
        </h3>
        <p className="text-muted-foreground">
          Statistics data is not available for this user or the data format is
          not recognized.
        </p>
      </div>
    </div>
  );

  // Function to determine which UI to render based on data structure
  const renderStatisticsContent = () => {
    if (!statistics) {
      return renderFallbackView();
    }

    // Check if it's admin data structure (has createdUsers)
    if (statistics.createdUsers) {
      return renderAdminView();
    }

    // Check if it's expert data structure (has only frameworks and aiProcessingStatus, no documents or comparisons)
    if (
      statistics.hasOwnProperty("frameworks") &&
      statistics.hasOwnProperty("aiProcessingStatus") &&
      !statistics.hasOwnProperty("documents") &&
      !statistics.hasOwnProperty("comparisons")
    ) {
      return renderExpertView();
    }

    // Check if it's user data structure (has documents, frameworks, comparisons, aiProcessingStatus)
    if (
      statistics.hasOwnProperty("documents") ||
      statistics.hasOwnProperty("frameworks") ||
      statistics.hasOwnProperty("comparisons") ||
      statistics.hasOwnProperty("aiProcessingStatus")
    ) {
      return renderUserView();
    }

    // Fallback for unknown data structure
    return renderFallbackView();
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
      case "expert":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case "user":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-muted-foreground">
            Loading user statistics...
          </span>
        </div>
      </div>
    );
  }

  if (!userData || !statistics) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center">
          <Icon
            name="warning"
            size="48px"
            className="text-muted-foreground mb-4"
          />
          <p className="text-muted-foreground mb-4">
            Failed to load user statistics
          </p>
          <button
            onClick={() => navigate("/users")}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background my-5">
      <div className="space-y-6">
        {/* User Info Card */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm flex justify-between">
          <div className="flex items-center gap-4 flex-3/4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <Icon name="user" size="32px" className="text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground">
                {userData.name}
              </h2>
              <p className="text-muted-foreground">{userData.email}</p>
              <div className="mt-2 flex items-center gap-3">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(
                    userData.role
                  )}`}
                >
                  {userData.role}
                </span>
                {/* Created By Information */}
                {userData.createdBy === "self" ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                    <Icon name="user-check" size="14px" className="mr-1" />
                    Self Created
                  </span>
                ) : userData.createdBy &&
                  typeof userData.createdBy === "object" ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    <Icon name="user" size="14px" className="mr-1" />
                    Created by {userData.createdBy.name}
                  </span>
                ) : null}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                <Icon name="calendar" size="14px" className="inline mr-1" />
                Joined {formatDate(userData.createdAt)}
              </div>
            </div>
          </div>
          <div className="w-20">
            <button
              onClick={() => navigate(-1)}
              className="border border-border rounded-xl py-2 px-5 cursor-pointer"
            >
              Back
            </button>
          </div>
        </div>

        {/* Dynamic Statistics Content Based on Data Structure */}
        {renderStatisticsContent()}
      </div>
    </div>
  );
}

export default UserDetails;
