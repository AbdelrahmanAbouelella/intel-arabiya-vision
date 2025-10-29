import { useEffect, useState } from "react";
import { getEventsPage, EventsPage } from "@/services/mockApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function EventsFeed() {
  const [pages, setPages] = useState<EventsPage[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const next = await getEventsPage(cursor);
    setPages(prev => [...prev, next]);
    setCursor(next.nextCursor);
    setLoading(false);
  };

  useEffect(() => { load(); /* first page */ }, []);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Latest Significant Events</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {pages.flatMap(p => p.items).map(ev => (
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

        {cursor && !loading && (
          <div className="flex justify-center pt-2">
            <Button onClick={load} variant="secondary">Load more</Button>
          </div>
        )}

        {!cursor && !loading && pages.length > 0 && (
          <div className="text-center text-sm text-muted-foreground">No more events</div>
        )}
      </CardContent>
    </Card>
  );
}

