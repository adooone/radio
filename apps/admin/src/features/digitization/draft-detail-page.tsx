import {
  useCanGoBack,
  useNavigate,
  useParams,
  useRouter,
} from '@tanstack/react-router';
import { DraftDetail } from './components';
import { StudioShell } from './studio-shell';

export const DraftDetailPage = () => {
  const { slug } = useParams({ from: '/studio/$slug' });
  const navigate = useNavigate();
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const backToList = () => {
    if (canGoBack) {
      router.history.back();
    } else {
      navigate({ to: '/studio' });
    }
  };

  return (
    <StudioShell activeSlug={slug} onBack={backToList}>
      <DraftDetail
        slug={slug}
        onDeleted={backToList}
        onPublished={backToList}
      />
    </StudioShell>
  );
};
