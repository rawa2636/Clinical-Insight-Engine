type VitalSigns = {
  temperature?: number;
  heartRate?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  oxygenSaturation?: number;
  respiratoryRate?: number;
};

type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type RecommendedAction =
  | "SELF_CARE"
  | "SCHEDULE_CONSULTATION"
  | "HOSPITAL_VISIT"
  | "EMERGENCY_RESPONSE";

type RiskAnalysis = {
  riskLevel: RiskLevel;
  recommendedAction: RecommendedAction;
  riskFactors: string[];
};

const CRITICAL_SYMPTOMS = [
  "chest pain",
  "cardiac arrest",
  "heart attack",
  "stroke",
  "anaphylaxis",
  "anaphylactic",
  "unconscious",
  "unresponsive",
  "seizure",
  "respiratory failure",
  "respiratory arrest",
  "hemorrhage",
  "severe bleeding",
  "septic shock",
  "sepsis",
  "coma",
  "head injury",
  "traumatic brain injury",
  "paralysis",
  "acute myocardial infarction",
  "pulmonary embolism",
];

const HIGH_SYMPTOMS = [
  "difficulty breathing",
  "shortness of breath",
  "dyspnea",
  "severe chest pressure",
  "syncope",
  "fainting",
  "loss of consciousness",
  "severe pain",
  "high fever",
  "persistent vomiting",
  "severe dehydration",
  "confusion",
  "disorientation",
  "altered mental status",
  "deep laceration",
  "fracture",
  "severe headache",
  "sudden vision loss",
  "weakness",
  "numbness",
  "diabetic emergency",
  "hypoglycemia",
  "hyperglycemia",
];

const MEDIUM_SYMPTOMS = [
  "moderate pain",
  "fever",
  "nausea",
  "vomiting",
  "dizziness",
  "moderate headache",
  "infection",
  "abdominal pain",
  "back pain",
  "rash",
  "allergic reaction",
  "dehydration",
  "fatigue",
  "cough",
  "urinary symptoms",
  "anxiety",
  "palpitations",
  "minor injury",
  "sprain",
];

function checkVitalSigns(vitals?: VitalSigns | null): {
  factors: string[];
  severity: number;
} {
  if (!vitals) return { factors: [], severity: 0 };

  const factors: string[] = [];
  let severity = 0;

  if (vitals.temperature !== undefined) {
    if (vitals.temperature >= 40.0) {
      factors.push(`Critically high temperature: ${vitals.temperature}°C`);
      severity = Math.max(severity, 3);
    } else if (vitals.temperature >= 38.5) {
      factors.push(`High fever: ${vitals.temperature}°C`);
      severity = Math.max(severity, 2);
    } else if (vitals.temperature >= 37.5) {
      factors.push(`Mild fever: ${vitals.temperature}°C`);
      severity = Math.max(severity, 1);
    } else if (vitals.temperature < 35.0) {
      factors.push(`Hypothermia risk: ${vitals.temperature}°C`);
      severity = Math.max(severity, 3);
    }
  }

  if (vitals.heartRate !== undefined) {
    if (vitals.heartRate > 150 || vitals.heartRate < 40) {
      factors.push(`Critical heart rate: ${vitals.heartRate} bpm`);
      severity = Math.max(severity, 3);
    } else if (vitals.heartRate > 120 || vitals.heartRate < 50) {
      factors.push(`Abnormal heart rate: ${vitals.heartRate} bpm`);
      severity = Math.max(severity, 2);
    } else if (vitals.heartRate > 100) {
      factors.push(`Elevated heart rate: ${vitals.heartRate} bpm`);
      severity = Math.max(severity, 1);
    }
  }

  if (
    vitals.bloodPressureSystolic !== undefined &&
    vitals.bloodPressureDiastolic !== undefined
  ) {
    const sys = vitals.bloodPressureSystolic;
    const dia = vitals.bloodPressureDiastolic;
    if (sys >= 180 || dia >= 120) {
      factors.push(
        `Hypertensive crisis: ${sys}/${dia} mmHg — immediate risk`
      );
      severity = Math.max(severity, 3);
    } else if (sys >= 160 || dia >= 100) {
      factors.push(`Severe hypertension: ${sys}/${dia} mmHg`);
      severity = Math.max(severity, 2);
    } else if (sys >= 140 || dia >= 90) {
      factors.push(`Elevated blood pressure: ${sys}/${dia} mmHg`);
      severity = Math.max(severity, 1);
    } else if (sys < 90 || dia < 60) {
      factors.push(`Hypotension: ${sys}/${dia} mmHg`);
      severity = Math.max(severity, 2);
    } else if (sys < 80) {
      factors.push(`Severe hypotension/shock risk: ${sys}/${dia} mmHg`);
      severity = Math.max(severity, 3);
    }
  }

  if (vitals.oxygenSaturation !== undefined) {
    if (vitals.oxygenSaturation < 90) {
      factors.push(
        `Critical oxygen saturation: ${vitals.oxygenSaturation}% — immediate intervention needed`
      );
      severity = Math.max(severity, 3);
    } else if (vitals.oxygenSaturation < 94) {
      factors.push(`Low oxygen saturation: ${vitals.oxygenSaturation}%`);
      severity = Math.max(severity, 2);
    } else if (vitals.oxygenSaturation < 96) {
      factors.push(
        `Borderline oxygen saturation: ${vitals.oxygenSaturation}%`
      );
      severity = Math.max(severity, 1);
    }
  }

  if (vitals.respiratoryRate !== undefined) {
    if (vitals.respiratoryRate > 30 || vitals.respiratoryRate < 8) {
      factors.push(
        `Critical respiratory rate: ${vitals.respiratoryRate} breaths/min`
      );
      severity = Math.max(severity, 3);
    } else if (vitals.respiratoryRate > 24 || vitals.respiratoryRate < 12) {
      factors.push(
        `Abnormal respiratory rate: ${vitals.respiratoryRate} breaths/min`
      );
      severity = Math.max(severity, 2);
    }
  }

  return { factors, severity };
}

