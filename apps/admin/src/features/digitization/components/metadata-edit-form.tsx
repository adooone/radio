import { useUpdateDraftMetadata } from '@/services/api';
import { Button, Input, Textarea } from '@dendelion/mojo-ui';
import type { AlbumDataJson, PersonnelItem, TracklistItem } from '@radio/types';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

type MetadataEditFormProps = {
  slug: string;
  metadata: AlbumDataJson;
  onSaved?: () => void;
};

export const MetadataEditForm = ({
  slug,
  metadata,
  onSaved,
}: MetadataEditFormProps) => {
  const [albumTitle, setAlbumTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [recordingYear, setRecordingYear] = useState('');
  const [period, setPeriod] = useState('');
  const [location, setLocation] = useState('');
  const [exceptions, setExceptions] = useState('');
  const [label, setLabel] = useState('');
  const [catalogNumber, setCatalogNumber] = useState('');
  const [country, setCountry] = useState('');
  const [issueYear, setIssueYear] = useState('');
  const [released, setReleased] = useState('');
  const [format, setFormat] = useState('');
  const [phonographicCopyright, setPhonographicCopyright] = useState('');
  const [tracklist, setTracklist] = useState<TracklistItem[]>([]);
  const [personnel, setPersonnel] = useState<PersonnelItem[]>([]);
  const [engineer, setEngineer] = useState('');
  const [producers, setProducers] = useState('');
  const [mastering, setMastering] = useState('');
  const [photography, setPhotography] = useState('');
  const [design, setDesign] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  const updateMetadata = useUpdateDraftMetadata();

  useEffect(() => {
    if (isDirty) return;
    setAlbumTitle(metadata.album_title ?? '');
    setArtist(metadata.artist ?? '');
    setRecordingYear(metadata.recording_year?.toString() ?? '');
    setPeriod(metadata.recording_details?.period ?? '');
    setLocation(metadata.recording_details?.location ?? '');
    setExceptions(metadata.recording_details?.exceptions ?? '');
    setLabel(metadata.release_info?.label ?? '');
    setCatalogNumber(metadata.release_info?.catalog_number ?? '');
    setCountry(metadata.release_info?.country ?? '');
    setIssueYear(metadata.release_info?.issue_year?.toString() ?? '');
    setReleased(metadata.release_info?.released ?? '');
    setFormat(metadata.release_info?.format ?? '');
    setPhonographicCopyright(
      metadata.release_info?.phonographic_copyright ?? '',
    );
    setTracklist(metadata.tracklist ?? []);
    setPersonnel(metadata.personnel ?? []);
    setEngineer(metadata.production?.engineer ?? '');
    setProducers((metadata.production?.producers ?? []).join(', '));
    setMastering(metadata.production?.mastering ?? '');
    setPhotography((metadata.visuals?.photography ?? []).join(', '));
    setDesign(metadata.visuals?.design ?? '');
    setAdditionalInfo(metadata.additional_info ?? '');
  }, [metadata, isDirty]);

  const updateTrack = (index: number, patch: Partial<TracklistItem>) => {
    setIsDirty(true);
    setTracklist((prev) =>
      prev.map((track, i) => (i === index ? { ...track, ...patch } : track)),
    );
  };

  const removeTrack = (index: number) => {
    setIsDirty(true);
    setTracklist((prev) => prev.filter((_, i) => i !== index));
  };

  const addTrack = () => {
    setIsDirty(true);
    setTracklist((prev) => [...prev, { position: '', title: '' }]);
  };

  const updatePersonAt = (
    index: number,
    patch: { name?: string; rolesText?: string },
  ) => {
    setIsDirty(true);
    setPersonnel((prev) =>
      prev.map((person, i) => {
        if (i !== index) return person;
        return {
          name: patch.name ?? person.name,
          roles:
            patch.rolesText !== undefined
              ? patch.rolesText
                  .split(',')
                  .map((role) => role.trim())
                  .filter(Boolean)
              : person.roles,
        };
      }),
    );
  };

  const removePerson = (index: number) => {
    setIsDirty(true);
    setPersonnel((prev) => prev.filter((_, i) => i !== index));
  };

  const addPerson = () => {
    setIsDirty(true);
    setPersonnel((prev) => [...prev, { name: '', roles: [] }]);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const data: AlbumDataJson = {
      album_title: albumTitle.trim(),
      artist: artist.trim(),
      recording_year: recordingYear
        ? Number.parseInt(recordingYear, 10)
        : undefined,
      recording_details: { period, location, exceptions },
      release_info: {
        label,
        catalog_number: catalogNumber,
        country,
        issue_year: issueYear ? Number.parseInt(issueYear, 10) : undefined,
        released,
        format,
        phonographic_copyright: phonographicCopyright,
      },
      discogs: metadata.discogs,
      tracklist,
      personnel,
      production: {
        engineer,
        producers: producers
          .split(',')
          .map((producer) => producer.trim())
          .filter(Boolean),
        mastering,
      },
      visuals: {
        photography: photography
          .split(',')
          .map((photo) => photo.trim())
          .filter(Boolean),
        design,
      },
      additional_info: additionalInfo,
    };

    try {
      await updateMetadata.mutateAsync({ slug, data });
      setIsDirty(false);
      onSaved?.();
    } catch (error) {
      console.error('Failed to save data.json:', error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      onChange={() => setIsDirty(true)}
      className={clsx(styles.form)}
    >
      <div className={clsx(styles.row2)}>
        <Input
          label="Назва альбому"
          value={albumTitle}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setAlbumTitle(event.target.value)
          }
          required
        />
        <Input
          label="Виконавець"
          value={artist}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setArtist(event.target.value)
          }
          required
        />
      </div>

      <Input
        label="Рік запису"
        type="number"
        value={recordingYear}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          setRecordingYear(event.target.value)
        }
        placeholder="1971"
      />

      <section className={clsx(styles.section)}>
        <h4 className={clsx(styles.sectionTitle)}>Деталі запису</h4>
        <div className={clsx(styles.row2)}>
          <Input
            label="Період"
            value={period}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setPeriod(event.target.value)
            }
          />
          <Input
            label="Місце"
            value={location}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setLocation(event.target.value)
            }
          />
        </div>
        <Textarea
          label="Винятки"
          value={exceptions}
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
            setExceptions(event.target.value)
          }
          rows={2}
        />
      </section>

      <section className={clsx(styles.section)}>
        <h4 className={clsx(styles.sectionTitle)}>Видання</h4>
        <div className={clsx(styles.row2)}>
          <Input
            label="Лейбл"
            value={label}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setLabel(event.target.value)
            }
          />
          <Input
            label="Каталожний номер"
            value={catalogNumber}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setCatalogNumber(event.target.value)
            }
          />
        </div>
        <div className={clsx(styles.row2)}>
          <Input
            label="Країна"
            value={country}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setCountry(event.target.value)
            }
          />
          <Input
            label="Рік видання"
            type="number"
            value={issueYear}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setIssueYear(event.target.value)
            }
          />
        </div>
        <div className={clsx(styles.row2)}>
          <Input
            label="Дата видання"
            value={released}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setReleased(event.target.value)
            }
          />
          <Input
            label="Формат"
            value={format}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setFormat(event.target.value)
            }
          />
        </div>
        <Input
          label="Phonographic copyright"
          value={phonographicCopyright}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setPhonographicCopyright(event.target.value)
          }
        />
      </section>

      <section className={clsx(styles.section)}>
        <h4 className={clsx(styles.sectionTitle)}>Треклист</h4>
        <div className={clsx(styles.list)}>
          {tracklist.map((track, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: rows are only appended/removed by index
            <div key={index} className={clsx(styles.trackRow)}>
              <Input
                label="Позиція"
                value={track.position}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  updateTrack(index, { position: event.target.value })
                }
                className={clsx(styles.trackPosition)}
              />
              <Input
                label="Назва"
                value={track.title}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  updateTrack(index, { title: event.target.value })
                }
                className={clsx(styles.trackTitle)}
              />
              <Input
                label="Тривалість"
                value={track.duration ?? ''}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  updateTrack(index, { duration: event.target.value })
                }
                placeholder="3:45"
                className={clsx(styles.trackDuration)}
              />
              <Button
                type="button"
                variant="red"
                size="small"
                title="Видалити"
                onClick={() => removeTrack(index)}
              />
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="gray"
          size="small"
          title="Додати трек"
          onClick={addTrack}
        />
      </section>

      <section className={clsx(styles.section)}>
        <h4 className={clsx(styles.sectionTitle)}>Учасники</h4>
        <div className={clsx(styles.list)}>
          {personnel.map((person, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: rows are only appended/removed by index
            <div key={index} className={clsx(styles.personRow)}>
              <Input
                label="Ім'я"
                value={person.name}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  updatePersonAt(index, { name: event.target.value })
                }
                className={clsx(styles.personName)}
              />
              <Input
                label="Ролі (через кому)"
                value={person.roles.join(', ')}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  updatePersonAt(index, { rolesText: event.target.value })
                }
                className={clsx(styles.personRoles)}
              />
              <Button
                type="button"
                variant="red"
                size="small"
                title="Видалити"
                onClick={() => removePerson(index)}
              />
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="gray"
          size="small"
          title="Додати учасника"
          onClick={addPerson}
        />
      </section>

      <section className={clsx(styles.section)}>
        <h4 className={clsx(styles.sectionTitle)}>Продукція та візуал</h4>
        <Input
          label="Звукорежисер"
          value={engineer}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setEngineer(event.target.value)
          }
        />
        <Input
          label="Продюсери (через кому)"
          value={producers}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setProducers(event.target.value)
          }
        />
        <Input
          label="Мастерінг"
          value={mastering}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setMastering(event.target.value)
          }
        />
        <Input
          label="Фотографія (через кому)"
          value={photography}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setPhotography(event.target.value)
          }
        />
        <Input
          label="Дизайн"
          value={design}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setDesign(event.target.value)
          }
        />
      </section>

      <Textarea
        label="Додаткова інформація"
        value={additionalInfo}
        onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
          setAdditionalInfo(event.target.value)
        }
        rows={3}
      />

      <div className={clsx(styles.actions)}>
        <Button
          type="submit"
          variant="dark"
          size="medium"
          title={updateMetadata.isPending ? 'Збереження...' : 'Зберегти'}
          disabled={updateMetadata.isPending}
        />
      </div>
    </form>
  );
};

const styles = {
  form: ['flex flex-col gap-4'],
  row2: ['grid grid-cols-1 md:grid-cols-2 gap-4'],
  section: ['flex flex-col gap-3 border-t border-gray-700/50 pt-4'],
  sectionTitle: [
    'text-sm font-display font-semibold text-stone-400 uppercase tracking-wide',
  ],
  list: ['flex flex-col gap-2'],
  trackRow: ['flex items-end gap-2'],
  trackPosition: ['w-20'],
  trackTitle: ['flex-1'],
  trackDuration: ['w-24'],
  personRow: ['flex items-end gap-2'],
  personName: ['w-1/3'],
  personRoles: ['flex-1'],
  actions: ['flex justify-end gap-3 pt-2'],
} as const;
