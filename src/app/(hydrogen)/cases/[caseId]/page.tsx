'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Corrected import here
import PageHeader from '@/app/shared/page-header';
import Link from 'next/link';
import { useParams } from 'next/navigation'; // Assuming this import is correct and working as expected
import CaseDetailsView from '@/app/shared/custom-realsmile-components/cases/case-details-view';
import { fetchCaseDetails } from '@/app/shared/custom-realsmile-components/liste/cases-list/case-data';
import { CaseDetailsType } from '@/app/shared/custom-realsmile-components/liste/cases-list/case-data';
import { useAuth } from '@/context/AuthContext';

function CaseDetails() {
  const { caseId }: any = useParams();
  const router = useRouter();
  const pageHeader = {
    title: `Cas N°${caseId}`,
    breadcrumb: [
      {
        href: '/cases',
        name: 'Tous les cas',
      },
      {
        name: caseId,
      },
    ],
  };

  const [caseDetails, setCaseDetails] = useState<CaseDetailsType | null>(null);
  const [isLoading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (user && caseId) {
        try {
          const response = await fetchCaseDetails(caseId);
          const caseData: CaseDetailsType = response.data;
          if (!caseData) {
            return null;
          }

          const images = caseData.images || [];
          const stls = caseData.stls || [];
          const linkedCases = caseData.linkedCases || [];
          const links = caseData.links
            ? Object.entries(caseData.links).map(
                ([key, value]: [string, any]) => ({
                  id: value.id, // Optionally include the key if needed
                  url: value.url,
                  created_at: value.created_at,
                  status: value.status,
                  adminStatus: value.adminStatus,
                  pdfFile: value.pdfFile,
                })
              )
            : [];
          const data: any = {
            patient_name: caseData.patient_name || 'Unknown',
            patient_phone: caseData.patient_phone || 'Unknown',
            patient_email: caseData.patient_email || 'Unknown',
            case_status: caseData.case_status || 'Unknown',
            case_status_created_at:
              caseData.case_status_created_at || 'Unknown',
            pack_name: caseData.pack_name || 'Unknown',
            profile_pic: caseData.profile_pic || 'Unknown',
            id: caseData.id,
            created_at: caseData.created_at,
            shipping_link: caseData.shipping_link,
            case_type: caseData.case_type,
            latest_devis_id: caseData.latest_devis_id,
            images,
            stls,
            links,
            linkedCases,
            smile_summary: caseData?.smile_summary,
            movement_chart_summary: caseData?.movement_chart_summary,
            status_histories: caseData?.status_histories,
            general_instructions: caseData?.general_instructions,
            arch_selection: caseData?.arch_selection,
            additional_images: caseData?.additional_images,
            is_refused: caseData?.is_refused,
            doctor_information: caseData?.doctor_information,
          };
          setCaseDetails(data);
          setLoading(false);
        } catch (error: any) {
          console.error('Error fetching case details:', error);
          setLoading(false);
          if (error.response) {
            const { status, data } = error.response;
            console.log('Error status:', data.caseId);
            if (status === 404 || status === 400) {
              window.location.replace('/not-found');
              router.replace('/not-found');
            } else if (status === 403) {
              window.location.replace('/access-denied');
              router.replace('/access-denied');
            } else if (status === 409 && data?.caseId) {
              window.location.replace(`/cases/renumerer/${data.caseId}`);
              router.replace(`/cases/renumerer/${data.caseId}`);
            }
          } else {
            window.location.replace('/access-denied');
            router.replace('/access-denied');
          }
        }
      }
    };

    fetchData();
  }, [caseId, router, user]);

  return (
    <>
      <PageHeader
        title={pageHeader.title}
        breadcrumb={pageHeader.breadcrumb}
      ></PageHeader>
      <CaseDetailsView
        caseDetails={caseDetails}
        setCaseDetails={setCaseDetails}
        isLoading={isLoading}
      />
    </>
  );
}

export default CaseDetails;
