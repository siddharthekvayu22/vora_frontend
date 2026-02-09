import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import Icon from "../../components/Icon";
import DataTable from "../../components/data-table/DataTable";
import UploadFrameworkModal from "./components/UploadFrameworkModal";
import UpdateFrameworkModal from "./components/UpdateFrameworkModal";
import DeleteOfficialFrameworkModal from "./components/DeleteOfficialFrameworkModal";
import UserMiniCard from "../../components/custom/UserMiniCard";
import FileTypeCard from "../../components/custom/FileTypeCard";
import {
  downloadOfficialFrameworkFile,
  getAllOfficialFrameworks,
  deleteOfficialFramework,
} from "../../services/officialFrameworkService";
import { formatDate } from "../../utils/dateFormatter";

function OfficialFramework() {
  const [officialFramework, setOfficialFramework] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emptyMessage, setEmptyMessage] = useState(
    "No official framework found",
  );
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [frameworkToDelete, setFrameworkToDelete] = useState(null);
  const [frameworkToUpdate, setFrameworkToUpdate] = useState(null);

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

  const [downloadingId, setDownloadingId] = useState(null);

  /* ---------------- URL SYNC ---------------- */
  useEffect(() => {
    const page = parseInt(searchParams.get("page")) || 1;
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    setPagination((p) => ({ ...p, currentPage: page }));
    setSearchTerm(search);
    setSortConfig({ sortBy, sortOrder });
  }, [searchParams]);

  /* ---------------- FETCH DATA ---------------- */
  const fetchOfficialFramework = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllOfficialFrameworks({
        page: pagination.currentPage,
        limit: pagination.limit,
        search: searchTerm,
        sortBy: sortConfig.sortBy,
        sortOrder: sortConfig.sortOrder,
      });

      setOfficialFramework(res.data || []);

      if (res.message && res.data?.length === 0) {
        setEmptyMessage(res.message);
      } else if (searchTerm && res.data?.length === 0) {
        setEmptyMessage(`No framework found for "${searchTerm}"`);
      } else {
        setEmptyMessage("No official framework found");
      }

      setPagination((p) => ({
        ...p,
        totalPages: res.pagination?.totalPages || 1,
        totalItems: res.pagination?.totalItems || 0,
        hasPrevPage: pagination.currentPage > 1,
        hasNextPage: pagination.currentPage < (res.pagination?.totalPages || 1),
      }));
    } catch (err) {
      toast.error(err.message || "Failed to load official framework");
      setOfficialFramework([]);
      setEmptyMessage("Failed to load official framework");
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.limit, searchTerm, sortConfig]);

  useEffect(() => {
    fetchOfficialFramework();
  }, [fetchOfficialFramework]);

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

  const handleUploadSuccess = () => {
    // Refresh the framework list after successful upload
    fetchOfficialFramework();
  };

  const handleUpdateFramework = (framework) => {
    setFrameworkToUpdate(framework);
    setUpdateModalOpen(true);
  };

  const handleUpdateSuccess = () => {
    // Refresh the framework list after successful update
    fetchOfficialFramework();
  };

  const handleDeleteFramework = (framework) => {
    setFrameworkToDelete(framework);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!frameworkToDelete) return;
    const fileId = frameworkToDelete.fileInfo.fileId;
    try {
      const result = await deleteOfficialFramework(fileId);
      toast.success(result.message || "Framework deleted successfully");
      fetchOfficialFramework(); // Refresh the list
      setDeleteModalOpen(false);
      setFrameworkToDelete(null);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete framework");
      throw error; // Re-throw to let modal handle loading state
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setFrameworkToDelete(null);
  };

  const handleDownloadFramework = async (row) => {
    if (!row.fileInfo?.fileId) return;

    try {
      setDownloadingId(row.fileInfo.fileId);

      await downloadOfficialFrameworkFile(
        row.fileInfo.fileId,
        row.fileInfo.originalFileName,
      );
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDownloadingId(null);
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
        <span className="font-medium text-foreground line-clamp-1">
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
    const isDownloading = downloadingId === row.fileInfo?.fileId;

    return (
      <div className="flex gap-1 justify-center">
        <button
          className={`px-3 py-2 rounded-full transition-all duration-200 cursor-pointer
          ${
            isDownloading
              ? "text-green-400 opacity-60 cursor-not-allowed"
              : "hover:bg-green-50 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 hover:scale-105"
          }`}
          title="Download Framework"
          disabled={isDownloading}
          onClick={() => handleDownloadFramework(row)}
        >
          {isDownloading ? (
            <div className="w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
          ) : (
            <Icon name="download" size="16px" />
          )}
        </button>
        <button
          className="px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full transition-all duration-200 hover:scale-105 cursor-pointer"
          title="Edit Framework"
          onClick={() => handleUpdateFramework(row)}
        >
          <Icon name="edit" size="16px" />
        </button>
        <button
          className="px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full transition-all duration-200 hover:scale-105 cursor-pointer"
          title="Delete Framework"
          onClick={() => handleDeleteFramework(row)}
        >
          <Icon name="trash" size="16px" />
        </button>
      </div>
    );
  };

  const renderHeaderButtons = () => (
    <button
      onClick={() => setUploadModalOpen(true)}
      className="flex items-center gap-3 px-5 py-3 bg-primary text-primary-foreground rounded-lg hover:shadow-lg hover:scale-[102%] transition-all duration-200 font-medium text-xs cursor-pointer"
    >
      <Icon name="plus" size="18px" />
      Add New Framework
    </button>
  );

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
        pagination={{ ...pagination, onPageChange: handlePageChange }}
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
