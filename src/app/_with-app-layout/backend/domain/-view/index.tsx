import Layout from './-presentation/Layout';
import Header from './Header';
import MainBottomActions from './MainBottomActions';
import MainDomainsList from './MainDomainsList';
import MainFilter from './MainFilter';

export default function DomainDNSView() {
  return (
    <>
      <Header />

      <Layout>
        <Layout.Main>
          <MainFilter />
          <MainDomainsList />
          <MainBottomActions />
        </Layout.Main>
      </Layout>
    </>
  );
}
