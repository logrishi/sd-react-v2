/**
 * Basic text sanitization
 */
export const sanitizeText = (text: string): string => {
  if (!text) return "";
  return text
    .trim()
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

/**
 * Capitalizes the first letter of each word in a string
 */
export const capitalizeWords = (text: string): string => {
  if (!text) return "";
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Capitalizes the first letter of a sentence
 */
export const capitalizeSentence = (text: string): string => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Formats book data by capitalizing and sanitizing text
 */
export const formatBookData = (data: { name?: string; description?: string; [key: string]: unknown }) => {
  const formatted = { ...data };

  if (formatted.name) {
    formatted.name = capitalizeWords(sanitizeText(formatted.name));
  }

  if (formatted.description) {
    formatted.description = capitalizeSentence(sanitizeText(formatted.description));
  }

  return formatted;
};
