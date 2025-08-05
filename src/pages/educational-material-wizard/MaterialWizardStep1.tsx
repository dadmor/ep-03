// src/pages/educational-material-wizard/MaterialWizardStep1.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormSchemaStore, useLLMOperation } from "@/utility/llmFormWizard";
import StepsHero from "./StepsHero";
import StepsHeader from "./StepsHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  EDUCATIONAL_MATERIAL_SCHEMA,
  TOPIC_ANALYSIS_OPERATION,
  MATERIAL_UI_TEXTS,
  MATERIAL_PATHS,
  MATERIAL_VALIDATION,
} from "./educationalMaterialWizard.constants";
import { SubPage } from "@/components/layout";

export const MaterialWizardStep1: React.FC = () => {
  const navigate = useNavigate();
  const { register, setData } = useFormSchemaStore();
  const [subject, setSubject] = useState("");
  const [targetLevel, setTargetLevel] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const llmAnalysis = useLLMOperation("educational-material-wizard", "analyze-topic");
  const { steps, errors: errorTexts } = MATERIAL_UI_TEXTS;

  useEffect(() => {
    register(EDUCATIONAL_MATERIAL_SCHEMA);
    llmAnalysis.registerOperation(TOPIC_ANALYSIS_OPERATION);

    return () => {
      llmAnalysis.unregisterOperation();
    };
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!subject.trim() || subject.length < MATERIAL_VALIDATION.subject.minLength) {
      newErrors.subject = MATERIAL_VALIDATION.subject.errorMessage;
    }
    if (!targetLevel) {
      newErrors.targetLevel = "Wybierz poziom zaawansowania";
    }
    if (!ageGroup) {
      newErrors.ageGroup = "Wybierz grupę wiekową";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAnalyze = async () => {
    if (!validateForm()) return;

    try {
      const formData = {
        subject: subject.trim(),
        targetLevel,
        ageGroup,
      };
      
      setData("educational-material-wizard", formData);
      await llmAnalysis.executeOperation(formData);
      navigate(MATERIAL_PATHS.step2);
    } catch (error) {
      console.error(errorTexts.analysisError, error);
    }
  };

  return (
    <SubPage>
    <div className="border rounded-lg bg-white shadow relative pb-6">
      <StepsHero step={1} />

      <div className="p-6">
        <StepsHeader
          title={steps[1].title}
          description={steps[1].description}
        />

        {llmAnalysis.error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <span className="text-red-800 text-sm">
              {errorTexts.analysisError} {llmAnalysis.error}
            </span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="subject">Temat materiału</Label>
            <Input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={EDUCATIONAL_MATERIAL_SCHEMA.schema.step1.properties.subject.placeholder}
              disabled={llmAnalysis.loading}
              className={errors.subject ? "border-red-300" : ""}
            />
            {errors.subject && (
              <p className="text-sm text-red-600 mt-1">{errors.subject}</p>
            )}
          </div>

          <div>
            <Label htmlFor="targetLevel">Poziom zaawansowania</Label>
            <Select
              value={targetLevel}
              onValueChange={setTargetLevel}
              disabled={llmAnalysis.loading}
            >
              <SelectTrigger className={errors.targetLevel ? "border-red-300" : ""}>
                <SelectValue placeholder="Wybierz poziom..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Początkujący</SelectItem>
                <SelectItem value="intermediate">Średniozaawansowany</SelectItem>
                <SelectItem value="advanced">Zaawansowany</SelectItem>
              </SelectContent>
            </Select>
            {errors.targetLevel && (
              <p className="text-sm text-red-600 mt-1">{errors.targetLevel}</p>
            )}
          </div>

          <div>
            <Label htmlFor="ageGroup">Grupa wiekowa</Label>
            <Select
              value={ageGroup}
              onValueChange={setAgeGroup}
              disabled={llmAnalysis.loading}
            >
              <SelectTrigger className={errors.ageGroup ? "border-red-300" : ""}>
                <SelectValue placeholder="Wybierz grupę wiekową..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7-10">7-10 lat (szkoła podstawowa)</SelectItem>
                <SelectItem value="11-14">11-14 lat (klasy 4-8)</SelectItem>
                <SelectItem value="15-18">15-18 lat (szkoła średnia)</SelectItem>
                <SelectItem value="18+">18+ (dorośli)</SelectItem>
              </SelectContent>
            </Select>
            {errors.ageGroup && (
              <p className="text-sm text-red-600 mt-1">{errors.ageGroup}</p>
            )}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={llmAnalysis.loading}
            className="w-full h-12 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium rounded-lg flex items-center justify-center gap-2"
          >
            {llmAnalysis.loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {steps[1].loading}
              </>
            ) : (
              steps[1].button
            )}
          </button>
        </div>
      </div>
    </div></SubPage>
  );
};