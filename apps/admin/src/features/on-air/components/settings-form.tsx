import {
  Field,
  Pill,
  ReadValue,
  SelectInput,
  TextInput,
} from '@/features/admin/ui';
import { useRtmpConfigForm } from '../hooks/use-rtmp-config-form';

const number = (value: string) => Number.parseInt(value, 10);

/** The RTMP server's configuration, read in place and edited in place. */
export const SettingsForm = () => {
  const form = useRtmpConfigForm();
  const { config, editing } = form;

  if (form.isLoading || !config) {
    return <p className="type-body text-cream/45">Завантаження налаштувань…</p>;
  }

  const hls = config.application.hls;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Порт" htmlFor="rtmp-port">
          {editing ? (
            <TextInput
              id="rtmp-port"
              type="number"
              min={1}
              max={65535}
              value={config.port}
              onChange={(e) => form.set('port', number(e.target.value))}
            />
          ) : (
            <ReadValue mono>{config.port}</ReadValue>
          )}
        </Field>
        <Field label="Макс. зʼєднань" htmlFor="rtmp-max">
          {editing ? (
            <TextInput
              id="rtmp-max"
              type="number"
              min={1}
              max={10000}
              value={config.maxConnections}
              onChange={(e) =>
                form.set('maxConnections', number(e.target.value))
              }
            />
          ) : (
            <ReadValue mono>{config.maxConnections}</ReadValue>
          )}
        </Field>
      </div>

      <div className="flex flex-col gap-4 border-t border-cream/[0.08] pt-5">
        <span className="type-label text-cream/45">HLS</span>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Увімкнено" htmlFor="hls-enabled">
            {editing ? (
              <SelectInput
                id="hls-enabled"
                value={hls.enabled ? 'true' : 'false'}
                onChange={(e) =>
                  form.set('application.hls.enabled', e.target.value === 'true')
                }
              >
                <option value="true">так</option>
                <option value="false">ні</option>
              </SelectInput>
            ) : (
              <ReadValue>{hls.enabled ? 'так' : 'ні'}</ReadValue>
            )}
          </Field>
          <Field label="Фрагмент, с" htmlFor="hls-fragment">
            {editing ? (
              <TextInput
                id="hls-fragment"
                type="number"
                min={1}
                max={30}
                value={hls.fragmentLength}
                onChange={(e) =>
                  form.set(
                    'application.hls.fragmentLength',
                    number(e.target.value),
                  )
                }
              />
            ) : (
              <ReadValue mono>{hls.fragmentLength}</ReadValue>
            )}
          </Field>
          <Field label="Плейлист, с" htmlFor="hls-playlist">
            {editing ? (
              <TextInput
                id="hls-playlist"
                type="number"
                min={10}
                max={300}
                value={hls.playlistLength}
                onChange={(e) =>
                  form.set(
                    'application.hls.playlistLength',
                    number(e.target.value),
                  )
                }
              />
            ) : (
              <ReadValue mono>{hls.playlistLength}</ReadValue>
            )}
          </Field>
        </div>
      </div>

      {editing && (
        <div className="flex flex-col gap-4 border-t border-cream/[0.08] pt-5">
          <span className="type-label text-cream/45">Додатково</span>
          <Field
            label="Публікувати можна з"
            htmlFor="rtmp-publish-from"
            hint="IP-адреси через кому"
          >
            <TextInput
              id="rtmp-publish-from"
              type="text"
              value={config.application.allowPublishFrom.join(', ')}
              onChange={(e) =>
                form.setList('application.allowPublishFrom', e.target.value)
              }
              placeholder="127.0.0.1, 100.74.63.70"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Розмір чанка" htmlFor="rtmp-chunk">
              <TextInput
                id="rtmp-chunk"
                type="number"
                min={128}
                max={65536}
                value={config.chunkSize}
                onChange={(e) => form.set('chunkSize', number(e.target.value))}
              />
            </Field>
            <Field label="Скидати неактивних, с" htmlFor="rtmp-idle">
              <TextInput
                id="rtmp-idle"
                type="number"
                min={5}
                max={300}
                value={config.application.dropIdlePublisher}
                onChange={(e) =>
                  form.set(
                    'application.dropIdlePublisher',
                    number(e.target.value),
                  )
                }
              />
            </Field>
          </div>
        </div>
      )}

      {form.error && (
        <p className="font-sans text-xs text-accent">
          Не вдалося зберегти налаштування. Спробуйте ще раз.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {editing ? (
          <>
            <Pill
              tone="lit"
              size="sm"
              disabled={form.saving}
              onClick={form.save}
            >
              Зберегти
            </Pill>
            <Pill
              tone="ghost"
              size="sm"
              disabled={form.saving}
              onClick={form.cancel}
            >
              Скасувати
            </Pill>
          </>
        ) : (
          <Pill tone="ghost" size="sm" onClick={form.start}>
            Редагувати
          </Pill>
        )}
        <span className="font-sans text-[11px] text-cream/45">
          Зміни діють після перезапуску RTMP-сервера.
        </span>
      </div>
    </div>
  );
};
