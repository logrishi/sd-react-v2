import { bcrypt, clsx, twMerge, type ClassValue } from "@/lib/vendors";
import { getEnvVar } from "./env-vars";
import { store } from "@/services/store";

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

export const generateOtpWithTimestamp = () => {
  const otp = (crypto.getRandomValues(new Uint16Array(1))[0] % 10000).toString().padStart(4, "0");
  const timestamp = Date.now();
  store.otp.set({
    otp,
    timestamp,
  });
  return { otp, timestamp };
};

export const sendMail = async (data: any) => {
  const params = {
    from: "dr.sarmah.dilip@gmail.com",
    to: [data?.email],
    subject: "Password Reset",
    text: `The OTP for resetting Saraighat Digital password is ${data.otp} and is valid for 5 minutes`,
  };

  try {
    const response = await fetch(getEnvVar("VITE_EMAIL_URL"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error("Failed to send email");
    }

    return await response.json();
  } catch (error) {
    // console.error("Error sending email:", error);
    throw error;
  }
};

export const verifyOtp = async (data: any) => {
  const { otp, timestamp } = data;
  const now = Date.now();

  if (now - timestamp > 5 * 60 * 1000) {
    // throw new Error("OTP expired");
    return { success: false, message: "OTP expired" };
  }

  if (otp !== store.otp.get().otp) {
    // throw new Error("Invalid OTP");
    return { success: false, message: "OTP invalid" };
  }

  store.otp.set({
    otp: "",
    timestamp: 0,
  });
  return { success: true, message: "OTP verified" };
};
