// src/pages/course-structure-wizard/CourseWizardStep2.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useFormSchemaStore } from "@/utility/llmFormWizard";
import StepsHero from "./StepsHero";
import StepsHeader from "./StepsHeader";
import { COURSE_UI_TEXTS, COURSE_PATHS } from "./courseStructureWizard.constants";
import { SubPage } from "@/components/layout";

export const CourseWizardStep2: React.FC = () => {
  const navigate = useNavigate();
  const { getData } = useFormSchemaStore();
  const formData = getData("course-structure-wizard");
  const { steps } = COURSE_UI_TEXTS;

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
                <label className="block text-sm font-medium text-gray-700 mb-2">Proponowany tytuł</label>
                <div className="p-3 bg-gray-50 rounded-lg text-gray-800 font-medium">
                  {formData.courseTitle}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Opis kursu</label>
                <div className="p-3 bg-gray-50 rounded-lg text-gray-800 whitespace-pre-wrap">
                  {formData.description}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cele kursu</label>
                <div className="space-y-2">
                  {formData.objectives?.map((objective: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-indigo-600 font-medium">{index + 1}.</span>
                      <span className="text-gray-800">{objective}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Grupa docelowa</label>
                  <div className="p-3 bg-gray-50 rounded-lg text-gray-800">
                    {formData.targetAudience}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Wymagania wstępne</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    {formData.prerequisites?.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1">
                        {formData.prerequisites.map((prereq: string, index: number) => (
                          <li key={index} className="text-gray-800 text-sm">{prereq}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-500 text-sm">Brak wymagań wstępnych</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Szacowana liczba godzin</label>
                  <div className="p-3 bg-gray-50 rounded-lg text-gray-800 font-medium">
                    {formData.estimatedHours} godzin
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Liczba głównych tematów</label>
                  <div className="p-3 bg-gray-50 rounded-lg text-gray-800 font-medium">
                    {formData.topicsCount} tematów
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => navigate(COURSE_PATHS.step1)}>
                Wstecz
              </Button>
              <Button onClick={() => navigate(COURSE_PATHS.step3)}>
                Kontynuuj
              </Button>
            </div>
          </div>
        </div>
      </div>
    </SubPage>
  );
};