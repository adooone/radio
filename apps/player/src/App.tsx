import { Layout } from '@/components/layout';
import { Outlet } from '@tanstack/react-router';
import useDebugRender from 'tilg';

import '@fontsource/tiny5';
import '@fontsource/ponomar';

const App = () => {
  useDebugRender();

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default App;
