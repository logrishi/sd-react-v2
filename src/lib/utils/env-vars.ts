export const getEnvVar = (key: any) => {
  return import.meta.env[key];
};
