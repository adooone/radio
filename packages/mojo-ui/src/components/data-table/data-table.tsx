import clsx from 'clsx';
import type { FC, ReactNode } from 'react';
import styles from './data-table.module.scss';

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  keyExtractor: (row: T) => string;
  striped?: boolean;
  hoverable?: boolean;
  compact?: boolean;
  bordered?: boolean;
  loading?: boolean;
  emptyMessage?: ReactNode;
  className?: string;
  headerClassName?: string;
  rowClassName?: string | ((row: T) => string);
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  striped = true,
  hoverable = true,
  compact = false,
  bordered = true,
  loading = false,
  emptyMessage = 'No data available',
  className,
  headerClassName,
  rowClassName,
  onRowClick,
}: DataTableProps<T>) {
  const getRowClassName = (row: T, index: number): string => {
    const baseClasses = clsx(
      styles.row,
      striped && index % 2 === 1 && styles.striped,
      hoverable && styles.hoverable,
      onRowClick && styles.clickable,
    );

    if (typeof rowClassName === 'function') {
      return clsx(baseClasses, rowClassName(row));
    }

    return clsx(baseClasses, rowClassName);
  };

  return (
    <div
      className={clsx(styles.wrapper, bordered && styles.bordered, className)}
    >
      <div className={styles.container}>
        <table className={clsx(styles.table, compact && styles.compact)}>
          <thead className={clsx(styles.header, headerClassName)}>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={clsx(
                    styles.th,
                    column.align && styles[`align${column.align}`],
                    column.sortable && styles.sortable,
                  )}
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={styles.body}>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className={styles.loadingCell}>
                  <div className={styles.loading}>
                    <div className={styles.loadingBar} />
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={styles.emptyCell}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={keyExtractor(row)}
                  className={getRowClassName(row, index)}
                  onClick={() => onRowClick?.(row)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onRowClick?.(row);
                    }
                  }}
                  role={onRowClick ? 'button' : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                >
                  {columns.map((column) => (
                    <td
                      key={`${keyExtractor(row)}-${column.key}`}
                      className={clsx(
                        styles.td,
                        column.align && styles[`align${column.align}`],
                      )}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Type-safe export for the component
export const DataTableComponent: FC<DataTableProps<Record<string, unknown>>> = (
  props,
) => {
  return DataTable(props);
};
