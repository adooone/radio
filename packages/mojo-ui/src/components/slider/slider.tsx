import clsx from 'clsx';
import {
  type ChangeEvent,
  type FC,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import styles from './slider.module.scss';

export interface SliderProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  label?: string;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
  size?: 'small' | 'medium' | 'large';
  onChange?: (value: number) => void;
  onChangeEnd?: (value: number) => void;
  className?: string;
}

export const Slider: FC<SliderProps> = ({
  value: controlledValue,
  defaultValue = 0,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  label,
  showValue = true,
  valueFormatter = (v) => String(v),
  size = 'medium',
  onChange,
  onChangeEnd,
  className,
}) => {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const value = isControlled ? controlledValue : internalValue;

  const clamp = useCallback(
    (val: number) => Math.min(max, Math.max(min, val)),
    [min, max],
  );

  const roundToStep = useCallback(
    (val: number) => {
      const steps = Math.round((val - min) / step);
      return clamp(min + steps * step);
    },
    [min, step, clamp],
  );

  const getPercentage = useCallback(
    (val: number) => ((val - min) / (max - min)) * 100,
    [min, max],
  );

  const handleValueChange = useCallback(
    (newValue: number) => {
      const clampedValue = roundToStep(newValue);
      if (!isControlled) {
        setInternalValue(clampedValue);
      }
      onChange?.(clampedValue);
    },
    [isControlled, onChange, roundToStep],
  );

  const handleTrackClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || !trackRef.current) return;

      const rect = trackRef.current.getBoundingClientRect();
      const percentage = (e.clientX - rect.left) / rect.width;
      const newValue = min + percentage * (max - min);
      handleValueChange(newValue);
    },
    [disabled, min, max, handleValueChange],
  );

  const handleMouseDown = useCallback(() => {
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onChangeEnd?.(value);
    }
  }, [isDragging, value, onChangeEnd]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !trackRef.current) return;

      const rect = trackRef.current.getBoundingClientRect();
      const percentage = (e.clientX - rect.left) / rect.width;
      const newValue = min + percentage * (max - min);
      handleValueChange(newValue);
    },
    [isDragging, min, max, handleValueChange],
  );

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = Number.parseFloat(e.target.value);
    handleValueChange(newValue);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const percentage = getPercentage(value);

  return (
    <div
      className={clsx(styles.container, disabled && styles.disabled, className)}
    >
      {(label || showValue) && (
        <div className={styles.header}>
          {label && <span className={styles.label}>{label}</span>}
          {showValue && (
            <span className={styles.value}>{valueFormatter(value)}</span>
          )}
        </div>
      )}
      <div
        className={clsx(styles.trackWrapper, styles[size])}
        ref={trackRef}
        onClick={handleTrackClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleTrackClick(e as unknown as React.MouseEvent<HTMLDivElement>);
          }
        }}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        tabIndex={0}
      >
        <div className={styles.track}>
          <div className={styles.fill} style={{ width: `${percentage}%` }} />
          <div
            className={clsx(styles.thumb, isDragging && styles.dragging)}
            style={{ left: `${percentage}%` }}
            onMouseDown={handleMouseDown}
            role="slider"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
            aria-disabled={disabled}
            tabIndex={disabled ? -1 : 0}
            onKeyDown={(e) => {
              if (disabled) return;
              const stepSize = e.shiftKey ? step * 10 : step;
              switch (e.key) {
                case 'ArrowLeft':
                case 'ArrowDown':
                  e.preventDefault();
                  handleValueChange(value - stepSize);
                  break;
                case 'ArrowRight':
                case 'ArrowUp':
                  e.preventDefault();
                  handleValueChange(value + stepSize);
                  break;
                case 'Home':
                  e.preventDefault();
                  handleValueChange(min);
                  break;
                case 'End':
                  e.preventDefault();
                  handleValueChange(max);
                  break;
              }
            }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          className={styles.hiddenInput}
        />
      </div>
    </div>
  );
};
