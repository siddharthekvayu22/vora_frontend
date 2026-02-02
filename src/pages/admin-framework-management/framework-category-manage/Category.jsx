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
      sortable: true,
      render: (value) => (
        <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
          {value}
        </span>
      ),
    },
    {
      key: "frameworkCategoryName",
      label: "Category Name",
      sortable: true,
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
      sortable: true,
      render: (value) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            value
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {value ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
      sortable: true,
      render: (value) => (
        <span className="text-sm whitespace-nowrap">{formatDate(value)}</span>
      ),
    },
  ];

  const renderActions = (row) => (
    <div className="flex gap-1 justify-center">
      <button
        onClick={() =>
          setModalState({ isOpen: true, mode: "edit", category: row })
        }
        className="px-3 py-2 hover:bg-primary/10 text-primary rounded-full transition-all duration-200 hover:scale-105 cursor-pointer"
        title="Edit Category"
      >
        <Icon name="edit" size="16px" />
      </button>
      <button
        onClick={() => setDeleteModalState({ isOpen: true, category: row })}
        className="px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full transition-all duration-200 hover:scale-105 cursor-pointer"
        title="Delete Category"
      >
        <Icon name="trash" size="16px" />
      </button>
    </div>
  );

  /* ---------------- UI ---------------- */
  return (
    <div className="mt-5 pb-5 space-y-8">
      {/* Header Section */}
      <div className="flex flex-wrap justify-between items-start gap-6 p-6 bg-gradient-to-r from-card to-muted/30 rounded-xl border border-border shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="users" size="20px" className="text-primary" />
            </div>
            <div className="">
              <h1 className="text-xl font-bold text-foreground flex items-center gap-3">
                Framework Category
              </h1>
              <p className="text-muted-foreground text-xs">
                Manage framework category
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              Total Framework Category:{" "}
              <span className="font-medium text-foreground">
                {pagination.totalItems}
              </span>
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary"></div>
              Active Page:{" "}
              <span className="font-medium text-foreground">
                {pagination.currentPage}
              </span>
            </span>
          </div>
        </div>

        <button
          className="flex items-center gap-3 px-5 py-3 bg-primary text-primary-foreground rounded-lg hover:shadow-lg hover:scale-[102%] transition-all duration-200 font-medium text-xs cursor-pointer"
          onClick={() =>
            setModalState({ isOpen: true, mode: "create", category: null })
          }
        >
          <Icon name="plus" size="18px" />
          Add New Framework Category
        </button>
      </div>

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
