import { Question } from "../types";

// Helper to shuffle helper
function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => 0.5 - Math.random());
}

/**
 * Procedural Question Generator for WAEC & JAMB
 * Generates highly realistic, academically accurate questions with complete explanation steps.
 */
function generateOneQuestion(
  subject: string,
  year: number,
  examName: "WAEC" | "JAMB",
  questionNumber: number,
  seed: number,
  forcedTopic?: string,
): Question {
  const id = `synth-${subject.toLowerCase().replace(/\s+/g, "-")}-${year}-${questionNumber}-${seed}`;

  // Choose topic
  const topics = {
    Mathematics: [
      "Quadratic Equations",
      "Trigonometry",
      "Set Theory",
      "Calculus (Further Maths)",
      "Statistics",
      "Geometry",
      "Logarithms",
      "Arithmetic Progression (AP)",
    ],
    "English Language": [
      "Lexis and Structure",
      "Prepositions",
      "Synonyms & Antonyms",
      "Direct & Indirect Speech",
      "Reading Comprehension",
    ],
    Physics: [
      "Mechanics & Motion",
      "Radioactivity",
      "Electricity",
      "Waves",
      "Thermodynamics",
      "Gravitational Fields",
    ],
    Chemistry: [
      "Gas Laws",
      "Chemical Equilibrium",
      "Atomic Structure",
      "Electrochemistry",
      "Organic Chemistry",
      "Stoichiometry",
    ],
    Biology: [
      "Cell Biology",
      "Genetics",
      "Ecology",
      "Skeletal Systems",
      "Evolution",
      "Plant Nutrition",
    ],
    Economics: [
      "Demand & Supply",
      "Market Structures",
      "National Income",
      "Inflation",
      "International Trade",
    ],
    Government: [
      "Constitutional Development",
      "Types of Government",
      "Public Administration",
      "Foreign Policy",
    ],
  }[subject] || ["General Studies"];

  const topic = forcedTopic || topics[seed % topics.length];

  let qText = "";
  let options: string[] = [];
  let correctAnswer = "0";
  let explanation = "";
  let hint = "";
  let difficulty: "Easy" | "Medium" | "Hard" = "Medium";
  let marks = 3;

  // Make distinct varieties using a variety code: Math.floor(seed / topics.length)
  const variety = Math.floor(seed / topics.length) % 6;

  if (subject === "Mathematics") {
    if (topic === "Quadratic Equations") {
      // Coefficients for (x - r1)(x - r2) = 0 => x^2 - (r1+r2)x + r1*r2 = 0
      const roots = [
        [2, 3],
        [1, 5],
        [2, 4],
        [3, 4],
        [1, 6],
        [3, 5],
      ][seed % 6];
      const r1 = roots[0];
      const r2 = roots[1];
      const sum = r1 + r2;
      const prod = r1 * r2;
      qText = `Solve for x in the quadratic equation: x² - ${sum}x + ${prod} = 0.`;
      options = [
        `x = ${r1} or x = ${r2}`,
        `x = -${r1} or x = ${r2}`,
        `x = ${r1} or x = -${r2}`,
        `x = -${r1} or x = -${r2}`,
      ];
      correctAnswer = "0";
      explanation = `We look for two numbers that multiply to the constant term (${prod}) and sum up to the coefficient of x (-${sum}).\nThese numbers are -${r1} and -${r2}.\nThus, the equation factorizes into (x - ${r1})(x - ${r2}) = 0.\nThis gives the roots: x = ${r1} or x = ${r2}.`;
      hint = `Find two numbers that multiply to ${prod} and add up to -${sum}.`;
      difficulty = "Medium";
      marks = 4;
    } else if (topic === "Trigonometry") {
      const angles = [30, 45, 60];
      const angle = angles[seed % angles.length];
      const ladderLen = ((seed % 3) + 2) * 4; // 8, 12, 16
      if (angle === 30) {
        const height = ladderLen / 2;
        qText = `A ladder of length ${ladderLen}m leans against a vertical office wall. If the ladder makes an angle of 30° with the horizontal ground, how far up the wall does it reach?`;
        options = [
          `${height}m`,
          `${height}√3m`,
          `${ladderLen}m`,
          `${height / 2}m`,
        ];
        correctAnswer = "0";
        explanation = `Using the sin ratio:\nsin(30°) = opposite / hypotenuse = height / ${ladderLen}.\nSince sin(30°) = 0.5, we get: height = ${ladderLen} * 0.5 = ${height}m.`;
        hint = `Recall sin(30°) = 0.5. Use sine of the angle equals opposite height over ladder length.`;
      } else {
        const hsq = (ladderLen * ladderLen) / 2;
        qText = `Find the height of a building if a surveyor 10m away from the foot of the building measures the angle of elevation of the top to be 45°.`;
        options = [`5m`, `10m`, `15m`, `20m`];
        correctAnswer = "1";
        explanation = `Using the tangent ratio:\ntan(45°) = height / distance = height / 10.\nSince tan(45°) = 1, we get: height = 10 * 1 = 10m.`;
        hint = `At 45° elevation, the horizontal distance equals the vertical height.`;
      }
      difficulty = "Easy";
      marks = 3;
    } else if (topic === "Set Theory") {
      const total = 50 + (seed % 5) * 10; // 50, 60, ...
      const neither = 5 + (seed % 4); // 5, 6, 7
      const both = 10 + (seed % 5); // 10, 11
      const mathOnly = 20 + (seed % 8);
      const phyOnly = total - neither - both - mathOnly;
      const mathTotal = mathOnly + both;
      const phyTotal = phyOnly + both;

      qText = `In a class of ${total} students, ${mathTotal} take Mathematics, ${phyTotal} take Physics, and ${neither} offer neither subject. How many students offer both subjects?`;
      options = [`${both - 3}`, `${both}`, `${both + 5}`, `${both + 2}`];
      correctAnswer = "1";
      explanation = `Formula: Total = n(M) + n(P) - n(M ∩ P) + n(Neither)\n${total} = ${mathTotal} + ${phyTotal} - x + ${neither}\n${total} = ${mathTotal + phyTotal + neither} - x\nx = ${mathTotal + phyTotal + neither} - ${total} = ${both}.`;
      hint = `Combine Mathematics tally and Physics tally and Neither tally, and find the overlap excess over total students.`;
      difficulty = "Medium";
      marks = 3;
    } else if (topic === "Calculus (Further Maths)") {
      const coef = 2 + (seed % 3); // 2, 3, 4
      const power = 3;
      const xVal = 2;
      // y = coef * x^3 + 4x - 5 => dy/dx = 3 * coef * x^2 + 4
      const derVal = 3 * coef * xVal * xVal + 4;
      qText = `Determine the gradient of the curve y = ${coef}x³ + 4x - 5 at the point where x = ${xVal}.`;
      options = [
        `${derVal - 10}`,
        `${derVal}`,
        `${derVal + 8}`,
        `${derVal * 2}`,
      ];
      correctAnswer = "1";
      explanation = `Differentiate y with respect to x:\ndy/dx = 3 * ${coef}x² + 4 = ${3 * coef}x² + 4.\nSubstitute x = ${xVal}:\ndy/dx = ${3 * coef}(${xVal})² + 4 = ${3 * coef}(4) + 4 = ${12 * coef} + 4 = ${derVal}.`;
      hint = `First find the derivative of the polynomial: dy/dx = 3 * coef * x² + 4, then substitute the x coordinate.`;
      difficulty = "Hard";
      marks = 5;
    } else {
      // Logarithms
      const base = [2, 3, 5][seed % 3];
      const pow = [2, 3][seed % 2];
      const val = Math.pow(base, pow);
      const constant = (seed % 4) + 1; // 1, 2, 3, 4
      qText = `Solve for y: log_${base} (y + ${constant}) = ${pow}.`;
      options = [
        `${val - constant}`,
        `${val}`,
        `${val + constant}`,
        `${val + 2}`,
      ];
      correctAnswer = "0";
      explanation = `In exponential form:\nbase^power = number\n${base}^${pow} = y + ${constant}\n${val} = y + ${constant}\ny = ${val} - ${constant} = ${val - constant}.`;
      hint = `Convert the logarithmic equation base^rhs = value.`;
      difficulty = "Easy";
      marks = 3;
    }
  } else if (subject === "English Language") {
    if (topic === "Prepositions") {
      const optionsPool = [
        ["congratulated him _______ his promotion", "on", "for", "at", "with"],
        [
          "charged with complicity _______ the conspiracy",
          "in",
          "of",
          "for",
          "about",
        ],
        [
          "protested bitter _______ the new levies",
          "against",
          "for",
          "on",
          "with",
        ],
        [
          "accused her _______ stealing the school files",
          "of",
          "for",
          "about",
          "on",
        ],
      ];
      const selectedPool = optionsPool[seed % optionsPool.length];
      qText = `Complete the sentence with the most precise preposition:\n\n"The board of directors ${selectedPool[0]}."`;
      options = [
        selectedPool[1],
        selectedPool[2],
        selectedPool[3],
        selectedPool[4],
      ];
      // Shuffle options but track correct answer
      const correctText = selectedPool[1];
      const shuff = shuffleArray(options);
      options = shuff;
      correctAnswer = shuff.indexOf(correctText).toString();
      explanation = `By standard lexical collocations, the verb/noun is paired grammatical idiomatically with the preposition "${correctText}".`;
      hint = `Identify standard Nigerian/West African examination register pairings.`;
      difficulty = "Easy";
      marks = 2;
    } else if (topic === "Lexis and Structure") {
      const optionsPool = [
        [
          "Neither of the two candidates _______ qualified for the senior administrator position.",
          "is",
          "are",
          "were",
          "have been",
          "0",
          'According to concord rules, "neither" as a pronoun is singular and takes the singular verb "is".',
        ],
        [
          "By the time the school head arrived, the students _______ the assembly ground.",
          "had left",
          "have left",
          "were leaving",
          "left",
          "0",
          'When two actions occur in the past, the earlier event takes the past perfect tense ("had left").',
        ],
        [
          "The teacher, as well as the students, _______ expected to attend the sports seminar.",
          "is",
          "are",
          "have been",
          "were",
          "0",
          'When parenthetical phrases like "as well as" are used, the verb agrees with the first subject ("The teacher"), which is singular ("is").',
        ],
      ];
      const selectedPool = optionsPool[seed % optionsPool.length];
      qText = `Fill the blank space with the most grammatically correct option:\n\n"${selectedPool[0]}"`;
      options = [
        selectedPool[1],
        selectedPool[2],
        selectedPool[3],
        selectedPool[4],
      ];
      const correctText = selectedPool[Number(selectedPool[5]) + 1];
      const shuff = shuffleArray(options);
      options = shuff;
      correctAnswer = shuff.indexOf(correctText).toString();
      explanation = selectedPool[6] as string;
      hint = `Focus on singular/plural subject-verb concord or past tense markers.`;
      difficulty = "Medium";
      marks = 2;
    } else if (topic === "Synonyms & Antonyms") {
      const words = [
        [
          "gregarious",
          "sociable",
          "hostile",
          "shy",
          "unfriendly",
          "nearest in meaning",
          "extroverted, fond of company",
        ],
        [
          "ephemeral",
          "short-lived",
          "everlasting",
          "beautiful",
          "expensive",
          "nearest in meaning",
          "lasting for a very short duration",
        ],
        [
          "taciturn",
          "silent",
          "garrulous",
          "loud",
          "vocal",
          "nearest in meaning",
          "reserved or uncommunicative in speech",
        ],
        [
          "scrupulous",
          "careful",
          "negligent",
          "unreliable",
          "dishonest",
          "nearest in meaning",
          "extremely attentive to details; careful",
        ],
      ];
      const selectedWord = words[seed % words.length];
      qText = `Choose the option that is NEAREST IN MEANING to the underlined word:\n\n"The new class prefect is highly *${selectedWord[0]}*."`;
      options = [
        selectedWord[1],
        selectedWord[2],
        selectedWord[3],
        selectedWord[4],
      ];
      const correctText = selectedWord[1];
      const shuff = shuffleArray(options);
      options = shuff;
      correctAnswer = shuff.indexOf(correctText).toString();
      explanation = `"${selectedWord[0]}" means "${selectedWord[6]}", hence "${correctText}" is the nearest in meaning.`;
      hint = `Does this word denote friendliness, short-lived nature, quietness, or precision?`;
      difficulty = "Medium";
      marks = 2;
    } else {
      // Direct & Indirect Speech
      qText = `Identify the correct reported speech format of the direct sentence:\n\n"Kofi said, 'I will write my WAEC exams tomorrow.'"`;
      options = [
        "Kofi said that he would write his WAEC exams the following day.",
        "Kofi said that I will write my WAEC exams tomorrow.",
        "Kofi said that he will write his WAEC exams the following day.",
        "Kofi said that he would write his WAEC exams tomorrow.",
      ];
      correctAnswer = "0";
      explanation = `When transforming to reported speech:\n- "said" becomes "said that..."\n- "I" becomes "he"\n- "will" shifts back to "would"\n- "tomorrow" is modified to "the following day" or "the next day".`;
      hint = `Both pronouns and tenses shift backwards in indirect past logs. "Tomorrow" becomes "the following day".`;
      difficulty = "Medium";
      marks = 2;
    }
  } else if (subject === "Physics") {
    if (topic === "Electricity") {
      const r1 = [2, 3, 4][seed % 3];
      const r2 = [2, 4, 6][seed % 3];
      // series or parallel
      if (seed % 2 === 0) {
        qText = `Calculate the equivalent resistance of two resistors of values ${r1}Ω and ${r2}Ω connected in series.`;
        options = [
          `${r1 + r2}Ω`,
          `${((r1 * r2) / (r1 + r2)).toFixed(2)}Ω`,
          `${r1}Ω`,
          `${r2}Ω`,
        ];
        correctAnswer = "0";
        explanation = `For series connections, simply sum the individual values:\nR_eq = R1 + R2 = ${r1} + ${r2} = ${r1 + r2}Ω.`;
        hint = `Resistors in series are directly additive.`;
      } else {
        const rParallel = (r1 * r2) / (r1 + r2);
        qText = `Calculate the equivalent resistance of two resistors of values ${r1}Ω and ${r2}Ω connected in parallel.`;
        options = [
          `${rParallel.toFixed(2)}Ω`,
          `${r1 + r2}Ω`,
          `${r1 * r2}Ω`,
          `1Ω`,
        ];
        correctAnswer = "0";
        explanation = `For parallel connection of two resistors:\n1/R_eq = 1/R1 + 1/R2 => R_eq = (R1 * R2) / (R1 + R2).\nSubstituting values: (${r1} * ${r2}) / (${r1} + ${r2}) = ${r1 * r2} / ${r1 + r2} = ${rParallel.toFixed(2)}Ω.`;
        hint = `Product/Sum formula for twin parallel resistance.`;
      }
      difficulty = "Medium";
      marks = 3;
    } else if (topic === "Waves") {
      const velocities = [330, 340, 1500];
      const v = velocities[seed % velocities.length];
      const f = [100, 200, 500, 1000][seed % 4];
      const lambda = v / f;
      qText = `A wave traveling in a medium has a velocity of ${v} m/s and a frequency of ${f} Hz. Calculate the wavelength of the wave.`;
      options = [
        `${lambda.toFixed(2)}m`,
        `${(v * f).toFixed(0)}m`,
        `${f / v}m`,
        `0.5m`,
      ];
      correctAnswer = "0";
      explanation = `Using the wave equation: v = f * λ.\nRearranging for wavelength: λ = v / f.\nSubstituting values: λ = ${v} / ${f} = ${lambda.toFixed(2)}m.`;
      hint = `Apply formula lambda = velocity / frequency.`;
      difficulty = "Easy";
      marks = 3;
    } else {
      // Mechanics & Motion
      const mass = 5 + (seed % 5); // 5, 6, 7
      const velocity = 4 + (seed % 4); // 4, 5, 6
      const ke = 0.5 * mass * velocity * velocity;
      qText = `Determine the kinetic energy of a body of mass ${mass}kg moving with a steady velocity of ${velocity} m/s.`;
      options = [
        `${ke} J`,
        `${mass * velocity} J`,
        `${ke * 2} J`,
        `${mass * velocity * velocity} J`,
      ];
      correctAnswer = "0";
      explanation = `Formula for kinetic energy: K.E. = 0.5 * m * v².\nSubstituting values: K.E. = 0.5 * ${mass} * (${velocity})² = 0.5 * ${mass} * ${velocity * velocity} = ${ke} Joules.`;
      hint = `Compute half of mass times velocity squared.`;
      difficulty = "Easy";
      marks = 3;
    }
  } else if (subject === "Chemistry") {
    if (topic === "Gas Laws") {
      const v1 = 100 + (seed % 5) * 50; // 100, 150...
      const p1 = 2; // atm
      const p2 = 4; // atm
      const v2 = (p1 * v1) / p2;
      qText = `According to Boyle's law, a gas occupies ${v1} cm³ at a pressure of ${p1} atm. What volume will it occupy if pressure is increased to ${p2} atm at constant temperature?`;
      options = [
        `${v2} cm³`,
        `${v1 * 2} cm³`,
        `${v1 * 4} cm³`,
        `${v2 / 2} cm³`,
      ];
      correctAnswer = "0";
      explanation = `Boyle's Law formula for isothermal changes is: P1 * V1 = P2 * V2.\nRearranging for V2: V2 = (P1 * V1) / P2.\nSubstituting values: V2 = (${p1} * ${v1}) / ${p2} = ${v2} cm³.`;
      hint = `Boyle's Law is P1*V1 = P2*V2. Since pressure doubled, volume must halve.`;
      difficulty = "Easy";
      marks = 3;
    } else if (topic === "Atomic Structure") {
      const element = [
        ["Carbon-14", 14, 6],
        ["Oxygen-18", 18, 8],
        ["Sodium-23", 23, 11],
        ["Chlorine-37", 37, 17],
      ][seed % 4];
      const name = element[0];
      const massNum = element[1] as number;
      const atomicNum = element[2] as number;
      const neutrons = massNum - atomicNum;
      qText = `Determine the number of neutrons present in the nucleus of an atom of ${name} (${massNum} at the top, ${atomicNum} at the bottom).`;
      options = [
        `${neutrons}`,
        `${atomicNum}`,
        `${massNum}`,
        `${massNum + atomicNum}`,
      ];
      correctAnswer = "0";
      explanation = `Number of neutrons is computed by subtracting the atomic number (Z, protons) from the overall mass number (A, protons + neutrons).\nNeutrons = A - Z = ${massNum} - ${atomicNum} = ${neutrons}.`;
      hint = `Subtract the smaller lower number from the larger upper mass rating.`;
      difficulty = "Easy";
      marks = 2;
    } else {
      // Organic Chemistry
      const formula = [
        "CH3-CH2-CH3",
        "CH3-CH2-CH2-CH3",
        "CH3-CH=CH2",
        "CH3-C≡CH",
      ][seed % 4];
      const names = ["propane", "butane", "propene", "propyne"];
      const corrName = names[seed % 4];
      qText = `Give the systematic IUPAC name for the hydrocarbon represented by the skeletal structure: ${formula}.`;
      options = [corrName, "ethane", "ethene", "pentane"];
      const shuff = shuffleArray(options);
      options = shuff;
      correctAnswer = shuff.indexOf(corrName).toString();
      explanation = `The hydrocarbon possesses ${3 + (seed % 4 === 1 ? 1 : 0)} Carbon atoms. The suffix corresponds to the saturation state of its carbon-carbon bonds. Thus, its systematic IUPAC name is ${corrName}.`;
      hint = `Identify continuous carbon chain size (3 carbons = prop, 4 carbons = but) and saturation index.`;
      difficulty = "Medium";
      marks = 3;
    }
  } else if (subject === "Biology") {
    if (topic === "Cell Biology") {
      const organelles = [
        [
          "Mitochondrion",
          "is responsible for respiration and generating ATP",
          "chloroplast",
          "ribosome",
          "vacuole",
        ],
        [
          "Ribosome",
          "is the organelle that serves as the site for protein synthesis",
          "mitochondrion",
          "nucleus",
          "lysosome",
        ],
        [
          "Chloroplast",
          "contains chlorophyll and acts as the site for photosynthesis",
          "mitochondrion",
          "cell wall",
          "vacuole",
        ],
        [
          "Lysosome",
          "functions as the digestive center for destroying worn-out cell structures",
          "Golgi complex",
          "ribosome",
          "centriole",
        ],
      ];
      const currOrg = organelles[seed % organelles.length];
      qText = `Which cell organelle ${currOrg[1]}?`;
      options = [currOrg[0], currOrg[2], currOrg[3], currOrg[4]];
      const corrText = currOrg[0];
      const shuff = shuffleArray(options);
      options = shuff;
      correctAnswer = shuff.indexOf(corrText).toString();
      explanation = `The ${corrText} ${currOrg[1]}.`;
      hint = `Does this relate to powerhouses, protein builders, sun capturers, or recycling bins?`;
      difficulty = "Easy";
      marks = 2;
    } else if (topic === "Genetics") {
      qText = `In a monohybrid cross between a homozygous dominant purple flower (PP) and a homozygous recessive white flower (pp), what percentage of the F1 generation will produce purple flowers?`;
      options = ["100%", "75%", "50%", "25%"];
      correctAnswer = "0";
      explanation = `All F1 offspring will receive a dominant 'P' gene from the first parent and a recessive 'p' gene from the second parent, giving them the heterozygous genotype 'Pp'. Since purple is dominant, 100% of F1 plants will exhibit purple flowers.`;
      hint = `All F1 generation share the identical hybrid heterozygous dominant trait.`;
      difficulty = "Easy";
      marks = 3;
    } else {
      // Ecology
      qText = `In a typical West African terrestrial food chain, green grass is consumed by grasshoppers, which are eaten by lizards, which are in turn preyed on by hawks. What trophic level corresponds to the lizards?`;
      options = [
        "Third trophic level",
        "First trophic level",
        "Second trophic level",
        "Fourth trophic level",
      ];
      correctAnswer = "0";
      explanation = `Levels:\n1) Grass (Primary Producer)\n2) Grasshoppers (Primary Consumer)\n3) Lizards (Secondary Consumer / Third Trophic level)\n4) Hawks (Tertiary Consumer / Fourth Trophic level).`;
      hint = `Count trophic levels starting directly from the producer green plants (Level 1).`;
      difficulty = "Medium";
      marks = 3;
    }
  } else if (subject === "Economics") {
    if (topic === "Demand & Supply") {
      const p = 10 + (seed % 5) * 5; // 10, 15...
      qText = `If the price elasticity of demand for a luxury consumer item is calculated to be 2.5, the demand curve is classified as being:`;
      options = [
        "Elastic",
        "Inelastic",
        "Unitary elastic",
        "Perfect inelastic",
      ];
      correctAnswer = "0";
      explanation = `Since the elasticity quotient (2.5) is strictly greater than 1, any price percentage change triggers a proportionately larger quantity response, classifying it as "Elastic".`;
      hint = `Elasticity coefficient greater than 1 means high sensitivity.`;
      difficulty = "Medium";
      marks = 3;
    } else if (topic === "Inflation") {
      qText = `When an economy experiences a rapid rise in production costs forcing suppliers to raise customer retail prices to cover materials, the resulting inflation is termed:`;
      options = [
        "Cost-push inflation",
        "Demand-pull inflation",
        "Hyperinflation",
        "Creeping inflation",
      ];
      correctAnswer = "0";
      explanation = `Because increased wage thresholds or raw materials prices "push" production overhead up, this triggers "Cost-push inflation". Over-expansion of spending pulls prices up in Demand-pull.`;
      hint = `Examine if rising costs or excessive demand is the source of the increase.`;
      difficulty = "Easy";
      marks = 2;
    } else {
      // Market Structures
      qText = `Which characteristic defines a Monopoly market structure?`;
      options = [
        "A single seller with absolute control over market supply and price.",
        "Extremely large counts of alternative brand distributors.",
        "Inability of the operating firm to restrict new startups.",
        "Production of strictly identical raw agricultural stock.",
      ];
      correctAnswer = "0";
      explanation = `A monopoly contains exactly one master supplier who can dictate prices since consumers have zero close alternative options.`;
      hint = `Mono means one sole corporate ruler.`;
      difficulty = "Easy";
      marks = 3;
    }
  } else {
    // Government
    if (topic === "Constitutional Development") {
      const constitution = [
        [
          "Clifford Constitution",
          "1922",
          "introduced the elective principle in Nigeria allowing partial voting",
        ],
        [
          "Richards Constitution",
          "1946",
          "separated Nigeria into three regional councils (North, West, East)",
        ],
        [
          "Macpherson Constitution",
          "1951",
          "created central legislative houses and regional assemblies",
        ],
        [
          "Lyttelton Constitution",
          "1954",
          "established a full federal model with political governors in Nigeria",
        ],
      ];
      const selectedCon = constitution[seed % constitution.length];
      qText = `Which historic colonial constitution of Nigeria was promulgated in ${selectedCon[1]} and is majorly famous because it ${selectedCon[2]}?`;
      options = [
        selectedCon[0],
        "Bourdillon Constitution",
        "Macpherson Constitution",
        "Independence Constitution",
      ];
      const corrText = selectedCon[0];
      const shuff = shuffleArray(options);
      options = shuff;
      correctAnswer = shuff.indexOf(corrText).toString();
      explanation = `The ${selectedCon[0]} was enacted in ${selectedCon[1]} and is notable because it ${selectedCon[2]}.`;
      hint = `Recall the order: Clifford (1922), Richards (1946), Macpherson (1951), Lyttelton (1954).`;
      difficulty = "Medium";
      marks = 4;
    } else {
      // Types of Government
      qText = `A political framework where sovereign administrative power is completely concentrated in a single central national authority is known as:`;
      options = [
        "A unitary system of government",
        "A federal system of government",
        "A loose confederation system",
        "An absolute feudal structure",
      ];
      correctAnswer = "0";
      explanation = `Unitary systems of governance concentrate absolute ultimate authority inside a central capital administration. Federal distributes sovereignty between central and constituent state partners.`;
      hint = `Unit means single core engine with minor dependent appendages.`;
      difficulty = "Medium";
      marks = 3;
    }
  }

  return {
    id,
    subject,
    topic,
    type: "mcq",
    text: qText,
    options,
    correctAnswer,
    explanation,
    hint,
    difficulty,
    marks,
    examName,
    examYear: year,
    questionNumber,
  };
}

