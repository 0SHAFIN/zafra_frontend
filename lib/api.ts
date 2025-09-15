import axios from "axios";

const BASE_URL = "http://localhost:3000";

// Utility function to construct full image URLs
export const getImageUrl = (rawImagePath?: string | null): string => {
  const PLACEHOLDER =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCA2MEgxMjBWMTIwSDgwVjYwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNNjAgMTIwSDE0MFYxNDA2MEgxNDBaIiBmaWxsPSIjNkI3MjgwIi8+CjwvZz4KPC9zdmc+";

  if (!rawImagePath || typeof rawImagePath !== "string") {
    if (process.env.NODE_ENV !== "production") {
      console.debug("getImageUrl: missing image path, using placeholder");
    }
    return PLACEHOLDER;
  }

  let imagePath = rawImagePath.trim();
  if (!imagePath) return PLACEHOLDER;

  // Already absolute (http/https/data)
  if (/^(https?:|data:)/i.test(imagePath)) return imagePath;

  // Handle Windows drive paths (e.g., C:\images\file.jpg) by taking the last segment
  if (/^[A-Za-z]:\\/.test(imagePath)) {
    const parts = imagePath.split(/[/\\]+/);
    imagePath = parts[parts.length - 1] || imagePath;
  }

  // Normalize backslashes to forward slashes
  imagePath = imagePath.replace(/\\/g, "/");

  // Remove leading ./ or ../ sequences
  imagePath = imagePath.replace(/^(\.\/)+/, "").replace(/^(\.\.\/)+/, "");

  // Strip leading public/ if present
  imagePath = imagePath.replace(/^public\//i, "");

  // Collapse duplicate slashes
  imagePath = imagePath.replace(/\/+/g, "/");

  // If it became empty, fallback
  if (!imagePath) return PLACEHOLDER;

  // If starts with a slash now, join with BASE_URL
  if (imagePath.startsWith("/")) {
    return `${BASE_URL}${imagePath}`;
  }

  // Common asset folder prefixes (uploads, images, img, assets)
  if (/^(uploads|images|img|assets)\/./i.test(imagePath)) {
    return `${BASE_URL}/${imagePath}`;
  }

  // If path contains directories (e.g., somefolder/file.jpg) keep as provided under base
  if (imagePath.includes("/")) {
    return `${BASE_URL}/${imagePath}`;
  }

  // Fallback: treat as bare filename in uploads directory
  return `${BASE_URL}/uploads/${imagePath}`;
};

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    // Check for token in multiple possible keys for backward compatibility
    const token =
      localStorage.getItem("authToken") ||
      localStorage.getItem("adminAuthToken") ||
      localStorage.getItem("managerAuthToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data on unauthorized
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
        localStorage.removeItem("adminAuthToken");
        localStorage.removeItem("managerAuthToken");
        localStorage.removeItem("user");
        localStorage.removeItem("admin");
        localStorage.removeItem("manager");
        localStorage.removeItem("userRole");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: string;
  email: string;
  name?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  role: "admin" | "manager" | "customer";
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number | string;
  category: string;
  stock: number | string;
  brand: string;
  image: string;
  discount: number | string;
  cartProducts?: CartItem[];
  orderProducts?: OrderItem[];
  reviews?: Review[];
}

export interface Cart {
  id: string;
  customerId: string;
  items: CartItem[];
  totalAmount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  perfumeId: string;
  perfumeName: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface Customer {
  id: string;
  email: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName?: string;
  items: OrderItem[];
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  perfumeId: string;
  perfumeName: string;
  quantity: number;
  price: number;
}

export interface Review {
  id: string;
  customerId: string;
  customerName?: string;
  perfumeId: string;
  perfumeName?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  todayRevenue: number;
  monthlyGrowth: number;
}

// ===== AUTHENTICATION =====
export const authAPI = {
  // Universal login for customers, admins, and managers
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  // Signup for customers
  signup: async (userData: {
    email: string;
    password: string;
    fullName: string;
    phone: number;
    address: string;
  }) => {
    const response = await api.post("/auth/signup", userData);
    return response.data;
  },

  // Get profile (requires auth)
  getProfile: async () => {
    const response = await api.get("/auth/profile");
    return response.data;
  },
};

// ===== ADMIN AUTHENTICATION =====
export const adminAuth = {
  login: async (email: string, password: string) => {
    // Use the new unified login endpoint
    const response = await authAPI.login(email, password);
    return response;
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    role: "admin" | "manager";
  }) => {
    console.log("=== USER REGISTRATION DEBUG ===");
    console.log("Request data:", userData);

    // Try different data formats that backends commonly expect
    const formats = [
      // Format 1: As provided
      userData,
      // Format 2: With fullName instead of name
      { ...userData, fullName: userData.name },
      // Format 3: Separate first/last name
      {
        ...userData,
        firstName: userData.name.split(" ")[0] || userData.name,
        lastName: userData.name.split(" ").slice(1).join(" ") || "",
      },
      // Format 4: Role in uppercase
      { ...userData, role: userData.role.toUpperCase() },
    ];

    // Try different endpoints with different data formats
    const endpoints = [
      "/admin/auth/register",
      "/admin/users",
      "/admin/user/create",
      "/admin/register",
      "/auth/register",
    ];

    for (const endpoint of endpoints) {
      for (const [index, format] of formats.entries()) {
        try {
          console.log(`Trying ${endpoint} with format ${index + 1}:`, format);
          const response = await api.post(endpoint, format);
          console.log(
            `✅ Success with ${endpoint} format ${index + 1}:`,
            response.data
          );
          return response.data;
        } catch {
          console.log(`❌ Failed ${endpoint} format ${index + 1}`);
        }
      }
    }

    throw new Error(
      "All registration endpoints and formats failed. Please check backend API documentation."
    );
  },
};

// ===== PERFUME MANAGEMENT =====
export const productAPI = {
  // Get all perfumes (public) - GET /perfumes
  getAll: async (): Promise<Product[]> => {
    const response = await api.get("/perfumes");
    return response.data;
  },

  // Get all perfumes for admin - GET /perfumes (same endpoint, public)
  getAllAdmin: async (): Promise<Product[]> => {
    const response = await api.get("/perfumes");
    return response.data;
  },

  // Get single perfume by ID - GET /perfumes/:id
  getById: async (id: string): Promise<Product> => {
    const response = await api.get(`/perfumes/${id}`);
    return response.data;
  },

  // Create new perfume - POST /perfumes
  create: async (
    productData: Omit<
      Product,
      "id" | "cartProducts" | "orderProducts" | "reviews"
    >
  ) => {
    const response = await api.post("/perfumes", productData);
    return response.data;
  },

  // Update existing perfume - PUT /perfumes/:id
  update: async (id: string, productData: Partial<Product>) => {
    const response = await api.put(`/perfumes/${id}`, productData);
    return response.data;
  },

  // Delete perfume - DELETE /perfumes/:id
  delete: async (id: string) => {
    const response = await api.delete(`/perfumes/${id}`);
    return response.data;
  },
};

// ===== CART MANAGEMENT =====
export const cartAPI = {
  // Add product to cart - POST /cart/add
  addProduct: async (perfumeId: string, quantity: number) => {
    const response = await api.post("/cart/add", { perfumeId, quantity });
    return response.data;
  },

  // Get all carts by customer ID - GET /cart/customer/:customerId
  getByCustomer: async (customerId: string): Promise<Cart[]> => {
    const response = await api.get(`/cart/customer/${customerId}`);
    return response.data;
  },

  // Get cart by ID - GET /cart/:id
  getById: async (cartId: string): Promise<Cart> => {
    const response = await api.get(`/cart/${cartId}`);
    return response.data;
  },

  // Update cart - PUT /cart/:id
  update: async (cartId: string, cartData: Partial<Cart>) => {
    const response = await api.put(`/cart/${cartId}`, cartData);
    return response.data;
  },

  // Delete cart - DELETE /cart/:id
  delete: async (cartId: string) => {
    const response = await api.delete(`/cart/${cartId}`);
    return response.data;
  },

  // Get active cart for customer - GET /cart/active/:customerId
  getActiveByCustomer: async (customerId: string): Promise<Cart> => {
    const response = await api.get(`/cart/active/${customerId}`);
    return response.data;
  },

  // Clear cart - PUT /cart/clear/:id
  clear: async (cartId: string) => {
    const response = await api.put(`/cart/clear/${cartId}`);
    return response.data;
  },

  // Remove specific product from cart - DELETE /cart/product/:cartId/:perfumeId
  removeProduct: async (cartId: string, perfumeId: string) => {
    const response = await api.delete(`/cart/product/${cartId}/${perfumeId}`);
    return response.data;
  },
};

// ===== CUSTOMER MANAGEMENT =====
export const customerAPI = {
  // Create new customer - POST /customer/create
  create: async (
    customerData: Omit<Customer, "id" | "createdAt" | "updatedAt">
  ) => {
    const response = await api.post("/customer/create", customerData);
    return response.data;
  },

  // Update customer details - POST /customer/update-customer (auth required)
  update: async (customerData: Partial<Customer>) => {
    const response = await api.post("/customer/update-customer", customerData);
    return response.data;
  },

  // Get customer details - POST /customer/get-customer (auth required)
  get: async (): Promise<Customer> => {
    const response = await api.post("/customer/get-customer");
    return response.data;
  },

  // Cart Operations
  addToCart: async (
    perfumeId: string,
    quantity: number,
    totalPrice: number
  ) => {
    const response = await api.post("/customer/add-to-cart", {
      perfumeId,
      quantity,
      totalPrice,
    });
    return response.data;
  },

  getAllCarts: async (): Promise<Cart[]> => {
    const response = await api.post("/customer/get-all-carts");
    return response.data;
  },

  deleteCart: async (cartId: string) => {
    const response = await api.delete("/customer/delete-cart", {
      data: { cartId },
    });
    return response.data;
  },

  // Order Operations
  createOrder: async (
    orderData: Omit<Order, "id" | "createdAt" | "updatedAt">
  ) => {
    const response = await api.post("/customer/create-order", orderData);
    return response.data;
  },

  getAllPendingOrders: async (): Promise<Order[]> => {
    const response = await api.post("/customer/get-all-pending-orders");
    return response.data;
  },

  getAllDeliveredOrders: async (): Promise<Order[]> => {
    const response = await api.post("/customer/get-all-delivered-orders");
    return response.data;
  },

  getAllOrders: async (): Promise<Order[]> => {
    const response = await api.post("/customer/get-all-orders");
    return response.data;
  },
};

// ===== USER MANAGEMENT (Admin only) =====
export const userAPI = {
  // Get all users - GET /admin/users
  getAll: async (): Promise<User[]> => {
    const response = await api.get("/admin/users");
    return response.data;
  },

  // Change user role - PATCH /admin/user/{userId}/role
  changeRole: async (
    userId: string,
    role: "admin" | "manager" | "customer"
  ) => {
    console.log(`Attempting to change role for user ${userId} to ${role}`);

    // Convert string ID to number for backend compatibility
    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId)) {
      throw new Error(`Invalid user ID: ${userId}. Expected a numeric ID.`);
    }

    console.log(`Original role value: "${role}" (type: ${typeof role})`);

    // Try the correct backend endpoint first, then fallbacks
    const attempts = [
      {
        method: "patch",
        endpoint: `/admin/user/${numericUserId}/role`,
        data: { role: role },
      },
      {
        method: "patch",
        endpoint: `/admin/user/${userId}/role`,
        data: { role },
      },
      {
        method: "put",
        endpoint: `/admin/user/${numericUserId}/role`,
        data: { role },
      },
      { method: "put", endpoint: `/admin/user/${userId}/role`, data: { role } },
      {
        method: "patch",
        endpoint: `/admin/users/${numericUserId}/role`,
        data: { role },
      },
      {
        method: "patch",
        endpoint: `/user/${numericUserId}/role`,
        data: { role },
      },
      { method: "patch", endpoint: `/admin/user/${userId}`, data: { role } },
    ];

    for (const attempt of attempts) {
      try {
        console.log(
          `Trying ${attempt.method.toUpperCase()} ${attempt.endpoint}`
        );
        console.log(`Sending data:`, attempt.data);

        let response;
        if (attempt.method === "patch") {
          response = await api.patch(attempt.endpoint, attempt.data);
        } else {
          response = await api.put(attempt.endpoint, attempt.data);
        }
        console.log(
          `✅ Success with ${attempt.method.toUpperCase()} ${attempt.endpoint}`
        );
        console.log(`Response:`, response.data);
        return response.data;
      } catch (error) {
        console.log(
          `❌ Failed with ${attempt.method.toUpperCase()} ${attempt.endpoint}:`,
          error
        );

        // Log detailed error information
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as {
            response?: { status?: number; data?: unknown; statusText?: string };
          };
          console.log(`   Status: ${axiosError.response?.status}`);
          console.log(`   Status Text: ${axiosError.response?.statusText}`);
          console.log(`   Response Data:`, axiosError.response?.data);
        }

        // Store the last error for potential use
        if (attempts.indexOf(attempt) === attempts.length - 1) {
          // This is the last attempt, throw with better context
          let errorMsg =
            "Role update failed. The backend API endpoints may not be configured correctly.";

          if (error && typeof error === "object" && "response" in error) {
            const axiosError = error as {
              response?: {
                status?: number;
                statusText?: string;
                data?: { message?: string };
              };
            };
            if (axiosError.response?.status) {
              errorMsg = `Role update failed. Backend returned: ${
                axiosError.response.status
              } ${axiosError.response.statusText || "Unknown error"}`;
              if (axiosError.response.data?.message) {
                errorMsg += ` - ${axiosError.response.data.message}`;
              }
            }
          }

          throw new Error(errorMsg);
        }
      }
    }

    // This should never be reached due to the throw in the loop
    throw new Error(
      "Failed to update user role. All endpoints tried unsuccessfully."
    );
  },

  // Delete user - DELETE /admin/user/{userId}
  delete: async (userId: string) => {
    console.log(`Attempting to delete user ${userId}`);

    // Convert string ID to number for backend compatibility
    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId)) {
      throw new Error(`Invalid user ID: ${userId}. Expected a numeric ID.`);
    }

    // Try different endpoints for user deletion
    const attempts = [
      `/admin/user/${numericUserId}`,
      `/admin/user/${userId}`,
      `/admin/users/${numericUserId}`,
      `/admin/users/${userId}`,
      `/users/${numericUserId}`,
    ];

    for (const endpoint of attempts) {
      try {
        console.log(`Trying DELETE ${endpoint}`);
        const response = await api.delete(endpoint);
        console.log(`✅ Success with DELETE ${endpoint}`);
        return response.data;
      } catch (error) {
        console.log(`❌ Failed with DELETE ${endpoint}:`, error);
      }
    }

    throw new Error(
      `Failed to delete user. All endpoints tried unsuccessfully.`
    );
  },

  // Create user - POST /admin/auth/register (same as adminAuth.register)
  create: async (userData: {
    name: string;
    email: string;
    password: string;
    role: "admin" | "manager";
  }) => {
    const response = await api.post("/admin/auth/register", userData);
    return response.data;
  },
};

