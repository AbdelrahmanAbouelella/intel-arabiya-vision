import type { CompanyProfile } from "@/types/api";

type Props = {
  items: CompanyProfile['people'];
};

function yearsSince(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const years = (now.getTime() - d.getTime()) / (365.25*24*3600*1000);
  return `${Math.floor(years)}y`;
}

export default function PeopleList({ items }: Props) {
  return (
    <div className="rounded-xl border overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-muted/40">
          <tr>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Role</th>
            <th className="p-2 text-left">Since</th>
            <th className="p-2 text-left">Tenure</th>
          </tr>
        </thead>
        <tbody>
          {items.map(p => (
            <tr key={p.name+String(p.since)} className="hover:bg-muted/30 border-t">
              <td className="p-2">{p.name}</td>
              <td className="p-2">{p.role}</td>
              <td className="p-2">{p.since}</td>
              <td className="p-2">{yearsSince(p.since)}</td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr><td className="p-4 text-muted-foreground">No people</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

