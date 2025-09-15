import axios from "axios";

const BASE = "http://localhost:3000";

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItemInput {
  id?: string;
  perfumeId: string;
  perfumeName: string;
  quantity: number;
  price: number; // unit price
}

export interface CreateOrderInput {
  customerId: string;
  customerName?: string;
  shippingAddress: string;
  items: OrderItemInput[];
  totalAmount: number;
  status?: OrderStatus;
}

export interface OrderRecord {
  id: string;
  customerId: string;
  customerName?: string;
  items: OrderItemInput[];
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: string;
  createdAt: string;
  updatedAt?: string;
}

type Attempt = {
  method: "get" | "post" | "patch" | "delete";
  url: string;
  data?: unknown;
};

function authHeader() {
  if (typeof window === "undefined") return {};
  const token =
    localStorage.getItem("authToken") ||
    localStorage.getItem("adminAuthToken") ||
    localStorage.getItem("managerAuthToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function tryEndpoints<T>(
  attempts: Attempt[],
  allowStatuses: number[] = [404, 400]
) {
  let lastErr: unknown;
  for (const a of attempts) {
    try {
      const resp = await axios.request<T>({
        method: a.method,
        url: `${BASE}${a.url}`,
        data: a.data,
        headers: { ...authHeader(), "Content-Type": "application/json" },
      });
      return resp.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401) {
          console.warn("orderService auth failure on", a.url, {
            status,
            data: err.response?.data,
          });
          throw err;
        }
        if (!status || !allowStatuses.includes(status)) {
          lastErr = err;
          continue;
        }
        lastErr = err;
      } else {
        lastErr = err;
      }
    }
  }
  throw lastErr || new Error("All endpoint attempts failed");
}

// Normalize raw array of unknown orders to OrderRecord[]
function isRecord(val: unknown): val is Record<string, unknown> {
  return !!val && typeof val === "object" && !Array.isArray(val);
}

function normalizeOrders(raw: unknown[]): OrderRecord[] {
  const out: OrderRecord[] = [];
  const seen = new Set<string>();
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    if (!isRecord(entry)) continue;
    const o = entry;
    const id = String(o.id || "");
    if (!id || seen.has(id)) continue;
    const rawItemsCandidate =
      (o.items as unknown) ||
      (isRecord(o.orderProducts)
        ? [o.orderProducts]
        : (o.orderProducts as unknown)) ||
      (o.orderProducts as unknown) ||
      (o.cartProducts as unknown);
    const rawItems = rawItemsCandidate as unknown;
    const items: OrderItemInput[] = Array.isArray(rawItems)
      ? rawItems
          .filter((it) => it && typeof it === "object")
          .map((it, idx: number) => {
            if (!isRecord(it)) {
              return {
                id: `${id}_itm_${idx}`,
                perfumeId: "",
                perfumeName: "Item",
                quantity: 1,
                price: 0,
              };
            }
            const perfumeIdVal = it.perfumeId || it.productId || "";
            const nameVal =
              it.perfumeName || it.productName || it.name || "Item";
            const quantityVal = it.quantity || it.qty || 1;
            const priceVal =
              it.price || it.unitPrice || it.perfumePrice || it.amount || 0;
            return {
              id: String(it.id || `${id}_itm_${idx}`),
              perfumeId: String(perfumeIdVal || ""),
              perfumeName: String(nameVal || "Item"),
              quantity: Number(quantityVal || 1),
              price: Number(priceVal || 0),
            };
          })
      : [];
    out.push({
      id,
      customerId: String(
        (o.customerId as unknown) || (o.userId as unknown) || ""
      ),
      customerName: (o.customerName as string) || undefined,
      items,
      totalAmount: Number(o.totalAmount || o.total || 0),
      status: ((o.status as string) || "pending") as OrderStatus,
      shippingAddress: String(o.shippingAddress || o.address || ""),
      createdAt: String(o.createdAt || new Date().toISOString()),
      updatedAt: String(o.updatedAt || new Date().toISOString()),
    });
    seen.add(id);
  }
  return out;
}

