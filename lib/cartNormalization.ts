export interface NormalizedCartItem {
  id: string;
  perfumeName: string;
  perfumeBrand: string;
  perfumeImage: string;
  perfumePrice: number; // unit price
  perfumeQuantity: number;
  lineTotal: number; // unit price * quantity
  raw?: unknown;
}

function toNumber(value: unknown): number | undefined {
  if (value === null || value === undefined) return undefined;
  const num = typeof value === "number" ? value : parseFloat(String(value));
  return isNaN(num) ? undefined : num;
}

export function normalizeCartProducts(
  rawProducts: unknown[],
  opts?: { debug?: boolean }
): NormalizedCartItem[] {
  if (!Array.isArray(rawProducts)) return [];
  return rawProducts.map((raw, index) => {
    const obj: Record<string, unknown> =
      raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
    const pick = (...keys: string[]): unknown => {
      for (const k of keys) {
        if (
          Object.prototype.hasOwnProperty.call(obj, k) &&
          obj[k] !== undefined &&
          obj[k] !== null
        )
          return obj[k];
      }
      return undefined;
    };

    // Nested safe getter (supports simple one-level nesting like product.price, item.image, product.images[0])
    const getNested = (path: string): unknown => {
      const parts = path.split(".");
      let current: unknown = obj;
      for (const p of parts) {
        if (
          current &&
          typeof current === "object" &&
          p in (current as Record<string, unknown>)
        ) {
          current = (current as Record<string, unknown>)[p];
        } else {
          return undefined;
        }
      }
      return current;
    };

    const firstFromArray = (val: unknown): unknown => {
      if (Array.isArray(val) && val.length > 0) return val[0];
      return val;
    };

    const id = pick("perfumeId", "productId", "id", "_id") ?? `idx-${index}`;
    const name =
      pick("perfumeName", "name", "productName", "title") ?? "Unknown";
    const brand = pick("perfumeBrand", "brand", "manufacturer") ?? "";
    let image =
      pick(
        "perfumeImage",
        "image",
        "imageUrl",
        "thumbnail",
        "img",
        "picture",
        "photo"
      ) ?? "";
    if (!image) {
      // Try nested structures common in some carts
      image = (getNested("product.image") ||
        getNested("product.imageUrl") ||
        firstFromArray(getNested("product.images")) ||
        getNested("item.image") ||
        "") as string;
    }
    if (!image) {
      // Some backends store path inside nested media object
      const media = getNested("media");
      if (media && typeof media === "object") {
        const m = media as Record<string, unknown>;
        image = (m.url || m.path || m.src || "") as string;
      }
    }

    // Prefer explicit unit price keys, fallback to derived values
    let totalPriceVal = toNumber(
      pick("totalPrice", "lineTotal", "subtotal", "amount")
    );
    if (totalPriceVal === undefined) {
      // Try nested
      totalPriceVal = toNumber(
        getNested("product.totalPrice") || getNested("product.subtotal")
      );
    }
    const quantityRaw = pick(
      "perfumeQuantity",
      "quantity",
      "qty",
      "count",
      "amountQty"
    );
    const quantityNum = toNumber(quantityRaw ?? 1) || 0;
    let candidateUnit = toNumber(
      pick(
        "perfumePrice",
        "price",
        "unitPrice",
        "unit_price",
        "singlePrice",
        "amountEach"
      )
    );
    if (candidateUnit === undefined) {
      candidateUnit = toNumber(
        getNested("product.price") || getNested("product.unitPrice")
      );
    }
    if (candidateUnit === undefined && totalPriceVal && quantityNum) {
      candidateUnit = +(totalPriceVal / quantityNum).toFixed(2);
    }
    if (candidateUnit === undefined && !totalPriceVal) {
      // Heuristic: look for any numeric field with typical price naming
      const fallbackKeys = Object.keys(obj).filter((k) =>
        /price|amount|cost/i.test(k)
      );
      for (const k of fallbackKeys) {
        const num = toNumber(obj[k]);
        if (num && num > 0) {
          candidateUnit = num;
          break;
        }
      }
    }
    const unitPriceCandidate =
      candidateUnit ??
      (totalPriceVal && quantityNum
        ? +(totalPriceVal / quantityNum).toFixed(2)
        : 0);

    const quantity = quantityNum;

    const lineTotal =
      totalPriceVal ?? +(unitPriceCandidate * quantity).toFixed(2);

    const normalized: NormalizedCartItem = {
      id: String(id),
      perfumeName: String(name),
      perfumeBrand: String(brand),
      perfumeImage: String(image),
      perfumePrice: unitPriceCandidate,
      perfumeQuantity: quantity,
      lineTotal,
      raw,
    };

    if (opts?.debug) {
      console.debug("Cart normalization debug", { raw, normalized });
      if (!normalized.perfumeImage || normalized.perfumePrice === 0) {
        console.warn(
          "Normalization warning: missing image or price",
          normalized
        );
      }
    }

    return normalized;
  });
}
