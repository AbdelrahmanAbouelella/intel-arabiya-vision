import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, BarChart, Bar } from 'recharts';
import type { FinancialSeries } from '@/types/api';
import { Button } from '@/components/ui/button';

function toCsv(series: FinancialSeries) {
  const header = ['period','revenue','ebitda','net_income','margin'];
  const rows = series.map(p => [p.period, p.revenue, p.ebitda ?? '', p.net_income ?? '', p.margin ?? '']);
  return [header.join(','), ...rows.map(r=>r.join(','))].join('\n');
}

export default function FinancialChart({ series }: { series: FinancialSeries }) {
  const download = () => {
    const blob = new Blob([toCsv(series)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'financials.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end"><Button variant="secondary" onClick={download}>Download CSV</Button></div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#2563eb" name="Revenue" dot={false} />
            <Line yAxisId="left" type="monotone" dataKey="net_income" stroke="#16a34a" name="Net Income" dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="margin" stroke="#a855f7" name="Margin %" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={series} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" fill="#60a5fa" name="Revenue" />
            <Bar dataKey="net_income" fill="#86efac" name="Net Income" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

