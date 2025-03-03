import type { FrontQLOptions, NearbyOption } from "./types";
import type { RequestOptions } from "./api-tanstack-query";

export function transformOptions(options: FrontQLOptions): RequestOptions {
  return {
    ...options,
    sort: Array.isArray(options.sort) ? options.sort.map((s) => `${s.field}:${s.direction}`).join(",") : options.sort,
    filter: Array.isArray(options.filter)
      ? options.filter.map((f) => `${f.field}:${f.operator}:${f.value}`).join(",")
      : options.filter,
    joins: Array.isArray(options.joins) ? options.joins.join(",") : options.joins,
    fields: Array.isArray(options.fields) ? options.fields.join(",") : options.fields,
    permissions: Array.isArray(options.permissions) ? options.permissions.join(",") : options.permissions,
    nearby: typeof options.nearby === 'string' 
      ? options.nearby 
      : options.nearby 
        ? `${options.nearby.lat},${options.nearby.lng},${options.nearby.radius}` 
        : undefined,
    hidden: options.hidden?.toString(),
    validation: options.validation?.toString(),
  };
}
