import { db, pool, hospitalsTable, doctorsTable, casesTable, transfersTable } from "@workspace/db";

async function seedHajjahCases() {
  console.log("🌱 بدء إدراج بيانات مسار حجة-صنعاء...");

  // --- 1. إدراج مستشفيات المسار (إذا لم تكن موجودة) ---
  console.log("🌱 إدراج مستشفيات مسار حجة-صنعاء...");

  const insertedHospitals = await db.insert(hospitalsTable).values([
    {
      nameEn: "Aahim Health Center",
      nameAr: "مركز عاهم الصحي",
      city: "كشر",
      address: "مديرية كشر، محافظة حجة",
      phone: "+967-7-000001",
      specialties: ["Primary Care", "Emergency First Aid", "رعاية أولية", "إسعاف أولي"],
      isAvailable: "true",
      level: "PRIMARY",
      pathwayOrder: 10,
      riskReduction: 5,
      distanceToNext: 40,
    },
    {
      nameEn: "Abs General Hospital",
      nameAr: "مستشفى عبس العام",
      city: "عبس",
      address: "مدينة عبس، محافظة حجة",
      phone: "+967-7-000002",
      specialties: ["Surgery", "Emergency", "Obstetrics", "جراحة", "طوارئ", "توليد"],
      isAvailable: "true",
      level: "SECONDARY",
      pathwayOrder: 11,
      riskReduction: 15,
      distanceToNext: 113,
    },
    {
      nameEn: "Hajjah Republican Hospital",
      nameAr: "هيئة مستشفى الجمهوري",
      city: "مدينة حجة",
      address: "مدينة حجة، محافظة حجة",
      phone: "+967-7-000003",
      specialties: ["Internal Medicine", "Pediatrics", "Cardiology", "باطنية", "أطفال", "قلبية"],
      isAvailable: "true",
      level: "SPECIALIZED",
      pathwayOrder: 12,
      riskReduction: 15,
      distanceToNext: 123,
    },
    {
      nameEn: "Kuwait University Hospital Sana'a",
      nameAr: "مستشفى جامعة الكويت — صنعاء",
      city: "صنعاء",
      address: "صنعاء، الجمهورية اليمنية",
      phone: "+967-1-000004",
      specialties: ["Neurosurgery", "Oncology", "Transplant", "ICU", "جراحة أعصاب", "أورام", "عناية مركزة"],
      isAvailable: "true",
      level: "TERTIARY",
      pathwayOrder: 13,
      riskReduction: 35,
      distanceToNext: 0,
    },
  ]).returning();

  const [hAahim, hAbs, hHajjah, hSanaa] = insertedHospitals;

  if (!hAahim || !hAbs || !hHajjah || !hSanaa) {
    console.error("❌ تعذّر إدراج مستشفيات المسار.");
    process.exit(1);
  }

  console.log(`✅ مستشفيات المسار: ${hAahim.nameAr} | ${hAbs.nameAr} | ${hHajjah.nameAr} | ${hSanaa.nameAr}`);

  // --- 2. إدراج الأطباء اليمنيين ---
  console.log("🌱 إدراج أطباء مسار حجة-صنعاء...");

  const doctors = await db
    .insert(doctorsTable)
    .values([
      {
        nameEn: "Dr. Yahya Al-Hajjah",
        nameAr: "د. يحيى الحجاوي",
        specialty: "EMERGENCY_MEDICINE",
        specialtyLabelEn: "Emergency Medicine",
        specialtyLabelAr: "طب الطوارئ",
        qualifications: "MBBS — طبيب طوارئ، مركز عاهم الصحي",
        experience: 6,
        rating: "4.3",
        avatarInitials: "YH",
        isAvailable: true,
        consultationFeeUsd: "40.00",
        languages: ["Arabic"],
      },
      {
        nameEn: "Dr. Samira Al-Absi",
        nameAr: "د. سميرة العبسية",
        specialty: "GENERAL",
        specialtyLabelEn: "General Medicine",
        specialtyLabelAr: "الطب العام",
        qualifications: "MBBS, Diploma Obstetrics — مستشفى عبس العام",
        experience: 9,
        rating: "4.5",
        avatarInitials: "SA",
        isAvailable: true,
        consultationFeeUsd: "50.00",
        languages: ["Arabic"],
      },
      {
        nameEn: "Dr. Faisal Al-Mutawakkil",
        nameAr: "د. فيصل المتوكل",
        specialty: "INTERNAL_MEDICINE",
        specialtyLabelEn: "Internal Medicine",
        specialtyLabelAr: "الطب الباطني",
        qualifications: "MD Internal Medicine — مستشفى الجمهوري حجة",
        experience: 12,
        rating: "4.6",
        avatarInitials: "FM",
        isAvailable: true,
        consultationFeeUsd: "65.00",
        languages: ["Arabic", "English"],
      },
      {
        nameEn: "Dr. Huda Al-Sanaa",
        nameAr: "د. هدى الصنعانية",
        specialty: "PEDIATRICS",
        specialtyLabelEn: "Pediatrics",
        specialtyLabelAr: "طب الأطفال",
        qualifications: "MD Pediatrics, MRCPCH — مستشفى الجمهوري حجة",
        experience: 10,
        rating: "4.7",
        avatarInitials: "HS",
        isAvailable: true,
        consultationFeeUsd: "60.00",
        languages: ["Arabic"],
      },
      {
        nameEn: "Dr. Tariq Al-Qasimi",
        nameAr: "د. طارق القاسمي",
        specialty: "CARDIOLOGY",
        specialtyLabelEn: "Cardiology",
        specialtyLabelAr: "أمراض القلب",
        qualifications: "MD, FACC — أخصائي قلب، مستشفى جامعة الكويت صنعاء",
        experience: 16,
        rating: "4.8",
        avatarInitials: "TQ",
        isAvailable: true,
        consultationFeeUsd: "100.00",
        languages: ["Arabic", "English"],
      },
      {
        nameEn: "Dr. Mariam Al-Hamdani",
        nameAr: "د. مريم الحمداني",
        specialty: "NEUROLOGY",
        specialtyLabelEn: "Neurology",
        specialtyLabelAr: "طب الأعصاب",
        qualifications: "MD Neurology, PhD — مستشفى جامعة الكويت صنعاء",
        experience: 14,
        rating: "4.9",
        avatarInitials: "MH",
        isAvailable: true,
        consultationFeeUsd: "110.00",
        languages: ["Arabic", "English"],
      },
    ])
    .returning();

  const [docEmergencyAahim, docGeneralAbs, docInternalHajjah, docPedsHajjah, docCardioSanaa, docNeuroSanaa] = doctors;

  console.log(`✅ تم إدراج ${doctors.length} أطباء`);

  // --- 3. إدراج الحالات المرضية ---
  console.log("🌱 إدراج الحالات المرضية...");

  const cases = await db
    .insert(casesTable)
    .values([

      // ===== الحالة 1: حرجة — احتشاء عضلة القلب — مركز عاهم → مستشفى عبس =====
      {
        patientName: "علي حسين المطري",
        age: 58,
        gender: "MALE",
        chiefComplaint: "ألم شديد في الصدر مع تعرق وغثيان منذ ساعة",
        symptoms: ["chest pain", "sweating", "nausea", "dizziness", "shortness of breath"],
        vitalSigns: {
          temperature: 37.2,
          heartRate: 112,
          bloodPressureSystolic: 185,
          bloodPressureDiastolic: 110,
          oxygenSaturation: 91,
          respiratoryRate: 22,
        },
        medicalHistory: "ضغط دم مرتفع منذ 10 سنوات، غير منتظم في العلاج",
        currentMedications: "أملوديبين 5ملغ (غير منتظم)",
        reportType: "SOAP",
        rawReport: "S: ألم صدري شديد ينتشر للذراع الأيسر منذ ساعة مع تعرق وغثيان. O: نبض 112، ضغط 185/110، أكسجين 91٪. A: اشتباه احتشاء حاد. P: تحويل فوري لعبس.",
        riskLevel: "CRITICAL",
        recommendedAction: "EMERGENCY_RESPONSE",
        recommendedDepartment: "Emergency Department",
        riskFactors: [
          "Critical symptom: chest pain",
          "Hypertensive crisis: 185/110 mmHg",
          "Hypoxia: SpO2 91%",
          "Tachycardia: 112 bpm",
          "Radiation to left arm — STEMI pattern",
        ],
        briefEnglish: "HOSPITAL BRIEF — Risk Level: CRITICAL\n\nPatient: Ali Hussein Al-Matari, 58M. Crushing chest pain with radiation to left arm, onset 1 hour ago. HR 112, BP 185/110, SpO2 91%. History: uncontrolled hypertension.\n\nRecommended Action: IMMEDIATE EMERGENCY RESPONSE — Transfer to Abs General Hospital for cardiac intervention.",
        briefArabic: "ملخص طبي — مستوى الخطورة: حرج\n\nالمريض: علي حسين المطري، 58 عاماً، ذكر. ألم صدري شديد ينتشر للذراع الأيسر منذ ساعة مع تعرق. النبض 112، الضغط 185/110، الأكسجين 91٪. تاريخ: ضغط مرتفع غير منتظم.\n\nالإجراء الموصى به: تدخل طارئ فوري — تحويل عاجل لمستشفى عبس العام.",
        caseStatus: "ROUTED_TO_HOSPITAL",
        assignedDoctorId: docEmergencyAahim.id,
        acknowledged: true,
      },

      // ===== الحالة 2: عالية — مخاض متعسر — مستشفى عبس =====
      {
        patientName: "فاطمة أحمد العوبلي",
        age: 26,
        gender: "FEMALE",
        chiefComplaint: "مخاض متعسر — الجنين في وضع مقعدي، نزيف مهبلي",
        symptoms: ["labor complications", "abnormal fetal position", "severe bleeding", "severe pain"],
        vitalSigns: {
          temperature: 37.4,
          heartRate: 124,
          bloodPressureSystolic: 90,
          bloodPressureDiastolic: 58,
          oxygenSaturation: 96,
          respiratoryRate: 24,
        },
        medicalHistory: "G3P2، الحمل 38 أسبوع، لم تُجرَ لها أشعة مسبقاً",
        currentMedications: "حمض الفوليك فقط",
        reportType: "SOAP",
        rawReport: "S: مخاض حار، عرض مقعدي، نزيف مهبلي نشط. O: نبض 124، ضغط 90/58، قلب الجنين 90 نبضة/دقيقة. A: ضائقة جنينية حادة + صدمة نزفية. P: عملية قيصرية طارئة فورية.",
        riskLevel: "HIGH",
        recommendedAction: "EMERGENCY_RESPONSE",
        recommendedDepartment: "Emergency Department",
        riskFactors: [
          "Hemorrhagic shock: BP 90/58",
          "Fetal distress: FHR 90 bpm",
          "Malpresentation — breech",
          "Tachycardia: 124 bpm",
          "Active vaginal bleeding",
        ],
        briefEnglish: "HOSPITAL BRIEF — Risk Level: HIGH\n\nPatient: Fatima Ahmed Al-Awbali, 26F, 38 weeks gestation. Obstructed labor — breech presentation with active hemorrhage. BP 90/58, HR 124, FHR 90 bpm — fetal distress. Emergency C-section required immediately.",
        briefArabic: "ملخص طبي — مستوى الخطورة: عالٍ\n\nالمريضة: فاطمة أحمد العوبلي، 26 سنة، حامل 38 أسبوع. مخاض متعسر — وضع مقعدي مع نزيف نشط. الضغط 90/58، النبض 124، قلب الجنين 90 نبضة/دقيقة — ضائقة جنينية. قيصرية طارئة فورية.",
        caseStatus: "ASSIGNED_TO_DOCTOR",
        assignedDoctorId: docGeneralAbs.id,
        acknowledged: true,
      },

      // ===== الحالة 3: حرجة — ذات رئة حادة عند طفل — مستشفى الجمهوري حجة =====
      {
        patientName: "يوسف محمد الشمري",
        age: 4,
        gender: "MALE",
        chiefComplaint: "ضيق تنفسي حاد وحمى شديدة منذ يومين",
        symptoms: ["respiratory distress", "high fever", "cyanosis", "cough", "difficulty breathing"],
        vitalSigns: {
          temperature: 40.1,
          heartRate: 156,
          bloodPressureSystolic: 88,
          bloodPressureDiastolic: 55,
          oxygenSaturation: 85,
          respiratoryRate: 52,
        },
        medicalHistory: "سوء تغذية، لقاحاته غير مكتملة",
        currentMedications: "لا يوجد",
        reportType: "SOAP",
        rawReport: "S: ضيق تنفسي متزايد، حمى 40 درجة، سعال منتج. O: أكسجين 85٪، حرارة 40.1، نبض 156، معدل تنفس 52، زرقة حول الشفاه. A: ذات رئة حادة مع فشل تنفسي وشيك. P: أكسجين فوري، مضادات حيوية IV، تقييم للتحويل.",
        riskLevel: "CRITICAL",
        recommendedAction: "EMERGENCY_RESPONSE",
        recommendedDepartment: "Pediatric ICU",
        riskFactors: [
          "Critical hypoxia: SpO2 85%",
          "Critically high temperature: 40.1°C",
          "Severe tachycardia: 156 bpm",
          "Tachypnea: RR 52/min",
          "Malnutrition — compromised immunity",
          "Incomplete vaccination",
        ],
        briefEnglish: "HOSPITAL BRIEF — Risk Level: CRITICAL\n\nPatient: Youssef Mohammed Al-Shamri, 4M. Severe pneumonia with impending respiratory failure. SpO2 85%, Temp 40.1°C, HR 156, RR 52. Background: malnutrition, incomplete vaccines. PICU admission required — consider transfer to Kuwait University Hospital Sana'a.",
        briefArabic: "ملخص طبي — مستوى الخطورة: حرج\n\nالمريض: يوسف محمد الشمري، 4 سنوات، ذكر. ذات رئة حادة مع فشل تنفسي وشيك. أكسجين 85٪، حرارة 40.1، نبض 156، معدل تنفس 52. خلفية: سوء تغذية، لقاحات ناقصة. يتطلب عناية مركزة أطفال — يُبحث تحويله لمستشفى جامعة الكويت صنعاء.",
        caseStatus: "ASSIGNED_TO_DOCTOR",
        assignedDoctorId: docPedsHajjah.id,
        acknowledged: true,
      },

      // ===== الحالة 4: متوسطة — داء السكري — مستشفى الجمهوري حجة =====
      {
        patientName: "نجاة سعيد الوادعي",
        age: 52,
        gender: "FEMALE",
        chiefComplaint: "دوار وارتباك وجفاف شديد — سكر الدم 32 ملمول/لتر",
        symptoms: ["hyperglycaemia", "confusion", "severe dehydration", "vomiting", "polyuria"],
        vitalSigns: {
          temperature: 37.8,
          heartRate: 104,
          bloodPressureSystolic: 100,
          bloodPressureDiastolic: 65,
          oxygenSaturation: 96,
          respiratoryRate: 22,
        },
        medicalHistory: "سكري نوع 2 منذ 8 سنوات، غير منتظمة في الدواء، تعيش في منطقة نائية",
        currentMedications: "ميتفورمين 500ملغ (منقطعة عنه شهرين)",
        reportType: "SOAP",
        rawReport: "S: دوار وارتباك، قيء متكرر، كثرة تبول وعطش. سكر 32 ملمول/لتر في المنزل. O: نبض 104، ضغط 100/65، جفاف واضح. A: الحالة السكرية فرط الأسموزية. P: سوائل IV، أنسولين، مراقبة.",
        riskLevel: "HIGH",
        recommendedAction: "HOSPITAL_VISIT",
        recommendedDepartment: "Internal Medicine",
        riskFactors: [
          "Severe hyperglycaemia: 32 mmol/L — HHS risk",
          "Dehydration with hypotension: BP 100/65",
          "Tachycardia: 104 bpm",
          "Altered mentation",
          "Medication non-compliance — 2 months",
        ],
        briefEnglish: "HOSPITAL BRIEF — Risk Level: HIGH\n\nPatient: Najat Said Al-Wada'i, 52F. Hyperosmolar hyperglycaemic state — BG 32 mmol/L, BP 100/65, altered consciousness. 2-month medication gap in remote area. Urgent IV fluids and insulin protocol.",
        briefArabic: "ملخص طبي — مستوى الخطورة: عالٍ\n\nالمريضة: نجاة سعيد الوادعي، 52 سنة، أنثى. حالة فرط سكر الدم والأسموزية — سكر 32، ضغط 100/65، اضطراب وعي. انقطاع عن الدواء شهرين في منطقة نائية. سوائل وأنسولين عاجل.",
        caseStatus: "DIAGNOSIS_IN_PROGRESS",
        assignedDoctorId: docInternalHajjah.id,
        diagnosisNotes: "سكر الدم العشوائي 32 ملمول/لتر. HbA1c 14.8٪. أعطيت محاليل ملحية 2 لتر في أول ساعة. بروتوكول الأنسولين IV بدأ. تحسّن الوعي بعد ساعتين. متابعة خلال 6 ساعات لتعديل الجرعة.",
        acknowledged: true,
      },

      // ===== الحالة 5: عالية — سكتة دماغية — تحويل لصنعاء =====
      {
        patientName: "حسن عبدالله القيسي",
        age: 67,
        gender: "MALE",
        chiefComplaint: "شلل نصفي مفاجئ في الجانب الأيمن مع اضطراب الكلام",
        symptoms: ["facial droop", "arm weakness", "slurred speech", "confusion", "severe headache"],
        vitalSigns: {
          temperature: 37.6,
          heartRate: 94,
          bloodPressureSystolic: 172,
          bloodPressureDiastolic: 102,
          oxygenSaturation: 95,
          respiratoryRate: 18,
        },
        medicalHistory: "ضغط دم مرتفع وسكري ورجفان أذيني، لا يتناول أي مضادات تخثر",
        currentMedications: "أملوديبين 10ملغ، ميتفورمين 500ملغ",
        reportType: "SOAP",
        rawReport: "S: شلل مفاجئ الجانب الأيمن واضطراب كلام منذ 3 ساعات. O: NIHSS 16، ضغط 172/102، رجفان أذيني في ECG. A: سكتة إقفارية حادة. P: CT عاجل، تقييم tPA، تحويل لصنعاء لوحدة السكتة.",
        riskLevel: "HIGH",
        recommendedAction: "HOSPITAL_VISIT",
        recommendedDepartment: "Neurology / Neurosurgery",
        riskFactors: [
          "Acute stroke — NIHSS 16",
          "Atrial fibrillation — embolic source",
          "No anticoagulation",
          "Hypertension: 172/102",
          "Diabetes — vascular risk",
        ],
        briefEnglish: "HOSPITAL BRIEF — Risk Level: HIGH\n\nPatient: Hassan Abdullah Al-Qaisi, 67M. Acute ischemic stroke — NIHSS 16, onset 3 hours. AF without anticoagulation — cardioembolic source likely. BP 172/102. Transfer to Kuwait University Hospital Sana'a for stroke unit and possible thrombectomy.",
        briefArabic: "ملخص طبي — مستوى الخطورة: عالٍ\n\nالمريض: حسن عبدالله القيسي، 67 سنة، ذكر. سكتة دماغية إقفارية حادة — NIHSS 16، منذ 3 ساعات. رجفان أذيني بلا مضادات تخثر — مصدر صمّة قلبية. تحويل لمستشفى جامعة الكويت صنعاء لوحدة السكتة والتدخل المحتمل.",
        caseStatus: "ROUTED_TO_HOSPITAL",
        assignedDoctorId: docNeuroSanaa.id,
        acknowledged: true,
      },

      // ===== الحالة 6: عالية — احتشاء قلبي معقد — صنعاء =====
      {
        patientName: "سلوى محمد الأصبحي",
        age: 48,
        gender: "FEMALE",
        chiefComplaint: "ألم في الصدر مع خفقان وإغماء عابر",
        symptoms: ["chest pain", "palpitations", "syncope", "shortness of breath", "dizziness"],
        vitalSigns: {
          temperature: 37.3,
          heartRate: 138,
          bloodPressureSystolic: 88,
          bloodPressureDiastolic: 54,
          oxygenSaturation: 90,
          respiratoryRate: 26,
        },
        medicalHistory: "سكري نوع 1، قصور قلب احتقاني مزمن، ارتجاع تاجي",
        currentMedications: "إنسولين غلارجين، ليزينوبريل، كاربيديلول",
        reportType: "SOAP",
        rawReport: "S: ألم صدري مع خفقان وإغماء عابر. O: نبض 138 غير منتظم، ضغط 88/54، أكسجين 90٪، ECG: تسرع بطيني. A: تسرع بطيني مع صدمة قلبية. P: تحويل حيوي فوري لوحدة القلب.",
        riskLevel: "CRITICAL",
        recommendedAction: "EMERGENCY_RESPONSE",
        recommendedDepartment: "Cardiology",
        riskFactors: [
          "Ventricular tachycardia — shockable rhythm",
          "Cardiogenic shock: BP 88/54",
          "Critical hypoxia: SpO2 90%",
          "Tachycardia: 138 bpm irregular",
          "Known CHF + DM1 — high mortality risk",
        ],
        briefEnglish: "HOSPITAL BRIEF — Risk Level: CRITICAL\n\nPatient: Salwa Mohammed Al-Asbahi, 48F. Ventricular tachycardia with cardiogenic shock — HR 138 irregular, BP 88/54, SpO2 90%. Background CHF + DM1. Admitted to Kuwait University Hospital Cardiology — IABP/cardioversion considered.",
        briefArabic: "ملخص طبي — مستوى الخطورة: حرج\n\nالمريضة: سلوى محمد الأصبحي، 48 سنة، أنثى. تسرع بطيني مع صدمة قلبية — نبض 138 غير منتظم، ضغط 88/54، أكسجين 90٪. خلفية قصور قلب احتقاني وسكري نوع 1. مقبولة في قسم القلب لمستشفى جامعة الكويت — يُبحث التحويل الكهربائي.",
        caseStatus: "ASSIGNED_TO_DOCTOR",
        assignedDoctorId: docCardioSanaa.id,
        diagnosisNotes: "ECG: تسرع بطيني أحادي الشكل بمعدل 138 نبضة/دقيقة. صدورات كهربائية متزامنة تم بنجاح — تحول لإيقاع الجيوب. أشعة صدر: احتقان رئوي. إيكو: EF 28٪، اتساع بطيني. مضخة بالون ترتيبية قيد التقييم.",
        acknowledged: true,
      },

      // ===== الحالة 7: منخفضة — مريض روتيني — مركز عاهم =====
      {
        patientName: "أم خالد الكشري",
        age: 38,
        gender: "FEMALE",
        chiefComplaint: "سعال متكرر وحمى خفيفة منذ أسبوع",
        symptoms: ["cough", "low-grade fever", "fatigue", "sore throat"],
        vitalSigns: {
          temperature: 37.8,
          heartRate: 86,
          bloodPressureSystolic: 112,
          bloodPressureDiastolic: 70,
          oxygenSaturation: 98,
          respiratoryRate: 16,
        },
        medicalHistory: "لا يوجد",
        currentMedications: "لا يوجد",
        reportType: "SOAP",
        rawReport: "S: سعال وحمى منذ أسبوع. O: حرارة 37.8، نبض 86، علامات حيوية مستقرة. A: التهاب مجاري تنفسية علوية. P: علاج عرضي.",
        riskLevel: "LOW",
        recommendedAction: "SCHEDULE_CONSULTATION",
        recommendedDepartment: "General Medicine",
        riskFactors: [
          "Mild fever: 37.8°C",
          "Symptom duration >7 days",
        ],
        briefEnglish: "HOSPITAL BRIEF — Risk Level: LOW\n\nPatient: Um Khalid Al-Kashri, 38F. Upper respiratory tract infection — 1-week cough, low-grade fever. Vitals stable. Symptomatic treatment. Follow-up if worsening.",
        briefArabic: "ملخص طبي — مستوى الخطورة: منخفض\n\nالمريضة: أم خالد الكشري، 38 سنة، أنثى. التهاب مجاري تنفسية علوية — سعال أسبوع، حمى خفيفة. العلامات الحيوية مستقرة. علاج عرضي. مراجعة إذا ساءت الحالة.",
        caseStatus: "COMPLETED",
        assignedDoctorId: docEmergencyAahim.id,
        diagnosisNotes: "التهاب بلعوم بكتيري. أعطيت أموكسيسيلين 500ملغ لمدة 7 أيام مع مسكن ألم. نُصحت بالراحة والإماهة الجيدة. مراجعة إذا استمرت الأعراض أكثر من أسبوع.",
        acknowledged: true,
      },

      // ===== الحالة 8: متوسطة — حمى الضنك — مستشفى عبس =====
      {
        patientName: "محمد ناصر العريقي",
        age: 22,
        gender: "MALE",
        chiefComplaint: "حمى شديدة وآلام مفاصل وطفح جلدي منذ 4 أيام",
        symptoms: ["fever", "arthralgia", "rash", "severe headache", "fatigue", "vomiting"],
        vitalSigns: {
          temperature: 39.5,
          heartRate: 102,
          bloodPressureSystolic: 108,
          bloodPressureDiastolic: 68,
          oxygenSaturation: 97,
          respiratoryRate: 19,
        },
        medicalHistory: "لا يوجد. يعيش في منطقة ينتشر فيها البعوض",
        currentMedications: "لا يوجد",
        reportType: "SOAP",
        rawReport: "S: حمى 39.5، آلام مفاصل شديدة، طفح جلدي بقعي على الجذع. O: نبض 102، كريات دم بيضاء منخفضة، صفائح 89 ألف. A: اشتباه حمى ضنك. P: NS1 والـ IgM، مراقبة الصفائح.",
        riskLevel: "MEDIUM",
        recommendedAction: "HOSPITAL_VISIT",
        recommendedDepartment: "Internal Medicine",
        riskFactors: [
          "High fever: 39.5°C",
          "Thrombocytopenia: platelets 89,000 — dengue warning sign",
          "Tachycardia: 102 bpm",
          "Endemic area exposure",
          "Maculopapular rash — dengue pattern",
        ],
        briefEnglish: "HOSPITAL BRIEF — Risk Level: MEDIUM\n\nPatient: Mohammed Nasser Al-Urayqi, 22M. Suspected dengue fever — Temp 39.5°C, platelets 89K, maculopapular rash, arthralgia. Monitor for dengue hemorrhagic fever progression. NS1 antigen and IgM pending.",
        briefArabic: "ملخص طبي — مستوى الخطورة: متوسط\n\nالمريض: محمد ناصر العريقي، 22 سنة، ذكر. اشتباه حمى ضنك — حرارة 39.5، صفائح 89 ألف، طفح بقعي، آلام مفاصل. مراقبة لتحوّل لحمى ضنك نزفية. NS1 وIgM قيد الانتظار.",
        caseStatus: "DIAGNOSIS_IN_PROGRESS",
        assignedDoctorId: docGeneralAbs.id,
        diagnosisNotes: "NS1 إيجابي — تأكيد حمى الضنك. صفائح منخفضة 89 ألف وتتناقص (67 ألف بعد 24 ساعة). علامات تسرب البلازما غائبة. علاج داعم: سوائل IV، باراسيتامول. مراقبة الصفائح كل 12 ساعة.",
        acknowledged: true,
      },
    ])
    .returning();

  console.log(`✅ تم إدراج ${cases.length} حالات مرضية`);

  // --- 4. إدراج التحويلات ---
  console.log("🌱 إدراج تحويلات مسار حجة-صنعاء...");

  const transfers = await db
    .insert(transfersTable)
    .values([
      // تحويل 1: علي المطري — من عاهم إلى عبس (احتشاء قلبي)
      {
        caseId: cases[0].id,
        direction: "OUTGOING",
        fromHospitalId: hAahim.id,
        toHospitalId: hAbs.id,
        patientName: "علي حسين المطري",
        patientAge: 58,
        patientGender: "MALE",
        chiefComplaint: "ألم شديد في الصدر — اشتباه احتشاء حاد",
        riskLevel: "CRITICAL",
        status: "IN_TRANSIT",
        transportMethod: "AMBULANCE",
        transferCode: "TRF-HAJ-0001",
        clinicalSummary: "مريض 58 سنة بألم صدري حاد مع تعرق. نبض 112، ضغط 185/110، أكسجين 91٪. اشتباه STEMI. أُعطي أسبرين 300ملغ في المركز. تحويل عاجل لعبس للتدخل القلبي.",
        specialRequirements: "فريق طوارئ قلبية، مضاد تخثر جاهز، صدمة كهربائية متاحة",
        estimatedArrival: new Date("2026-03-16T10:30:00Z"),
      },
      // تحويل 2: يوسف الشمري — من حجة إلى صنعاء (ذات رئة أطفال)
      {
        caseId: cases[2].id,
        direction: "OUTGOING",
        fromHospitalId: hHajjah.id,
        toHospitalId: hSanaa.id,
        patientName: "يوسف محمد الشمري",
        patientAge: 4,
        patientGender: "MALE",
        chiefComplaint: "فشل تنفسي وشيك — ذات رئة حادة مع سوء تغذية",
        riskLevel: "CRITICAL",
        status: "ACCEPTED",
        transportMethod: "AMBULANCE",
        transferCode: "TRF-HAJ-0002",
        clinicalSummary: "طفل 4 سنوات مع ذات رئة حادة وفشل تنفسي وشيك. أكسجين 85٪، حرارة 40.1، نبض 156. سوء تغذية ولقاحات ناقصة. يحتاج وحدة عناية مركزة أطفال متخصصة غير متوفرة في حجة.",
        specialRequirements: "سرير PICU، تنفس اصطناعي جاهز، مضادات حيوية IV مستمرة أثناء النقل",
        estimatedArrival: new Date("2026-03-16T14:00:00Z"),
        acceptedAt: new Date("2026-03-16T11:30:00Z"),
      },
      // تحويل 3: حسن القيسي — من حجة إلى صنعاء (سكتة دماغية)
      {
        caseId: cases[4].id,
        direction: "OUTGOING",
        fromHospitalId: hHajjah.id,
        toHospitalId: hSanaa.id,
        patientName: "حسن عبدالله القيسي",
        patientAge: 67,
        patientGender: "MALE",
        chiefComplaint: "سكتة دماغية إقفارية حادة — NIHSS 16",
        riskLevel: "HIGH",
        status: "PENDING",
        transportMethod: "AMBULANCE",
        transferCode: "TRF-HAJ-0003",
        clinicalSummary: "مريض 67 سنة بشلل نصفي أيمن واضطراب كلام منذ 3 ساعات. NIHSS 16، ضغط 172/102، رجفان أذيني. يتجاوز نافذة tPA حجة — يحتاج تقييم استخراج الجلطة في صنعاء.",
        specialRequirements: "CT أنجيوغرافي عند الوصول، فريق تدخل عصبي، مضادات التخثر جاهزة",
        estimatedArrival: new Date("2026-03-16T16:00:00Z"),
      },
      // تحويل 4: سلوى الأصبحي — واردة لصنعاء (قلبية)
      {
        caseId: cases[5].id,
        direction: "INCOMING",
        fromHospitalId: hHajjah.id,
        toHospitalId: hSanaa.id,
        patientName: "سلوى محمد الأصبحي",
        patientAge: 48,
        patientGender: "FEMALE",
        chiefComplaint: "تسرع بطيني مع صدمة قلبية",
        riskLevel: "CRITICAL",
        status: "ACCEPTED",
        transportMethod: "AMBULANCE",
        transferCode: "TRF-HAJ-0004",
        clinicalSummary: "مريضة 48 سنة بتسرع بطيني وصدمة قلبية. نبض 138 غير منتظم، ضغط 88/54، أكسجين 90٪. تم تحويلها كهربائياً جزئياً في حجة. تحتاج وحدة قلب متكاملة وربما مضخة بالون.",
        specialRequirements: "وحدة قلب ICU، مضخة بالون داخل الأبهر، فريق تدخل قلبي",
        estimatedArrival: new Date("2026-03-16T09:00:00Z"),
        acceptedAt: new Date("2026-03-16T07:45:00Z"),
      },
    ])
    .returning();

  console.log(`✅ تم إدراج ${transfers.length} تحويلات`);

  console.log("\n✅ اكتمل إدراج بيانات مسار حجة-صنعاء بنجاح!");
  console.log(`   ${doctors.length} أطباء | ${cases.length} حالات | ${transfers.length} تحويلات`);
  console.log(`   المستشفيات: ${hAahim.nameAr} → ${hAbs.nameAr} → ${hHajjah.nameAr} → ${hSanaa.nameAr}`);
  await pool.end();
  process.exit(0);
}

seedHajjahCases().catch((err) => {
  console.error("❌ فشل الإدراج:", err);
  process.exit(1);
});
