import React from 'react';
import { HollandCode } from '../types';

interface RadarChartProps {
  scores: Record<HollandCode, number>;
  top3: [HollandCode, HollandCode, HollandCode];
}

const AXIS_CONFIG: { code: HollandCode; label: string; angle: number }[] = [
  { code: 'R', label: 'R - Kỹ thuật', angle: 270 }, // Top
  { code: 'I', label: 'I - Nghiên cứu', angle: 330 }, // Top Right
  { code: 'A', label: 'A - Nghệ thuật', angle: 30 }, // Bottom Right
  { code: 'S', label: 'S - Xã hội', angle: 90 }, // Bottom
  { code: 'E', label: 'E - Quản lí', angle: 150 }, // Bottom Left
  { code: 'C', label: 'C - Nghiệp vụ', angle: 210 }, // Top Left
];

export const RadarChart: React.FC<RadarChartProps> = ({ scores, top3 }) => {
  const size = 320;
  const center = size / 2;
  const radius = 105;
  const maxScore = 20; // Maximum possible single group score in 10 questions

  // Helper to convert polar to cartesian
  const getCoordinates = (angleDeg: number, dist: number) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
      x: center + dist * Math.cos(angleRad),
      y: center + dist * Math.sin(angleRad),
    };
  };

  // Build grid rings (4 levels: 5, 10, 15, 20)
  const ringLevels = [0.25, 0.5, 0.75, 1.0];

  // Polygon points for student's score
  const polygonPoints = AXIS_CONFIG.map((axis) => {
    const score = scores[axis.code] || 0;
    const normalizedDist = Math.max(0.08, Math.min(1.0, score / maxScore)) * radius;
    const { x, y } = getCoordinates(axis.angle, normalizedDist);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        <defs>
          <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0d9488" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#2563eb" stopOpacity={0.15} />
          </radialGradient>
        </defs>

        {/* Concentric Hexagon Grid Rings */}
        {ringLevels.map((lvl) => {
          const ringPoints = AXIS_CONFIG.map((axis) => {
            const { x, y } = getCoordinates(axis.angle, lvl * radius);
            return `${x.toFixed(1)},${y.toFixed(1)}`;
          }).join(' ');

          return (
            <polygon
              key={lvl}
              points={ringPoints}
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray={lvl < 1.0 ? '3 3' : 'none'}
              className="text-slate-200 dark:text-slate-800"
            />
          );
        })}

        {/* Axis Spokes from center */}
        {AXIS_CONFIG.map((axis) => {
          const outer = getCoordinates(axis.angle, radius);
          return (
            <line
              key={axis.code}
              x1={center}
              y1={center}
              x2={outer.x}
              y2={outer.y}
              stroke="currentColor"
              strokeWidth="1"
              className="text-slate-200 dark:text-slate-800"
            />
          );
        })}

        {/* Student Score Filled Polygon */}
        <polygon
          points={polygonPoints}
          fill="url(#radarFill)"
          stroke="#0d9488"
          strokeWidth="2.5"
          className="transition-all duration-500 ease-out"
        />

        {/* Data points & Score Badges on vertices */}
        {AXIS_CONFIG.map((axis) => {
          const score = scores[axis.code] || 0;
          const normalizedDist = Math.max(0.08, Math.min(1.0, score / maxScore)) * radius;
          const pt = getCoordinates(axis.angle, normalizedDist);
          const isTop3 = top3.includes(axis.code);

          // Label position outside radius
          const labelPt = getCoordinates(axis.angle, radius + 25);

          return (
            <g key={`point-${axis.code}`}>
              {/* Vertex Circle */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isTop3 ? 5.5 : 3.5}
                fill={isTop3 ? '#0f766e' : '#3b82f6'}
                stroke="#ffffff"
                strokeWidth="1.5"
                className="transition-all duration-300"
              />

              {/* Text Label */}
              <text
                x={labelPt.x}
                y={labelPt.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`text-[11px] font-bold ${
                  isTop3
                    ? 'fill-teal-700 dark:fill-teal-300 font-extrabold'
                    : 'fill-slate-600 dark:fill-slate-400'
                }`}
              >
                {axis.code} ({score}đ)
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
