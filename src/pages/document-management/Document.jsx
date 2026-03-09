import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Icon from "../../components/Icon";
import DataTable from "../../components/data-table/DataTable";
import UploadCompanyDocumentModal from "./components/UploadCompanyDocumentModal";
import UpdateCompanyDocumentModal from "./components/UpdateCompanyDocumentModal";
import DeleteCompanyDocumentModal from "./components/DeleteCompanyDocumentModal";
import UserMiniCard from "../../components/custom/UserMiniCard";
import FileTypeCard from "../../components/custom/FileTypeCard";
import ActionDropdown from "../../components/custom/ActionDropdown";
import {
  downloadCompanyDocumentFile,
  getAllCompanyDocuments,
  deleteCompanyDocument,
} from "../../services/companyDocumentService";
import { formatDate } from "../../utils/dateFormatter";
import { Button } from "@/components/ui/button";
import { useTableData } from "../../components/data-table/hooks/useTableData";

function Document() {
  const navigate = useNavigate();

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [documentToUpdate, setDocumentToUpdate] = useState(null);

  // Use custom hook for table data management
  const {
    data: companyDocuments,
    loading,
    emptyMessage,
    pagination,
    searchTerm,
    sortConfig,
    onSearch: handleSearch,
    onSort: handleSort,
    refetch,
  } = useTableData(getAllCompanyDocuments, {
    defaultLimit: 10,
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
    emptyMessage: "No company documents found",
  });

  /* ---------------- HANDLERS ---------------- */
  const handleUploadSuccess = async () => {
    await refetch();
  };

  const handleUpdateDocument = (document) => {
    setDocumentToUpdate(document);
    setUpdateModalOpen(true);
  };

  const handleUpdateSuccess = () => {
    refetch();
  };

  const handleDeleteDocument = (document) => {
    setDocumentToDelete(document);
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;
    const fileId = documentToDelete.mainFileId;
    try {
      const result = await deleteCompanyDocument(fileId);
      toast.success(result.message || "Document deleted successfully");
      refetch();
      setDocumentToDelete(null);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete document");
      throw error;
    }
  };

  const handleDeleteCancel = () => {
    setDocumentToDelete(null);
  };

  const handleDownloadDocument = async (row) => {
    if (!row.fileInfo?.versionFileId) return;

    try {
      await downloadCompanyDocumentFile(
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
      key: "documentName",
      label: "Document Name",
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
      key: "documentType",
      label: "File Info",
      sortable: false,
      render: (value, row) => (
        <FileTypeCard
          fileType={value || row.documentType}
          fileSize={row.fileInfo?.fileSize}
          fileName={row.fileInfo?.originalFileName || row.documentName}
        />
      ),
    },
    {
      key: "uploadedBy",
      label: "Uploaded By",
      sortable: false,
      render: (value) => {
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
    const actions = [
      {
        id: `view-${row.id}`,
        label: "View Details",
        icon: "eye",
        className: "text-blue-600 hover:text-blue-600",
        onClick: () => navigate(`/documents/${row.id}`),
      },
      {
        id: `download-${row.fileInfo?.fileId}`,
        label: "Download",
        icon: "download",
        className: "text-green-600 hover:text-green-600",
        onClick: () => handleDownloadDocument(row),
      },
      {
        id: `edit-${row.mainFileId}`,
        label: "Edit Document",
        icon: "edit",
        className: "text-primary hover:text-primary",
        onClick: () => handleUpdateDocument(row),
      },
      {
        id: `delete-${row.mainFileId}`,
        label: "Delete Document",
        icon: "trash",
        className: "text-red-600 hover:text-red-600",
        onClick: () => handleDeleteDocument(row),
      },
    ];

    return (
      <div className="flex justify-center">
        <ActionDropdown actions={actions} />
      </div>
    );
  };

  const renderHeaderButtons = () => {
    return (
      <Button
        size="lg"
        onClick={() => setUploadModalOpen(true)}
        className="flex items-center gap-3"
      >
        <Icon name="plus" size="18px" />
        Add New Document
      </Button>
    );
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="mt-5 pb-5">
      <DataTable
        columns={columns}
        data={companyDocuments}
        loading={loading}
        onSearch={handleSearch}
        onSort={handleSort}
        sortConfig={sortConfig}
        searchTerm={searchTerm}
        pagination={pagination}
        renderActions={renderActions}
        renderHeaderActions={renderHeaderButtons}
        searchPlaceholder="Search document name or uploader..."
        emptyMessage={emptyMessage}
      />

      {uploadModalOpen && (
        <UploadCompanyDocumentModal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          onSuccess={handleUploadSuccess}
        />
      )}

      {updateModalOpen && documentToUpdate && (
        <UpdateCompanyDocumentModal
          isOpen={updateModalOpen}
          onClose={() => {
            setUpdateModalOpen(false);
            setDocumentToUpdate(null);
          }}
          onSuccess={handleUpdateSuccess}
          document={documentToUpdate}
        />
      )}

      {documentToDelete && (
        <DeleteCompanyDocumentModal
          document={documentToDelete}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </div>
  );
}

export default Document;
