// React and core libraries
export { useState, useEffect, createContext, useContext, Suspense, createElement } from "react";

export { default as React } from "react";

// Framer Motion
export { motion } from "framer-motion";

// Zod
export { z } from "zod";

// TanStack Router
export {
  Link,
  Outlet,
  Router,
  Route,
  RootRoute,
  useNavigate,
  useLoaderData,
  useSearch,
  lazyRouteComponent,
  redirect,
} from "@tanstack/react-router";

// Export router instance
export { router } from "../../router";

export type { NavigateOptions } from "@tanstack/react-router";

export { default as imageCompression } from "browser-image-compression";

export { default as bcrypt } from "bcryptjs";

export { twMerge } from "tailwind-merge";

export { type ClassValue } from "clsx";

export { clsx } from "clsx";
