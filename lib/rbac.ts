export type Role =
  | "super_admin"
  | "training_admin"
  | "instructor"
  | "coordinator"
  | "learner"
  | "management";

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Administrator",
  training_admin: "Training / HR Administrator",
  instructor: "Course Instructor",
  coordinator: "Departmental Training Coordinator",
  learner: "Staff Learner",
  management: "Management / Executive",
};

export const HOME_BY_ROLE: Record<Role, string> = {
  super_admin: "/admin",
  training_admin: "/admin",
  instructor: "/instructor",
  coordinator: "/dashboard",
  learner: "/dashboard",
  management: "/admin",
};

export function isAdministrator(role: Role): boolean {
  return role === "super_admin" || role === "training_admin";
}

export function isSuperAdmin(role: Role): boolean {
  return role === "super_admin";
}

export function canManageCourses(role: Role): boolean {
  return role === "super_admin" || role === "training_admin" || role === "instructor";
}

export function isReadOnlyExecutive(role: Role): boolean {
  return role === "management";
}

export function canViewAdminArea(role: Role): boolean {
  return role === "super_admin" || role === "training_admin" || role === "management";
}

export function roleBadgeClass(role: Role): string {
  switch (role) {
    case "super_admin":
      return "chip-gold";
    case "training_admin":
      return "chip-blue";
    case "instructor":
      return "chip-green";
    case "coordinator":
      return "chip-blue";
    case "management":
      return "chip-gold";
    default:
      return "chip-gray";
  }
}
