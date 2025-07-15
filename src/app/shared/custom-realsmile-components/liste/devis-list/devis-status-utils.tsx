import { Badge, Text } from 'rizzui';

export function renderOptionDisplayValue(value: string) {
  switch (value) {
    case 'draft':
      return (
        <div className="flex items-center">
          <Badge color="secondary" renderAsDot />
          <Text className="ms-2 font-medium text-secondary">{value}</Text>
        </div>
      );
    case 'accepté':
      return (
        <div className="flex items-center">
          <Badge color="success" renderAsDot />
          <Text className="ms-2 font-medium capitalize text-green-dark">
            {value}
          </Text>
        </div>
      );
    case 'réfusé':
      return (
        <div className="flex items-center">
          <Badge color="danger" renderAsDot />
          <Text className="ms-2 font-medium capitalize text-red-dark">
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
  { value: 'draft', label: 'draft' },
  { value: 'accepté', label: 'accepté' },
  { value: 'réfusé', label: 'réfusé' },
];
