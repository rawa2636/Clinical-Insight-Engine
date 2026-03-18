# HospitalIntel — Clinical Insight Engine

<div align="center">

![HospitalIntel Banner](https://img.shields.io/badge/HospitalIntel-Clinical%20Insight%20Engine-0ea5e9?style=for-the-badge&logo=heart&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=black)
![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Drizzle%20ORM-4169e1?style=flat-square&logo=postgresql&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-workspace-f69220?style=flat-square&logo=pnpm&logoColor=white)

**نظام ذكاء استشاري سريري متكامل لإدارة الحالات الطبية ومسارات الإحالة بين المستشفيات**

A full-stack clinical intelligence platform for managing patient cases, inter-hospital transfers, and referral pathways — built for the Yemen Hajjah–Sana'a referral corridor.

🌐 **Live Demo:** [https://clinical-insight-engine--richffish2.replit.app/](https://clinical-insight-engine--richffish2.replit.app/)

</div>

---

## نظرة عامة / Overview

**HospitalIntel** هو نظام إدارة حالات سريرية مبني كـ TypeScript monorepo متكامل، يربط الواجهة الأمامية بـ React/Vite بخادم Express وقاعدة بيانات PostgreSQL. صُمِّم خصيصاً لتتبع مسار إحالة المرضى عبر شبكة مستشفيات محافظة حجة اليمنية وصولاً إلى صنعاء، مع إدارة كاملة للحالات والتحويلات والأطباء.

**HospitalIntel** is a full-stack clinical case management system built as a pnpm TypeScript monorepo. It enables end-to-end tracking of patient cases through a hospital referral pathway — from primary health centres to university hospitals — with complete transfer lifecycle management, doctor assignment, and clinical documentation.

---

## الميزات الرئيسية / Key Features

### لوحة فرز الحالات / Triage Dashboard
- عرض فوري لجميع الحالات مع مستوى الخطورة (Critical / High / Medium / Low)
- تصفية حسب الحالة والأولوية والقسم المقترح
- شارات تنبيه للحالات الحرجة غير المُقرَّة
- Real-time case queue with colour-coded risk badges and unacknowledged critical alerts

### مسار النقل بين المستشفيات / Hospital Transfer Pathway (Embedded)
مُدمج مباشرةً داخل ملف كل مريض:
- خريطة مرئية للمسار: عاهم → عبس → الجمهوري → جامعة الكويت صنعاء
- نقاط حالة حية: 🟠 في الطريق | 🟢 وصل | 🔵 مجدول | ⚪ لم يُزَر
- أزرار إجراء سياقية: قبول التحويل، تأكيد المغادرة، تأكيد الوصول، إلغاء
- نموذج إنشاء تحويل جديد مدمج بالكامل
- تحديث تلقائي لحالة الحالة عند كل خطوة

Embedded directly in the patient case file — not a separate page:
- Visual pathway map with live status dots
- Contextual action buttons per transfer status
- Inline new-transfer creation form
- Auto-cascades case status on every transfer event

### إدارة الحالات السريرية / Clinical Case Management
- دورة حياة الحالة الكاملة عبر 8 مراحل: Received → Analyzed → Created → Routed → Received → Assigned → In Progress → Completed
- ملخصات ذكاء اصطناعي ثنائية اللغة (عربي / إنجليزي)
- سجل العلامات الحيوية، عوامل الخطر، الأعراض
- ملاحظات التشخيص وتحديث حالة الحالة
- Full 8-step case lifecycle with bilingual (AR/EN) AI briefs

### تعيين الأطباء / Doctor Assignment
- قائمة الأطباء المتاحين حسب التخصص والتقييم
- تعيين مباشر من ملف المريض
- تحديث تلقائي لحالة الحالة إلى ASSIGNED_TO_DOCTOR

### استشارات الفيديو / Video Consultations
- حجز استشارات أونلاين مع الأطباء المتخصصين
- دعم كامل لاستشارات عن بُعد للحالات التي تتطلب ذلك

---

## التقنيات / Tech Stack

| الطبقة | التقنية |
|--------|---------|
| **Frontend** | React 19 + Vite 7 + TypeScript |
| **UI** | Tailwind CSS v4 + shadcn/ui + Lucide Icons |
| **Routing** | Wouter |
| **State / Data** | TanStack Query v5 |
| **API Client** | Auto-generated from OpenAPI via Orval |
| **Backend** | Express 5 + TypeScript + tsx |
| **Database** | PostgreSQL + Drizzle ORM |
| **Validation** | Zod v4 + drizzle-zod |
| **Build** | pnpm workspaces + esbuild |
| **Platform** | Replit (Autoscale deployment) |

---

## هيكل المشروع / Project Structure

```
hospital-intel/
├── artifacts/
│   ├── hospital-intel/          # React + Vite frontend
│   │   └── src/
│   │       ├── pages/           # Dashboard, Case Detail, Transfers, Doctors...
│   │       ├── components/      # Shared UI components
│   │       └── hooks/           # Custom React hooks
│   └── api-server/              # Express backend
│       └── src/
│           ├── app.ts           # Express app setup
│           ├── index.ts         # Server entry + auto DB seed
│           ├── init-db.ts       # Automatic first-run database seeder
│           └── routes/
│               ├── cases.ts     # Clinical cases CRUD + actions
│               ├── transfers.ts # Transfer lifecycle + hospital enrichment
│               └── consultations.ts
├── lib/
│   ├── db/                      # Drizzle ORM schema + migrations
│   │   └── src/schema/
│   │       ├── cases.ts         # Clinical cases + enums
│   │       ├── transfers.ts     # Hospitals + transfers + enums
│   │       └── consultations.ts # Doctors + consultations
│   ├── api-spec/                # OpenAPI 3.1 specification
│   └── api-client-react/        # Orval-generated React hooks
└── scripts/
    ├── seed.ts                  # Development seed (KSA hospitals)
    └── seed-hajjah-cases.ts     # Yemen Hajjah pathway seed
```

---

## مسار الإحالة اليمني / Yemen Referral Pathway

```
مركز عاهم الصحي     →     مستشفى عبس العام     →     هيئة مستشفى الجمهوري     →     مستشفى جامعة الكويت — صنعاء
  (PRIMARY)                  (SECONDARY)                  (SPECIALIZED)                      (TERTIARY)
   كشر / Kashr                عبس / Abs                  مدينة حجة / Hajjah City             صنعاء / Sana'a
   40 km →                    113 km →                    123 km →
```

---

## قاعدة البيانات / Database Schema

```
clinical_cases         → حالات المرضى + مستوى الخطورة + الحالة + الطبيب المعيّن
hospitals              → المستشفيات + المستوى + ترتيب المسار
hospital_transfers     → التحويلات + الحالة + المستشفى المرسِل والمستقبِل
doctors                → الأطباء + التخصص + التقييم + التوفر
consultations          → مواعيد الاستشارات + حالة الاجتماع
```

---

## التثبيت المحلي / Local Installation

### المتطلبات / Prerequisites
- Node.js 18+
- pnpm 9+
- PostgreSQL database

### خطوات التثبيت / Steps

```bash
# استنساخ المشروع / Clone the repository
git clone https://github.com/richffish/clinical-insight-engine.git
cd clinical-insight-engine

# تثبيت الاعتماديات / Install dependencies
pnpm install

# إعداد متغيرات البيئة / Setup environment variables
# أنشئ ملف .env أو عيّن المتغيرات التالية:
export DATABASE_URL="postgresql://user:password@localhost:5432/hospital_intel"
export PORT=8080

# مزامنة قاعدة البيانات / Push database schema
cd lib/db && pnpm run push && cd ../..

# بذر البيانات التجريبية / Seed demo data
pnpm --filter @workspace/scripts run seed
pnpm --filter @workspace/scripts run seed-hajjah-cases

# تشغيل الخادم الخلفي / Run backend
PORT=8080 pnpm --filter @workspace/api-server run dev

# تشغيل الواجهة الأمامية / Run frontend (in another terminal)
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/hospital-intel run dev
```

التطبيق متاح على: **http://localhost:3000**
API متاح على: **http://localhost:8080/api**

---

## النشر / Deployment

التطبيق مُهيَّأ للنشر على Replit Autoscale:
- عند أول تشغيل في الإنتاج، يُبذَر قاعدة البيانات تلقائياً من `init-db.ts`
- البناء: `pnpm --filter @workspace/api-server run build && pnpm --filter @workspace/hospital-intel run build`
- التشغيل: `node artifacts/api-server/dist/index.cjs`

The app auto-seeds on first production run if the database is empty — no manual migration needed.

---

## نقاط API / API Endpoints

```
GET    /api/healthz                      Health check
GET    /api/cases                        List all cases
GET    /api/cases/:id                    Get case details
POST   /api/cases                        Create case
POST   /api/cases/:id/acknowledge        Acknowledge critical alert
POST   /api/cases/:id/assign-doctor      Assign doctor to case
POST   /api/cases/:id/diagnosis          Update diagnosis notes
DELETE /api/cases/:id                    Delete case

GET    /api/hospitals                    List all hospitals
GET    /api/transfers                    List all transfers (enriched with hospital data)
POST   /api/transfers                    Create new transfer
POST   /api/transfers/:id/accept         Accept transfer → ACCEPTED
POST   /api/transfers/:id/in-transit     Confirm departure → IN_TRANSIT
POST   /api/transfers/:id/arrived        Confirm arrival → ARRIVED (updates case status)
POST   /api/transfers/:id/cancel         Cancel transfer → CANCELLED
POST   /api/transfers/:id/reject         Reject transfer → REJECTED

GET    /api/doctors                      List all doctors
GET    /api/consultations                List consultations
POST   /api/consultations                Schedule consultation
```

---

## الرخصة / License

MIT License — حر الاستخدام للأغراض التعليمية والبحثية والطبية غير التجارية.

---

<div align="center">

صُنع بـ ❤️ لدعم المنظومة الصحية في اليمن

*Built to support the healthcare system in Yemen*

**[🌐 Live Demo](https://clinical-insight-engine--richffish2.replit.app/)** • **[📋 API Docs](https://clinical-insight-engine--richffish2.replit.app/api/healthz)**

</div>
