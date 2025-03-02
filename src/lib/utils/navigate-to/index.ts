import { useNavigate } from "react-router-dom";

interface NavigateOptions {
  state?: any; // Replace with a specific type if known
  replace?: boolean;
  params?: Record<string, string | number>;
  scrollToTop?: boolean;
}

export const navigateTo = (
  navigate: (path: string, options?: NavigateOptions) => void,
  path: string,
  options?: NavigateOptions
) => {
  const { state = {}, replace = false, params = {} } = options || {};

  if (path === "back") {
    navigate(String(-1)); // Go back in history
    return;
  } else if (path === "forward") {
    navigate(String(1)); // Go forward in history
    return;
  }

  const formattedPath = formatPathWithParams(path, params);
  if (replace) {
    navigate(formattedPath, { state, replace });
  } else {
    navigate(formattedPath, { state });
  }
};

export const useNavigateTo = () => {
  const navigate = useNavigate();

  return (path: string, options?: NavigateOptions) => navigateTo(navigate, path, options);
};

const formatPathWithParams = (path: string, params: Record<string, string | number>) => {
  let formattedPath = path;
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      formattedPath = formattedPath.replace(`:${key}`, String(params[key]));
    }
  }
  return formattedPath;
};
