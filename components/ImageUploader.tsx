
import React, { useState, useCallback } from 'react';
import { ImageData } from '../types';

interface ImageUploaderProps {
  onImageUpload: (imageData: ImageData) => void;
  setIsLoading: (loading: boolean) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]); // remove data:mime/type;base64, prefix
    reader.onerror = (error) => reject(error);
  });
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, setIsLoading }) => {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(async (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      setError(null);
      setIsLoading(true);
      try {
        const base64 = await fileToBase64(file);
        onImageUpload({ base64, mimeType: file.type });
      } catch (err) {
        setError("Could not read the image file. Please try another one.");
        setIsLoading(false);
      }
    } else {
      setError("Please upload a valid image file (JPEG, PNG, etc.).");
    }
  }, [onImageUpload, setIsLoading]);

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);
    const file = event.dataTransfer.files?.[0];
    handleFileChange(file || null);
  }, [handleFileChange]);

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(true);
  };

  const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);
  };

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    handleFileChange(file || null);
    event.target.value = ''; // Reset input to allow re-uploading the same file
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4">
          AI Interior Designer
        </h1>
        <p className="text-lg text-gray-300 mb-8">
          Upload a photo of your room and watch it transform.
        </p>

        <label
          htmlFor="file-upload"
          className={`relative block w-full rounded-lg border-2 border-dashed transition-all duration-300 ${
            dragOver ? 'border-blue-400 bg-gray-800' : 'border-gray-600 hover:border-gray-500'
          }`}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
        >
          <div className="flex flex-col items-center justify-center p-12 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-lg font-semibold text-gray-300">
              Drag & drop your room photo here
            </p>
            <p className="text-gray-500">or click to browse</p>
          </div>
          <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={onInputChange}/>
        </label>
        {error && <p className="mt-4 text-red-400">{error}</p>}
      </div>
    </div>
  );
};
