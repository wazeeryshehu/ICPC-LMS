import type { CourseSeed } from "./types";
import { legalCourses } from "./legal";
import { digitalCourses } from "./digital";
import { investigationCourses } from "./investigation";
import { professionalCourses } from "./professional";

export const allCourses: CourseSeed[] = [
  ...legalCourses,
  ...digitalCourses,
  ...investigationCourses,
  ...professionalCourses,
];

export type { CourseSeed };
