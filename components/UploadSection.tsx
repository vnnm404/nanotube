"use client";
import React, { useRef, useState } from "react";
import { fileTypeFromBuffer } from "file-type";

const UploadSection: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("");

  const handleFileChange = () => {
    const file = fileInputRef.current?.files
      ? fileInputRef.current.files[0]
      : null;
    setSelectedFile(file);
    setUploadStatus(null); // Reset upload status when a new file is selected
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus("No file selected.");
      return;
    }

    // Validate title
    const titleRegex = /^[a-z ]+$/;
    if (!titleRegex.test(title)) {
      setUploadStatus("Title can only contain lowercase letters and spaces.");
      return;
    }

    try {
      setUploadStatus("Uploading...");

      // Check if file is a video
      const arrayBuffer = await selectedFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const fileType = await fileTypeFromBuffer(uint8Array);

      if (!fileType || !fileType.mime.startsWith("video/")) {
        setUploadStatus("Selected file is not a video.");
        return;
      }

      // Create a FormData object to send the file and title
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("title", title);

      // Placeholder API call (replace `/api/upload` with your backend route)
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload the file.");
      }

      const data = await response.json();
      setUploadStatus(`File "${selectedFile.name}" uploaded successfully!`);
    } catch (error) {
      console.error(error);
      setUploadStatus("Failed to upload the file. Please try again.");
    }
  };

  return (
    <div>
      <strong>UPLOAD</strong>

      <div>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          style={{ marginBottom: "10px" }}
        />

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter title"
          style={{ marginBottom: "10px" }}
        />

        <button onClick={handleUpload} style={{ cursor: "pointer" }}>
          Upload
        </button>

        {uploadStatus}
      </div>
    </div>
  );
};

export default UploadSection;
