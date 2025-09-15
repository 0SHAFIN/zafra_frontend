/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect, useCallback } from "react";
import { User, userAPI, adminAuth } from "@/lib/api";
import { useToast } from "@/app/component/ui/ToastProvider";
import { userManagementSchema } from "@/lib/validation";
import ConfirmDialog from "@/app/component/ui/ConfirmDialog";
import {
  Users,
  Plus,
  Search,
  Shield,
  UserCheck,
  Trash2,
  Mail,
  X,
  Key,
  User as UserIcon,
} from "lucide-react";

interface UserFormData {
  email: string;
  password: string;
  name: string;
  role: "admin" | "manager";
}

interface ConfirmDialogState {
  isOpen: boolean;
  type: "role-change" | "delete";
  title: string;
  message: string;
  onConfirm: () => void;
  loading?: boolean;
}

export default function UserManagement() {
  const { showSuccess, showError } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    email: "",
    password: "",
    name: "",
    role: "manager",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<UserFormData>>({});
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    type: "delete",
    title: "",
    message: "",
    onConfirm: () => {},
    loading: false,
  });
  const [filterRole, setFilterRole] = useState<
    "all" | "admin" | "manager" | "customer"
  >("all");

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await userAPI.getAll();
      console.log("Fetched users:", data);
      console.log("Sample user object:", data[0]);
      if (data[0]) {
        console.log("User ID type:", typeof data[0].id);
        console.log("User ID value:", data[0].id);
      }
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      showError(
        "Failed to Load",
        "Unable to load users. Please refresh the page."
      );
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset form
  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      name: "",
      role: "manager",
    });
    setFormErrors({});
    setShowForm(false);
  };

  // Validate form with ZOD (safeParse) returning detailed messages
  const validateForm = ():
    | { ok: true }
    | { ok: false; summary: string; lines: string[] } => {
    const result = userManagementSchema.safeParse(formData);
    if (result.success) {
      setFormErrors({});
      return { ok: true };
    }
    const errors: Partial<UserFormData> = {};
    const lines: string[] = [];
    result.error.issues.forEach((iss) => {
      const field = iss.path[0] as keyof UserFormData | undefined;
      if (field) {
        (errors as any)[field] = iss.message;
        lines.push(`${field}: ${iss.message}`);
      } else {
        lines.push(iss.message);
      }
    });
    setFormErrors(errors);
    return {
      ok: false,
      summary: lines.slice(0, 4).join(" | "),
      lines,
    };
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateForm();
    if (!validation.ok) {
      // Prefer multiline bullet style if multiple
      const body =
        validation.lines && validation.lines.length > 1
          ? validation.lines
              .slice(0, 6)
              .map((l) => `• ${l}`)
              .join("\n")
          : validation.summary || "Please correct the errors in the form";
      showError("Validation Error", body);
      return;
    }

    try {
      setFormLoading(true);
      console.log("Submitting form with data:", formData);

      // Call the register API
      const result = await adminAuth.register(formData);
      console.log("Registration result:", result);

      await fetchUsers();
      resetForm();
      showSuccess(
        "User Created",
        `${formData.name} has been successfully added as ${formData.role}`
      );
    } catch (error: unknown) {
      console.error("Error creating user:", error);

      let errorMessage = "Unknown error occurred";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        const axiosError = error as {
          response?: {
            data?: { message?: string; error?: string };
            status?: number;
          };
        };

        if (axiosError.response?.status === 500) {
          errorMessage =
            "Server error. The endpoint might not exist or there's a backend issue.";
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.response?.data?.error) {
          errorMessage = axiosError.response.data.error;
        } else {
          errorMessage = `API error (${
            axiosError.response?.status || "unknown"
          })`;
        }
      }

      showError("Failed to Create User", errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle role change
  const handleRoleChange = async (
    userId: string,
    newRole: "admin" | "manager" | "customer"
  ) => {
    setConfirmDialog({
      isOpen: true,
      type: "role-change",
      title: "Change User Role",
      message: `Are you sure you want to change this user's role to ${newRole}? This will affect their access permissions.`,
      onConfirm: () => performRoleChange(userId, newRole),
      loading: false,
    });
  };

  const performRoleChange = async (
    userId: string,
    newRole: "admin" | "manager" | "customer"
  ) => {
    try {
      setConfirmDialog((prev) => ({ ...prev, loading: true }));
      console.log(`=== ROLE CHANGE DEBUG ===`);
      console.log(`User ID: "${userId}" (type: ${typeof userId})`);
      console.log(`New Role: "${newRole}" (type: ${typeof newRole})`);
      console.log(`Parsed ID: ${parseInt(userId, 10)}`);
      console.log(`========================`);

      await userAPI.changeRole(userId, newRole);
      await fetchUsers();
      setConfirmDialog((prev) => ({ ...prev, isOpen: false, loading: false }));
      showSuccess("Role Updated", `User role has been changed to ${newRole}`);
    } catch (error: unknown) {
      console.error("Error changing user role:", error);
      setConfirmDialog((prev) => ({ ...prev, loading: false }));

      let errorMessage =
        "Unable to change user role. The backend server may not be properly configured.";

      if (error instanceof Error) {
        if (error.message.includes("Network Error")) {
          errorMessage =
            "Network error. Check if the backend server is running and accessible.";
        } else if (
          error.message.includes("All endpoints tried unsuccessfully")
        ) {
          errorMessage =
            "Role update endpoint not found. Please contact your system administrator to configure the user management API.";
        } else {
          errorMessage = error.message;
        }
      } else if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        const axiosError = error as {
          response?: {
            data?: { message?: string; error?: string };
            status?: number;
          };
        };

        if (axiosError.response?.status === 404) {
          errorMessage =
            "User not found or role update endpoint doesn't exist.";
        } else if (axiosError.response?.status === 403) {
          errorMessage = "You don't have permission to change user roles.";
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      }

      showError("Role Change Failed", errorMessage);
    }
  };

  // Handle delete
  const handleDelete = async (userId: string) => {
    setConfirmDialog({
      isOpen: true,
      type: "delete",
      title: "Delete User",
      message:
        "Are you sure you want to delete this user? This action cannot be undone and will permanently remove their account.",
      onConfirm: () => performDelete(userId),
      loading: false,
    });
  };

  const performDelete = async (userId: string) => {
    try {
      setConfirmDialog((prev) => ({ ...prev, loading: true }));
      console.log(`Deleting user ${userId}`);
      await userAPI.delete(userId);
      await fetchUsers();
      setConfirmDialog((prev) => ({ ...prev, isOpen: false, loading: false }));
      showSuccess("User Deleted", "User has been successfully removed");
    } catch (error: unknown) {
      console.error("Error deleting user:", error);
      setConfirmDialog((prev) => ({ ...prev, loading: false }));

      let errorMessage = "Unable to delete user. Please try again.";

      if (error instanceof Error) {
        if (error.message.includes("Network Error")) {
          errorMessage =
            "Network error. Check if the backend server is running.";
        } else {
          errorMessage = error.message;
        }
      } else if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        const axiosError = error as {
          response?: {
            data?: { message?: string; error?: string };
            status?: number;
          };
        };

        if (axiosError.response?.status === 404) {
          errorMessage = "User not found or already deleted.";
        } else if (axiosError.response?.status === 403) {
          errorMessage = "You don't have permission to delete users.";
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      }

      showError("Delete Failed", errorMessage);
    }
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.fullName &&
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = filterRole === "all" || user.role === filterRole;

    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      case "customer":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="w-4 h-4" />;
      case "manager":
        return <UserCheck className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-iris"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Manage admin and manager accounts</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-iris text-white rounded-lg hover:bg-iris-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-iris focus:border-transparent"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) =>
            setFilterRole(
              e.target.value as "all" | "admin" | "manager" | "customer"
            )
          }
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-iris focus:border-transparent"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="customer">Customer</option>
        </select>
      </div>

      {/* User Registration Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl p-0 w-full max-w-2xl max-h-[95vh] overflow-hidden animate-slideUp transform">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-900 to-purple-600 p-6 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-white opacity-10 transform rotate-12 scale-150"></div>
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">Add New User</h3>
                  <p className="text-white/80 text-sm mt-1">
                    Create a new admin or manager account
                  </p>
                </div>
                <button
                  onClick={resetForm}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <UserIcon className="w-4 h-4 text-iris" />
                      <span>Full Name</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-iris/10 transition-all duration-300 bg-gray-50 focus:bg-white ${
                          formErrors.name
                            ? "border-red-300 focus:border-red-500"
                            : "border-gray-200 focus:border-iris"
                        }`}
                        placeholder="Enter full name"
                      />
                      {formErrors.name && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <Shield className="w-4 h-4 text-iris" />
                      <span>Role</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.role}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            role: e.target.value as "admin" | "manager",
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-iris focus:ring-4 focus:ring-iris/10 transition-all duration-300 bg-gray-50 focus:bg-white appearance-none"
                      >
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <Mail className="w-4 h-4 text-iris" />
                    <span>Email Address</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-iris/10 transition-all duration-300 bg-gray-50 focus:bg-white ${
                        formErrors.email
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-200 focus:border-iris"
                      }`}
                      placeholder="user@example.com"
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <Key className="w-4 h-4 text-iris" />
                    <span>Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-iris/10 transition-all duration-300 bg-gray-50 focus:bg-white ${
                        formErrors.password
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-200 focus:border-iris"
                      }`}
                      placeholder="Minimum 8 characters"
                    />
                    {formErrors.password && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.password}
                      </p>
                    )}
                  </div>
                 
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={formLoading}
                    className="px-8 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="relative px-8 py-3 bg-gradient-to-r from-purple-900 to-purple-600 text-white rounded-xl font-semibold hover:from-iris/90 hover:to-purple-600/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-lg"
                  >
                    {formLoading ? (
                      <div className="flex items-center space-x-3">
                        <svg
                          className="animate-spin w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Creating...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Plus className="w-5 h-5" />
                        <span>Create User</span>
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>

                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-iris flex items-center justify-center">
                          <Mail className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name ||
                            user.fullName ||
                            `${user.firstName || ""} ${
                              user.lastName || ""
                            }`.trim() ||
                            "No Name"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
                        user.role
                      )}`}
                    >
                      {getRoleIcon(user.role)}
                      <span className="capitalize">{user.role}</span>
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {/* Role Change Dropdown */}
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(
                            user.id,
                            e.target.value as "admin" | "manager" | "customer"
                          )
                        }
                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-iris"
                      >
                        <option value="customer">Customer</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No users found
          </h3>
          <p className="text-gray-600">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Get started by adding your first user"}
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-red-500" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {users.filter((u) => u.role === "admin").length}
              </h3>
              <p className="text-sm text-gray-600">Admins</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <UserCheck className="w-8 h-8 text-blue-500" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {users.filter((u) => u.role === "manager").length}
              </h3>
              <p className="text-sm text-gray-600">Managers</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-green-500" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {users.filter((u) => u.role === "customer").length}
              </h3>
              <p className="text-sm text-gray-600">Customers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.type === "delete" ? "Delete" : "Change Role"}
        type={confirmDialog.type === "delete" ? "danger" : "info"}
        loading={confirmDialog.loading}
      />
    </div>
  );
}
