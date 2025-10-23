
import React from 'react';
import { DESIGN_STYLES } from '../constants';

interface StyleCarouselProps {
  onSelectStyle: (style: string) => void;
  isLoading: boolean;
  activeStyle: string | null;
}

export const StyleCarousel: React.FC<StyleCarouselProps> = ({ onSelectStyle, isLoading, activeStyle }) => {
  return (
    <div className="w-full px-4 sm:px-0">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-200">Reimagine Your Space</h2>
      <div className="flex overflow-x-auto space-x-4 p-4 -mx-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        {DESIGN_STYLES.map((style) => (
          <button
            key={style.name}
            onClick={() => onSelectStyle(style.name)}
            disabled={isLoading}
            className={`flex-shrink-0 w-48 rounded-lg overflow-hidden transform transition-all duration-300 relative group ${isLoading ? 'cursor-not-allowed opacity-60' : 'hover:scale-105 hover:shadow-2xl'}`}
          >
            <img src={style.image} alt={style.name} className="w-full h-32 object-cover" />
            <div className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-all duration-300 group-hover:bg-opacity-40 ${activeStyle === style.name ? 'ring-4 ring-blue-500 ring-inset' : ''}`}>
              <span className="text-white text-lg font-semibold text-center px-2">{style.name}</span>
            </div>
            {isLoading && activeStyle === style.name && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                    <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
