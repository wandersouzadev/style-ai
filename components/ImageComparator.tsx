
import React, { useState } from 'react';

interface ImageComparatorProps {
  originalImage: string;
  generatedImage: string;
}

export const ImageComparator: React.FC<ImageComparatorProps> = ({ originalImage, generatedImage }) => {
  const [sliderPosition, setSliderPosition] = useState(50);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  };

  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-2xl bg-gray-800">
      <img
        src={originalImage}
        alt="Original Room"
        className="absolute inset-0 w-full h-full object-contain"
      />
      <img
        src={generatedImage}
        alt="AI Generated Design"
        className="absolute inset-0 w-full h-full object-contain"
        style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
      />
      <div className="absolute inset-0">
         <div 
          className="absolute top-0 bottom-0 bg-white w-1"
          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)', cursor: 'col-resize' }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded-full shadow-md">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-800">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
            </svg>
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPosition}
          onChange={handleSliderChange}
          className="comparator-slider"
          aria-label="Image comparison slider"
        />
      </div>
    </div>
  );
};
