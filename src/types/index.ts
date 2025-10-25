export interface Course {
  courseId: string;
  title: string;
  description: string;
  instructor: string;
  price: number;
  maxStudents: number;
  currentStudents: number;
  isActive: boolean;
  createdAt: number;
  publicKey: string;
}

export interface Enrollment {
  enrollmentId: string;
  student: string;
  course: string;
  enrolledAt: number;
  isActive: boolean;
  progress: number;
  publicKey: string;
}

export interface Certificate {
  certificateId: string;
  student: string;
  course: string;
  instructor: string;
  credentialType: CredentialType;
  metadataUri: string;
  issuedAt: number;
  isVerified: boolean;
  publicKey: string;
}

export interface Achievement {
  student: string;
  achievementType: AchievementType;
  amount: number;
  awardedAt: number;
  publicKey: string;
}

export interface LMSAccount {
  authority: string;
  name: string;
  description: string;
  totalCourses: number;
  totalStudents: number;
  totalInstructors: number;
  publicKey: string;
}

export enum CredentialType {
  Certificate = "Certificate",
  Diploma = "Diploma",
  Badge = "Badge",
  MicroCredential = "MicroCredential",
}

export enum AchievementType {
  CourseCompletion = "CourseCompletion",
  QuizMaster = "QuizMaster",
  Participation = "Participation",
  Leadership = "Leadership",
  Innovation = "Innovation",
}

export interface UserProfile {
  walletAddress: string;
  name: string;
  email: string;
  role: UserRole;
  enrolledCourses: string[];
  certificates: string[];
  achievements: string[];
  totalTokens: number;
  createdAt: number;
}

export enum UserRole {
  Student = "Student",
  Instructor = "Instructor",
  Admin = "Admin",
}

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: ContentType;
  author: string;
  metadataUri: string;
  createdAt: number;
  isProtected: boolean;
  royaltyPercentage: number;
}

export enum ContentType {
  Video = "Video",
  Document = "Document",
  Quiz = "Quiz",
  Assignment = "Assignment",
  Presentation = "Presentation",
}

export interface AIRecommendation {
  courseId: string;
  reason: string;
  confidence: number;
  skillGaps: string[];
  learningPath: string[];
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  courses: string[];
  estimatedDuration: number;
  difficulty: DifficultyLevel;
  prerequisites: string[];
}

export enum DifficultyLevel {
  Beginner = "Beginner",
  Intermediate = "Intermediate",
  Advanced = "Advanced",
  Expert = "Expert",
}
