import {Badge, Text} from "rizzui";

export const adminOptions = [
    {
        value: 'accepted',
        label: 'accepted',
    },
    {
        value: 'rejected',
        label: 'rejected',
    },
    {
        value: 'not treated',
        label: 'not Treated',
    },
];
export const doctorOptions = [
    {
        value: 'accepted',
        label: 'accepted',
    },
    {
        value: 'rejected',
        label: 'rejected',
    },
    {
        value: 'not treated',
        label: 'not Treated',
    },
];


export function renderAdminOptionDisplayValue(value: string) {
    switch (value.toLowerCase()) {
        case 'not treated':
            return (
                <div className="flex items-center">
                    <Badge color="warning" renderAsDot/>
                    <Text className="ms-2 font-medium capitalize text-orange-dark">
                        {value}
                    </Text>
                </div>
            );
        case 'accepted':
            return (
                <div className="flex items-center">
                    <Badge color="success" renderAsDot/>
                    <Text className="ms-2 font-medium capitalize text-green-dark">
                        {value}
                    </Text>
                </div>
            );
        case 'rejected':
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

export function renderDoctorOptionDisplayValue(value: string) {
    switch (value.toLowerCase()) {
        case 'not treated':
            return (
                <div className="flex items-center">
                    <Badge color="warning" renderAsDot/>
                    <Text className="ms-2 font-medium capitalize text-orange-dark">
                        {value}
                    </Text>
                </div>
            );
        case 'accepted':
            return (
                <div className="flex items-center">
                    <Badge color="success" renderAsDot/>
                    <Text className="ms-2 font-medium capitalize text-green-dark">
                        {value}
                    </Text>
                </div>
            );
        case 'rejected':
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
