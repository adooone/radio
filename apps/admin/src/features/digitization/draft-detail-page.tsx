import { PageLayout } from '@/components';
import { LampButton } from '@dendelion/func-ui';
import { useNavigate, useParams } from '@tanstack/react-router';
import { DraftDetail } from './components';

export const DraftDetailPage = () => {
  const { slug } = useParams({ from: '/digitization/$slug' });
  const navigate = useNavigate();
  const backToList = () => navigate({ to: '/digitization' });

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
