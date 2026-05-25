import Guard from './_Guard';
import { ServerDetailLayout as Layout } from './_presentation/Layout';
import Header from './Header';
import MainMgmtTools from './MainMgmtTools';
import MainOverview from './MainOverview';

export default function ServerDetailView() {
  return (
    <Guard>
      <Header />

      <Layout className="xl:grid-cols-1">
        <Layout.Main>
          <MainOverview />

          <MainMgmtTools />
        </Layout.Main>
      </Layout>
    </Guard>
  );
}
