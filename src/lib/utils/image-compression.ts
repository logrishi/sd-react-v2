import { imageCompression } from "@/lib/vendors";

export const compressImage = async (image: File): Promise<File | null> => {
  if (!image) return null;

  const options = {
    maxSizeMB: 1,
    useWebWorker: true,
  };

  try {
    const compressedFile = await imageCompression(image, options);
    return new File([compressedFile], image.name, {
      type: compressedFile.type,
    });
  } catch (error) {
    console.error("Error compressing image:", error);
    return null;
  }
};
