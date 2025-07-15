import { createUploadthing, type FileRouter } from 'uploadthing/next';

const f = createUploadthing();

const auth = (req: Request) => ({ id: 'fakeId' }); // Replace with your actual auth logic

export const ourFileRouter = {
    avatar: f({ image: { maxFileSize: '4MB' } })
        .middleware(({ req }) => auth(req))
        .onUploadComplete((data) => console.log('Avatar file uploaded:', data)),

    generalMedia: f({
        'application/pdf': { maxFileSize: '4MB', maxFileCount: 4 },
        image: { maxFileSize: '2MB', maxFileCount: 4 },
        video: { maxFileSize: '256MB', maxFileCount: 1 },
        'application/zip': { maxFileSize: '1GB', maxFileCount: 1 }, // ZIP support
    })
        .middleware(({ req }) => auth(req))
        .onUploadComplete((data) => console.log('General media file uploaded:', data)),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
