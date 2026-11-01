import Header from './Header';
import MainBottomActions from './MainBottomActions';
import MainFilter from './MainFilter';
import MainLbList from './MainLbList';
import Overview from './Overview';

/** The list is the page: hero, counts, filters, then every load balancer. */
export default function LoadBalancersView() {
  return (
    <div className="flex flex-col gap-4">
      <Header />
      <Overview />
      <MainFilter />
      <MainLbList />
      <MainBottomActions />
    </div>
  );
}
