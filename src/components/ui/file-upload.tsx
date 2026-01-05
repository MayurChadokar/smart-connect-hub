import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAX_FILE_SIZE, ACCEPTED_IMAGE_TYPES } from "@/lib/validations";

interface FileUploadProps {
  value: File | null;
  onChange: (file: File | null) => void;
  error?: string;
}

export function FileUpload({ value, onChange, error }: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (file: File | null) => {
      if (file) {
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
          return;
        }
        if (file.size > MAX_FILE_SIZE) {
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        onChange(file);
      } else {
        setPreview(null);
        onChange(null);
      }
    },
    [onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleFileChange(file);
      }
    },
    [handleFileChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const clearFile = () => {
    handleFileChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
        className="hidden"
        id="photo-upload"
      />

      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full aspect-square max-w-[200px] mx-auto"
          >
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg border-2 border-primary/20"
            />
            <button
              type="button"
              onClick={clearFile}
              className="absolute -top-2 -right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full shadow-md hover:bg-destructive/90 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ) : (
          <motion.label
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            htmlFor="photo-upload"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
              error && "border-destructive"
            )}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <div className="p-3 rounded-full bg-primary/10 mb-3">
                {isDragging ? (
                  <ImageIcon className="w-8 h-8 text-primary" />
                ) : (
                  <Upload className="w-8 h-8 text-primary" />
                )}
              </div>
              <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG (Max 2MB)
              </p>
            </div>
          </motion.label>
        )}
      </AnimatePresence>

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}
    </div>
  );
}
