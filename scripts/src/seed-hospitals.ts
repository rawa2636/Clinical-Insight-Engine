import { db, pool, hospitalsTable } from "@workspace/db";

const HAJJAH_PATHWAY = [
  {
    nameEn: "Aahim Health Center",
    nameAr: "مركز عاهم الصحي",
    city: "كشر",
    address: "مديرية كشر، محافظة حجة",
    phone: "+967-7-000001",
    specialties: ["Primary Care", "Emergency First Aid", "رعاية أولية"],
    level: "PRIMARY",
    pathwayOrder: 1,
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
    level: "SECONDARY",
    pathwayOrder: 2,
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
    level: "SPECIALIZED",
    pathwayOrder: 3,
    riskReduction: 15,
    distanceToNext: 123,
  },
  {
    nameEn: "Kuwait University Hospital",
    nameAr: "مستشفى جامعة الكويت",
    city: "صنعاء",
    address: "صنعاء، الجمهورية اليمنية",
    phone: "+967-1-000004",
    specialties: ["Neurosurgery", "Oncology", "Transplant", "ICU", "جراحة أعصاب", "أورام", "عناية مركزة"],
    level: "TERTIARY",
    pathwayOrder: 4,
    riskReduction: 35,
    distanceToNext: 0,
  },
];

async function seedHospitals() {
  console.log("🏥 إدراج بيانات المرافق الصحية لمسار حجة-صنعاء...");

  await pool.query(`DELETE FROM hospitals WHERE pathway_order IS NOT NULL`);
  console.log("🗑️  حذف البيانات القديمة للمسار...");

  for (const h of HAJJAH_PATHWAY) {
    await db.insert(hospitalsTable).values({
      nameEn: h.nameEn,
      nameAr: h.nameAr,
      city: h.city,
      address: h.address,
      phone: h.phone,
      specialties: h.specialties,
      isAvailable: "true",
      level: h.level,
      pathwayOrder: h.pathwayOrder,
      riskReduction: h.riskReduction,
      distanceToNext: h.distanceToNext,
    });
    console.log(`✅ إضافة: ${h.nameAr} (${h.city})`);
  }

  console.log("✅ اكتمل إدراج المرافق الصحية بنجاح.");
  process.exit(0);
}

seedHospitals().catch((err) => {
  console.error("❌ فشل الإدراج:", err);
  process.exit(1);
});
