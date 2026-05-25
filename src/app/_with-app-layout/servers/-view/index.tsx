import FilterBar from './FilterBar';
import Header from './Header';
import MainBottomActions from './MainBottomActions';
import ServerList from './ServerList';

export default function ServersView() {
  return (
    <>
      <Header />

      <div className="flex flex-col gap-4">
        <FilterBar />
        <ServerList />
        <MainBottomActions />
      </div>
    </>
  );
}
