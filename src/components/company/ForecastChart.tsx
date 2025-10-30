import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Line } from 'recharts';

type Point = { horizon: string; value: number; ci_low: number; ci_high: number };

type Props = {
  series: Point[];
  meta?: { model_version?: string; mape?: number; mae?: number; retrained_at?: string };
};

export default function ForecastChart({ series, meta }: Props) {
  return (
    <div className="space-y-3">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="horizon" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="ci_low" stroke="#93c5fd" fill="#dbeafe" name="CI Low" />
            <Area type="monotone" dataKey="ci_high" stroke="#93c5fd" fill="#dbeafe" name="CI High" />
            <Line type="monotone" dataKey="value" stroke="#2563eb" name="Forecast" dot />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="text-sm text-muted-foreground">
        Model: {meta?.model_version ?? '—'} • MAPE: {meta?.mape ?? '—'} • MAE: {meta?.mae ?? '—'} {meta?.retrained_at ? `• Retrained at: ${meta.retrained_at}` : ''}
      </div>
    </div>
  );
}

