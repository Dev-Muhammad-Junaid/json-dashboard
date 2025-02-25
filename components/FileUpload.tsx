'use client';

import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  acceptedFileTypes?: Record<string, string[]>;
  maxSizeMB?: number;
  title?: string;
  description?: string;
}

export default function FileUpload({
  onFileUpload,
  acceptedFileTypes,
  maxSizeMB = 10,
  title = 'Upload File',
  description = 'Drag & drop your file here, or click to browse'
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const validateFile = (file: File): boolean => {
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setError(`File size exceeds maximum allowed size (${maxSizeMB}MB)`);
      return false;
    }
    
    // Check file type if specified
    if (acceptedFileTypes) {
      const fileType = file.type;
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      let isValidType = false;
      Object.entries(acceptedFileTypes).forEach(([mimeType, extensions]) => {
        if (fileType === mimeType || extensions.includes(extension)) {
          isValidType = true;
        }
      });
      
      if (!isValidType) {
        const allowedExtensions = Object.values(acceptedFileTypes).flat();
        setError(`Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`);
        return false;
      }
    }
    
    setError(null);
    return true;
  };
  
  const handleFile = (file: File) => {
    if (validateFile(file)) {
      onFileUpload(file);
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  };
  
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFile(file);
    }
  };
  
  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          accept={acceptedFileTypes ? Object.keys(acceptedFileTypes).join(',') : undefined}
          className="hidden"
        />
        
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
        
        {acceptedFileTypes && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
            Allowed file types: {Object.values(acceptedFileTypes).flat().join(', ')}
          </p>
        )}
        
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
          Maximum file size: {maxSizeMB}MB
        </p>
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
} 