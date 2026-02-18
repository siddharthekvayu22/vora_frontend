import { useEffect, useCallback, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import Icon from "../../components/Icon";
import DataTable from "../../components/data-table/DataTable";
import { getOfficialFrameworkCategory } from "../../services/officialFrameworkService";
import { formatDate } from "../../utils/dateFormatter";
import RequestAccessModal from "./components/RequestAccessModal";
import CustomBadge from "../../components/custom/CustomBadge";
import ActionDropdown from "../../components/custom/ActionDropdown";

function OfficialFrameworkCategory() {
  const [officialFrameworkCategory, setOfficialFrameworkCategory] = useState(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [emptyMessage, setEmptyMessage] = useState(
    "No official framework category found",
  );

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

  const [requestModalState, setRequestModalState] = useState({
    isOpen: false,
    framework: null,
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

  /* ---------------- FETCH DATA ---------------- */
  const fetchOfficialFrameworkCategory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOfficialFrameworkCategory({
        page: pagination.currentPage,
        limit: pagination.limit,
        search: searchTerm,
        sortBy: sortConfig.sortBy,
        sortOrder: sortConfig.sortOrder,
      });

      setOfficialFrameworkCategory(res.data || []);

      if (res.message && res.data?.length === 0) {
        setEmptyMessage(res.message);
      } else if (searchTerm && res.data?.length === 0) {
        setEmptyMessage(
          `No official framework category found for "${searchTerm}"`,
        );
      } else {
        setEmptyMessage("No official framework category found");
      }

      setPagination((p) => ({
        ...p,
        totalPages: res.pagination?.totalPages || 1,
        totalItems: res.pagination?.totalItems || 0,
        hasPrevPage: pagination.currentPage > 1,
        hasNextPage: pagination.currentPage < (res.pagination?.totalPages || 1),
      }));
    } catch (err) {
      toast.error(err.message || "Failed to load official framework category");
      setOfficialFrameworkCategory([]);
      setEmptyMessage("Failed to load official framework category");
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.limit, searchTerm, sortConfig]);

  useEffect(() => {
    fetchOfficialFrameworkCategory();
  }, [fetchOfficialFrameworkCategory]);

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

  /* ---------------- REQUEST ACCESS HANDLERS ---------------- */
  const handleRequestAccessSuccess = () => {
    fetchOfficialFrameworkCategory();
    setRequestModalState({ isOpen: false, framework: null });
    // Optionally refresh data or show success message
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
        <span
          className="font-medium text-foreground line-clamp-1"
          title={value}
        >
          {value}
        </span>
      ),
    },
    {
      key: "description",
      label: "Description",
      sortable: false,
      render: (value) => (
        <span
          className="text-muted-foreground text-sm line-clamp-2 max-w-xs"
          title={value}
        >
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
    const isActive = row.isActive;
    const hasRequested = row.hasRequested;
    const isDisabled = !isActive || hasRequested;

    const actions = [
      {
        id: `request-${row.id}`,
        label: hasRequested ? "Requested" : "Request Access",
        icon: hasRequested ? "check" : "plus",
        className: hasRequested
          ? "text-muted-foreground"
          : "text-primary hover:text-primary",
        disabled: isDisabled,
        onClick: () => {
          if (!isDisabled) {
            setRequestModalState({ isOpen: true, framework: row });
          }
        },
      },
    ];

    return (
      <div className="flex justify-center">
        <ActionDropdown actions={actions} />
      </div>
    );
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="mt-5 pb-5">
      {/* Data Table */}
      <DataTable
        columns={columns}
        data={officialFrameworkCategory}
        loading={loading}
        onSearch={handleSearch}
        onSort={handleSort}
        sortConfig={sortConfig}
        pagination={{ ...pagination, onPageChange: handlePageChange }}
        renderActions={renderActions}
        searchPlaceholder="Search official category..."
        emptyMessage={emptyMessage}
      />

      {/* Request Access Modal */}
      {requestModalState.isOpen && (
        <RequestAccessModal
          framework={requestModalState.framework}
          onSuccess={handleRequestAccessSuccess}
          onClose={() =>
            setRequestModalState({ isOpen: false, framework: null })
          }
        />
      )}
    </div>
  );
}

export default OfficialFrameworkCategory;
