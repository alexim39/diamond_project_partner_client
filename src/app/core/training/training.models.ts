import { ApiEnvelope } from '../../core/auth/auth.models';

export interface CourseSummary {
  id: string;
  title: string;
  tagline: string;
  milestone: string | null;
  lessons: number;
  done: number;
  total: number;
  percent: number;
  certified: boolean;
  certificateAt: string | null;
}

export interface Lesson {
  id: string;
  title: string;
  body: string;
  takeaways: string[];
  quiz?: Array<{ q: string; options: string[]; answer: number }>;
  videoUrl?: string | null;
}

export interface CourseDetail extends Omit<CourseSummary, 'lessons'> {
  lessons: Lesson[];
  completedIds: string[];
}

export interface CoursesEnvelope extends ApiEnvelope<CourseSummary[]> {
  data: CourseSummary[];
}

export interface CourseEnvelope extends ApiEnvelope<CourseDetail> {
  data: CourseDetail;
}

export interface CompleteEnvelope extends ApiEnvelope<{
  progress: { done: number; total: number; percent: number; certified: boolean };
  certificateAt: string | null;
  certified: boolean;
  milestoneChecked: string | null;
}> {
  data: {
    progress: { done: number; total: number; percent: number; certified: boolean };
    certificateAt: string | null;
    certified: boolean;
    milestoneChecked: string | null;
  };
}

export interface Certificate {
  courseId: string;
  title: string;
  at: string;
  number?: string;
}

export interface PathsEnvelope extends ApiEnvelope<Array<{
  level: string; title: string; tagline: string; unlocked: boolean;
  progress: { done: number; total: number; percent: number };
  requirements: Array<{ key: string; label: string; action: string; met: boolean; courseId: string | null }>;
  courses: Array<{ courseId: string; done: number; certified: boolean }>;
}>> {
  data: Array<{
    level: string; title: string; tagline: string; unlocked: boolean;
    progress: { done: number; total: number; percent: number };
    requirements: Array<{ key: string; label: string; action: string; met: boolean; courseId: string | null }>;
    courses: Array<{ courseId: string; done: number; certified: boolean }>;
  }>;
}

export interface Readiness {
  level: string; levelLabel: string; next: string | null; nextLabel: string | null;
  percent: number; score: number; label: string; done: number; total: number;
  missing: Array<{ key: string; label: string; action: string }>;
  remainingActions: string[];
}

export interface ReadinessEnvelope extends ApiEnvelope<Readiness> {
  data: Readiness;
}

export interface CertificatesEnvelope extends ApiEnvelope<Certificate[]> {
  data: Certificate[];
}
