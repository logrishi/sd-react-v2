// React and core libraries
export {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  createContext,
  useContext,
  createElement,
  lazy,
  forwardRef,
  useOptimistic,
  Suspense,
  type FC,
  type ReactNode,
  type PropsWithChildren,
} from "react";

export { default as React } from "react";

// react-router-dom
export {
  createBrowserRouter,
  Navigate,
  RouterProvider,
  useNavigate,
  useParams,
  useLocation,
  Outlet,
  Link,
  NavLink as RouterNavLink,
} from "react-router-dom";

// Framer Motion
export { motion } from "framer-motion";

// Zod
export { z } from "zod";

export { default as imageCompression } from "browser-image-compression";

export { default as bcrypt } from "bcryptjs";

export { twMerge } from "tailwind-merge";

export { type ClassValue } from "clsx";

export { clsx } from "clsx";

export { default as axios } from "axios";

export { AxiosError, type AxiosRequestConfig, type AxiosResponse, type CancelTokenSource } from "axios";
