import DataTable from "./DataTable";
import StatusBadge from "./components/StatusBadge";
import ActionButtons from "./components/ActionButtons";

/**
 * Example usage of the Tailwind CSS DataTable component
 */
export default function DataTableExample() {
  const columns = [
    {
      key: "name",
      label: "Name",
      sortable: true,
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: "role",
      label: "Role",
      sortable: true,
      render: (value) => <StatusBadge status={value} />,
    },
  ];

  const data = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      status: "verified",
      role: "admin",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      status: "pending",
      role: "user",
    },
  ];

  const pagination = {
    currentPage: 1,
    totalPages: 5,
    totalItems: 50,
    limit: 10,
    hasPrevPage: false,
    hasNextPage: true,
    onPageChange: (page) => console.log("Page changed to:", page),
  };

  const handleSearch = (searchTerm) => {
    console.log("Search:", searchTerm);
  };

  const handleSort = (sortBy) => {
    console.log("Sort by:", sortBy);
  };

  const handleRefresh = () => {
    console.log("Refreshing data...");
  };

  const renderActions = (row) => {
    const actions = [
      {
        type: "view",
        icon: "eye",
        title: "View",
        onClick: (row) => console.log("View:", row),
      },
      {
        type: "edit",
        icon: "edit",
        title: "Edit",
        onClick: (row) => console.log("Edit:", row),
      },
      {
        type: "delete",
        icon: "trash",
        title: "Delete",
        onClick: (row) => console.log("Delete:", row),
      },
    ];

    return <ActionButtons actions={actions} row={row} />;
  };

  return (
    <div className="p-6 bg-background">
      <h1 className="text-2xl font-bold mb-6 text-foreground">
        DataTable Example
      </h1>
      <DataTable
        columns={columns}
        data={data}
        pagination={pagination}
        onSearch={handleSearch}
        onSort={handleSort}
        onRefresh={handleRefresh}
        renderActions={renderActions}
        searchPlaceholder="Search users..."
        emptyMessage="No users found"
        loading={false}
        sortConfig={{ sortBy: "name", sortOrder: "asc" }}
      />
    </div>
  );
}
