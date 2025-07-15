import Image from 'next/image';
import { PiCheckBold, PiInvoiceLight, PiLink, PiXBold } from 'react-icons/pi';
import StlHistoryTable from '@/app/shared/custom-realsmile-components/cases/case-iiwgl-list/table';
import { Title, Text, Empty, ActionIcon, Select } from 'rizzui';
import cn from '@/utils/class-names';
import { formatDate } from '@/utils/format-date';
import { CaseDetailsType } from '@/app/shared/custom-realsmile-components/liste/cases-list/case-data';
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Pagination,
  Swiper,
  SwiperSlide,
} from '@/components/ui/carousel/carousel';
import NextBtn from '@/components/ui/carousel/next-btn';
import PrevBtn from '@/components/ui/carousel/prev-btn';
import { StlFileDisplay } from '@/app/shared/custom-realsmile-components/cases/stl-files-display/stl-files-display';
import { useAuth } from '@/context/AuthContext';
import { SkeletonGeneral } from '@/components/ui/skeleton-general';
import ModalButton from '../../modal-button';
import AdminApproveModal from '../modals/admin-approve-modal';
import DoctorApproveModal from '../modals/doctor-approve-modal';
import RefuseModal from '../modals/comment-modal';
import AdminExpideModal from '@/app/shared/custom-realsmile-components/modals/admin-expidie-modal';
import ExpidieModal from '../modals/sent-modal';
import toast from 'react-hot-toast';
import { Modal, Button } from 'rizzui';
import ModalCardSlider from '@/app/shared/custom-realsmile-components/cases/modal-card-slider';
import PdfModalButton from '../modals/buttons/pdf-modal-button';
const PdfReaderModal = dynamic(() => import('../modals/pdf-reader-modal'), {
  ssr: false,
});
import RenumereModal from '@/app/shared/custom-realsmile-components/modals/renumere-modal';
import CommandModal from '@/app/shared/custom-realsmile-components/modals/renumere-modal';
import { differenceInDays } from 'date-fns';
import CommandModalButton from '@/app/shared/custom-realsmile-components/modals/buttons/command-modal-button';
import TreatmentOrderTable from '@/app/shared/custom-realsmile-components/cases/treatment-order-list/table';
import { routes } from '@/config/routes';
import RenumModal from '@/app/shared/custom-realsmile-components/modals/renum-modal';
import Router, { useRouter } from 'next/navigation';
import axios from 'axios';
import dynamic from 'next/dynamic';
import axiosInstance from '@/utils/axiosInstance';

const caseStatus = [
  { id: 1, label: 'Soumission Incompléte' },
  { id: 2, label: 'SmileSet En Cours' },
  { id: 3, label: 'Approbation Requise' },
  { id: 4, label: 'En Fabrication' },
  { id: 5, label: 'Expédié' },
  { id: 6, label: 'En Traitement' },
  { id: 7, label: 'Cas Terminé' },
];

interface WidgetCardProps {
  title?: string;
  className?: string;
  children: React.ReactNode;
  childrenWrapperClass?: string;
}

const WidgetCard: React.FC<WidgetCardProps> = ({
  title,
  className,
  children,
  childrenWrapperClass,
}) => (
  <div className={className}>
    {title && (
      <Title
        as="h3"
        className="mb-3.5 text-base font-semibold @5xl:mb-5 4xl:text-lg"
      >
        {title}
      </Title>
    )}
    <div
      className={cn(
        'rounded-lg border border-muted px-5 @sm:px-7 @5xl:rounded-xl',
        childrenWrapperClass
      )}
    >
      {children}
    </div>
  </div>
);

type Props = {
  caseDetails: CaseDetailsType | null;
  setCaseDetails: any;
  isLoading: boolean;
};

