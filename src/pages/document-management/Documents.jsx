import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/useAuth";
import { formatDate } from "../../utils/dateFormatter";
import DataTable from "../../components/data-table/DataTable";
import DocumentModal from "./components/DocumentModal";
import DocumentViewModal from "./components/DocumentViewModal";
import DeleteDocumentModal from "./components/DeleteDocumentModal";
import Icon from "../../components/Icon";
import {
  getAllDocuments,
  getMyDocuments,
  uploadDocument,
  deleteDocument,
  updateDocument,
  updateDocumentWithFile,
  downloadDocument,
  getDocumentById,
} from "../../services/documentService";

function Documents() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const userRole = user?.role || "expert";

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
    hasPrevPage: false,
    hasNextPage: false,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("all"); // "all" or "my"
  const [sortConfig, setSortConfig] = useState({
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: "view",
    document: null,
  });

  const [viewModalState, setViewModalState] = useState({
    isOpen: false,
    document: null,
    loading: false,
  });

  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    document: null,
  });

  /* ---------------- URL SYNC ---------------- */
  useEffect(() => {
    const page = parseInt(searchParams.get("page")) || 1;
    const search = searchParams.get("search") || "";
    const view = searchParams.get("view") || "all";

    setPagination((p) => ({ ...p, currentPage: page }));
    setSearchTerm(search);
    setViewMode(view);
  }, [searchParams]);

  /* ---------------- FETCH DOCUMENTS ---------------- */
  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const apiCall = viewMode === "my" ? getMyDocuments : getAllDocuments;
      const res = await apiCall({
        page: pagination.currentPage,
        limit: pagination.limit,
        search: searchTerm,
        userRole: userRole,
      });

      // Handle different possible response structures
      let documentsArray = [];
      if (Array.isArray(res)) {
        documentsArray = res;
      } else if (res.data && Array.isArray(res.data)) {
        documentsArray = res.data;
      } else if (res.documents && Array.isArray(res.documents)) {
        documentsArray = res.documents;
      } else if (res.data && res.data.documents && Array.isArray(res.data.documents)) {
        documentsArray = res.data.documents;
      }

      setDocuments(documentsArray);
      
      // Handle pagination
      const paginationData = res.pagination || res.data?.pagination || {};
      setPagination((p) => ({
        ...p,
        totalPages: paginationData.totalPages || 1,
        totalItems: paginationData.totalItems || documentsArray.length,
        hasPrevPage: pagination.currentPage > 1,
        hasNextPage: pagination.currentPage < (paginationData.totalPages || 1),
      }));
    } catch (err) {
      toast.error(err.message || "Failed to load documents");
      setDocuments([]); // Ensure it's always an array
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.limit, searchTerm, userRole, viewMode]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

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
    // Ensure documents is an array before sorting
    if (!Array.isArray(documents)) {
      return;
    }

    const order =
      sortConfig.sortBy === key && sortConfig.sortOrder === "asc"
        ? "desc"
        : "asc";

    setSortConfig({ sortBy: key, sortOrder: order });

    // Client-side sorting since server doesn't support it
    const sortedDocuments = [...documents].sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

      // Handle nested objects (like uploadedBy.name)
      if (key === "uploadedBy") {
        aValue = a.uploadedBy?.name || "";
        bValue = b.uploadedBy?.name || "";
      }

      // Handle dates
      if (key === "createdAt" || key === "updatedAt") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      // Handle strings
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

    setDocuments(sortedDocuments);
  };

  /* ---------------- CRUD ---------------- */
  const handleSaveDocument = async (data) => {
    // Prevent multiple submissions
    if (loading) return;
    
    try {
      if (modalState.mode === "create") {
        const formData = new FormData();
        formData.append("document", data.file);  // Changed from "file" to "document"
        if (data.documentName) {
          formData.append("documentName", data.documentName);
        }
        
        await uploadDocument(formData, userRole);
        toast.success("Document uploaded successfully");
      } else {
        // Edit mode
        const documentId = modalState.document?.id || modalState.document?._id;

        if (!documentId) {
          toast.error("Document ID not found. Cannot update document.");
          return;
        }

        // Check if file is being updated
        if (data.file) {
          // If new file is provided, use FormData for file upload
          const formData = new FormData();
          formData.append("document", data.file);
          if (data.documentName) {
            formData.append("documentName", data.documentName);
          }
          
          // Use PUT request with FormData for file update
          await updateDocumentWithFile(documentId, formData, userRole);
          toast.success("Document and file updated successfully");
        } else {
          // If no new file, just update the metadata
          const updateData = {};
          if (data.documentName) {
            updateData.documentName = data.documentName;
          }
          
          await updateDocument(documentId, updateData, userRole);
          toast.success("Document updated successfully");
        }
      }
      setModalState({ isOpen: false, mode: "view", document: null });
      fetchDocuments();
    } catch (e) {
      // Show specific error messages based on status
      if (e.status === 404) {
        toast.error("Upload endpoint not found. Please check if the backend server is running and the API endpoint exists.");
      } else if (e.status === 413) {
        toast.error("File too large. Please choose a smaller file.");
      } else if (e.status === 415) {
        toast.error("Unsupported file type. Please choose a supported file format.");
      } else {
        toast.error(e.message || "Failed to save document");
      }
    }
  };

  const handleDeleteDocument = async () => {
    try {
      const documentId = deleteModalState.document?.id || deleteModalState.document?._id;

      if (!documentId) {
        toast.error("Document ID not found. Cannot delete document.");
        return;
      }

      await deleteDocument(documentId, userRole);
      toast.success("Document deleted successfully");
      setDeleteModalState({ isOpen: false, document: null });
      fetchDocuments();
    } catch (e) {
      toast.error(e.message || "Failed to delete document");
    }
  };

  /* ---------------- VIEW DOCUMENT ---------------- */
  const handleViewDocument = async (document) => {
    try {
      const documentId = document.id || document._id;
      
      if (!documentId) {
        toast.error("Document ID not found.");
        return;
      }

      // Set loading state and open modal immediately
      setViewModalState({ 
        isOpen: true, 
        document: document, // Show basic info first
        loading: true 
      });

      // Call API to get detailed document information
      const response = await getDocumentById(documentId, userRole);
      
      // Extract document from the nested response structure
      const detailedDocument = response.data?.document || response.document || response.data || response;
      
      // Update modal with the detailed document data
      setViewModalState({ 
        isOpen: true, 
        document: detailedDocument,
        loading: false
      });
      
    } catch (error) {
      console.error("Error fetching document details:", error);
      toast.error("Failed to load document details");
      
      // Show modal with existing document data and stop loading
      setViewModalState({ 
        isOpen: true, 
        document: document,
        loading: false 
      });
    }
  };

  /* ---------------- TABLE CONFIG ---------------- */
  const columns = [
    {
      key: "documentName",
      label: "Document Name",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
            <Icon name="file" size="18px" />
          </div>
          <div>
            <span className="font-semibold text-foreground block whitespace-nowrap">
              {value || row.originalFileName}
            </span>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {row.documentType?.toUpperCase()} • {row.fileSize}
            </span>
          </div>
        </div>
      ),
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

  const renderActions = (document) => (
    <div className="flex gap-1 justify-center">
      <button
        onClick={() => handleViewDocument(document)}
        className="px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full transition-all duration-200 hover:scale-105"
        title="View Document"
      >
        <Icon name="eye" size="16px" />
      </button>
      <button
        onClick={async () => {
          try {
            const documentId = document.id || document._id;
            await downloadDocument(documentId, userRole);
            toast.success("Download started");
          } catch (error) {
            console.error("Download error:", error);
            toast.error("Failed to download document");
          }
        }}
        className="px-3 py-2 hover:bg-green-50 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full transition-all duration-200 hover:scale-105"
        title="Download Document"
      >
        <Icon name="download" size="16px" />
      </button>
      <button
        onClick={() =>
          setModalState({ isOpen: true, mode: "edit", document })
        }
        className="px-3 py-2 hover:bg-primary/10 text-primary rounded-full transition-all duration-200 hover:scale-105"
        title="Edit Document"
      >
        <Icon name="edit" size="16px" />
      </button>
      <button
        onClick={() => setDeleteModalState({ isOpen: true, document })}
        className="px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full transition-all duration-200 hover:scale-105"
        title="Delete Document"
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
          <h1 className="text-3xl font-bold text-foreground">Documents</h1>
          <p className="text-muted-foreground mt-1">
            {viewMode === "my" ? "Your uploaded documents" : "All available documents"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          {userRole === "user" && (
            <div className="flex items-center bg-muted rounded-xl p-1">
              <button
                onClick={() => handleViewModeChange("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === "all"
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Documents
              </button>
              <button
                onClick={() => handleViewModeChange("my")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === "my"
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                My Documents
              </button>
            </div>
          )}
          <button
            onClick={() =>
              setModalState({ isOpen: true, mode: "create", document: null })
            }
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
          >
            <Icon name="plus" size="18px" />
            Upload Document
          </button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={Array.isArray(documents) ? documents : []}
        pagination={{
          ...pagination,
          onPageChange: handlePageChange,
        }}
        onSearch={handleSearch}
        onSort={handleSort}
        sortConfig={sortConfig}
        loading={loading}
        emptyMessage="No documents found"
        renderActions={renderActions}
        searchPlaceholder="Search documents..."
        searchTerm={searchTerm}
      />

      {/* Modals */}
      <DocumentModal
        isOpen={modalState.isOpen}
        onClose={() =>
          setModalState({ isOpen: false, mode: "view", document: null })
        }
        onSave={handleSaveDocument}
        document={modalState.document}
        mode={modalState.mode}
      />

      <DocumentViewModal
        isOpen={viewModalState.isOpen}
        onClose={() => setViewModalState({ isOpen: false, document: null, loading: false })}
        document={viewModalState.document}
        loading={viewModalState.loading}
      />

      <DeleteDocumentModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, document: null })}
        onConfirm={handleDeleteDocument}
        document={deleteModalState.document}
      />
    </div>
  );
}

export default Documents;