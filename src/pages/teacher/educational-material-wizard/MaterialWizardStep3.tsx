
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormSchemaStore, useLLMOperation } from "@/utility/llmFormWizard";
import StepsHero from "./StepsHero";
import StepsHeader from "./StepsHeader";
import {
  MATERIAL_GENERATION_OPERATION,
  MATERIAL_UI_TEXTS,
  MATERIAL_PATHS,
} from "./educationalMaterialWizard.constants";
import { Sub } from "@radix-ui/react-dropdown-menu";
import { SubPage } from "@/components/layout";

export const MaterialWizardStep3: React.FC = () => {
  const navigate = useNavigate();
  const { getData, setData } = useFormSchemaStore();
  const formData = getData("educational-material-wizard");
  const [learningObjectives, setLearningObjectives] = useState(formData.learningObjectives || "");
  const [materialType, setMaterialType] = useState("mixed");

  const llmGeneration = useLLMOperation("educational-material-wizard", "generate-material");
  const { steps, errors } = MATERIAL_UI_TEXTS;

  useEffect(() => {
    llmGeneration.registerOperation(MATERIAL_GENERATION_OPERATION);

    return () => {
      llmGeneration.unregisterOperation();
    };
  }, []);

  const handleNext = async () => {
    if (!learningObjectives.trim() || !materialType) return;

    try {
      const updatedData = {
        ...formData,
        learningObjectives: learningObjectives.trim(),
        materialType,
      };
      
      setData("educational-material-wizard", updatedData);
      await llmGeneration.executeOperation(updatedData);
      navigate(MATERIAL_PATHS.step4);
    } catch (error) {
      console.error(errors.generationError, error);
    }
  };

  return (
    <SubPage>
    <div className="border rounded-lg bg-white shadow relative pb-6">
      <StepsHero step={3} />
      <div className="space-y-6 p-8">
        <StepsHeader
          title={steps[3].title}
          description={steps[3].description}
        />

        <div className="space-y-6">
          <div>
            <Label htmlFor="learningObjectives">Cele nauczania</Label>
            <Textarea
              id="learningObjectives"
              value={learningObjectives}
              onChange={(e) => setLearningObjectives(e.target.value)}
              placeholder="Dostosuj cele nauczania..."
              rows={6}
              className="mt-1"
            />
            <p className="mt-1 text-sm text-gray-500">
              Możesz edytować automatycznie wygenerowane cele
            </p>
          </div>

          <div>
            <Label htmlFor="materialType">Typ materiału</Label>
            <Select
              value={materialType}
              onValueChange={setMaterialType}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Wybierz typ materiału..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lesson">Lekcja z teorią</SelectItem>
                <SelectItem value="exercise">Ćwiczenia praktyczne</SelectItem>
                <SelectItem value="mixed">Teoria + ćwiczenia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => navigate(MATERIAL_PATHS.step2)}
            >
              Wstecz
            </Button>

            <Button
              onClick={handleNext}
              disabled={llmGeneration.loading || !learningObjectives.trim()}
            >
              {llmGeneration.loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {steps[3].loading}
                </>
              ) : (
                steps[3].button
              )}
            </Button>
          </div>
        </div>

        {llmGeneration.loading && (
          <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <span className="text-purple-800 text-sm">
              {steps[3].loadingInfo}
            </span>
          </div>
        )}
      </div>
    </div></SubPage>
  );
};