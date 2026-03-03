import { Button } from "@/components/ui/button";
import Icon from "../../../../components/Icon";
import { formatDate } from "../../../../utils/dateFormatter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="lg:max-w-4xl">
        <DialogHeader className="flex flex-row items-center justify-between bg-linear-to-br from-primary to-primary/80 text-white py-4">
          <div className="flex items-center gap-3">
            <Icon name="eye" size="24px" />
            <DialogTitle className="text-xl font-bold text-white drop-shadow-sm">
              Framework Access Details
            </DialogTitle>
            <DialogDescription className="sr-only">
              View detailed information about framework access record
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="p-3 space-y-8 overflow-y-auto sidebar-scroll max-h-[70vh]">
          {/* Record Information */}
          <section className="bg-muted/50 rounded p-5">
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
          <section className="bg-muted/50 rounded p-5">
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
          <section className="bg-muted/50 rounded p-5">
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
          <section className="bg-muted/50 rounded p-5">
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
            </div>
          </section>

          {/* Admin Action Information - Only show for rejected/approved/revoked records */}
          {(accessRecord.status === "rejected" ||
            accessRecord.status === "approved" ||
            accessRecord.status === "revoked") && (
            <section className="bg-muted/50 rounded p-5">
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
                          Role
                        </p>
                        <p className="text-sm capitalize text-foreground">
                          {accessRecord.approval.approvedBy?.role || "-"}
                        </p>
                      </div>
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
                          Role
                        </p>
                        <p className="text-sm capitalize text-foreground">
                          {accessRecord.rejection.rejectedBy?.role || "-"}
                        </p>
                      </div>
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
                          Role
                        </p>
                        <p className="text-sm capitalize text-foreground">
                          {accessRecord.revocation.revokedBy?.role || "-"}
                        </p>
                      </div>
                    </>
                  )}
              </div>
            </section>
          )}

          {/* Timestamps */}
          <section className="bg-muted/50 rounded p-5">
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
      </DialogContent>
    </Dialog>
  );
}
