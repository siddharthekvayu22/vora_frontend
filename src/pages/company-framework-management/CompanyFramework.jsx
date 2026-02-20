import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useSearchParams, useNavigate } from "react-router-dom";
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

function CompanyFramework() {
  const navigate = useNavigate();
  const [companyFramework, setCompanyFramework] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emptyMessage, setEmptyMessage] = useState(
    "No company framework found",
  );
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [frameworkToDelete, setFrameworkToDelete] = useState(null);
  const [frameworkToUpdate, setFrameworkToUpdate] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
    hasPrevPage: false,
    hasNextPage: false,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  /* ---------------- URL SYNC ---------------- */
  useEffect(() => {
    const page = parseInt(searchParams.get("page")) || 1;
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const status = searchParams.get("status") || "";

    setPagination((p) => ({ ...p, currentPage: page }));
    setSearchTerm(search);
    setStatusFilter(status);
    setSortConfig({ sortBy, sortOrder });
  }, [searchParams]);

  /* ---------------- FETCH DATA ---------------- */
  const fetchCompanyFramework = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllCompanyFrameworks({
        page: pagination.currentPage,
        limit: pagination.limit,
        search: searchTerm,
        sortBy: sortConfig.sortBy,
        sortOrder: sortConfig.sortOrder,
        status: statusFilter,
      });

      setCompanyFramework(res.data || []);

      if (res.message && res.data?.length === 0) {
        setEmptyMessage(res.message);
      } else if (searchTerm && res.data?.length === 0) {
        setEmptyMessage(`No framework found for "${searchTerm}"`);
      } else {
        setEmptyMessage("No company framework found");
      }

      setPagination((p) => ({
        ...p,
        totalPages: res.pagination?.totalPages || 1,
        totalItems: res.pagination?.totalItems || 0,
        hasPrevPage: pagination.currentPage > 1,
        hasNextPage: pagination.currentPage < (res.pagination?.totalPages || 1),
      }));

      return res.data || [];
    } catch (err) {
      toast.error(err.message || "Failed to load company framework");
      setCompanyFramework([]);
      setEmptyMessage("Failed to load company framework");
      return [];
    } finally {
      setLoading(false);
    }
  }, [
    pagination.currentPage,
    pagination.limit,
    searchTerm,
    sortConfig,
    statusFilter,
  ]);

  useEffect(() => {
    fetchCompanyFramework();
  }, [fetchCompanyFramework]);

  /* ---------------- HANDLERS ---------------- */
  const handlePageChange = (page) => {
    const p = new URLSearchParams(searchParams);
    p.set("page", page);
    setSearchParams(p);
  };

  const handleSearch = (term) => {
    const p = new URLSearchParams(searchParams);
    term ? p.set("search", term) : p.delete("search");
    p.set("page", "1");
    setSearchParams(p);
  };

  const handleSort = (key) => {
    const order =
      sortConfig.sortBy === key && sortConfig.sortOrder === "asc"
        ? "desc"
        : "asc";

    const p = new URLSearchParams(searchParams);
    p.set("sortBy", key);
    p.set("sortOrder", order);
    p.set("page", "1");
    setSearchParams(p);

    setSortConfig({ sortBy: key, sortOrder: order });
  };

  const handleStatusFilter = (status) => {
    const p = new URLSearchParams(searchParams);
    status ? p.set("status", status) : p.delete("status");
    p.set("page", "1");
    setSearchParams(p);
  };

  const handleUploadSuccess = async () => {
    const maxRetries = 5;
    const retryDelay = 500;

    const previousCount = companyFramework.length;

    for (let retryCount = 0; retryCount < maxRetries; retryCount++) {
      const data = await fetchCompanyFramework();

      if (data.length > previousCount) {
        return;
      }

      if (retryCount < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }

    await fetchCompanyFramework();
  };

  const handleUpdateFramework = (framework) => {
    setFrameworkToUpdate(framework);
    setUpdateModalOpen(true);
  };

  const handleUpdateSuccess = () => {
    fetchCompanyFramework();
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
      fetchCompanyFramework();
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
      fetchCompanyFramework();
    } catch (error) {
      console.error("Upload to AI error:", error);
      toast.error(error.message || "Failed to upload framework to AI");
      fetchCompanyFramework();
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
          onClick={() => setUploadModalOpen(true)}
          className="flex items-center gap-3 px-5 py-3 "
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
        pagination={{ ...pagination, onPageChange: handlePageChange }}
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
