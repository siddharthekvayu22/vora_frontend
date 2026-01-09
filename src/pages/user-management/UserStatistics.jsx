import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Icon from "../../components/Icon";
import { getUserStatistics } from "../../services/userService";
import { formatDate } from "../../utils/dateFormatter";

function UserStatistics() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [isAdminView, setIsAdminView] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUserStatistics();
    }
  }, [userId]);

  const fetchUserStatistics = async () => {
    try {
      setLoading(true);
      const response = await getUserStatistics(userId);
      setUserData(response.user);
      setStatistics(response.statistics);

      // Check if this is admin view based on data structure
      setIsAdminView(response.statistics?.systemOverview !== undefined);
    } catch (error) {
      console.error("Error fetching user statistics:", error);
      toast.error("Failed to load user statistics");
    } finally {
      setLoading(false);
    }
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
              <div className="mt-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(
                    userData.role
                  )}`}
                >
                  {userData.role}
                </span>
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

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isAdminView ? (
            // Admin view - System Overview
            <>
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Icon name="users" size="24px" className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold text-foreground">
                      {statistics?.systemOverview?.totalUsers || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Icon
                      name="framework"
                      size="24px"
                      className="text-green-500"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      User Frameworks
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {statistics?.systemOverview?.totalUserFrameworks || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Icon
                      name="framework"
                      size="24px"
                      className="text-purple-500"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Expert Frameworks
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {statistics?.systemOverview?.totalExpertFrameworks || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <Icon
                      name="document"
                      size="24px"
                      className="text-orange-500"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Documents
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {statistics?.systemOverview?.totalDocuments || 0}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Regular user view - Personal Statistics
            <>
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Icon
                      name="document"
                      size="24px"
                      className="text-blue-500"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Documents
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {statistics?.summary?.totalDocuments || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Icon
                      name="framework"
                      size="24px"
                      className="text-green-500"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Frameworks
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {statistics?.summary?.totalFrameworks || 0}
                    </p>
                  </div>
                </div>
              </div>

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
                    <p className="text-sm text-muted-foreground">
                      Total Comparisons
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {statistics?.summary?.totalComparisons || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <Icon
                      name="folder"
                      size="24px"
                      className="text-orange-500"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Storage Used
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {statistics?.summary?.totalStorageUsed || "0 Bytes"}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Detailed Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isAdminView ? (
            // Admin view - Recent Activity
            <>
              {/* Recent Users */}
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Icon name="users" size="20px" className="text-blue-500" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Recent Users
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Users</span>
                    <span className="font-medium text-foreground">
                      {statistics?.systemOverview?.totalUsers || 0}
                    </span>
                  </div>

                  {statistics?.recentActivity?.recentUsers &&
                    statistics.recentActivity.recentUsers.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-foreground mb-2">
                          Latest Registrations
                        </p>
                        <div className="space-y-2">
                          {statistics.recentActivity.recentUsers
                            .slice(0, 5)
                            .map((user, index) => (
                              <div
                                key={index}
                                className="text-sm p-3 bg-muted rounded-lg"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium text-foreground">
                                      {user.name}
                                    </p>
                                    <p className="text-muted-foreground text-xs">
                                      {user.email}
                                    </p>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(user.createdAt)}
                                  </span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Recent Frameworks */}
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Icon
                    name="framework"
                    size="20px"
                    className="text-green-500"
                  />
                  <h3 className="text-lg font-semibold text-foreground">
                    Recent Frameworks
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex justify-between items-center border border-border rounded-sm px-2">
                      <span className="text-muted-foreground text-sm">
                        User Frameworks
                      </span>
                      <span className="font-medium text-foreground">
                        {statistics?.systemOverview?.totalUserFrameworks || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border border-border rounded-sm px-2">
                      <span className="text-muted-foreground text-sm">
                        Expert Frameworks
                      </span>
                      <span className="font-medium text-foreground">
                        {statistics?.systemOverview?.totalExpertFrameworks || 0}
                      </span>
                    </div>
                  </div>

                  {statistics?.recentActivity?.recentFrameworks &&
                    statistics.recentActivity.recentFrameworks.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-foreground mb-2">
                          Latest Uploads
                        </p>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {statistics.recentActivity.recentFrameworks
                            .slice(0, 5)
                            .map((framework, index) => (
                              <div
                                key={index}
                                className="text-sm p-3 bg-muted rounded-lg"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-foreground truncate">
                                      {framework.frameworkName}
                                    </p>
                                    <p className="text-muted-foreground text-xs">
                                      {framework.uploadedBy?.name || "System"} •{" "}
                                      {framework.frameworkType?.toUpperCase()}
                                    </p>
                                  </div>
                                  <span className="text-xs text-muted-foreground ml-2">
                                    {formatDate(framework.createdAt)}
                                  </span>
                                </div>

                                {/* AI Processing Status */}
                                <div className="flex items-center gap-2 mt-2">
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      framework.aiProcessing?.status ===
                                      "completed"
                                        ? "bg-green-500"
                                        : framework.aiProcessing?.status ===
                                          "pending"
                                        ? "bg-yellow-500"
                                        : "bg-gray-500"
                                    }`}
                                  ></div>
                                  <span className="text-xs text-muted-foreground capitalize">
                                    AI:{" "}
                                    {framework.aiProcessing?.status ||
                                      "Unknown"}
                                    {framework.aiProcessing?.controlsCount >
                                      0 &&
                                      ` (${framework.aiProcessing.controlsCount} controls)`}
                                  </span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </>
          ) : (
            // Regular user view - Documents and Frameworks
            <>
              {/* Documents Statistics */}
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Icon name="document" size="20px" className="text-blue-500" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Documents
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Count</span>
                    <span className="font-medium text-foreground">
                      {statistics?.documents?.count || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Size</span>
                    <span className="font-medium text-foreground">
                      {statistics?.documents?.totalSize || "0 Bytes"}
                    </span>
                  </div>

                  {statistics?.documents?.byType &&
                    Object.keys(statistics.documents.byType).length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-foreground mb-2">
                          By Type
                        </p>
                        <div className="space-y-1">
                          {Object.entries(statistics.documents.byType).map(
                            ([type, count]) => (
                              <div
                                key={type}
                                className="flex justify-between text-sm"
                              >
                                <span className="text-muted-foreground capitalize">
                                  {type}
                                </span>
                                <span className="text-foreground">{count}</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {statistics?.documents?.recent &&
                    statistics.documents.recent.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-foreground mb-2">
                          Recent Documents
                        </p>
                        <div className="space-y-2">
                          {statistics.documents.recent
                            .slice(0, 3)
                            .map((doc, index) => (
                              <div
                                key={index}
                                className="text-sm p-2 bg-muted rounded"
                              >
                                <p className="font-medium text-foreground truncate">
                                  {doc.name}
                                </p>
                                <p className="text-muted-foreground">
                                  {formatDate(doc.createdAt)}
                                </p>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Frameworks Statistics */}
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Icon
                    name="framework"
                    size="20px"
                    className="text-green-500"
                  />
                  <h3 className="text-lg font-semibold text-foreground">
                    Frameworks
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Count</span>
                    <span className="font-medium text-foreground">
                      {statistics?.frameworks?.count || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Size</span>
                    <span className="font-medium text-foreground">
                      {statistics?.frameworks?.totalSize || "0 Bytes"}
                    </span>
                  </div>

                  {statistics?.frameworks?.byType &&
                    Object.keys(statistics.frameworks.byType).length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-foreground mb-2">
                          By Type
                        </p>
                        <div className="space-y-1">
                          {Object.entries(statistics.frameworks.byType).map(
                            ([type, count]) => (
                              <div
                                key={type}
                                className="flex justify-between text-sm"
                              >
                                <span className="text-muted-foreground capitalize">
                                  {type}
                                </span>
                                <span className="text-foreground">{count}</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {statistics?.frameworks?.byStatus &&
                    Object.keys(statistics.frameworks.byStatus).length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-foreground mb-2">
                          By Status
                        </p>
                        <div className="space-y-1">
                          {Object.entries(statistics.frameworks.byStatus).map(
                            ([status, count]) => (
                              <div
                                key={status}
                                className="flex justify-between text-sm"
                              >
                                <span className="text-muted-foreground capitalize">
                                  {status}
                                </span>
                                <span className="text-foreground">{count}</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {statistics?.frameworks?.recent &&
                    statistics.frameworks.recent.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-foreground mb-2">
                          Recent Frameworks
                        </p>
                        <div className="space-y-2">
                          {statistics.frameworks.recent
                            .slice(0, 3)
                            .map((framework, index) => (
                              <div
                                key={index}
                                className="text-sm p-2 bg-muted rounded"
                              >
                                <p className="font-medium text-foreground truncate">
                                  {framework.name}
                                </p>
                                <p className="text-muted-foreground">
                                  {formatDate(framework.createdAt)}
                                </p>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Additional Statistics */}
        {!isAdminView && statistics?.comparisons?.count > 0 && (
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Icon name="analytics" size="20px" className="text-purple-500" />
              <h3 className="text-lg font-semibold text-foreground">
                Comparisons
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-muted-foreground">
                    Total Comparisons
                  </span>
                  <span className="font-medium text-foreground">
                    {statistics?.comparisons?.count || 0}
                  </span>
                </div>
              </div>

              {statistics?.comparisons?.recent &&
                statistics.comparisons.recent.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">
                      Recent Comparisons
                    </p>
                    <div className="space-y-2">
                      {statistics.comparisons.recent
                        .slice(0, 3)
                        .map((comparison, index) => (
                          <div
                            key={index}
                            className="text-sm p-2 bg-muted rounded"
                          >
                            <p className="font-medium text-foreground truncate">
                              {comparison.name}
                            </p>
                            <p className="text-muted-foreground">
                              {formatDate(comparison.createdAt)}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}

        {/* System Overview for Admin */}
        {isAdminView && (
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Icon name="analytics" size="20px" className="text-purple-500" />
              <h3 className="text-lg font-semibold text-foreground">
                System Analytics
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {statistics?.systemOverview?.totalUsers || 0}
                </div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {statistics?.systemOverview?.totalExperts || 0}
                </div>
                <div className="text-sm text-muted-foreground">Experts</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {statistics?.systemOverview?.totalComparisons || 0}
                </div>
                <div className="text-sm text-muted-foreground">Comparisons</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {(statistics?.systemOverview?.totalUserFrameworks || 0) +
                    (statistics?.systemOverview?.totalExpertFrameworks || 0)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Frameworks
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserStatistics;
