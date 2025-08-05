// src/pages/quiz-wizard/StepsHero.tsx
import { Button, Separator } from "@/components/ui";
import { X } from "lucide-react";
import { useNavigate } from "react-router";

interface StepsHeroProps {
  step: number;
}

export const StepsHero = ({ step }: StepsHeroProps) => {
  const navigate = useNavigate();
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 hover:bg-gray-100"
        onClick={() => navigate("/quiz-wizard")}
      >
        <X className="h-5 w-5" />
      </Button>
      <div className="p-8 space-y-12 text-zinc-800">
        <h1 className="text-6xl font-black">QUIZWISE.</h1>
        <h2 className="text-4xl">
          Twórzmy razem <br /> 
          <span className="font-bold">sprawdzian wiedzy</span>
        </h2>
        <p>Krok {step} z 5</p>
      </div>
      <Separator className="my-8" />
    </>
  );
};

export default StepsHero;