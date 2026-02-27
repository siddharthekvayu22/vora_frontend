import { useState } from "react";
import { toast } from "sonner";
import {
  getAdminFrameworkCategory,
  createFrameworkCategory,
  updateFrameworkCategory,
  deleteFrameworkCategory,
} from "../../../services/adminService";
import DataTable from "../../../components/data-table/DataTable";
import Icon from "../../../components/Icon";
import CategoryModal from "./components/CategoryModal";
import DeleteCategoryModal from "./components/DeleteCategoryModal";
import { formatDate } from "../../../utils/dateFormatter";
import CustomBadge from "../../../components/custom/CustomBadge";
import ActionDropdown from "../../../components/custom/ActionDropdown";
import UserMiniCard from "@/components/custom/UserMiniCard";
import { Button } from "@/components/ui/button";
import { useTableData } from "../../../components/data-table/hooks/useTableData";

function Category() {
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: "create",
    category: null,
  });

  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    category: null,
  });

  // Use custom hook for table data management
  const {
    data: frameworkCategory,
    loading,
    emptyMessage,
    pagination,
    searchTerm,
    sortConfig,
    onSearch: handleSearch,
    onSort: handleSort,
    refetch,
  } = useTableData(getAdminFrameworkCategory, {
    defaultLimit: 10,
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
    emptyMessage: "No framework category found",
  });

  /* ---------------- CRUD ---------------- */
  const handleSaveCategory = async (data) => {
    try {
      if (modalState.mode === "create") {
        const response = await createFrameworkCategory(data);
        toast.success(response.message || "Category created successfully");
      } else {
        const categoryId = modalState.category?._id || modalState.category?.id;
        const response = await updateFrameworkCategory(categoryId, data);
        toast.success(response.message || "Category updated successfully");
      }
      setModalState({ isOpen: false, mode: "create", category: null });
      refetch();
    } catch (e) {
      toast.error(e.message || "Failed to save category");
      console.error("Save category error:", e);
    }
  };

  const handleDeleteCategory = async () => {
    try {
      const categoryId =
        deleteModalState.category?._id || deleteModalState.category?.id;

      if (!categoryId) {
        toast.error("Category ID not found. Cannot delete category.");
        console.error("Category object:", deleteModalState.category);
        return;
      }

      const response = await deleteFrameworkCategory(categoryId);
      toast.success(response.message || "Category deleted successfully");
      setDeleteModalState({ isOpen: false, category: null });
      refetch();
    } catch (e) {
      toast.error(e.message || "Failed to delete category");
      console.error("Delete category error:", e);
    }
  };

  /* ---------------- TABLE CONFIG ---------------- */
  const columns = [
    {
      key: "code",
      label: "Code",
      sortable: false,
      render: (value) => (
        <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
          {value}
        </span>
      ),
    },
    {
      key: "frameworkCategoryName",
      label: "Category Name",
      sortable: false,
      render: (value) => (
        <span className="font-medium text-foreground">{value}</span>
      ),
    },
    {
      key: "description",
      label: "Description",
      sortable: false,
      render: (value) => (
        <span className="text-muted-foreground text-sm line-clamp-2 max-w-xs">
          {value}
        </span>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      sortable: false,
      render: (value) => (
        <CustomBadge
          label={value ? "Active" : "Inactive"}
          color={value ? "green" : "red"}
        />
      ),
    },
    {
      key: "createdBy",
      label: "Created By",
      sortable: false,
      render: (value, row) => (
        <UserMiniCard name={value.name} email={value.email} />
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
      sortable: false,
      render: (value) => (
        <span className="text-sm whitespace-nowrap">{formatDate(value)}</span>
      ),
    },
  ];

  const renderActions = (row) => {
    const actions = [
      {
        id: `edit-${row._id || row.id}`,
        label: "Edit Category",
        icon: "edit",
        className: "text-primary hover:text-primary",
        onClick: () =>
          setModalState({ isOpen: true, mode: "edit", category: row }),
      },
      {
        id: `delete-${row._id || row.id}`,
        label: "Delete Category",
        icon: "trash",
        className: "text-destructive hover:text-destructive",
        onClick: () => setDeleteModalState({ isOpen: true, category: row }),
      },
    ];

    return (
      <div className="flex justify-center">
        <ActionDropdown actions={actions} />
      </div>
    );
  };

  const renderHeaderButtons = () => (
    <Button
      size="lg"
      className="flex items-center gap-3"
      onClick={() =>
        setModalState({ isOpen: true, mode: "create", category: null })
      }
    >
      <Icon name="plus" size="18px" />
      Add New Framework Category
    </Button>
  );

  /* ---------------- UI ---------------- */
  return (
    <div className="mt-5 pb-5 space-y-8">
      {/* Data Table */}
      <DataTable
        columns={columns}
        data={frameworkCategory}
        loading={loading}
        onSearch={handleSearch}
        onSort={handleSort}
        sortConfig={sortConfig}
        searchTerm={searchTerm}
        pagination={pagination}
        renderActions={renderActions}
        renderHeaderActions={renderHeaderButtons}
        searchPlaceholder="Search category..."
        emptyMessage={emptyMessage}
      />

      {modalState.isOpen && (
        <CategoryModal
          mode={modalState.mode}
          category={modalState.category}
          onSave={handleSaveCategory}
          onClose={() =>
            setModalState({ isOpen: false, mode: "create", category: null })
          }
        />
      )}

      {deleteModalState.isOpen && (
        <DeleteCategoryModal
          category={deleteModalState.category}
          onConfirm={handleDeleteCategory}
          onCancel={() =>
            setDeleteModalState({ isOpen: false, category: null })
          }
        />
      )}
    </div>
  );
}

export default Category;
