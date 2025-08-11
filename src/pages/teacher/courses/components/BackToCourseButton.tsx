import { Button } from "@/components/ui";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface BackToCourseButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  children?: React.ReactNode;
}

export const BackToCourseButton = ({ 
  variant = "outline", 
  size = "sm",
  children = "Powrót do kursu"
}: BackToCourseButtonProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleBack = () => {
    const params = new URLSearchParams(location.search);
    const returnUrl = params.get('returnUrl');
    
    if (returnUrl) {
      navigate(decodeURIComponent(returnUrl));
    } else {
      navigate(-1); // Cofnij się
    }
  };

  return (
    <Button variant={variant} size={size} onClick={handleBack}>
      <ArrowLeft className="w-4 h-4 mr-2" />
      {children}
    </Button>
  );
};