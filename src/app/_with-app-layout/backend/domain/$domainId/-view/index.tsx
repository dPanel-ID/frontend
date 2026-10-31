import Header from './Header';
import Overview from './Overview';
import RecordsPanel from './RecordsPanel';

/** A domain's own page: who answers for it, and every record in its zone. */
export default function DomainDetailView() {
  return (
    <div className="flex flex-col gap-4">
      <Header />
      <Overview />
      <RecordsPanel />
    </div>
  );
}
