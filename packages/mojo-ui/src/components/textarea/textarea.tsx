import clsx from 'clsx';
import type { FC, TextareaHTMLAttributes } from 'react';
import {
  type Size,
  capitalizeFirst,
  getSizeTextClass,
} from '../../utils/style-helpers';
import styles from './textarea.module.scss';

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  size?: Size;
  label?: string;
  error?: string;
}

export const Textarea: FC<TextareaProps> = ({
  size = 'medium',
  label,
  error,
  className,
  ...props
}) => {
  const textareaId =
    props.id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={styles.container}>
      {label && (
        <label htmlFor={textareaId} className={styles.label}>
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
          )}
        />

        <textarea
          id={textareaId}
          className={clsx(
            styles.textarea,
            styles[size],
            getSizeTextClass(size),
            className,
          )}
          {...props}
        />
      </div>
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
};
