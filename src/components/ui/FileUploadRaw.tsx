import { Image } from "@nextui-org/react";
import { apiImageUpload, apiPresignUrl } from "@services/imageService";
import { cva } from "class-variance-authority";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { MdImage } from "react-icons/md";
import imageCompression from 'browser-image-compression';

type FileUploadRawProps = {
  label: string;
  required?: boolean;
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  onUpload: (id: string) => void;
};

const textClass = cva(["font-base"], {
  variants: {
    successful: {
      true: "text-green-500",
      false: "text-red-500",
      undefined: "text-gray-700",
    },
  },
});

const containerClass = cva(
  [
    "w-36 h-36 bg-gray-700/20 border-[1.5px] rounded-lg items-center justify-center flex",
  ],
  {
    variants: {
      successful: {
        true: "border-green-500",
        false: "border-red-500",
        undefined: "border-gray-700",
      },
    },
  }
);

export const FileUploadRaw = ({
  onUpload,
  label,
  required,
  maxSizeMB = 1,
  maxWidthOrHeight = 1920,
}: FileUploadRawProps) => {
  const [uploading, setUploading] = useState(false);
  const [responseSuccessful, setResponseSuccessful] = useState<
    boolean | undefined
  >(undefined);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setShowLoadingOverlay(uploading);
  }, [uploading]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = await imageCompression(event.target?.files?.[0] as File, {
      maxSizeMB,
      maxWidthOrHeight,
      useWebWorker: true,
    });

    if (file) {
      setImageUrl(URL.createObjectURL(file));
      setUploading(true);

      try {
        const data = await apiPresignUrl({ contentType: file.type });

        const updatedFile = new File([file], data.id, { type: file.type });
        await apiImageUpload(updatedFile, data);

        setResponseSuccessful(true);
        onUpload(data.id);
      } catch (error) {
        setResponseSuccessful(false);
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
    <div onClick={() => inputRef.current?.click()}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg, image/png"
        className="hidden"
        onChange={handleFileChange}
        id={`fileInput_${label}`}
      />

      {imageUrl && (
        <div className={containerClass({ successful: responseSuccessful })}>
          <div className="relative group">
            {showLoadingOverlay && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-700/70 rounded-lg">
                <div className="animate-spin z-50 rounded-full h-8 w-8 border-t-2 border-gray-300" />
              </div>
            )}

            <Image
              className="aspect-square z-0 rounded-lg h-full w-full"
              src={imageUrl}
              alt="Uploaded"
            />
          </div>
        </div>
      )}

      {!imageUrl && (
        <div className={containerClass()}>
          <MdImage className="w-20 h-20 text-gray-700" />
        </div>
      )}

      <div className="flex flex-row gap-2">
        {required && !responseSuccessful && (
          <p className="text-red-400 text-xl">*</p>
        )}
        <p className={textClass({ successful: responseSuccessful })}>{label}</p>
      </div>
    </div>
  );
};
