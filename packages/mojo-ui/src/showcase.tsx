import { useState } from 'react';
import type { FC } from 'react';
import { type Page, ShowcaseNav } from './showcase/components/nav';
import { ComponentsPage } from './showcase/pages/components';
import { DocsPage } from './showcase/pages/docs';
import { LayoutPage } from './showcase/pages/layout';
import { TokensPage } from './showcase/pages/tokens';
import { WelcomePage } from './showcase/pages/welcome';

const Showcase: FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('welcome');

  const renderPage = () => {
    switch (currentPage) {
      case 'welcome':
        return <WelcomePage onNavigate={setCurrentPage} />;
      case 'gallery':
        return <ComponentsPage />;
      case 'layout':
        return <LayoutPage />;
      case 'tokens':
        return <TokensPage />;
      case 'docs':
        return <DocsPage />;
      default:
        return <WelcomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-coal-relic">
      <ShowcaseNav currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="min-h-[calc(100vh-64px)]">{renderPage()}</main>
    </div>
  );
};

export default Showcase;
