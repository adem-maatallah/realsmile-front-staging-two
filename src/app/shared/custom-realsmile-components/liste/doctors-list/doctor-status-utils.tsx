import { Badge, Text } from 'rizzui';

export function renderStatusOptionDisplayValue(value: string) {
  switch (value) {
    case 'activé':
      return (
        <div className="flex items-center">
          <Badge color="success" renderAsDot />
          <Text className="ms-2 font-medium capitalize text-green-dark">
            {value}
          </Text>
        </div>
      );
    case 'désactivé':
      return (
        <div className="flex items-center">
          <Badge color="danger" renderAsDot />
          <Text className="ms-2 font-medium capitalize text-red-dark">
            {value}
          </Text>
        </div>
      );
  }
}

export const statusOptions = [
  {
    value: 'activé',
    label: 'activé',
  },
  {
    value: 'désactivé',
    label: 'désactivé',
  },
];
