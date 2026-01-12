import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  File,
  FileText,
  FileSpreadsheet,
  FileBarChart,
  FileArchive,
  Presentation,
} from "lucide-react";
import { FaRegFilePdf, FaRegFileWord } from "react-icons/fa6";
import { BsFiletypeDocx, BsFiletypeXls } from "react-icons/bs";
import { BsFiletypeCsv } from "react-icons/bs";
import { AiOutlineFilePpt } from "react-icons/ai";
import { useAuth } from "../../context/useAuth";
import { formatDate } from "../../utils/dateFormatter";
import DataTable from "../../components/data-table/DataTable";
import FrameworkModal from "./components/FrameworkModal";
import DeleteFrameworkModal from "./components/DeleteFrameworkModal";
import Icon from "../../components/Icon";
import { useWebSocket } from "../../hooks/useWebSocket";
import {
  getAllFrameworks,
  getMyFrameworks,
  uploadFramework,
  deleteFramework,
  updateFramework,
  updateFrameworkWithFile,
  downloadFramework,
} from "../../services/frameworkService";

function Frameworks() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const userRole = user?.role || "expert";

  // WebSocket integration
  const { connect, disconnect, subscribe } = useWebSocket();

  const [frameworks, setFrameworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("all"); // "all" or "my"

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

  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: "view",
    framework: null,
  });

  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    framework: null,
  });

  /* ---------------- URL SYNC ---------------- */
  useEffect(() => {
    const page = parseInt(searchParams.get("page")) || 1;
    const search = searchParams.get("search") || "";
    const mode = searchParams.get("view") || "all";

    setPagination((p) => ({ ...p, currentPage: page }));
    setSearchTerm(search);
    setViewMode(mode);
  }, [searchParams]);

  /* ---------------- FETCH FRAMEWORKS ---------------- */
  const fetchFrameworks = useCallback(async () => {
    setLoading(true);
    try {
      const apiCall = viewMode === "my" ? getMyFrameworks : getAllFrameworks;
      const res = await apiCall({
        page: pagination.currentPage,
        limit: pagination.limit,
        search: searchTerm,
        userRole: userRole,
      });

      // Handle different possible response structures
      let frameworksArray = [];
      if (Array.isArray(res)) {
        frameworksArray = res;
      } else if (res.data && Array.isArray(res.data)) {
        frameworksArray = res.data;
      } else if (res.frameworks && Array.isArray(res.frameworks)) {
        frameworksArray = res.frameworks;
      } else if (
        res.data &&
        res.data.frameworks &&
        Array.isArray(res.data.frameworks)
      ) {
        frameworksArray = res.data.frameworks;
      }

      setFrameworks(frameworksArray);

      // Handle pagination
      const paginationData = res.pagination || res.data?.pagination || {};
      setPagination((p) => ({
        ...p,
        totalPages: paginationData.totalPages || 1,
        totalItems: paginationData.totalItems || frameworksArray.length,
        hasPrevPage: pagination.currentPage > 1,
        hasNextPage: pagination.currentPage < (paginationData.totalPages || 1),
      }));
    } catch (err) {
      toast.error(err.message || "Failed to load frameworks");
      setFrameworks([]);
    } finally {
      setLoading(false);
    }
  }, [
    pagination.currentPage,
    pagination.limit,
    searchTerm,
    viewMode,
    userRole,
  ]);

  /* ---------------- WEBSOCKET INTEGRATION ---------------- */
  // Create a stable reference for the refresh function
  const refreshFrameworksList = useCallback(() => {
    // Create a new function that captures current values
    const doRefresh = async () => {
      setLoading(true);
      try {
        const apiCall = viewMode === "my" ? getMyFrameworks : getAllFrameworks;
        const res = await apiCall({
          page: pagination.currentPage,
          limit: pagination.limit,
          search: searchTerm,
          userRole: userRole,
        });

        // Handle different possible response structures
        let frameworksArray = [];
        if (Array.isArray(res)) {
          frameworksArray = res;
        } else if (res.data && Array.isArray(res.data)) {
          frameworksArray = res.data;
        } else if (res.frameworks && Array.isArray(res.frameworks)) {
          frameworksArray = res.frameworks;
        } else if (
          res.data &&
          res.data.frameworks &&
          Array.isArray(res.data.frameworks)
        ) {
          frameworksArray = res.data.frameworks;
        }

        setFrameworks(frameworksArray);

        // Handle pagination
        const paginationData = res.pagination || res.data?.pagination || {};
        setPagination((p) => ({
          ...p,
          totalPages: paginationData.totalPages || 1,
          totalItems: paginationData.totalItems || frameworksArray.length,
          hasPrevPage: pagination.currentPage > 1,
          hasNextPage:
            pagination.currentPage < (paginationData.totalPages || 1),
        }));
      } catch (err) {
        toast.error(err.message || "Failed to load frameworks");
        setFrameworks([]);
      } finally {
        setLoading(false);
      }
    };

    // Use timeout to prevent immediate re-renders
    setTimeout(doRefresh, 100);
  }, []); // Empty dependency array to make it stable

  useEffect(() => {
    let unsubscribeRefresh;
    let unsubscribeAI;

    if (token) {
      // Connect to WebSocket
      connect(token).catch((error) => {
        console.error("Failed to connect to WebSocket:", error);
      });

      // Subscribe to framework list refresh messages
      unsubscribeRefresh = subscribe(
        "framework-list-refresh",
        refreshFrameworksList
      );

      // Subscribe to AI processing messages to update individual frameworks
      unsubscribeAI = subscribe("framework-ai-processing", (message) => {
        const {
          frameworkId,
          status,
          control_extraction_status,
          controlsCount,
        } = message;

        setFrameworks((prevFrameworks) =>
          prevFrameworks.map((framework) => {
            if (framework.id === frameworkId || framework._id === frameworkId) {
              return {
                ...framework,
                aiProcessing: {
                  ...framework.aiProcessing,
                  status,
                  control_extraction_status,
                  controlsCount:
                    controlsCount || framework.aiProcessing?.controlsCount || 0,
                },
              };
            }
            return framework;
          })
        );
      });
    }

    return () => {
      if (unsubscribeRefresh) unsubscribeRefresh();
      if (unsubscribeAI) unsubscribeAI();
      if (token) disconnect();
    };
  }, [token, refreshFrameworksList]); // Only depend on token and stable refresh function

  /* ---------------- URL SYNC ---------------- */
  useEffect(() => {
    const page = parseInt(searchParams.get("page")) || 1;
    const search = searchParams.get("search") || "";
    const mode = searchParams.get("view") || "all";

    setPagination((p) => ({ ...p, currentPage: page }));
    setSearchTerm(search);
    setViewMode(mode);
  }, [searchParams]);

  useEffect(() => {
    fetchFrameworks();
  }, [fetchFrameworks]);

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

  const handleViewModeChange = (mode) => {
    const p = new URLSearchParams(searchParams);
    p.set("view", mode);
    p.set("page", "1");
    setSearchParams(p);
  };

  const handleSort = (key) => {
    if (!Array.isArray(frameworks)) {
      return;
    }

    const order =
      sortConfig.sortBy === key && sortConfig.sortOrder === "asc"
        ? "desc"
        : "asc";

    setSortConfig({ sortBy: key, sortOrder: order });

    const sortedFrameworks = [...frameworks].sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

      if (key === "uploadedBy") {
        aValue = a.uploadedBy?.name || "";
        bValue = b.uploadedBy?.name || "";
      }

      if (key === "createdAt" || key === "updatedAt") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (order === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFrameworks(sortedFrameworks);
  };

  /* ---------------- CRUD ---------------- */
  const handleSaveFramework = async (data) => {
    if (loading) return;

    try {
      if (modalState.mode === "create") {
        const formData = new FormData();
        formData.append("file", data.file);
        if (data.frameworkName) {
          formData.append("frameworkName", data.frameworkName);
        }

        await uploadFramework(formData, userRole);
        toast.success("Framework uploaded successfully");
      } else {
        // Edit mode
        const frameworkId =
          modalState.framework?.id || modalState.framework?._id;

        if (!frameworkId) {
          toast.error("Framework ID not found. Cannot update framework.");
          return;
        }

        // Check if file is being updated
        if (data.file) {
          // If new file is provided, use FormData for file upload
          const formData = new FormData();
          formData.append("file", data.file);
          if (data.frameworkName) {
            formData.append("frameworkName", data.frameworkName);
          }

          // Use PUT request with FormData for file update
          await updateFrameworkWithFile(frameworkId, formData, userRole);
          toast.success("Framework and file updated successfully");
        } else {
          // If no new file, just update the metadata
          const updateData = {};
          if (data.frameworkName) {
            updateData.frameworkName = data.frameworkName;
          }

          await updateFramework(frameworkId, updateData, userRole);
          toast.success("Framework updated successfully");
        }
      }
      setModalState({ isOpen: false, mode: "view", framework: null });

      // Refresh frameworks list
      refreshFrameworksList();
    } catch (e) {
      if (e.status === 404) {
        toast.error(
          "Upload endpoint not found. Please check if the backend server is running and the API endpoint exists."
        );
      } else if (e.status === 413) {
        toast.error("File too large. Please choose a smaller file.");
      } else if (e.status === 415) {
        toast.error(
          "Unsupported file type. Please choose a supported file format."
        );
      } else {
        toast.error(e.message || "Failed to save framework");
      }
    }
  };

  const handleDeleteFramework = async () => {
    try {
      const frameworkId =
        deleteModalState.framework?.id || deleteModalState.framework?._id;

      if (!frameworkId) {
        toast.error("Framework ID not found. Cannot delete framework.");
        return;
      }

      await deleteFramework(frameworkId, userRole);
      toast.success("Framework deleted successfully");
      setDeleteModalState({ isOpen: false, framework: null });

      // Refresh frameworks list
      refreshFrameworksList();
    } catch (e) {
      toast.error(e.message || "Failed to delete framework");
    }
  };

  const FILE_ICON_MAP = {
    pdf: FaRegFilePdf,
    doc: FaRegFileWord,
    docx: FaRegFileWord,
    xls: BsFiletypeXls,
    xlsx: BsFiletypeXls,
    csv: BsFiletypeCsv,
    ppt: AiOutlineFilePpt,
  };

  const getFileExtension = (frameworkType = "") => frameworkType;

  const getFileIcon = (frameworkType) => {
    const ext = getFileExtension(frameworkType);
    return FILE_ICON_MAP[ext] || File;
  };

  /* ---------------- TABLE CONFIG ---------------- */
  const columns = [
    {
      key: "frameworkName",
      label: "Framework Name",
      sortable: true,
      render: (value, row) => {
        const FileIcon = getFileIcon(row.frameworkType);
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/20">
              <FileIcon size={18} strokeWidth={1.8} />
            </div>
            <div>
              <span className="font-semibold text-foreground block whitespace-nowrap">
                {value || row.originalFileName}
              </span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {row.frameworkType?.toUpperCase()} • {row.fileSize}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "uploadedBy",
      label: "Uploaded By",
      sortable: false,
      render: (value) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground whitespace-nowrap">
            {value?.name || "Unknown"}
          </span>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {value?.email || ""}
          </span>
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Upload Date",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Icon name="calendar" size="14px" className="text-muted-foreground" />
          <span className="text-foreground whitespace-nowrap">
            {formatDate(value)}
          </span>
        </div>
      ),
    },
    {
      key: "updatedAt",
      label: "Last Modified",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Icon name="calendar" size="14px" className="text-muted-foreground" />
          <span className="text-foreground whitespace-nowrap">
            {formatDate(value)}
          </span>
        </div>
      ),
    },
  ];

  const renderActions = (framework) => (
    <div className="flex gap-1 justify-center">
      <button
        onClick={() => {
          const frameworkId = framework.id || framework._id;
          navigate(`/frameworks/${frameworkId}`);
        }}
        className="px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full transition-all duration-200 hover:scale-105"
        title="View Framework"
      >
        <Icon name="eye" size="16px" />
      </button>
      <button
        onClick={async () => {
          try {
            const frameworkId = framework.id || framework._id;
            await downloadFramework(frameworkId, userRole);
            toast.success("Download started");
          } catch (error) {
            console.error("Download error:", error);
            toast.error("Failed to download framework");
          }
        }}
        className="px-3 py-2 hover:bg-green-50 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full transition-all duration-200 hover:scale-105"
        title="Download Framework"
      >
        <Icon name="download" size="16px" />
      </button>
      <button
        onClick={() => setModalState({ isOpen: true, mode: "edit", framework })}
        className="px-3 py-2 hover:bg-primary/10 text-primary rounded-full transition-all duration-200 hover:scale-105"
        title="Edit Framework"
      >
        <Icon name="edit" size="16px" />
      </button>
      <button
        onClick={() => setDeleteModalState({ isOpen: true, framework })}
        className="px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full transition-all duration-200 hover:scale-105"
        title="Delete Framework"
      >
        <Icon name="trash" size="16px" />
      </button>
    </div>
  );

  return (
    <div className="my-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Frameworks</h1>
          <p className="text-muted-foreground mt-1">
            {viewMode === "my"
              ? "Your uploaded frameworks"
              : "All available frameworks"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Manual Refresh Button */}
          <button
            onClick={refreshFrameworksList}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
            title="Refresh frameworks"
          >
            <Icon
              name="refresh"
              size="20px"
              className={loading ? "animate-spin" : ""}
            />
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-muted rounded-xl p-1">
            <button
              onClick={() => handleViewModeChange("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "all"
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Frameworks
            </button>
            <button
              onClick={() => handleViewModeChange("my")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "my"
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              My Frameworks
            </button>
          </div>

          <button
            onClick={() =>
              setModalState({ isOpen: true, mode: "create", framework: null })
            }
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
          >
            <Icon name="plus" size="18px" />
            Upload Framework
          </button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={Array.isArray(frameworks) ? frameworks : []}
        pagination={{
          ...pagination,
          onPageChange: handlePageChange,
        }}
        onSearch={handleSearch}
        onSort={handleSort}
        sortConfig={sortConfig}
        loading={loading}
        emptyMessage="No frameworks found"
        renderActions={renderActions}
        searchPlaceholder="Search frameworks..."
        searchTerm={searchTerm}
      />

      {/* Modals */}
      <FrameworkModal
        isOpen={modalState.isOpen}
        onClose={() =>
          setModalState({ isOpen: false, mode: "view", framework: null })
        }
        onSave={handleSaveFramework}
        framework={modalState.framework}
        mode={modalState.mode}
      />

      <DeleteFrameworkModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, framework: null })}
        onConfirm={handleDeleteFramework}
        framework={deleteModalState.framework}
      />
    </div>
  );
}

export default Frameworks;
