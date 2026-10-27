export interface Student {
  id: string;
  full_name: string;
  student_id: string;
  email: string;
  course: string;
  phone?: string;
  academic_term?: string;
  created_at: string;
}

export interface StudentFormData {
  fullName: string;
  studentId: string;
  email: string;
  course: string;
  phone?: string;
  academicTerm?: string;
}

export interface FormErrors {
  fullName?: string;
  studentId?: string;
  email?: string;
  course?: string;
  phone?: string;
  academicTerm?: string;
  general?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}
