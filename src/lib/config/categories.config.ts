export const CONTENT_CATEGORIES = ["All", "Books", "Magazines", "Newspapers"] as const;
export type ContentCategory = (typeof CONTENT_CATEGORIES)[number];
