'use client';
import PageHeader from '@/app/shared/page-header';
import React, { useEffect, useRef } from 'react';

const pageHeader = {
  title: "Centre d'aide",
  breadcrumb: [
    {
      href: '/',
      name: 'Accueil',
    },
    {
      href: '/helpdesk',
      name: "Centre d'aide",
    },
  ],
};

export default function Page() {
  const iframeRef = useRef(null);

  // Function to handle resizing the iframe
  useEffect(() => {
    const handleResize = () => {
      if (iframeRef.current) {
        const header = document.querySelector('header'); // Ensure this selector matches your header element
        const headerHeight = header ? header.offsetHeight : 0;
        iframeRef.current.style.height = `calc(100vh - ${headerHeight}px)`;
      }
    };

    handleResize(); // Initial call to set height
    window.addEventListener('resize', handleResize); // Adjust on window resize

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          height: '100vh',
          width: '80vw',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <iframe
          ref={iframeRef}
          src="https://helpdesk.realsmilealigner.com/"
          title="HelpDesk"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            margin: 0,
            padding: 0,
          }}
        ></iframe>
      </div>
    </>
  );
}
