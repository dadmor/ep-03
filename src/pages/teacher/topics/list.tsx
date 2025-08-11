// src/pages/topics/list.tsx
import { useList, useNavigation } from "@refinedev/core";
import { Edit, Eye, BookOpen, Clock } from "lucide-react";
import { Button } from "@/components/ui";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lead } from "@/components/reader";
import { SubPage } from "@/components/layout";
import { FlexBox } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type Topic = {
  id: number;
  title: string;
  position: number;
  is_published: boolean;
  course: {
    id: number;
    title: string;
  };
  created_at: string;
  updated_at: string;
};

export const TopicsList = () => {
  const { edit, show, list } = useNavigation();
  
  const { data, isLoading } = useList<Topic>({
    resource: "topics",
    meta: {
      populate: ["course"],
    },
    pagination: {
      pageSize: 12,
    },
  });

  const topics = data?.data || [];

  return (
    <SubPage>
      <FlexBox>
        <Lead
          title="Tematy"
          description="Zarządzaj tematami kursów"
        />
        <Button
          onClick={() => list("courses")}
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Przejdź do kursów
        </Button>
      </FlexBox>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : topics.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              Brak tematów
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Aby dodać temat, przejdź do kursu
            </p>
            <Button onClick={() => list("courses")}>
              <BookOpen className="h-4 w-4 mr-2" />
              Przejdź do kursów
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map((topic) => (
            <Card key={topic.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2">
                    {topic.title}
                  </CardTitle>
                  <Badge variant="outline" className="ml-2 shrink-0">
                    #{topic.position}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4 mr-2" />
                    <span className="line-clamp-1">
                      {topic.course?.title || "Brak kursu"}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>
                      {new Date(topic.created_at).toLocaleDateString('pl-PL')}
                    </span>
                  </div>
                  <div className="pt-2">
                    <Badge variant={topic.is_published ? "default" : "secondary"}>
                      {topic.is_published ? "Opublikowany" : "Szkic"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => show("topics", topic.id)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Podgląd
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => edit("topics", topic.id)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edytuj
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </SubPage>
  );
};