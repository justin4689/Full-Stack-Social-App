"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useRef } from "react";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { ImageIcon, Loader2Icon, SendIcon, XIcon } from "lucide-react";
import { Button } from "./ui/button";
import { createPost } from "@/actions/post.action";
import toast from "react-hot-toast";
import { uploadFiles } from "@/lib/uploadthing";
import Image from "next/image";

function CreatePost() {
  const { user } = useUser();
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !selectedFile) return;

    setIsPosting(true);
    try {
      let imageUrl = "";

      // Upload l'image si elle existe
      if (selectedFile) {
        try {
          const [res] = await uploadFiles("postImage", { files: [selectedFile] });
          if (!res?.url) {
            throw new Error("Failed to upload image");
          }
          imageUrl = res.url;
        } catch (error) {
          console.error("Upload error:", error);
          toast.error("Failed to upload image");
          return;
        }
      }

      // Créer le post avec le contenu et l'URL de l'image
      const result = await createPost(content, imageUrl);
      
      if (!result?.success) {
        throw new Error(result?.error || "Failed to create post");
      }

      // Réinitialiser le formulaire
      setContent("");
      removeImage();
      toast.success("Post created successfully");
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to create post");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex space-x-4">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user?.imageUrl || "/avatar.png"} />
            </Avatar>
            <div className="flex-1 space-y-4">
              <Textarea
                placeholder="What's on your mind?"
                className="min-h-[100px] resize-none border-none focus-visible:ring-0 text-base p-2"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isPosting}
              />
              
              {/* Zone de prévisualisation de l'image */}
              {previewUrl && (
                <div className="relative rounded-lg overflow-hidden bg-gray-100">
                  <div className="relative w-full h-[300px]">
                    <Image 
                      src={previewUrl}
                      alt="Post preview"
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1 bg-red-500 rounded-full shadow-sm hover:bg-red-600 transition-colors"
                    type="button"
                  >
                    <XIcon className="h-4 w-4 text-white" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={isPosting || !!previewUrl}
              >
                <ImageIcon className="size-4 mr-2" />
                Add Photo
              </Button>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                ref={fileInputRef}
              />


            </div>

            <Button
              className="flex items-center"
              onClick={handleSubmit}
              disabled={(!content.trim() && !selectedFile) || isPosting}
            >
              {isPosting ? (
                <>
                  <Loader2Icon className="size-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <SendIcon className="size-4 mr-2" />
                  Post
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CreatePost;