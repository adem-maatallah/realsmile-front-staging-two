import Link from 'next/link';
import { PiPlusBold } from 'react-icons/pi';
import { routes } from '@/config/routes';
import { Button } from 'rizzui';
import { shipmentData } from '@/data/shipment-data';
import PageHeader from '@/app/shared/page-header';
import ExportButton from '@/app/shared/export-button';

const pageHeader = {
  title: 'Tous les patients',
  breadcrumb: [
    {
      href: routes.eCommerce.dashboard,
      name: 'Accueil',
    },
    {
      name: 'Liste des patients',
    },
  ],
};

interface HeaderProps {
  className?: string;
}

export default function ShipmentPageHeader({ className }: HeaderProps) {
  return (
    <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
      <div className="mt-4 flex flex-col items-center gap-3 @sm:flex-row @lg:mt-0">
        <ExportButton
          data={shipmentData}
          fileName="shipment_data"
          header="ID,Tracking ID,Date,Sender,Receiver,Origin,Destination,Payment Method,Status"
        />
        <Link href={routes.multiStep} className="w-full @lg:w-auto">
          <Button as="span" className="w-full @lg:w-auto">
            <PiPlusBold className="me-1.5 h-[17px] w-[17px]" />
            Ajouter un patient
          </Button>
        </Link>
      </div>
    </PageHeader>
  );
}
