import clsx from 'clsx';
import type { FC, InputHTMLAttributes } from 'react';
import styles from './radio.module.scss';

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
  options: RadioOption[];
  name: string;
  size?: 'small' | 'medium' | 'large';
  layout?: 'horizontal' | 'vertical';
  label?: string;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export const Radio: FC<RadioProps> = ({
  options,
  name,
  size = 'medium',
  layout = 'vertical',
  label,
  error,
  value,
  onChange,
  disabled,
  className,
  ...props
}) => {
  const handleChange = (optionValue: string) => {
    if (!disabled && onChange) {
      onChange(optionValue);
    }
  };

  const groupId = `radio-group-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={clsx(styles.container, className)}>
      {label && <p className={styles.groupLabel}>{label}</p>}
      <div
        className={clsx(
          styles.options,
          styles[size],
          styles[layout],
          disabled && styles.disabled,
        )}
        role="radiogroup"
        aria-label={label || name}
      >
        {options.map((option) => {
          const isChecked = value === option.value;
          const isDisabled = disabled || option.disabled;
          const optionId = `${groupId}-${option.value}`;

          return (
            <label
              key={option.value}
              className={clsx(
                styles.option,
                isChecked && styles.checked,
                isDisabled && styles.disabled,
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isChecked}
                disabled={isDisabled}
                onChange={() => handleChange(option.value)}
                className={styles.input}
                id={optionId}
                {...props}
              />
              <span className={styles.radioControl}>
                <span className={styles.radioInner} />
              </span>
              <span className={styles.label}>{option.label}</span>
            </label>
          );
        })}
      </div>
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
};
