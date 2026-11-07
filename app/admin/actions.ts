"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { ENROLLMENT_STATUSES } from "@/lib/types";

function str(fd: FormData, key: string, max = 200) {
  return String(fd.get(key) ?? "").trim().slice(0, max);
}

function fail(path: string, message: string): never {
  const sep = path.includes("?") ? "&" : "?";
  redirect(`${path}${sep}error=${encodeURIComponent(message)}`);
}

function done(path: string): never {
  revalidatePath("/", "layout");
  redirect(path);
}

// ---------- Courses ----------
function readCourse(fd: FormData, failPath: string) {
  const title = str(fd, "title", 120);
  if (!title) fail(failPath, "Course title is required.");

  const feeRaw = str(fd, "fee", 12);
  const fee = feeRaw ? Number(feeRaw) : null;
  if (fee !== null && (!Number.isFinite(fee) || fee < 0)) {
    fail(failPath, "Fee must be a positive number.");
  }

  return {
    title,
    description: str(fd, "description", 1000) || null,
    duration: str(fd, "duration", 60) || null,
    fee,
  };
}

export async function createCourse(fd: FormData) {
  const { supabase } = await requireAdmin();
  const path = "/admin/courses";
  const values = readCourse(fd, path);

  const { error } = await supabase.from("courses").insert(values);
  if (error) fail(path, error.message);
  done(path);
}

export async function updateCourse(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(fd, "id", 60);
  const editPath = `/admin/courses?edit=${id}`;
  const values = readCourse(fd, editPath);

  const { error } = await supabase.from("courses").update(values).eq("id", id);
  if (error) fail(editPath, error.message);
  done("/admin/courses");
}

export async function toggleCourse(fd: FormData) {
  const { supabase } = await requireAdmin();
  const path = "/admin/courses";
  const id = str(fd, "id", 60);
  const next = str(fd, "next", 5) === "true";

  const { error } = await supabase.from("courses").update({ is_active: next }).eq("id", id);
  if (error) fail(path, error.message);
  done(path);
}

export async function deleteCourse(fd: FormData) {
  const { supabase } = await requireAdmin();
  const path = "/admin/courses";
  const { error } = await supabase.from("courses").delete().eq("id", str(fd, "id", 60));
  if (error) fail(path, error.message);
  done(path);
}

// ---------- Batches ----------
function readBatch(fd: FormData, failPath: string) {
  const course_id = str(fd, "course_id", 60);
  const name = str(fd, "name", 120);
  if (!course_id || !name) fail(failPath, "Course and batch name are required.");

  const seatsRaw = str(fd, "seats", 6);
  const seats = seatsRaw ? Number.parseInt(seatsRaw, 10) : null;
  if (seats !== null && (!Number.isFinite(seats) || seats < 0)) {
    fail(failPath, "Seats must be a positive number.");
  }

  return {
    course_id,
    name,
    start_date: str(fd, "start_date", 10) || null,
    timing: str(fd, "timing", 80) || null,
    seats,
  };
}

export async function createBatch(fd: FormData) {
  const { supabase } = await requireAdmin();
  const path = "/admin/batches";
  const values = readBatch(fd, path);

  const { error } = await supabase.from("batches").insert(values);
  if (error) fail(path, error.message);
  done(path);
}

export async function updateBatch(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(fd, "id", 60);
  const editPath = `/admin/batches?edit=${id}`;
  const values = readBatch(fd, editPath);

  const { error } = await supabase.from("batches").update(values).eq("id", id);
  if (error) fail(editPath, error.message);
  done("/admin/batches");
}

export async function deleteBatch(fd: FormData) {
  const { supabase } = await requireAdmin();
  const path = "/admin/batches";
  const { error } = await supabase.from("batches").delete().eq("id", str(fd, "id", 60));
  if (error) fail(path, error.message);
  done(path);
}

// ---------- Enrollments ----------
export async function enrollStudent(fd: FormData) {
  const { supabase } = await requireAdmin();
  const path = "/admin/enrollments";

  const student_id = str(fd, "student_id", 60);
  const batch_id = str(fd, "batch_id", 60);
  if (!student_id || !batch_id) fail(path, "Select a student and a batch.");

  const { error } = await supabase.from("enrollments").insert({ student_id, batch_id });
  if (error) {
    fail(path, error.code === "23505" ? "This student is already in that batch." : error.message);
  }
  done(path);
}

export async function updateEnrollmentStatus(fd: FormData) {
  const { supabase } = await requireAdmin();
  const path = "/admin/enrollments";

  const status = str(fd, "status", 20);
  if (!(ENROLLMENT_STATUSES as string[]).includes(status)) fail(path, "Invalid status.");

  const { error } = await supabase
    .from("enrollments")
    .update({ status })
    .eq("id", str(fd, "id", 60));
  if (error) fail(path, error.message);
  done(path);
}

export async function removeEnrollment(fd: FormData) {
  const { supabase } = await requireAdmin();
  const path = "/admin/enrollments";
  const { error } = await supabase.from("enrollments").delete().eq("id", str(fd, "id", 60));
  if (error) fail(path, error.message);
  done(path);
}