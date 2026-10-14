import { weeklyData } from './model';
export function SalesChart() {
  const values = weeklyData.map(w => w.sales);
  const points = values.map((v, i) => `${24 + i * 42},${132 - (v - 4000) / 25}`).join(' ');
  return <div className="sales-chart">
    <div className="chart-heading"><span>Weekly sales</span><span><i className="legend-dot"/>Sales / GMV</span></div>
    <svg viewBox="0 0 342 170" role="img" aria-label="Eight weeks of sales, declining from 6,000 to 4,560 baht">
      {[40, 84, 128].map(y => <line key={y} x1="24" x2="318" y1={y} y2={y} className="chart-grid"/>)}
      <path d={`M${points.replaceAll(' ', ' L')} L318,141 L24,141 Z`} className="chart-area"/>
      <line x1="171" x2="171" y1="20" y2="141" className="chart-divider"/>
      <polyline points={points} className="chart-line"/>
      {values.map((v, i) => <circle key={i} cx={24 + i * 42} cy={132 - (v - 4000) / 25} r="3.5" className="chart-point"/>)}
      <text x="24" y="164">Aug 24</text><text x="150" y="164">Sep 14</text><text x="287" y="164">Oct 12</text>
    </svg>
    <div className="chart-periods"><span>Previous 4 weeks</span><span>Latest 4 weeks</span></div>
  </div>;
}