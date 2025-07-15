'use client';

import {Title, Text, Button, Badge} from 'rizzui';
import cn from '@/utils/class-names';
import DocIcon from '@/components/icons/doc-solid';
import ImageIcon from '@/components/icons/image-solid';
import MusicIcon from '@/components/icons/music-solid';
import VideoIcon from '@/components/icons/video-solid';
import DriveIcon from '@/components/icons/drive-solid';
import {useScrollableSlider} from '@/hooks/use-scrollable-slider';
import {PiCaretLeftBold, PiCaretRightBold} from 'react-icons/pi';
import MetricCard from '@/components/cards/metric-card';
import CircleProgressBar from '@/components/charts/circle-progressbar';
import PDFIcon from "@/components/icons/pdf-solid";
import {AiFillFileZip} from "react-icons/ai";
import {useEffect, useState} from "react";
import {SkeletonGeneral} from "@/components/ui/skeleton-general";

type FileStatsType = {
    className?: string;
};


// @md:grid-cols-2 @2xl:grid-cols-3 @3xl:grid-cols-4 @7xl:grid-cols-5
export default function CaseFileStats({className, imagesLen, stsLen, lateTime, remainingTime, isLate,isRequired ,isLoading}: any) {
    const {
        sliderEl,
        sliderPrevBtn,
        sliderNextBtn,
        scrollToTheRight,
        scrollToTheLeft,
    } = useScrollableSlider();

    const filesStatData = [

        {
            id: 1,
            title: 'Images',
            metric: imagesLen,
            fileType: '10 Images',
            icon: <ImageIcon className="h-10 w-10"/>,
            fill: '#18e616',
            percentage: (imagesLen / 10) * 100,

        },
        {
            id: 2,
            title: 'Stls',
            metric: stsLen,
            fileType: '3 STLS',
            icon: <DocIcon className="h-10 w-10"/>,
            fill: '#6d98ff',
            percentage: (stsLen / 3) * 100,
        },
        {
            id: 3,
            title: 'Pdf',
            metric: '1',
            fileType: '1 PDF',
            icon: <PDFIcon className="h-10 w-10"/>,
            fill: '#fb3b3b',
            percentage: (1 / 1) * 100,
        },
    ];


    const CountdownRenderer = ({ isLate, lateTime, remainingTime, isRequired }: any) => {
        const badgeStyle = {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        };

        // Initial state for showing `00h 00m 00s`
        const [countdown, setCountdown] = useState(0);
        const [showInitial, setShowInitial] = useState(true);

        const actualCountdown = isRequired === "Done" ? 0 : (isLate ? lateTime : remainingTime);

        useEffect(() => {
            let interval: NodeJS.Timeout | undefined;
            let timeout: NodeJS.Timeout | undefined;

            // Show `00h 00m 00s` for the initial second
            if (showInitial) {
                timeout = setTimeout(() => {
                    setShowInitial(false);
                    setCountdown(actualCountdown);
                }, 1000);
            } else if (isRequired === "Done") {
                // Stop the interval if it's marked as "Done"
                setCountdown(0);
            } else {
                // Set up the countdown interval
                interval = setInterval(() => {
                    setCountdown((prevCountdown: number) => {
                        if (isLate) {
                            return prevCountdown + 1; // Increment if it's late
                        } else {
                            return Math.max(0, prevCountdown - 1); // Decrement and prevent negative values
                        }
                    });
                }, 1000);
            }

            return () => {
                if (interval) clearInterval(interval);
                if (timeout) clearTimeout(timeout);
            };
        }, [actualCountdown, isLate, isRequired, showInitial]);

        // Convert countdown seconds into hours, minutes, and seconds
        const hours = Math.floor(countdown / 3600);
        const minutes = Math.floor((countdown % 3600) / 60);
        const seconds = countdown % 60;

        // Determine the badge's color: green (success) for "Done," or red (danger) if late
        const badgeColor = isRequired === "Done" ? 'success' : (isLate ? 'danger' : 'success');

        return (
            // @ts-ignore
            <Badge color={badgeColor} variant="outline" style={badgeStyle}
                   className="min-w-[292px] max-w-full flex-row-reverse text-2xl">
                {`${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`}
            </Badge>
        );
    };

    return (
        <div
            className={cn(
                'relative flex w-auto items-center overflow-hidden',
                className
            )}
        >
            <Button
                title="Prev"
                variant="text"
                ref={sliderPrevBtn}
                onClick={() => scrollToTheLeft()}
                className="!absolute left-0 top-0 z-10 !h-full w-8 !justify-start rounded-none bg-gradient-to-r from-white via-white to-transparent px-0  text-gray-500 hover:text-black 3xl:hidden dark:from-gray-50/80 dark:via-gray-50/80"
            >
                <PiCaretLeftBold className="h-5 w-5"/>
            </Button>
            <div className="w-full overflow-hidden">
                <div
                    ref={sliderEl}
                    className="custom-scrollbar-x grid grid-flow-col gap-5 overflow-x-auto scroll-smooth"
                >
                    {filesStatData.map((stat: any) => {
                        return (
                            <MetricCard
                                key={stat.id}
                                title=""
                                metric=""
                                className="min-w-[292px] max-w-full flex-row-reverse"
                            >
                                <div className="flex items-center justify-start gap-5">
                                    <div className="w-14">
                                        <CircleProgressBar
                                            percentage={stat.percentage}
                                            size={80}
                                            stroke="#D7E3FE"
                                            strokeWidth={5}
                                            progressColor={stat.fill}
                                            useParentResponsive={true}
                                            label={stat.icon}
                                            strokeClassName="dark:stroke-gray-300"
                                        />
                                    </div>
                                    <div className="">
                                        <Text className="mb-1 text-sm font-medium text-gray-500">
                                            {stat.title}
                                        </Text>
                                        <Title
                                            as="h4"
                                            className="mb-1 text-xl font-semibold text-gray-900"
                                        >
                                            {stat.metric}
                                            <span className="inline-block text-sm font-normal text-gray-500">
                                              &nbsp;of {stat.fileType}
                                            </span>
                                        </Title>
                                    </div>
                                </div>
                            </MetricCard>
                        );
                    })}
                </div>
                {/* Below the mapped components, add a simple span with the text "hello" */}
                <div className="flex justify-center mt-12">
                    {isLoading ? (
                        // Skeleton for CountdownRenderer placeholder
                        <SkeletonGeneral className="h-8 w-48 rounded-lg"/>
                    ) : (
                        <CountdownRenderer isLate={isLate} lateTime={lateTime} remainingTime={remainingTime}/>
                    )}
                </div>

            </div>
            <Button
                title="Next"
                variant="text"
                ref={sliderNextBtn}
                onClick={() => scrollToTheRight()}
                className="!absolute right-0 top-0 z-10 !h-full w-8 !justify-end rounded-none bg-gradient-to-l from-white via-white to-transparent px-0  text-gray-500 hover:text-black 3xl:hidden dark:from-gray-50/80 dark:via-gray-50/80"
            >
                <PiCaretRightBold className="h-5 w-5"/>
            </Button>
        </div>
    );
}