// ===== ORDER MANAGEMENT =====
export const orderAPI = {
  // Create new order - POST /orders (general) or POST /admin/order/create (admin)
  create: async (orderData: Omit<Order, "id" | "createdAt" | "updatedAt">) => {
    const response = await api.post("/admin/order/create", orderData);
    return response.data;
  },

  // Create order from cart - POST /orders/from-cart
  createFromCart: async (cartId: string) => {
    const response = await api.post("/orders/from-cart", { cartId });
    return response.data;
  },

  // Get all orders - GET /admin/orders (admin) or GET /manager/orders (manager)
  getAll: async (): Promise<Order[]> => {
    console.log("🔍 Attempting to fetch orders from /admin/orders");

    // Log current authentication state
    if (typeof window !== "undefined") {
      const userRole = localStorage.getItem("userRole");
      const adminToken = localStorage.getItem("adminAuthToken");
      const generalToken = localStorage.getItem("authToken");
      console.log("🔑 Auth state:", {
        userRole,
        hasAdminToken: !!adminToken,
        hasGeneralToken: !!generalToken,
      });
    }

    try {
      const response = await api.get("/admin/orders");
      console.log("✅ Orders API success:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Orders API failed:", error);
      if (axios.isAxiosError(error)) {
        console.error("📊 Error details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
        });
      }
      throw error;
    }
  },

  // Get orders by customer - GET /orders/customer/:customerId
  getByCustomer: async (customerId: string): Promise<Order[]> => {
    const response = await api.get(`/orders/customer/${customerId}`);
    return response.data;
  },

  // Get single order - GET /admin/order/:id
  getById: async (orderId: string): Promise<Order> => {
    const response = await api.get(`/admin/order/${orderId}`);
    return response.data;
  },

  // Update order status - PUT /admin/order/:id/status
  updateStatus: async (orderId: string, status: Order["status"]) => {
    const response = await api.put(`/admin/order/${orderId}/status`, {
      status,
    });
    return response.data;
  },

  // Delete order - DELETE /admin/order/:id (admin only)
  delete: async (orderId: string) => {
    const response = await api.delete(`/admin/order/${orderId}`);
    return response.data;
  },
};

