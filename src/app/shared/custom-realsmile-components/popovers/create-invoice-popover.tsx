import React, { useState, useEffect } from 'react';
import { Title, Text, ActionIcon, Button, Popover, Input } from 'rizzui';
import { BiDollar, BiDollarCircle } from 'react-icons/bi';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/utils/axiosInstance';

type CreateInvoicePopoverProps = {
  title: string;
  description?: string;
  caseId: string;
  setCasesData?: any;
};

export default function CreateInvoicePopover({
  title,
  description,
  caseId,
  setCasesData,
}: CreateInvoicePopoverProps) {
  const [packs, setPacks] = useState([]);
  const [selectedPack, setSelectedPack] = useState('');
  const [packPrice, setPackPrice] = useState(0);
  const [amount, setAmount] = useState('');
  const [reduction, setReduction] = useState('');
  const [total, setTotal] = useState('');
  const {user} = useAuth()
  const router = useRouter();

  useEffect(() => {
    if (!user) return; // Ensure session is available

    const fetchPacks = async () => {
      try {
        const response = await axiosInstance.get(
          `/packs/allpacks?caseId=${caseId}`
        );
        if (!response) {
          throw new Error(`Failed to fetch packs: ${response.statusText}`);
        }
        const responseData = await response.data;
        if (!responseData || !responseData.data) {
          throw new Error(
            `Invalid response format: ${JSON.stringify(responseData)}`
          );
        }
        setPacks(responseData.data);
      } catch (error) {
        console.error('Error fetching packs:', error);
      }
    };

    fetchPacks();
  }, [user]);

  useEffect(() => {
    const calcTotal = () => {
      const amt = parseFloat(amount);
      if (!isNaN(amt)) {
        setTotal(amt.toFixed(2));
      } else {
        setTotal('0.00');
      }
    };

    calcTotal();
  }, [amount]);

  useEffect(() => {
    const calcReduction = () => {
      const amt = parseFloat(amount);
      if (!isNaN(amt) && packPrice > 0) {
        const reductionPercentage = ((packPrice - amt) / packPrice) * 100;
        setReduction(reductionPercentage.toFixed(2));
      } else {
        setReduction('0.00');
      }
    };

    calcReduction();
  }, [amount, packPrice]);

  const handlePackChange = (e) => {
    const selectedPackId = e.target.value;
    setSelectedPack(selectedPackId);
    const selectedPackData = packs.find((pack) => pack.id === selectedPackId);
    if (selectedPackData) {
      setPackPrice(selectedPackData.price);
      setAmount(''); // Reset the amount when a new pack is selected
    }
  };

  const handleAmountChange = (e) => {
    const value = parseFloat(e.target.value);
    if (value <= packPrice) {
      setAmount(e.target.value);
    } else {
      setAmount(packPrice.toString());
    }
  };

  const handleCreateInvoice = async () => {
    try {
      const response = await axiosInstance.post(
        `/cases/create-old-invoices`,
        JSON.stringify({
            case_id: caseId,
            pack_id: selectedPack,
            amount: parseFloat(amount),
            reduction: parseFloat(reduction),
          }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const newInvoice = await response.data
      // Optionally update the case data if needed
      if (setCasesData) {
        setCasesData((prevCases) =>
          prevCases.map((caseItem) =>
            caseItem.id === caseId
              ? { ...caseItem, hasInvoice: true }
              : caseItem
          )
        );
      }
      // Refresh the page after invoice creation
      router.push(`/invoices`);
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

  return (
    <Popover placement="left">
      <Popover.Trigger>
        <ActionIcon
          size="sm"
          variant="outline"
          aria-label={'Create Invoice'}
          className="cursor-pointer hover:!border-gray-900 hover:text-gray-700"
        >
          <BiDollar className="h-4 w-4" />
        </ActionIcon>
      </Popover.Trigger>
      <Popover.Content className="z-0">
        {({ setOpen }) => (
          <div className="w-56 pb-2 pt-1 text-left rtl:text-right">
            <Title
              as="h6"
              className="mb-0.5 flex items-start text-sm text-gray-700 sm:items-center"
            >
              <BiDollarCircle className="me-1 h-[17px] w-[17px]" /> {title}
            </Title>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center">
                <select
                  className="flex-grow rounded border p-2"
                  value={selectedPack}
                  onChange={handlePackChange}
                >
                  <option value="" disabled>
                    {' '}
                    Sélectionner un pack{' '}
                  </option>
                  {packs.map((pack) => (
                    <option key={pack.id} value={pack.id}>
                      {pack.name}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                type="number"
                placeholder="Montant"
                value={amount}
                onChange={handleAmountChange}
                max={packPrice}
              />
              <Input
                type="number"
                placeholder="Réduction (%)"
                value={reduction}
                readOnly
              />
              <Text className="text-sm text-gray-700">Total: {total}</Text>
              <Button
                size="sm"
                variant="outline"
                className="h-7"
                onClick={handleCreateInvoice}
              >
                Créer Facture
              </Button>
            </div>
          </div>
        )}
      </Popover.Content>
    </Popover>
  );
}
