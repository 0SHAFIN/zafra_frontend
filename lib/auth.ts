import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  role: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Set up axios interceptor for token management
export const setupAxiosInterceptors = () => {
  // Only set up interceptors on the client side
  if (typeof window === "undefined") {
    return;
  }

  // Request interceptor to add token to headers
  axios.interceptors.request.use(
    (config) => {
      // Try to get token based on user role first, then fallback to general token
      const userRole = localStorage.getItem("userRole");
      let token: string | null = null;

      switch (userRole) {
        case "admin":
          token =
            localStorage.getItem("adminAuthToken") ||
            localStorage.getItem("authToken");
          break;
        case "manager":
          token =
            localStorage.getItem("managerAuthToken") ||
            localStorage.getItem("authToken");
          break;
        default:
          token = localStorage.getItem("authToken");
          break;
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle token expiration
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Only redirect if user was actually authenticated (had a token)
        const hasToken =
          localStorage.getItem("authToken") ||
          localStorage.getItem("adminAuthToken") ||
          localStorage.getItem("managerAuthToken");

        if (hasToken) {
          // Token expired or invalid, clear data and redirect
          clearAuthData();
          window.location.href = "/login";
        }
        // If no token, this was just an unauthorized request (user browsing without auth)
        // Don't redirect, just let the component handle it
      }
      return Promise.reject(error);
    }
  );
};

export const clearAuthData = () => {
  // Only access localStorage on the client side
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("user");
  localStorage.removeItem("authToken");
  localStorage.removeItem("customerId");
  localStorage.removeItem("admin");
  localStorage.removeItem("adminAuthToken");
  localStorage.removeItem("adminId");
  localStorage.removeItem("manager");
  localStorage.removeItem("managerAuthToken");
  localStorage.removeItem("managerId");
  localStorage.removeItem("userRole");
  delete axios.defaults.headers.common["Authorization"];
};

export const getAuthData = (): AuthState => {
  if (typeof window === "undefined") {
    return {
      user: null,
      token: null,
      role: null,
      isLoading: false,
      isAuthenticated: false,
    };
  }

  const userRole = localStorage.getItem("userRole");
  let user: AuthUser | null = null;
  let token: string | null = null;

  try {
    switch (userRole) {
      case "admin":
        user = JSON.parse(localStorage.getItem("admin") || "null");
        token =
          localStorage.getItem("adminAuthToken") ||
          localStorage.getItem("authToken");
        break;
      case "manager":
        user = JSON.parse(localStorage.getItem("manager") || "null");
        token =
          localStorage.getItem("managerAuthToken") ||
          localStorage.getItem("authToken");
        break;
      case "user":
      default:
        user = JSON.parse(localStorage.getItem("user") || "null");
        token = localStorage.getItem("authToken");
        break;
    }
  } catch (error) {
    console.error("Error parsing auth data:", error);
    clearAuthData();
  }

  return {
    user,
    token,
    role: userRole,
    isLoading: false,
    isAuthenticated: !!(user && token),
  };
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    role: null,
    isLoading: true,
    isAuthenticated: false,
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const authData = getAuthData();
    setAuthState({ ...authData, isLoading: false });
  }, []);

  // Don't return authenticated state until hydrated to prevent hydration mismatch
  return {
    ...authState,
    isLoading: authState.isLoading || !hydrated,
    isAuthenticated: hydrated ? authState.isAuthenticated : false,
    login: (userData: AuthUser, token: string, role: string) => {
      const roleKey =
        role === "admin" ? "admin" : role === "manager" ? "manager" : "user";
      const tokenKey =
        role === "admin"
          ? "adminAuthToken"
          : role === "manager"
          ? "managerAuthToken"
          : "authToken";
      const idKey =
        role === "admin"
          ? "adminId"
          : role === "manager"
          ? "managerId"
          : "customerId";

      localStorage.setItem(roleKey, JSON.stringify(userData));
      localStorage.setItem(tokenKey, token);
      localStorage.setItem(idKey, userData.id);
      localStorage.setItem("userRole", role);

      // Also store in general authToken for compatibility
      localStorage.setItem("authToken", token);

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setAuthState({
        user: userData,
        token,
        role,
        isLoading: false,
        isAuthenticated: true,
      });
    },
    logout: () => {
      clearAuthData();
      setAuthState({
        user: null,
        token: null,
        role: null,
        isLoading: false,
        isAuthenticated: false,
      });
    },
  };
};

export const useAuthRedirect = (requiredRole?: string) => {
  const router = useRouter();
  const { user, token, role, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user || !token) {
        // Not authenticated, redirect to appropriate login
        if (requiredRole === "admin") {
          router.push("/admin/login");
        } else if (requiredRole === "manager") {
          router.push("/manager/login");
        } else {
          router.push("/login");
        }
      } else if (requiredRole && role !== requiredRole) {
        // Wrong role, redirect to appropriate dashboard
        if (role === "admin") {
          router.push("/admin/dashboard");
        } else if (role === "manager") {
          router.push("/manager/dashboard");
        } else {
          router.push("/");
        }
      }
    }
  }, [user, token, role, isLoading, requiredRole, router]);

  return { user, token, role, isLoading, isAuthenticated: !!(user && token) };
};

// Hook for checking auth without redirects (for conditional UI)
export const useAuthCheck = () => {
  const { user, token, role, isLoading, isAuthenticated, login, logout } =
    useAuth();

  return {
    user,
    token,
    role,
    isLoading,
    isAuthenticated,
    login,
    logout,
    requireAuth: (action: () => void, redirectTo: string = "/login") => {
      if (isAuthenticated) {
        action();
      } else {
        window.location.href = redirectTo;
      }
    },
  };
};

export const redirectToDashboard = (role: string) => {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "manager":
      return "/manager/dashboard";
    default:
      return "/";
  }
};
