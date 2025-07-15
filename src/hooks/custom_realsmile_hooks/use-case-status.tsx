import { useMemo } from 'react';

export const useCaseStatus = (caseDetails) => {
  const caseStatus = [
    { id: 1, label: 'SmileSet En Cours' },
    { id: 2, label: 'En Fabrication' },
    { id: 3, label: 'En Traitement' },
    { id: 4, label: 'complete' },
  ];

  const currentStatusLabel = caseDetails?.case_status || 'SmileSet En Cours';
  const matchingStatus = caseStatus.find(status => status.label === currentStatusLabel);
  const currentOrderStatus = matchingStatus ? matchingStatus.id : 0;

  return { currentOrderStatus, currentStatusLabel };
};
