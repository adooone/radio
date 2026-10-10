import { PageLayout } from '@/components';
import { LampButton } from '@dendelion/func-ui';
import {
  useCanGoBack,
  useNavigate,
  useParams,
  useRouter,
} from '@tanstack/react-router';
import { DraftDetail } from './components';

export const DraftDetailPage = () => {
  const { slug } = useParams({ from: '/digitization/$slug' });
  const navigate = useNavigate();
  const router = useRouter();
  const canGoBack = useCanGoBack();
  // Going back (not pushing) restores the list's scroll position and keeps
  // the history stack flat; deep links with no history still get a route.
  const backToList = () => {
    if (canGoBack) {
      router.history.back();
    } else {
      navigate({ to: '/digitization' });
    }
  };

  return (
    <PageLayout
      title="Драфт"
      headerRight={
        <LampButton tone="gray" size="md" onClick={backToList}>
          ← До списку
        </LampButton>
      }
    >
      <div className="pb-16">
        <DraftDetail
          slug={slug}
          onDeleted={backToList}
          onPublished={backToList}
        />
      </div>
    </PageLayout>
  );
};
