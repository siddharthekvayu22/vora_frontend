import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import Icon from "../../components/Icon";
import DataTable from "../../components/data-table/DataTable";
import { getAllOfficialFrameworks } from "../../services/officialFrameworkService";

function OfficialFramework() {
  const [officialFramework, setOfficialFramework] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emptyMessage, setEmptyMessage] = useState(
    "No official framework found",
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

  /* ---------------- TABLE CONFIG ---------------- */
  const columns = [
    {
      key: "frameworkCode",
      label: "Framework Code",
      sortable: true,
      render: (value) => (
        <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
          {value}
        </span>
      ),
    },
    {
      key: "frameworkName",
      label: "Framework Name",
      sortable: true,
      render: (value) => (
        <span className="font-medium text-foreground">{value}</span>
      ),
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
      render: (value) => (
        <span className="text-sm text-muted-foreground">
          {value?.frameworkCategoryName || "—"}
        </span>
      ),
    },
    {
      key: "version",
      label: "Version",
      sortable: true,
      render: (value) => <span className="text-sm">{value || "—"}</span>,
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
        searchPlaceholder="Search framework, code, category..."
        emptyMessage={emptyMessage}
      />
    </div>
  );
}

export default OfficialFramework;
