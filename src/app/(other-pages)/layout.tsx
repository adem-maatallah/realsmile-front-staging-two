'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from 'rizzui';
import cn from '@/utils/class-names';
import SocialItems from '@/components/ui/social-shares';
import { usePathname, useRouter } from 'next/navigation';
import { siteConfig } from '@/config/site.config';
import { routes } from '@/config/routes';
import React, { useState, useEffect } from 'react';
export const DEFAULT_PRESET_COLORS = {
    lighter: '#fef9c3', // Yellow 100
    light: '#d39424', // Yellow 300
    default: '#d39424', // <-- UPDATED: Your new specific yellow
    dark: '#a16207', // Yellow 800
    foreground: '#ffffff',
};
import { FaSignInAlt } from 'react-icons/fa';

const ignoreSignInButtonRoutes = [
    routes.auth.signIn,
    routes.auth.signUp,
    routes.accessDenied,
    routes.notFound,
    routes.verifyLocation,
];

export default function OtherPagesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { push } = useRouter();
    const pathName = usePathname();

    const [showHeader, setShowHeader] = useState(false);
    const scrollThreshold = 100;

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > scrollThreshold) {
                setShowHeader(true);
            } else {
                setShowHeader(false);
            }
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('scroll', handleScroll);
            // Initial check in case the page loads scrolled
            handleScroll();
            return () => window.removeEventListener('scroll', handleScroll);
        }
    }, [scrollThreshold]);

    const shouldShowSignInButton = !ignoreSignInButtonRoutes.includes(pathName);

    return (
        <div
            className="flex min-h-screen flex-col bg-white"
        >
            {/* Header: Fixed, animated to appear on scroll */}
            <header
                className={cn(
                    "fixed top-0 left-0 w-full z-50 transition-all duration-300 transform",
                    showHeader ? "translate-y-0 opacity-100 bg-primary-foreground bg-opacity-95 shadow-lg" : "-translate-y-full opacity-0",
                    "px-6 py-5 md:px-10 md:py-6 lg:px-12 lg:py-7 backdrop-blur-sm" // Added backdrop-blur for a modern feel
                )}
                style={{
                    backgroundColor: showHeader ? 'rgba(255, 255, 255, 0.95)' : 'transparent', // Make header translucent when visible
                }}
            >
                <div className="mx-auto flex max-w-[1520px] items-center justify-between">
                    <Link href={routes.home} className="flex items-center" aria-label={siteConfig.title}>
                        <Image
                            src={siteConfig.logo}
                            alt={siteConfig.title}
                            width={siteConfig.logoWidth ? siteConfig.logoWidth * 2.5 : 250}
                            height={siteConfig.logoHeight ? siteConfig.logoHeight * 2.5 : 75}
                            className="dark:invert h-auto"
                            priority
                        />
                    </Link>

                    <nav className="flex items-center gap-4">
                        {shouldShowSignInButton && (
                            <Button
                                variant="solid"
                                size="sm"
                                className="h-10 px-5 text-base font-semibold rounded-full md:h-11 md:px-6 md:text-lg focus:ring-2 focus:ring-offset-2" // Added focus ring
                                style={{
                                    backgroundColor: DEFAULT_PRESET_COLORS.default,
                                    color: DEFAULT_PRESET_COLORS.foreground,
                                    borderColor: DEFAULT_PRESET_COLORS.dark,
                                    boxShadow: `0 2px 4px ${DEFAULT_PRESET_COLORS.light}` // Subtle shadow for depth
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = DEFAULT_PRESET_COLORS.dark}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = DEFAULT_PRESET_COLORS.default}
                                onClick={() => push(routes.auth.signIn)} // Changed to routes.auth.signIn for consistency
                            >
                                <FaSignInAlt className="mr-2 h-4 w-4" /> Sign In
                            </Button>
                        )}
                    </nav>
                </div>
            </header>

            {/* Main content area with background gradient and pattern */}
            <div
                className="relative w-full min-h-screen flex flex-col items-center justify-center text-center overflow-hidden pt-[var(--header-height, 0px)]"
                style={{
                    background: `linear-gradient(135deg, ${DEFAULT_PRESET_COLORS.lighter} 0%, ${DEFAULT_PRESET_COLORS.light} 100%)`, // Adjusted gradient for smoother transition
                    '--header-height': showHeader ? '100px' : '0px',
                    paddingTop: showHeader ? 'calc(100px + 2rem)' : '2rem' // Add padding-top when header is visible to prevent content overlap
                } as React.CSSProperties}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20 z-10"></div>
                <div className="absolute inset-0 opacity-10 bg-[url('/assets/grid-pattern.svg')] bg-repeat bg-center z-0"></div>

                <div className="relative z-20 max-w-4xl mx-auto px-6 py-12">
                    <Image
                        src={siteConfig.logo}
                        alt={siteConfig.title}
                        width={350}
                        height={105}
                        className="dark:invert mb-8 drop-shadow-lg"
                        priority
                    />
                    <h1
                        className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight drop-shadow-xl"
                        style={{
                            color: DEFAULT_PRESET_COLORS.foreground,
                            textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                        }}
                    >
                        Your Health, <span style={{ color: DEFAULT_PRESET_COLORS.lighter }}>Simplified.</span>
                    </h1>
                    <p
                        className="text-lg md:text-2xl mb-10 leading-relaxed max-w-2xl mx-auto drop-shadow-md"
                        style={{ color: DEFAULT_PRESET_COLORS.foreground }}
                    >
                        Discover and connect with top healthcare professionals near you with unparalleled ease.
                        Expert care is just a click away.
                    </p>
                    <Button
                        variant="solid"
                        size="lg"
                        className="px-8 py-3 text-xl font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:ring-2 focus:ring-offset-2" // Added focus ring
                        style={{
                            backgroundColor: DEFAULT_PRESET_COLORS.foreground,
                            color: DEFAULT_PRESET_COLORS.default,
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = DEFAULT_PRESET_COLORS.lighter;
                            e.currentTarget.style.color = DEFAULT_PRESET_COLORS.dark;
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = DEFAULT_PRESET_COLORS.foreground;
                            e.currentTarget.style.color = DEFAULT_PRESET_COLORS.default;
                        }}
                        onClick={() => push(routes.auth.signIn)} // Changed to routes.auth.signIn for consistency
                    >
                        Get Started Now
                    </Button>
                </div>
            </div>

            <main className="flex-grow flex flex-col justify-center items-center py-10 md:py-16 px-4">
                {children}
            </main>

            <footer
                className="w-full py-8 px-4 border-t border-gray-200 text-center text-sm"
                style={{
                    backgroundColor: DEFAULT_PRESET_COLORS.default,
                    color: DEFAULT_PRESET_COLORS.foreground,
                    borderColor: DEFAULT_PRESET_COLORS.dark,
                }}
            >
                <div className="max-w-[1520px] mx-auto flex flex-col sm:flex-row justify-between items-center">
                    <p>© {new Date().getFullYear()} {siteConfig.title}. All rights reserved.</p>
                    <SocialItems className="mt-4 sm:mt-0" />
                </div>
            </footer>
        </div>
    );
}