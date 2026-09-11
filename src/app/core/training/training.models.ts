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
}

export interface CertificatesEnvelope extends ApiEnvelope<Certificate[]> {
  data: Certificate[];
}