function matchSymptoms(
  symptoms: string[],
  chiefComplaint: string,
  keyword_list: string[]
): string[] {
  const text = [chiefComplaint, ...symptoms]
    .join(" ")
    .toLowerCase();
  return keyword_list.filter((kw) => text.includes(kw.toLowerCase()));
}

export function analyzeRisk(input: {
  symptoms: string[];
  chiefComplaint: string;
  age: number;
  vitalSigns?: VitalSigns | null;
  medicalHistory?: string;
}): RiskAnalysis {
  const { symptoms, chiefComplaint, age, vitalSigns, medicalHistory } = input;
  const riskFactors: string[] = [];

  const criticalMatches = matchSymptoms(symptoms, chiefComplaint, CRITICAL_SYMPTOMS);
  const highMatches = matchSymptoms(symptoms, chiefComplaint, HIGH_SYMPTOMS);
  const mediumMatches = matchSymptoms(symptoms, chiefComplaint, MEDIUM_SYMPTOMS);

  criticalMatches.forEach((s) => riskFactors.push(`Critical symptom: ${s}`));
  highMatches.forEach((s) => riskFactors.push(`High-risk symptom: ${s}`));
  mediumMatches.slice(0, 3).forEach((s) =>
    riskFactors.push(`Moderate symptom: ${s}`)
  );

  const vitalResult = checkVitalSigns(vitalSigns);
  vitalResult.factors.forEach((f) => riskFactors.push(f));

  if (age >= 70) {
    riskFactors.push("Advanced age (≥70): increased vulnerability");
  } else if (age >= 60) {
    riskFactors.push("Senior age (60+): elevated baseline risk");
  } else if (age <= 2) {
    riskFactors.push("Infant/toddler: high physiological vulnerability");
  }

  const historyLower = (medicalHistory || "").toLowerCase();
  if (
    historyLower.includes("heart disease") ||
    historyLower.includes("cardiac") ||
    historyLower.includes("diabetes") ||
    historyLower.includes("copd") ||
    historyLower.includes("immunocompromised") ||
    historyLower.includes("cancer") ||
    historyLower.includes("kidney disease")
  ) {
    riskFactors.push("Significant comorbidity in medical history");
  }

  let riskScore = 0;
  riskScore += criticalMatches.length * 4;
  riskScore += highMatches.length * 2;
  riskScore += mediumMatches.length * 1;
  riskScore += vitalResult.severity * 2;
  if (age >= 70 || age <= 2) riskScore += 2;
  else if (age >= 60) riskScore += 1;
  if (historyLower.includes("heart disease") || historyLower.includes("cardiac")) riskScore += 2;
  else if (historyLower.includes("diabetes") || historyLower.includes("copd")) riskScore += 1;

  let riskLevel: RiskLevel;
  let recommendedAction: RecommendedAction;

  if (criticalMatches.length > 0 || vitalResult.severity >= 3 || riskScore >= 8) {
    riskLevel = "CRITICAL";
    recommendedAction = "EMERGENCY_RESPONSE";
  } else if (highMatches.length >= 2 || vitalResult.severity >= 2 || riskScore >= 5) {
    riskLevel = "HIGH";
    recommendedAction = "HOSPITAL_VISIT";
  } else if (mediumMatches.length >= 2 || vitalResult.severity >= 1 || riskScore >= 2) {
    riskLevel = "MEDIUM";
    recommendedAction = "SCHEDULE_CONSULTATION";
  } else {
    riskLevel = "LOW";
    recommendedAction = "SELF_CARE";
  }

  if (riskFactors.length === 0) {
    riskFactors.push("No significant risk factors identified");
  }

  return { riskLevel, recommendedAction, riskFactors };
}