const CaseDetailsView: React.FC<Props> = ({
  caseDetails,
  setCaseDetails,
  isLoading = true,
}) => {
  const [onyxcephUrl, setOnyxcephUrl] = useState(null);
  const [linkStatus, setLinkStatus] = useState(null); // To store status of the link
  const [linkAdminStatus, setLinkAdminStatus] = useState(null); // To store status of the link
  const [linkId, setLinkId] = useState('');
  const dynamicCaseStatus = useMemo(() => {
    if (caseDetails?.is_refused === 1) {
      return [
        { id: 0, label: 'Refusé' }, // Add Refusé as the first item
        ...caseStatus,
      ];
    }
    return caseStatus;
  }, [caseDetails?.is_refused]);

  const currentStatusLabel =
    caseDetails?.is_refused === 1 // Explicitly check for 1 (integer)
      ? 'Refusé'
      : caseDetails?.case_status || 'SmileSet En Cours';

  const matchingStatus = dynamicCaseStatus.find(
    (status) => status.label === currentStatusLabel
  );

  const currentOrderStatus = matchingStatus ? matchingStatus.id : 0;

  const imageUrls = useMemo(() => {
    const images = caseDetails ? caseDetails.images : {};
    // Map over the images object and extract URLs
    const imageList = Object.keys(images).map((key) => `${images[key]}`);
    // Spread the additional images into the main list
    if (caseDetails?.additional_images) {
      imageList.push(...caseDetails.additional_images);
    }
    return imageList;
  }, [caseDetails?.images, caseDetails?.additional_images]);

  const router = useRouter();

  const previousUrlRef = useRef();

  const stlViewerRef = useRef(null);
  const widgetContainerRef: any = useRef(null);
  const [viewerHeight, setViewerHeight] = useState('auto');

  const currentDate = new Date();
  const caseStatusCreatedAt = new Date(caseDetails?.case_status_created_at);
  const totalDaysDifference = differenceInDays(
    currentDate,
    caseStatusCreatedAt
  );
  const totalMonthsDifference = Math.floor(totalDaysDifference / 30);
  const remainingDays = totalDaysDifference % 30;

  const isClickable =
    totalMonthsDifference > 5 ||
    (totalMonthsDifference === 5 && remainingDays >= 0); // Check if more than 5 months

  const updateViewerHeight = () => {
    if (widgetContainerRef.current) {
      const height = widgetContainerRef.current?.clientHeight;
      setViewerHeight(`${height}px`);
    }
  };

  useLayoutEffect(() => {
    updateViewerHeight();
    // Adding resize event listener
    window.addEventListener('resize', updateViewerHeight);
    return () => {
      window.removeEventListener('resize', updateViewerHeight);
    };
  }, [caseDetails]);

  useEffect(() => {
    if (caseDetails?.links) {
      const linksArray = Object.entries(caseDetails.links).map(
        ([key, value]) => ({
          id: value.id,
          url: value.url,
          created_at: value.created_at,
          status: value.status,
          adminStatus: value.adminStatus,
        })
      );

      const newUrl: any = linksArray.length > 0 ? linksArray[0].url : null;
      const newStatus: any =
        linksArray.length > 0 ? linksArray[0].status : null;
      const newAdminStatus: any =
        linksArray.length > 0 ? linksArray[0].adminStatus : null;
      const newId: any = linksArray.length > 0 ? linksArray[0].id : null;

      if (newUrl !== previousUrlRef.current) {
        setOnyxcephUrl(newUrl);
        setLinkStatus(newStatus);
        setLinkAdminStatus(newAdminStatus);
        setLinkId(newId);
        previousUrlRef.current = newUrl; // Update ref to current URL
      }
    }
  }, [caseDetails?.links]);
  const {user} = useAuth()
  const userRole = user?.role;
  const currentUserId = user?.id;
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal open state
  const [isMainCarouselModalOpen, setIsMainCarouselModalOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0); // Initial index state
  const handleImageClick = (index: number) => {
    setInitialIndex(index);
    setIsModalOpen(true);
  };

  const handleMainCarouselImageClick = (index: number) => {
    setInitialIndex(index);
    setIsMainCarouselModalOpen(true);
  };

  const isBeforeMay15 =
    new Date(caseDetails?.created_at) < new Date('2024-05-15');

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleSetIsLoading = (loading: any) => {
    if (isMounted.current) {
      // Your logic to handle loading state
    }
  };

  // Function to handle image update (or add if index is new)
  const handleImageUpdate = async (index, newImageFile) => {
    const formData = new FormData();
    formData.append('caseId', caseDetails?.id || '');
    formData.append('index', index.toString());
    formData.append('images', newImageFile);

    try {
      const response = await axiosInstance.put(
        `
        /cases/update-additional-image`,
        formData
      );

      if (response.status === 200) {
        toast.success('Image updated successfully');
        setCaseDetails((prevDetails) => ({
          ...prevDetails,
          additional_images: response.data.additional_images,
        }));
      }
    } catch (error) {
      console.error('Error updating image:', error);
      toast.error('Error updating image');
    }
  };

  // Function to handle adding multiple new images
  const handleAddImages = async (newImages) => {
    const formData = new FormData();
    formData.append('caseId', caseDetails?.id || '');
    Array.from(newImages).forEach((file) => {
      formData.append('images', file);
    });

    try {
      const response = await axiosInstance.put(
        `/cases/add-additional-images`,
        formData
      );

      if (response.status === 200) {
        toast.success('Images added successfully');
        setCaseDetails((prevDetails) => ({
          ...prevDetails,
          additional_images: response.data.additional_images,
        }));
      }
    } catch (error) {
      console.error('Error adding images:', error);
      toast.error(error?.response?.data?.error || 'Error adding images');
    }
  };

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  const currentStatusIndex = useMemo(() => {
    if (caseDetails && caseDetails.case_status) {
      return caseStatus.findIndex(
        (status) => status.label === caseDetails.case_status
      );
    }
    return -1; // Return -1 if caseDetails or case_status is not defined
  }, [caseDetails]);

  const previousStatus = useMemo(() => {
    if (currentStatusIndex > 0) {
      return caseStatus[currentStatusIndex - 1].label;
    }
    return null;
  }, [currentStatusIndex]);

  const nextStatus = useMemo(() => {
    if (currentStatusIndex < caseStatus.length - 1) {
      return caseStatus[currentStatusIndex + 1].label;
    }
    return null;
  }, [currentStatusIndex]);

  const availableStatuses = useMemo(() => {
    return [previousStatus, nextStatus].filter(Boolean); // Filter out null values
  }, [previousStatus, nextStatus]);

  const handleStatusChange = async () => {
    if (!selectedStatus) {
      toast.error('Veuillez sélectionner un statut valide.');
      return;
    }

    try {
      const response = await axiosInstance.put(
        `/cases/update-status/${caseDetails?.id}`,
        {
          status: selectedStatus, // Send selected status in the request body
        }
      );

      if (response.status === 201) {
        const updatedStatus = response.data.data;

        // Update the case details with the new status and append to status histories
        setCaseDetails((prevDetails) => {
          const updatedHistories = [
            ...prevDetails.status_histories, // Keep existing histories
            {
              id: updatedStatus.id, // New status history id
              status: updatedStatus.name, // Status name
              created_at: updatedStatus.created_at, // Status created_at timestamp
            },
          ];

          return {
            ...prevDetails,
            status_histories: updatedHistories, // Update the histories array
            case_status: updatedStatus.name, // Update the main case status
          };
        });

        toast.success('Statut mis à jour avec succès');
        setIsStatusModalOpen(false); // Close the modal
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  return (
    <div className="@container">
      {(userRole == 'admin' ||
        userRole == 'doctor' ||
        userRole == 'hachem') && (
        <div className="flex flex-wrap justify-center border-b border-t border-gray-300 py-4 font-medium text-gray-700 @5xl:justify-start">
          <span className="my-2 border-r border-muted px-5 py-0.5 first:ps-0 last:border-r-0">
            {isLoading ? (
              <SkeletonGeneral className="h-5 w-48 rounded-lg" />
            ) : (
              <>
                {formatDate(caseDetails?.created_at, 'MMMM D, YYYY')} at{' '}
                {formatDate(caseDetails?.created_at, 'h:mm A')}
              </>
            )}
          </span>

          <span className="my-2 ms-5 rounded-3xl border-r border-muted bg-green-lighter px-2.5 py-1 text-xs text-green-dark first:ps-0 last:border-r-0">
            {isLoading ? (
              <SkeletonGeneral className="w-15 h-1 rounded-3xl border-r border-muted bg-green-lighter px-2.5 py-1 text-xs text-green-dark first:ps-0 last:border-r-0" />
            ) : (
              <span className="my-2 ms-5 rounded-3xl border-r border-muted bg-green-lighter px-2.5 py-1 text-xs text-green-dark first:ps-0 last:border-r-0">
                {currentStatusLabel || 'Unknown Status'}
              </span>
            )}
          </span>

          <span className="my-2 ms-5 rounded-3xl border-r border-primary bg-primary px-2.5 py-1 text-xs text-primary first:ps-0 last:border-r-0">
            {isLoading ? (
              <SkeletonGeneral className="w-15 h-1 rounded-3xl border-r border-primary bg-primary px-2.5 py-1 text-xs text-primary first:ps-0 last:border-r-0" />
            ) : (
              <span className="my-2 ms-5 rounded-3xl border-r border-primary bg-primary px-2.5 py-1 text-xs text-white first:ps-0 last:border-r-0">
                {caseDetails?.case_type || 'Unknown Status'}
              </span>
            )}
          </span>

          <div className="ml-auto flex justify-end space-x-4">
            {(user?.role === 'admin' ||
              user?.role === 'hachem') &&
              caseDetails?.case_status === 'En Fabrication' && (
                <ModalButton
                  label="Changez vers Expédié"
                  view={<AdminExpideModal caseId={caseDetails?.id} />}
                  customSize="600px"
                  className="mt-0 w-36" // Adjusted width
                />
              )}

            {user?.role === 'admin' &&
              availableStatuses.length > 0 && (
                <Button
                  onClick={() => setIsStatusModalOpen(true)}
                  className="mt-0 w-36 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary-dark focus:outline-none"
                >
                  Changer Status
                </Button>
              )}

            <Modal
              isOpen={isStatusModalOpen}
              onClose={() => setIsStatusModalOpen(false)}
            >
              <div className="p-4">
                <h3 className="mb-4 text-lg font-semibold">
                  Changer le Statut
                </h3>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="mb-4 w-full rounded border border-gray-300 p-2"
                >
                  <option value="" disabled>
                    Sélectionnez un statut
                  </option>
                  {availableStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <div className="flex justify-end space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsStatusModalOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button onClick={handleStatusChange}>Confirmer</Button>
                </div>
              </div>
            </Modal>

            {user?.role === 'doctor' &&
              (caseDetails?.case_status === 'Expédié' ||
                caseDetails?.case_status === 'Cas Terminé') && (
                <ModalButton
                  label="Changez vers En traitement"
                  view={<ExpidieModal caseId={caseDetails?.id} />}
                  customSize="600px"
                  className="mt-0 w-36" // Adjusted width
                />
              )}

            {(user?.role === 'admin' ||
              user?.role === 'doctor') &&
              caseDetails?.case_status === 'En Traitement' && (
                <CommandModalButton
                  label="Commander la suite du traitement"
                  view={<CommandModal caseId={caseDetails?.id} />}
                  customSize="600px"
                  className="mt-0 w-36" // Adjusted width
                  isClickable={true}
                  totalMonthsDifference={totalMonthsDifference} // Pass monthsDifference as prop
                  remainingDays={remainingDays} // Pass remainingDays as prop
                />
              )}

            {(((user?.role === 'admin' ||
              user?.role === 'doctor') &&
              (caseDetails?.case_status === 'En Traitement' ||
                caseDetails?.case_status === 'Expédié')) ||
              caseDetails?.case_status === 'Cas Terminé') && (
              <CommandModalButton
                label="Rénumériser le cas (aligneurs de finition)"
                view={<RenumModal caseId={caseDetails?.id} />}
                customSize="600px"
                className="mt-0 w-36"
                isClickable={true}
                totalMonthsDifference={totalMonthsDifference}
                remainingDays={remainingDays}
              />
            )}

            {(user?.role === 'admin' &&
              (linkAdminStatus === 'non traité' ||
                (linkAdminStatus === 'accepté' &&
                  linkStatus === 'non traité'))) ||
            (user?.role === 'doctor' &&
              linkStatus === 'non traité') ? (
              user?.role === 'admin' ? (
                <>
                  {linkAdminStatus === 'non traité' && (
                    <>
                      <ModalButton
                        label="Approuver SmileSet"
                        view={
                          <AdminApproveModal
                            linkId={linkId}
                            caseType={caseDetails?.case_type}
                          />
                        }
                        customSize="400px"
                        className="mt-0 w-36" // Adjusted width and top margin
                      />
                      <ModalButton
                        label="Modifier le SmileSet"
                        view={<RefuseModal linkId={linkId} />}
                        customSize="600px"
                        className="mt-0 w-36" // Adjusted width
                      />
                    </>
                  )}

                  {linkAdminStatus === 'accepté' &&
                    linkStatus === 'non traité' && (
                      <ModalButton
                        label="Approuver SmileSet (En tant que praticien)"
                        view={<DoctorApproveModal linkId={linkId} />}
                        customSize="600px"
                        className="mt-0 w-36" // Adjusted width and top margin
                      />
                    )}
                </>
              ) : (
                <>
                  <ModalButton
                    label="Approuver SmileSet"
                    view={<DoctorApproveModal linkId={linkId} />}
                    customSize="600px"
                    className="mt-0 w-36" // Adjusted width and top margin
                  />
                  <ModalButton
                    label="Modifier le SmileSet"
                    view={<RefuseModal linkId={linkId} />}
                    customSize="600px"
                    className="mt-0 w-36" // Adjusted width
                  />
                </>
              )
            ) : null}
          </div>
        </div>
      )}

      <div className="items-start pt-10 @5xl:grid @5xl:grid-cols-12 @5xl:gap-7 @6xl:grid-cols-10 @7xl:gap-10">
        <div
          className="space-y-7 @5xl:col-span-8 @5xl:space-y-10 @6xl:col-span-7"
          ref={stlViewerRef}
          style={{ height: viewerHeight }}
        >
          <div className="space-y-7">
            {onyxcephUrl ? (
              <iframe
                className="h-full w-full rounded-xl border border-muted"
                style={{ height: viewerHeight }}
                src={onyxcephUrl}
                title="3D Viewer"
                frameBorder="0"
              ></iframe>
            ) : (
              <div
                className="flex items-center justify-center"
                style={{ height: viewerHeight }}
              >
                <Image
                  src="https://storage.googleapis.com/realsmilefiles/staticFolder/noSmileSet.svg"
                  width={600}
                  height={600}
                  alt="not found"
                  className="aspect-square max-w-full"
                />
              </div>
            )}
          </div>
        </div>
        <div
          ref={widgetContainerRef}
          className="col-sm-12 col-lg-4 space-y-7 pt-8 @container @5xl:col-span-4 @5xl:space-y-10 @5xl:pt-0 @6xl:col-span-3 "
        >
          <WidgetCard
            title="Informations du patient"
            childrenWrapperClass="py-5 @5xl:py-8 flex"
          >
            {isLoading ? (
              <>
                <SkeletonGeneral
                  className="aspect-square h-16 w-16 shrink-0 rounded-full @5xl:h-20 @5xl:w-20"
                  rounded={true}
                />
                <div className="space-y-2 ps-4 @5xl:ps-6">
                  <SkeletonGeneral className="h-6 w-48" />
                  <SkeletonGeneral className="h-4 w-36" />
                  <SkeletonGeneral className="h-4 w-32" />
                </div>
              </>
            ) : (
              <>
                <div className="relative aspect-square h-16 w-16 shrink-0 @5xl:h-20 @5xl:w-20">
                  <Image
                    fill
                    alt="avatar"
                    className="rounded-full object-cover"
                    sizes="(max-width: 768px) 100vw"
                    src={caseDetails?.profile_pic || '/images/avatar.png'}
                  />
                </div>
                <div className="ps-4 @5xl:ps-6">
                  <Title
                    as="h3"
                    className="mb-2.5 text-base font-semibold @7xl:text-lg"
                  >
                    {caseDetails?.patient_name || 'Unknown Patient'}
                  </Title>
                  <Text as="p" className="mb-2 break-all last:mb-0">
                    {caseDetails?.patient_email || 'Unknown Email'}
                  </Text>
                  <Text as="p" className="mb-2 last:mb-0">
                    {caseDetails?.patient_phone || 'Unknown Phone'}
                  </Text>
                </div>
              </>
            )}
          </WidgetCard>

          {user?.role != 'doctor' && (
            <WidgetCard
              title="Informations du praticien"
              childrenWrapperClass="py-5 @5xl:py-8 flex"
            >
              {isLoading ? (
                <>
                  <SkeletonGeneral
                    className="aspect-square h-16 w-16 shrink-0 rounded-full @5xl:h-20 @5xl:w-20"
                    rounded={true}
                  />
                  <div className="space-y-2 ps-4 @5xl:ps-6">
                    <SkeletonGeneral className="h-6 w-48" />
                    <SkeletonGeneral className="h-4 w-36" />
                    <SkeletonGeneral className="h-4 w-32" />
                  </div>
                </>
              ) : (
                <>
                  <div className="relative aspect-square h-16 w-16 shrink-0 @5xl:h-20 @5xl:w-20">
                    <Image
                      fill
                      alt="avatar"
                      className="rounded-full object-cover"
                      sizes="(max-width: 768px) 100vw"
                      src={
                        caseDetails?.doctor_information?.profile_pic ||
                        '/images/avatar.png'
                      }
                    />
                  </div>
                  <div className="ps-4 @5xl:ps-6">
                    <Title
                      as="h3"
                      className="mb-2.5 text-base font-semibold @7xl:text-lg"
                    >
                      {caseDetails?.doctor_information?.first_name +
                        ' ' +
                        caseDetails?.doctor_information?.last_name ||
                        'Unknown Praticien'}
                    </Title>
                    <Text as="p" className="mb-2 break-all last:mb-0">
                      {caseDetails?.doctor_information?.speciality ||
                        'Unknown Speciality'}
                    </Text>
                    <Text as="p" className="mb-2 break-all last:mb-0">
                      {caseDetails?.doctor_information?.email ||
                        'Unknown Email'}
                    </Text>
                    <Text as="p" className="mb-2 last:mb-0">
                      {caseDetails?.doctor_information?.phone ||
                        'Unknown Phone'}
                    </Text>
                  </div>
                </>
              )}
            </WidgetCard>
          )}

          {caseDetails?.links?.[0]?.pdfFile && (
            <WidgetCard
              title="Diagramme de mouvement et Stripping"
              childrenWrapperClass="@5xl:py-6 py-5"
            >
              <PdfModalButton
                label="Afficher le Resumè du traitement"
                view={<PdfReaderModal pdfUrl={caseDetails.links[0].pdfFile} />}
                className="mt-0"
              />
            </WidgetCard>
          )}

          {!isBeforeMay15 && (
            <WidgetCard
              title="Pack de cas"
              childrenWrapperClass="@5xl:py-6 py-5"
            >
              {isLoading ? (
                <SkeletonGeneral className="h-6 w-full" />
              ) : (
                <div className="row">
                  <p className="mb-2 leading-loose duration-200 last:mb-0">
                    {caseDetails?.pack_name} :
                    <Button
                      onClick={() => {
                        caseDetails &&
                          caseDetails.latest_devis_id !== 'null' &&
                          router.push(
                            routes.devis.details(caseDetails.latest_devis_id)
                          );
                      }}
                    >
                      Voir le devis
                    </Button>
                  </p>
                </div>
              )}
            </WidgetCard>
          )}

          {caseDetails?.case_status === 'Expédié' && (
            <WidgetCard
              title="Lien de suivie"
              childrenWrapperClass="@5xl:py-6 py-5"
            >
              {isLoading ? (
                <SkeletonGeneral className="h-6 w-full" />
              ) : (
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      const shippingLink = caseDetails?.shipping_link || '';
                      if (shippingLink) {
                        navigator.clipboard.writeText(shippingLink);
                        toast.success('Lien copié avec succées!');
                        window.open(
                          shippingLink,
                          '_blank',
                          'noopener,noreferrer'
                        );
                      } else {
                        toast.error('Aucun lien de suivie disponible');
                      }
                    }}
                    className="flex justify-center rounded bg-primary px-4 py-2 text-white"
                  >
                    <PiLink className="me-1.5 h-[17px] w-[17px]" />
                    Copier et ouvrir le lien de suivie
                  </button>
                </div>
              )}
            </WidgetCard>
          )}

          <WidgetCard
            title="Suivie de cas"
            childrenWrapperClass="py-5 @5xl:py-8 flex"
          >
            {isLoading ? (
              <div className="w-full">
                {Array.from({ length: caseStatus.length }).map((_, index) => (
                  <div key={index} className="my-2 flex items-center">
                    {/* Vertical line */}
                    <div className="relative flex-grow-0">
                      <SkeletonGeneral className="h-5 w-5" rounded={true} />{' '}
                      {/* Circle */}
                      {index < caseStatus.length - 1 && (
                        // Extend the vertical line to connect the circles
                        <div className="absolute left-1/2 top-full z-0 -ml-0.5 h-10 w-0.5 bg-gray-300"></div>
                      )}
                    </div>
                    {/* Text placeholder */}
                    <SkeletonGeneral className="ml-2 h-4 flex-grow rounded-md bg-gray-300" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="ms-2 w-full space-y-7 border-s-2 border-gray-100">
                {dynamicCaseStatus.map((item) => {
                  const statusHistory = caseDetails?.status_histories.find(
                    (history) => history.status === item.label
                  );
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "relative ps-6 text-sm font-medium before:absolute before:-start-[9px] before:top-px before:h-5 before:w-5 before:-translate-x-px before:rounded-full before:bg-gray-100 before:content-[''] after:absolute after:-start-px after:top-5 after:h-10 after:w-0.5 after:content-[''] last:after:hidden",
                        currentOrderStatus > item.id
                          ? 'before:bg-primary after:bg-primary'
                          : 'after:hidden',
                        currentOrderStatus === item.id && 'before:bg-primary'
                      )}
                    >
                      {currentOrderStatus >= item.id ? (
                        <span className="absolute -start-1.5 top-1 text-white">
                          <PiCheckBold className="h-auto w-3" />
                        </span>
                      ) : null}
                      {item.label}
                      {statusHistory && (
                        <span className="text-xs text-gray-500">
                          {' '}
                          -{' '}
                          {formatDate(
                            new Date(statusHistory.created_at),
                            'MMMM D, YYYY'
                          )}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </WidgetCard>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 pt-8 md:grid-cols-4">
        {isBeforeMay15 && (
          <div className="col-span-1 md:col-span-4">
            <Swiper
              speed={500}
              spaceBetween={0}
              slidesPerView={1}
              modules={[Pagination]}
              pagination={{ clickable: true }}
              className="h-full min-h-[420px]"
            >
              <SwiperSlide>
                <div className="relative h-full w-full">
                  <Image
                    src={caseDetails?.smile_summary}
                    alt="Movement Chart Summary"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw"
                    className="rounded-xl object-cover"
                    onClick={() => handleMainCarouselImageClick(0)}
                  />
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="relative h-full w-full">
                  <Image
                    src={caseDetails?.movement_chart_summary}
                    alt="Smile Summary"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw"
                    className="rounded-xl object-cover"
                    onClick={() => handleMainCarouselImageClick(1)}
                  />
                </div>
              </SwiperSlide>
              <NextBtn key="next-btn" />
              <PrevBtn key="prev-btn" />
            </Swiper>
          </div>
        )}
        {/* Swiper Component Displayed First */}
        <div>
          <Swiper
            speed={500}
            spaceBetween={0}
            slidesPerView={1}
            modules={[Pagination]}
            pagination={isLoading ? false : { clickable: true }}
            className="h-full min-h-[420px]"
          >
            {isLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <SwiperSlide key={`skeleton-slide-${index}`}>
                    <SkeletonGeneral className="h-full w-full" />
                  </SwiperSlide>
                ))
              : imageUrls.map((item, index) => (
                  <SwiperSlide key={`profile-modal-slider-${index}`}>
                    <div className="relative h-full w-full">
                      <Image
                        src={item}
                        alt={`Image ${index}`}
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw"
                        className="rounded-xl object-cover"
                        onClick={() => handleImageClick(index)}
                      />
                      {userRole === 'admin' &&
                        caseDetails?.additional_images?.includes(item) && (
                          <div className="absolute right-0 top-0 p-2">
                            <input
                              type="file"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleImageUpdate(index, e.target.files[0]);
                                }
                              }}
                              className="hidden"
                              id={`upload-button-${index}`}
                            />
                            <Button
                              variant="solid"
                              onClick={() =>
                                document
                                  .getElementById(`upload-button-${index}`)
                                  ?.click()
                              } // Trigger the file input click
                            >
                              Modifier
                            </Button>
                          </div>
                        )}
                    </div>
                  </SwiperSlide>
                ))}
            {!isLoading && <NextBtn key="next-btn" />}
            {!isLoading && <PrevBtn key="prev-btn" />}
          </Swiper>
        </div>

        {/* STL File Displays */}
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <SkeletonGeneral key={index} className="h-full w-full" />
            ))
          : caseDetails?.stls && caseDetails.stls.length > 0
            ? caseDetails.stls
                .map((file, index) => (
                  <StlFileDisplay
                    key={index}
                    title={`Fichier STL N° ${index + 1}`}
                    url={file.data}
                    isLoading={file.isLoading}
                    setIsLoading={handleSetIsLoading}
                  />
                ))
                .concat(
                  Array.from({
                    length: 3 - (caseDetails?.stls?.length || 0),
                  }).map((_, index) => (
                    <div
                      key={index + (caseDetails?.stls?.length || 0)}
                      className="flex items-center justify-center rounded-md border border-dashed border-gray-300 p-4"
                    >
                      <span>Stl non trouvé</span>
                    </div>
                  ))
                )
            : null}
      </div>

      <div className="pt-10">
        <div className="grid grid-cols-2 gap-7">
          <div className="space-y-7">
            <StlHistoryTable
              caseDetails={caseDetails}
              setOnyxcephUrl={setOnyxcephUrl}
              stlViewerRef={stlViewerRef}
              isLoading={isLoading}
              setLinkStatus={setLinkStatus}
            />
          </div>
          <div className="space-y-7">
            <TreatmentOrderTable
              caseDetails={caseDetails}
              isLoading={isLoading}
            />
          </div>
        </div>
        <div className="pt-10">
          <div className="flex items-center justify-between">
            <Title as="h4" className="mb-2 text-lg font-semibold">
              Images Additionnelles
            </Title>
            {(userRole === 'doctor' || userRole === 'admin') &&
              (caseDetails?.additional_images?.length || 0) < 10 && (
                <Button
                  variant="flat"
                  onClick={() =>
                    document.getElementById('upload-new-images')?.click()
                  }
                >
                  Ajouter des images
                </Button>
              )}
          </div>
          <div className="space-y-7">
            <input
              type="file"
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  // Add new images
                  handleAddImages(e.target.files);
                }
              }}
              className="hidden"
              id="upload-new-images"
            />
            <div className="grid grid-cols-1 gap-4 rounded-md border border-dashed border-gray-300 p-4">
              {caseDetails?.additional_images?.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {caseDetails.additional_images.map((image, index) => (
                    <div key={index} className="relative h-64 w-full">
                      <Image
                        src={image}
                        alt={`Image ${index}`}
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw"
                        className="rounded-md object-cover"
                      />
                      {userRole === 'admin' && (
                        <div className="absolute right-0 top-0 p-2">
                          <input
                            type="file"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleImageUpdate(index, e.target.files[0]);
                              }
                            }}
                            className="hidden"
                            id={`upload-button-${index}`}
                          />
                          <Button
                            variant="solid"
                            onClick={() =>
                              document
                                .getElementById(`upload-button-${index}`)
                                ?.click()
                            } // Trigger the file input click
                          >
                            Modifier
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <span>Aucune image additionnelle</span>
              )}
            </div>
          </div>
        </div>
        <div className="pt-10">
          <div className="space-y-7">
            {caseDetails?.general_instructions && (
              <div className="rounded-lg border bg-white p-5 shadow-sm">
                <Title as="h4" className="mb-2 text-lg font-semibold">
                  Instructions Générales
                </Title>
                <Text>{caseDetails.general_instructions}</Text>
              </div>
            )}
            {caseDetails?.arch_selection && (
              <div className="rounded-lg border bg-white p-5 shadow-sm">
                <Title as="h4" className="mb-2 text-lg font-semibold">
                  Sélection des arcades
                </Title>
                <Text>{caseDetails.arch_selection}</Text>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="[&>div]:p-0 lg:[&>div]:p-4"
        overlayClassName="dark:bg-opacity-40 dark:backdrop-blur-lg"
        containerClassName="dark:bg-gray-100 max-w-[460px] max-w-[1200px] lg:max-w-4xl xl:max-w-6xl 2xl:max-w-[1200px] relative"
      >
        <Button
          variant="text"
          className="absolute right-4 top-4 p-0 text-gray-50 dark:text-white"
          onClick={() => setIsModalOpen(false)}
        >
          <PiXBold className="h-5 w-5" />
        </Button>

        <ModalCardSlider images={imageUrls} initialIndex={initialIndex} />
      </Modal>
      <Modal
        isOpen={isMainCarouselModalOpen}
        onClose={() => setIsMainCarouselModalOpen(false)}
        className="[&>div]:p-0 lg:[&>div]:p-4"
        overlayClassName="dark:bg-opacity-40 dark:backdrop-blur-lg"
        containerClassName="dark:bg-gray-100 max-w-[460px] max-w-[1200px] lg:max-w-4xl xl:max-w-6xl 2xl:max-w-[1200px] relative"
      >
        <Button
          variant="text"
          className="absolute right-4 top-4 p-0 text-gray-50 dark:text-white"
          onClick={() => setIsMainCarouselModalOpen(false)}
        >
          <PiXBold className="h-5 w-5" />
        </Button>

        <ModalCardSlider
          images={[
            caseDetails?.movement_chart_summary,
            caseDetails?.smile_summary,
          ]}
          initialIndex={initialIndex}
        />
      </Modal>
    </div>
  );
};
export default CaseDetailsView;
