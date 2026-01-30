import { useState } from "react";
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
        className="bg-background rounded-2xl shadow-2xl max-w-[700px] w-[90%] max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-5 duration-300 sidebar-scroll"
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

        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex justify-center">
            <span
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusStyle(accessRecord.status)}`}
            >
              {accessRecord.status?.charAt(0).toUpperCase() +
                accessRecord.status?.slice(1)}
            </span>
          </div>

          {/* Expert Information */}
          <div className="bg-muted/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Icon name="user" size="20px" className="text-primary" />
              Expert Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Name
                </label>
                <p className="text-foreground font-medium">
                  {accessRecord.expert?.name}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Email
                </label>
                <p className="text-foreground">{accessRecord.expert?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Role
                </label>
                <p className="text-foreground capitalize">
                  {accessRecord.expert?.role}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Expert ID
                </label>
                <p className="text-foreground font-mono text-sm">
                  {accessRecord.expert?.id}
                </p>
              </div>
            </div>
          </div>

          {/* Framework Information */}
          <div className="bg-muted/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Icon name="shield" size="20px" className="text-primary" />
              Framework Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Framework Name
                </label>
                <p className="text-foreground font-medium">
                  {accessRecord.frameworkCategory?.frameworkCategoryName}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Framework Code
                </label>
                <p className="text-foreground font-mono bg-muted px-2 py-1 rounded text-sm inline-block">
                  {accessRecord.frameworkCategory?.frameworkCode}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Description
                </label>
                <p className="text-foreground">
                  {accessRecord.frameworkCategory?.description}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Framework ID
                </label>
                <p className="text-foreground font-mono text-sm">
                  {accessRecord.frameworkCategory?.frameworkId}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Status
                </label>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
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
          </div>

          {/* Request Information */}
          <div className="bg-muted/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Icon
                name="message-square"
                size="20px"
                className="text-primary"
              />
              Request Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Request Message
                </label>
                <p className="text-foreground">
                  {accessRecord.requestMessage || "-"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Requested By
                </label>
                <p className="text-foreground capitalize">
                  {accessRecord.requestedBy}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Created At
                </label>
                <p className="text-foreground">
                  {formatDate(accessRecord.createdAt)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Last Updated
                </label>
                <p className="text-foreground">
                  {formatDate(accessRecord.updatedAt)}
                </p>
              </div>
            </div>
            {accessRecord.adminNotes && (
              <div className="mt-4">
                <label className="text-sm font-medium text-muted-foreground">
                  Admin Notes
                </label>
                <p className="text-foreground bg-muted p-3 rounded-lg mt-1">
                  {accessRecord.adminNotes}
                </p>
              </div>
            )}
          </div>

          {/* Action Information - Show based on status */}
          {(accessRecord.approval ||
            accessRecord.rejection ||
            accessRecord.revocation) && (
            <div className="bg-muted/50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Icon name="activity" size="20px" className="text-primary" />
                Action Information
              </h3>

              {/* Approval Information */}
              {accessRecord.approval && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon
                      name="check-circle"
                      size="16px"
                      className="text-green-600"
                    />
                    <span className="font-medium text-green-600">Approved</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Approved By
                      </label>
                      <p className="text-foreground font-medium">
                        {accessRecord.approval.approvedBy?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {accessRecord.approval.approvedBy?.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Approved At
                      </label>
                      <p className="text-foreground">
                        {formatDate(accessRecord.approval.approvedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Rejection Information */}
              {accessRecord.rejection && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon
                      name="x-circle"
                      size="16px"
                      className="text-red-600"
                    />
                    <span className="font-medium text-red-600">Rejected</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Rejected By
                      </label>
                      <p className="text-foreground font-medium">
                        {accessRecord.rejection.rejectedBy?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {accessRecord.rejection.rejectedBy?.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Rejected At
                      </label>
                      <p className="text-foreground">
                        {formatDate(accessRecord.rejection.rejectedAt)}
                      </p>
                    </div>
                  </div>
                  {accessRecord.rejection.rejectionReason && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Rejection Reason
                      </label>
                      <p className="text-foreground bg-red-50 dark:bg-red-900/20 p-3 rounded-lg mt-1">
                        {accessRecord.rejection.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Revocation Information */}
              {accessRecord.revocation && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon
                      name="user-minus"
                      size="16px"
                      className="text-orange-600"
                    />
                    <span className="font-medium text-orange-600">Revoked</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Revoked By
                      </label>
                      <p className="text-foreground font-medium">
                        {accessRecord.revocation.revokedBy?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {accessRecord.revocation.revokedBy?.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Revoked At
                      </label>
                      <p className="text-foreground">
                        {formatDate(accessRecord.revocation.revokedAt)}
                      </p>
                    </div>
                  </div>
                  {accessRecord.revocation.revocationReason && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Revocation Reason
                      </label>
                      <p className="text-foreground bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg mt-1">
                        {accessRecord.revocation.revocationReason}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Record Metadata */}
          <div className="bg-muted/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Icon name="info" size="20px" className="text-primary" />
              Record Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Record ID
                </label>
                <p className="text-foreground font-mono text-sm">
                  {accessRecord.id}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Current Status
                </label>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(accessRecord.status)}`}
                >
                  {accessRecord.status?.charAt(0).toUpperCase() +
                    accessRecord.status?.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end p-6 border-t border-border">
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
