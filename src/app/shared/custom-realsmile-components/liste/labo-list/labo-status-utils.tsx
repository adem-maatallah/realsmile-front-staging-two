import { Badge, Text } from 'rizzui';

export function renderOptionDisplayValue(value: string) {
  switch (value) {
    case 'Done':
      return (
        <div className="flex items-center">
          <Badge color="success" renderAsDot />
          <Text className="ms-2 font-medium text-green-dark">{value}</Text>
        </div>
      );
    case 'Missing link':
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


export function renderIsLateOptionDisplayValue(value: string) {
    switch (value) {
      case 'Late':
        return (
          <div className="flex items-center">
            <Badge color="success" renderAsDot />
            <Text className="ms-2 font-medium text-green-dark">{value}</Text>
          </div>
        );
      case 'In Time':
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
  { value: 'Done', label: 'Done' },
  { value: 'Missing link', label: 'Missing link' },
];

export const inLatestatusOptions = [
    { value: 'false', label: 'In Time' },
    { value: 'true', label: 'Late' },
  ];