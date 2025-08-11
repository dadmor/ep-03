
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useFormSchemaStore } from "@/utility/llmFormWizard";
import StepsHero from "./StepsHero";
import StepsHeader from "./StepsHeader";
import { MATERIAL_UI_TEXTS, MATERIAL_PATHS } from "./educationalMaterialWizard.constants";
import { SubPage } from "@/components/layout";

export const MaterialWizardStep2: React.FC = () => {
  const navigate = useNavigate();
  const { getData } = useFormSchemaStore();
  const formData = getData("educational-material-wizard");
  const { steps } = MATERIAL_UI_TEXTS;

  return (
    <SubPage>
    <div className="border rounded-lg bg-white shadow relative pb-6">
      <StepsHero step={2} />
      <div className="space-y-6 p-8">
        <StepsHeader
          title={steps[2].title}
          description={steps[2].description}
        />

        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <span className="text-green-800 text-sm">{steps[2].success}</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Temat</label>
              <div className="p-3 bg-gray-50 rounded-lg text-gray-800">{formData.subject}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kluczowe zagadnienia</label>
              <div className="flex flex-wrap gap-2">
                {formData.keyTopics?.map((topic: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cele nauczania</label>
              <div className="p-3 bg-gray-50 rounded-lg text-gray-800 whitespace-pre-wrap">
                {formData.learningObjectives}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Wymagania wstępne</label>
              <div className="flex flex-wrap gap-2">
                {formData.prerequisites?.length > 0 ? (
                  formData.prerequisites.map((prereq: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {prereq}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">Brak wymagań wstępnych</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Szacowany czas</label>
              <div className="p-3 bg-gray-50 rounded-lg text-gray-800 font-medium">
                {formData.estimatedDuration} minut
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => navigate(MATERIAL_PATHS.step1)}>
              Wstecz
            </Button>
            <Button onClick={() => navigate(MATERIAL_PATHS.step3)}>
              Kontynuuj
            </Button>
          </div>
        </div>
      </div>
    </div></SubPage>
  );
};