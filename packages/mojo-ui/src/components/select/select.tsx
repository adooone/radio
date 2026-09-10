import clsx from 'clsx';
import type { FC, SelectHTMLAttributes } from 'react';
import {
  type Size,
  capitalizeFirst,
  getSizeTextClass,
} from '../../utils/style-helpers';
import styles from './select.module.scss';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size?: Size;
  label?: string;
  error?: string;
  options: SelectOption[];
}

export const Select: FC<SelectProps> = ({
  size = 'medium',
  label,
  error,
  options,
  className,
  ...props
}) => {
  const selectId =
    props.id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={styles.container}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
        </label>
      )}
      <div
        className={clsx(styles.wrapper, styles[size], error && styles.error)}
      >
        <div
          className={clsx(
            styles.baseLayer,
            styles[`baseLayer${capitalizeFirst(size)}`],
          )}
        />

        <div
          className={clsx(
            styles.field,
            styles[`field${capitalizeFirst(size)}`],
            props.disabled && styles.fieldDisabled,
          )}
        />

        <select
          id={selectId}
          className={clsx(
            styles.select,
            styles[size],
            getSizeTextClass(size),
            className,
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
};
