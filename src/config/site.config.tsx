import { Metadata } from 'next';
import logoImg from '@public/logo.svg';
import { LAYOUT_OPTIONS } from '@/config/enums';
import logoIconImg from '@public/logo-short.svg';
import { OpenGraph } from 'next/dist/lib/metadata/types/opengraph-types';
import { DEFAULT_PRESET_COLOR_NAME } from '@/config/color-presets';

enum MODE {
  DARK = 'dark',
  LIGHT = 'light',
}

export const siteConfig = {
  title: 'RealSmile',
  description: `RealSmile aligner.`,
  logo: logoImg,
  icon: logoIconImg,
  mode: MODE.LIGHT,
  layout: LAYOUT_OPTIONS.HYDROGEN,
  color: DEFAULT_PRESET_COLOR_NAME,
  // TODO: favicon
};

export const metaObject = (
  title?: string,
  openGraph?: OpenGraph,
  description: string = siteConfig.description
): Metadata => {
  return {
    title: title ? `${title} - RealSmile` : siteConfig.title,
    description,
    openGraph: openGraph ?? {
      title: title ? `${title} - RealSmile` : title,
      description,
      url: 'https://realsmile.app',
      siteName: 'RealSmile', // https://developers.google.com/search/docs/appearance/site-names
      images: {
        url: '/logo-short.svg',
        width: 1200,
        height: 630,
      },
      locale: 'fr_FR',
      type: 'website',
    },
  };
};
