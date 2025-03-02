import { bcrypt, clsx, twMerge, type ClassValue } from "@/lib/vendors";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};
