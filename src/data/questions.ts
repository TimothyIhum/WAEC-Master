import { Question } from '../types';

export const SAMPLE_QUESTIONS: Question[] = [
  // --- MATHEMATICS ---
  {
    id: 'math-1',
    subject: 'Mathematics',
    topic: 'Set Theory',
    type: 'mcq',
    text: 'In a class of 40 students, 25 offer Mathematics, 20 offer Physics, and 8 offer neither. How many students offer both subjects?',
    options: [
      '5',
      '8',
      '13',
      '15'
    ],
    correctAnswer: '2',
    explanation: 'Using the Venn diagram formula: Total = n(M) + n(P) - n(M ∩ P) + n(Neither)\nLet x be the number of students who offer both subjects.\n40 = 25 + 20 - x + 8\n40 = 53 - x\nx = 53 - 40 = 13.\nTherefore, 13 students offer both subjects.',
    hint: 'Apply the Venn formula: Total = (Math only + Physics only + Both) + Neither.',
    difficulty: 'Easy',
    marks: 3,
    examName: 'WAEC',
    examYear: 2022,
    questionNumber: 5
  },
  {
    id: 'math-2',
    subject: 'Mathematics',
    topic: 'Geometry',
    type: 'mcq',
    text: 'The sum of the interior angles of a regular polygon is 1440°. Find the number of sides of the polygon.',
    options: [
      '8',
      '10',
      '12',
      '14'
    ],
    correctAnswer: '1',
    explanation: 'The formula for the sum of the interior angles of an n-sided polygon is: Sum = (n - 2) * 180°.\nGiven Sum = 1440°:\n(n - 2) * 180 = 1440\nn - 2 = 1440 / 180\nn - 2 = 8\nn = 8 + 2 = 10.\nSo, the polygon is a decagon and has 10 sides.',
    hint: 'Use the interior angle sum formula: (n - 2) * 180 = Sum.',
    difficulty: 'Medium',
    marks: 3,
    examName: 'WAEC',
    examYear: 2021,
    questionNumber: 3
  },
  {
    id: 'math-3',
    subject: 'Mathematics',
    topic: 'Logarithms',
    type: 'mcq',
    text: 'Given that log_10 y + 3 log_10 2 = log_10 32, find the value of y.',
    options: [
      '2',
      '4',
      '8',
      '16'
    ],
    correctAnswer: '1',
    explanation: 'Apply the laws of logarithms:\nlog_10 y + log_10 2³ = log_10 32\nlog_10 y + log_10 8 = log_10 32\nUsing product rule: log_10 (8y) = log_10 32\nTherefore, 8y = 32\ny = 32 / 8 = 4.',
    hint: 'Bring the coefficient of 3 over 2 as an exponent, then use the logarithmic product rule.',
    difficulty: 'Medium',
    marks: 3,
    examName: 'WAEC',
    examYear: 2022,
    questionNumber: 12
  },
  {
    id: 'math-4',
    subject: 'Mathematics',
    topic: 'Quadratic Equations',
    type: 'mcq',
    text: 'Find the quadratic equation whose roots are -2/3 and 3/4.',
    options: [
      '12x² - x - 6 = 0',
      '12x² + x - 6 = 0',
      '12x² - x + 6 = 0',
      '12x² + x + 6 = 0'
    ],
    correctAnswer: '0',
    explanation: 'A quadratic equation with roots r1 and r2 is given by: x² - (r1 + r2)x + (r1 * r2) = 0.\nSum of roots = -2/3 + 3/4 = (-8 + 9) / 12 = 1/12.\nProduct of roots = (-2/3) * (3/4) = -6/12 = -1/2.\nSubstituting into the formula: x² - (1/12)x - 1/2 = 0.\nMultiply through by 12 to eliminate fractions:\n12x² - x - 6 = 0.',
    hint: 'Form the equation using the root expansion: (x - r1)(x - r2) = 0.',
    difficulty: 'Hard',
    marks: 4,
    examName: 'WAEC',
    examYear: 2020,
    questionNumber: 22
  },
  {
    id: 'math-5',
    subject: 'Mathematics',
    topic: 'Set Theory',
    type: 'mcq',
    text: 'If 2/3, 5/6 and 3/4 are added, and the sum is divided by 1 1/3, find the result.',
    options: [
      '1 11/16',
      '2 1/16',
      '1 3/4',
      '1 9/16'
    ],
    correctAnswer: '0',
    explanation: 'First, find the sum of the three fractions:\n2/3 + 5/6 + 3/4 = (8 + 10 + 9) / 12 = 27/12 = 9/4.\nNow, divide this sum by 1 1/3 (which is 4/3 as an improper fraction):\n9/4 ÷ 4/3 = 9/4 * 3/4 = 27/16.\nConverting 27/16 back to a mixed fraction: 27/16 = 1 11/16.',
    hint: 'Find the lowest common multiple (LCM) of the denominators to sum them first, then multiply by the reciprocal of the divisor.',
    difficulty: 'Easy',
    marks: 3,
    examName: 'WAEC',
    examYear: 2020,
    questionNumber: 12
  },
  {
    id: 'math-6',
    subject: 'Mathematics',
    topic: 'Quadratic Equations',
    type: 'mcq',
    text: 'Solve for x: 2^(3x-1) = 4^(x+3).',
    options: [
      'x = 1',
      'x = 5',
      'x = 7',
      'x = 9'
    ],
    correctAnswer: '2',
    explanation: 'Express both sides with the same base of 2:\n2^(3x-1) = (2²)^(x+3)\n2^(3x-1) = 2^(2x+6)\nSince the bases are equal, equate the exponents:\n3x - 1 = 2x + 6\n3x - 2x = 6 + 1\nx = 7.',
    hint: 'Rewrite the 4 on the right-hand side as 2^2 so that both sides share the same base.',
    difficulty: 'Medium',
    marks: 3,
    examName: 'WAEC',
    examYear: 2021,
    questionNumber: 18
  },
  {
    id: 'math-7',
    subject: 'Mathematics',
    topic: 'Statistics',
    type: 'mcq',
    text: 'Evaluate: 3.57 × 10^-3 / (1.4 × 10^-5), expressing your answer in standard form.',
    options: [
      '2.55 × 10¹',
      '2.55 × 10²',
      '2.55 × 10³',
      '2.55 × 10^-8'
    ],
    correctAnswer: '1',
    explanation: 'Divide the numbers and applying index rules for power of 10:\n3.57 / 1.4 = 2.55.\n10^-3 / 10^-5 = 10^(-3 - (-5)) = 10^(-3 + 5) = 10².\nThus, the answer is 2.55 × 10².',
    hint: 'Divide the coefficients first, then subtract the powers of 10 inside the division.',
    difficulty: 'Easy',
    marks: 3,
    examName: 'WAEC',
    examYear: 2021,
    questionNumber: 1
  },
  {
    id: 'math-8',
    subject: 'Mathematics',
    topic: 'Statistics',
    type: 'mcq',
    text: 'A box contains 5 red, 3 blue and 2 green balls of the same size. If a ball is selected at random, find the probability that it is NOT red.',
    options: [
      '1/5',
      '1/2',
      '3/10',
      '7/10'
    ],
    correctAnswer: '1',
    explanation: 'Total number of balls = 5 + 3 + 2 = 10 balls.\nNumber of balls that are NOT red = 3 blue + 2 green = 5 balls.\nProbability of selecting a non-red ball = Number of non-red balls / Total balls = 5 / 10 = 1/2.',
    hint: 'Find the total balls count, count all non-red options, and divide non-red by total.',
    difficulty: 'Easy',
    marks: 3,
    examName: 'WAEC',
    examYear: 2021,
    questionNumber: 32
  },

  // --- ENGLISH LANGUAGE ---
  {
    id: 'eng-1',
    subject: 'English Language',
    topic: 'Lexis and Structure',
    type: 'mcq',
    text: 'Choose the option nearest in meaning to the underlined word:\n\nThe prominent athlete was *disqualified* from competing further in the games.',
    options: [
      'banned',
      'suspended',
      'penalized',
      'dismissed'
    ],
    correctAnswer: '0',
    explanation: '"Disqualified" in the context of competition means to be officially banned or declared ineligible from participating due to a violation of instructions.',
    hint: 'Think of being barred or declared ineligible.',
    difficulty: 'Easy',
    marks: 2,
    examName: 'WAEC',
    examYear: 2021,
    questionNumber: 2
  },
  {
    id: 'eng-2',
    subject: 'English Language',
    topic: 'Lexis and Structure',
    type: 'mcq',
    text: 'Choose the option most nearly opposite in meaning to the underlined word:\n\nHe is known to be an extremely *gregarious* politician.',
    options: [
      'unfriendly',
      'introverted',
      'hostile',
      'reserved'
    ],
    correctAnswer: '1',
    explanation: '"Gregarious" means sociable and fond of company. The direct antonym is "introverted", which denotes being shy, reserved, or preferring isolation.',
    hint: 'If gregarious means being highly outgoing and loving crowds, what word represents turning inward?',
    difficulty: 'Medium',
    marks: 2,
    examName: 'WAEC',
    examYear: 2021,
    questionNumber: 5
  },
  {
    id: 'eng-3',
    subject: 'English Language',
    topic: 'Lexis and Structure',
    type: 'mcq',
    text: 'Complete the sentence with the most suitable option:\n\nThe class host, as well as his distinguished guests, ________ arrived.',
    options: [
      'has',
      'have',
      'had',
      'having'
    ],
    correctAnswer: '0',
    explanation: 'When a singular subject ("host") is joined to other nouns/pronouns using parenthetical expressions like "as well as", "along with", or "together with", the verb remains singular to agree with the main subject ("host"). Hence, "has" is correct.',
    hint: 'The main subject of this sentence is separate from the parenthetical "as well as..." structure.',
    difficulty: 'Medium',
    marks: 2,
    examName: 'WAEC',
    examYear: 2020,
    questionNumber: 11
  },
  {
    id: 'eng-4',
    subject: 'English Language',
    topic: 'Prepositions',
    type: 'mcq',
    text: 'Complete the sentence with the most appropriate option:\n\nAll current junior students are expected to conform ________ the school safety regulations.',
    options: [
      'to',
      'with',
      'by',
      'of'
    ],
    correctAnswer: '0',
    explanation: 'The verb "conform" is grammatically paired with the preposition "to" (e.g., conform to the standard/law).',
    hint: 'Observe standard lexical collocation rules: you comply WITH, but you conform...',
    difficulty: 'Easy',
    marks: 2,
    examName: 'WAEC',
    examYear: 2021,
    questionNumber: 14
  },
  {
    id: 'eng-5',
    subject: 'English Language',
    topic: 'Lexis and Structure',
    type: 'mcq',
    text: 'Complete the sentence with the correct register term:\n\nThe high court granted the accused person ________ pending the determination of the trial.',
    options: [
      'bail',
      'parole',
      'freedom',
      'release'
    ],
    correctAnswer: '0',
    explanation: 'In legally structured terminology (register of law), temporary release of an accused person awaiting trial is called "bail". "Parole" is release after serving part of a prison sentence.',
    hint: 'Which of these represents a financial or administrative pledge to secure temporary freedom before judgment?',
    difficulty: 'Easy',
    marks: 2,
    examName: 'WAEC',
    examYear: 2019,
    questionNumber: 8
  },
  {
    id: 'eng-6',
    subject: 'English Language',
    topic: 'Lexis and Structure',
    type: 'mcq',
    text: 'Choose the option that best explains the underlined idiom:\n\nThe striking teachers vowed to *hold their ground* until their bonuses were paid.',
    options: [
      'buy more land',
      'stand firm',
      'yield slowly',
      'withdraw from negotiations'
    ],
    correctAnswer: '1',
    explanation: 'The idiomatic phrase "to hold one\'s ground" means to refuse to retreat or yield, and to stand firm in one\'s position or opinion.',
    hint: 'When a soldier blocks an offensive without backing away, they are doing this.',
    difficulty: 'Easy',
    marks: 2,
    examName: 'WAEC',
    examYear: 2021,
    questionNumber: 19
  },

  // --- PHYSICS ---
  {
    id: 'phy-1',
    subject: 'Physics',
    topic: 'Mechanics & Motion',
    type: 'mcq',
    text: 'A machine has an efficiency of 80%. If the work output of the machine is 240 J, calculate the work input.',
    options: [
      '192 J',
      '300 J',
      '400 J',
      '240 J'
    ],
    correctAnswer: '1',
    explanation: 'Efficiency (η) = (Work Output / Work Input) * 100%\n80 = (240 / Work Input) * 100\nWork Input = (240 * 100) / 80\nWork Input = 24000 / 80 = 300 J.',
    hint: 'Divide the output by the efficiency coefficient (0.80) to pull the higher raw input value.',
    difficulty: 'Medium',
    marks: 3,
    examName: 'WAEC',
    examYear: 2020,
    questionNumber: 3
  },
  {
    id: 'phy-2',
    subject: 'Physics',
    topic: 'Waves',
    type: 'mcq',
    text: 'An object is placed 15.0 cm in front of a concave mirror of focal length 10.0 cm. Calculate the image distance.',
    options: [
      '6.0 cm',
      '15.0 cm',
      '30.0 cm',
      '60.0 cm'
    ],
    correctAnswer: '2',
    explanation: 'Using the mirror formula: 1/f = 1/u + 1/v\nWhere f = 10.0 cm, u = 15.0 cm.\n1/10 = 1/15 + 1/v\n1/v = 1/10 - 1/15\n1/v = (3 - 2) / 30 = 1/30\nv = 30.0 cm.\nThe image is formed 30.0 cm in front of the mirror.',
    hint: 'Rearrange the mirror formula to isolate 1/v as: 1/f - 1/u.',
    difficulty: 'Medium',
    marks: 3,
    examName: 'WAEC',
    examYear: 2018,
    questionNumber: 8
  },
  {
    id: 'phy-3',
    subject: 'Physics',
    topic: 'Mechanics & Motion',
    type: 'mcq',
    text: 'A truck of mass 8000 kg moving with a velocity of 15 m/s collides with another truck of mass 12000 kg at rest. If the two trucks couple and move together after collision, calculate their common velocity.',
    options: [
      '3.0 m/s',
      '6.0 m/s',
      '9.0 m/s',
      '15.0 m/s'
    ],
    correctAnswer: '1',
    explanation: 'Apply the principle of conservation of linear momentum for an inelastic collision:\nm1*u1 + m2*u2 = (m1 + m2) * v\nWhere m1 = 8000 kg, u1 = 15 m/s, m2 = 12000 kg, u2 = 0 m/s (at rest).\n8000 * 15 + 12000 * 0 = (8000 + 12000) * v\n120000 = 20000 * v\nv = 120000 / 20000 = 6 m/s.',
    hint: 'Set initial total momentum equal to post-collision coupled momentum: m1u1 = (m1+m2)v.',
    difficulty: 'Hard',
    marks: 4,
    examName: 'WAEC',
    examYear: 2021,
    questionNumber: 11
  },
  {
    id: 'phy-4',
    subject: 'Physics',
    topic: 'Waves',
    type: 'mcq',
    text: 'A radio wave has a frequency of 3.0 × 10^7 Hz. What is its wavelength in air? [Take speed of electromagnetic waves in air = 3.0 × 10^8 m/s]',
    options: [
      '0.1 m',
      '1.0 m',
      '10 m',
      '100 m'
    ],
    correctAnswer: '2',
    explanation: 'Use the wave equation: v = f * λ\nWhere v = 3.0 × 10^8 m/s, f = 3.0 × 10^7 Hz.\nλ = v / f\nλ = (3.0 × 10^8) / (3.0 × 10^7)\nλ = 10 m.',
    hint: 'Wavelength is speed divided by frequency. Subtract index exponents: 8 - 7.',
    difficulty: 'Easy',
    marks: 3,
    examName: 'WAEC',
    examYear: 2021,
    questionNumber: 21
  },
  {
    id: 'phy-5',
    subject: 'Physics',
    topic: 'Electricity',
    type: 'mcq',
    text: 'Calculate the equivalent resistance of three resistors of values 6 ohms, 12 ohms, and 4 ohms connected in parallel.',
    options: [
      '2 ohms',
      '4 ohms',
      '6 ohms',
      '22 ohms'
    ],
    correctAnswer: '0',
    explanation: 'For parallel resistor networks:\n1/R_eq = 1/R1 + 1/R2 + 1/R3\n1/R_eq = 1/6 + 1/12 + 1/4\nCommon denominator is 12:\n1/R_eq = (2 + 1 + 3) / 12 = 6 / 12 = 1 / 2\nTherefore, R_eq = 2 ohms.',
    hint: 'Take the reciprocal of individual resistors, add them up, and then reciprocal the final tally.',
    difficulty: 'Medium',
    marks: 3,
    examName: 'WAEC',
    examYear: 2021,
    questionNumber: 14
  },

  // --- CHEMISTRY ---
  {
    id: 'chem-1',
    subject: 'Chemistry',
    topic: 'Atomic Structure',
    type: 'mcq',
    text: 'An element X has electronic configuration 2, 8, 8, 1. To which group and period in the Periodic Table does X belong?',
    options: [
      'Group 1 and Period 3',
      'Group 8 and Period 1',
      'Group 1 and Period 4',
      'Group 4 and Period 1'
    ],
    correctAnswer: '2',
    explanation: 'The number of electron shell divisions matches the Period (4 shells = Period 4). The count of valence electrons in the absolute outer shell determines the Group (1 electron = Group 1). Potassium (K) matches this.',
    hint: 'Count the total number of shells used (numbers listed) for the period, and look at the final trailing value for group selection.',
    difficulty: 'Easy',
    marks: 3,
    examName: 'WAEC',
    examYear: 2021,
    questionNumber: 5
  },
  {
    id: 'chem-2',
    subject: 'Chemistry',
    topic: 'Stoichiometry',
    type: 'mcq',
    text: 'What volume of 0.5 mol/dm³ HCl will be required to completely neutralize 25 cm³ of 0.2 mol/dm³ NaOH solution?',
    options: [
      '10 cm³',
      '15 cm³',
      '20 cm³',
      '25 cm³'
    ],
    correctAnswer: '0',
    explanation: 'Balanced neutralization reaction: HCl + NaOH -> NaCl + H2O\nSince reactive ratio is 1:1, we can use: C_a * V_a = C_b * V_b\nWhere C_a = 0.5 mol/dm³, C_b = 0.2 mol/dm³, V_b = 25 cm³.\n0.5 * V_a = 0.2 * 25\n0.5 * V_a = 5\nV_a = 5 / 0.5 = 10 cm³.',
    hint: 'Apply standard titration equivalence for 1-to-1 acid-alkali reactions: CaVa = CbVb.',
    difficulty: 'Medium',
    marks: 3,
    examName: 'WAEC',
    examYear: 2020,
    questionNumber: 14
  },
  {
    id: 'chem-3',
    subject: 'Chemistry',
    topic: 'Stoichiometry',
    type: 'mcq',
    text: 'The empirical formula of a hydrocarbon is CH2. If its relative molecular mass is 56 g/mol, determine its molecular formula. [Take relative atomic masses: C = 12, H = 1]',
    options: [
      'C2H4',
      'C4H8',
      'C3H6',
      'C5H10'
    ],
    correctAnswer: '1',
    explanation: 'Formula representation: (CH2)n = Molecular Mass\nWhere empirical component mass = (12 * 1) + (1 * 2) = 14.\n14 * n = 56\nn = 56 / 14 = 4.\nIncorporate multiplier back: C_(1*4)H_(2*4) => C4H8 (Butene).',
    hint: 'Divide the overall molecular weight (56) by the unit block weight (14) to establish your scale factor.',
    difficulty: 'Easy',
    marks: 3,
    examName: 'WAEC',
    examYear: 2021,
    questionNumber: 19
  },
  {
    id: 'chem-4',
    subject: 'Chemistry',
    topic: 'Organic Chemistry',
    type: 'mcq',
    text: 'Which of the following processes represents the main industrial method used to obtain pure ethanol from a fermented sugar solution?',
    options: [
      'Chromatography',
      'Fractional distillation',
      'Filtration',
      'Evaporation'
    ],
    correctAnswer: '1',
    explanation: 'Ethanol and water have closely aligned boiling steps (78°C and 100°C respectively). Fractional distillation separates them based on these distinct boiling thresholds.',
    hint: 'This thermal technique uses columns with fractionating beads to isolate miscible liquids based on separate boiling points.',
    difficulty: 'Easy',
    marks: 2,
    examName: 'WAEC',
    examYear: 2019,
    questionNumber: 25
  },
  {
    id: 'chem-5',
    subject: 'Chemistry',
    topic: 'Gas Laws',
    type: 'mcq',
    text: 'A given mass of gas occupies a volume of 200 cm³ at a pressure of 750 mmHg. What volume will the gas occupy at a pressure of 760 mmHg, temperature being kept constant?',
    options: [
      '184.2 cm³',
      '197.4 cm³',
      '202.6 cm³',
      '215.8 cm³'
    ],
    correctAnswer: '1',
    explanation: 'Using Boyle’s Law (isothermal gas state): P1 * V1 = P2 * V2\nWhere P1 = 750 mmHg, V1 = 200 cm³, P2 = 760 mmHg.\n750 * 200 = 760 * V2\n150000 = 760 * V2\nV2 = 150000 / 760 ≈ 197.4 cm³.',
    hint: 'Boyle\'s Law tells us pressure and volume vary inversely. Since pressure went up slightly, volume must fall slightly.',
    difficulty: 'Medium',
    marks: 3,
    examName: 'WAEC',
    examYear: 2021,
    questionNumber: 34
  },

  // --- BIOLOGY ---
  {
    id: 'bio-1',
    subject: 'Biology',
    topic: 'Cell Biology',
    type: 'mcq',
    text: 'Which of the following blood vessels carries highly oxygenated blood from the lungs back to the left atrium of the heart?',
    options: [
      'Pulmonary artery',
      'Pulmonary vein',
      'Vena cava',
      'Aorta'
    ],
    correctAnswer: '1',
    explanation: 'Unlike typical systemic veins that carry deoxygenated blood, the Pulmonary Vein retrieves freshly oxygen-filled blood from lung capillary groupings straight to the Left Atrium.',
    hint: 'Normally veins handle deoxygenated flow, but this specialized pathway is a major exception.',
    difficulty: 'Easy',
    marks: 2,
    examName: 'WAEC',
    examYear: 2021,
    questionNumber: 1
  },
  {
    id: 'bio-2',
    subject: 'Biology',
    topic: 'Skeletal Systems',
    type: 'mcq',
    text: 'The part of the human brain that functions primarily for the maintenance of balance, equilibrium and skeletal posture is the:',
    options: [
      'Cerebrum',
      'Cerebellum',
      'Medulla oblongata',
      'Hypothalamus'
    ],
    correctAnswer: '1',
    explanation: 'The Cerebellum (little brain) coordinates complex muscular reflexes and maintains postural balance and equilibrium.',
    hint: 'This dense hind portion governs physical feedback like standing upright or balancing on one leg.',
    difficulty: 'Easy',
    marks: 2,
    examName: 'WAEC',
    examYear: 2020,
    questionNumber: 8
  },
  {
    id: 'bio-3',
    subject: 'Biology',
    topic: 'Ecology',
    type: 'mcq',
    text: 'The symbiotic relationship between hermit crabs and sea anemones where both species obtain relative biological benefits is known as:',
    options: [
      'Commensalism',
      'Mutualism',
      'Parasitism',
      'Saprophytism'
    ],
    correctAnswer: '1',
    explanation: 'Mutualism is an obligate or optional ecological partnership where both distinct interacting species gain physiological or protective benefits.',
    hint: 'Look for the term representing mutual/two-way positive cooperation.',
    difficulty: 'Easy',
    marks: 2,
    examName: 'WAEC',
    examYear: 2021,
    questionNumber: 12
  },
  {
    id: 'bio-4',
    subject: 'Biology',
    topic: 'Genetics',
    type: 'mcq',
    text: 'If a heterozygous tall pea plant (Tt) is crossed with a homozygous short pea plant (tt), what percentage of the offspring is expected to be short?',
    options: [
      '25%',
      '100%',
      '50%',
      '75%'
    ],
    correctAnswer: '2',
    explanation: 'Punnett cross of Tt * tt gametes:\nParent 1 gives T or t. Parent 2 gives t.\nOffspring genotypes are: Tt (tall), Tt (tall), tt (short), tt (short).\nShort offspring fraction = 2 / 4 = 50%.',
    hint: 'Draw a monohybrid box cross. Offspring splits evenly between dominant hybrids and true recessives.',
    difficulty: 'Medium',
    marks: 3,
    examName: 'WAEC',
    examYear: 2021,
    questionNumber: 45
  },
  {
    id: 'bio-5',
    subject: 'Biology',
    topic: 'Cell Biology',
    type: 'mcq',
    text: 'A deficiency of Vitamin C (Ascorbic Acid) in human diet leads directly to which condition?',
    options: [
      'Rickets',
      'Scurvy',
      'Beri-beri',
      'Pellagra'
    ],
    correctAnswer: '1',
    explanation: 'Ascorbic acid governs healthy collagen synthesis. Lack of it causes Scurvy, characterized by bleeding gums and slow-healing wounds.',
    hint: 'Historically, sailors on remote voyages lacking citrus fruits suffered heavily from this.',
    difficulty: 'Easy',
    marks: 2,
    examName: 'WAEC',
    examYear: 2022,
    questionNumber: 8
  },

  // --- ECONOMICS ---
  {
    id: 'eco-1',
    subject: 'Economics',
    topic: 'Demand & Supply',
    type: 'mcq',
    text: 'The fundamental economic problem of all human societies is:',
    options: [
      'Unemployment',
      'Inflation',
      'Scarcity of resources',
      'Poverty'
    ],
    correctAnswer: '2',
    explanation: 'Economics exists because human wants are unlimited while available resource pools are strictly finite (Scarcity). This necessitates choice.',
    hint: 'Which problem refers to resources being limited compared to unlimited wants?',
    difficulty: 'Easy',
    marks: 2,
    examName: 'WAEC',
    examYear: 2021,
    questionNumber: 1
  },
  {
    id: 'eco-2',
    subject: 'Economics',
    topic: 'Market Structures',
    type: 'mcq',
    text: 'Which of the following types of taxes takes a higher percentage of income from low-income earners than from high-income earners?',
    options: [
      'Progressive tax',
      'Regressive tax',
      'Proportional tax',
      'Direct tax'
    ],
    correctAnswer: '1',
    explanation: 'A regressive tax takes a larger percentage from low-income groups than high-income groups, as seen with flat consumption taxes where lower earners spend a larger share of their income.',
    hint: 'Look for the term opposite to "progressive" taxation models.',
    difficulty: 'Medium',
    marks: 2,
    examName: 'WAEC',
    examYear: 2020,
    questionNumber: 4
  },
  {
    id: 'eco-3',
    subject: 'Economics',
    topic: 'Demand & Supply',
    type: 'mcq',
    text: 'If an increase in the price of Garri leads to an increase in the demand for Yam, Garri and Yam are classified as:',
    options: [
      'Complementary goods',
      'Substitute goods',
      'Giffen goods',
      'Veblen goods'
    ],
    correctAnswer: '1',
    explanation: 'Substitute goods are alternatives of each other. If the price of one increases, consumers shift to the other, raising its demand.',
    hint: 'These items are alternatives for satisfying a similar nutritional need.',
    difficulty: 'Easy',
    marks: 2,
    examName: 'WAEC',
    examYear: 2018,
    questionNumber: 2
  },
  {
    id: 'eco-4',
    subject: 'Economics',
    topic: 'Demand & Supply',
    type: 'mcq',
    text: 'If a 10% increase in the price of sugar leads to a 5% decrease in the quantity demanded, the price elasticity of demand is:',
    options: [
      '0.5',
      '1.5',
      '2.0',
      '5.0'
    ],
    correctAnswer: '0',
    explanation: 'Price Elasticity of Demand = % change in Quantity Demanded / % change in Price = 5% / 10% = 0.5.',
    hint: 'Divide the quantity demand shift percentage by the price increase percentage.',
    difficulty: 'Medium',
    marks: 3,
    examName: 'WAEC',
    examYear: 2021,
    questionNumber: 12
  },

  // --- GOVERNMENT ---
  {
    id: 'gov-1',
    subject: 'Government',
    topic: 'Constitutional Development',
    type: 'mcq',
    text: 'Which of the following colonial political arrangements established the first fully-fledged federal constitution in Nigeria?',
    options: [
      'Clifford Constitution of 1922',
      'Richards Constitution of 1946',
      'Macpherson Constitution of 1951',
      'Lyttelton Constitution of 1954'
    ],
    correctAnswer: '3',
    explanation: 'The Lyttelton Constitution of 1954 introduced a fully federal structure in Nigeria, dividing powers between central and regional legislative cabinets.',
    hint: 'Recall the 1954 colonial constitution that provided regional autonomy.',
    difficulty: 'Hard',
    marks: 4,
    examName: 'WAEC',
    examYear: 1954,
    questionNumber: 4
  },
  {
    id: 'gov-2',
    subject: 'Government',
    topic: 'Types of Government',
    type: 'mcq',
    text: 'The ultimate power of a sovereign state to make and enforce laws within its territory without external interference is known as:',
    options: [
      'Delegation',
      'Legitimacy',
      'Sovereignty',
      'Franchise'
    ],
    correctAnswer: '2',
    explanation: 'Sovereignty represents the supreme, absolute power of a state to formulate, apply, and enforce laws within territorial margins.',
    hint: 'This word means supreme independent authority of a state.',
    difficulty: 'Easy',
    marks: 2,
    examName: 'WAEC',
    examYear: 2019,
    questionNumber: 15
  },
  {
    id: 'gov-3',
    subject: 'Government',
    topic: 'Constitutional Development',
    type: 'mcq',
    text: 'In the pre-colonial Yoruba political system, the council of state chiefs which could ask a tyrannical Alaafin to commit suicide was known as the:',
    options: [
      'Ogboni',
      'Oyo Mesi',
      'Eso',
      'Are-Ona-Kankanfo'
    ],
    correctAnswer: '1',
    explanation: 'The Oyo Mesi was the powerful council of seven kingmakers in pre-colonial Oyo. They acted as a check on the Alaafin’s authority and could demand his suicide if he breached constitutional guidelines.',
    hint: 'These custom Oyo chiefs were led by the Bashorun.',
    difficulty: 'Medium',
    marks: 3,
    examName: 'WAEC',
    examYear: 2021,
    questionNumber: 1
  },
  {
    id: 'gov-4',
    subject: 'Government',
    topic: 'Public Administration',
    type: 'mcq',
    text: 'In order to ensure impartiality in administrative delivery, career civil servants are required to remain:',
    options: [
      'Politically active and public',
      'Neutral and anonymous',
      'Elected and accountable',
      'Corporate and competitive'
    ],
    correctAnswer: '1',
    explanation: 'Administrative conventions require civil servants to maintain political neutrality (to serve any cabinet in power) and anonymity (not taking personal public praise or blame for government policy).',
    hint: 'They must work quietly inside departments without declaring political affiliations or seeking personal credit.',
    difficulty: 'Easy',
    marks: 2,
    examName: 'WAEC',
    examYear: 2018,
    questionNumber: 14
  },
  {
    id: 'math-9',
    subject: 'Mathematics',
    topic: 'Logarithms',
    type: 'mcq',
    text: 'If log 2 = 0.3010 and log 3 = 0.4771, evaluate log 1.2 without using a calculator or tables.',
    options: [
      '0.0792',
      '0.7921',
      '1.0792',
      '0.0079'
    ],
    correctAnswer: '0',
    explanation: 'log 1.2 = log (12 / 10) = log 12 - log 10\n= log (2² * 3) - 1\n= log 2² + log 3 - 1\n= 2 log 2 + log 3 - 1\n= 2(0.3010) + 0.4771 - 1\n= 0.6020 + 0.4771 - 1\n= 1.0791 - 1 = 0.0791 (which rounds to 0.0792 under some log approximation constants).',
    hint: 'Rewrite 1.2 as 12/10, then break 12 down into its prime factors: 2^2 * 3.',
    difficulty: 'Hard',
    marks: 4,
    examName: 'WAEC',
    examYear: 2022,
    questionNumber: 8
  },
  {
    id: 'math-10',
    subject: 'Mathematics',
    topic: 'Geometry',
    type: 'mcq',
    text: 'Find the midpoint of the line segment joining the points P(-3, 5) and Q(5, -3).',
    options: [
      '(1, 1)',
      '(2, 2)',
      '(8, -8)',
      '(-1, -1)'
    ],
    correctAnswer: '0',
    explanation: 'The formula for the midpoint between (x1, y1) and (x2, y2) is: ((x1 + x2)/2, (y1 + y2)/2).\nSubstitute P(-3, 5) and Q(5, -3):\nx-midpoint = (-3 + 5)/2 = 2/2 = 1.\ny-midpoint = (5 + -3)/2 = 2/2 = 1.\nThus, the midpoint coordinates are (1, 1).',
    hint: 'Simply average the x-coordinates and average the y-coordinates: (x1 + x2)/2 and (y1 + y2)/2.',
    difficulty: 'Easy',
    marks: 3,
    examName: 'WAEC',
    examYear: 2023,
    questionNumber: 15
  },
  {
    id: 'eng-7',
    subject: 'English Language',
    topic: 'Prepositions',
    type: 'mcq',
    text: 'Complete the sentence with the grammatically correct preposition:\n\n"Ngozi is senior ________ me in the civil service by three years."',
    options: [
      'to',
      'than',
      'by',
      'for'
    ],
    correctAnswer: '0',
    explanation: 'Adjectives like "senior", "junior", "superior", and "inferior" represent custom Latin comparatives and are idiomatically paired with "to" instead of the standard "than". Therefore, "senior to me" is correct.',
    hint: 'Do not use "than" with Latin comparison adjectives like senior, junior, and superior.',
    difficulty: 'Easy',
    marks: 2,
    examName: 'WAEC',
    examYear: 2022,
    questionNumber: 28
  },
  {
    id: 'eng-8',
    subject: 'English Language',
    topic: 'Lexis and Structure',
    type: 'mcq',
    text: 'Choose the option that is nearest in meaning to the underlined word:\n\n"The chairman delivered a *succinct* speech that saved the cabinet from long debate."',
    options: [
      'concise',
      'verbose',
      'redundant',
      'boring'
    ],
    correctAnswer: '0',
    explanation: '"Succinct" means brief, clear, and expressed in few words. Its nearest synonym among the options is therefore "concise".',
    hint: 'If it saved them from a long debate, it must have been short and to the point.',
    difficulty: 'Easy',
    marks: 2,
    examName: 'WAEC',
    examYear: 2023,
    questionNumber: 4
  },
  {
    id: 'phy-6',
    subject: 'Physics',
    topic: 'Mechanics & Motion',
    type: 'mcq',
    text: 'An orange fruit falls freely from a tree branch at a height of 20 m above the ground. Calculate its velocity just before hitting the ground. [Take g = 10 m/s² and ignore air resistance]',
    options: [
      '10 m/s',
      '20 m/s',
      '40 m/s',
      '200 m/s'
    ],
    correctAnswer: '1',
    explanation: 'Using the equation of motion for free fall: v² = u² + 2gh\nSince the orange falls from rest, initial velocity u = 0.\nv² = 0 + 2 * 10 * 20\nv² = 400\nv = √400 = 20 m/s.',
    hint: 'Use the third equation of motion: v² = u² + 2gh, where u is 0 because it falls from rest.',
    difficulty: 'Medium',
    marks: 3,
    examName: 'WAEC',
    examYear: 2022,
    questionNumber: 6
  },
  {
    id: 'chem-6',
    subject: 'Chemistry',
    topic: 'Gas Laws',
    type: 'mcq',
    text: 'According to Graham\'s law of diffusion, under the same conditions of temperature and pressure, hydrogen gas (Molar Mass = 2 g/mol) diffuses ________ times faster than oxygen gas (Molar Mass = 32 g/mol).',
    options: [
      '2',
      '4',
      '8',
      '16'
    ],
    correctAnswer: '1',
    explanation: 'Graham\'s Law states that the rate of diffusion of a gas (R) is inversely proportional to the square root of its molecular mass (M).\nR_H / R_O = √(M_O / M_H) = √(32 / 2) = √16 = 4.\nHence, hydrogen diffuses 4 times faster than oxygen.',
    hint: 'The ratio of rates is equal to the square root of the inverse matching molar masses: √(32 / 2).',
    difficulty: 'Medium',
    marks: 3,
    examName: 'WAEC',
    examYear: 2021,
    questionNumber: 41
  },
  {
    id: 'bio-6',
    subject: 'Biology',
    topic: 'Genetics',
    type: 'mcq',
    text: 'In human genetics, color blindness is a sex-linked recessive trait carried on the X chromosome. If a normal sight man marries a carrier sight woman (X^C X^c), what is the probability of them having a color-blind son?',
    options: [
      '0.00 (0%)',
      '0.25 (25%)',
      '0.50 (50%)',
      '1.00 (100%)'
    ],
    correctAnswer: '1',
    explanation: 'Let man gen = X^C Y and carrier female = X^C X^c.\nThe potential offspring combinations are:\n1. X^C X^C (Normal female)\n2. X^C X^c (Carrier female)\n3. X^C Y (Normal male)\n4. X^c Y (Color-blind male son)\nOut of all 4 possible births, only 1 is a color-blind male, which represents a probability of 1 in 4, or 0.25 (25%).',
    hint: 'Complete a cross box of (X^C, Y) and (X^C, X^c). Only one block out of the four will yield a male with the recessive trait.',
    difficulty: 'Hard',
    marks: 4,
    examName: 'WAEC',
    examYear: 2022,
    questionNumber: 49
  },
  {
    id: 'eco-5',
    subject: 'Economics',
    topic: 'Demand & Supply',
    type: 'mcq',
    text: 'The Production Possibility Curve (PPC) is normally concave to the origin due to the rule of:',
    options: [
      'Increasing opportunity costs',
      'Decreasing returns to scale',
      'Diminishing marginal utility',
      'Supply and demand equilibrium'
    ],
    correctAnswer: '0',
    explanation: 'The concave shape of the PPC reflects the law of increasing opportunity cost, which states that as you produce more of one good, you must give up increasingly larger amounts of the other good since resources are not equally efficient in producing both.',
    hint: 'Contrast equal re-allocations of resources. Moving resources across products becomes less efficient, making opportunity cost...',
    difficulty: 'Medium',
    marks: 3,
    examName: 'WAEC',
    examYear: 2022,
    questionNumber: 3
  },
  {
    id: 'gov-5',
    subject: 'Government',
    topic: 'Types of Government',
    type: 'mcq',
    text: 'Which of the following pre-colonial West African political structures was highly decentralized and democratic, running majorly without a single centralized monarch?',
    options: [
      'The pre-colonial Fulani Empire',
      'The pre-colonial Oyo Empire',
      'The pre-colonial Igbo political system',
      'The pre-colonial Ashanti Kingdom'
    ],
    correctAnswer: '2',
    explanation: 'The pre-colonial Igbo system was characterized by a highly decentralized, acephalous (headless) political structure where decisions were democratic and taken by consensus through councils of elders (Amala), age grades, and title societies (Ozo) rather than a single absolute executive King.',
    hint: 'This group is often referred to as acephalous or segmentary in traditional political history.',
    difficulty: 'Easy',
    marks: 3,
    examName: 'WAEC',
    examYear: 2022,
    questionNumber: 24
  },
  {
    id: 'math-11',
    subject: 'Mathematics',
    topic: 'Quadratic Equations',
    type: 'mcq',
    text: 'Which of the following is a factor of the quadratic expression: 2x² - x - 15?',
    options: [
      '2x + 5',
      '2x - 5',
      'x + 3',
      '2x + 3'
    ],
    correctAnswer: '0',
    explanation: 'To factorize 2x² - x - 15:\nWe need two numbers that multiply to (2 * -15) = -30 and sum to -1.\nThese numbers are -6 and +5.\nWrite -x as -6x + 5x:\n2x² - 6x + 5x - 15 = 0\n2x(x - 3) + 5(x - 3) = 0\n(2x + 5)(x - 3) = 0.\nTherefore, the factors are (2x + 5) and (x - 3). "2x + 5" is the correct option.',
    hint: 'Find factors of -30 that add up to -1. They are -6 and 5.',
    difficulty: 'Medium',
    marks: 3,
    examName: 'WAEC',
    examYear: 2022,
    questionNumber: 14
  },
  {
    id: 'math-12',
    subject: 'Mathematics',
    topic: 'Statistics',
    type: 'mcq',
    text: 'If y is inversely proportional to x² and y = 4 when x = 3, find y when x = 2.',
    options: [
      '9',
      '6',
      '12',
      '18'
    ],
    correctAnswer: '0',
    explanation: 'y ∝ 1/x² => y = k/x²\nSubstitute y=4, x=3 to find constant k:\n4 = k / 3² => 4 = k / 9 => k = 36.\nNow, find y when x=2:\ny = k/x² = 36 / 2² = 36 / 4 = 9.',
    hint: 'Set up the equation y = k / x^2, solve for k, then compute the value of y when x is 2.',
    difficulty: 'Medium',
    marks: 3,
    examName: 'WAEC',
    examYear: 2021,
    questionNumber: 11
  },
  {
    id: 'math-13',
    subject: 'Mathematics',
    topic: 'Set Theory',
    type: 'mcq',
    text: 'If the universal set U = {x : 1 ≤ x ≤ 10, x is an integer}, and subsets P = {x : x is a prime number} and Q = {x : x is an odd number}, find the set representing P ∩ Q\'.',
    options: [
      '{2}',
      '{3, 5, 7}',
      '{1, 9}',
      '{2, 4, 6, 8, 10}'
    ],
    correctAnswer: '0',
    explanation: 'U = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10}\nP (primes) = {2, 3, 5, 7}\nQ (odds) = {1, 3, 5, 7, 9}\nQ\' (numbers not in Q) = {2, 4, 6, 8, 10}\nP ∩ Q\' (elements in both P and Q\') = {2}.',
    hint: 'Define each subset in roster form first, find the complement of Q, and determine what is in both sets.',
    difficulty: 'Medium',
    marks: 3,
    examName: 'WAEC',
    examYear: 2022,
    questionNumber: 2
  },
  {
    id: 'math-14',
    subject: 'Mathematics',
    topic: 'Trigonometry',
    type: 'mcq',
    text: 'The third term of a Geometric Progression (G.P.) is 360 and the sixth term is 1215. Find the common ratio of the progression.',
    options: [
      '3/2',
      '2/3',
      '9/4',
      '4/9'
    ],
    correctAnswer: '0',
    explanation: 'Let first term be a and common ratio be r.\nT3 = a * r² = 360\nT6 = a * r⁵ = 1215\nDivide T6 by T3:\n(a * r⁵) / (a * r²) = 1215 / 360\nr³ = 27 / 8\nr = 3 / 2.',
    hint: 'Divide the sixth term equation by the third term equation to solve for the cube of the common ratio.',
    difficulty: 'Hard',
    marks: 4,
    examName: 'WAEC',
    examYear: 2022,
    questionNumber: 31
  },
  {
    id: 'math-15',
    subject: 'Mathematics',
    topic: 'Statistics',
    type: 'mcq',
    text: 'The sum of the ages of a father and his son is 50 years. Five years ago, the father\'s age was seven times that of his son. Find the father\'s present age.',
    options: [
      '40 years',
      '35 years',
      '45 years',
      '42 years'
    ],
    correctAnswer: '0',
    explanation: 'Let Father\'s present age be F and Son\'s present age be S.\nF + S = 50 (Equation 1)\nFive years ago:\nF - 5 = 7(S - 5)\nF - 5 = 7S - 35\nF - 7S = -30 (Equation 2)\nSubtract Equation 2 from Equation 1:\n(F + S) - (F - 7S) = 50 - (-30)\n8S = 80 => S = 10.\nS = 10 => F = 40 years.',
    hint: 'Form two equations: F + S = 50 and F - 5 = 7(S - 5), and solve simultaneously.',
    difficulty: 'Medium',
    marks: 4,
    examName: 'WAEC',
    examYear: 2020,
    questionNumber: 15
  },
  {
    id: 'phy-7',
    subject: 'Physics',
    topic: 'Waves',
    type: 'mcq',
    text: 'Which of the following physical wave phenomena is a property that is strictly unique to transverse waves and cannot be exhibited by longitudinal sound waves?',
    options: [
      'Polarization',
      'Diffraction',
      'Refraction',
      'Reflection'
    ],
    correctAnswer: '0',
    explanation: 'Polarization is the process of confining wave vibrations to a single plane. It can only occur in transverse waves because their vibrations are perpendicular to wave propagation. Sound waves are longitudinal and cannot be polarized.',
    hint: 'Think of the process that limits vibration direction into a singular geometric plane.',
    difficulty: 'Medium',
    marks: 3,
    examName: 'WAEC',
    examYear: 2022,
    questionNumber: 27
  },
  {
    id: 'phy-8',
    subject: 'Physics',
    topic: 'Electricity',
    type: 'mcq',
    text: 'An electric lamp is marked "240 V, 60 W". Calculate the resistance of its filament under normal working conditions.',
    options: [
      '960 Ω',
      '14400 Ω',
      '4 Ω',
      '240 Ω'
    ],
    correctAnswer: '0',
    explanation: 'Using the electric power formulas: P = V² / R.\nRearranging for resistance R:\nR = V² / P = (240)² / 60 = 57600 / 60 = 960 Ω.',
    hint: 'Use the power formula connecting voltage, power, and resistance: P = V^2 / R.',
    difficulty: 'Easy',
    marks: 3,
    examName: 'WAEC',
    examYear: 2021,
    questionNumber: 21
  },
  {
    id: 'chem-7',
    subject: 'Chemistry',
    topic: 'Atomic Structure',
    type: 'mcq',
    text: 'The gas that uniquely gives a sharp "pop" sound when tested with a lighted mathematical/wooden splinter is:',
    options: [
      'Hydrogen',
      'Oxygen',
      'Carbon dioxide',
      'Nitrogen'
    ],
    correctAnswer: '0',
    explanation: 'Hydrogen gas is highly highly flammable and burns with a characteristic miniature explosion that creates a distinct "pop" sound when exposed to a flame.',
    hint: 'What element is the lightest, highly combustible, and makes a tiny pop under open fire?',
    difficulty: 'Easy',
    marks: 2,
    examName: 'WAEC',
    examYear: 2022,
    questionNumber: 15
  },
  {
    id: 'chem-8',
    subject: 'Chemistry',
    topic: 'Stoichiometry',
    type: 'mcq',
    text: 'Determine the oxidation number of sulfur in a molecule of tetraoxosulphate (VI) acid (H₂SO₄).',
    options: [
      '+6',
      '+4',
      '+2',
      '-2'
    ],
    correctAnswer: '0',
    explanation: 'The sum of oxidation states in a neutral compound is 0.\nFor H₂SO₄:\n2(H) + S + 4(O) = 0\n2(+1) + S + 4(-2) = 0\n2 + S - 8 = 0\nS - 6 = 0 => S = +6.',
    hint: 'Using states H = +1 and O = -2, write an algebraic equation that equals 0.',
    difficulty: 'Easy',
    marks: 3,
    examName: 'WAEC',
    examYear: 2023,
    questionNumber: 3
  },
  {
    id: 'chem-9',
    subject: 'Chemistry',
    topic: 'Organic Chemistry',
    type: 'mcq',
    text: 'The catalyst used in the commercial Contact Process for the manufacture of tetraoxosulphate (VI) acid (H₂SO₄) is:',
    options: [
      'Vanadium (V) oxide',
      'Finely divided iron',
      'Platinum black',
      'Nickel'
    ],
    correctAnswer: '0',
    explanation: 'In the industrial Contact Process, Vanadium (V) oxide (V₂O₅) acts as the catalyst to speed up the reversible oxidation of SO₂ to SO₃.',
    hint: 'This compound contains an transition metal with oxidation state +5 and is used in sulfuric acid synthesis.',
    difficulty: 'Medium',
    marks: 3,
    examName: 'WAEC',
    examYear: 2021,
    questionNumber: 29
  },
  {
    id: 'eng-9',
    subject: 'English Language',
    topic: 'Lexis and Structure',
    type: 'mcq',
    text: 'Choose the word that is opposite in meaning to the underlined word:\n\n"The manager made *disparaging* remarks about the employee\'s performance instead of offering constructive suggestions."',
    options: [
      'complimentary',
      'critical',
      'sarcastic',
      'objective'
    ],
    correctAnswer: '0',
    explanation: '"Disparaging" means expressing the opinion that something is of little worth; derogatory. The opposite is "complimentary", which means expressing praise or approval.',
    hint: 'Look for an antonym that represents praise rather than criticism.',
    difficulty: 'Medium',
    marks: 2,
    examName: 'WAEC',
    examYear: 2022,
    questionNumber: 10
  }
];

