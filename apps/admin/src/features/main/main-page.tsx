import { useCollectionData } from '@/features/collection/hooks';
import { useStats } from '@/services/api/hooks/use-stats';
import { ParticlesBackground } from './components/particles-background';
import { RecordWidgets } from './components/record-widgets';
import { useWidgetConfigStore } from './store/widget-config-store';

export const MainPage = () => {
  const { data: stats, isLoading } = useStats();
  const { albumStats } = useCollectionData();
  const isEditMode = useWidgetConfigStore((state) => state.isEditMode);
  const toggleEditMode = useWidgetConfigStore((state) => state.toggleEditMode);

  return (
    <div className={styles.container.join(' ')}>
      <ParticlesBackground />

      <div className={styles.contentArea.join(' ')}>
        {/* Central Welcome Card */}
        <div className={styles.welcomeCardWrapper.join(' ')}>
          <div className={styles.content.join(' ')}>
            <h1 className={styles.title.join(' ')}>Радіо Пан</h1>
            <p className={styles.subtitle.join(' ')}>
              Привіт! Це адмін панель для Вінілового Радіо. Тут можна редагувати
              музику, відео, новини та багато іншого. Щоб редагувати,
              авторизуйся.
            </p>
          </div>

          {/* Exit edit mode button – floats below the welcome card */}
          {isEditMode && (
            <button
              type="button"
              onClick={toggleEditMode}
              className={styles.doneButton.join(' ')}
            >
              ✓ Done editing
            </button>
          )}
        </div>

        <RecordWidgets
          stats={stats}
          overallCompleteness={albumStats.overallCompleteness}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

const styles = {
  container: [
    'w-full h-full text-paper-fog',
    'py-12 px-4 relative',
    'flex items-center justify-center',
  ],
  contentArea: [
    'relative w-full max-w-7xl mx-auto',
    'h-full min-h-[600px] py-8',
    'flex flex-col items-center justify-center',
  ],
  welcomeCardWrapper: [
    'relative z-30',
    'flex flex-col justify-center items-center gap-4',
  ],
  content: [
    'text-center bg-coal-deep/30 backdrop-blur-md border border-white/20',
    'rounded-3xl lg:rounded-full p-6 sm:p-8 lg:p-12',
    'shadow-2xl transition-all duration-500',
    'relative z-30',
    'w-[90vw] max-w-xl lg:w-[min(600px,90vw)]',
    'h-auto lg:min-h-[400px] lg:h-[min(500px,70vh)]',
    'flex flex-col justify-center items-center',
    'pointer-events-none',
  ],
  title: ['mb-8 font-serif text-6xl font-bold text-sun'],
  subtitle: ['mb-8 font-serif text-xl text-paper-calm max-w-xl'],
  doneButton: [
    'relative z-40',
    'px-5 py-2 rounded-full text-sm font-semibold',
    'bg-sun/20 hover:bg-sun/30 border border-sun/40 hover:border-sun/70',
    'text-sun transition-all duration-200',
    'backdrop-blur-md shadow-lg',
    'cursor-pointer',
  ],
} as const;
