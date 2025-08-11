// src/components/modules/LoadingFallback.tsx
interface LoadingFallbackProps {
    text?: string;
    colorClass?: string;
  }
  
  export const LoadingFallback: React.FC<LoadingFallbackProps> = ({ 
    text = "Ładowanie...", 
    colorClass = "border-blue-600" 
  }) => {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${colorClass} mx-auto`}></div>
          <p className="mt-4 text-gray-600">{text}</p>
        </div>
      </div>
    );
  };
  
  
  
  