import axios from "axios";

const BASE_URL = "http://localhost:3000";

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
    const token = localStorage.getItem("authToken");
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
        localStorage.removeItem("user");
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: string;
  email: string;
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
  price: number;
  category: string;
  stock: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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

// ===== ADMIN AUTHENTICATION =====
export const adminAuth = {
  login: async (email: string, password: string) => {
    const response = await api.post("/admin/auth/login", { email, password });
    return response.data;
  },

  register: async (userData: {
    email: string;
    password: string;
    fullName: string;
    role: "admin" | "manager";
  }) => {
    const response = await api.post("/admin/auth/register", userData);
    return response.data;
  },
};

// ===== PERFUME MANAGEMENT =====
export const productAPI = {
  // Get all perfumes (public) - GET /perfume
  getAll: async (): Promise<Product[]> => {
    const response = await api.get("/perfume");
    return response.data;
  },

  // Get all perfumes for admin (same as public for now)
  getAllAdmin: async (): Promise<Product[]> => {
    const response = await api.get("/perfume");
    return response.data;
  },

  // Get single perfume by ID - GET /perfume/:id
  getById: async (id: string): Promise<Product> => {
    const response = await api.get(`/perfume/${id}`);
    return response.data;
  },

  // Create new perfume - POST /perfume
  create: async (
    productData: Omit<Product, "id" | "createdAt" | "updatedAt">
  ) => {
    const response = await api.post("/perfume", productData);
    return response.data;
  },

  // Update existing perfume - PUT /perfume/:id
  update: async (id: string, productData: Partial<Product>) => {
    const response = await api.put(`/perfume/${id}`, productData);
    return response.data;
  },

  // Delete perfume - DELETE /perfume/:id
  delete: async (id: string) => {
    const response = await api.delete(`/perfume/${id}`);
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
  // Get all users
  getAll: async (): Promise<User[]> => {
    const response = await api.get("/admin/users");
    return response.data;
  },

  // Change user role
  changeRole: async (
    userId: string,
    role: "admin" | "manager" | "customer"
  ) => {
    const response = await api.patch(`/admin/user/${userId}/role`, { role });
    return response.data;
  },

  // Delete user
  delete: async (userId: string) => {
    const response = await api.delete(`/admin/user/${userId}`);
    return response.data;
  },
};

// ===== ORDER MANAGEMENT =====
export const orderAPI = {
  // Create new order - POST /orders
  create: async (orderData: Omit<Order, "id" | "createdAt" | "updatedAt">) => {
    const response = await api.post("/orders", orderData);
    return response.data;
  },

  // Create order from cart - POST /orders/from-cart
  createFromCart: async (cartId: string) => {
    const response = await api.post("/orders/from-cart", { cartId });
    return response.data;
  },

  // Get all orders - GET /orders
  getAll: async (): Promise<Order[]> => {
    const response = await api.get("/orders");
    return response.data;
  },

  // Get orders by customer - GET /orders/customer/:customerId
  getByCustomer: async (customerId: string): Promise<Order[]> => {
    const response = await api.get(`/orders/customer/${customerId}`);
    return response.data;
  },

  // Get single order - GET /orders/:id
  getById: async (orderId: string): Promise<Order> => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  // Update order status - PUT /orders/:id/status
  updateStatus: async (orderId: string, status: Order["status"]) => {
    const response = await api.put(`/orders/${orderId}/status`, { status });
    return response.data;
  },

  // Delete order - DELETE /orders/:id (admin only)
  delete: async (orderId: string) => {
    const response = await api.delete(`/orders/${orderId}`);
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
      const [users, ordersResponse, products] = await Promise.all([
        userAPI.getAll(),
        orderAPI.getAll(),
        productAPI.getAllAdmin(),
      ]);

      // Ensure orders is an array
      const orders = Array.isArray(ordersResponse) ? ordersResponse : [];

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
        orderAPI.getAll(),
        productAPI.getAll(),
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
  // Get manager info
  getInfo: async () => {
    const response = await api.get("/manager");
    return response.data;
  },

  // Upload image
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

  // Get image
  getImage: async (imageName: string) => {
    const response = await api.get(`/manager/getimage/${imageName}`);
    return response.data;
  },
};

export default api;
