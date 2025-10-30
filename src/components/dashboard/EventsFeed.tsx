import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { EventItem } from "@/types/dashboard";
import { useTranslation } from "react-i18next";

type Props = {
  items: EventItem[];
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
};

export default function EventsFeed({ items, loading, hasMore, onLoadMore }: Props) {
  const { t } = useTranslation();
  
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return 'default';
      case 'negative': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="pb-4 border-b">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          {t('dashboard.recentEvents')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        {items.map(ev => (
          <div 
            key={ev.id} 
            className="rounded-lg border bg-card hover:bg-accent/50 p-4 transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="font-semibold text-lg">{ev.company}</div>
              <div className="flex gap-2 flex-wrap justify-end">
                <Badge variant="secondary" className="text-xs">{ev.type}</Badge>
                <Badge variant={getSeverityColor(ev.severity) as any} className="text-xs">
                  {ev.severity}
                </Badge>
                <Badge variant={getSentimentColor(ev.sentiment) as any} className="text-xs">
                  {ev.sentiment}
                </Badge>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mb-2">
              {new Date(ev.time).toLocaleString()} • {ev.source}
            </div>
            <div className="text-sm leading-relaxed">{ev.summary}</div>
          </div>
        ))}

        {loading && (
          <div className="space-y-2">
            {Array.from({length:3}).map((_,i)=><Skeleton key={i} className="h-16 w-full rounded-md" />)}
          </div>
        )}

        {hasMore && !loading && (
          <div className="flex justify-center pt-2">
            <Button onClick={onLoadMore} variant="secondary">Load more</Button>
          </div>
        )}

        {!hasMore && !loading && items.length > 0 && (
          <div className="text-center text-sm text-muted-foreground">No more events</div>
        )}
      </CardContent>
    </Card>
  );
}
