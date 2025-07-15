import { Badge, Text } from 'rizzui';

export function renderOptionDisplayValue(value: string) {
  switch (value) {
    case 'payé':
      return (
        <div className="flex items-center">
          <Badge color="success" renderAsDot />
          <Text className="ms-2 font-medium capitalize text-green-dark">
            {value}
          </Text>
        </div>
      );
    case 'non payé':
      return (
        <div className="flex items-center">
          <Badge color="danger" renderAsDot />
          <Text className="ms-2 font-medium capitalize text-red-dark">
            {value}
          </Text>
        </div>
      );
    case 'partiellement payé':
      return (
        <div className="flex items-center">
          <Badge color="warning" renderAsDot />
          <Text className="text-yellow-ark ms-2 font-medium capitalize">
            {value}
          </Text>
        </div>
      );
    default:
      return (
        <div className="flex items-center">
          <Badge renderAsDot className="bg-gray-400" />
          <Text className="ms-2 font-medium capitalize text-gray-600">
            {value}
          </Text>
        </div>
      );
  }
}

export const statusOptions = [
  { value: 'payé', label: 'Payé' },
  { value: 'non payé', label: 'Non Payé' },
  { value: 'partiellement payé', label: 'Partiellement Payé' },
];
