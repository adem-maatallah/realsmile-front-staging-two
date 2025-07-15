import Image from "next/image";
import {Badge, Text} from "rizzui";

export function renderRoleOptionDisplayValue(value: string) {
    switch (value) {
        case 'administrateur':
            return (
                <div className="flex items-center">
                    <Badge color="warning" renderAsDot/>
                    <Text className="ms-2 font-medium capitalize text-orange-dark">
                        {value}
                    </Text>
                </div>
            );
        case 'docteur':
            return (
                <div className="flex items-center">
                    <Badge color="success" renderAsDot/>
                    <Text className="ms-2 font-medium capitalize text-green-dark">
                        {value}
                    </Text>
                </div>
            );
        case 'patient':
            return (
                <div className="flex items-center">
                    <Badge color="danger" renderAsDot/>
                    <Text className="ms-2 font-medium capitalize text-red-dark">
                        {value}
                    </Text>
                </div>
            );
        default:
            return (
                <div className="flex items-center">
                    <Badge renderAsDot className="bg-gray-400"/>
                    <Text className="ms-2 font-medium capitalize text-gray-600">
                        {value}
                    </Text>
                </div>
            );
    }
}

export function renderStatusOptionDisplayValue(value: string) {
    switch (value) {
        case 'activé':
            return (
                <div className="flex items-center">
                    <Badge color="success" renderAsDot/>
                    <Text className="ms-2 font-medium capitalize text-green-dark">
                        {value}
                    </Text>
                </div>
            );
        case 'désactivé':
            return (
                <div className="flex items-center">
                    <Badge color="danger" renderAsDot/>
                    <Text className="ms-2 font-medium capitalize text-red-dark">
                        {value}
                    </Text>
                </div>
            );
    }
}

export function renderCountryOptionDisplayValue(value: string) {
  const getCountryLabel = (value: string) => {
    switch (value) {
      case 'TN':
        return 'Tunisie';
      case 'FR':
        return 'France';
      case 'MA':
        return 'Maroc';
      case 'BE':
        return 'Belgique';
      case 'all':
        return 'Tous les pays';
      default:
        return value;
    }
  };

  const countryLabel = getCountryLabel(value);

  return (
    <div className="flex items-center">
      {value !== 'all' && (
        <Image
          alt={`${value}`}
          src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${value}.svg`}
          className={'mr-2 inline h-4 rounded-sm'}
          width={16}
          height={16}
        />
      )}
      <Text className="ms-2 font-medium capitalize">{countryLabel}</Text>
    </div>
  );
}


// invoice status options
export const roleOptions = [
    {
        value: 'administrateur',
        label: 'administrateur',
    },
    {
        value: 'docteur',
        label: 'docteur',
    },
    {
        value: 'patient',
        label: 'patient',
    },
];


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