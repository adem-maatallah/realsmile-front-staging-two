import React, { useState } from 'react';
import DropdownAction from '@/components/charts/dropdown-action';

const marketOptions = [
  { value: 'Tunisie', label: 'Tunisie' },
  { value: 'Maroc', label: 'Maroc' },
  { value: 'Europe', label: 'Europe' },
];

const statOptions = [
  { value: 'praticiens', label: 'Nouveaux Praticiens et Total Praticiens' },
  { value: 'patients', label: 'Nouveaux Patients et Total Patients' },
  { value: 'finitions', label: 'Nombre de Cas Finitions (Renumeriser)' },
  { value: 'smileset', label: 'Nombre de Smileset Link Ajouté' },
  { value: 'validés', label: 'Nombre de Cas Validé par Marché et Période' },
  { value: 'refusés', label: 'Nombre de Cas Refusés' },
  { value: 'packs', label: 'Nombre de Cas par Packs' },
];

type StatFilterProps = {
  onMarketChange: (value: string) => void;
  onStatChange: (value: string) => void;
};

export default function StatFilter({
  onMarketChange,
  onStatChange,
}: StatFilterProps) {
  const [selectedMarket, setSelectedMarket] = useState(marketOptions[0].value);
  const [selectedStat, setSelectedStat] = useState(statOptions[0].value);

  const handleMarketChange = (value: string) => {
    setSelectedMarket(value);
    onMarketChange(value);
  };

  const handleStatChange = (value: string) => {
    setSelectedStat(value);
    onStatChange(value);
  };

  return (
    <div className="flex gap-4">
      <DropdownAction
        className="rounded-md border"
        options={marketOptions}
        onChange={handleMarketChange}
        value={selectedMarket}
        dropdownClassName="!z-0"
      />
      <DropdownAction
        className="rounded-md border"
        options={statOptions}
        onChange={handleStatChange}
        value={selectedStat}
        dropdownClassName="!z-0"
      />
    </div>
  );
}