export const SUBJECTS_LIST = [
  'Mathematics',
  'English Language',
  'Physics',
  'Chemistry',
  'Biology',
  'Economics',
  'Government'
];

export const TOPICS_BY_SUBJECT: { [key: string]: string[] } = {
  'Mathematics': ['Set Theory', 'Geometry', 'Logarithms', 'Quadratic Equations', 'Statistics'],
  'English Language': ['Lexis and Structure', 'Prepositions'],
  'Physics': ['Mechanics & Motion', 'Waves', 'Electricity'],
  'Chemistry': ['Atomic Structure', 'Stoichiometry', 'Organic Chemistry', 'Gas Laws'],
  'Biology': ['Cell Biology', 'Skeletal Systems', 'Ecology', 'Genetics'],
  'Economics': ['Demand & Supply', 'Market Structures'],
  'Government': ['Constitutional Development', 'Types of Government', 'Public Administration']
};

export const MOTIVATIONAL_QUOTES = [
  "Success is the sum of small efforts, repeated day in and day out. Keep practicing!",
  "Your WAEC grade is a stepping stone to your university dreams. Put in the work today!",
  "Make your parents proud, WAEC is not hard when you prepare with dedication.",
  "You are capable of scoring parallel A1s. Study smart and stay focused!",
  "Consistency beats talent. Complete your daily missions to stay on top!",
  "Don't study to pass, study to understand. You've got this!"
];

export const MISSION_TEMPLATES = [
  { id: 'm1', description: 'Practice 3 WAEC Questions', target: 3, xpReward: 50, type: 'answer_questions' },
  { id: 'm2', description: 'Maintain 3+ Days Active Streak', target: 3, xpReward: 100, type: 'streak_maintain' },
  { id: 'm3', description: 'Win 1 Multiplayer Quiz Battle', target: 1, xpReward: 75, type: 'win_battle' },
  { id: 'm4', description: 'Score above 80% on any Quiz', target: 1, xpReward: 60, type: 'score_percentage' }
];
