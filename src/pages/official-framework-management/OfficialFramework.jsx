import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Icon from "../../components/Icon";
import DataTable from "../../components/data-table/DataTable";
import UploadFrameworkModal from "./components/UploadFrameworkModal";
import UpdateFrameworkModal from "./components/UpdateFrameworkModal";
import DeleteOfficialFrameworkModal from "./components/DeleteOfficialFrameworkModal";
import UserMiniCard from "../../components/custom/UserMiniCard";
import FileTypeCard from "../../components/custom/FileTypeCard";
import ActionDropdown from "../../components/custom/ActionDropdown";
import {
  downloadOfficialFrameworkFile,
  getAllOfficialFrameworks,
  deleteOfficialFramework,
  uploadOfficialFrameworkToAi,
} from "../../services/officialFrameworkService";
import { formatDate } from "../../utils/dateFormatter";
import AiUploadStatusCard from "../../components/custom/AiUploadStatusCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/useAuth";
import { useTableData } from "../../components/data-table/hooks/useTableData";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

function OfficialFramework() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [frameworkToDelete, setFrameworkToDelete] = useState(null);
  const [frameworkToUpdate, setFrameworkToUpdate] = useState(null);

  // Use custom hook for table data management
  const {
    data: officialFramework,
    loading,
    emptyMessage,
    pagination,
    searchTerm,
    sortConfig,
    onSearch: handleSearch,
    onSort: handleSort,
    onFilterChange,
    refetch,
  } = useTableData(getAllOfficialFrameworks, {
    defaultLimit: 10,
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
    emptyMessage: "No official framework found",
  });

  /* ---------------- HANDLERS ---------------- */
  const handleStatusFilter = (status) => {
    onFilterChange("status", status);
  };

  const handleUploadSuccess = async () => {
    await refetch();
  };

  const handleUpdateFramework = (framework) => {
    setFrameworkToUpdate(framework);
    setUpdateModalOpen(true);
  };

  const handleUpdateSuccess = () => {
    refetch();
  };

  const handleDeleteFramework = (framework) => {
    setFrameworkToDelete(framework);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!frameworkToDelete) return;
    const fileId = frameworkToDelete.mainFileId;
    try {
      const result = await deleteOfficialFramework(fileId);
      toast.success(result.message || "Framework deleted successfully");
      refetch();
      setDeleteModalOpen(false);
      setFrameworkToDelete(null);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete framework");
      throw error;
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setFrameworkToDelete(null);
  };

  /* ---------------- UPLOAD TO AI ---------------- */
  const handleUploadToAi = async (row) => {
    if (!row.fileInfo?.versionFileId) {
      toast.error("File version ID not found");
      return;
    }

    try {
      const result = await uploadOfficialFrameworkToAi(
        row.fileInfo.versionFileId,
      );
      toast.success(result.message || "Framework uploaded to AI successfully");
      refetch();
    } catch (error) {
      console.error("Upload to AI error:", error);
      toast.error(error.message || "Failed to upload framework to AI");
      refetch();
      throw error;
    }
  };

  const handleDownloadFramework = async (row) => {
    if (!row.fileInfo?.versionFileId) return;

    try {
      await downloadOfficialFrameworkFile(
        row.fileInfo.versionFileId,
        row.fileInfo.originalFileName,
      );
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  /* ---------------- TABLE CONFIG ---------------- */
  const columns = [
    {
      key: "frameworkCode",
      label: "Framework Code",
      sortable: false,
      render: (value) => (
        <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
          {value}
        </span>
      ),
    },
    {
      key: "frameworkName",
      label: "Framework Name",
      sortable: false,
      render: (value) => (
        <span
          className="font-medium text-foreground line-clamp-1"
          title={value}
        >
          {value}
        </span>
      ),
    },
    {
      key: "frameworkType",
      label: "File Info",
      sortable: false,
      render: (value, row) => (
        <FileTypeCard
          fileType={value || row.frameworkType}
          fileSize={row.fileInfo?.fileSize}
          fileName={row.fileInfo?.originalFileName || row.frameworkName}
        />
      ),
    },
    {
      key: "aiUpload",
      label: "Ai Status",
      sortable: false,
      render: (value, row) => <AiUploadStatusCard aiUpload={row.aiUpload} />,
    },
    {
      key: "uploadedBy",
      label: "Uploaded By",
      sortable: false,
      render: (value, row) => {
        return (
          <UserMiniCard name={value.name} email={value.email} icon="user" />
        );
      },
    },
    {
      key: "createdAt",
      label: "Uploaded At",
      sortable: false,
      render: (value) => (
        <span className="text-sm whitespace-nowrap">{formatDate(value)}</span>
      ),
    },
  ];

  const renderActions = (row) => {
    const aiStatus = row.aiUpload?.status;

    const actions = [
      {
        id: `view-${row.id}`,
        label: "View Details",
        icon: "eye",
        className: "text-blue-600 hover:text-blue-600",
        onClick: () => navigate(`/official-frameworks/${row.id}`),
      },
      {
        id: `download-${row.fileInfo?.fileId}`,
        label: "Download",
        icon: "download",
        className: "text-green-600 hover:text-green-600",
        onClick: () => handleDownloadFramework(row),
      },

      ...(user.role === "expert"
        ? [
            {
              id: `edit-${row.mainFileId}`,
              label: "Edit Framework",
              icon: "edit",
              className: "text-primary hover:text-primary",
              onClick: () => handleUpdateFramework(row),
            },
            {
              id: `delete-${row.mainFileId}`,
              label: "Delete Framework",
              icon: "trash",
              className: "text-red-600 hover:text-red-600",
              onClick: () => handleDeleteFramework(row),
            },
          ]
        : []),
    ];

    // Add AI-specific actions only for expert users
    if (user.role === "expert") {
      if (!aiStatus) {
        actions.splice(0, 0, {
          id: `send-ai-${row.fileInfo?.versionFileId}`,
          label: "Send to AI",
          icon: "upload",
          className: "text-blue-600 hover:text-blue-600",
          onClick: () => handleUploadToAi(row),
        });
      } else if (aiStatus === "failed" || aiStatus === "skipped") {
        actions.splice(0, 0, {
          id: `retry-ai-${row.fileInfo?.versionFileId}`,
          label: "Retry AI Upload",
          icon: "refresh",
          className: "text-orange-600 hover:text-orange-600",
          onClick: () => handleUploadToAi(row),
        });
      } else if (aiStatus === "processing") {
        actions.splice(0, 0, {
          id: `ai-status-${row.fileInfo?.versionFileId}`,
          label: "AI Processing...",
          icon: "clock",
          className: "text-blue-600 hover:text-blue-600",
          disabled: true,
        });
      }
    }

    return (
      <div className="flex justify-center">
        <ActionDropdown actions={actions} />
      </div>
    );
  };

  const renderHeaderButtons = () => {
    // Get status from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const statusFilter = urlParams.get("status") || "";

    return (
      <>
        {/* Status Filter */}
        {user.role === "expert" && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                className="w-[120px] justify-between border-border dark:border-gray-600 dark:hover:border-gray-500 dark:bg-gray-800 text-muted-foreground dark:hover:bg-gray-700"
              >
                {statusFilter
                  ? statusFilter === "uploaded"
                    ? "Uploaded"
                    : statusFilter === "failed"
                      ? "Failed"
                      : statusFilter === "skipped"
                        ? "Skipped"
                        : statusFilter === "processing"
                          ? "Processing"
                          : statusFilter === "completed"
                            ? "Completed"
                            : "All Status"
                  : "All Status"}
                <ChevronDown className="h-4 w-4 opacity-50 dark:text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[120px] border-border dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200">
              <DropdownMenuItem
                onClick={() => handleStatusFilter("")}
                className="cursor-pointer dark:focus:bg-gray-700 dark:focus:text-white"
              >
                All Status
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusFilter("uploaded")}
                className="cursor-pointer dark:focus:bg-gray-700 dark:focus:text-white"
              >
                Uploaded
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusFilter("failed")}
                className="cursor-pointer dark:focus:bg-gray-700 dark:focus:text-white"
              >
                Failed
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusFilter("skipped")}
                className="cursor-pointer dark:focus:bg-gray-700 dark:focus:text-white"
              >
                Skipped
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusFilter("processing")}
                className="cursor-pointer dark:focus:bg-gray-700 dark:focus:text-white"
              >
                Processing
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusFilter("completed")}
                className="cursor-pointer dark:focus:bg-gray-700 dark:focus:text-white"
              >
                Completed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {user.role === "expert" && (
          <Button
            size="lg"
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-3"
          >
            <Icon name="plus" size="18px" />
            Add New Framework
          </Button>
        )}
      </>
    );
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="mt-5 pb-5">
      {/* Data Table */}
      <DataTable
        columns={columns}
        data={officialFramework}
        loading={loading}
        onSearch={handleSearch}
        onSort={handleSort}
        sortConfig={sortConfig}
        searchTerm={searchTerm}
        pagination={pagination}
        renderActions={renderActions}
        renderHeaderActions={renderHeaderButtons}
        searchPlaceholder="Search framework name, code, or uploader..."
        emptyMessage={emptyMessage}
      />

      {/* Upload Framework Modal */}
      <UploadFrameworkModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />

      {/* Update Framework Modal */}
      <UpdateFrameworkModal
        isOpen={updateModalOpen}
        onClose={() => {
          setUpdateModalOpen(false);
          setFrameworkToUpdate(null);
        }}
        onSuccess={handleUpdateSuccess}
        framework={frameworkToUpdate}
      />

      {/* Delete Framework Modal */}
      {deleteModalOpen && frameworkToDelete && (
        <DeleteOfficialFrameworkModal
          framework={frameworkToDelete}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </div>
  );
}

export default OfficialFramework;
