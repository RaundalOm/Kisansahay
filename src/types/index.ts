export type Category = 'General' | 'SC' | 'ST';

export type ApplicationStatus =
  | 'PENDING'
  | 'PROVISIONALLY_APPROVED'
  | 'WAITING'
  | 'APPROVED'
  | 'REJECTED';

export interface AuditRecord {
  id: string;
  timestamp: number;
  action: string;
  actor: 'FARMER' | 'ADMIN' | 'OFFICER' | 'SYSTEM';
  details: string;
  targetId?: string; // ID of the application or scheme affected
}

export interface FarmerApplication {
  id: string;
  application_id?: string;
  applicant_name?: string;
  name?: string; // Legacy
  aadhaar_number?: string;
  aadhaar?: string; // Legacy
  income: number;
  land_size?: number;
  landSize?: number; // Legacy
  district: string;
  category: Category;
  impact_score?: number;
  impactScore?: number; // Legacy
  status: ApplicationStatus;
  ai_validation_status?: string;
  ai_validation_report?: {
    confidence_score: number;
    extracted_data: Record<string, any>;
    discrepancies: string[];
  };
  created_at?: string;
  appliedAt?: number; // Legacy
  document_7_12?: string;
  income_certificate?: string;
  ration_card?: string;
}

export interface DistrictQuota {
  district: string;
  totalSeats: number;
}

export interface ReservationConfig {
  scPercentage: number;
  stPercentage: number;
}

export interface Scheme {
  id: string;
  title: string;
  description: string;
  totalQuota: number;
  districtQuotas: DistrictQuota[];
  reservations: ReservationConfig;
  deadline: number;
  allocationDone: boolean;
}

export interface SystemStore {
  schemes: Scheme[];
  applications: FarmerApplication[];
  auditLogs: AuditRecord[];
}
