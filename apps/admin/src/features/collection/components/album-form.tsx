import {
  Field,
  Pill,
  SelectInput,
  TextArea,
  TextInput,
} from '@/features/admin/ui';
import type { Album } from '@radio/types';
import { CONDITION_OPTIONS, RPM_OPTIONS, useAlbumForm } from '../hooks';
import { TagEditor } from './tag-editor';

/** The album's fields, edited in place on the slab. */
export const AlbumForm = ({
  album,
  onDone,
}: {
  album: Album;
  onDone: () => void;
}) => {
  const form = useAlbumForm(album, onDone);
  const { fields, set } = form;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.submit();
      }}
      className="flex flex-col gap-5"
    >
      <span className="type-label text-cream/60">Редагування</span>

      <Field label="Назва" htmlFor="album-title">
        <TextInput
          id="album-title"
          value={fields.title}
          onChange={(e) => set('title', e.target.value)}
          required
        />
      </Field>
      <Field label="Виконавець" htmlFor="album-artist">
        <TextInput
          id="album-artist"
          value={fields.artist}
          onChange={(e) => set('artist', e.target.value)}
          required
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Рік запису" htmlFor="album-year">
          <TextInput
            id="album-year"
            type="number"
            min={1900}
            max={2100}
            value={fields.year}
            onChange={(e) => set('year', e.target.value)}
          />
        </Field>
        <Field label="Рік видання" htmlFor="album-release-year">
          <TextInput
            id="album-release-year"
            type="number"
            min={1900}
            max={2100}
            value={fields.releaseYear}
            onChange={(e) => set('releaseYear', e.target.value)}
          />
        </Field>
      </div>
      <Field label="Опис" htmlFor="album-description">
        <TextArea
          id="album-description"
          rows={3}
          value={fields.description}
          onChange={(e) => set('description', e.target.value)}
        />
      </Field>

      <TagEditor tags={fields.tags} onChange={(tags) => set('tags', tags)} />

      <label className="flex items-center gap-3 type-ui text-cream/70">
        <input
          type="checkbox"
          checked={fields.isPublic}
          onChange={(e) => set('isPublic', e.target.checked)}
          className="size-4 accent-[#ff5647]"
        />
        Публічний альбом
      </label>

      <div className="flex flex-col gap-4 border-t border-cream/[0.08] pt-5">
        <span className="type-label text-cream/45">Платівка</span>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Швидкість" htmlFor="album-rpm">
            <SelectInput
              id="album-rpm"
              value={fields.rpmSpeed}
              onChange={(e) => set('rpmSpeed', e.target.value)}
            >
              {RPM_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Стан" htmlFor="album-condition">
            <SelectInput
              id="album-condition"
              value={fields.vinylCondition}
              onChange={(e) => set('vinylCondition', e.target.value)}
            >
              {CONDITION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectInput>
          </Field>
        </div>
        <Field label="Дата оцифровки" htmlFor="album-digitized">
          <TextInput
            id="album-digitized"
            type="date"
            value={fields.digitizationDate}
            onChange={(e) => set('digitizationDate', e.target.value)}
          />
        </Field>
        <Field label="Обладнання" htmlFor="album-equipment">
          <TextArea
            id="album-equipment"
            rows={2}
            value={fields.equipmentUsed}
            onChange={(e) => set('equipmentUsed', e.target.value)}
            placeholder="Technics SL-1200, Audient iD4, Audacity…"
          />
        </Field>
      </div>

      {form.error && <p className="font-sans text-xs text-accent">{form.error}</p>}

      <div className="flex gap-2.5">
        <Pill type="submit" tone="lit" size="sm" disabled={!form.valid || form.saving}>
          {form.saving ? 'Збереження…' : 'Зберегти'}
        </Pill>
        <Pill tone="ghost" size="sm" disabled={form.saving} onClick={onDone}>
          Скасувати
        </Pill>
      </div>
    </form>
  );
};
