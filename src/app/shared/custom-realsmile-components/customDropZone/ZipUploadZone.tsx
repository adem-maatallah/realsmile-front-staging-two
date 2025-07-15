'use client';

import Image from 'next/image';
import toast from 'react-hot-toast';
import isEmpty from 'lodash/isEmpty';
import prettyBytes from 'pretty-bytes';
import {useCallback, useState} from 'react';
import {useDropzone} from '@uploadthing/react/hooks';
import {PiCheckBold, PiTrashBold, PiUploadSimpleBold} from 'react-icons/pi';
import {generateClientDropzoneAccept} from 'uploadthing/client';
import {useUploadThing} from '@/utils/uploadthing';
import {Button, Text, FieldError} from 'rizzui';
import cn from '@/utils/class-names';
import UploadIcon from '@/components/shape/upload';
import {endsWith} from 'lodash';
import {FileWithPath} from 'react-dropzone';
import {ClientUploadedFileData} from 'uploadthing/types';
import axios from 'axios';

interface UploadZoneProps {
    label?: string;
    name: string;
    getValues: any;
    setValue: any;
    caseId: string;
    className?: string;
    error?: string;
}

interface FileType {
    name: string;
    url: string;
    size: number;
}

export default function ZipUploadZone({
                                          label,
                                          name,
                                          className,
                                          getValues,
                                          setValue,
                                          caseId,
                                          error,
                                      }: UploadZoneProps) {
    const [files, setFiles] = useState<File[]>([]);

    const onDrop = useCallback(
        (acceptedFiles: FileWithPath[]) => {
            console.log('acceptedFiles', acceptedFiles);
            setFiles([
                ...acceptedFiles.map((file) =>
                    Object.assign(file, {
                        preview: URL.createObjectURL(file),
                    })
                ),
            ]);
        },
        [files]
    );

    function handleRemoveFile(index: number) {
        const updatedFiles = [...files];
        updatedFiles.splice(index, 1);
        setFiles(updatedFiles);
    }

    const uploadedItems = isEmpty(getValues(name)) ? [] : getValues(name);
    const notUploadedItems = files.filter(
        (file) => !uploadedItems?.some((uploadedFile: FileType) => uploadedFile.name === file.name)
    );

    const {startUpload, permittedFileInfo, isUploading} = useUploadThing(
        'generalMedia',
        {
            onClientUploadComplete: async (res: ClientUploadedFileData<any>[] | undefined) => {
                console.log('res', res);
                if (setValue) {
                    const respondedUrls = res?.map((r) => ({
                        name: r.name,
                        size: r.size,
                        url: r.url,
                    }));
                    setFiles([]);
                    setValue(name, respondedUrls);

                    // Call the API to create a case with the uploaded zip file
                    if (respondedUrls?.length) {
                        const zipUrl = respondedUrls[0].url;
                        try {
                            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
                            const endpoint = `/cases/createCaseInConstructionFile`;
                            const url = `${apiUrl}${endpoint}`;

                            const response = await axios.post(url, {
                                caseId,
                                zipUrl,
                            });
                            window.location.reload();
                            toast.success(response.data.message);
                        } catch (error) {
                            console.error('Error adding zip to construction file:', error);
                            toast.error('Failed to add zip file to construction case');
                        }
                    }
                }
            },
            onUploadError: (error: Error) => {
                console.error(error);
                toast.error(error.message);
            },
        }
    );

    const {getRootProps, getInputProps} = useDropzone({
        onDrop,
        accept: {
            'application/zip': ['.zip'],
        },
    });

    return (
        <div className={cn('grid @container', className)}>
            {label && (
                <span className="mb-1.5 block font-semibold text-gray-900">
                    {label}
                </span>
            )}
            <div
                className={cn(
                    'rounded-md border-[1.8px]',
                    !isEmpty(files) &&
                    'flex flex-wrap items-center justify-between @xl:flex-nowrap @xl:pr-6'
                )}
            >
                <div
                    {...getRootProps()}
                    className={cn(
                        'flex cursor-pointer items-center gap-4 px-6 py-5 transition-all duration-300',
                        isEmpty(files)
                            ? 'justify-center'
                            : 'flex-grow justify-center @xl:justify-start'
                    )}
                >
                    <input {...getInputProps()} />
                    <UploadIcon className="h-12 w-12"/>
                    <Text className="text-base font-medium">Drop or select file</Text>
                </div>

                {!isEmpty(files) && (
                    <UploadButtons
                        files={files}
                        isLoading={isUploading}
                        onClear={() => setFiles([])}
                        onUpload={() => startUpload(notUploadedItems)}
                    />
                )}
            </div>

            {!isEmpty(uploadedItems) && (
                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-[repeat(auto-fit,_minmax(140px,_1fr))]">
                    {uploadedItems.map((file: any, index: number) => (
                        <div key={index} className={cn('relative')}>
                            <figure className="group relative h-40 rounded-md bg-gray-50">
                                <MediaPreview name={file.name} url={file.url}/>
                                <button
                                    type="button"
                                    className="absolute right-0 top-0 rounded-full bg-gray-700 p-1.5 transition duration-300"
                                >
                                    <PiCheckBold className="text-white"/>
                                </button>
                            </figure>
                            <MediaCaption name={file.name} size={file.size}/>
                        </div>
                    ))}
                </div>
            )}

            {error && <FieldError error={error}/>}
        </div>
    );
}

function UploadButtons({
                           files,
                           onClear,
                           onUpload,
                           isLoading,
                       }: {
    files: any[];
    isLoading: boolean;
    onClear: () => void;
    onUpload: () => void;
}) {
    return (
        <div
            className="flex w-full flex-wrap items-center justify-center gap-4 px-6 pb-5 @sm:flex-nowrap @xl:w-auto @xl:justify-end @xl:px-0 @xl:pb-0"
        >
            <Button
                variant="outline"
                className="w-full gap-2 @xl:w-auto"
                isLoading={isLoading}
                onClick={onClear}
            >
                <PiTrashBold/>
                Clear {files.length} files
            </Button>
            <Button
                className="w-full gap-2 @xl:w-auto"
                isLoading={isLoading}
                onClick={onUpload}
            >
                <PiUploadSimpleBold/> Upload {files.length} files
            </Button>
        </div>
    );
}

function MediaPreview({name, url}: { name: string; url: string }) {
    return endsWith(name, '.pdf') ? (
        <object data={url} type="application/pdf" width="100%" height="100%">
            <p>
                Alternative text - include a link <a href={url}>to the PDF!</a>
            </p>
        </object>
    ) : (
        <Image
            fill
            src={url}
            alt={name}
            className="transform rounded-md object-contain"
        />
    );
}

function MediaCaption({name, size}: { name: string; size: number }) {
    return (
        <div className="mt-1 text-xs">
            <p className="break-words font-medium text-gray-700">{name}</p>
            <p className="mt-1 font-mono">{prettyBytes(size)}</p>
        </div>
    );
}
