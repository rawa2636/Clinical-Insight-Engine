import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Zap, ChevronRight, AlertTriangle, CheckCircle2,
  ArrowDown, Activity, Navigation, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

type PathwayStep = {
  stage: string;
  nameAr: string;
  nameEn: string;
  city: string;
  level: string;
  riskBefore: number;
  riskAfter: number;
  reduction: number;
  distanceToNext: number;
};

type SimulationResult = {
  initialRisk: number;
  finalRisk: number;
  totalReduction: number;
  steps: PathwayStep[];
};

type PathwayFacility = {
  id: number;
  nameAr: string;
  nameEn: string;
  city: string;
  level: string;
  riskReduction: number;
  distanceToNext: number;
  pathwayOrder: number;
};

type PathwayData = {
  telemedicineReduction: number;
  facilities: PathwayFacility[];
  totalDistanceKm: number;
};

const LEVEL_LABELS: Record<string, { ar: string; color: string; bg: string }> = {
  TELEMEDICINE: { ar: "استشارة عن بعد", color: "text-violet-700", bg: "bg-violet-500/10 border-violet-400/30" },
  PRIMARY: { ar: "رعاية أولية", color: "text-green-700", bg: "bg-green-500/10 border-green-400/30" },
  SECONDARY: { ar: "رعاية ثانوية", color: "text-blue-700", bg: "bg-blue-500/10 border-blue-400/30" },
  SPECIALIZED: { ar: "رعاية تخصصية", color: "text-orange-700", bg: "bg-orange-500/10 border-orange-400/30" },
  TERTIARY: { ar: "رعاية ثالثية", color: "text-red-700", bg: "bg-red-500/10 border-red-400/30" },
};

function getRiskColor(risk: number) {
  if (risk >= 75) return "text-red-600";
  if (risk >= 50) return "text-orange-600";
  if (risk >= 25) return "text-yellow-600";
  return "text-green-600";
}

