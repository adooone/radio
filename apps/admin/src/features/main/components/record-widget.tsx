import { formatDuration } from '@/utils/format-duration';
import clsx from 'clsx';
import { CircularProgress } from '@dendelion/mojo-ui';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { SpindleHole } from './spindle-hole';
import { WidgetSkeleton } from './widget-skeleton';

export type RecordContent =
  | { type: 'number'; value: number; format?: 'default' | 'duration' }
  | { type: 'progress'; percentage: number }
  | {
      type: 'image';
      src: string;
      alt: string;
      title?: string;
      subtitle?: string;
    }
  | { type: 'pie'; data: Array<{ name: string; value: number }> };

type RecordWidgetProps = {
  title?: string;
  content: RecordContent;
  radius?: number; // in pixels (default 112 = w-56 h-56)
  isLoading?: boolean;
  className?: string; // For external positioning
  color?: string; // Accent color for border/shadow (default: sun color)
  titleRotation?: number; // Rotation angle for title path in degrees (default: 0)
};

const COLORS = ['#ff9f1c', '#ffc857', '#ffbd30', '#ff6f00', '#d45500'];

export const RecordWidget = ({
  title,
  content,
  radius = 112,
  isLoading = false,
  className,
  color = '#ff9f1c', // Default sun color
  titleRotation = 0,
}: RecordWidgetProps) => {
  const size = radius * 2;
  const viewBoxSize = size;
  const accentColor = color;

  if (isLoading) {
    return <WidgetSkeleton radius={radius} />;
  }

  const renderContent = () => {
    switch (content.type) {
      case 'number': {
        const displayValue =
          content.format === 'duration'
            ? formatDuration(content.value)
            : content.value.toLocaleString();
        const textSize =
          content.format === 'duration' ? 'text-5xl' : 'text-4xl';
        return (
          <div
            className={`${textSize} font-bold`}
            style={{
              color: accentColor,
              filter: `drop-shadow(0 0 8px ${accentColor}80)`,
            }}
          >
            {displayValue}
          </div>
        );
      }

      case 'progress': {
        const progressSize = Math.min(radius * 1.07, 120);
        return (
          <CircularProgress
            percentage={content.percentage}
            size={progressSize}
            strokeWidth={6}
            color={accentColor}
          />
        );
      }

      case 'image': {
        // Make the cover larger and circular like a vinyl center label
        const coverSize = radius * 1.1; // Same size as radius for full center coverage
        return (
          <>
            {/* Cover positioned absolutely at center */}
            <div
              className={clsx(
                'absolute rounded-full overflow-hidden',
                'bg-coal-relic/40 border-2 border-white/20',
                'shadow-lg',
                'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
              )}
              style={{
                width: coverSize,
                height: coverSize,
                zIndex: 5,
              }}
            >
              <img
                src={content.src}
                alt={content.alt}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget
                    .nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="w-full h-full hidden items-center justify-center text-paper-fog/50 absolute inset-0 bg-coal-deep/60 rounded-full">
                <span className="text-[10px]">No cover</span>
              </div>
            </div>
          </>
        );
      }

      case 'pie':
        if (content.data.length === 0) {
          return (
            <div className="text-xs text-paper-calm relative z-10">No data</div>
          );
        }
        return (
          <div
            className="relative z-10 w-full h-full"
            style={{ height: radius * 1.6 }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={content.data}
                  cx="50%"
                  cy="50%"
                  innerRadius={radius * 0.45}
                  outerRadius={radius * 0.8}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth={1}
                >
                  {content.data.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={COLORS[content.data.indexOf(entry) % COLORS.length]}
                      style={{
                        filter: `drop-shadow(0 0 4px ${accentColor}66)`,
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(30, 30, 30, 0.95)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: '#f0e6d2',
                  }}
                  labelStyle={{ color: accentColor }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );

      default:
        return null;
    }
  };

  const spindleSize = Math.max(18, radius * 0.18);

  return (
    <div
      className={clsx(
        'relative',
        'text-center bg-coal-deep/30 backdrop-blur-md rounded-full',
        'border border-white/20 p-6',
        'shadow-2xl transition-all duration-500',
        'flex flex-col items-center justify-center',
        'before:absolute before:inset-0 before:rounded-full before:bg-gradient-radial before:from-sun/5 before:via-transparent before:to-transparent before:pointer-events-none',
        className,
      )}
      style={{
        width: size,
        height: size,
        boxShadow: `0 0 30px ${accentColor}26`,
      }}
    >
      {/* Spindle Hole */}
      <SpindleHole size={spindleSize} />

      {/* Title curved along the top edge of the circle */}
      {title && (
        <div className="absolute inset-0 z-20 pointer-events-none overflow-visible">
          <svg
            className="absolute inset-0 w-full h-full overflow-visible"
            viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
            xmlns="http://www.w3.org/2000/svg"
            aria-label={title}
            style={{ overflow: 'visible' }}
          >
            <title>{title}</title>
            <defs>
              <path
                id={`title-path-${title.replace(/\s+/g, '-').toLowerCase()}`}
                d={(() => {
                  // Normalize rotation to 0-360 range
                  const normalizedRotation =
                    ((titleRotation % 360) + 360) % 360;

                  // Calculate arc path based on titleRotation
                  const centerX = viewBoxSize / 2;
                  const centerY = viewBoxSize / 2;
                  const arcRadius = radius * 0.82;
                  // Convert rotation to radians, adjusting for SVG coordinate system (0° = top)
                  const startAngleRad =
                    ((normalizedRotation - 90) * Math.PI) / 180;
                  // Use 270 degrees arc to accommodate longer titles
                  const arcLengthRad = (Math.PI * 3) / 2; // 270 degrees arc

                  // Calculate start point
                  const startX = centerX + arcRadius * Math.cos(startAngleRad);
                  const startY = centerY + arcRadius * Math.sin(startAngleRad);

                  // Calculate end point
                  const endAngleRad = startAngleRad + arcLengthRad;
                  const endX = centerX + arcRadius * Math.cos(endAngleRad);
                  const endY = centerY + arcRadius * Math.sin(endAngleRad);

                  // Use large-arc-flag = 1 for 270 degree arc
                  const sweepFlag = 1;

                  return `M ${startX},${startY} A ${arcRadius},${arcRadius} 0 1,${sweepFlag} ${endX},${endY}`;
                })()}
                fill="none"
              />
            </defs>
            <text
              className="text-xs font-display font-semibold fill-paper-calm uppercase tracking-wide"
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
              }}
            >
              <textPath
                href={`#title-path-${title.replace(/\s+/g, '-').toLowerCase()}`}
                startOffset="50%"
                textAnchor="middle"
              >
                {title}
              </textPath>
            </text>
          </svg>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {renderContent()}
      </div>

      {/* Light leak effect */}
      <div
        className="absolute top-0 right-0 w-1/2 h-1/2 rounded-full bg-gradient-radial via-transparent to-transparent pointer-events-none opacity-50"
        style={{
          background: `radial-gradient(ellipse at center, ${accentColor}1A 0%, transparent 70%)`,
        }}
      />
    </div>
  );
};
