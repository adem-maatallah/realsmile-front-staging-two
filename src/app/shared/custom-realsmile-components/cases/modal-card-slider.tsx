import {
  Pagination,
  Swiper,
  SwiperSlide,
} from '@/components/ui/carousel/carousel';
import Image from 'next/image';
import NextBtn from '@/components/ui/carousel/next-btn';
import PrevBtn from '@/components/ui/carousel/prev-btn';

function ModalCardSlider({ images, initialIndex }) {
  return (
    <Swiper
      speed={500}
      spaceBetween={0}
      slidesPerView={1}
      modules={[Pagination]}
      pagination={{ clickable: true }}
      initialSlide={initialIndex} // Start the slider at the current image
      className="h-full min-h-[420px]"
    >
      {images.map((item, index) => (
        <SwiperSlide key={`profile-modal-slider-${index}`}>
          <div className="relative flex h-[420px] w-full items-center justify-center">
            <Image
              src={item}
              alt={`Image ${index}`}
              fill
              sizes="(max-width: 768px) 100vw"
              className="rounded-xl object-contain"
            />
          </div>
        </SwiperSlide>
      ))}
      <NextBtn key="next-btn" />
      <PrevBtn key="prev-btn" />
    </Swiper>
  );
}

export default ModalCardSlider;
