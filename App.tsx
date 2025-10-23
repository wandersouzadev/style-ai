
import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { StyleCarousel } from './components/StyleCarousel';
import { ImageComparator } from './components/ImageComparator';
import { ChatInterface } from './components/ChatInterface';
import { generateStyledImage, refineImage } from './services/geminiService';
import { ChatMessage, ImageData } from './types';

function App() {
  const [originalImage, setOriginalImage] = useState<ImageData | null>(null);
  const [generatedImage, setGeneratedImage] = useState<ImageData | null>(null);
  const [activeStyle, setActiveStyle] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = useCallback((imageData: ImageData) => {
    setOriginalImage(imageData);
    setGeneratedImage(null);
    setChatMessages([]);
    setActiveStyle(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const handleSelectStyle = useCallback(async (style: string) => {
    if (!originalImage) return;
    
    setIsLoading(true);
    setActiveStyle(style);
    setError(null);
    setGeneratedImage(null);
    setChatMessages([]);

    try {
      const result = await generateStyledImage(originalImage, style);
      setGeneratedImage({ base64: result.image, mimeType: 'image/png' }); // Gemini might return a different format
      setChatMessages([{ sender: 'ai', text: result.text || `Here is your room in a ${style} style!` }]);
    } catch (err: any) {
      setError(err.message || "An unknown error occurred during image generation.");
    } finally {
      setIsLoading(false);
    }
  }, [originalImage]);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!generatedImage) return;

    setIsRefining(true);
    setError(null);
    setChatMessages(prev => [...prev, { sender: 'user', text: message }]);

    try {
      const result = await refineImage(generatedImage, message);
      setGeneratedImage({ base64: result.image, mimeType: 'image/png' });
      setChatMessages(prev => [...prev, { sender: 'ai', text: result.text }]);
    } catch (err: any) {
      setError(err.message || "An unknown error occurred during image refinement.");
       setChatMessages(prev => [...prev, { sender: 'ai', text: `Sorry, I couldn't make that change. ${err.message}` }]);
    } finally {
      setIsRefining(false);
    }
  }, [generatedImage]);

  const handleStartOver = () => {
    setOriginalImage(null);
    setGeneratedImage(null);
    setChatMessages([]);
    setActiveStyle(null);
    setError(null);
    setIsLoading(false);
    setIsRefining(false);
  };

  if (isLoading && !originalImage) {
    return (
      <div className="w-screen h-screen flex items-center justify-center flex-col bg-gray-900 text-white">
        <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p>Processing your image...</p>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col items-center p-4 lg:p-6 bg-gray-900 overflow-hidden">
      {!originalImage ? (
        <ImageUploader onImageUpload={handleImageUpload} setIsLoading={setIsLoading} />
      ) : (
        <div className="w-full h-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
          <main className="flex-1 lg:flex-[2] flex flex-col gap-4 min-h-0">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                Design Studio
                </h1>
                <button 
                  onClick={handleStartOver} 
                  className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  Start Over
                </button>
            </div>
            
            <div className="flex-1 w-full relative flex items-center justify-center bg-black/20 rounded-lg">
                {generatedImage ? (
                  <ImageComparator 
                      originalImage={`data:${originalImage.mimeType};base64,${originalImage.base64}`} 
                      generatedImage={`data:${generatedImage.mimeType};base64,${generatedImage.base64}`}
                  />
                ) : (
                  <img src={`data:${originalImage.mimeType};base64,${originalImage.base64}`} alt="Your Room" className="max-w-full max-h-full object-contain rounded-lg"/>
                )}

                {isLoading && activeStyle && (
                     <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-lg z-10">
                        <svg className="animate-spin h-10 w-10 text-white mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-xl text-white">Designing in {activeStyle}...</p>
                    </div>
                )}
            </div>
             {error && <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-2 rounded-lg text-center">{error}</div>}

            <StyleCarousel 
              onSelectStyle={handleSelectStyle} 
              isLoading={isLoading} 
              activeStyle={activeStyle}
            />
          </main>
          <aside className="flex-1 lg:max-w-md flex flex-col min-h-0">
              <ChatInterface 
                messages={chatMessages} 
                onSendMessage={handleSendMessage} 
                isRefining={isRefining}
                disabled={!generatedImage}
              />
          </aside>
        </div>
      )}
    </div>
  );
}

export default App;
