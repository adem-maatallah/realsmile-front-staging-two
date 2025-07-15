import { Text, Badge, Checkbox } from 'rizzui';
import { HeaderCell } from '@/components/ui/table';
import DateCell from '@/components/ui/date-cell';
import { MdEmail } from 'react-icons/md';
import AvatarCard from '@/components/ui/avatar-card';

type TransactionType = {
  id: string;
  amount: string;
  payment_method: string;
  payment_date: string;
  doctor: {
    fullName: string;
    profile_pic: string;
  };
  patient_name: string;
  isntDoctor: boolean;
  payment_transaction_code?: string;
  payment_proof_url?: string;
};

type Columns = {
  data: any[];
  sortConfig?: any;
  checkedItems: string[];
  onHeaderCellClick: (value: string) => void;
  handleSelectAll: any;
  onChecked?: (id: string) => void;
  isntDoctor: boolean;
};

export const getTransactionColumns = ({
  data,
  sortConfig,
  checkedItems,
  onHeaderCellClick,
  handleSelectAll,
  onChecked,
  isntDoctor,
}: Columns) => {
  const safeValue = (value: any, fallback: string = 'N/A') => value ?? fallback; // Helper function for safe access

  return [
    {
      title: <HeaderCell title="Transaction ID" />,
      dataIndex: 'id',
      key: 'id',
      width: 150,
      render: (_: string, row: TransactionType) => (
        <Text className="ml-4 flex items-center font-medium text-gray-700 dark:text-gray-600">
          {'#TRX-' + safeValue(row.id, '0000')}
        </Text>
      ),
    },
    {
      title: <HeaderCell title="Facture ID" />,
      dataIndex: 'invoiceId',
      key: 'invoiceId',
      width: 150,
      render: (value: string) => (
        <Text className="ml-4 font-medium text-gray-700 dark:text-gray-600">
          {'#INV-' + safeValue(value)}
        </Text>
      ),
    },
    {
      title: <HeaderCell title="Patient" />,
      dataIndex: 'patient_name',
      key: 'patient_name',
      width: 200,
      render: (value: string) => (
        <Text className="ml-4 font-medium text-gray-700 dark:text-gray-600">
          {safeValue(value, 'Unknown Patient')}
        </Text>
      ),
    },
    {
      title: <HeaderCell title="Méthode de paiement" />,
      dataIndex: 'payment_method',
      key: 'payment_method',
      width: 150,
      render: (value: string) => (
        <Text className="ml-4 font-medium text-gray-700 dark:text-gray-600">
          {safeValue(value, 'Not Specified')}
        </Text>
      ),
    },
    {
      title: (
        <HeaderCell
          title="Date de la transaction"
          sortable
          ascending={
            sortConfig?.direction === 'asc' &&
            sortConfig?.key === 'payment_date'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('payment_date'),
      dataIndex: 'payment_date',
      key: 'payment_date',
      width: 200,
      render: (value: string) =>
        value ? <DateCell date={new Date(value)} /> : 'Invalid Date',
    },
    {
      title: <HeaderCell title="Montant" />,
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      render: (value: string) => (
        <Text className="ml-4 font-medium text-gray-700 dark:text-gray-600">
          {safeValue(value, '0.00')}
        </Text>
      ),
    },
    isntDoctor && {
      title: <HeaderCell title="Informations du médecin" />,
      dataIndex: 'doctor',
      key: 'doctor',
      width: 250,
      render: (_: any, row: TransactionType) => {
        const doctor = row?.doctor || {};
        return (
          <AvatarCard
            src={safeValue(doctor.profile_pic, '')} // Fallback to an empty string for the image
            name={safeValue(doctor.fullName, 'Doctor Name')}
            description={
              doctor.email ? (
                <>
                  <MdEmail className="mr-0 inline" />
                  {doctor.email}
                </>
              ) : (
                'Email not available'
              )
            }
          />
        );
      },
    },
    {
      title: <HeaderCell title="Code de transaction" />,
      dataIndex: 'payment_transaction_code',
      key: 'payment_transaction_code',
      width: 150,
      render: (value: string) =>
        value ? (
          <Text className="ml-4 font-medium text-gray-700 dark:text-gray-600">
            {value}
          </Text>
        ) : null,
    },
    {
      title: <HeaderCell title="Preuve de paiement" />,
      dataIndex: 'payment_proof_url',
      key: 'payment_proof_url',
      width: 150,
      render: (value: string) =>
        value ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-4 font-medium text-blue-600 dark:text-blue-400"
          >
            Voir Preuve
          </a>
        ) : null,
    },
  ].filter(Boolean); // Remove falsy entries like the empty column object if `isntDoctor` is false
};
