'use client';

import React from 'react';
import {PiTrashDuotone} from 'react-icons/pi';
import StatusField from '@/components/controlled-table/status-field';
import {Button} from 'rizzui';
import {useMedia} from '@/hooks/use-media';
import {
    adminOptions, doctorOptions,
    renderAdminOptionDisplayValue, renderDoctorOptionDisplayValue
} from "@/app/shared/custom-realsmile-components/liste/labo-list/iiwgl-list/iiwgl-status";

type FilterElementProps = {
    isFiltered: boolean;
    filters: { [key: string]: any };
    updateFilter: (columnId: string, filterValue: string | any[]) => void;
    handleReset: () => void;
};

export default function FilterElement({
                                          isFiltered,
                                          filters,
                                          updateFilter,
                                          handleReset,
                                      }: FilterElementProps) {
    const isMediumScreen = useMedia('(max-width: 1860px)', false);
    return (
        <>
            {/*<PriceField*/}
            {/*  value={filters['amount']}*/}
            {/*  onChange={(data) => updateFilter('amount', data)}*/}
            {/*/>*/}
            {/*<DateFiled*/}
            {/*  className="w-full"*/}
            {/*  selected={getDateRangeStateValues(filters['createdAt'][0])}*/}
            {/*  startDate={getDateRangeStateValues(filters['createdAt'][0])}*/}
            {/*  endDate={getDateRangeStateValues(filters['createdAt'][1])}*/}
            {/*  onChange={(date: any) => {*/}
            {/*    updateFilter('createdAt', date);*/}
            {/*  }}*/}
            {/*  placeholderText="Select created date"*/}
            {/*  {...(isMediumScreen && {*/}
            {/*    inputProps: {*/}
            {/*      label: 'Created Date',*/}
            {/*      labelClassName: 'font-medium text-gray-700',*/}
            {/*    },*/}
            {/*  })}*/}
            {/*/>*/}
            {/*<DateFiled*/}
            {/*  className="w-full"*/}
            {/*  selected={getDateRangeStateValues(filters['dueDate'][0])}*/}
            {/*  startDate={getDateRangeStateValues(filters['dueDate'][0])}*/}
            {/*  endDate={getDateRangeStateValues(filters['dueDate'][1])}*/}
            {/*  onChange={(date: any) => {*/}
            {/*    updateFilter('dueDate', date);*/}
            {/*  }}*/}
            {/*  placeholderText="Select due date"*/}
            {/*  {...(isMediumScreen && {*/}
            {/*    inputProps: {*/}
            {/*      label: 'Due Date',*/}
            {/*      labelClassName: 'font-medium text-gray-700',*/}
            {/*    },*/}
            {/*  })}*/}
            {/*/>*/}
            <StatusField
                options={adminOptions}
                value={filters['adminStatus']}
                onChange={(value: string) => {
                    updateFilter('adminStatus', value);
                }}
                getOptionValue={(option: { value: any }) => option.value}
                getOptionDisplayValue={(option: { value: any }) =>
                    renderAdminOptionDisplayValue(option.value as string)
                }
                displayValue={(selected: string) => renderAdminOptionDisplayValue(selected)}
                dropdownClassName="!z-10"
                className={'w-auto'}
                {...(isMediumScreen && {
                    label: 'Status',
                    labelClassName: 'font-medium text-gray-700',
                })}
            />

            <StatusField
                options={doctorOptions}
                value={filters['doctorStatus']}
                onChange={(value: string) => {
                    updateFilter('doctorStatus', value);
                }}
                getOptionValue={(option: { value: any }) => option.value}
                getOptionDisplayValue={(option: { value: any }) =>
                    renderDoctorOptionDisplayValue(option.value as string)
                }
                displayValue={(selected: string) => renderDoctorOptionDisplayValue(selected)}
                dropdownClassName="!z-10"
                className={'w-auto'}
                {...(isMediumScreen && {
                    label: 'Status',
                    labelClassName: 'font-medium text-gray-700',
                })}
            />
            {isFiltered ? (
                <Button
                    size="sm"
                    onClick={() => {
                        handleReset();
                    }}
                    className="h-8 bg-gray-200/70"
                    variant="flat"
                >
                    <PiTrashDuotone className="me-1.5 h-[17px] w-[17px]"/> Supprimer les filtres
                </Button>
            ) : null}
        </>
    );
}
