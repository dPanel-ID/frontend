import FilterBar from './FilterBar';
import Header from './Header';
import MainBottomActions from './MainBottomActions';
import Overview from './Overview';
import ServerList from './ServerList';

export default function ServersView() {
  return (
    <div className="flex flex-col gap-4">
      <Header />
      <Overview />
      <FilterBar />
      <ServerList />
      <MainBottomActions />
    </div>
  );
}
