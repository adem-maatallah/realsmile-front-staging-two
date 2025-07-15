import React from 'react';
import DateFiled from '@/components/controlled-table/date-field';
import StatusField from '@/components/controlled-table/status-field';
import { Button } from 'rizzui';

type FilterElementProps = {
  isFiltered: boolean;
  filters: { [key: string]: any };
  updateFilter: (columnId: string, filterValue: any) => void;
  handleReset: () => void;
};

export default function FilterElement({
  isFiltered,
  filters,
  updateFilter,
  handleReset,
}: FilterElementProps) {
  return (
    <div className="filter-container">
      <DateFiled
        selected={filters['creationDate']}
        onChange={(date) => updateFilter('creationDate', date)}
      />
      <StatusField
        options={[
          { value: 'activé', label: 'Activé' },
          { value: 'désactivé', label: 'Désactivé' },
        ]}
        value={filters['status']}
        onChange={(value) => updateFilter('status', value)}
      />
      {isFiltered && (
        <Button onClick={handleReset} variant="flat">
          Supprimer les filtres
        </Button>
      )}
    </div>
  );
}