export function generateBriefEnglish(input: {
  patientName: string;
  age: number;
  gender: string;
  chiefComplaint: string;
  symptoms: string[];
  riskLevel: RiskLevel;
  recommendedAction: RecommendedAction;
  riskFactors: string[];
  vitalSigns?: VitalSigns | null;
  medicalHistory?: string;
}): string {
  const actionMap: Record<RecommendedAction, string> = {
    SELF_CARE: "Patient may manage condition at home with self-care measures. Monitor for worsening.",
    SCHEDULE_CONSULTATION: "Patient should schedule a consultation with a healthcare provider within 24-48 hours.",
    HOSPITAL_VISIT: "Patient requires prompt evaluation at a hospital or urgent care facility.",
    EMERGENCY_RESPONSE: "IMMEDIATE EMERGENCY RESPONSE REQUIRED. Activate emergency protocol now.",
  };

  const genderPronoun = input.gender === "FEMALE" ? "She" : input.gender === "MALE" ? "He" : "They";

  let vitalsText = "";
  if (input.vitalSigns) {
    const v = input.vitalSigns;
    const parts: string[] = [];
    if (v.temperature != null) parts.push(`Temp: ${v.temperature}°C`);
    if (v.heartRate != null) parts.push(`HR: ${v.heartRate} bpm`);
    if (v.bloodPressureSystolic != null && v.bloodPressureDiastolic != null)
      parts.push(`BP: ${v.bloodPressureSystolic}/${v.bloodPressureDiastolic} mmHg`);
    if (v.oxygenSaturation != null) parts.push(`SpO2: ${v.oxygenSaturation}%`);
    if (v.respiratoryRate != null) parts.push(`RR: ${v.respiratoryRate}/min`);
    if (parts.length) vitalsText = ` Vital signs: ${parts.join(", ")}.`;
  }

  return `HOSPITAL BRIEF — Risk Level: ${input.riskLevel}

Patient: ${input.patientName}, ${input.age}-year-old ${input.gender.toLowerCase()}. Chief complaint: ${input.chiefComplaint}. ${genderPronoun} presents with: ${input.symptoms.join(", ")}.${vitalsText}${input.medicalHistory ? ` Medical history: ${input.medicalHistory}.` : ""}

Risk Assessment: ${input.riskLevel}
Key Risk Factors: ${input.riskFactors.join("; ")}.

Recommended Action: ${actionMap[input.recommendedAction]}`;
}

