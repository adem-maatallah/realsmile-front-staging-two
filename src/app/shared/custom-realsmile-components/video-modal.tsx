import React from 'react';
import { Modal } from 'rizzui';
import { PiXCircleDuotone } from 'react-icons/pi';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
}

const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  onClose,
  videoUrl,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl">
      <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Tutoriel Video
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <PiXCircleDuotone className="h-6 w-6" />
          </button>
        </div>
        <div className="px-4 py-5">
          <iframe
            width="100%"
            height="500"
            src={videoUrl}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </div>
    </Modal>
  );
};

export default VideoModal;
