'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Avatar, Title, Text, Button } from 'rizzui';
import cn from '@/utils/class-names';
import logoImg from '@public/logo-short.svg';
import starImg from '@public/auth/star.svg';
import { usePathname } from 'next/navigation';
import { routes } from '@/config/routes';
import ArrowShape from '@/components/shape/arrow';
import OrSeparation from './or-separation';
import {
  PiAppleLogoFill,
  PiArrowLeftBold,
  PiDribbbleLogo,
  PiFacebookLogo,
  PiInstagramLogo,
  PiLinkedinLogo,
  PiTwitterLogo,
  PiArrowLineRight,
  PiUserCirclePlus,
  PiWhatsappLogo,
  PiTiktokLogo,
} from 'react-icons/pi';
import { FcGoogle } from 'react-icons/fc';

export default function AuthWrapperTwo({
  children,
  title,
}: {
  children: React.ReactNode;
  title: React.ReactNode;
}) {
  return (
    <div className="min-h-screen items-center justify-center xl:flex xl:bg-gray-50 xl:px-5 2xl:px-8 2xl:py-28">
      <div className="mx-auto w-full py-2 xl:py-14 2xl:w-[1720px]">
        <div className="rounded-xl bg-white dark:bg-transparent xl:flex dark:xl:bg-gray-100/50">
          <IntroBannerBlock />
          <div className="flex w-full items-center px-4 xl:px-0">
            <div className="mx-auto w-full max-w-sm shrink-0 py-16 md:max-w-md xl:px-8 xl:py-10 2xl:max-w-xl 2xl:py-14 3xl:py-20">
              <Image
                src={logoImg}
                alt="Real Smile Logo"
                width={350}
                height={350}
                className="mx-auto mb-8"
              />
              <Title
                as="h2"
                className="mb-6 text-center text-[26px] font-bold leading-snug md:!leading-normal xl:mb-8 xl:text-start xl:text-3xl xl:text-[28px] 2xl:-mt-1 2xl:text-4xl"
              >
                {title}
              </Title>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IntroBannerBlock() {
  return (
    <div className="relative hidden w-[calc(50%-50px)] shrink-0 rounded-lg xl:-my-9 xl:block xl:w-[calc(50%-20px)] 2xl:-my-12 3xl:-my-14">
      <div className="absolute mx-auto h-full w-full overflow-hidden rounded-lg before:absolute before:start-0 before:top-0 before:z-10 before:h-full before:w-full before:bg-[#CA8A04]/80 before:content-['']">
        <Image
          fill
          priority
          src="https://storage.googleapis.com/realsmilefiles/staticFolder/frontPage.jpeg"
          alt="Sign Up Thumbnail"
          sizes="(max-width: 768px) 100vw"
          className="object-cover"
        />
      </div>
      <div className="relative z-20 flex h-full flex-col justify-between px-10 py-24 xl:px-16 xl:py-28 2xl:px-24">
        <div className="text-white">
          <div className="inline-flex max-w-[120px]">
            <Image src={starImg} alt="Star" />
          </div>
          <Title
            as="h2"
            className="mb-5 pt-3.5 text-[26px] font-semibold leading-snug text-white md:text-3xl md:!leading-normal xl:mb-7 xl:text-4xl xl:text-[28px] xl:leading-snug 2xl:text-5xl 2xl:leading-snug"
          >
            Offrez à vos patients le sourire de leurs rêves avec facilité et
            assurance.
          </Title>
          <Text className="mb-5 text-base leading-loose xl:mb-7 2xl:pe-20">
            Choisissez Real Smile, où l'innovation rencontre l'accessibilité
            pour transformer les soins dentaires. Real Smile enrichit votre
            cabinet avec une technologies de pointe, garantissant des
            interventions précises et des résultats exceptionnels, tout en
            restant abordables.
          </Text>

          <JoinedMember />
        </div>

        <SocialLinks />
      </div>
    </div>
  );
}

const socialLinks = [
  {
    title: 'Facebook',
    link: 'https://www.facebook.com/RealSmileAligner',
    icon: <PiFacebookLogo className="h-auto w-4" />,
  },
  {
    title: 'Whatsapp',
    link: 'https://wa.me/+33146514146',
    icon: <PiWhatsappLogo className="h-auto w-4" />,
  },
  {
    title: 'Instagram',
    link: 'https://www.instagram.com/realsmilealignerparis/',
    icon: <PiInstagramLogo className="h-auto w-4" />,
  },
  {
    title: 'Linkedin',
    link: 'https://www.linkedin.com/company/realsmile/',
    icon: <PiLinkedinLogo className="h-auto w-4" />,
  },
  {
    title: 'TikTok',
    link: 'https://www.tiktok.com/@realsmile.fr',
    icon: <PiTiktokLogo className="h-auto w-4" />,
  },
];
function SocialLinks() {
  return (
    <div className="-mx-2 flex items-center pt-24 text-white xl:-mx-2.5 2xl:pb-5 2xl:pt-40 [&>a>svg]:w-5 xl:[&>a>svg]:w-6">
      {socialLinks.map((item) => (
        <a
          key={item.title}
          href={item.link}
          title={item.title}
          target="_blank"
          className="mx-2 transition-opacity hover:opacity-80 xl:mx-2.5"
        >
          {item.icon}
        </a>
      ))}
    </div>
  );
}

const members = [
  'https://randomuser.me/api/portraits/women/40.jpg',
  'https://randomuser.me/api/portraits/women/41.jpg',
  'https://randomuser.me/api/portraits/women/42.jpg',
  'https://randomuser.me/api/portraits/women/43.jpg',
  'https://randomuser.me/api/portraits/women/44.jpg',
];
function JoinedMember() {
  return (
    <div className="flex items-center">
      <div className="mx-0.5">
        {members.map((member) => (
          <Avatar
            key={member}
            src={member}
            name="avatar"
            className="relative -mx-0.5 inline-flex object-cover ring-2 ring-gray-0"
          />
        ))}
      </div>
      <div className="relative inline-flex items-center justify-center px-3 text-xs font-semibold">
        +10K Patient·e·s satisfait·e·s
      </div>
      <ArrowShape className="h-11 w-10 text-white" />
    </div>
  );
}
