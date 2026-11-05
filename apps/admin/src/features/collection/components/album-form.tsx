import { Button } from '@dendelion/func-ui';
import { Input, Select, Textarea } from '@dendelion/func-ui';
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

      <Input
        label="Назва"
        id="album-title"
        value={fields.title}
        onChange={(e) => set('title', e.target.value)}
        required
      />
      <Input
        label="Виконавець"
        id="album-artist"
        value={fields.artist}
        onChange={(e) => set('artist', e.target.value)}
        required
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Рік запису"
          id="album-year"
          type="number"
          min={1900}
          max={2100}
          value={fields.year}
          onChange={(e) => set('year', e.target.value)}
        />
        <Input
          label="Рік видання"
          id="album-release-year"
          type="number"
          min={1900}
          max={2100}
          value={fields.releaseYear}
          onChange={(e) => set('releaseYear', e.target.value)}
        />
      </div>
      <Textarea
        label="Опис"
        id="album-description"
        rows={3}
        value={fields.description}
        onChange={(e) => set('description', e.target.value)}
      />

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
          <Select
            label="Швидкість"
            id="album-rpm"
            value={fields.rpmSpeed}
            onChange={(value) => set('rpmSpeed', value)}
            options={RPM_OPTIONS}
          />
          <Select
            label="Стан"
            id="album-condition"
            value={fields.vinylCondition}
            onChange={(value) => set('vinylCondition', value)}
            options={CONDITION_OPTIONS}
          />
        </div>
        <Input
          label="Дата оцифровки"
          id="album-digitized"
          type="date"
          value={fields.digitizationDate}
          onChange={(e) => set('digitizationDate', e.target.value)}
        />
        <Textarea
          label="Обладнання"
          id="album-equipment"
          rows={2}
          value={fields.equipmentUsed}
          onChange={(e) => set('equipmentUsed', e.target.value)}
          placeholder="Technics SL-1200, Audient iD4, Audacity…"
        />
      </div>

      {form.error && (
        <p className="font-sans text-xs text-accent">{form.error}</p>
      )}

      <div className="flex gap-2.5">
        <Button
          type="submit"
          variant="lit"
          size="sm"
          disabled={!form.valid || form.saving}
        >
          {form.saving ? 'Збереження…' : 'Зберегти'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={form.saving}
          onClick={onDone}
        >
          Скасувати
        </Button>
      </div>
    </form>
  );
};
