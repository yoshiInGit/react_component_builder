
import React from 'react';

interface ChipProps {
  label: string;
  onClose?: () => void;
  onClick?: () => void; // Optional click handler for the chip
}

const Chip: React.FC<ChipProps> = ({ label, onClose, onClick }) => {
  return (
    <div className="h-8 flex items-center rounded-full bg-gray-200 px-3 py-1 text-sm font-medium text-gray-800 mr-2 cursor-pointer"
      onClick={onClick}> {/* Call the onClick handler if provided */}
      <span>{label}</span>
      {onClose && (
        <button
          type="button"
          className="ml-1.5 rounded-full bg-gray-400 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-800 p-1"
          onClick={onClose}
        >
          <span className="sr-only">Remove</span>
          <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
            <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Chip;