// ===== REVIEW MANAGEMENT (Admin only) =====
export const reviewAPI = {
  // Get all reviews
  getAll: async (): Promise<Review[]> => {
    const response = await api.get("/admin/reviews");
    return response.data;
  },

  // Get single review
  getById: async (reviewId: string): Promise<Review> => {
    const response = await api.get(`/admin/review/${reviewId}`);
    return response.data;
  },

  // Delete review
  delete: async (reviewId: string) => {
    const response = await api.delete(`/admin/review/${reviewId}`);
    return response.data;
  },
};

// ===== DASHBOARD STATS =====
export const dashboardAPI = {
  // Get admin dashboard stats
  getAdminStats: async (): Promise<DashboardStats> => {
    try {
      // Since we don't have a dedicated stats endpoint, we'll fetch data and calculate
      // Handle orders API failure gracefully since it's currently returning 500
      let orders: Order[] = [];

      try {
        console.log("🎯 Attempting to fetch orders for dashboard stats...");
        const ordersResponse = await orderAPI.getAll();
        orders = Array.isArray(ordersResponse) ? ordersResponse : [];
        console.log(
          `✅ Successfully fetched ${orders.length} orders for dashboard stats`
        );
      } catch (error) {
        console.warn(
          "⚠️ Failed to fetch orders for dashboard stats - using empty data:",
          error
        );
        // Ensure we always have an empty array
        orders = [];

        // Log additional error details for debugging
        if (axios.isAxiosError(error)) {
          console.warn("📊 Orders API error details:", {
            status: error.response?.status,
            statusText: error.response?.statusText,
            message: error.message,
            data: error.response?.data,
          });
        }
      }

      console.log("🎯 Fetching users and products data...");
      let users: User[] = [];
      let products: Product[] = [];

      try {
        const [usersResponse, productsResponse] = await Promise.all([
          userAPI.getAll(),
          productAPI.getAllAdmin(),
        ]);
        users = usersResponse || [];
        products = productsResponse || [];
        console.log(
          `✅ Fetched ${users.length} users and ${products.length} products`
        );
      } catch (error) {
        console.error("❌ Failed to fetch users/products data:", error);
        throw error; // Re-throw this error since we need this data
      }

      const totalRevenue = orders.reduce(
        (sum, order) => sum + (order.totalAmount || 0),
        0
      );
      const pendingOrders = orders.filter(
        (order) => order.status === "pending"
      ).length;
      const completedOrders = orders.filter(
        (order) => order.status === "delivered"
      ).length;

      // Calculate today's revenue
      const today = new Date().toDateString();
      const todayRevenue = orders
        .filter((order) => new Date(order.createdAt).toDateString() === today)
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      return {
        totalUsers: users.length,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalRevenue,
        pendingOrders,
        completedOrders,
        todayRevenue,
        monthlyGrowth: 12.5, // Placeholder - would need historical data to calculate
      };
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      throw error;
    }
  },

  // Get manager dashboard stats
  getManagerStats: async (): Promise<DashboardStats> => {
    try {
      const [ordersResponse, products] = await Promise.all([
        managerAPI.getOrders(), // Use manager-specific endpoint
        managerAPI.getProducts(), // Use manager-specific endpoint
      ]);

      // Ensure orders is an array
      const orders = Array.isArray(ordersResponse) ? ordersResponse : [];

      const pendingOrders = orders.filter(
        (order) => order.status === "pending"
      ).length;
      const completedOrders = orders.filter(
        (order) => order.status === "delivered"
      ).length;

      // Calculate today's revenue
      const today = new Date().toDateString();
      const todayRevenue = orders
        .filter((order) => new Date(order.createdAt).toDateString() === today)
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      return {
        totalUsers: 0, // Managers don't need user stats
        totalOrders: orders.length,
        totalProducts: products.length,
        totalRevenue: orders.reduce(
          (sum, order) => sum + (order.totalAmount || 0),
          0
        ),
        pendingOrders,
        completedOrders,
        todayRevenue,
        monthlyGrowth: 8.3, // Placeholder
      };
    } catch (error) {
      console.error("Error fetching manager stats:", error);
      throw error;
    }
  },
};

// ===== MANAGER SPECIFIC =====
export const managerAPI = {
  // Get manager info - GET /manager/info
  getInfo: async () => {
    const response = await api.get("/manager/info");
    return response.data;
  },

  // Upload image - POST /manager/upload
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await api.post("/manager/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Get image - GET /manager/getimage/:imageName
  getImage: async (imageName: string) => {
    const response = await api.get(`/manager/getimage/${imageName}`);
    return response.data;
  },

  // Get manager products - GET /perfumes (public endpoint)
  getProducts: async (): Promise<Product[]> => {
    const response = await api.get("/perfumes");
    return response.data;
  },

  // Update product (manager can only update, not create/delete) - PUT /perfumes/:id
  updateProduct: async (id: string, productData: Partial<Product>) => {
    const response = await api.put(`/perfumes/${id}`, productData);
    return response.data;
  },

  // Get manager orders - GET /manager/orders
  getOrders: async (): Promise<Order[]> => {
    const response = await api.get("/manager/orders");
    return response.data;
  },

  // Update order status - PUT /manager/order/:id/status
  updateOrderStatus: async (orderId: string, status: Order["status"]) => {
    const response = await api.put(`/manager/order/${orderId}/status`, {
      status,
    });
    return response.data;
  },
};

export default api;
