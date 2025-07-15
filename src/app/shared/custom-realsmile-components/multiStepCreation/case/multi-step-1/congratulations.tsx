'use client';

import Image from 'next/image';
import Confetti from 'react-confetti';
import realSmileLogo from '@public/logo-short.svg';
import { useElementSize } from '@/hooks/use-element-size';

export default function Congratulations() {
  const [ref, { width, height }] = useElementSize();
  return (
    <>
      <div ref={ref} className="col-span-full grid place-content-center   ">
        <figure className="relative mx-auto grid place-content-center">
          <Image
            src={realSmileLogo}
            alt="congratulation image"
            priority
            className="mx-auto object-contain"
          />
          <figcaption className="mx-auto max-w-lg text-center">
            <h2 className="text-2xl text-black @7xl:text-3xl @[113rem]:text-4xl">
              {/* eslint-disable-next-line react/no-unescaped-entities */}
              Félicitations pour l'ajout de votre patient!{' '}
            </h2>
            <p className="mt-6 text-base text-black">
              Nous vous remercions de nous confier votre bien-être.
              Préparez-vous à vivre une expérience enrichie, avec de nouveaux
              avantages et une plus grande facilité dans la gestion de votre
              santé.
            </p>
          </figcaption>
        </figure>
        <Confetti className="!fixed mx-auto" width={width} height={height} />
      </div>
    </>
  );
}
