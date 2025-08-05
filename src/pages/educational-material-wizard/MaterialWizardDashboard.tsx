// src/pages/educational-material-wizard/MaterialWizardDashboard.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Lead } from "@/components/reader";
import { Button } from "@/components/ui/button";
import { useFormSchemaStore } from "@/utility/llmFormWizard";
import { FlexBox, GridBox } from "@/components/shared";
import { 
  Sparkles, 
  Check, 
  Eye, 
  Edit3, 
  RefreshCw, 
  BookOpen, 
  FileText, 
  GraduationCap,
  Rocket
} from "lucide-react";
import { MATERIAL_UI_TEXTS, MATERIAL_PATHS } from "./educationalMaterialWizard.constants";
import { Sub } from "@radix-ui/react-dropdown-menu";
import { SubPage } from "@/components/layout";

export const MaterialWizardDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { getData } = useFormSchemaStore();
  const materialData = getData("educational-material-wizard");
  const { dashboard } = MATERIAL_UI_TEXTS;

  const hasSavedMaterial = materialData && materialData.title;

  return (
    <SubPage>
      <Lead
        title={dashboard.title}
        description={dashboard.description}
      />

      <div className="space-y-6">
        {/* Kreator nowego materiału */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
          <FlexBox variant="start" className="mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Sparkles className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{dashboard.wizardTitle}</h2>
              <p className="text-gray-600">{dashboard.wizardDescription}</p>
            </div>
          </FlexBox>
          
          <GridBox variant="1-2-2" className="gap-4">
            <div className="space-y-2">
              {dashboard.features.slice(0, 3).map((feature, index) => (
                <FlexBox key={index} variant="start" className="text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </FlexBox>
              ))}
            </div>
            <div className="space-y-2">
              {dashboard.features.slice(3).map((feature, index) => (
                <FlexBox key={index} variant="start" className="text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </FlexBox>
              ))}
            </div>
          </GridBox>

          <div className="mt-6">
            <Button 
              onClick={() => navigate(MATERIAL_PATHS.step1)}
              className="w-full md:w-auto"
              size="lg"
            >
              <Rocket className="w-4 h-4 mr-2" />
              Stwórz nowy materiał
            </Button>
          </div>
        </div>

        {/* Ostatni materiał */}
        {hasSavedMaterial && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <FlexBox variant="between-center" className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Ostatni materiał</h3>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Zapisany
              </span>
            </FlexBox>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Tytuł materiału</p>
                <p className="font-medium text-gray-900">{materialData.title}</p>
              </div>
              
              {materialData.subject && (
                <div>
                  <p className="text-sm text-gray-600">Temat</p>
                  <p className="text-gray-900">{materialData.subject}</p>
                </div>
              )}
              
              {materialData.targetLevel && (
                <div>
                  <p className="text-sm text-gray-600">Poziom</p>
                  <p className="text-gray-900">
                    {materialData.targetLevel === 'beginner' ? 'Początkujący' : 
                     materialData.targetLevel === 'intermediate' ? 'Średniozaawansowany' : 
                     'Zaawansowany'}
                  </p>
                </div>
              )}
            </div>

            <FlexBox variant="start" className="mt-6 gap-3">
              <Button 
                variant="outline"
                onClick={() => navigate(MATERIAL_PATHS.step4)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Podgląd
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate(MATERIAL_PATHS.step5)}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edytuj
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate(MATERIAL_PATHS.step1)}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Nowy materiał
              </Button>
            </FlexBox>
          </div>
        )}

        {/* Przydatne linki */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Zarządzanie kursami</h3>
          
          <GridBox variant="1-2-3" className="gap-4">
            <button
              onClick={() => navigate("/courses")}
              className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-left"
            >
              <FlexBox variant="start" className="mb-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Kursy</span>
              </FlexBox>
              <p className="text-sm text-gray-600">Zobacz wszystkie kursy</p>
            </button>

            <button
              onClick={() => navigate("/topics")}
              className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-left"
            >
              <FlexBox variant="start" className="mb-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <span className="font-medium">Tematy</span>
              </FlexBox>
              <p className="text-sm text-gray-600">Zarządzaj tematami kursów</p>
            </button>

            <button
              onClick={() => navigate("/activities")}
              className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-left"
            >
              <FlexBox variant="start" className="mb-2">
                <GraduationCap className="w-5 h-5 text-green-600" />
                <span className="font-medium">Aktywności</span>
              </FlexBox>
              <p className="text-sm text-gray-600">Materiały i quizy</p>
            </button>
          </GridBox>
        </div>
      </div>
    </SubPage>
  );
};