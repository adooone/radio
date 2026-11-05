import { Button } from '@dendelion/func-ui';
import { Input, Select } from '@dendelion/func-ui';
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
        <Input
          label="Порт"
          id="rtmp-port"
          readOnly={!editing}
          value={config.port}
          type="number"
          min={1}
          max={65535}
          onChange={(e) => form.set('port', number(e.target.value))}
        />
        <Input
          label="Макс. зʼєднань"
          id="rtmp-max"
          readOnly={!editing}
          value={config.maxConnections}
          type="number"
          min={1}
          max={10000}
          onChange={(e) => form.set('maxConnections', number(e.target.value))}
        />
      </div>

      <div className="flex flex-col gap-4 border-t border-cream/[0.08] pt-5">
        <span className="type-label text-cream/45">HLS</span>
        <div className="grid grid-cols-3 gap-4">
          <Select
            label="Увімкнено"
            id="hls-enabled"
            disabled={!editing}
            value={hls.enabled ? 'true' : 'false'}
            onChange={(value) =>
              form.set('application.hls.enabled', value === 'true')
            }
            options={[
              { value: 'true', label: 'так' },
              { value: 'false', label: 'ні' },
            ]}
          />
          <Input
            label="Фрагмент, с"
            id="hls-fragment"
            readOnly={!editing}
            value={hls.fragmentLength}
            type="number"
            min={1}
            max={30}
            onChange={(e) =>
              form.set('application.hls.fragmentLength', number(e.target.value))
            }
          />
          <Input
            label="Плейлист, с"
            id="hls-playlist"
            readOnly={!editing}
            value={hls.playlistLength}
            type="number"
            min={10}
            max={300}
            onChange={(e) =>
              form.set('application.hls.playlistLength', number(e.target.value))
            }
          />
        </div>
      </div>

      {editing && (
        <div className="flex flex-col gap-4 border-t border-cream/[0.08] pt-5">
          <span className="type-label text-cream/45">Додатково</span>
          <Input
            label="Публікувати можна з"
            helperText="IP-адреси через кому"
            id="rtmp-publish-from"
            type="text"
            value={config.application.allowPublishFrom.join(', ')}
            onChange={(e) =>
              form.setList('application.allowPublishFrom', e.target.value)
            }
            placeholder="127.0.0.1, 100.74.63.70"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Розмір чанка"
              id="rtmp-chunk"
              type="number"
              min={128}
              max={65536}
              value={config.chunkSize}
              onChange={(e) => form.set('chunkSize', number(e.target.value))}
            />
            <Input
              label="Скидати неактивних, с"
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
            <Button
              variant="lit"
              size="sm"
              disabled={form.saving}
              onClick={form.save}
            >
              Зберегти
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={form.saving}
              onClick={form.cancel}
            >
              Скасувати
            </Button>
          </>
        ) : (
          <Button variant="ghost" size="sm" onClick={form.start}>
            Редагувати
          </Button>
        )}
        <span className="font-sans text-[11px] text-cream/45">
          Зміни діють після перезапуску RTMP-сервера.
        </span>
      </div>
    </div>
  );
};
