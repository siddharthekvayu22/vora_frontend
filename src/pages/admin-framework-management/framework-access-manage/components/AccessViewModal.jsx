import Icon from "../../../../components/Icon";
import { formatDate } from "../../../../utils/dateFormatter";

/**
 * AccessViewModal Component - Displays detailed information for framework access records
 * Works for both approved access and access requests
 *
 * @param {Object} accessRecord - Access record data
 * @param {Function} onClose - Close handler
 */
export default function AccessViewModal({ accessRecord, onClose }) {
  if (!accessRecord) return null;

  const getStatusStyle = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "revoked":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000] animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-2xl shadow-2xl max-w-[900px] w-[90%] max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-5 duration-300 sidebar-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-primary to-primary/80 text-white p-6 relative overflow-hidden min-h-[80px]">
          <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-white/10 rounded-full transform translate-x-[40%] -translate-y-[40%]"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="eye" size="24px" />
              <h2 className="text-xl font-bold text-white drop-shadow-sm">
                Framework Access Details
              </h2>
            </div>
            <button
              className="bg-white/10 border border-white/20 text-white backdrop-blur-sm rounded-full w-9 h-9 flex items-center justify-center hover:bg-white/20 hover:border-white/40 hover:scale-105 transition-all duration-200"
              onClick={onClose}
              title="Close"
            >
              <Icon name="x" size="20px" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Record Information */}
          <section className="bg-muted/50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-foreground mb-5 flex items-center gap-2">
              <Icon name="info" size="18px" className="text-primary" />
              Record Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Record ID
                </p>
                <p className="text-sm font-mono text-muted-foreground break-all">
                  {accessRecord.id}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Current Status
                </p>
                <span
                  className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                    accessRecord.status,
                  )}`}
                >
                  {accessRecord.status?.charAt(0).toUpperCase() +
                    accessRecord.status?.slice(1)}
                </span>
              </div>
            </div>
          </section>

          {/* Expert Information */}
          <section className="bg-muted/50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-foreground mb-5 flex items-center gap-2">
              <Icon name="user" size="18px" className="text-primary" />
              Expert Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Name
                </p>
                <p className="text-sm font-medium text-foreground">
                  {accessRecord.expert?.name}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Email
                </p>
                <p className="text-sm text-foreground">
                  {accessRecord.expert?.email}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Role
                </p>
                <p className="text-sm capitalize text-foreground">
                  {accessRecord.expert?.role}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Expert ID
                </p>
                <p className="text-sm font-mono text-muted-foreground break-all">
                  {accessRecord.expert?.id}
                </p>
              </div>
            </div>
          </section>

          {/* Framework Information */}
          <section className="bg-muted/50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-foreground mb-5 flex items-center gap-2">
              <Icon name="shield" size="18px" className="text-primary" />
              Framework Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Framework Name
                </p>
                <p className="text-sm font-medium text-foreground">
                  {accessRecord.frameworkCategory?.frameworkCategoryName}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Framework Code
                </p>
                <p className="text-sm font-mono text-foreground bg-muted px-2 py-1 rounded inline-block">
                  {accessRecord.frameworkCategory?.frameworkCode}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Description
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  {accessRecord.frameworkCategory?.description || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Framework ID
                </p>
                <p className="text-sm font-mono text-muted-foreground break-all">
                  {accessRecord.frameworkCategory?.frameworkId}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Status
                </p>
                <span
                  className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                    accessRecord.frameworkCategory?.isActive
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {accessRecord.frameworkCategory?.isActive
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>
            </div>
          </section>

          {/* Request Information */}
          <section className="bg-muted/50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-foreground mb-5 flex items-center gap-2">
              <Icon
                name="message-square"
                size="18px"
                className="text-primary"
              />
              Request Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Requested By
                </p>
                <p className="text-sm capitalize text-foreground">
                  {accessRecord.requestedBy || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Request Date
                </p>
                <p className="text-sm text-foreground">
                  {accessRecord.createdAt
                    ? formatDate(accessRecord.createdAt)
                    : "-"}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Request Message
                </p>
                <div className="bg-background border border-border rounded-lg p-3">
                  <p className="text-sm text-foreground leading-relaxed">
                    {accessRecord.requestMessage || "-"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Admin Action Information - Only show for rejected/approved/revoked records */}
          {(accessRecord.status === "rejected" ||
            accessRecord.status === "approved" ||
            accessRecord.status === "revoked") && (
            <section className="bg-muted/50 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-foreground mb-5 flex items-center gap-2">
                <Icon name="user-check" size="18px" className="text-primary" />
                Admin Action
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Approved Records */}
                {accessRecord.status === "approved" &&
                  accessRecord.approval && (
                    <>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Approved By
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {accessRecord.approval.approvedBy?.name || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Approval Date
                        </p>
                        <p className="text-sm text-foreground">
                          {accessRecord.approval.approvedAt
                            ? formatDate(accessRecord.approval.approvedAt)
                            : "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Admin Email
                        </p>
                        <p className="text-sm text-foreground">
                          {accessRecord.approval.approvedBy?.email || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Admin Role
                        </p>
                        <p className="text-sm capitalize text-foreground">
                          {accessRecord.approval.approvedBy?.role || "-"}
                        </p>
                      </div>

                      {accessRecord.adminApproveMessage && (
                        <div className="sm:col-span-2">
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Approval Message
                          </p>
                          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                            <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
                              {accessRecord.adminApproveMessage}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                {/* Rejected Records */}
                {accessRecord.status === "rejected" &&
                  accessRecord.rejection && (
                    <>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Rejected By
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {accessRecord.rejection.rejectedBy?.name || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Rejection Date
                        </p>
                        <p className="text-sm text-foreground">
                          {accessRecord.rejection.rejectedAt
                            ? formatDate(accessRecord.rejection.rejectedAt)
                            : "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Admin Email
                        </p>
                        <p className="text-sm text-foreground">
                          {accessRecord.rejection.rejectedBy?.email || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Admin Role
                        </p>
                        <p className="text-sm capitalize text-foreground">
                          {accessRecord.rejection.rejectedBy?.role || "-"}
                        </p>
                      </div>

                      {accessRecord.adminRejectMessage && (
                        <div className="sm:col-span-2">
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Rejection Message
                          </p>
                          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                            <p className="text-sm text-red-800 dark:text-red-200 leading-relaxed">
                              {accessRecord.adminRejectMessage}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                {/* Revoked Records */}
                {accessRecord.status === "revoked" &&
                  accessRecord.revocation && (
                    <>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Revoked By
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {accessRecord.revocation.revokedBy?.name || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Revocation Date
                        </p>
                        <p className="text-sm text-foreground">
                          {accessRecord.revocation.revokedAt
                            ? formatDate(accessRecord.revocation.revokedAt)
                            : "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Admin Email
                        </p>
                        <p className="text-sm text-foreground">
                          {accessRecord.revocation.revokedBy?.email || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Admin Role
                        </p>
                        <p className="text-sm capitalize text-foreground">
                          {accessRecord.revocation.revokedBy?.role || "-"}
                        </p>
                      </div>

                      {accessRecord.adminRevokeMessage && (
                        <div className="sm:col-span-2">
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Revocation Message
                          </p>
                          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                            <p className="text-sm text-orange-800 dark:text-orange-200 leading-relaxed">
                              {accessRecord.adminRevokeMessage}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
              </div>
            </section>
          )}

          {/* Timestamps */}
          <section className="bg-muted/50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-foreground mb-5 flex items-center gap-2">
              <Icon name="clock" size="18px" className="text-primary" />
              Timeline
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Created At
                </p>
                <p className="text-sm text-foreground">
                  {accessRecord.createdAt
                    ? formatDate(accessRecord.createdAt)
                    : "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Last Updated
                </p>
                <p className="text-sm text-foreground">
                  {accessRecord.updatedAt
                    ? formatDate(accessRecord.updatedAt)
                    : "-"}
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="flex justify-end p-3 border-t border-border">
          <button
            type="button"
            className="px-6 py-2 text-sm font-semibold rounded-lg bg-muted text-foreground border-2 border-border hover:bg-muted/80 transition-all duration-200"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
