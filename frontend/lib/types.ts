export interface User {
  id: number;
  name: string;
  email: string;
  role: 'STUDENT' | 'ADMIN' | 'INSTITUTION';
}

export interface Problem {
  id: number;
  title: string;
  short_description?: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  category?: 'DSA' | 'EMBEDDED_C' | 'COMMUNICATION_PROTOCOLS' | 'FREERTOS' | 'OTHER';
  topics?: string[] | string;
  constraints?: string;
  sample_input?: string;
  sample_output?: string;
  created_at?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'DISABLED';
  is_free?: boolean;
  solve_status?: 'solved' | 'attempted' | 'not_started';
  course?: { id: number; title: string } | null;
  testCases?: TestCase[];
  lesson_id?: number;
  position?: number;
}

export interface TestCase {
  id: number;
  input: string;
  expected_output: string;
  is_hidden?: boolean;
}

export interface Submission {
  id: number;
  user_id: number;
  problem_id: number;
  code: string;
  language: string;
  status: 'ACCEPTED' | 'WRONG_ANSWER' | 'ERROR' | 'TIME_LIMIT_EXCEEDED' | 'RUNTIME_ERROR';
  execution_time?: number;
  created_at: string;
  problem?: Problem;
}

export interface Course {
  id: number;
  title: string;
  short_description?: string;
  description: string;
  topics?: string[] | string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  price: number;
  status?: 'DRAFT' | 'PUBLISHED';
  duration?: string;
  image_url?: string;
  created_at?: string;
  lesson_count?: number;
  problem_count?: number;
  enrollment_count?: number;
  average_progress?: number;
  is_enrolled?: boolean;
  enrollment?: {
    progress: number;
    current_lesson_id?: number;
    last_lesson_id?: number;
  };
  lessons?: Lesson[];
  problems?: Problem[];
}

export interface Lesson {
  id: number;
  course_id: number;
  title: string;
  content: string;
  position: number;
  created_at?: string;
  problems?: Problem[];
  is_completed?: boolean;
}

export interface Enrollment {
  id: number;
  user_id: number;
  course_id: number;
  progress: number;
  completed: boolean;
  last_lesson_id?: number;
  current_lesson_id?: number;
  enrolled_at: string;
  course?: Course;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RunCodeResponse {
  output: string;
  stderr: string;
  executionTime: number;
}

export interface SubmitCodeResponse {
  submission: {
    id: number;
    status: string;
    executionTime: number;
  };
}

