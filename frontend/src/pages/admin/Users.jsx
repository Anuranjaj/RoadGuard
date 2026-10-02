import React, { useEffect, useState } from "react";
import { Ban, Car, CheckCircle2, Eye, Search, UserCheck, Users as UsersIcon } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { adminApi } from "@/services/api";

/**
 * Admin User Management Page
 */
export function Users() {
  const [userList, setUserList] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState("");

  const loadUsers = () => adminApi.users().then((response) => setUserList(response.data));

  useEffect(() => {
    loadUsers().catch((requestError) => setError(requestError.message));
  }, []);

  const toggleUserStatus = async (user) => {
    try {
      await adminApi.updateUserStatus(user.id, user.status !== "Active");
      await loadUsers();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const filtered = userList.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search) ||
      u.id.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <PageHeader
          title="Vehicle Owners &amp; Users"
          description="Search, view and manage all registered drivers, active vehicle registrations and service histories."
        />

        {/* Search and Filters */}
        <div className="surface-card p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, email, phone, ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active Drivers</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="surface-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Vehicles</th>
                  <th className="p-4">Total Services</th>
                  <th className="p-4">Registered</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr><td className="p-8 text-center text-sm text-muted-foreground" colSpan="7">No vehicle owners found.</td></tr>
                ) : filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-primary font-bold text-xs text-primary-foreground">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </span>
                        <div>
                          <p className="font-semibold text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-xs">
                      <p className="text-foreground">{user.email}</p>
                      <p className="text-muted-foreground">{user.phone}</p>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-xs">
                        <Car className="h-3.5 w-3.5 text-muted-foreground" /> {user.vehicles}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-xs">{user.services}</td>
                    <td className="p-4 text-xs text-muted-foreground">{new Date(user.registered).toLocaleDateString()}</td>
                    <td className="p-4">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setSelectedUser(user)}>
                          <Eye className="h-4 w-4" /> View
                        </Button>
                        <Button
                          size="sm"
                          variant={user.status === "Active" ? "outline" : "accent"}
                          onClick={() => toggleUserStatus(user)}
                        >
                          {user.status === "Active" ? "Suspend" : "Activate"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Detail Modal */}
        <Modal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          title={`User Profile: ${selectedUser?.name}`}
          description={`Registered on ${selectedUser?.registered}`}
          footer={
            <Button variant="default" onClick={() => setSelectedUser(null)}>
              Close
            </Button>
          }
        >
          {selectedUser && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3 bg-secondary/40 p-4 rounded-xl">
                <div>
                  <p className="text-xs text-muted-foreground">User ID</p>
                  <p className="font-mono font-bold">{selectedUser.id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <StatusBadge status={selectedUser.status} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedUser.phone}</p>
                </div>
              </div>

              <div className="border border-border p-4 rounded-xl space-y-2 text-xs">
                <p>
                  <strong>Total Registered Vehicles:</strong> {selectedUser.vehicles}
                </p>
                <p>
                  <strong>Lifetime Services Requested:</strong> {selectedUser.services}
                </p>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
export default Users;
