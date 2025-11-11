export type RestaurantIdLike =
  | string
  | number
  | null
  | undefined
  | { id?: string; _id?: string; restaurantId?: string | { id?: string; _id?: string } };

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const sanitizeStringId = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "[object Object]") {
    return null;
  }
  return trimmed;
};

export const normalizeRestaurantId = (input: RestaurantIdLike): string | null => {
  if (input === null || input === undefined) {
    return null;
  }

  if (typeof input === "number") {
    return String(input);
  }

  if (typeof input === "string") {
    return sanitizeStringId(input);
  }

  if (isPlainObject(input)) {
    const nested =
      input.restaurantId && typeof input.restaurantId === "object"
        ? normalizeRestaurantId(input.restaurantId as RestaurantIdLike)
        : null;

    const candidates: Array<unknown> = [
      input.id,
      input._id,
      input.restaurantId,
      nested,
    ];

    for (const candidate of candidates) {
      const normalized = normalizeRestaurantId(candidate as RestaurantIdLike);
      if (normalized) {
        return normalized;
      }
    }
  }

  return null;
};

export const assertRestaurantId = (input: RestaurantIdLike): string => {
  const normalized = normalizeRestaurantId(input);
  if (!normalized) {
    throw new Error("Unable to resolve a valid restaurant id from input.");
  }
  return normalized;
};

