import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Student, StudentFormData } from '../types/student';

// Read default environment variables provided by Vite
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Local storage keys for testing credentials directly in the UI if needed
const STORAGE_URL_KEY = 'student_reg_supabase_url';
const STORAGE_KEY_KEY = 'student_reg_supabase_anon_key';
const LOCAL_EXTRA_DATA_KEY = 'student_reg_extra_metadata_v1';

// Helpers for caching supplementary fields (phone, academic term)
function getExtraMetadataMap(): Record<string, { phone?: string; academic_term?: string }> {
  try {
    const raw = localStorage.getItem(LOCAL_EXTRA_DATA_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveExtraMetadata(studentId: string, phone?: string, academicTerm?: string) {
  try {
    const map = getExtraMetadataMap();
    map[studentId] = {
      phone: phone?.trim() || map[studentId]?.phone,
      academic_term: academicTerm?.trim() || map[studentId]?.academic_term,
    };
    localStorage.setItem(LOCAL_EXTRA_DATA_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage issues
  }
}

function removeExtraMetadata(studentId: string) {
  try {
    const map = getExtraMetadataMap();
    delete map[studentId];
    localStorage.setItem(LOCAL_EXTRA_DATA_KEY, JSON.stringify(map));
  } catch {
    // Ignore
  }
}

export function getActiveCredentials(): { url: string; anonKey: string; isConfigured: boolean } {
  const localUrl = localStorage.getItem(STORAGE_URL_KEY) || '';
  const localKey = localStorage.getItem(STORAGE_KEY_KEY) || '';

  const url = localUrl.trim() || envUrl.trim();
  const anonKey = localKey.trim() || envAnonKey.trim();

  const isPlaceholder =
    !url ||
    !anonKey ||
    url.includes('your-project-id') ||
    anonKey.includes('your-anon-public-api-key');

  return {
    url,
    anonKey,
    isConfigured: !isPlaceholder && url.startsWith('http'),
  };
}

export function saveLocalCredentials(url: string, anonKey: string) {
  if (url) localStorage.setItem(STORAGE_URL_KEY, url.trim());
  if (anonKey) localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
}

export function resetCredentialsToEnv() {
  localStorage.removeItem(STORAGE_URL_KEY);
  localStorage.removeItem(STORAGE_KEY_KEY);
}

// Singleton client instance
let cachedClient: SupabaseClient | null = null;
let currentKeyFingerprint = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getActiveCredentials();
  if (!isConfigured) {
    return null;
  }

  const fingerprint = `${url}::${anonKey}`;
  if (cachedClient && currentKeyFingerprint === fingerprint) {
    return cachedClient;
  }

  cachedClient = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  currentKeyFingerprint = fingerprint;
  return cachedClient;
}

/**
 * Validates connectivity to the database and students table.
 */
export async function testSupabaseConnection(): Promise<{
  success: boolean;
  message: string;
  statusCode?: number;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'System service is not configured.',
    };
  }

  try {
    const { error, status } = await client
      .from('students')
      .select('id', { count: 'exact', head: true });

    if (error) {
      return {
        success: false,
        statusCode: status,
        message: error.message || 'Error communicating with database.',
      };
    }

    return {
      success: true,
      statusCode: status,
      message: 'System database online.',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Network error: ${errorMsg}`,
    };
  }
}

/**
 * Checks whether a given student ID is already registered.
 */
export async function checkStudentIdExists(studentId: string, excludeId?: string): Promise<{
  exists: boolean;
  error?: string;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return { exists: false, error: 'Database client not initialized.' };
  }

  const normalizedId = studentId.trim();
  let query = client
    .from('students')
    .select('id, student_id')
    .ilike('student_id', normalizedId);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    return { exists: false, error: error.message };
  }

  return { exists: data !== null };
}

/**
 * Checks whether a given email address is already registered.
 */
export async function checkEmailExists(email: string, excludeId?: string): Promise<{
  exists: boolean;
  error?: string;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return { exists: false, error: 'Database client not initialized.' };
  }

  const normalizedEmail = email.trim().toLowerCase();
  let query = client
    .from('students')
    .select('id, email')
    .ilike('email', normalizedEmail);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    return { exists: false, error: error.message };
  }

  return { exists: data !== null };
}

/**
 * Checks whether a given phone number is already registered.
 */
export async function checkPhoneExists(phone: string, excludeId?: string): Promise<{
  exists: boolean;
  error?: string;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return { exists: false, error: 'Database client not initialized.' };
  }

  const normalizedPhone = phone.trim();
  if (!normalizedPhone) return { exists: false };

  let query = client
    .from('students')
    .select('id, phone')
    .eq('phone', normalizedPhone);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    // If phone column doesn't exist, skip the check gracefully
    return { exists: false };
  }

  return { exists: data !== null };
}

/**
 * Submits a new student registration.
 */
export async function registerStudent(formData: StudentFormData): Promise<{
  data: Student | null;
  error: string | null;
  statusCode?: number;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      data: null,
      error: 'Registration service is currently unavailable. Please try again later.',
    };
  }

  const basePayload = {
    full_name: formData.fullName.trim(),
    student_id: formData.studentId.trim(),
    email: formData.email.trim().toLowerCase(),
    course: formData.course.trim(),
  };

  const fullPayload = {
    ...basePayload,
    phone: formData.phone?.trim() || null,
    academic_term: formData.academicTerm?.trim() || null,
  };

  try {
    // Attempt inserting with all fields first
    let insertResult = await client
      .from('students')
      .insert([fullPayload])
      .select()
      .single();

    // If phone or academic_term columns do not exist in PostgreSQL schema, retry with base payload
    if (insertResult.error && insertResult.error.code === 'PGRST204') {
      insertResult = await client
        .from('students')
        .insert([basePayload])
        .select()
        .single();
    }

    const { data, error, status } = insertResult;

    if (error) {
      if (error.code === '23505' || error.message.includes('unique constraint') || error.message.includes('student_id')) {
        return {
          data: null,
          statusCode: status,
          error: `Student ID "${basePayload.student_id}" is already registered. Duplicate student IDs are prohibited.`,
        };
      }

      if (error.code === '42501' || error.message.includes('row-level security policy')) {
        return {
          data: null,
          statusCode: status,
          error: 'Registration could not be authorized. Please contact the admissions office.',
        };
      }

      return {
        data: null,
        statusCode: status,
        error: error.message || 'An error occurred while inserting the student record.',
      };
    }

    // Save extra metadata locally to guarantee persistence across slip and directory
    if (formData.phone || formData.academicTerm) {
      saveExtraMetadata(basePayload.student_id, formData.phone, formData.academicTerm);
    }

    const resultStudent: Student = {
      ...(data as Student),
      phone: (data as Student)?.phone || formData.phone,
      academic_term: (data as Student)?.academic_term || formData.academicTerm,
    };

    return {
      data: resultStudent,
      error: null,
      statusCode: status,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      data: null,
      error: `Unexpected network error: ${errorMsg}`,
    };
  }
}

/**
 * Updates an existing student's record.
 */
export async function updateStudent(
  id: string,
  formData: Partial<StudentFormData>
): Promise<{
  data: Student | null;
  error: string | null;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return { data: null, error: 'Database service is currently unavailable.' };
  }

  const baseUpdate: Record<string, string | null> = {};
  if (formData.fullName !== undefined) baseUpdate.full_name = formData.fullName.trim();
  if (formData.studentId !== undefined) baseUpdate.student_id = formData.studentId.trim();
  if (formData.email !== undefined) baseUpdate.email = formData.email.trim().toLowerCase();
  if (formData.course !== undefined) baseUpdate.course = formData.course.trim();

  const fullUpdate = {
    ...baseUpdate,
    ...(formData.phone !== undefined ? { phone: formData.phone.trim() || null } : {}),
    ...(formData.academicTerm !== undefined ? { academic_term: formData.academicTerm.trim() || null } : {}),
  };

  try {
    let result = await client
      .from('students')
      .update(fullUpdate)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (result.error && result.error.code === 'PGRST204') {
      result = await client
        .from('students')
        .update(baseUpdate)
        .eq('id', id)
        .select()
        .maybeSingle();
    }

    if (result.error) {
      return { data: null, error: result.error.message };
    }

    if (formData.studentId) {
      saveExtraMetadata(formData.studentId, formData.phone, formData.academicTerm);
    }

    return { data: (result.data as Student) || null, error: null };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { data: null, error: errorMsg };
  }
}

/**
 * Deletes a student registration from the database.
 */
export async function deleteStudent(id: string, studentId?: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Database service is currently unavailable.' };
  }

  try {
    const { error } = await client.from('students').delete().eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    if (studentId) {
      removeExtraMetadata(studentId);
    }

    return { success: true, error: null };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { success: false, error: errorMsg };
  }
}

/**
 * Fetches all student registrations, enriched with metadata.
 */
export async function fetchAllStudents(limit = 100): Promise<{
  students: Student[];
  error: string | null;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return { students: [], error: 'Student records service is currently unavailable.' };
  }

  try {
    const { data, error } = await client
      .from('students')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return { students: [], error: error.message };
    }

    const metadataMap = getExtraMetadataMap();
    const enriched = ((data as Student[]) || []).map((student) => {
      const extra = metadataMap[student.student_id];
      return {
        ...student,
        phone: student.phone || extra?.phone,
        academic_term: student.academic_term || extra?.academic_term,
      };
    });

    return { students: enriched, error: null };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { students: [], error: errorMsg };
  }
}
