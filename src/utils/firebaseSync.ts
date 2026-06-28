import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "./firebase";
import { signInAnonymously } from "firebase/auth";

// Ensure the user is silently signed in anonymously on boot so they satisfy the security rules
export const ensureAuthenticated = async (): Promise<void> => {
  if (!auth.currentUser) {
    try {
      await signInAnonymously(auth);
      console.log("Silently authenticated anonymously with Firebase Auth.");
    } catch (e) {
      console.error("Silent anonymous authentication failed:", e);
    }
  }
};

// Map user to database record safely via Express API (Neon Postgres + Firestore sync)
export const saveUserToFirestore = async (user: any): Promise<void> => {
  if (!user || !user.email) return;

  const emailLower = user.email.toLowerCase().trim();
  const userId = `legacy_${emailLower.replace(/[^a-zA-Z0-9_\-]/g, "_")}`;

  // 1. Synchronize using Express backend API (Neon Postgres is prime target, with Firestore concurrent sync)
  try {
    const resp = await fetch("/api/users/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: userId,
        username: user.username,
        email: emailLower,
        password: user.password,
        avatar: user.avatar,
        xp: user.xp,
        level: user.level,
        rankTier: user.rankTier,
        streak: user.streak,
        accuracy: user.accuracy,
        totalQuizzes: user.totalQuizzes,
        timeSpentMinutes: user.timeSpentMinutes,
        subjectsStudied: user.subjectsStudied,
        isPremium: user.isPremium,
        isAdmin: user.isAdmin,
      }),
    });
    if (resp.ok) {
      console.log(
        `Successfully synced candidate profile parameters for ${emailLower} via Express backend SQL pipe.`,
      );
      return;
    }
  } catch (apiErr) {
    console.warn(
      "Client sync Express API failed, falling back to direct Firestore commit:",
      apiErr,
    );
  }

  // 2. Direct Firestore fallback
  await ensureAuthenticated();
  const docRef = doc(db, "users", userId);

  // Format to match the strict Firebase blueprint / Entity expectations
  const payload = {
    username: user.username || "Candidate",
    email: emailLower,
    password: user.password || "admin",
    avatar: user.avatar || "🎓",
    xp: Number(user.xp ?? 0),
    level: Number(user.level ?? 1),
    rankTier: user.rankTier || "Bronze Scholar",
    streak: Number(user.streak ?? 1),
    accuracy: Number(user.accuracy ?? 100),
    totalQuizzes: Number(user.totalQuizzes ?? 0),
    timeSpentMinutes: Number(user.timeSpentMinutes ?? 0),
    subjectsStudied: user.subjectsStudied || {},
    isPremium: Boolean(user.isPremium ?? false),
    isAdmin: Boolean(user.isAdmin ?? false),
  };

  try {
    await setDoc(docRef, payload);
    console.log(
      `Saved user record for ${emailLower} directly to Firestore fallback.`,
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${userId}`);
  }
};

// Fetch and merge Neon DB / Firestore users into LocalStorage cache
export const syncUsersFromFirestore = async (): Promise<void> => {
  let cloudUsers: any[] = [];

  // 1. Load users using Express backend SQL api
  try {
    const resp = await fetch("/api/users");
    if (resp.ok) {
      cloudUsers = await resp.json();
    }
  } catch (err) {
    console.warn(
      "Could not fetch user pool from Express backend SQL, using direct Firestore fallback:",
      err,
    );
  }

  // 2. Direct Firestore pull fallback if Express API is empty or down
  if (!cloudUsers || cloudUsers.length === 0) {
    try {
      await ensureAuthenticated();
      const usersCollection = collection(db, "users");
      const snap = await getDocs(usersCollection);
      snap.forEach((doc) => {
        cloudUsers.push(doc.data());
      });
    } catch (firebaseErr) {
      handleFirestoreError(firebaseErr, OperationType.LIST, "users");
    }
  }

  if (cloudUsers && cloudUsers.length > 0) {
    // Overwrite the local cache with the exact, current list from the cloud database.
    // This filters out any local fallback seed dummy candidates (e.g., legacy King's College mock profiles)
    // that do not actually exist in the DB.
    const synchronizedUsers = cloudUsers.map((cloudUser: any) => ({
      username: cloudUser.username || "Candidate",
      email: (cloudUser.email || "").toLowerCase().trim(),
      password: cloudUser.password || "admin",
      avatar: cloudUser.avatar || "🎓",
      level: Number(cloudUser.level ?? 1),
      rankTier: cloudUser.rankTier || cloudUser.rank_tier || "Bronze Scholar",
      streak: Number(cloudUser.streak ?? 1),
      accuracy: Number(cloudUser.accuracy ?? 100),
      timeSpentMinutes: Number(cloudUser.timeSpentMinutes ?? 0),
      totalQuizzes: Number(
        cloudUser.totalQuizzes ?? cloudUser.totalQuizzesCount ?? 0,
      ),
      subjectsStudied: cloudUser.subjectsStudied || {},
      isPremium: Boolean(cloudUser.isPremium ?? false),
      isAdmin: Boolean(cloudUser.isAdmin ?? false),
      status: cloudUser.status || "Clean",
      school: cloudUser.school || "Unspecified CBT Affiliate College",
      state: cloudUser.state || "Lagos State Center",
    }));

    localStorage.setItem(
      "waec_registered_users",
      JSON.stringify(synchronizedUsers),
    );
    console.log(
      `Successfully synchronized and refreshed ${synchronizedUsers.length} profile records into local cache, discarding untracked synthetic seed users.`,
    );
  }
};

const buildQuestionPaperMetadata = (question: any) => {
  const normalizedExamName = (question.examName || "WAEC")
    .toString()
    .trim()
    .toUpperCase();
  const normalizedSubject = (question.subject || "General").toString().trim();
  const normalizedYear = Number(question.examYear || new Date().getFullYear());
  const safeSubjectSlug = normalizedSubject
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return {
    paperId: `${normalizedExamName.toLowerCase()}-${safeSubjectSlug}-${normalizedYear}`,
    paperTitle: `${normalizedExamName} ${normalizedSubject} ${normalizedYear}`,
    examName: normalizedExamName === "JAMB" ? "JAMB" : "WAEC",
    examYear: normalizedYear,
  };
};

// Map question to database record safely via Express API (Neon Postgres + Firestore sync)
export const saveQuestionToDatabase = async (question: any): Promise<void> => {
  if (!question || !question.id || !question.subject) return;

  const paperMeta = buildQuestionPaperMetadata(question);
  const normalizedQuestion = {
    ...question,
    examName: question.examName || paperMeta.examName,
    examYear: question.examYear
      ? Number(question.examYear)
      : paperMeta.examYear,
    questionNumber: question.questionNumber
      ? Number(question.questionNumber)
      : null,
    paperId: question.paperId || paperMeta.paperId,
    paperTitle: question.paperTitle || paperMeta.paperTitle,
    sourceFileName: question.sourceFileName || null,
  };

  // 1. Synchronize using Express backend API (Neon Postgres is prime target, with Firestore concurrent sync)
  try {
    const resp = await fetch("/api/questions/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(normalizedQuestion),
    });
    if (resp.ok) {
      console.log(
        `Successfully synced CBT question ${normalizedQuestion.id} via Express backend SQL pipe.`,
      );
      return;
    }
  } catch (apiErr) {
    console.warn(
      "Client question sync Express API failed, falling back to direct Firestore commit:",
      apiErr,
    );
  }

  // 2. Direct Firestore fallback
  await ensureAuthenticated();
  const docRef = doc(db, "questions", normalizedQuestion.id);

  try {
    await setDoc(docRef, {
      id: normalizedQuestion.id,
      subject: normalizedQuestion.subject,
      topic: normalizedQuestion.topic,
      type: normalizedQuestion.type,
      text: normalizedQuestion.text,
      options: normalizedQuestion.options || null,
      correctAnswer: normalizedQuestion.correctAnswer,
      explanation: normalizedQuestion.explanation,
      hint: normalizedQuestion.hint || null,
      difficulty: normalizedQuestion.difficulty,
      marks: Number(normalizedQuestion.marks || 1),
      diagramUrl: normalizedQuestion.diagramUrl || null,
      examName: normalizedQuestion.examName,
      examYear: normalizedQuestion.examYear,
      questionNumber: normalizedQuestion.questionNumber,
      paperId: normalizedQuestion.paperId,
      paperTitle: normalizedQuestion.paperTitle,
      sourceFileName: normalizedQuestion.sourceFileName,
    });
    console.log(
      `Saved question ${normalizedQuestion.id} directly to Firestore fallback.`,
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `questions/${question.id}`);
  }
};

export const deleteQuestionFromDatabase = async (
  questionId: string,
): Promise<void> => {
  if (!questionId) return;

  try {
    const resp = await fetch("/api/questions/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: questionId }),
    });

    if (resp.ok) {
      return;
    }
  } catch (apiErr) {
    console.warn(
      "Client question delete Express API failed, falling back to direct Firestore deletion:",
      apiErr,
    );
  }

  await ensureAuthenticated();
  const docRef = doc(db, "questions", questionId);
  try {
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `questions/${questionId}`);
  }
};

// Fetch and merge Neon DB / Firestore questions into LocalStorage cache
export const syncQuestionsFromDatabase = async (): Promise<any[]> => {
  let cloudQuestions: any[] = [];

  // 1. Load questions using Express backend SQL api
  try {
    const resp = await fetch("/api/questions");
    if (resp.ok) {
      cloudQuestions = await resp.json();
    }
  } catch (err) {
    console.warn(
      "Could not fetch questions list from Express backend SQL, using direct Firestore fallback:",
      err,
    );
  }

  // 2. Direct Firestore pull fallback
  if (!cloudQuestions || cloudQuestions.length === 0) {
    try {
      await ensureAuthenticated();
      const snap = await getDocs(collection(db, "questions"));
      snap.forEach((doc) => {
        cloudQuestions.push(doc.data());
      });
    } catch (firebaseErr) {
      handleFirestoreError(firebaseErr, OperationType.LIST, "questions");
    }
  }

  return cloudQuestions.sort((a, b) => {
    const examNameCompare = String(a.examName || "").localeCompare(
      String(b.examName || ""),
    );
    if (examNameCompare !== 0) return examNameCompare;

    const subjectCompare = String(a.subject || "").localeCompare(
      String(b.subject || ""),
    );
    if (subjectCompare !== 0) return subjectCompare;

    const yearCompare = Number(b.examYear || 0) - Number(a.examYear || 0);
    if (yearCompare !== 0) return yearCompare;

    return Number(a.questionNumber || 0) - Number(b.questionNumber || 0);
  });
};
