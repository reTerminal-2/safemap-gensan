import { z } from 'zod'

// Step 1: Incident basics
export const incidentStep1Schema = z.object({
    type: z.enum([
        'theft', 'robbery', 'assault', 'homicide',
        'drug_related', 'vandalism', 'snatching',
        'cybercrime', 'domestic_violence', 'other'
    ], { message: 'Please select an incident type' }),
    severity: z.enum(['low', 'medium', 'high', 'critical'], {
        message: 'Please select severity level'
    }),
    barangay_id: z.string({ message: 'Please select a barangay' }).min(1),
    date_occurred: z.string({ message: 'Date of incident is required' }).min(1),
    title: z.string().min(5, 'Title must be at least 5 characters').max(100),
})

// Step 2: Location & description
export const incidentStep2Schema = z.object({
    description: z.string()
        .min(20, 'Please provide at least 20 characters of detail')
        .max(2000),
    address: z.string().min(5, 'Please enter the street address').max(200),
    landmark: z.string().max(100).optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
})

// Step 3: Additional info
export const incidentStep3Schema = z.object({
    suspect_description: z.string().max(500).optional(),
    witness_count: z.coerce.number().min(0).max(99).default(0),
    is_anonymous: z.boolean().default(false),
    verification_status: z.enum(['unverified', 'pending_review', 'verified', 'dismissed']).default('pending_review'),
    photo_urls: z.array(z.string().url()).max(5).default([]),
})

// Full combined schema
export const incidentReportSchema = incidentStep1Schema
    .merge(incidentStep2Schema)
    .merge(incidentStep3Schema)

export type IncidentStep1 = z.infer<typeof incidentStep1Schema>
export type IncidentStep2 = z.infer<typeof incidentStep2Schema>
export type IncidentStep3 = z.infer<typeof incidentStep3Schema>
export type IncidentReportForm = z.infer<typeof incidentReportSchema>

// ─── Auth Schemas ─────────────────────────────────────────────────────────────

export const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type LoginForm = z.infer<typeof loginSchema>
