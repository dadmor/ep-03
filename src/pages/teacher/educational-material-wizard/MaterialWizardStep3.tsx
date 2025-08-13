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
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, Info } from "lucide-react";
import {
  MATERIAL_GENERATION_OPERATION,
  MATERIAL_UI_TEXTS,
  MATERIAL_PATHS,
} from "./educationalMaterialWizard.constants";
import { SubPage } from "@/components/layout";

export const MaterialWizardStep3: React.FC = () => {
  const navigate = useNavigate();
  const { getData, setData } = useFormSchemaStore();
  const formData = getData("educational-material-wizard");
  const [learningObjectives, setLearningObjectives] = useState(formData.learningObjectives || "");
  const [materialType, setMaterialType] = useState("mixed");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const llmGeneration = useLLMOperation("educational-material-wizard", "generate-material");
  const { steps, errors: errorTexts } = MATERIAL_UI_TEXTS;

  useEffect(() => {
    llmGeneration.registerOperation(MATERIAL_GENERATION_OPERATION);

    return () => {
      llmGeneration.unregisterOperation();
    };
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!learningObjectives.trim()) {
      newErrors.learningObjectives = "Cele nauczania są wymagane";
    }
    if (!materialType) {
      newErrors.materialType = "Wybierz typ materiału";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateForm()) return;

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
      console.error(errorTexts.generationError, error);
    }
  };

  return (
    <SubPage>
      <Card className="border-2 shadow-lg">
        <StepsHero step={3} />
        <CardContent className="p-8">
          <StepsHeader
            title={steps[3].title}
            description={steps[3].description}
          />

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="learningObjectives">
                Cele nauczania <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="learningObjectives"
                value={learningObjectives}
                onChange={(e) => setLearningObjectives(e.target.value)}
                placeholder="Dostosuj cele nauczania..."
                rows={6}
                className={errors.learningObjectives ? "border-red-500" : ""}
              />
              {errors.learningObjectives && (
                <p className="text-sm text-red-600">{errors.learningObjectives}</p>
              )}
              <p className="text-sm text-gray-500">
                Możesz edytować automatycznie wygenerowane cele
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="materialType">
                Typ materiału <span className="text-red-500">*</span>
              </Label>
              <Select
                value={materialType}
                onValueChange={setMaterialType}
              >
                <SelectTrigger className={errors.materialType ? "border-red-500" : ""}>
                  <SelectValue placeholder="Wybierz typ materiału..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lesson">Lekcja z teorią</SelectItem>
                  <SelectItem value="exercise">Ćwiczenia praktyczne</SelectItem>
                  <SelectItem value="mixed">Teoria + ćwiczenia</SelectItem>
                </SelectContent>
              </Select>
              {errors.materialType && (
                <p className="text-sm text-red-600">{errors.materialType}</p>
              )}
            </div>

            {llmGeneration.loading && (
              <Alert className="bg-purple-50 border-purple-200">
                <Info className="h-4 w-4 text-purple-600" />
                <AlertDescription className="text-purple-800">
                  {steps[3].loadingInfo}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={() => navigate(MATERIAL_PATHS.step2)}
              >
                Wstecz
              </Button>

              <Button
                onClick={handleNext}
                disabled={llmGeneration.loading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {llmGeneration.loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {steps[3].loading}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {steps[3].button}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </SubPage>
  );
};