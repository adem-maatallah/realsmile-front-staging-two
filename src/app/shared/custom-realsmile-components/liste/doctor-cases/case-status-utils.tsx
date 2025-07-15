import {Badge, Text} from 'rizzui';

export function renderOptionDisplayValue(value: string) {
    switch (value) {
        case 'Soumission Incompléte':
            return (
                <div className="flex items-center">
                    <Badge color="secondary" renderAsDot/>
                    <Text className="ms-2 font-medium text-secondary">{value}</Text>
                </div>
            );
        case 'SmileSet En Cours':
            return (
                <div className="flex items-center">
                    <Badge color="warning" renderAsDot/>
                    <Text className="ms-2 font-medium capitalize text-orange-dark">
                        {value}
                    </Text>
                </div>
            );
        case 'En Fabrication':
            return (
                <div className="flex items-center">
                    <Badge color="success" renderAsDot/>
                    <Text className="ms-2 font-medium capitalize text-green-dark">
                        {value}
                    </Text>
                </div>
            );
        case 'En Traitement':
            return (
                <div className="flex items-center">
                    <Badge color="danger" renderAsDot/>
                    <Text className="ms-2 font-medium capitalize text-red-dark">
                        {value}
                    </Text>
                </div>
            );
        case 'Approbation Requise':
            return (
                <div className="flex items-center">
                    <Badge color="info" renderAsDot/>
                    <Text className="ms-2 font-medium capitalize text-blue-dark">
                        {value}
                    </Text>
                </div>
            );

        case 'Expédié':
            return (
                <div className="flex items-center">
                    <Badge color="warning" renderAsDot/>
                    <Text className="ms-2 font-medium capitalize text-yellow-400">
                        {value}
                    </Text>
                </div>
            );
        case 'Cas Terminé':
            return (
                <div className="flex items-center">
                    <Badge color="success" renderAsDot/>
                    <Text className="ms-2 font-medium capitalize text-green-950">
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

export const statusOptions = [
    {value: 'Soumission Incompléte', label: 'Soumission Incompléte'},
    {value: 'SmileSet En Cours', label: 'SmileSet En Cours'},
    {value: 'En Fabrication', label: 'En Fabrication'},
    {value: 'En Traitement', label: 'En Traitement'},
    {value: 'Approbation Requise', label: 'Approbation Requise'},
    {value: 'Expédié', label: 'Expédié'},
    {value: 'Cas Terminé', label: 'Cas Terminé'},
];
