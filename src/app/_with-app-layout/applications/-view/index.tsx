import GithubSessionBanner from './GithubSessionBanner';
import Header from './Header';
import MainAppList from './MainAppList';
import MainBottomActions from './MainBottomActions';
import MainFilter from './MainFilter';

export default function ApplicationsView() {
  return (
    <>
      <Header />

      <div className="flex flex-col gap-4">
        <GithubSessionBanner />
        <MainFilter />
        <MainAppList />
        <MainBottomActions />
      </div>
    </>
  );
}
