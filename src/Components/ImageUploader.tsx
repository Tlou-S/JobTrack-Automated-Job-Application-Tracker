import { useRef, useState, useEffect } from "react";
import "./ImageUploader.css";

type UploadedImage = {
  id: string;
  file: File;
  preview: string;
};

type ImageUploaderProps = {
  /** Called with the currently-selected main image File (or null) */
  onUpload?: (file: File | null) => void;
};

function ImageUploader({ onUpload }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [images, setImages] = useState<UploadedImage[]>([]);
  const [mainImageId, setMainImageId] = useState<string | null>(null);

  const mainImage = images.find((img) => img.id === mainImageId) || null;

  // Notify parent with the actual File object whenever main image changes
  useEffect(() => {
    if (onUpload) {
      onUpload(mainImage ? mainImage.file : null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainImageId, images.length]);

  const handleAddPhotos = () => fileInputRef.current?.click();

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    const files = Array.from(selectedFiles);
    const newImages = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);
    if (!mainImageId && newImages.length > 0) setMainImageId(newImages[0].id);
    event.target.value = "";
  };

  const handleDelete = (id: string) => {
    const img = images.find((i) => i.id === id);
    if (img) URL.revokeObjectURL(img.preview);

    const updated = images.filter((i) => i.id !== id);
    setImages(updated);
    if (mainImageId === id) {
      setMainImageId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleSetMain = (id: string) => setMainImageId(id);

  return (
    <div className="image-uploader-dark">
      <h2 className="upload-title">Upload Images</h2>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageChange}
        style={{ display: "none" }}
      />

      <div className="main-preview">
        {mainImage ? (
          <img src={mainImage.preview} alt="Main preview" />
        ) : (
          <div className="empty-main-preview">No image selected</div>
        )}
      </div>

      <div className="thumbnail-row">
        {images.map((image) => (
          <div
            className={`thumbnail-card ${
              mainImageId === image.id ? "active-thumbnail" : ""
            }`}
            key={image.id}
            onClick={() => handleSetMain(image.id)}
          >
            <img src={image.preview} alt="Product preview" />
            <button
              type="button"
              className="delete-badge"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(image.id);
              }}
              aria-label="Delete image"
            >
              ×
            </button>
          </div>
        ))}

        <button
          type="button"
          className="add-image-button"
          onClick={handleAddPhotos}
          disabled={images.length >= 4}
        >
          +
        </button>
      </div>

      <p className="upload-limit-info">You can upload up to 4 photos.</p>
    </div>
  );
}

export default ImageUploader;