export function generateBriefArabic(input: {
  patientName: string;
  age: number;
  gender: string;
  chiefComplaint: string;
  symptoms: string[];
  riskLevel: RiskLevel;
  recommendedAction: RecommendedAction;
  riskFactors: string[];
  vitalSigns?: VitalSigns | null;
  medicalHistory?: string;
}): string {
  const actionMapAr: Record<RecommendedAction, string> = {
    SELF_CARE: "يمكن للمريض إدارة حالته في المنزل. يُنصح بالمراقبة المستمرة وطلب المساعدة عند تفاقم الأعراض.",
    SCHEDULE_CONSULTATION: "يجب على المريض تحديد موعد مع مقدم الرعاية الصحية خلال ٢٤ إلى ٤٨ ساعة.",
    HOSPITAL_VISIT: "يستلزم حال المريض تقييماً عاجلاً في المستشفى أو مركز الرعاية العاجلة.",
    EMERGENCY_RESPONSE: "مطلوب تدخل طارئ فوري. يُرجى تفعيل البروتوكول الطارئ على الفور.",
  };

  const riskLevelAr: Record<RiskLevel, string> = {
    LOW: "منخفض",
    MEDIUM: "متوسط",
    HIGH: "مرتفع",
    CRITICAL: "حرج",
  };

  const genderAr = input.gender === "FEMALE" ? "أنثى" : input.gender === "MALE" ? "ذكر" : "آخر";

  let vitalsText = "";
  if (input.vitalSigns) {
    const v = input.vitalSigns;
    const parts: string[] = [];
    if (v.temperature != null) parts.push(`الحرارة: ${v.temperature}°م`);
    if (v.heartRate != null) parts.push(`معدل القلب: ${v.heartRate} نبضة/دقيقة`);
    if (v.bloodPressureSystolic != null && v.bloodPressureDiastolic != null)
      parts.push(`ضغط الدم: ${v.bloodPressureSystolic}/${v.bloodPressureDiastolic} ملم زئبق`);
    if (v.oxygenSaturation != null) parts.push(`تشبع الأكسجين: ${v.oxygenSaturation}٪`);
    if (v.respiratoryRate != null) parts.push(`معدل التنفس: ${v.respiratoryRate}/دقيقة`);
    if (parts.length) vitalsText = ` العلامات الحيوية: ${parts.join("، ")}.`;
  }

  return `ملخص طبي للمستشفى — مستوى الخطورة: ${riskLevelAr[input.riskLevel]}

المريض: ${input.patientName}، ${input.age} عاماً، ${genderAr}. الشكوى الرئيسية: ${input.chiefComplaint}. الأعراض المُبلَّغ عنها: ${input.symptoms.join("، ")}.${vitalsText}${input.medicalHistory ? ` التاريخ الطبي: ${input.medicalHistory}.` : ""}

تقييم الخطورة: ${riskLevelAr[input.riskLevel]}
عوامل الخطر الرئيسية: ${input.riskFactors.join("؛ ")}.

الإجراء الموصى به: ${actionMapAr[input.recommendedAction]}`;
}

export function recommendDepartment(symptoms: string[], chiefComplaint: string, riskLevel: RiskLevel): string {
  const text = [...symptoms, chiefComplaint].join(" ").toLowerCase();

  if (riskLevel === "CRITICAL") return "Emergency Department";
  if (/chest|cardiac|heart|myocardial|coronary|palpitation/.test(text)) return "Cardiology";
  if (/breath|pulmonary|lung|respiratory|asthma|copd/.test(text)) return "Pulmonology";
  if (/neuro|brain|stroke|seizure|headache|paralysis|numbness/.test(text)) return "Neurology";
  if (/bone|fracture|joint|orthopedic|sprain|knee|hip/.test(text)) return "Orthopedics";
  if (/child|pediatric|infant|baby/.test(text)) return "Pediatrics";
  if (/mental|psychiatry|anxiety|depression|psychosis/.test(text)) return "Psychiatry";
  if (/skin|rash|dermatology|allergy/.test(text)) return "Dermatology";
  if (/abdomen|gastro|bowel|colon|stomach|liver/.test(text)) return "Gastroenterology";
  if (riskLevel === "HIGH") return "Internal Medicine";
  return "General Medicine";
}
