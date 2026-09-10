import './globals.scss';

// Basic Components
export { Button } from './components/button';
export { IconButton } from './components/icon-button';
export { Card } from './components/card';
export { CircularProgress } from './components/circular-progress';
export type { CircularProgressProps } from './components/circular-progress';
export { Skeleton, SkeletonText } from './components/skeleton';
export type { SkeletonProps, SkeletonTextProps } from './components/skeleton';

// Form Components
export { Input } from './components/input';
export type { InputProps } from './components/input';
export { Select } from './components/select';
export type { SelectProps, SelectOption } from './components/select';
export { Textarea } from './components/textarea';
export type { TextareaProps } from './components/textarea';
export { Checkbox } from './components/checkbox';
export type { CheckboxProps } from './components/checkbox';
export { Switch } from './components/switch';
export { Radio } from './components/radio';
export type { RadioProps, RadioOption } from './components/radio';
export { Slider } from './components/slider';
export type { SliderProps } from './components/slider';

// Layout Components
export { Panel } from './components/panel';
export type { PanelSection } from './components/panel';
export { PageLayout, StatsGrid } from './components/layout';
export type { StatItem, StatsGridProps } from './components/layout';

// Overlay Components
export { Modal } from './components/modal';
export type { ModalProps } from './components/modal';
export { Popup, PopupItem } from './components/popup';
export { Tooltip } from './components/tooltip';
export type { TooltipProps, TooltipPlacement } from './components/tooltip';

// Navigation Components
export { Tabs } from './components/tabs';
export type { TabItem, TabsProps } from './components/tabs';
export { VinylTabs } from './components/vinyl-tabs';
export type { VinylTabItem, VinylTabsProps } from './components/vinyl-tabs';
export { NavigationIsland } from './components/navigation-island';
export type {
  NavigationIslandProps,
  NavigationItem,
} from './components/navigation-island';

// Feedback Components
export { ProgressBar } from './components/progress-bar';
export { StatsCard } from './components/stats-card';
export { StatusIndicator } from './components/status-indicator';
export { Badge } from './components/badge';
export type { BadgeProps, BadgeVariant, BadgeSize } from './components/badge';
export { Alert } from './components/alert';
export type { AlertProps, AlertVariant } from './components/alert';
export { Toast, ToastContainer, generateToastId } from './components/toast';
export type {
  ToastProps,
  ToastContainerProps,
  ToastVariant,
  ToastPosition,
} from './components/toast';

// Icons
export * from './icons';

// Shared Styles
export {
  container,
  content,
  title,
  statsCard,
  statsTitle,
  statsValue,
  statsValueOnline,
  serviceSection,
  serviceSectionTitle,
  actionsSection,
  actionsTitle,
  recentSection,
  recentItem,
  recentTitle,
  recentMeta,
  statsGrid,
  serviceGrid,
  actionsGrid,
  recentList,
  glassmorphism,
  layout,
  grids,
  sharedStyles,
} from './styles';

// Data Display Components
export { DataTable } from './components/data-table';
export type { DataTableProps, DataTableColumn } from './components/data-table';

// Showcase (for documentation)
export { default as Showcase } from './showcase';
