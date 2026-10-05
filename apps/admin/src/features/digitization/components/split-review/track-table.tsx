import { DataTable, type DataTableColumn } from '@dendelion/mojo-ui';
import type { DigitizationTrackPlan } from '@radio/types';
import { formatSeconds } from './split-review-utils';

type TrackTableProps = {
  tracks: DigitizationTrackPlan[];
};

export const TrackTable = ({ tracks }: TrackTableProps) => {
  const columns: DataTableColumn<DigitizationTrackPlan>[] = [
    {
      key: 'index',
      header: '#',
      cell: (track) => track.index + 1,
      width: '40px',
    },
    { key: 'fileSlug', header: 'Файл', cell: (track) => track.fileSlug },
    {
      key: 'length',
      header: 'Тривалість',
      cell: (track) => formatSeconds(track.end - track.start),
    },
    {
      key: 'expected',
      header: 'Очікувана',
      cell: (track) =>
        track.expectedDuration ? formatSeconds(track.expectedDuration) : '—',
    },
    {
      key: 'warnings',
      header: 'Попередження',
      cell: (track) =>
        track.warnings.length > 0 ? track.warnings.join('; ') : '—',
    },
  ];

  return (
    <DataTable
      data={tracks}
      columns={columns}
      keyExtractor={(track) => track.fileSlug}
      striped
      compact
      rowClassName={(track) =>
        track.warnings.length > 0 ? 'bg-amber-900/20' : ''
      }
    />
  );
};
