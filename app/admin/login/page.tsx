"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { z } from "zod";
import { loginSchema, type LoginFormData } from "@/lib/validation";
import { setupAxiosInterceptors } from "@/lib/auth";
import axios from "axios";

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const message = searchParams.get("message");
    if (message) {
      setSuccessMessage(message);
    }

    // Setup axios interceptors for better token management
    setupAxiosInterceptors();
  }, [searchParams]);

  const validateForm = (): boolean => {
    try {
      loginSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        error.issues.forEach((err) => {
          const field = err.path[0] as keyof FormErrors;
          if (field) {
            newErrors[field] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      console.log("Admin login form data:", formData);
      const response = await axios.post(
        "http://localhost:3000/admin/auth/login", // Correct backend endpoint
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = response.data;
      console.log("Admin login response:", result);

      // Store token if provided
      if (result.access_token || result.accessToken || result.token) {
        console.log("Token found, processing admin data...");

        const token = result.access_token || result.accessToken || result.token;

        // Backend returns user object with id, email, name, role
        const adminUser = result.user || result.data || result;
        console.log("Admin user object:", adminUser);

        if (!adminUser || (!adminUser.email && !result.email)) {
          console.error("No user object in response");
          setErrors({
            general: "Invalid response from server. Please try again.",
          });
          return;
        }

        // Handle case where user data might be at the root level
        const userData = adminUser.email
          ? adminUser
          : {
              id: result.id || adminUser.id,
              email: result.email || adminUser.email,
              name: result.name || adminUser.name,
              role: result.role || adminUser.role,
            };

        // Check role from user object
        const userRole = userData.role;
        console.log("User role:", userRole);

        // Only allow admin role for admin login
        if (userRole === "admin") {
          // Map backend user structure to frontend AuthUser structure
          const mappedUser = {
            id: String(userData.id), // Convert to string if needed
            email: userData.email,
            fullName: userData.name,
            role: userData.role,
          };

          console.log("Mapped user for storage:", mappedUser);

          localStorage.setItem("admin", JSON.stringify(mappedUser));
          localStorage.setItem("adminId", String(userData.id));
          localStorage.setItem("adminAuthToken", token);
          localStorage.setItem("authToken", token); // Also store in general key for compatibility
          localStorage.setItem("userRole", "admin");

          // Set authorization header for future requests
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          console.log("Admin login successful, redirecting to dashboard...");
          router.push("/admin/dashboard");
        } else {
          console.log(
            "Access denied - user role is:",
            userRole,
            "but expected admin"
          );
          setErrors({ general: "Access denied. Admin role required." });
        }
      } else {
        console.error("No access_token in response:", result);
        setErrors({
          general:
            result.message ||
            result.error ||
            "Login failed. Please check your credentials.",
        });
      }
    } catch (error) {
      console.error("Admin login error:", error);
      console.log("Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        isAxiosError: axios.isAxiosError(error),
        response: axios.isAxiosError(error) ? error.response : null,
        status: axios.isAxiosError(error) ? error.response?.status : null,
        data: axios.isAxiosError(error) ? error.response?.data : null,
      });

      let errorMessage = "An error occurred. Please try again.";
      if (axios.isAxiosError(error)) {
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.status === 401) {
          errorMessage = "Invalid email or password";
        } else if (error.response?.status === 403) {
          errorMessage = "Access denied. Admin privileges required.";
        } else if (error.response?.status === 404) {
          errorMessage =
            "Login endpoint not found. Please check server configuration.";
        } else if (error.response?.status && error.response.status >= 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (
          error.code === "ECONNREFUSED" ||
          error.message.includes("Network Error")
        ) {
          errorMessage =
            "Cannot connect to server. Please check if the backend is running.";
        }
      }
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    // Clear general error
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: undefined }));
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="mb-4 justify-start">
          <Link
            href="/"
            className="text-gray-600 text-sm font-semibold flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
            {successMessage}
          </div>
        )}

        {/* Admin Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="text-center">
            <span className="text-3xl font-bold text-iris mb-4 inline-block">
              Admin Sign In
            </span>
            <p className="text-gray-600 text-sm mb-6">
              Access the admin dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* General Error */}
            {errors.general && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                {errors.general}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-iris focus:border-transparent ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your admin email"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-iris focus:border-transparent ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your admin password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-iris text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Signing In...
                </>
              ) : (
                <>
                  Sign In as Admin
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Additional Links */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Looking for manager access?{" "}
              <Link
                href="/manager/login"
                className="text-iris font-semibold hover:underline"
              >
                Manager Login
              </Link>
            </p>
            <p className="text-gray-600 text-sm mt-2">
              Regular user?{" "}
              <Link
                href="/login"
                className="text-iris font-semibold hover:underline"
              >
                User Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
