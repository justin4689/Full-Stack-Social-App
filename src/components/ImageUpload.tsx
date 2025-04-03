"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import { XIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import Image from "next/image";

interface ImageUploadProps {
  onChange: (url?: string) => void;
  value?: string;
  endpoint: "postImage";
}

function ImageUpload({ endpoint, onChange, value }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [toastId, setToastId] = useState<string>();

  useEffect(() => {
    return () => {
      if (toastId) toast.dismiss(toastId);
    };
  }, [toastId]);

  if (value) {
    return (
      <div className="relative w-full aspect-square max-w-[200px]">
        <Image
          src={value}
          alt="Uploaded content"
          className="rounded-md object-cover"
          fill
          sizes="200px"
        />
        <button
          onClick={() => onChange(undefined)}
          className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full shadow-sm hover:bg-red-600 transition-colors"
          type="button"
          aria-label="Remove image"
        >
          <XIcon className="h-4 w-4 text-white" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <UploadDropzone
        endpoint={endpoint}
        onUploadBegin={() => {
          setIsUploading(true);
          const id = toast.loading("Uploading image...");
          setToastId(id);
        }}
        onClientUploadComplete={(res) => {
          setIsUploading(false);
          toast.dismiss(toastId);
          if (res?.[0]?.url) {
            onChange(res[0].url);
            toast.success("Image uploaded successfully!");
          }
        }}
        onUploadError={(error: Error) => {
          setIsUploading(false);
          toast.dismiss(toastId);
          console.error("Upload error:", error);
          toast.error(`Failed to upload image: ${error.message}`);
        }}
        className={`ut-label:text-lg ut-allowed-content:ut-uploading:text-red-300 ${
          isUploading ? "opacity-50 pointer-events-none" : ""
        }`}
        appearance={{
          label: {
            color: "#000",
            fontSize: "1.125rem",
          },
          allowedContent: {
            color: "#6b7280",
          },
          button: {
            backgroundColor: "#000",
            color: "#fff",
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
          },
          container: {
            minHeight: "200px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: "2px dashed #d1d5db",
            borderRadius: "0.5rem",
            padding: "1rem",
          },
        }}
      />
    </div>
  );
}

export default ImageUpload;