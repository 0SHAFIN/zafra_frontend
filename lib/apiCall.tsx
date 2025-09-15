import axios from "axios";
const apiUrl = "http://localhost:3000"; // main branch base URL

interface CustomerData {
  [key: string]: string | number | boolean; // Allow flexible customer data structure
}

export const updateCustomer = async (customerData: CustomerData) => {
  const token = localStorage.getItem("authToken");
  const response = await axios.post(
    `${apiUrl}/customer/update-customer`,
    customerData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// ---- Perfume (backend spec uses plural /perfumes) ----
export const getAllPerfumes = async () => {
  const response = await axios.get(`${apiUrl}/perfumes`);
  return response.data;
};

export const getPerfumeById = async (id: string) => {
  const response = await axios.get(`${apiUrl}/perfumes/${id}`);
  return response.data;
};

// ---- Cart (compat: backend may expect perfumeId OR productId) ----
export const addToCart = async (
  id: string,
  quantity: number,
  unitPrice: number
) => {
  const customerId = localStorage.getItem("customerId");
  const token = localStorage.getItem("authToken");

  if (!customerId) throw new Error("Missing customerId (user not logged in)");
  if (!token) throw new Error("Missing auth token (user not authenticated)");
  if (!id) throw new Error("product/perfume id is required");
  if (typeof quantity !== "number" || isNaN(quantity))
    throw new Error("quantity must be a number");
  if (quantity <= 0) throw new Error("quantity must be greater than 0");
  if (typeof unitPrice !== "number" || isNaN(unitPrice))
    throw new Error("unitPrice must be a number");

  const totalPrice = parseFloat((unitPrice * quantity).toFixed(2));
  // Send both keys for backward / forward compatibility
  const body = {
    customerId,
    productId: id,
    perfumeId: id,
    quantity,
    totalPrice,
  };

  try {
    const response = await axios.post(`${apiUrl}/customer/add-to-cart`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data;
      const serverMessage = Array.isArray(data?.message)
        ? data?.message.join(", ")
        : data?.message || error.message;
      let hint = "";
      if (status === 400) {
        if (serverMessage.toLowerCase().includes("totalprice"))
          hint = "Verify totalPrice = unitPrice * quantity";
        else if (serverMessage.toLowerCase().includes("perfumeid"))
          hint = "Sent perfumeId was empty or invalid";
      }
      console.error("AddToCart failed", {
        status,
        serverMessage,
        hint,
        requestBody: body,
        responseData: data,
      });
      throw new Error(
        `Add to cart failed (${status}): ${serverMessage}${
          hint ? " - " + hint : ""
        }`
      );
    }
    throw error;
  }
};

export const getAllCart = async () => {
  const token = localStorage.getItem("authToken");
  const customerId = localStorage.getItem("customerId");
  if (!customerId || !token) throw new Error("Authentication required");

  // Standardized empty cart structure
  const empty = {
    cartId: null,
    cartProducts: [],
    cartTotal: 0,
    cartQuantity: 0,
  };

  // Try legacy customer module endpoint
  try {
    const resp = await axios.post(
      `${apiUrl}/customer/get-all-carts`,
      { customerId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return resp.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      // Fallback to enhanced cart endpoints
      try {
        // active cart first
        const active = await axios.get(`${apiUrl}/cart/active/${customerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return active.data;
      } catch (err2) {
        if (axios.isAxiosError(err2) && err2.response?.status === 404) {
          try {
            const list = await axios.get(
              `${apiUrl}/cart/customer/${customerId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            return list.data;
          } catch (err3) {
            if (axios.isAxiosError(err3) && err3.response?.status === 404) {
              return empty; // No cart anywhere
            }
            console.error("Cart fetch error (customer list)", err3);
            throw err3;
          }
        }
        console.error("Cart fetch error (active fallback)", err2);
        throw err2;
      }
    }
    console.error("Cart fetch error (customer module)", err);
    throw err;
  }
};

export const deleteCart = async (cartId: string) => {
  const token = localStorage.getItem("authToken");
  if (!token) throw new Error("Authentication required");
  const response = await axios.delete(`${apiUrl}/customer/delete-cart`, {
    data: { cartId },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// ---- Orders ----
// Direct order (not from cart) spec: { customerId, perfumeId, quantity, shippingAddress, customerPhone, customerEmail, customerName }
export const createOrder = async (orderData: {
  perfumeId: string;
  quantity: number;
  shippingAddress: string;
  customerPhone: string;
  customerEmail: string;
  customerName: string;
}) => {
  const token = localStorage.getItem("authToken");
  const customerId = localStorage.getItem("customerId");
  if (!customerId || !token) throw new Error("Authentication required");
  const body = { customerId, ...orderData };
  const response = await axios.post(`${apiUrl}/orders`, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Order from cart (recommended) spec: { customerId, cartId, shippingAddress, customerPhone, customerEmail, customerName }
export const createOrderFromCart = async (
  cartId: string,
  orderData: {
    shippingAddress: string;
    customerPhone: string;
    customerEmail: string;
    customerName: string;
  }
) => {
  const token = localStorage.getItem("authToken");
  const customerId = localStorage.getItem("customerId");
  if (!customerId || !token) throw new Error("Authentication required");
  const body = { customerId, cartId, ...orderData };
  try {
    const response = await axios.post(`${apiUrl}/orders/from-cart`, body, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data;
      console.warn("Primary /orders/from-cart failed", { status, data });
      const fallbacks = [
        "/customer/create-order-from-cart",
        "/customer/create-order", // might accept cartId + derived items
        "/orders/create-from-cart",
        "/order/from-cart",
        "/order/create-from-cart",
      ];
      if (status === 404 || status === 400) {
        for (const path of fallbacks) {
          try {
            console.log(`Trying fallback order endpoint: ${path}`);
            const resp = await axios.post(`${apiUrl}${path}`, body, {
              headers: { Authorization: `Bearer ${token}` },
            });
            return resp.data;
          } catch (fbErr) {
            if (axios.isAxiosError(fbErr)) {
              console.warn(`Fallback ${path} failed`, {
                status: fbErr.response?.status,
                data: fbErr.response?.data,
              });
            } else {
              console.warn(`Fallback ${path} threw non-axios error`, fbErr);
            }
          }
        }
      }
      let msg: string | undefined;
      if (data && typeof data === "object" && "message" in data) {
        const maybeMsg = (data as { message?: unknown }).message;
        if (typeof maybeMsg === "string") msg = maybeMsg;
      }
      throw new Error(
        `All order creation endpoints failed. Last status: ${status} message: ${
          msg || (data ? JSON.stringify(data) : "unknown")
        }`
      );
    }
    throw error as Error;
  }
};

// (Optional) Additional order getters could be added here following the spec if needed

export const getAllOrders = async () => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("Authentication token not found. Please log in again.");
  }

  try {
    const response = await axios.get(`${apiUrl}/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Get all orders response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Get all orders failed:", error);
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || error.message;
      const statusCode = error.response?.status;

      throw new Error(`Failed to get orders (${statusCode}): ${errorMessage}`);
    }
    throw error;
  }
};

export const getOrdersByCustomer = async (customerId: string) => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("Authentication token not found. Please log in again.");
  }

  try {
    const response = await axios.get(
      `${apiUrl}/orders/customer/${customerId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Get orders by customer response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Get orders by customer failed:", error);
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || error.message;
      const statusCode = error.response?.status;

      throw new Error(
        `Failed to get customer orders (${statusCode}): ${errorMessage}`
      );
    }
    throw error;
  }
};

export const getPendingOrdersByCustomer = async (customerId: string) => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("Authentication token not found. Please log in again.");
  }

  try {
    const response = await axios.get(
      `${apiUrl}/orders/customer/${customerId}/pending`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Get pending orders by customer response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Get pending orders by customer failed:", error);
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || error.message;
      const statusCode = error.response?.status;

      throw new Error(
        `Failed to get pending orders (${statusCode}): ${errorMessage}`
      );
    }
    throw error;
  }
};

export const getDeliveredOrdersByCustomer = async (customerId: string) => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("Authentication token not found. Please log in again.");
  }

  try {
    const response = await axios.get(
      `${apiUrl}/orders/customer/${customerId}/delivered`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Get delivered orders by customer response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Get delivered orders by customer failed:", error);
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || error.message;
      const statusCode = error.response?.status;

      throw new Error(
        `Failed to get delivered orders (${statusCode}): ${errorMessage}`
      );
    }
    throw error;
  }
};

// Admin/Manager specific API calls
export const adminLogin = async (email: string, password: string) => {
  try {
    // Use the correct backend endpoint
    const response = await axios.post(`${apiUrl}/admin/auth/login`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Admin login failed:", error);
    throw error;
  }
};

export const managerLogin = async (email: string, password: string) => {
  try {
    // Both admin and manager use the same endpoint
    const response = await axios.post(`${apiUrl}/admin/auth/login`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Manager login failed:", error);
    throw error;
  }
};

// Admin specific endpoints
export const getAllUsers = async () => {
  const token = localStorage.getItem("authToken");
  const response = await axios.get(`${apiUrl}/admin/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Manager specific endpoints
export const getManagerOrders = async () => {
  const token = localStorage.getItem("authToken");

  // Try the new recommended endpoint pattern first
  try {
    const response = await axios.get(`${apiUrl}/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.log("New orders endpoint failed, trying fallback:", error);

    // Fallback to old endpoint
    const response = await axios.get(`${apiUrl}/manager/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  const token = localStorage.getItem("authToken");

  // Try the new recommended endpoint pattern first
  try {
    const response = await axios.patch(
      `${apiUrl}/orders/${orderId}`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log("New order update endpoint failed, trying fallback:", error);

    // Fallback to old endpoint
    const response = await axios.patch(
      `${apiUrl}/manager/orders/${orderId}`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  }
};
