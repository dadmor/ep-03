// W komponencie gdzie renderujesz tematy:
{topicsData.data.map((topic: any) => (
  <div
    key={topic.id}
    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
  >
    <FlexBox>
      <div>
        <h4 className="font-medium">
          {topic.position}. {topic.title}
        </h4>
        <p className="text-sm text-muted-foreground mt-1">
          {topic._count?.activities || 0} aktywności
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge
          variant={topic.is_published ? "default" : "secondary"}
        >
          {topic.is_published ? "Opublikowany" : "Szkic"}
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/activities/create?topic_id=${topic.id}`)}
        >
          <Plus className="w-3 h-3 mr-2" />
          Dodaj treść
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => edit("topics", topic.id)}
        >
          <Edit className="w-3 h-3" />
        </Button>
      </div>
    </FlexBox>
  </div>
))}