export const orderService = {
  async list(role: "admin" | "manager"): Promise<OrderRecord[]> {
    const collected: OrderRecord[] = [];
    const add = (arr?: unknown) => {
      if (Array.isArray(arr)) collected.push(...normalizeOrders(arr));
    };

    // Role-specific aggregate attempts (ignore if 404)
    const roleAttempts: Attempt[] =
      role === "admin"
        ? [
            { method: "get", url: "/admin/orders" },
            { method: "get", url: "/orders" },
          ]
        : [
            { method: "get", url: "/orders" },
            { method: "get", url: "/manager/orders" },
          ];

    for (const attempt of roleAttempts) {
      try {
        const data = await tryEndpoints<unknown>([attempt]);
        if (Array.isArray(data) && data.length) {
          add(data);
          break; // got aggregate list
        }
      } catch (e) {
        if (axios.isAxiosError(e) && e.response?.status === 404) {
          // continue silently
        } else {
          console.warn("Aggregate attempt failed", attempt.url, e);
        }
      }
    }

    // Customer scoped fallbacks if nothing yet or user wants own orders
    if (typeof window !== "undefined") {
      const customerId = localStorage.getItem("customerId");
      if (customerId && collected.length === 0) {
        const scopedEndpoints: Attempt[] = [
          { method: "get", url: `/orders/customer/${customerId}` },
        ];
        for (const sc of scopedEndpoints) {
          try {
            const data = await tryEndpoints<unknown>([sc]);
            add(data);
            if (collected.length) break;
          } catch (e) {
            if (!(axios.isAxiosError(e) && e.response?.status === 404)) {
              console.warn("Scoped order endpoint failed", sc.url, e);
            }
          }
        }
        if (collected.length === 0) {
          try {
            const allOrders = await tryEndpoints<unknown>([
              {
                method: "post",
                url: "/customer/get-all-orders",
                data: { customerId },
              },
            ]);
            add(allOrders);
          } catch (e) {
            if (!(axios.isAxiosError(e) && e.response?.status === 404)) {
              console.warn("customer/get-all-orders failed", e);
            }
          }
          if (collected.length === 0) {
            // Deprecated endpoints merge
            try {
              const pending = await tryEndpoints<unknown>([
                {
                  method: "post",
                  url: "/customer/get-all-pending-orders",
                  data: { customerId },
                },
              ]);
              add(pending);
            } catch {
              /* ignore */
            }
            try {
              const delivered = await tryEndpoints<unknown>([
                {
                  method: "post",
                  url: "/customer/get-all-delivered-orders",
                  data: { customerId },
                },
              ]);
              add(delivered);
            } catch {
              /* ignore */
            }
          }
        }
      }
    }

    return collected;
  },

  async create(payload: CreateOrderInput): Promise<OrderRecord> {
    // Build multiple body variants to satisfy differing backend schemas
    const timestamp = Date.now();
    const baseItems = payload.items.map((it, i) => ({
      id: it.id || `temp_${timestamp}_${i}`,
      perfumeId: it.perfumeId,
      perfumeName: it.perfumeName,
      productId: it.perfumeId, // alias
      productName: it.perfumeName, // alias
      name: it.perfumeName, // alias
      quantity: it.quantity,
      qty: it.quantity, // alias
      price: it.price,
      unitPrice: it.price, // alias
      perfumePrice: it.price, // alias
      amount: it.price, // alias
    }));

    const core = {
      customerId: payload.customerId,
      customerName: payload.customerName,
      totalAmount: payload.totalAmount,
      total: payload.totalAmount,
      totalPrice: payload.totalAmount,
      status: payload.status || "pending",
      orderStatus: payload.status || "pending",
      shippingAddress: payload.shippingAddress,
      address: payload.shippingAddress,
      createdAt: new Date().toISOString(),
    };

    const bodyVariants: unknown[] = [
      { ...core, items: baseItems },
      { ...core, orderItems: baseItems },
      { ...core, orderProducts: baseItems },
      { ...core, cartProducts: baseItems },
      { order: { ...core, items: baseItems } },
    ];

    const endpointSequences: Attempt[] = [
      { method: "post", url: "/admin/order/create" },
      { method: "post", url: "/admin/orders" },
      { method: "post", url: "/orders" },
      { method: "post", url: "/orders/create" },
      { method: "post", url: "/order/create" },
      { method: "post", url: "/order" },
      { method: "post", url: "/customer/order/create" },
      { method: "post", url: "/customer/create-order" },
      { method: "post", url: "/customer/order" },
    ];

    const errors: { endpoint: string; status?: number; message: string }[] = [];

    for (const attempt of endpointSequences) {
      for (const variant of bodyVariants) {
        try {
          const resp = await axios.request<unknown>({
            method: attempt.method,
            url: `${BASE}${attempt.url}`,
            data: variant,
            headers: { ...authHeader(), "Content-Type": "application/json" },
          });
          const data = resp.data as unknown;
          // Try to normalize single record
          if (data && typeof data === "object") {
            const maybe = data as Record<string, unknown>;
            const candidate =
              maybe.order && typeof maybe.order === "object"
                ? maybe.order
                : data;
            const arr = normalizeOrders([candidate as unknown]);
            if (arr.length) {
              return arr[0];
            }
          }
          return data as OrderRecord; // fallback direct cast (best effort)
        } catch (err) {
          if (axios.isAxiosError(err)) {
            const status = err.response?.status;
            if (status === 401) {
              console.warn(
                "orderService.create auth failure",
                attempt.url,
                err.response?.data
              );
              throw err;
            }
            // Collect and continue on 404/400/422; break for other 5xx after recording
            errors.push({
              endpoint: attempt.url,
              status,
              message: err.response?.data
                ? JSON.stringify(err.response.data)
                : err.message,
            });
            if (status && ![400, 404, 422].includes(status)) {
              // Unexpected status; continue trying others but note
              continue;
            }
          } else {
            errors.push({
              endpoint: attempt.url,
              message: (err as Error).message,
            });
          }
        }
      }
    }
    console.error("orderService.create failed across all endpoints", errors);
    throw new Error("Order creation failed (all endpoints exhausted)");
  },

  async updateStatus(
    orderId: string,
    status: OrderStatus,
    role: "admin" | "manager"
  ) {
    // manager + admin different patterns
    const attempts: Attempt[] = [];
    if (role === "manager") {
      attempts.push(
        {
          method: "patch",
          url: `/manager/order/${orderId}/status`,
          data: { status },
        },
        { method: "patch", url: `/orders/${orderId}`, data: { status } },
        {
          method: "patch",
          url: `/admin/order/${orderId}/status`,
          data: { status },
        }
      );
    } else {
      attempts.push(
        {
          method: "patch",
          url: `/admin/order/${orderId}/status`,
          data: { status },
        },
        { method: "patch", url: `/orders/${orderId}`, data: { status } },
        {
          method: "patch",
          url: `/manager/order/${orderId}/status`,
          data: { status },
        }
      );
    }
    return await tryEndpoints<OrderRecord>(attempts, [404, 400, 422]);
  },

  async delete(orderId: string) {
    const data = await tryEndpoints<{ success?: boolean } | OrderRecord>([
      { method: "delete", url: `/admin/order/${orderId}` },
      { method: "delete", url: `/orders/${orderId}` },
    ]);
    return data;
  },
};
