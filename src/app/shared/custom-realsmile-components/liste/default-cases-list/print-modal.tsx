import { useState } from 'react';
import { Modal, Input, Button, Text, ActionIcon } from 'rizzui';
import { XMarkIcon } from '@heroicons/react/20/solid';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

const PrintModal = ({
  isVisible,
  onClose,
  patientName,
  doctorName,
  caseId,
}) => {
  const [pagesText, setPagesText] = useState('');

  const handlePrint = () => {
    const pages = parseInt(pagesText) || 6; // Default to 6 if input is invalid
    const doc = new jsPDF({
      unit: 'cm',
      format: [4, 7], // Correct dimensions
      orientation: 'landscape',
    });

    // Set a modern font (e.g., Helvetica) and configure styles
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#000'); // Set text color to black

    // Define smaller margins for the border
    const margin = 0.2; // 2mm margin

    // Generate QR code once and reuse it
    const qrData =
      `Patient ${patientName} Doctor ${doctorName} CaseID ${caseId}`
        .replace(/[,:]/g, '')
        .trim();

    QRCode.toDataURL(
      qrData,
      { errorCorrectionLevel: 'H', width: 200 },
      (err, url) => {
        if (err) {
          console.error(err);
          return;
        }

        // Truncate names if too long
        const maxLength = 20;
        const truncatedPatientName =
          patientName.length > maxLength
            ? `${patientName.substring(0, maxLength)}...`
            : patientName;
        const truncatedDoctorName =
          doctorName.length > maxLength
            ? `${doctorName.substring(0, maxLength)}...`
            : doctorName;

        // Define font sizes
        const mainFontSize =
          truncatedPatientName.length > 18 || truncatedDoctorName.length > 18
            ? 5 // Reduced from 7
            : 6; // Reduced from 8
        const footerFontSize = 7; // Reduced from 10

        // Add the template page with patient info, QR code, and 'Template' text
        doc.setFontSize(mainFontSize);
        doc.text(`Patient: ${truncatedPatientName}`, margin + 0.5, margin + 1);
        doc.text(`Doctor: ${truncatedDoctorName}`, margin + 0.5, margin + 1.8);
        doc.text(`Case ID: ${caseId}`, margin + 0.5, margin + 2.6);
        doc.addImage(
          url,
          'PNG',
          doc.internal.pageSize.width - margin - 2.5, // Align QR code closer to the right
          margin + 0.5, // Move QR code closer to the top
          2,
          2
        );

        // Add 'Template' text with black color
        doc.setFontSize(footerFontSize);
        doc.setTextColor('#000'); // Set text color to black
        doc.text(
          'Template',
          doc.internal.pageSize.width - margin - 2, // Align to the right
          doc.internal.pageSize.height - margin - 0.5 // Align to the bottom
        );

        // Add the numbered pages with patient info and QR code
        for (let i = 1; i <= pages; i++) {
          doc.addPage();
          doc.setFontSize(mainFontSize);
          doc.text(
            `Patient: ${truncatedPatientName}`,
            margin + 0.5,
            margin + 1
          );
          doc.text(
            `Doctor: ${truncatedDoctorName}`,
            margin + 0.5,
            margin + 1.8
          );
          doc.text(`Case ID: ${caseId}`, margin + 0.5, margin + 2.6);
          doc.addImage(
            url,
            'PNG',
            doc.internal.pageSize.width - margin - 2.5, // Align QR code closer to the right
            margin + 0.5, // Move QR code closer to the top
            2,
            2
          );

          doc.setFontSize(footerFontSize);
          doc.setTextColor('#000'); // Set text color to black
          doc.text(
            `${i}/${pages}`,
            doc.internal.pageSize.width - margin - 2, // Align to the right
            doc.internal.pageSize.height - margin - 0.5 // Align to the bottom
          );
        }

        // Save the PDF
        doc.save(`case_${caseId}.pdf`);
      }
    );
  };

  return (
    <Modal isOpen={isVisible} onClose={onClose}>
      <div className="m-auto px-7 pb-8 pt-6">
        <div className="mb-7 flex items-center justify-between">
          <Text as="h3">Print Case PDF</Text>
          <ActionIcon size="sm" variant="text" onClick={onClose}>
            <XMarkIcon className="h-auto w-6" strokeWidth={1.8} />
          </ActionIcon>
        </div>
        <div className="grid grid-cols-2 gap-x-5 gap-y-6 [&_label>span]:font-medium">
          <Input
            label="Number of Pages"
            value={pagesText}
            onChange={(e) => setPagesText(e.target.value)}
            maxLength={70} // Limit input to 70 characters
            placeholder="Enter the number of pages"
            className="col-span-2"
          />
          <Button size="lg" className="col-span-2 mt-2" onClick={handlePrint}>
            Imprimer
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PrintModal;
