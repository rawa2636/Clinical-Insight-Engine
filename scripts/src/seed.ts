import { db, hospitalsTable, doctorsTable } from "@workspace/db";

async function seed() {
  console.log("🌱 Seeding hospitals...");

  await db.delete(doctorsTable).execute().catch(() => {});
  await db.delete(hospitalsTable).execute().catch(() => {});

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
  console.log("✅ Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
