import { useEffect } from "react";
import { useCallback } from "react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
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
import { Button } from "@/components/ui/button";

function Category() {
  const [frameworkCategory, setFrameworkCategory] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [emptyMessage, setEmptyMessage] = useState(
    "No framework category found",
  );

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
    mode: "create",
    category: null,
  });

  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    category: null,
  });

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

  /* ---------------- FETCH CATEGORY ---------------- */
  const fetchFrameworkCategory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminFrameworkCategory({
        page: pagination.currentPage,
        limit: pagination.limit,
        search: searchTerm,
        sortBy: sortConfig.sortBy,
        sortOrder: sortConfig.sortOrder,
      });

      setFrameworkCategory(res.data || []);

      // Set the message from backend response, especially for empty results
      if (res.message && res.data?.length === 0) {
        setEmptyMessage(res.message);
      } else if (
        searchTerm &&
        (res.users?.length === 0 || res.data?.length === 0)
      ) {
        setEmptyMessage(`No framework category found for "${searchTerm}"`);
      } else {
        setEmptyMessage("No framework category");
      }

      setPagination((p) => ({
        ...p,
        totalPages: res.pagination?.totalPages || 1,
        totalItems: res.pagination?.totalItems || 0,
        hasPrevPage: pagination.currentPage > 1,
        hasNextPage: pagination.currentPage < (res.pagination?.totalPages || 1),
      }));
    } catch (err) {
      toast.error(err.message || "Failed to load framework category");
      setFrameworkCategory([]);
      setEmptyMessage("Failed to load framework category");
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.limit, searchTerm, sortConfig]);

  useEffect(() => {
    fetchFrameworkCategory();
  }, [fetchFrameworkCategory]);

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
      fetchFrameworkCategory();
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
      fetchFrameworkCategory();
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
    
      className="flex items-center gap-3 px-5 py-3 "
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
        pagination={{ ...pagination, onPageChange: handlePageChange }}
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
