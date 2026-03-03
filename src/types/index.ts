// ─── User & Authentication ────────────────────────────────────────────────────

export type UserRole = 'pnp_officer' | 'dilg_admin' | 'barangay_official' | 'public';

export interface User {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
    badge_number?: string;        // PNP officers only
    station?: string;             // PNP officers only
    department?: string;          // DILG/LGU admins only
    barangay_id?: string;         // Barangay officials only
    avatar_url?: string;
    is_verified: boolean;
    created_at: string;
    updated_at: string;
}

export interface MapAlert {
    id: string;
    type: IncidentType;
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    severity: SeverityLevel;
    created_at: string;
    expires_at?: string;
    created_by: string; // User ID
}

export interface CitizenNotice {
    id: string;
    title: string;
    content: string;
    priority: 'low' | 'medium' | 'high';
    created_at: string;
    created_by: string;
}

// ─── Barangay ─────────────────────────────────────────────────────────────────

export interface Barangay {
    id: string;
    name: string;
    district: number;
    population: number;
    area_sqkm: number;
    latitude: number;
    longitude: number;
    safety_index: number;           // 0-100; computed from incidents
    patrol_frequency: PatrolFrequency;
}

export type PatrolFrequency = 'hourly' | 'bi-daily' | 'daily' | 'weekly';

// ─── Incident Report ──────────────────────────────────────────────────────────

export type IncidentType =
    | 'theft'
    | 'robbery'
    | 'assault'
    | 'homicide'
    | 'drug_related'
    | 'vandalism'
    | 'snatching'
    | 'cybercrime'
    | 'domestic_violence'
    | 'other';

export type IncidentStatus = 'pending' | 'approved' | 'rejected' | 'archived';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface IncidentLocation {
    latitude: number;
    longitude: number;
    address: string;
    barangay_id: string;
    landmark?: string;
}

export interface IncidentReport {
    id: string;
    case_number: string;            // Auto-generated: SFMP-YYYY-XXXXX
    type: IncidentType;
    severity: SeverityLevel;
    status: IncidentStatus;
    title: string;
    description: string;
    location: IncidentLocation;
    barangay_id: string;
    barangay?: Barangay;
    reported_by: string;            // User ID (FK → users.id)
    reporter?: User;
    reviewed_by?: string;           // Admin User ID
    reviewer?: User;
    photo_urls: string[];
    witness_count: number;
    suspect_description?: string;
    date_occurred: string;          // ISO 8601
    date_reported: string;          // ISO 8601
    date_reviewed?: string;         // ISO 8601
    is_anonymous: boolean;
    is_offline_queued: boolean;     // True if submitted while offline
    metadata?: Record<string, unknown>;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface HeatRiskData {
    barangay_id: string;
    barangay_name: string;
    risk_score: number;             // 0-100
    incident_count: number;
    trend: 'rising' | 'stable' | 'declining';
    hotspot_hours: number[];        // 0-23 hour slots with highest crime
    last_updated: string;
}

export interface BarangaySafetyIndex {
    barangay_id: string;
    barangay_name: string;
    safety_score: number;           // 0-100
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    factors: {
        patrol_coverage: number;
        incident_rate: number;
        resolution_rate: number;
        community_reports: number;
    };
    rank: number;
    change_from_last_month: number; // positive = improved
}

export interface PatrolRecommendation {
    id: string;
    barangay_id: string;
    barangay_name: string;
    priority: 'high' | 'medium' | 'low';
    recommendation: string;
    predicted_risk_window: string;  // e.g. "10PM - 2AM"
    incident_types_expected: IncidentType[];
    confidence_score: number;       // 0-100
    generated_at: string;
}

// ─── Offline Queue ────────────────────────────────────────────────────────────

export interface OfflineQueueItem {
    id: string;
    type: 'incident_report';
    payload: Partial<IncidentReport>;
    created_at: string;
    retry_count: number;
    last_attempted?: string;
}


// ─── Supabase DB Schema (for typed queries) ───────────────────────────────────

export interface Database {
    public: {
        Tables: {
            users: {
                Row: User;
                Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<User, 'id'>>;
            };
            barangays: {
                Row: Barangay;
                Insert: Omit<Barangay, 'id' | 'safety_index'>;
                Update: Partial<Omit<Barangay, 'id'>>;
            };
            incident_reports: {
                Row: IncidentReport;
                Insert: Omit<IncidentReport, 'id' | 'case_number' | 'date_reported' | 'status'>;
                Update: Partial<Omit<IncidentReport, 'id' | 'case_number'>>;
            };
        };
    };
}
