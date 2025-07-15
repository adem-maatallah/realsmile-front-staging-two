import {
  PiFacebookLogo,
  PiFacebookLogoFill,
  PiInstagramLogo,
  PiInstagramLogoFill,
  PiLinkedinLogo,
  PiTiktokLogo,
  PiTwitterLogoFill,
  PiWhatsappLogo,
  PiYoutubeLogoFill,
} from 'react-icons/pi';

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

export default function SocialItems() {
  return (
    <div className="mt-8 flex items-center justify-center gap-6 py-6 md:mt-10 lg:mt-0 xl:py-8">
      {socialLinks.map((item) => (
        <a
          key={item.title}
          href={item.link}
          rel="norefferer"
          target="_blank"
          className="social-btn-shadow inline-block rounded-full bg-white p-3 text-gray-500 transition-all duration-300 hover:text-gray-1000 dark:bg-gray-100 dark:text-gray-700 dark:hover:text-gray-1000"
        >
          {item.icon}
        </a>
      ))}
    </div>
  );
}
