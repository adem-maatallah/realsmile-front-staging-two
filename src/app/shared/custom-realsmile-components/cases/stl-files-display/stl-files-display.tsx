import React, { useState } from 'react';
import { StlViewer } from 'react-stl-viewer';
import { Button, Modal } from 'rizzui';
import EyeIcon from '@/components/icons/eye';

export const StlFileDisplay = ({
  title,
  url,
  isLoading,
  setIsLoading,
}: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const handleStlLoad = () => {
    setIsLoading(false);
  };

  const ModelProps = {
    color: '#9e620e'
  };

  const cameraProps = {
    initialPosition: {
      latitude: 0,
      longitude: 0,
      distance: 2, // Adjust the distance factor relative to the model size
    },
  };

  return (
    <div className="flex flex-col items-center rounded-lg border border-gray-300 p-5 shadow-sm">
      <h4 className="mb-3 text-sm font-medium">{title}</h4>
      {isLoading && (
        <div className="flex h-60 w-full items-center justify-center">
          <div className="loader">Loading...</div>
        </div>
      )}
      <StlViewer
        orbitControls={true}
        shadows={true}
        modelProps={ModelProps}
        url={url}
        cameraProps={cameraProps}
        className={`h-60 w-full ${isLoading ? 'hidden' : ''}`}
        onFinishLoading={handleStlLoad}
        onError={() => console.error(`Failed to load STL file at ${url}`)}
        showAxes={true}
      />
      <Button variant="outline" onClick={toggleModal}>
        Visualiser
        <EyeIcon className="ml-1 h-4 w-4" />
      </Button>
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={toggleModal}
          className="bg-black bg-opacity-75"
        >
          <div className="relative max-h-full w-full max-w-7xl overflow-auto rounded-lg bg-white p-6 shadow-lg">
            <button
              onClick={toggleModal}
              className="absolute right-4 top-4 text-lg"
            >
              ✖
            </button>
            <StlViewer
              orbitControls={true}
              modelProps={ModelProps}
              shadows={true}
              url={url}
              cameraProps={cameraProps}
              className="h-[80vh] w-full"
              onFinishLoading={handleStlLoad}
              onError={() => console.error(`Failed to load STL file at ${url}`)}
              showAxes={true}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
