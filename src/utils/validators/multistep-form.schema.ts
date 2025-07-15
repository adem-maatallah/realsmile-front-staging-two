import { z } from 'zod';
import { messages } from '@/config/messages';
import { fileSchema } from '@/utils/validators/common-rules';

// step 2
export const propertyTypeSchema = z.object({
  propertyType: z.string().min(1, messages.propertyTypeIsRequired),
});

// generate form types from zod validation schema
export type PropertyTypeSchema = z.infer<typeof propertyTypeSchema>;

// step 3
export const placeTypeSchema = z.object({
  placeType: z.string().min(1, messages.placeTypeIsRequired),
});

export type PlaceTypeSchema = z.infer<typeof placeTypeSchema>;

// step 4
export const locationSchema = z.object({
  address: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export type LocationSchema = z.infer<typeof locationSchema>;

// Schema for Step 1
const customDate = z.preprocess(
  (arg) => {
    if (typeof arg === 'string' || arg instanceof Date) {
      const date = new Date(arg);
      if (isNaN(date.getTime())) {
        return undefined;
      }
      return date;
    }
    return undefined;
  },
  z
    .date({ required_error: 'Date de naissance est requise' })
    .nullable()
    .refine((val) => val !== null, {
      message: 'Date de naissance est requise',
    })
);

export const formStep1Schema = z.object({
  firstName: z.string().min(1, 'Prénom est requis'),
  lastName: z.string().min(1, 'Nom de famille est requis'),
  caseId: z.any(),
  dateDeNaissance: customDate,
  sexe: z.string().min(1, 'Sélection du sexe est requis'),
});

export type FormStep1Schema = z.infer<typeof formStep1Schema>;

function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

// Schema for Step 2
export const formStep2Schema = z.object({
  photos: z.array(z.string().optional()).superRefine((photos, ctx) => {
    if (!photos[0] || !isValidUrl(photos[0])) {
      ctx.addIssue({
        path: [0],
        message: messages.photoRequired,
        code: z.ZodIssueCode.custom,
      });
    }
    if (!photos[2] || !isValidUrl(photos[2])) {
      ctx.addIssue({
        path: [2],
        message: messages.photoRequired,
        code: z.ZodIssueCode.custom,
      });
    }
  }),
});
export type FormStep2Schema = z.infer<typeof formStep2Schema>;

export const formStep3Schema = z.object({
  photosRadio: z.array(z.string().optional()), // Photos are optional
  stls: z.array(z.string()).superRefine((stl, ctx) => {
    // Validate the first STL file
    if (!stl[0] || !isValidUrl(stl[0])) {
      ctx.addIssue({
        path: [0],
        message:
          'Le premier fichier STL est requis et doit être une URL valide.',
        code: z.ZodIssueCode.custom,
      });
    }
    // Validate the second STL file
    if (!stl[1] || !isValidUrl(stl[1])) {
      ctx.addIssue({
        path: [1],
        message:
          'Le deuxième fichier STL est requis et doit être une URL valide.',
        code: z.ZodIssueCode.custom,
      });
    }
  }),
});

export type FormStep3Schema = z.infer<typeof formStep3Schema>;

// Schema for Step 4
export const formStep4Schema = z
  .object({
    personalizedPlan: z.enum(['self_managed', 'personalized']),
    archSelection: z.string().optional(),
    generalInstructions: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.personalizedPlan === 'personalized') {
        return data.archSelection && data.generalInstructions;
      }
      return true;
    },
    {
      message:
        'Architecture selection and general instructions are required for personalized plans',
      path: ['archSelection', 'generalInstructions'], // Apply the message to both fields
    }
  );

export type FormStep4Schema = z.infer<typeof formStep4Schema>;

// Schema for Step 5
export const formStep5Schema = z.object({
  selectionArcades: z.enum(['both', 'maxillaire', 'mandibulaire']),
  sensTransversal: z.enum([
    'pasAnomalie',
    'endoalveolie',
    'inversionPostérieure',
  ]),
  sensVertical: z.enum(['pasAnomalie', 'supraclusion', 'beance']),
  actionAnomalie: z.any().optional(),
  zoneCorrectionSupraclusion: z.any().optional(),
  zoneCorrectionBeance: z.any().optional(),
  posteriorOption: z.any().optional(),
  actionAnomalieVertical: z.any().optional(),
  actionAnomaliePosterior: z.any().optional(),
  optionsMaxillaires: z.any().optional(),
  optionsMandibulaires: z.any().optional(),
});
export type FormStep5Schema = z.infer<typeof formStep5Schema>;

// Schema for Step 6
export const formStep6Schema = z.object({
  canineRight: z.string().optional(),
  molarRight: z.string().optional(),
  canineLeft: z.string().optional(),
  molarLeft: z.string().optional(),
  sagittalCorrection: z.string().optional(),
  overjet: z.string().optional(),
  orthodonticProcedures: z.array(z.string()).optional(),
  correctionOptionsCI2: z.any().optional(),
  correctionOptionsCI3: z.any().optional(),
  teethToExtractCL2: z.any().optional(),
  teethToExtractCL3: z.any().optional(),
  encroachmentMaxillary: z.string().optional(),
  encroachmentMandibular: z.string().optional(),
  transversalExpansionMaxillary: z.string().optional(),
  transversalExpansionMandibular: z.string().optional(),
  sagittalExpansionMaxillary: z.string().optional(),
  sagittalExpansionMandibular: z.string().optional(),
  interproximalReductionMaxillary: z.string().optional(),
  interproximalReductionMandibular: z.string().optional(),
  diastemaManagement: z.string().optional(),
  residualSpaceManagement: z.string().optional(),
  teethToReplace: z.string().optional(),
});
export type FormStep6Schema = z.infer<typeof formStep6Schema>;

// Schema for Step 7
export const formStep7Schema = z.object({
  interIncisivePosition: z.string().nonempty(),
  moveSuperieur: z.string().optional(),
  moveInferieur: z.string().optional(),
  tacksNeeded: z.string().nonempty(),
  specificTeeth: z.string().optional(),
  generalInstructions: z.any().optional(),
});
export type FormStep7Schema = z.infer<typeof formStep7Schema>;
