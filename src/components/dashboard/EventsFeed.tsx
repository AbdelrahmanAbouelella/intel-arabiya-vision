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
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{t('dashboard.recentEvents')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map(ev => (
          <div key={ev.id} className="rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">{ev.company}</div>
              <div className="flex gap-2">
                <Badge variant="secondary">{ev.type}</Badge>
                <Badge>{ev.severity}</Badge>
                <Badge variant="outline">{ev.sentiment}</Badge>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {new Date(ev.time).toLocaleString()} • {ev.source}
            </div>
            <div className="mt-1 text-sm">{ev.summary}</div>
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
