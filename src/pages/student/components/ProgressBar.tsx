// src/pages/student/components/ProgressBar.tsx
import React from "react";

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  color?: "blue" | "purple" | "pink" | "green" | "yellow";
  showPercentage?: boolean;
  height?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  value, 
  max, 
  label, 
  color = "blue", 
  showPercentage = true, 
  height = "h-3" 
}) => {
  const percentage = Math.round((value / max) * 100);
  const colorClasses = {
    blue: "bg-gradient-to-r from-blue-500 to-blue-600",
    purple: "bg-gradient-to-r from-purple-500 to-purple-600",
    pink: "bg-gradient-to-r from-pink-500 to-pink-600",
    green: "bg-gradient-to-r from-green-500 to-green-600",
    yellow: "bg-gradient-to-r from-yellow-500 to-yellow-600"
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showPercentage && <span className="text-sm text-gray-600">{percentage}%</span>}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${height} overflow-hidden`}>
        <div 
          className={`${height} ${colorClasses[color]} rounded-full transition-all duration-500 relative overflow-hidden`}
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
        </div>
      </div>
    </div>
  );
};