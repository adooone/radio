import { Input, Panel, Popup, PopupItem } from '@dendelion/mojo-ui';
import type React from 'react';
import { useWidgetConfigStore } from '../store/widget-config-store';
import { WIDGET_COLOR_OPTIONS } from '../utils/widget-colors';

type WidgetEditSidebarProps = {
  isOpen: boolean;
};

export const WidgetEditSidebar = ({ isOpen }: WidgetEditSidebarProps) => {
  const selectedWidgetId = useWidgetConfigStore(
    (state) => state.selectedWidgetId,
  );
  const widgets = useWidgetConfigStore((state) => state.widgets);
  const updateWidget = useWidgetConfigStore((state) => state.updateWidget);
  const toggleEditMode = useWidgetConfigStore((state) => state.toggleEditMode);

  if (!isOpen) {
    return null;
  }

  // If no widget is selected but we're in edit mode, show empty state or first widget
  const widget = selectedWidgetId
    ? widgets.find((w) => w.id === selectedWidgetId)
    : widgets[0];

  if (!widget) return null;

  const handleChange =
    <K extends keyof typeof widget>(key: K) =>
    (value: (typeof widget)[K]) => {
      updateWidget(widget.id, { [key]: value } as Partial<typeof widget>);
    };

  const handleTitleChange: React.ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    handleChange('title')(event.target.value);
  };

  const handleRadiusChange: React.ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    const radius = Number.parseInt(event.target.value || '0', 10);
    handleChange('radius')(Number.isNaN(radius) ? undefined : radius);
  };

  const handleRotationChange: React.ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    const rotation = Number.parseInt(event.target.value || '0', 10);
    updateWidget(widget.id, {
      position: {
        ...widget.position,
        rotation: Number.isNaN(rotation) ? widget.position.rotation : rotation,
      },
    });
  };

  const handleTitleRotationChange: React.ChangeEventHandler<
    HTMLInputElement
  > = (event) => {
    const value = Number.parseInt(event.target.value || '0', 10);
    handleChange('titleRotation')(Number.isNaN(value) ? 0 : value);
  };

  const handleColorChange = (color: string) => {
    handleChange('color')(color || undefined);
  };

  const selectedColorOption = WIDGET_COLOR_OPTIONS.find(
    (opt) => opt.value === widget.color,
  ) || { name: 'Default (Sun)', value: '' };

  return (
    <div className="fixed right-8 top-16 z-40 w-80 flex-shrink-0 flex flex-col gap-4 max-h-[640px]">
      <Panel
        content={
          <div className="flex flex-col gap-4 lg:h-full">
            <div className="flex flex-col gap-4">
              <Input
                label="Title"
                type="text"
                value={widget.title}
                onChange={handleTitleChange}
                size="small"
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Radius (px)"
                  type="number"
                  min={40}
                  max={160}
                  value={widget.radius ?? 112}
                  onChange={handleRadiusChange}
                  size="small"
                />

                <Input
                  label="Widget rotation (deg)"
                  type="number"
                  min={-180}
                  max={180}
                  value={widget.position.rotation}
                  onChange={handleRotationChange}
                  size="small"
                />
              </div>

              <Input
                label="Title rotation (deg)"
                type="number"
                min={0}
                max={360}
                value={widget.titleRotation ?? 0}
                onChange={handleTitleRotationChange}
                size="small"
              />

              <div>
                <span className="mb-1 block text-xs uppercase tracking-wide text-paper-calm">
                  Color
                </span>
                <Popup
                  label={selectedColorOption.name}
                  size="small"
                  variant="dark"
                  rounded="half"
                  align="left"
                >
                  <PopupItem
                    selected={!widget.color}
                    onClick={() => handleColorChange('')}
                  >
                    Default (Sun)
                  </PopupItem>
                  {WIDGET_COLOR_OPTIONS.map((option) => (
                    <PopupItem
                      key={option.name}
                      selected={widget.color === option.value}
                      onClick={() => handleColorChange(option.value)}
                    >
                      {option.name}
                    </PopupItem>
                  ))}
                </Popup>
              </div>
            </div>
          </div>
        }
        className="flex-1 flex flex-col lg:h-full"
        minHeight="h-full"
        decorated={false}
        title="Edit Widget"
        onClose={toggleEditMode}
      />
    </div>
  );
};
