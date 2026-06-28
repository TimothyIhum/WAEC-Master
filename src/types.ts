export interface AiChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
  isMock?: boolean;
  image?: string; // Optional base64/Data URI attached image
}

export interface AiChatSession {
  id: string;
  title: string;
  messages: AiChatMessage[];
  timestamp: string;
  subject?: string;
}

export interface UserProgress {
  username: string;
  avatar: string;
  xp: number;
  level: number;
  rankTier: string;
  streak: number;
  lastActiveDate?: string; // YYYY-MM-DD
  accuracy: number;
  totalQuizzes: number;
  totalQuestionsAnswered?: number;
  correctAnswers?: number;
  timeSpentMinutes: number;
  subjectsStudied: { [key: string]: number }; // subject -> XP
  completedMissions?: string[];
  isPremium?: boolean;
  isAdmin?: boolean;
  email?: string;
  savedAiSessions?: AiChatSession[];
}

export type QuestionType = "mcq" | "theory" | "fill_in_the_blank";

export interface Question {
  id: string;
  subject: string;
  topic: string;
  type: QuestionType;
  text: string;
  options?: string[]; // Required for MCQ
  correctAnswer: string; // Index for MCQ (e.g., "0", "1", "2", "3"), or raw content for theory/blank
  explanation: string;
  hint?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  marks: number;
  diagramUrl?: string; // Optional illustration base64 or URL
  examName?: "WAEC" | "JAMB";
  examYear?: number;
  questionNumber?: number;
  paperId?: string;
  paperTitle?: string;
  sourceFileName?: string;
}

export interface LeaderboardEntry {
  username: string;
  avatar: string;
  xp: number;
  accuracy: number;
  level: number;
  school: string;
  state: string;
  rankTier: string;
}

export interface BattlePlayer {
  username: string;
  avatar: string;
  score: number;
  currentQuestionIndex: number;
  answers: { questionId: string; wasCorrect: boolean; timeTaken: number }[];
  lastReaction?: string;
}

export interface BattleRoom {
  roomId: string;
  player1: BattlePlayer;
  player2: BattlePlayer | null; // Null during matchmaking queuing
  questions: Question[];
  status: "queue" | "battle" | "finished";
  timerSeconds: number;
  maxQuestions: number;
  winner?: string;
}

export interface DiscussionReply {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
}

export interface DiscussionPost {
  id: string;
  author: string;
  avatar: string;
  content: string;
  subject: string;
  timestamp: string;
  likes: number;
  hasLiked?: boolean;
  replies: DiscussionReply[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  category: "Exam Update" | "Reward" | "Tournament";
}

export interface DailyMission {
  id: string;
  description: string;
  target: number;
  current: number;
  xpReward: number;
  type:
    "answer_questions" | "score_percentage" | "streak_maintain" | "win_battle";
}

export interface ParentCheckpoint {
  parentPin: string;
  parentEmail: string;
  dailyGoalMinutes: number;
  rewardOffer: string;
  activityAllowedHourStart: number;
  activityAllowedHourEnd: number;
  parentNotes: string;
}
