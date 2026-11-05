import { Button } from '@dendelion/func-ui';
import { Input, Textarea } from '@dendelion/func-ui';
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
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Згорнути' : 'Редагувати'}
        </Button>
        <Button variant="secondary" size="sm" onClick={onRefetch}>
          З Discogs ще раз
        </Button>
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
            <Input
              label="Назва альбому"
              id="md-title"
              value={fields.albumTitle}
              onChange={(e) => set('albumTitle', e.target.value)}
              required
            />
            <Input
              label="Виконавець"
              id="md-artist"
              value={fields.artist}
              onChange={(e) => set('artist', e.target.value)}
              required
            />
          </div>
          <Input
            label="Рік запису"
            className="max-w-[12rem]"
            id="md-year"
            type="number"
            value={fields.recordingYear}
            onChange={(e) => set('recordingYear', e.target.value)}
            placeholder="1971"
          />

          <Section title="Деталі запису">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Період"
                id="md-period"
                value={fields.period}
                onChange={(e) => set('period', e.target.value)}
              />
              <Input
                label="Місце"
                id="md-location"
                value={fields.location}
                onChange={(e) => set('location', e.target.value)}
              />
            </div>
            <Textarea
              label="Винятки"
              id="md-exceptions"
              rows={2}
              value={fields.exceptions}
              onChange={(e) => set('exceptions', e.target.value)}
            />
          </Section>

          <Section title="Видання">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Лейбл"
                id="md-label"
                value={fields.label}
                onChange={(e) => set('label', e.target.value)}
              />
              <Input
                label="Каталожний номер"
                id="md-catno"
                value={fields.catalogNumber}
                onChange={(e) => set('catalogNumber', e.target.value)}
              />
              <Input
                label="Країна"
                id="md-country"
                value={fields.country}
                onChange={(e) => set('country', e.target.value)}
              />
              <Input
                label="Рік видання"
                id="md-issue-year"
                type="number"
                value={fields.issueYear}
                onChange={(e) => set('issueYear', e.target.value)}
              />
              <Input
                label="Дата видання"
                id="md-released"
                value={fields.released}
                onChange={(e) => set('released', e.target.value)}
              />
              <Input
                label="Формат"
                id="md-format"
                value={fields.format}
                onChange={(e) => set('format', e.target.value)}
              />
            </div>
            <Input
              label="Phonographic copyright"
              id="md-copyright"
              value={fields.phonographicCopyright}
              onChange={(e) => set('phonographicCopyright', e.target.value)}
            />
          </Section>

          <Section title="Треклист">
            <div className="flex flex-col gap-2">
              {form.tracklist.map((track, index) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: rows are only appended or removed by index
                  key={index}
                  className="grid grid-cols-[5rem_1fr_6rem_auto] items-center gap-2"
                >
                  <Input
                    aria-label="Позиція"
                    value={track.position}
                    onChange={(e) =>
                      form.tracks.update(index, { position: e.target.value })
                    }
                    placeholder="A1"
                  />
                  <Input
                    aria-label="Назва"
                    value={track.title}
                    onChange={(e) =>
                      form.tracks.update(index, { title: e.target.value })
                    }
                    placeholder="Назва"
                  />
                  <Input
                    aria-label="Тривалість"
                    value={track.duration ?? ''}
                    onChange={(e) =>
                      form.tracks.update(index, { duration: e.target.value })
                    }
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
            <Button
              variant="ghost"
              size="sm"
              className="self-start"
              onClick={form.tracks.add}
            >
              Додати трек
            </Button>
          </Section>

          <Section title="Учасники">
            <div className="flex flex-col gap-2">
              {form.personnel.map((person, index) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: rows are only appended or removed by index
                  key={index}
                  className="grid grid-cols-[1fr_1fr_auto] items-center gap-2"
                >
                  <Input
                    aria-label="Імʼя"
                    value={person.name}
                    onChange={(e) =>
                      form.people.update(index, { name: e.target.value })
                    }
                    placeholder="Імʼя"
                  />
                  <Input
                    aria-label="Ролі"
                    value={person.roles.join(', ')}
                    onChange={(e) =>
                      form.people.update(index, { rolesText: e.target.value })
                    }
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
            <Button
              variant="ghost"
              size="sm"
              className="self-start"
              onClick={form.people.add}
            >
              Додати учасника
            </Button>
          </Section>

          <Section title="Продакшн та оформлення">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Звукорежисер"
                id="md-engineer"
                value={fields.engineer}
                onChange={(e) => set('engineer', e.target.value)}
              />
              <Input
                label="Продюсери"
                helperText="через кому"
                id="md-producers"
                value={fields.producers}
                onChange={(e) => set('producers', e.target.value)}
              />
              <Input
                label="Мастеринг"
                id="md-mastering"
                value={fields.mastering}
                onChange={(e) => set('mastering', e.target.value)}
              />
              <Input
                label="Фото"
                helperText="через кому"
                id="md-photography"
                value={fields.photography}
                onChange={(e) => set('photography', e.target.value)}
              />
              <Input
                label="Дизайн"
                id="md-design"
                value={fields.design}
                onChange={(e) => set('design', e.target.value)}
              />
            </div>
            <Textarea
              label="Додаткова інформація"
              id="md-notes"
              rows={3}
              value={fields.additionalInfo}
              onChange={(e) => set('additionalInfo', e.target.value)}
            />
          </Section>

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              variant="lit"
              size="sm"
              disabled={form.saving || !form.dirty}
            >
              {form.saving ? 'Збереження…' : 'Зберегти'}
            </Button>
            {form.dirty && !form.saving && (
              <span className="font-sans text-[11px] text-glow">
                є незбережені зміни
              </span>
            )}
            {form.error && (
              <span className="font-sans text-xs text-accent">
                {form.error}
              </span>
            )}
          </div>
        </form>
      )}
    </section>
  );
};
