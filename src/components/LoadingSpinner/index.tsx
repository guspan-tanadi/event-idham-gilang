import React from "react";

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="h-10 w-10 animate-spin rounded-full border-t-4 border-blue-500"></div>
    </div>
  );
};

export default LoadingSpinner;