/**
 * Public facing API to retrieve questions for any subject, exam type, year, and selection counts.
 * Bridges preset hand-polished past papers with high-fidelity procedural generation to provide up to 60 questions!
 */
export function getCbtSimulationQuestions(
  subject: string,
  examType: "WAEC" | "JAMB",
  year: "all" | number,
  countSetting: "standard" | number | "official_exam",
  topicFilter?: string,
  customQuestionsPool?: Question[],
): Question[] {
  // Determine target count
  let targetCount = 30; // fallback
  if (countSetting === "standard") {
    if (examType === "JAMB") {
      targetCount = subject === "English Language" ? 60 : 40;
    } else {
      // WAEC
      targetCount = subject === "English Language" ? 60 : 50;
    }
  } else if (countSetting !== "official_exam") {
    targetCount = countSetting;
  }

  // 1. Filter database-backed dataset only
  const poolToUse = customQuestionsPool || [];
  let subjectPool = poolToUse.filter(
    (q) => q.subject.trim().toLowerCase() === subject.trim().toLowerCase(),
  );

  if (topicFilter && topicFilter.trim() !== "") {
    subjectPool = subjectPool.filter(
      (q) => q.topic.trim().toLowerCase() === topicFilter.trim().toLowerCase(),
    );
  }

  // 2. Limit to the exact year requested, or all years when "all" is selected
  let primaryPool: Question[] = [];

  if (year !== "all") {
    primaryPool = subjectPool.filter(
      (q) => q.examYear === Number(year) || q.examYear === year,
    );
  } else {
    primaryPool = [...subjectPool];
  }

  // If Official Exam is selected, load EXACTLY and ONLY the real official questions for this year
  if (countSetting === "official_exam") {
    let chosen = [...primaryPool];
    chosen.sort((a, b) => {
      const numA = a.questionNumber || 0;
      const numB = b.questionNumber || 0;
      return numA - numB;
    });

    // Normalize numbers for the exam session
    return chosen.map((q, index) => ({
      ...q,
      examYear: year !== "all" ? year : q.examYear,
      questionNumber: index + 1,
    }));
  }

  // Shuffle matching DB records to provide variance where applicable
  primaryPool = [...primaryPool].sort(() => 0.5 - Math.random());

  // Accumulate questions from the database only
  let chosenQuestions = [...primaryPool];

  // Use database questions only. If the DB does not have enough, return only what exists.
  if (chosenQuestions.length > targetCount) {
    chosenQuestions = chosenQuestions.slice(0, targetCount);
  }

  // Normalize exam year and sequential numbering for the exam session
  const finalQuestions = chosenQuestions.map((q, index) => ({
    ...q,
    examYear: year !== "all" ? year : q.examYear,
    questionNumber: index + 1,
  }));

  return finalQuestions;
}
