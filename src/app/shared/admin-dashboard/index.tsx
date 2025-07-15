import { Link } from 'react-scroll';
import BestClientsTable from './best-clients-table';
import InternalStatisticsChart from './internal-statistics-chart';
import SimpleBar from '@/components/ui/simplebar';
import { cn } from 'rizzui';
import CasesSummaryChart from '../financial/dashboard/case-summary-chart';
import PacksPieChart from '../financial/dashboard/packs-pie-chart';
import SmilesetChart from '../financial/dashboard/smileset-chart';
import TotalAmountDueRow from '../financial/dashboard/total-amount-due';
import InvoiceStatisticsChart from './invoices-statistics-chart';
import NumbersOverview from './numbers-overview';
import PractitionersPatientsChart from './practicioners-patients-statistics';

const menuItems = [
  { label: 'Chiffres de la semaine', value: 'numbers-overview' },
  { label: 'Statistiques des factures', value: 'invoice-statistics' },
  { label: "Chiffre d'affaires", value: 'total-amount-due' },
  { label: 'Praticiens et patients', value: 'practitioners-patients' },
  { label: 'Résumé des cas', value: 'case-summary' },
  { label: 'Nombre de liens SmileSet', value: 'smileset-chart' },
  { label: 'Répartition des packs', value: 'packs-pie-chart' },
  { label: 'Statistiques internes', value: 'internal-statistics' },
  { label: 'Meilleurs clients', value: 'best-clients' },
];

export default function AdminDashboard() {
  return (
    <div>
      <div
        className={cn(
          'sticky top-[68px] z-20 border-b border-gray-300 bg-white py-0 font-medium text-gray-500 @2xl:top-[72px] dark:bg-gray-50 2xl:top-20'
        )}
      >
        <SimpleBar>
          <div className="inline-grid grid-flow-col gap-5 md:gap-7 lg:gap-10">
            {menuItems.map((tab, idx) => (
              <Link
                key={tab.value}
                to={tab.value}
                spy={true}
                hashSpy={true}
                smooth={true}
                offset={idx === 0 ? -250 : -150}
                duration={500}
                className="relative cursor-pointer whitespace-nowrap py-4 hover:text-gray-1000"
                activeClass="active before:absolute before:bottom-0 before:left-0 before:z-[1] before:h-0.5 before:w-full before:bg-gray-1000 font-semibold text-gray-1000"
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </SimpleBar>
      </div>

      <div className="mt-8 grid gap-6 @container">
        <section id="numbers-overview">
          {' '}
          {/* New section */}
          <NumbersOverview />
        </section>
        <section id="invoice-statistics" className="col-span-full">
          <InvoiceStatisticsChart />
        </section>
        <section id="total-amount-due">
          <TotalAmountDueRow />
        </section>
        <section id="practitioners-patients" className="col-span-full">
          <PractitionersPatientsChart />
        </section>
        <section id="case-summary" className="col-span-full">
          <CasesSummaryChart />
        </section>
        <div className="col-span-1" id="smileset-chart">
          <SmilesetChart />
        </div>
        <div className="col-span-1" id="packs-pie-chart">
          <PacksPieChart />
        </div>
        <section id="internal-statistics">
          <InternalStatisticsChart />
        </section>
        <section id="best-clients">
          <BestClientsTable />
        </section>
      </div>
    </div>
  );
}
