import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Icon from "../../components/Icon";
import DataTable from "../../components/data-table/DataTable";
import UploadCompanyFrameworkModal from "./components/UploadCompanyFrameworkModal";
import UpdateCompanyFrameworkModal from "./components/UpdateCompanyFrameworkModal";
import DeleteCompanyFrameworkModal from "./components/DeleteCompanyFrameworkModal";
import UserMiniCard from "../../components/custom/UserMiniCard";
import FileTypeCard from "../../components/custom/FileTypeCard";
import ActionDropdown from "../../components/custom/ActionDropdown";
import {
  downloadCompanyFrameworkFile,
  getAllCompanyFrameworks,
  deleteCompanyFramework,
  uploadCompanyFrameworkToAi,
} from "../../services/companyFrameworkService";
import { formatDate } from "../../utils/dateFormatter";
import AiUploadStatusCard from "../../components/custom/AiUploadStatusCard";
import SelectDropdown from "../../components/custom/SelectDropdown";
import { Button } from "@/components/ui/button";
import { useTableData } from "../../components/data-table/hooks/useTableData";

function CompanyFramework() {
  const navigate = useNavigate();

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [frameworkToDelete, setFrameworkToDelete] = useState(null);
  const [frameworkToUpdate, setFrameworkToUpdate] = useState(null);

  // Use custom hook for table data management
  const {
    data: companyFramework,
    loading,
    emptyMessage,
    pagination,
    searchTerm,
    sortConfig,
    onSearch: handleSearch,
    onSort: handleSort,
    onFilterChange,
    refetch,
  } = useTableData(getAllCompanyFrameworks, {
    defaultLimit: 10,
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
    emptyMessage: "No company framework found",
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
      const result = await deleteCompanyFramework(fileId);
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
      const result = await uploadCompanyFrameworkToAi(
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
      await downloadCompanyFrameworkFile(
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
        onClick: () => navigate(`/frameworks/${row.id}`),
      },
      {
        id: `download-${row.fileInfo?.fileId}`,
        label: "Download",
        icon: "download",
        className: "text-green-600 hover:text-green-600",
        onClick: () => handleDownloadFramework(row),
      },
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
    ];

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

    return (
      <div className="flex justify-center">
        <ActionDropdown actions={actions} />
      </div>
    );
  };

  const renderHeaderButtons = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const statusFilter = urlParams.get("status") || "";

    return (
      <>
        <SelectDropdown
          value={statusFilter}
          onChange={handleStatusFilter}
          options={[
            { value: "", label: "All Status" },
            { value: "uploaded", label: "Uploaded" },
            { value: "failed", label: "Failed" },
            { value: "skiped", label: "Skiped" },
            { value: "processing", label: "Processing" },
            { value: "completed", label: "Completed" },
          ]}
          placeholder="All Status"
          size="lg"
          variant="default"
        />
        <Button
          size="lg"
          onClick={() => setUploadModalOpen(true)}
          className="flex items-center gap-3"
        >
          <Icon name="plus" size="18px" />
          Add New Framework
        </Button>
      </>
    );
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="mt-5 pb-5">
      <DataTable
        columns={columns}
        data={companyFramework}
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

      <UploadCompanyFrameworkModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />

      <UpdateCompanyFrameworkModal
        isOpen={updateModalOpen}
        onClose={() => {
          setUpdateModalOpen(false);
          setFrameworkToUpdate(null);
        }}
        onSuccess={handleUpdateSuccess}
        framework={frameworkToUpdate}
      />

      {deleteModalOpen && frameworkToDelete && (
        <DeleteCompanyFrameworkModal
          framework={frameworkToDelete}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </div>
  );
}

export default CompanyFramework;
