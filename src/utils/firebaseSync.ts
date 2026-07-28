import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc,
  onSnapshot 
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { signInAnonymously } from 'firebase/auth';

// Ensure the user is silently signed in anonymously on boot so they satisfy the security rules
export const ensureAuthenticated = async (): Promise<void> => {
  if (!auth.currentUser) {
    try {
      await signInAnonymously(auth);
      console.log('Silently authenticated anonymously with Firebase Auth.');
    } catch (e) {
      console.error('Silent anonymous authentication failed:', e);
    }
  }
};

// Map user to database record safely via Express API (Neon Postgres + Firestore sync)
export const saveUserToFirestore = async (user: any): Promise<void> => {
  if (!user || !user.email) return;

  const emailLower = user.email.toLowerCase().trim();
  const userId = `legacy_${emailLower.replace(/[^a-zA-Z0-9_\-]/g, '_')}`;

  // 1. Synchronize using Express backend API (Neon Postgres is prime target, with Firestore concurrent sync)
  try {
    const resp = await fetch('/api/users/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
        isAdmin: user.isAdmin
      })
    });
    if (resp.ok) {
      console.log(`Successfully synced candidate profile parameters for ${emailLower} via Express backend SQL pipe.`);
      return;
    }
  } catch (apiErr) {
    console.warn("Client sync Express API failed, falling back to direct Firestore commit:", apiErr);
  }

  // 2. Direct Firestore fallback
  await ensureAuthenticated();
  const docRef = doc(db, 'users', userId);
  
  // Format to match the strict Firebase blueprint / Entity expectations
  const payload = {
    username: user.username || 'Candidate',
    email: emailLower,
    password: user.password || 'admin',
    avatar: user.avatar || '🎓',
    xp: Number(user.xp ?? 0),
    level: Number(user.level ?? 1),
    rankTier: user.rankTier || 'Bronze Scholar',
    streak: Number(user.streak ?? 1),
    accuracy: Number(user.accuracy ?? 100),
    totalQuizzes: Number(user.totalQuizzes ?? 0),
    timeSpentMinutes: Number(user.timeSpentMinutes ?? 0),
    subjectsStudied: user.subjectsStudied || {},
    isPremium: Boolean(user.isPremium ?? false),
    isAdmin: Boolean(user.isAdmin ?? false)
  };

  try {
    await setDoc(docRef, payload);
    console.log(`Saved user record for ${emailLower} directly to Firestore fallback.`);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${userId}`);
  }
};

// Fetch and merge Neon DB / Firestore users into LocalStorage cache
export const syncUsersFromFirestore = async (): Promise<void> => {
  let cloudUsers: any[] = [];

  // 1. Load users using Express backend SQL api
  try {
    const resp = await fetch('/api/users');
    if (resp.ok) {
      cloudUsers = await resp.json();
    }
  } catch (err) {
    console.warn("Could not fetch user pool from Express backend SQL, using direct Firestore fallback:", err);
  }

  // 2. Direct Firestore pull fallback if Express API is empty or down
  if (!cloudUsers || cloudUsers.length === 0) {
    try {
      await ensureAuthenticated();
      const usersCollection = collection(db, 'users');
      const snap = await getDocs(usersCollection);
      snap.forEach((doc) => {
        cloudUsers.push(doc.data());
      });
    } catch (firebaseErr) {
      handleFirestoreError(firebaseErr, OperationType.LIST, 'users');
    }
  }
  
  if (cloudUsers && cloudUsers.length > 0) {
    // Overwrite the local cache with the exact, current list from the cloud database.
    // This filters out any local fallback seed dummy candidates (e.g., legacy King's College mock profiles)
    // that do not actually exist in the DB.
    const synchronizedUsers = cloudUsers.map((cloudUser: any) => ({
      username: cloudUser.username || 'Candidate',
      email: (cloudUser.email || '').toLowerCase().trim(),
      password: cloudUser.password || 'admin',
      avatar: cloudUser.avatar || '🎓',
      level: Number(cloudUser.level ?? 1),
      rankTier: cloudUser.rankTier || cloudUser.rank_tier || 'Bronze Scholar',
      streak: Number(cloudUser.streak ?? 1),
      accuracy: Number(cloudUser.accuracy ?? 100),
      timeSpentMinutes: Number(cloudUser.timeSpentMinutes ?? 0),
      totalQuizzes: Number(cloudUser.totalQuizzes ?? cloudUser.totalQuizzesCount ?? 0),
      subjectsStudied: cloudUser.subjectsStudied || {},
      isPremium: Boolean(cloudUser.isPremium ?? false),
      isAdmin: Boolean(cloudUser.isAdmin ?? false),
      status: cloudUser.status || 'Clean',
      school: cloudUser.school || 'Unspecified CBT Affiliate College',
      state: cloudUser.state || 'Lagos State Center'
    }));

    localStorage.setItem('waec_registered_users', JSON.stringify(synchronizedUsers));
    console.log(`Successfully synchronized and refreshed ${synchronizedUsers.length} profile records into local cache, discarding untracked synthetic seed users.`);
  }
};

// Map question to database record safely via Express API (Neon Postgres + Firestore sync)
export const saveQuestionToDatabase = async (question: any): Promise<void> => {
  if (!question || !question.id || !question.subject) return;

  // 1. Synchronize using Express backend API (Neon Postgres is prime target, with Firestore concurrent sync)
  try {
    const resp = await fetch('/api/questions/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(question)
    });
    if (resp.ok) {
      console.log(`Successfully synced CBT question ${question.id} via Express backend SQL pipe.`);
      return;
    }
  } catch (apiErr) {
    console.warn("Client question sync Express API failed, falling back to direct Firestore commit:", apiErr);
  }

  // 2. Direct Firestore fallback
  await ensureAuthenticated();
  const docRef = doc(db, 'questions', question.id);
  
  try {
    await setDoc(docRef, {
      id: question.id,
      subject: question.subject,
      topic: question.topic,
      type: question.type,
      text: question.text,
      options: question.options || null,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      hint: question.hint || null,
      difficulty: question.difficulty,
      marks: Number(question.marks || 1),
      diagramUrl: question.diagramUrl || null,
      examName: question.examName || null,
      examYear: question.examYear ? Number(question.examYear) : null,
      questionNumber: question.questionNumber ? Number(question.questionNumber) : null
    });
    console.log(`Saved question ${question.id} directly to Firestore fallback.`);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `questions/${question.id}`);
  }
};

// Fetch and merge Neon DB / Firestore questions into LocalStorage cache
export const syncQuestionsFromDatabase = async (): Promise<any[]> => {
  let cloudQuestions: any[] = [];

  // 1. Load questions using Express backend SQL api
  try {
    const resp = await fetch('/api/questions');
    if (resp.ok) {
      cloudQuestions = await resp.json();
    }
  } catch (err) {
    console.warn("Could not fetch questions list from Express backend SQL, using direct Firestore fallback:", err);
  }

  // 2. Direct Firestore pull fallback
  if (!cloudQuestions || cloudQuestions.length === 0) {
    try {
      await ensureAuthenticated();
      const snap = await getDocs(collection(db, 'questions'));
      snap.forEach((doc) => {
        cloudQuestions.push(doc.data());
      });
    } catch (firebaseErr) {
      handleFirestoreError(firebaseErr, OperationType.LIST, 'questions');
    }
  }
  
  return cloudQuestions;
};

