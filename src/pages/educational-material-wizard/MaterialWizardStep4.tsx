// src/pages/educational-material-wizard/MaterialWizardStep4.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useFormSchemaStore } from "@/utility/llmFormWizard";
import StepsHero from "./StepsHero";
import { Eye } from "lucide-react";
import StepsHeader from "./StepsHeader";
import ReactMarkdown from "react-markdown";
import { MATERIAL_UI_TEXTS, MATERIAL_PATHS } from "./educationalMaterialWizard.constants";
import { Sub } from "@radix-ui/react-dropdown-menu";
import { SubPage } from "@/components/layout";

export const MaterialWizardStep4: React.FC = () => {
  const navigate = useNavigate();
  const { getData } = useFormSchemaStore();
  const formData = getData("educational-material-wizard");
  const { steps } = MATERIAL_UI_TEXTS;

  return (<SubPage>
    <div className="border rounded-lg bg-white shadow relative pb-6">
      <StepsHero step={4} />
      <div className="space-y-6 p-8">
        <StepsHeader
          title={
            <>
              <Eye className="w-8 h-8 text-zinc-500" />
              <span>{steps[4].title}</span>
            </>
          }
          description={steps[4].description}
        />

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tytuł materiału
            </label>
            <div className="p-3 bg-gray-50 rounded-lg text-gray-800 font-medium">
              {formData.title}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Treść materiału
            </label>
            <div className="p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{formData.content}</ReactMarkdown>
              </div>
            </div>
          </div>

          {formData.exercises && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ćwiczenia
              </label>
              <div className="p-4 bg-gray-50 rounded-lg max-h-64 overflow-y-auto">
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{formData.exercises}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Podsumowanie
            </label>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{formData.summary}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-purple-800 text-sm">
            {steps[4].info}
          </p>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => navigate(MATERIAL_PATHS.step3)}>
            Wstecz
          </Button>
          <Button onClick={() => navigate(MATERIAL_PATHS.step5)}>
            Zapisz w kursie
          </Button>
        </div>
      </div>
    </div></SubPage>
  );
};