import { Button, PageLayout } from '@dendelion/mojo-ui';
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
        <Button
          variant="gray"
          size="medium"
          title="← До списку"
          onClick={backToList}
        />
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
