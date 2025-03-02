import { useNavigate } from "react-router-dom";

interface LinkToPageOptions {
  state?: any; // Replace with a specific type if known
  replace?: boolean;
  params?: Record<string, string | number>;
  scrollToTop?: boolean;
}

export const useLinkToPage = () => {
  const navigate = useNavigate();

  const linkToPage = (path: string, options?: LinkToPageOptions) => {
    const { state = {}, replace = false, params = {} } = options || {};

    if (path === "back") {
      navigate(-1); // Go back in history
      return;
    } else if (path === "forward") {
      navigate(1); // Go forward in history
      return;
    }

    const formattedPath = formatPathWithParams(path, params);
    if (replace) {
      navigate(formattedPath, { state, replace });
    } else {
      navigate(formattedPath, { state });
    }
  };

  //   const formatPathWithParams = (path: string, params: Record<string, string | number>) => {
  //     return Object.keys(params).reduce((acc, key) => {
  //       return acc.replace(`:${key}`, String(params[key]));
  //     }, path);
  //   };

  const formatPathWithParams = (path: string, params: Record<string, string | number>) => {
    let formattedPath = path;
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        formattedPath = formattedPath.replace(`:${key}`, String(params[key]));
      }
    }
    return formattedPath;
  };

  return linkToPage;
};
