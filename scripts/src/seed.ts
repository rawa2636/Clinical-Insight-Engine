import { db, hospitalsTable, doctorsTable, casesTable, transfersTable } from "@workspace/db";

async function seed() {
  console.log("🌱 Clearing old data...");
  await db.delete(transfersTable).execute().catch(() => {});
  await db.delete(casesTable).execute().catch(() => {});
  await db.delete(doctorsTable).execute().catch(() => {});
  await db.delete(hospitalsTable).execute().catch(() => {});

  console.log("🌱 Seeding hospitals...");
  const hospitals = await db
    .insert(hospitalsTable)
    .values([
      {
        nameEn: "King Fahad Medical City",
        nameAr: "مدينة الملك فهد الطبية",
        city: "Riyadh",
        address: "Northern Ring Road, Riyadh 11525",
        phone: "+966-11-288-9999",
        specialties: ["Cardiology", "Neurology", "Oncology", "Emergency", "Pediatrics"],
        isAvailable: "true",
        level: "TERTIARY",
      },
      {
        nameEn: "King Abdullah Medical Complex",
        nameAr: "مجمع الملك عبدالله الطبي",
        city: "Jeddah",
        address: "Al Andalus District, Jeddah 23432",
        phone: "+966-12-629-0000",
        specialties: ["Orthopedics", "Internal Medicine", "Surgery", "Pulmonology"],
        isAvailable: "true",
        level: "TERTIARY",
      },
      {
        nameEn: "Prince Sultan Military Medical City",
        nameAr: "مدينة الأمير سلطان الطبية العسكرية",
        city: "Riyadh",
        address: "Wadi Al Dawasir, Riyadh 12233",
        phone: "+966-11-477-6666",
        specialties: ["Trauma", "Emergency", "Cardiology", "General Surgery"],
        isAvailable: "true",
        level: "TERTIARY",
      },
      {
        nameEn: "King Saud University Medical City",
        nameAr: "مدينة الملك سعود الطبية الجامعية",
        city: "Riyadh",
        address: "King Abdullah Road, Riyadh 11321",
        phone: "+966-11-467-0000",
        specialties: ["Neurology", "Psychiatry", "Dermatology", "Internal Medicine"],
        isAvailable: "true",
        level: "TERTIARY",
      },
      {
        nameEn: "Dhahran Health Center",
        nameAr: "مركز الظهران الصحي",
        city: "Dhahran",
        address: "Aramco District, Dhahran 31311",
        phone: "+966-13-872-0000",
        specialties: ["General Medicine", "Pediatrics", "Obstetrics"],
        isAvailable: "true",
        level: "SECONDARY",
      },
    ])
    .returning();

  console.log(`✅ Seeded ${hospitals.length} hospitals`);

  console.log("🌱 Seeding doctors...");
  const doctors = await db
    .insert(doctorsTable)
    .values([
      {
        nameEn: "Dr. Ahmed Al-Rashidi",
        nameAr: "د. أحمد الراشدي",
        specialty: "CARDIOLOGY",
        specialtyLabelEn: "Cardiology",
        specialtyLabelAr: "أمراض القلب",
        qualifications: "MD, FACC — Board Certified Cardiologist",
        experience: 18,
        rating: "4.9",
        avatarInitials: "AR",
        isAvailable: true,
        consultationFeeUsd: "120.00",
        languages: ["Arabic", "English"],
      },
      {
        nameEn: "Dr. Sara Al-Otaibi",
        nameAr: "د. سارة العتيبي",
        specialty: "EMERGENCY_MEDICINE",
        specialtyLabelEn: "Emergency Medicine",
        specialtyLabelAr: "طب الطوارئ",
        qualifications: "MD, FAAEM — Emergency Medicine Specialist",
        experience: 12,
        rating: "4.8",
        avatarInitials: "SO",
        isAvailable: true,
        consultationFeeUsd: "100.00",
        languages: ["Arabic", "English", "French"],
      },
      {
        nameEn: "Dr. Khalid Al-Ghamdi",
        nameAr: "د. خالد الغامدي",
        specialty: "NEUROLOGY",
        specialtyLabelEn: "Neurology",
        specialtyLabelAr: "طب الأعصاب",
        qualifications: "MD, PhD — Neurologist & Stroke Specialist",
        experience: 15,
        rating: "4.7",
        avatarInitials: "KG",
        isAvailable: true,
        consultationFeeUsd: "130.00",
        languages: ["Arabic", "English"],
      },
      {
        nameEn: "Dr. Fatima Al-Zahrani",
        nameAr: "د. فاطمة الزهراني",
        specialty: "PULMONOLOGY",
        specialtyLabelEn: "Pulmonology",
        specialtyLabelAr: "أمراض الرئة",
        qualifications: "MD, FCCP — Pulmonologist & ICU Specialist",
        experience: 10,
        rating: "4.6",
        avatarInitials: "FZ",
        isAvailable: true,
        consultationFeeUsd: "110.00",
        languages: ["Arabic", "English"],
      },
      {
        nameEn: "Dr. Omar Al-Shehri",
        nameAr: "د. عمر الشهري",
        specialty: "INTERNAL_MEDICINE",
        specialtyLabelEn: "Internal Medicine",
        specialtyLabelAr: "الطب الباطني",
        qualifications: "MD, FACP — Internal Medicine & Hospitalist",
        experience: 14,
        rating: "4.8",
        avatarInitials: "OS",
        isAvailable: true,
        consultationFeeUsd: "95.00",
        languages: ["Arabic", "English", "Urdu"],
      },
      {
        nameEn: "Dr. Nora Al-Dossari",
        nameAr: "د. نورة الدوسري",
        specialty: "PEDIATRICS",
        specialtyLabelEn: "Pediatrics",
        specialtyLabelAr: "طب الأطفال",
        qualifications: "MD, FAAP — Pediatric Specialist",
        experience: 9,
        rating: "4.9",
        avatarInitials: "ND",
        isAvailable: true,
        consultationFeeUsd: "90.00",
        languages: ["Arabic", "English"],
      },
      {
        nameEn: "Dr. Bandar Al-Qahtani",
        nameAr: "د. بندر القحطاني",
        specialty: "ORTHOPEDICS",
        specialtyLabelEn: "Orthopedics",
        specialtyLabelAr: "جراحة العظام",
        qualifications: "MD, FAAOS — Orthopedic Surgeon",
        experience: 16,
        rating: "4.7",
        avatarInitials: "BQ",
        isAvailable: false,
        consultationFeeUsd: "140.00",
        languages: ["Arabic", "English"],
      },
      {
        nameEn: "Dr. Maha Al-Harbi",
        nameAr: "د. مها الحربي",
        specialty: "GENERAL",
        specialtyLabelEn: "General Medicine",
        specialtyLabelAr: "الطب العام",
        qualifications: "MD — General Practitioner & Telemedicine Specialist",
        experience: 7,
        rating: "4.5",
        avatarInitials: "MH",
        isAvailable: true,
        consultationFeeUsd: "70.00",
        languages: ["Arabic", "English"],
      },
    ])
    .returning();

  console.log(`✅ Seeded ${doctors.length} doctors`);

  console.log("🌱 Seeding demo cases...");

  const [docCardio, docEmergency, docNeuro, docPulmo, docInternal, docPeds] = doctors;

  const cases = await db
    .insert(casesTable)
    .values([
      // 1. CRITICAL — new report just received (CASE_CREATED)
      {
        patientName: "محمد العمري",
        age: 62,
        gender: "MALE",
        chiefComplaint: "ألم شديد في الصدر مع ضيق في التنفس",
        symptoms: ["chest pain", "shortness of breath", "sweating", "dizziness"],
        vitalSigns: {
          temperature: 37.6,
          heartRate: 118,
          bloodPressureSystolic: 190,
          bloodPressureDiastolic: 115,
          oxygenSaturation: 92,
          respiratoryRate: 24,
        },
        medicalHistory: "Hypertension, Type 2 Diabetes, previous MI (2019)",
        currentMedications: "Aspirin 100mg, Metoprolol 50mg, Metformin 500mg",
        reportType: "SOAP",
        rawReport: "S: Patient reports crushing chest pain 9/10, radiation to left jaw. O: HR 118, BP 190/115, SpO2 92%. A: Suspected STEMI. P: Emergency activation.",
        riskLevel: "CRITICAL",
        recommendedAction: "EMERGENCY_RESPONSE",
        recommendedDepartment: "Cardiac Catheterization Lab",
        riskFactors: [
          "Critical symptom: chest pain",
          "Hypertensive crisis: 190/115 mmHg",
          "Hypoxia: SpO2 92%",
          "Tachycardia: 118 bpm",
          "Previous MI — high recurrence risk",
        ],
        briefEnglish: "HOSPITAL BRIEF — Risk Level: CRITICAL\n\nPatient: محمد العمري, 62-year-old male. Chief complaint: Severe chest pain with shortness of breath. Vital signs: HR 118, BP 190/115, SpO2 92%. History: Hypertension, DM2, prior MI.\n\nRecommended Action: IMMEDIATE EMERGENCY RESPONSE — Activate cardiac protocol now.",
        briefArabic: "ملخص طبي — مستوى الخطورة: حرج\n\nالمريض: محمد العمري، 62 عاماً، ذكر. الشكوى: ألم شديد في الصدر مع ضيق في التنفس. العلامات الحيوية: النبض 118، ضغط 190/115، أكسجين 92٪. التاريخ: ضغط، سكري، نوبة قلبية سابقة.\n\nالإجراء الموصى به: تدخل طارئ فوري — تفعيل بروتوكول القلب.",
        caseStatus: "CASE_CREATED",
        acknowledged: false,
      },

      // 2. HIGH — triage complete, awaiting doctor assignment
      {
        patientName: "Layla Al-Mansouri",
        age: 45,
        gender: "FEMALE",
        chiefComplaint: "Sudden severe headache — worst of life, with vomiting",
        symptoms: ["severe headache", "vomiting", "neck stiffness", "photophobia", "confusion"],
        vitalSigns: {
          temperature: 38.4,
          heartRate: 102,
          bloodPressureSystolic: 168,
          bloodPressureDiastolic: 98,
          oxygenSaturation: 97,
          respiratoryRate: 18,
        },
        medicalHistory: "No significant history",
        currentMedications: "Oral contraceptives",
        reportType: "SOAP",
        rawReport: "S: Sudden onset worst headache of life, thunderclap onset, associated vomiting and neck stiffness. O: Temp 38.4, HR 102, BP 168/98. Neck stiffness positive. A: Suspect subarachnoid hemorrhage. P: Urgent CT head + LP.",
        riskLevel: "HIGH",
        recommendedAction: "HOSPITAL_VISIT",
        recommendedDepartment: "Neurology / Neurosurgery",
        riskFactors: [
          "Thunderclap headache — SAH until proven otherwise",
          "Meningismus (neck stiffness + photophobia)",
          "Fever: 38.4°C",
          "Hypertension: 168/98 mmHg",
          "Altered mentation",
        ],
        briefEnglish: "HOSPITAL BRIEF — Risk Level: HIGH\n\nPatient: Layla Al-Mansouri, 45F. Thunderclap headache with meningismus. Temp 38.4, HR 102, BP 168/98. Suspect SAH — urgent CT + LP required.",
        briefArabic: "ملخص طبي — مستوى الخطورة: عالٍ\n\nالمريضة: ليلى المنصوري، 45 سنة، أنثى. صداع مفاجئ شديد مع تيبس الرقبة. حرارة 38.4، نبض 102، ضغط 168/98. اشتباه نزيف تحت العنكبوتية — يتطلب CT عاجل.",
        caseStatus: "TRIAGE_COMPLETE",
        acknowledged: true,
      },

      // 3. CRITICAL — assigned to doctor, in consultation
      {
        patientName: "Abdullah Al-Harthi",
        age: 71,
        gender: "MALE",
        chiefComplaint: "Acute respiratory failure — unable to breathe",
        symptoms: ["respiratory failure", "cyanosis", "confusion", "accessory muscle use"],
        vitalSigns: {
          temperature: 39.1,
          heartRate: 126,
          bloodPressureSystolic: 88,
          bloodPressureDiastolic: 58,
          oxygenSaturation: 84,
          respiratoryRate: 34,
        },
        medicalHistory: "COPD (severe), Cor Pulmonale, CHF",
        currentMedications: "Salbutamol inhaler, Tiotropium, Furosemide 40mg",
        reportType: "SOAP",
        rawReport: "S: Progressive SOB over 3 days, now in acute failure. O: SpO2 84% on room air, RR 34, accessory muscle use, cyanosis. A: AECOPD with type 2 respiratory failure. P: NIV/intubation, ITU admission.",
        riskLevel: "CRITICAL",
        recommendedAction: "EMERGENCY_RESPONSE",
        recommendedDepartment: "ICU / Pulmonology",
        riskFactors: [
          "Severe hypoxia: SpO2 84%",
          "Septic shock: BP 88/58",
          "Tachycardia: 126 bpm",
          "Hyperpyrexia: 39.1°C",
          "COPD + CHF — double jeopardy",
        ],
        briefEnglish: "HOSPITAL BRIEF — Risk Level: CRITICAL\n\nPatient: Abdullah Al-Harthi, 71M. Acute respiratory failure on background COPD+CHF. SpO2 84%, BP 88/58 — septic picture. Immediate ICU admission required.",
        briefArabic: "ملخص طبي — مستوى الخطورة: حرج\n\nالمريض: عبدالله الحارثي، 71 سنة، ذكر. فشل تنفسي حاد على خلفية COPD وقصور قلب. أكسجين 84٪، ضغط 88/58 — صورة إنتانية. يتطلب قبول ICU فوري.",
        caseStatus: "ASSIGNED_TO_DOCTOR",
        assignedDoctorId: docPulmo.id,
        acknowledged: true,
      },

      // 4. HIGH — diagnosis in progress
      {
        patientName: "Fatima Al-Ghamdi",
        age: 34,
        gender: "FEMALE",
        chiefComplaint: "Sudden left-sided weakness and slurred speech — 2 hours ago",
        symptoms: ["facial droop", "arm weakness", "slurred speech", "vision changes"],
        vitalSigns: {
          temperature: 37.2,
          heartRate: 88,
          bloodPressureSystolic: 158,
          bloodPressureDiastolic: 92,
          oxygenSaturation: 98,
          respiratoryRate: 16,
        },
        medicalHistory: "Atrial fibrillation (on anticoagulation — missed last 3 doses)",
        currentMedications: "Rivaroxaban 20mg (non-compliant)",
        reportType: "SOAP",
        rawReport: "S: Sudden onset left facial droop, arm weakness, speech difficulty 2h ago. O: NIHSS 12, BP 158/92, AF on ECG. A: Ischemic stroke — within thrombolysis window. P: CT head STAT, tPA if no contraindication.",
        riskLevel: "HIGH",
        recommendedAction: "HOSPITAL_VISIT",
        recommendedDepartment: "Stroke Unit / Neurology",
        riskFactors: [
          "Acute stroke — NIHSS 12",
          "Within thrombolysis window",
          "AF + anticoagulation non-compliance",
          "Hypertension: 158/92",
        ],
        briefEnglish: "HOSPITAL BRIEF — Risk Level: HIGH\n\nPatient: Fatima Al-Ghamdi, 34F. Acute ischemic stroke — 2h onset. NIHSS 12. AF + missed anticoagulation. BP 158/92. Within tPA window — urgent neurology review.",
        briefArabic: "ملخص طبي — مستوى الخطورة: عالٍ\n\nالمريضة: فاطمة الغامدي، 34 سنة، أنثى. سكتة دماغية إقفارية حادة — منذ ساعتين. NIHSS 12. رجفان أذيني + تفويت جرعات مضادات التخثر. ضمن نافذة الـ tPA.",
        caseStatus: "DIAGNOSIS_IN_PROGRESS",
        assignedDoctorId: docNeuro.id,
        diagnosisNotes: "CT head: No hemorrhage. MRI DWI shows early ischemic changes in right MCA territory. Patient within 4.5h window. IV tPA administered at 14:32. Patient transferred to stroke unit for monitoring. Repeat imaging in 24h. NIHSS improving — now 8.",
        acknowledged: true,
      },

      // 5. MEDIUM — just received, awaiting triage
      {
        patientName: "Khalid Al-Otaibi",
        age: 28,
        gender: "MALE",
        chiefComplaint: "High fever with severe joint pain and rash",
        symptoms: ["fever", "arthralgia", "rash", "fatigue", "headache"],
        vitalSigns: {
          temperature: 39.8,
          heartRate: 108,
          bloodPressureSystolic: 112,
          bloodPressureDiastolic: 72,
          oxygenSaturation: 98,
          respiratoryRate: 20,
        },
        medicalHistory: "Recent travel to sub-Saharan Africa (returned 5 days ago)",
        currentMedications: "None",
        reportType: "SOAP",
        rawReport: "S: Fever, joint pain, rash x3 days post-travel. O: Temp 39.8, HR 108, maculopapular rash on trunk. A: Suspect dengue / chikungunya / malaria — travel history. P: Blood film, dengue NS1, FBC.",
        riskLevel: "MEDIUM",
        recommendedAction: "SCHEDULE_CONSULTATION",
        recommendedDepartment: "Infectious Disease",
        riskFactors: [
          "High fever: 39.8°C",
          "Recent travel to endemic area",
          "Tachycardia: 108 bpm",
          "Maculopapular rash — arbovirus pattern",
        ],
        briefEnglish: "HOSPITAL BRIEF — Risk Level: MEDIUM\n\nPatient: Khalid Al-Otaibi, 28M. Fever + arthralgia + rash post-Africa travel. Suspect tropical infection (dengue/malaria). Temp 39.8, HR 108. Infectious disease consult required.",
        briefArabic: "ملخص طبي — مستوى الخطورة: متوسط\n\nالمريض: خالد العتيبي، 28 سنة، ذكر. حمى + آلام مفاصل + طفح جلدي بعد سفر إلى أفريقيا. اشتباه عدوى استوائية (ضنك/ملاريا). حرارة 39.8، نبض 108.",
        caseStatus: "REPORT_RECEIVED",
        acknowledged: false,
      },

      // 6. HIGH — routed to another hospital
      {
        patientName: "Nasser Al-Zahrani",
        age: 55,
        gender: "MALE",
        chiefComplaint: "Major trauma — motor vehicle accident",
        symptoms: ["polytrauma", "chest injury", "abdominal pain", "GCS 11"],
        vitalSigns: {
          temperature: 36.8,
          heartRate: 132,
          bloodPressureSystolic: 94,
          bloodPressureDiastolic: 60,
          oxygenSaturation: 93,
          respiratoryRate: 28,
        },
        medicalHistory: "None known",
        currentMedications: "None",
        reportType: "SOAP",
        rawReport: "S: High-speed MVA, driver unrestrained. O: GCS 11, HR 132, BP 94/60, SpO2 93%. Multiple rib fractures on CXR, free fluid on FAST exam. A: Hemorrhagic shock — blunt abdominal trauma. P: Immediate trauma surgery.",
        riskLevel: "HIGH",
        recommendedAction: "HOSPITAL_VISIT",
        recommendedDepartment: "Trauma Surgery",
        riskFactors: [
          "Hemorrhagic shock: BP 94/60",
          "Tachycardia: 132 bpm",
          "Polytrauma — MVA mechanism",
          "FAST positive — intra-abdominal bleeding",
          "Hypoxia: SpO2 93%",
        ],
        briefEnglish: "HOSPITAL BRIEF — Risk Level: HIGH\n\nPatient: Nasser Al-Zahrani, 55M. Polytrauma post-MVA. Hemorrhagic shock — BP 94/60, HR 132. FAST positive. Transferred to Prince Sultan Military Medical City for trauma surgery.",
        briefArabic: "ملخص طبي — مستوى الخطورة: عالٍ\n\nالمريض: ناصر الزهراني، 55 سنة، ذكر. رضح متعدد بعد حادث مروري. صدمة نزفية — ضغط 94/60، نبض 132. FAST إيجابي. تم تحويله للمستشفى العسكري للجراحة.",
        caseStatus: "ROUTED_TO_HOSPITAL",
        acknowledged: true,
      },

      // 7. MEDIUM — incoming transfer, received
      {
        patientName: "Aisha Al-Qahtani",
        age: 8,
        gender: "FEMALE",
        chiefComplaint: "Severe asthma attack — not responding to salbutamol",
        symptoms: ["wheeze", "respiratory distress", "cyanosis", "cannot complete sentences"],
        vitalSigns: {
          temperature: 37.4,
          heartRate: 148,
          bloodPressureSystolic: 100,
          bloodPressureDiastolic: 65,
          oxygenSaturation: 89,
          respiratoryRate: 40,
        },
        medicalHistory: "Severe persistent asthma, 2 previous ICU admissions",
        currentMedications: "Fluticasone/Salmeterol inhaler, Montelukast",
        reportType: "SOAP",
        rawReport: "S: Severe acute asthma, salbutamol-resistant. O: SpO2 89%, RR 40, HR 148, cyanosis, PEFR <25% predicted. A: Near-fatal asthma. P: IV magnesium, heliox, PICU transfer.",
        riskLevel: "CRITICAL",
        recommendedAction: "EMERGENCY_RESPONSE",
        recommendedDepartment: "Pediatric ICU",
        riskFactors: [
          "Near-fatal asthma — SpO2 89%",
          "Salbutamol-resistant bronchospasm",
          "Tachycardia: 148 bpm",
          "Respiratory rate: 40/min",
          "Two prior PICU admissions",
        ],
        briefEnglish: "HOSPITAL BRIEF — Risk Level: CRITICAL\n\nPatient: Aisha Al-Qahtani, 8F. Transferred from Dhahran Health Center. Near-fatal asthma — SpO2 89%, salbutamol-resistant. PICU admission required.",
        briefArabic: "ملخص طبي — مستوى الخطورة: حرج\n\nالمريضة: عائشة القحطاني، 8 سنوات، أنثى. محوّلة من مركز الظهران الصحي. ربو شبه مميت — أكسجين 89٪، مقاوم للسالبوتامول. تتطلب قبول في وحدة العناية المركزة للأطفال.",
        medicalHistory: "Transferred from Dhahran Health Center. Transfer code: TRF-DEMO-0001. Severe persistent asthma, 2 previous ICU admissions",
        caseStatus: "RECEIVED_BY_HOSPITAL",
        assignedDoctorId: docPeds.id,
        acknowledged: false,
      },

      // 8. LOW — follow-up consultation
      {
        patientName: "Reem Al-Dosari",
        age: 32,
        gender: "FEMALE",
        chiefComplaint: "Persistent cough and mild fever for 10 days",
        symptoms: ["cough", "low-grade fever", "fatigue", "sore throat"],
        vitalSigns: {
          temperature: 37.9,
          heartRate: 82,
          bloodPressureSystolic: 118,
          bloodPressureDiastolic: 74,
          oxygenSaturation: 99,
          respiratoryRate: 16,
        },
        medicalHistory: "No significant history",
        currentMedications: "Vitamin C supplements",
        reportType: "SOAP",
        rawReport: "S: 10-day cough, mild fever, sore throat, fatigue. O: Temp 37.9, HR 82, BP 118/74, SpO2 99%. Throat: mild erythema, no exudate. A: Upper respiratory tract infection. P: Symptomatic treatment, hydration, return if worsening.",
        riskLevel: "LOW",
        recommendedAction: "SCHEDULE_CONSULTATION",
        recommendedDepartment: "General Medicine",
        riskFactors: [
          "Mild fever: 37.9°C",
          "Symptom duration >7 days",
        ],
        briefEnglish: "HOSPITAL BRIEF — Risk Level: LOW\n\nPatient: Reem Al-Dosari, 32F. URTI — 10-day cough, low-grade fever. Vitals stable. Scheduled for general medicine follow-up.",
        briefArabic: "ملخص طبي — مستوى الخطورة: منخفض\n\nالمريضة: ريم الدوسري، 32 سنة، أنثى. التهاب مجاري تنفسية علوية — سعال 10 أيام، حمى خفيفة. العلامات الحيوية مستقرة. مجدولة لمتابعة في الطب العام.",
        caseStatus: "ASSIGNED_TO_DOCTOR",
        assignedDoctorId: docInternal.id,
        acknowledged: true,
      },

      // 9. HIGH — completed case
      {
        patientName: "Ibrahim Al-Shehri",
        age: 48,
        gender: "MALE",
        chiefComplaint: "Severe abdominal pain — right lower quadrant",
        symptoms: ["abdominal pain", "nausea", "vomiting", "fever", "loss of appetite"],
        vitalSigns: {
          temperature: 38.7,
          heartRate: 96,
          bloodPressureSystolic: 128,
          bloodPressureDiastolic: 82,
          oxygenSaturation: 98,
          respiratoryRate: 18,
        },
        medicalHistory: "No significant history",
        currentMedications: "None",
        reportType: "SOAP",
        rawReport: "S: 12-hour RLQ pain, nausea, vomiting, anorexia. O: Temp 38.7, Rovsing sign +, rebound tenderness RLQ. WBC 16.2. A: Acute appendicitis. P: Surgical consult — laparoscopic appendicectomy.",
        riskLevel: "HIGH",
        recommendedAction: "HOSPITAL_VISIT",
        recommendedDepartment: "General Surgery",
        riskFactors: [
          "Peritoneal signs — rebound tenderness",
          "Leukocytosis: WBC 16.2",
          "Fever: 38.7°C",
          "Classic appendicitis triad",
        ],
        briefEnglish: "HOSPITAL BRIEF — Risk Level: HIGH\n\nPatient: Ibrahim Al-Shehri, 48M. Acute appendicitis — peritoneal signs, WBC 16.2, Temp 38.7. Laparoscopic appendicectomy completed successfully.",
        briefArabic: "ملخص طبي — مستوى الخطورة: عالٍ\n\nالمريض: إبراهيم الشهري، 48 سنة، ذكر. التهاب الزائدة الدودية الحاد — علامات بريتونية، كريات بيضاء 16.2، حرارة 38.7. تم إجراء استئصال بالمنظار بنجاح.",
        caseStatus: "COMPLETED",
        assignedDoctorId: docEmergency.id,
        diagnosisNotes: "Laparoscopic appendicectomy performed under general anaesthesia. Grossly inflamed appendix — no perforation. Procedure time 45 min. Patient recovered well in PACU. Diet commenced, discharged day 2 post-op. Follow-up clinic in 2 weeks.",
        acknowledged: true,
      },

      // 10. MEDIUM — diabetes follow-up, in progress
      {
        patientName: "Hessa Al-Mutairi",
        age: 58,
        gender: "FEMALE",
        chiefComplaint: "Uncontrolled blood sugar — dizziness and blurred vision",
        symptoms: ["hyperglycaemia", "dizziness", "blurred vision", "polyuria", "polydipsia"],
        vitalSigns: {
          temperature: 37.1,
          heartRate: 88,
          bloodPressureSystolic: 144,
          bloodPressureDiastolic: 88,
          oxygenSaturation: 97,
          respiratoryRate: 17,
        },
        medicalHistory: "Type 2 Diabetes (15 years), Hypertension, Dyslipidemia",
        currentMedications: "Metformin 1000mg BD, Gliclazide 80mg, Amlodipine 10mg",
        reportType: "SOAP",
        rawReport: "S: Dizziness and blurred vision, CBG 22 mmol/L at home. O: RBG 24.6 mmol/L, BP 144/88, HR 88. A: Uncontrolled T2DM — likely medication non-compliance. P: Insulin adjustment, dietitian referral, ophthalmology review.",
        riskLevel: "MEDIUM",
        recommendedAction: "SCHEDULE_CONSULTATION",
        recommendedDepartment: "Endocrinology / Internal Medicine",
        riskFactors: [
          "Severe hyperglycaemia: 24.6 mmol/L",
          "Hypertension: 144/88",
          "Long-standing DM with complications risk",
          "Visual symptoms — diabetic retinopathy screening needed",
        ],
        briefEnglish: "HOSPITAL BRIEF — Risk Level: MEDIUM\n\nPatient: Hessa Al-Mutairi, 58F. Uncontrolled T2DM — RBG 24.6, BP 144/88. Insulin regimen adjustment and ophthalmology review required.",
        briefArabic: "ملخص طبي — مستوى الخطورة: متوسط\n\nالمريضة: حصة المطيري، 58 سنة، أنثى. سكري نوع 2 غير مسيطر عليه — سكر عشوائي 24.6، ضغط 144/88. يتطلب تعديل نظام الأنسولين ومراجعة طب العيون.",
        caseStatus: "DIAGNOSIS_IN_PROGRESS",
        assignedDoctorId: docInternal.id,
        diagnosisNotes: "RBG 24.6 mmol/L, HbA1c 11.2% (severely uncontrolled). Urine ACR elevated — early diabetic nephropathy. Fundus exam: early NPDR bilateral. Started on insulin glargine 10 units at night. Dietitian referral placed. Ophthalmology appointment booked.",
        acknowledged: true,
      },
    ])
    .returning();

  console.log(`✅ Seeded ${cases.length} demo cases`);

  console.log("🌱 Seeding demo transfers...");

  const transfers = await db
    .insert(transfersTable)
    .values([
      // Outgoing transfer (case 6 — Nasser Al-Zahrani)
      {
        caseId: cases[5].id,
        direction: "OUTGOING",
        fromHospitalId: hospitals[0].id,
        toHospitalId: hospitals[2].id,
        patientName: "Nasser Al-Zahrani",
        patientAge: 55,
        patientGender: "MALE",
        chiefComplaint: "Major trauma — motor vehicle accident",
        riskLevel: "HIGH",
        status: "ACCEPTED",
        transportMethod: "AMBULANCE",
        transferCode: "TRF-DEMO-2024",
        clinicalSummary: "Polytrauma post-MVA. Hemorrhagic shock — BP 94/60, HR 132. FAST positive for intra-abdominal bleeding. Requires immediate trauma surgery.",
        specialRequirements: "Trauma surgery team on standby, blood bank activated, OR ready",
        estimatedArrival: new Date("2026-03-16T02:30:00Z"),
        acceptedAt: new Date("2026-03-16T01:15:00Z"),
      },
      // Incoming transfer (case 7 — Aisha Al-Qahtani)
      {
        caseId: cases[6].id,
        direction: "INCOMING",
        fromHospitalId: hospitals[4].id,
        toHospitalId: hospitals[0].id,
        patientName: "Aisha Al-Qahtani",
        patientAge: 8,
        patientGender: "FEMALE",
        chiefComplaint: "Near-fatal asthma — salbutamol-resistant",
        riskLevel: "CRITICAL",
        status: "ACCEPTED",
        transportMethod: "AIR_AMBULANCE",
        transferCode: "TRF-DEMO-0001",
        clinicalSummary: "8F with severe persistent asthma, near-fatal episode. SpO2 89% despite max bronchodilators. 2 prior PICU admissions. IV magnesium given en route.",
        specialRequirements: "PICU bed, respiratory therapist standby, heliox available",
        estimatedArrival: new Date("2026-03-16T01:45:00Z"),
        acceptedAt: new Date("2026-03-15T23:50:00Z"),
      },
      // Pending outgoing transfer
      {
        direction: "OUTGOING",
        fromHospitalId: hospitals[0].id,
        toHospitalId: hospitals[3].id,
        patientName: "Layla Al-Mansouri",
        patientAge: 45,
        patientGender: "FEMALE",
        chiefComplaint: "Subarachnoid hemorrhage — neurosurgical review needed",
        riskLevel: "HIGH",
        status: "PENDING",
        transportMethod: "AMBULANCE",
        transferCode: "TRF-DEMO-0003",
        clinicalSummary: "45F with thunderclap headache and meningismus. CT confirmed SAH. Neurosurgical team required for coiling vs clipping decision.",
        specialRequirements: "Neurosurgery team review, interventional radiology on standby",
        estimatedArrival: new Date("2026-03-16T03:00:00Z"),
      },
    ])
    .returning();

  console.log(`✅ Seeded ${transfers.length} demo transfers`);
  console.log("\n✅ All seed data created successfully!");
  console.log(`   ${hospitals.length} hospitals | ${doctors.length} doctors | ${cases.length} cases | ${transfers.length} transfers`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
