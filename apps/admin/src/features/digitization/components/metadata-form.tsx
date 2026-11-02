import { Field, Pill, TextArea, TextInput } from '@/features/admin/ui';
import type { AlbumDataJson } from '@radio/types';
import { useState } from 'react';
import { useDraftMetadataForm } from '../hooks/use-draft-metadata-form';

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-4 border-t border-cream/[0.08] pt-5">
    <span className="type-label text-cream/45">{title}</span>
    {children}
  </div>
);

/**
 * The draft's data.json, folded to its name line until opened: every field
 * of the record, its tracklist and its people, saved back as a whole.
 */
export const MetadataForm = ({
  slug,
  metadata,
  onRefetch,
}: {
  slug: string;
  metadata: AlbumDataJson;
  onRefetch: () => void;
}) => {
  const form = useDraftMetadataForm(slug, metadata);
  const { fields, set } = form;
  const [open, setOpen] = useState(false);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="type-label text-cream/60">Метадані</span>
        <span className="min-w-0 flex-1 truncate font-sans text-[13px] text-cream/60">
          {[fields.artist, fields.albumTitle, fields.recordingYear]
            .filter(Boolean)
            .join(' · ')}
          {form.tracklist.length > 0 && ` · ${form.tracklist.length} треків`}
        </span>
        <Pill tone="quiet" size="sm" onClick={() => setOpen((v) => !v)}>
          {open ? 'Згорнути' : 'Редагувати'}
        </Pill>
        <Pill tone="quiet" size="sm" onClick={onRefetch}>
          З Discogs ще раз
        </Pill>
      </div>

      {open && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.submit();
          }}
          className="flex flex-col gap-5"
        >
          <div className="grid grid-cols-2 gap-4">
            <Field label="Назва альбому" htmlFor="md-title">
              <TextInput
                id="md-title"
                value={fields.albumTitle}
                onChange={(e) => set('albumTitle', e.target.value)}
                required
              />
            </Field>
            <Field label="Виконавець" htmlFor="md-artist">
              <TextInput
                id="md-artist"
                value={fields.artist}
                onChange={(e) => set('artist', e.target.value)}
                required
              />
            </Field>
          </div>
          <Field label="Рік запису" htmlFor="md-year" className="max-w-[12rem]">
            <TextInput
              id="md-year"
              type="number"
              value={fields.recordingYear}
              onChange={(e) => set('recordingYear', e.target.value)}
              placeholder="1971"
            />
          </Field>

          <Section title="Деталі запису">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Період" htmlFor="md-period">
                <TextInput
                  id="md-period"
                  value={fields.period}
                  onChange={(e) => set('period', e.target.value)}
                />
              </Field>
              <Field label="Місце" htmlFor="md-location">
                <TextInput
                  id="md-location"
                  value={fields.location}
                  onChange={(e) => set('location', e.target.value)}
                />
              </Field>
            </div>
            <Field label="Винятки" htmlFor="md-exceptions">
              <TextArea
                id="md-exceptions"
                rows={2}
                value={fields.exceptions}
                onChange={(e) => set('exceptions', e.target.value)}
              />
            </Field>
          </Section>

          <Section title="Видання">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Лейбл" htmlFor="md-label">
                <TextInput
                  id="md-label"
                  value={fields.label}
                  onChange={(e) => set('label', e.target.value)}
                />
              </Field>
              <Field label="Каталожний номер" htmlFor="md-catno">
                <TextInput
                  id="md-catno"
                  value={fields.catalogNumber}
                  onChange={(e) => set('catalogNumber', e.target.value)}
                />
              </Field>
              <Field label="Країна" htmlFor="md-country">
                <TextInput
                  id="md-country"
                  value={fields.country}
                  onChange={(e) => set('country', e.target.value)}
                />
              </Field>
              <Field label="Рік видання" htmlFor="md-issue-year">
                <TextInput
                  id="md-issue-year"
                  type="number"
                  value={fields.issueYear}
                  onChange={(e) => set('issueYear', e.target.value)}
                />
              </Field>
              <Field label="Дата видання" htmlFor="md-released">
                <TextInput
                  id="md-released"
                  value={fields.released}
                  onChange={(e) => set('released', e.target.value)}
                />
              </Field>
              <Field label="Формат" htmlFor="md-format">
                <TextInput
                  id="md-format"
                  value={fields.format}
                  onChange={(e) => set('format', e.target.value)}
                />
              </Field>
            </div>
            <Field label="Phonographic copyright" htmlFor="md-copyright">
              <TextInput
                id="md-copyright"
                value={fields.phonographicCopyright}
                onChange={(e) => set('phonographicCopyright', e.target.value)}
              />
            </Field>
          </Section>

          <Section title="Треклист">
            <div className="flex flex-col gap-2">
              {form.tracklist.map((track, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: rows are only appended or removed by index
                <div key={index} className="grid grid-cols-[5rem_1fr_6rem_auto] items-center gap-2">
                  <TextInput
                    aria-label="Позиція"
                    value={track.position}
                    onChange={(e) => form.tracks.update(index, { position: e.target.value })}
                    placeholder="A1"
                  />
                  <TextInput
                    aria-label="Назва"
                    value={track.title}
                    onChange={(e) => form.tracks.update(index, { title: e.target.value })}
                    placeholder="Назва"
                  />
                  <TextInput
                    aria-label="Тривалість"
                    value={track.duration ?? ''}
                    onChange={(e) => form.tracks.update(index, { duration: e.target.value })}
                    placeholder="3:45"
                  />
                  <button
                    type="button"
                    onClick={() => form.tracks.remove(index)}
                    aria-label="Видалити трек"
                    className="px-1 text-cream/45 transition-colors hover:text-accent"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <Pill tone="ghost" size="sm" className="self-start" onClick={form.tracks.add}>
              Додати трек
            </Pill>
          </Section>

          <Section title="Учасники">
            <div className="flex flex-col gap-2">
              {form.personnel.map((person, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: rows are only appended or removed by index
                <div key={index} className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
                  <TextInput
                    aria-label="Імʼя"
                    value={person.name}
                    onChange={(e) => form.people.update(index, { name: e.target.value })}
                    placeholder="Імʼя"
                  />
                  <TextInput
                    aria-label="Ролі"
                    value={person.roles.join(', ')}
                    onChange={(e) => form.people.update(index, { rolesText: e.target.value })}
                    placeholder="ролі через кому"
                  />
                  <button
                    type="button"
                    onClick={() => form.people.remove(index)}
                    aria-label="Видалити учасника"
                    className="px-1 text-cream/45 transition-colors hover:text-accent"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <Pill tone="ghost" size="sm" className="self-start" onClick={form.people.add}>
              Додати учасника
            </Pill>
          </Section>

          <Section title="Продакшн та оформлення">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Звукорежисер" htmlFor="md-engineer">
                <TextInput
                  id="md-engineer"
                  value={fields.engineer}
                  onChange={(e) => set('engineer', e.target.value)}
                />
              </Field>
              <Field label="Продюсери" htmlFor="md-producers" hint="через кому">
                <TextInput
                  id="md-producers"
                  value={fields.producers}
                  onChange={(e) => set('producers', e.target.value)}
                />
              </Field>
              <Field label="Мастеринг" htmlFor="md-mastering">
                <TextInput
                  id="md-mastering"
                  value={fields.mastering}
                  onChange={(e) => set('mastering', e.target.value)}
                />
              </Field>
              <Field label="Фото" htmlFor="md-photography" hint="через кому">
                <TextInput
                  id="md-photography"
                  value={fields.photography}
                  onChange={(e) => set('photography', e.target.value)}
                />
              </Field>
              <Field label="Дизайн" htmlFor="md-design">
                <TextInput
                  id="md-design"
                  value={fields.design}
                  onChange={(e) => set('design', e.target.value)}
                />
              </Field>
            </div>
            <Field label="Додаткова інформація" htmlFor="md-notes">
              <TextArea
                id="md-notes"
                rows={3}
                value={fields.additionalInfo}
                onChange={(e) => set('additionalInfo', e.target.value)}
              />
            </Field>
          </Section>

          <div className="flex items-center gap-3">
            <Pill type="submit" tone="lit" size="sm" disabled={form.saving || !form.dirty}>
              {form.saving ? 'Збереження…' : 'Зберегти'}
            </Pill>
            {form.dirty && !form.saving && (
              <span className="font-sans text-[11px] text-glow">є незбережені зміни</span>
            )}
            {form.error && <span className="font-sans text-xs text-accent">{form.error}</span>}
          </div>
        </form>
      )}
    </section>
  );
};
