import type { CompanyProfile } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type EventLite = CompanyProfile['events'][number];

type Props = {
  items: EventLite[];
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
};

export default function EventsTimeline({ items, loading, hasMore, onLoadMore }: Props) {
  return (
    <div className="space-y-3">
      {items.map(ev => (
        <div key={ev.id} className="rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <div className="font-medium">{ev.type}</div>
            <div className="flex gap-2">
              <Badge>{ev.severity}</Badge>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {new Date(ev.time).toLocaleString()}
          </div>
          <div className="mt-1 text-sm">{ev.summary}</div>
        </div>
      ))}

      {loading && (
        <div className="text-sm text-muted-foreground">Loading…</div>
      )}

      {hasMore && !loading && (
        <div className="flex justify-center"><Button onClick={onLoadMore} variant="secondary">Load more</Button></div>
      )}

      {!hasMore && !loading && items.length>0 && (
        <div className="text-center text-sm text-muted-foreground">No more</div>
      )}
    </div>
  );
}

