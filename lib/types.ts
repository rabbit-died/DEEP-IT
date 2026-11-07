export type Role = "student" | "admin";

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: Role;
  created_at: string;
};

export type Course = {
  id: string;
  title: string;
  description: string | null;
  duration: string | null;
  fee: number | null;
  is_active: boolean;
  created_at: string;
};

export type EnrollmentStatus = "active" | "completed" | "dropped";
export const ENROLLMENT_STATUSES: EnrollmentStatus[] = [
  "active",
  "completed",
  "dropped",
];

// Student ke enrollments (batch + course ke saath)
export type EnrollmentRow = {
  id: string;
  status: EnrollmentStatus;
  batches: {
    id: string;
    name: string;
    start_date: string | null;
    timing: string | null;
    courses: { id: string; title: string; duration: string | null } | null;
  } | null;
};