function getRiskBg(risk: number) {
  if (risk >= 75) return "bg-red-500";
  if (risk >= 50) return "bg-orange-500";
  if (risk >= 25) return "bg-yellow-500";
  return "bg-green-500";
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function ReferralPathwayPage() {
  const [initialRisk, setInitialRisk] = useState(80);
  const [patientName, setPatientName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pathwayData, setPathwayData] = useState<PathwayData | null>(null);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [pathwayLoaded, setPathwayLoaded] = useState(false);

  async function loadPathway() {
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE}/api/referral-pathway`);
      const data = await res.json();
      setPathwayData(data);
      setPathwayLoaded(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  async function runSimulation() {
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE}/api/referral-pathway/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initialRisk }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  if (!pathwayLoaded) {
    return (
      <div className="flex-1 overflow-auto bg-background/50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center gap-3 border-b border-border pb-6">
            <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
              <Navigation className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">مسار الإحالة</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Referral Pathway — كشر ← عبس ← حجة ← صنعاء</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-6 shadow-sm">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
              <Navigation className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">نظام محاكاة إحالة المرضى</h2>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto" dir="rtl">
                اعرف كيف يتراجع مستوى خطر المريض عبر محطات مسار الإحالة من كشر إلى صنعاء، مروراً بعبس ومدينة حجة.
              </p>
            </div>
            <button
              onClick={loadPathway}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold shadow-sm shadow-primary/20 transition-colors disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
              تحميل بيانات المسار
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-background/50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
              <Navigation className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">مسار الإحالة</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Referral Pathway Simulator — حجة إلى صنعاء</p>
            </div>
          </div>
          {pathwayData && (
            <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-xl text-sm text-muted-foreground border border-border">
              <MapPin className="w-4 h-4" />
              إجمالي المسافة: <span className="font-bold text-foreground">{pathwayData.totalDistanceKm} كم</span>
            </div>
          )}
        </div>

        {/* Pathway Map */}
        {pathwayData && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-foreground mb-5 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              خريطة المرافق الصحية
            </h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-0 sm:gap-0 overflow-x-auto pb-2">
              {/* Telemedicine bubble */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-24 h-24 rounded-2xl bg-violet-500/10 border-2 border-violet-400/30 flex flex-col items-center justify-center text-center p-2 shadow-sm">
                  <Zap className="w-5 h-5 text-violet-600 mb-1" />
                  <span className="text-[10px] font-bold text-violet-700 leading-tight" dir="rtl">استشارة عن بعد</span>
                  <span className="text-xs font-bold text-violet-600 mt-0.5">−{pathwayData.telemedicineReduction}%</span>
                </div>
              </div>

              {pathwayData.facilities.map((f, i) => {
                const lvl = LEVEL_LABELS[f.level] ?? LEVEL_LABELS.PRIMARY;
                return (
                  <div key={f.id} className="flex flex-col sm:flex-row items-center flex-shrink-0">
                    {/* Arrow with distance */}
                    <div className="flex flex-col items-center my-2 sm:my-0 sm:mx-2">
                      <ChevronRight className="w-5 h-5 text-muted-foreground hidden sm:block" />
                      <ArrowDown className="w-5 h-5 text-muted-foreground sm:hidden" />
                      {i < pathwayData.facilities.length && (
                        <span className="text-[9px] text-muted-foreground font-medium">
                          {pathwayData.facilities[i - 1]?.distanceToNext ?? (i === 0 ? 0 : 0)} كم
                        </span>
                      )}
                    </div>
                    {/* Facility bubble */}
                    <div className={cn("w-28 h-24 rounded-2xl border-2 flex flex-col items-center justify-center text-center p-2 shadow-sm", lvl.bg)}>
                      <MapPin className={cn("w-4 h-4 mb-1", lvl.color)} />
                      <span className={cn("text-[9px] font-bold leading-tight text-center", lvl.color)} dir="rtl">{f.nameAr}</span>
                      <span className="text-[9px] text-muted-foreground mt-0.5">{f.city}</span>
                      <span className={cn("text-xs font-bold mt-0.5", lvl.color)}>−{f.riskReduction}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Simulation Form */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-foreground mb-5 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            محاكاة تقليل الخطر
          </h2>
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                اسم المريض (اختياري)
              </label>
              <input
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="مثال: محمد علي"
                dir="rtl"
                className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                نسبة الخطر الأولية — Initial Risk: <span className={cn("text-lg font-display font-bold", getRiskColor(initialRisk))}>{initialRisk}%</span>
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={initialRisk}
                onChange={(e) => { setInitialRisk(Number(e.target.value)); setResult(null); }}
                className="w-full accent-primary h-2 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0% — منخفض</span>
                <span>50% — متوسط</span>
                <span>100% — حرج</span>
              </div>
            </div>

            <button
              onClick={runSimulation}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-bold shadow-sm shadow-primary/20 transition-colors disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              ابدأ المحاكاة
            </button>
          </div>
        </div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-4"
            >
              {/* Summary bar */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      {patientName ? `المريض: ${patientName}` : "نتائج المحاكاة"}
                    </p>
                    <div className="flex items-center gap-3">
                      <span className={cn("text-3xl font-display font-bold", getRiskColor(result.initialRisk))}>{result.initialRisk}%</span>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      <span className={cn("text-3xl font-display font-bold", getRiskColor(result.finalRisk))}>{result.finalRisk}%</span>
                      <span className="text-sm bg-green-500/10 text-green-700 border border-green-400/30 px-2 py-0.5 rounded-full font-bold">
                        −{result.totalReduction}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {result.finalRisk <= 20 ? (
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    ) : result.finalRisk <= 50 ? (
                      <Activity className="w-8 h-8 text-yellow-500" />
                    ) : (
                      <AlertTriangle className="w-8 h-8 text-orange-500" />
                    )}
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {result.finalRisk <= 20 ? "الحالة مستقرة" : result.finalRisk <= 50 ? "تحسّن ملحوظ" : "بحاجة لمزيد من الرعاية"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {result.finalRisk <= 20 ? "Case Stabilized" : result.finalRisk <= 50 ? "Significant improvement" : "Requires further care"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Risk bar */}
                <div className="mt-4 h-3 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: `${result.initialRisk}%` }}
                    animate={{ width: `${result.finalRisk}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={cn("h-full rounded-full", getRiskBg(result.finalRisk))}
                  />
                </div>
              </div>

              {/* Step-by-step */}
              <div className="space-y-3">
                {result.steps.map((step, i) => {
                  const lvl = LEVEL_LABELS[step.level] ?? LEVEL_LABELS.PRIMARY;
                  return (
                    <motion.div
                      key={step.stage}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
                    >
                      <div className="p-4 flex items-start gap-4">
                        <div className={cn("w-10 h-10 rounded-xl border-2 flex items-center justify-center flex-shrink-0", lvl.bg)}>
                          {step.level === "TELEMEDICINE" ? (
                            <Zap className={cn("w-4 h-4", lvl.color)} />
                          ) : (
                            <MapPin className={cn("w-4 h-4", lvl.color)} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <p className="font-bold text-foreground text-sm" dir="rtl">{step.nameAr}</p>
                            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", lvl.bg, lvl.color)}>
                              {lvl.ar}
                            </span>
                            {step.city !== "-" && (
                              <span className="text-[10px] text-muted-foreground">{step.city}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <span className={cn("text-lg font-display font-bold", getRiskColor(step.riskBefore))}>{step.riskBefore}%</span>
                              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className={cn("text-lg font-display font-bold", getRiskColor(step.riskAfter))}>{step.riskAfter}%</span>
                            </div>
                            <span className="text-xs bg-green-500/10 text-green-700 border border-green-400/30 px-2 py-0.5 rounded-full font-bold">
                              −{step.reduction}% خطر
                            </span>
                            {step.distanceToNext > 0 && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Navigation className="w-3 h-3" />
                                {step.distanceToNext} كم للمحطة التالية
                              </span>
                            )}
                          </div>

                          {/* Mini risk bar */}
                          <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: `${step.riskBefore}%` }}
                              animate={{ width: `${step.riskAfter}%` }}
                              transition={{ duration: 0.6, delay: i * 0.08 + 0.3 }}
                              className={cn("h-full rounded-full", getRiskBg(step.riskAfter))}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Table summary */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-3 border-b border-border bg-muted/30">
                  <h3 className="text-sm font-bold text-foreground">جدول ملخص المسار</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <th className="px-4 py-3 text-right">المحطة</th>
                        <th className="px-4 py-3 text-right">الموقع</th>
                        <th className="px-4 py-3 text-center">تقليل الخطر</th>
                        <th className="px-4 py-3 text-center">الخطر بعد المحطة</th>
                        <th className="px-4 py-3 text-center">المسافة (كم)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.steps.map((step) => (
                        <tr key={step.stage} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-medium text-right" dir="rtl">{step.nameAr}</td>
                          <td className="px-4 py-3 text-muted-foreground text-right">{step.city === "-" ? "—" : step.city}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-green-700 font-bold">−{step.reduction}%</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={cn("font-bold", getRiskColor(step.riskAfter))}>{step.riskAfter}%</span>
                          </td>
                          <td className="px-4 py-3 text-center text-muted-foreground">
                            {step.distanceToNext > 0 ? `${step.distanceToNext} كم` : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
