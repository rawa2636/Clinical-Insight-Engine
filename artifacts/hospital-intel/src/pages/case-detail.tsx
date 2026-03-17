import { useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import {
  useGetCase, useDeleteCase, useAcknowledgeCase, useAssignDoctor,
  useUpdateDiagnosis, useListDoctors, useListTransfers, useListHospitals,
  useMarkTransferInTransit, useMarkTransferArrived, useCancelTransfer,
  useAcceptTransfer, useCreateTransfer,
  getGetCaseQueryKey, getListCasesQueryKey, getListTransfersQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ArrowLeft, Activity, User, Clock, AlertTriangle,
  Trash2, ShieldAlert, HeartPulse, Stethoscope,
  FileText, CheckCircle2, Video, ArrowLeftRight,
  UserCheck, ClipboardList, Building2, Loader2,
  ChevronDown, ChevronUp, MapPin, Truck, Plane,
  Navigation, Circle, ChevronRight, Ban, Send,
  Phone, Plus
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CASE_STATUS_STEPS = [
  { key: "REPORT_RECEIVED",     label: "Received",    labelAr: "تم الاستلام" },
  { key: "ANALYZED",            label: "Analyzed",    labelAr: "تم التحليل" },
  { key: "CASE_CREATED",        label: "Created",     labelAr: "تم الإنشاء" },
  { key: "ROUTED_TO_HOSPITAL",  label: "Routed",      labelAr: "تم التحويل" },
  { key: "RECEIVED_BY_HOSPITAL",label: "Received",    labelAr: "تم الاستقبال" },
  { key: "ASSIGNED_TO_DOCTOR",  label: "Assigned",    labelAr: "تم التعيين" },
  { key: "DIAGNOSIS_IN_PROGRESS",label: "In Progress",labelAr: "قيد التشخيص" },
  { key: "COMPLETED",           label: "Completed",   labelAr: "مكتمل" },
];

const STATUS_ORDER = CASE_STATUS_STEPS.map(s => s.key);

type Doctor = {
  id: number;
  nameEn: string;
  nameAr: string;
  specialtyLabelEn: string;
  specialtyLabelAr: string;
  avatarInitials: string;
  isAvailable: boolean;
  rating: number;
};

type Hospital = {
  id: number;
  nameEn: string;
  nameAr: string;
  city: string;
  level: string;
  pathwayOrder: number | null;
};

type Transfer = {
  id: number;
  caseId: number | null;
  direction: string;
  status: string;
  riskLevel: string;
  patientName: string;
  chiefComplaint: string;
  transportMethod: string;
  clinicalSummary: string;
  specialRequirements?: string | null;
  estimatedArrival?: string | null;
  transferCode: string;
  fromHospitalId: number;
  toHospitalId: number;
  fromHospital?: Hospital;
  toHospital?: Hospital;
  createdAt: string;
};

const TRANSPORT_ICONS: Record<string, React.ReactNode> = {
  AMBULANCE:          <Truck className="w-3.5 h-3.5" />,
  AIR_AMBULANCE:      <Plane className="w-3.5 h-3.5" />,
  PRIVATE_VEHICLE:    <Navigation className="w-3.5 h-3.5" />,
  HOSPITAL_TRANSPORT: <Truck className="w-3.5 h-3.5" />,
};

const TRANSFER_STATUS_CONFIG: Record<string, { label: string; labelAr: string; color: string; bg: string }> = {
  PENDING:    { label: "Pending",    labelAr: "معلّق",       color: "text-yellow-700",  bg: "bg-yellow-50 border-yellow-200" },
  ACCEPTED:   { label: "Accepted",   labelAr: "مقبول",       color: "text-blue-700",    bg: "bg-blue-50 border-blue-200" },
  IN_TRANSIT: { label: "In Transit", labelAr: "في الطريق",   color: "text-orange-700",  bg: "bg-orange-50 border-orange-200" },
  ARRIVED:    { label: "Arrived",    labelAr: "وصل",          color: "text-green-700",   bg: "bg-green-50 border-green-200" },
  CANCELLED:  { label: "Cancelled",  labelAr: "ملغى",        color: "text-red-700",     bg: "bg-red-50 border-red-200" },
  REJECTED:   { label: "Rejected",   labelAr: "مرفوض",       color: "text-red-700",     bg: "bg-red-50 border-red-200" },
};

const LEVEL_ORDER: Record<string, number> = {
  PRIMARY: 1, SECONDARY: 2, SPECIALIZED: 3, TERTIARY: 4,
};

export default function CaseDetail() {
  const [, params] = useRoute("/cases/:id");
  const [, setLocation] = useLocation();
  const id = params?.id ? parseInt(params.id) : 0;
  const queryClient = useQueryClient();

  const { data: caseData, isLoading, error } = useGetCase(id);
  const { data: allDoctors = [] }   = useListDoctors();
  const { data: allTransfers = [] } = useListTransfers();
  const { data: allHospitals = [] } = useListHospitals();

  const { mutate: deleteCase, isPending: isDeleting } = useDeleteCase();
  const { mutate: acknowledge, isPending: isAcknowledging } = useAcknowledgeCase();
  const { mutate: assignDoctor, isPending: isAssigning } = useAssignDoctor({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCaseQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getListCasesQueryKey() });
        setShowAssignPanel(false);
      },
    },
  });
  const { mutate: updateDiagnosis, isPending: isSavingDiagnosis } = useUpdateDiagnosis({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCaseQueryKey(id) });
        setDiagnosisEditing(false);
      },
    },
  });

  const invalidateTransfers = () => {
    queryClient.invalidateQueries({ queryKey: getListTransfersQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetCaseQueryKey(id) });
    queryClient.invalidateQueries({ queryKey: getListCasesQueryKey() });
  };

  const { mutate: markInTransit, isPending: isMarkingTransit }   = useMarkTransferInTransit({ mutation: { onSuccess: invalidateTransfers } });
  const { mutate: markArrived, isPending: isMarkingArrived }     = useMarkTransferArrived({ mutation: { onSuccess: invalidateTransfers } });
  const { mutate: cancelTransfer, isPending: isCancellingTransfer } = useCancelTransfer({ mutation: { onSuccess: invalidateTransfers } });
  const { mutate: acceptTransfer, isPending: isAcceptingTransfer }  = useAcceptTransfer({ mutation: { onSuccess: invalidateTransfers } });
  const { mutate: createTransfer, isPending: isCreatingTransfer }   = useCreateTransfer({
    mutation: {
      onSuccess: () => {
        invalidateTransfers();
        setShowNewTransfer(false);
        resetTransferForm();
      },
    },
  });

  const [showAssignPanel, setShowAssignPanel]   = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [diagnosisEditing, setDiagnosisEditing] = useState(false);
  const [diagnosisText, setDiagnosisText]       = useState("");
  const [diagnosisStatus, setDiagnosisStatus]   = useState<"DIAGNOSIS_IN_PROGRESS" | "COMPLETED">("DIAGNOSIS_IN_PROGRESS");
  const [showNewTransfer, setShowNewTransfer]   = useState(false);

  const [transferForm, setTransferForm] = useState({
    direction: "OUTGOING" as "OUTGOING" | "INCOMING",
    toHospitalId: "",
    fromHospitalId: "",
    transportMethod: "AMBULANCE" as "AMBULANCE" | "AIR_AMBULANCE" | "PRIVATE_VEHICLE" | "HOSPITAL_TRANSPORT",
    clinicalSummary: "",
    specialRequirements: "",
  });

  const resetTransferForm = () => setTransferForm({
    direction: "OUTGOING",
    toHospitalId: "",
    fromHospitalId: "",
    transportMethod: "AMBULANCE",
    clinicalSummary: "",
    specialRequirements: "",
  });

  if (isLoading) return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (error || !caseData) return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
      <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
      <h2 className="text-2xl font-display font-bold text-foreground">Case Not Found</h2>
      <Link href="/" className="mt-4 text-primary hover:underline font-medium flex items-center">
        <ArrowLeft className="w-4 h-4 mr-2" /> Return to Dashboard
      </Link>
    </div>
  );

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW':      return 'success';
      case 'MEDIUM':   return 'warning';
      case 'HIGH':     return 'destructive';
      case 'CRITICAL': return 'critical';
      default:         return 'default';
    }
  };

  const isCriticalAlert  = caseData.riskLevel === 'CRITICAL' && !caseData.acknowledged;
  const needsConsultation = caseData.recommendedAction === 'SCHEDULE_CONSULTATION' || caseData.recommendedAction === 'HOSPITAL_VISIT';
  const currentStatusIdx  = STATUS_ORDER.indexOf(caseData.caseStatus ?? "CASE_CREATED");
  const availableDoctors  = (allDoctors as Doctor[]).filter(d => d.isAvailable);
  const assignedDoctor    = (caseData as any).assignedDoctor as Doctor | null;

  const caseTransfers = (allTransfers as Transfer[]).filter(t => t.caseId === id);
  const activeTransfer = caseTransfers.find(t => !["CANCELLED", "REJECTED", "ARRIVED"].includes(t.status));

  const pathwayHospitals = (allHospitals as Hospital[])
    .filter(h => h.pathwayOrder !== null)
    .sort((a, b) => (a.pathwayOrder ?? 0) - (b.pathwayOrder ?? 0));

  function submitNewTransfer() {
    if (!caseData) return;
    const toId   = parseInt(transferForm.toHospitalId);
    const fromId = parseInt(transferForm.fromHospitalId);
    if (!transferForm.toHospitalId || !transferForm.fromHospitalId) return;
    createTransfer({
      data: {
        caseId:              id,
        direction:           transferForm.direction,
        toHospitalId:        toId,
        fromHospitalId:      fromId,
        patientName:         caseData.patientName,
        patientAge:          caseData.age,
        patientGender:       caseData.gender,
        chiefComplaint:      caseData.chiefComplaint,
        riskLevel:           caseData.riskLevel,
        transportMethod:     transferForm.transportMethod,
        clinicalSummary:     transferForm.clinicalSummary || caseData.briefArabic,
        specialRequirements: transferForm.specialRequirements || undefined,
      },
    });
  }

  return (
    <div className="flex-1 overflow-auto bg-background/50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Navigation & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <Link href="/" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-2 -ml-3 rounded-lg hover:bg-muted w-fit">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Triage
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            {needsConsultation && (
              <Link
                href={`/consultations?caseId=${caseData.id}`}
                className="flex items-center px-4 py-2 bg-secondary hover:bg-secondary/90 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-secondary/20"
              >
                <Video className="w-4 h-4 mr-2" />
                <span className="flex flex-col items-start leading-none">
                  <span>Book Online Consult</span>
                  <span className="text-[9px] font-arabic opacity-80" dir="rtl">احجز استشارة أونلاين</span>
                </span>
              </Link>
            )}
            {isCriticalAlert && (
              <button
                onClick={() => acknowledge({ id })}
                disabled={isAcknowledging}
                className="flex items-center px-4 py-2 bg-destructive hover:bg-destructive/90 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-destructive/20 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" /> Acknowledge Alert
              </button>
            )}
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this case record?')) {
                  deleteCase({ id }, { onSuccess: () => setLocation('/') });
                }
              }}
              disabled={isDeleting}
              className="flex items-center justify-center w-10 h-10 bg-card border border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 rounded-xl transition-colors text-muted-foreground"
              title="Delete Case"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Case Lifecycle Status Bar */}
        <div className="bg-card border border-border rounded-2xl p-5 mb-6 shadow-sm overflow-x-auto">
          <div className="flex items-center gap-1 min-w-max">
            {CASE_STATUS_STEPS.map((step, idx) => {
              const isCompleted = idx < currentStatusIdx;
              const isCurrent   = idx === currentStatusIdx;
              return (
                <div key={step.key} className="flex items-center">
                  <div className={cn(
                    "flex flex-col items-center px-3 py-2 rounded-xl transition-all",
                    isCurrent ? "bg-primary/10 border border-primary/30" : isCompleted ? "opacity-70" : "opacity-30"
                  )}>
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black mb-1",
                      isCurrent ? "bg-primary text-white" : isCompleted ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                    )}>
                      {isCompleted ? "✓" : idx + 1}
                    </div>
                    <span className={cn("text-[9px] font-bold uppercase tracking-wide whitespace-nowrap", isCurrent ? "text-primary" : "text-muted-foreground")}>
                      {step.label}
                    </span>
                    <span className="text-[8px] text-muted-foreground font-arabic" dir="rtl">{step.labelAr}</span>
                  </div>
                  {idx < CASE_STATUS_STEPS.length - 1 && (
                    <div className={cn("w-6 h-0.5 mx-0.5", idx < currentStatusIdx ? "bg-green-500" : "bg-border")} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Header Card */}
            <div className={cn(
              "bg-card rounded-2xl border p-6 md:p-8 relative overflow-hidden",
              isCriticalAlert ? "border-destructive shadow-[0_0_30px_rgba(225,29,72,0.15)] ring-1 ring-destructive/20" : "border-border shadow-sm"
            )}>
              {isCriticalAlert && (
                <div className="absolute top-0 left-0 w-full h-1.5 bg-destructive animate-pulse-fast" />
              )}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <User className="w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-display font-bold text-foreground leading-tight">{caseData.patientName}</h1>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-muted-foreground font-medium">
                      <span>{caseData.age} years</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-border" />
                      <span>{caseData.gender}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-border" />
                      <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {format(new Date(caseData.createdAt), 'MMM d, yyyy - HH:mm')}</span>
                    </div>
                  </div>
                </div>
                <div className="text-left sm:text-right space-y-2">
                  <Badge variant={getRiskColor(caseData.riskLevel) as any} className="text-sm px-3 py-1 uppercase">
                    {caseData.riskLevel} RISK
                  </Badge>
                  <p className="text-xs font-bold text-foreground bg-muted px-3 py-1.5 rounded-lg inline-block border border-border">
                    ACTION: {caseData.recommendedAction.replace('_', ' ')}
                  </p>
                  {caseData.recommendedDepartment && (
                    <p className="flex items-center gap-1.5 text-xs text-primary font-semibold bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
                      <Building2 className="w-3.5 h-3.5" /> {caseData.recommendedDepartment}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center">
                    <Stethoscope className="w-4 h-4 mr-1.5" /> Chief Complaint
                  </h3>
                  <p className="text-foreground font-medium">{caseData.chiefComplaint}</p>
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center">
                    <Activity className="w-4 h-4 mr-1.5" /> Reported Symptoms
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {caseData.symptoms.map((s, i) => (
                      <span key={i} className="px-2.5 py-1 bg-secondary/10 text-secondary-foreground border border-secondary/20 rounded-md text-sm font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ======================================================= */}
            {/* TRANSFER PATHWAY — مسار النقل بين المستشفيات              */}
            {/* ======================================================= */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Navigation className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">مسار النقل بين المستشفيات</p>
                    <p className="text-xs text-muted-foreground">Hospital Transfer Pathway</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowNewTransfer(!showNewTransfer); }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl text-xs font-bold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  طلب تحويل جديد
                </button>
              </div>

              {/* Pathway Visualization */}
              {pathwayHospitals.length > 0 && (
                <div className="px-5 py-4 border-b border-border/50 bg-gradient-to-r from-muted/30 to-transparent overflow-x-auto">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">مسار الإحالة الموصى به</p>
                  <div className="flex items-center gap-0 min-w-max">
                    {pathwayHospitals.map((h, idx) => {
                      const arrivedHere = caseTransfers.some(
                        t => t.toHospitalId === h.id && t.status === "ARRIVED"
                      );
                      const inTransitHere = caseTransfers.some(
                        t => t.toHospitalId === h.id && t.status === "IN_TRANSIT"
                      );
                      const pendingHere = caseTransfers.some(
                        t => t.toHospitalId === h.id && ["PENDING", "ACCEPTED"].includes(t.status)
                      );

                      const dotColor = arrivedHere
                        ? "bg-green-500 ring-2 ring-green-300"
                        : inTransitHere
                        ? "bg-orange-500 ring-2 ring-orange-300 animate-pulse"
                        : pendingHere
                        ? "bg-blue-500 ring-2 ring-blue-300"
                        : "bg-muted-foreground/30";

                      const levelColors: Record<string, string> = {
                        PRIMARY:     "text-green-700",
                        SECONDARY:   "text-blue-700",
                        SPECIALIZED: "text-orange-700",
                        TERTIARY:    "text-red-700",
                      };

                      return (
                        <div key={h.id} className="flex items-center">
                          <div className="flex flex-col items-center gap-1">
                            <div className={cn("w-4 h-4 rounded-full flex-shrink-0 transition-all", dotColor)} />
                            <div className="text-center max-w-[80px]">
                              <p className="text-[9px] font-bold text-foreground leading-tight font-arabic" dir="rtl">{h.nameAr}</p>
                              <p className={cn("text-[8px] font-semibold", levelColors[h.level] ?? "text-muted-foreground")}>{h.level}</p>
                              <p className="text-[8px] text-muted-foreground">{h.city}</p>
                            </div>
                          </div>
                          {idx < pathwayHospitals.length - 1 && (
                            <div className="flex items-center mx-1 mb-5">
                              <div className="w-8 h-0.5 bg-border" />
                              <ChevronRight className="w-3 h-3 text-muted-foreground -ml-1" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-[9px] text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> وصل</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block" /> في الطريق</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> مجدول</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-muted-foreground/30 inline-block" /> لم يُزَر</span>
                  </div>
                </div>
              )}

              {/* Active Transfers for this case */}
              <div className="divide-y divide-border/50">
                {caseTransfers.length === 0 ? (
                  <div className="p-6 text-center">
                    <ArrowLeftRight className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">لا توجد تحويلات مسجّلة لهذه الحالة</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">No transfers recorded for this case</p>
                    <button
                      onClick={() => setShowNewTransfer(true)}
                      className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
                    >
                      إنشاء تحويل الآن
                    </button>
                  </div>
                ) : (
                  caseTransfers.map((transfer) => {
                    const statusCfg = TRANSFER_STATUS_CONFIG[transfer.status] ?? TRANSFER_STATUS_CONFIG.PENDING;
                    const isActive  = !["CANCELLED", "REJECTED", "ARRIVED"].includes(transfer.status);

                    return (
                      <div key={transfer.id} className={cn("p-5", isActive ? "" : "opacity-60")}>
                        {/* Transfer Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                          <div className="flex items-start gap-3">
                            <div className={cn("px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5", statusCfg.bg, statusCfg.color)}>
                              <Circle className="w-2 h-2 fill-current" />
                              <span>{statusCfg.labelAr}</span>
                              <span className="opacity-60">·</span>
                              <span className="text-[10px]">{statusCfg.label}</span>
                            </div>
                            <div className={cn(
                              "px-2 py-1 rounded-lg border text-[10px] font-bold uppercase",
                              transfer.direction === "OUTGOING"
                                ? "bg-orange-50 border-orange-200 text-orange-700"
                                : "bg-blue-50 border-blue-200 text-blue-700"
                            )}>
                              {transfer.direction === "OUTGOING" ? "↗ صادر" : "↙ وارد"}
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-1 rounded-lg">{transfer.transferCode}</span>
                        </div>

                        {/* Hospital Route */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex-1 bg-muted/40 rounded-xl p-3 border border-border/50">
                            <p className="text-[9px] text-muted-foreground font-bold uppercase mb-0.5">من / From</p>
                            <p className="text-sm font-semibold text-foreground" dir="rtl">{transfer.fromHospital?.nameAr ?? `Hospital #${transfer.fromHospitalId}`}</p>
                            <p className="text-xs text-muted-foreground">{transfer.fromHospital?.city}</p>
                          </div>

                          <div className="flex flex-col items-center gap-1 flex-shrink-0">
                            <div className="flex items-center gap-1 text-primary">
                              {TRANSPORT_ICONS[transfer.transportMethod] ?? <Truck className="w-3.5 h-3.5" />}
                            </div>
                            <div className="w-8 h-0.5 bg-border" />
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>

                          <div className="flex-1 bg-primary/5 rounded-xl p-3 border border-primary/15">
                            <p className="text-[9px] text-primary font-bold uppercase mb-0.5">إلى / To</p>
                            <p className="text-sm font-semibold text-foreground" dir="rtl">{transfer.toHospital?.nameAr ?? `Hospital #${transfer.toHospitalId}`}</p>
                            <p className="text-xs text-muted-foreground">{transfer.toHospital?.city}</p>
                          </div>
                        </div>

                        {/* Transport & Timing */}
                        <div className="flex flex-wrap gap-2 mb-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1 bg-muted px-2.5 py-1 rounded-lg border border-border/50">
                            {TRANSPORT_ICONS[transfer.transportMethod]}
                            {transfer.transportMethod.replace('_', ' ')}
                          </span>
                          {transfer.estimatedArrival && (
                            <span className="flex items-center gap-1 bg-muted px-2.5 py-1 rounded-lg border border-border/50">
                              <Clock className="w-3 h-3" />
                              ETA: {format(new Date(transfer.estimatedArrival), 'MMM d - HH:mm')}
                            </span>
                          )}
                          <span className="flex items-center gap-1 bg-muted px-2.5 py-1 rounded-lg border border-border/50">
                            <Clock className="w-3 h-3" />
                            {format(new Date(transfer.createdAt), 'MMM d - HH:mm')}
                          </span>
                        </div>

                        {/* Clinical Summary */}
                        {transfer.clinicalSummary && (
                          <div className="bg-muted/40 rounded-xl p-3 border border-border/40 mb-3">
                            <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">الملخص السريري / Clinical Summary</p>
                            <p className="text-xs text-foreground/80 leading-relaxed">{transfer.clinicalSummary}</p>
                          </div>
                        )}

                        {/* Special Requirements */}
                        {transfer.specialRequirements && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-3">
                            <p className="text-[10px] font-bold uppercase text-yellow-700 mb-1 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> متطلبات خاصة / Special Requirements
                            </p>
                            <p className="text-xs text-yellow-800 leading-relaxed">{transfer.specialRequirements}</p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        {isActive && (
                          <div className="flex flex-wrap gap-2 pt-3 border-t border-border/50">
                            {transfer.status === "PENDING" && (
                              <button
                                onClick={() => acceptTransfer({ id: transfer.id })}
                                disabled={isAcceptingTransfer}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                              >
                                {isAcceptingTransfer ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                قبول التحويل
                              </button>
                            )}
                            {["PENDING", "ACCEPTED"].includes(transfer.status) && (
                              <button
                                onClick={() => markInTransit({ id: transfer.id })}
                                disabled={isMarkingTransit}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                              >
                                {isMarkingTransit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Truck className="w-3.5 h-3.5" />}
                                تأكيد المغادرة
                              </button>
                            )}
                            {transfer.status === "IN_TRANSIT" && (
                              <button
                                onClick={() => markArrived({ id: transfer.id })}
                                disabled={isMarkingArrived}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                              >
                                {isMarkingArrived ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
                                تأكيد الوصول
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (confirm('هل أنت متأكد من إلغاء هذا التحويل؟')) {
                                  cancelTransfer({ id: transfer.id });
                                }
                              }}
                              disabled={isCancellingTransfer}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 text-muted-foreground text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                            >
                              {isCancellingTransfer ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
                              إلغاء التحويل
                            </button>
                          </div>
                        )}

                        {/* Completed / Cancelled note */}
                        {!isActive && (
                          <div className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium mt-1",
                            transfer.status === "ARRIVED" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"
                          )}>
                            {transfer.status === "ARRIVED" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                            {transfer.status === "ARRIVED" ? "وصل المريض بنجاح — Transfer completed" : `${statusCfg.labelAr} — ${statusCfg.label}`}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* New Transfer Form */}
              {showNewTransfer && (
                <div className="border-t border-border bg-muted/20 p-5 space-y-4">
                  <p className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Send className="w-4 h-4 text-primary" /> إنشاء طلب تحويل جديد
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Direction */}
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">الاتجاه</label>
                      <select
                        value={transferForm.direction}
                        onChange={e => setTransferForm(f => ({ ...f, direction: e.target.value as any }))}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        <option value="OUTGOING">↗ صادر — Outgoing</option>
                        <option value="INCOMING">↙ وارد — Incoming</option>
                      </select>
                    </div>

                    {/* Transport Method */}
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">وسيلة النقل</label>
                      <select
                        value={transferForm.transportMethod}
                        onChange={e => setTransferForm(f => ({ ...f, transportMethod: e.target.value as any }))}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        <option value="AMBULANCE">🚑 سيارة إسعاف</option>
                        <option value="AIR_AMBULANCE">🚁 إسعاف جوي</option>
                        <option value="HOSPITAL_TRANSPORT">🏥 نقل مستشفى</option>
                        <option value="PRIVATE_VEHICLE">🚗 مركبة خاصة</option>
                      </select>
                    </div>

                    {/* From Hospital */}
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">من مستشفى</label>
                      <select
                        value={transferForm.fromHospitalId}
                        onChange={e => setTransferForm(f => ({ ...f, fromHospitalId: e.target.value }))}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        <option value="">— اختر المستشفى —</option>
                        {(allHospitals as Hospital[]).map(h => (
                          <option key={h.id} value={h.id}>{h.nameAr} ({h.city})</option>
                        ))}
                      </select>
                    </div>

                    {/* To Hospital */}
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">إلى مستشفى</label>
                      <select
                        value={transferForm.toHospitalId}
                        onChange={e => setTransferForm(f => ({ ...f, toHospitalId: e.target.value }))}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        <option value="">— اختر المستشفى —</option>
                        {(allHospitals as Hospital[]).map(h => (
                          <option key={h.id} value={h.id}>{h.nameAr} ({h.city})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Clinical Summary */}
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">الملخص السريري (اختياري)</label>
                    <textarea
                      value={transferForm.clinicalSummary}
                      onChange={e => setTransferForm(f => ({ ...f, clinicalSummary: e.target.value }))}
                      rows={3}
                      placeholder="يُملأ تلقائياً من الملخص الطبي إذا تُرك فارغاً..."
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    />
                  </div>

                  {/* Special Requirements */}
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">متطلبات خاصة (اختياري)</label>
                    <input
                      type="text"
                      value={transferForm.specialRequirements}
                      onChange={e => setTransferForm(f => ({ ...f, specialRequirements: e.target.value }))}
                      placeholder="مثال: سرير ICU، تنفس اصطناعي، فريق جراحي..."
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={submitNewTransfer}
                      disabled={!transferForm.toHospitalId || !transferForm.fromHospitalId || isCreatingTransfer}
                      className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-bold shadow-sm transition-colors disabled:opacity-40"
                    >
                      {isCreatingTransfer ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      إرسال طلب التحويل
                    </button>
                    <button
                      onClick={() => { setShowNewTransfer(false); resetTransferForm(); }}
                      className="px-4 py-2.5 bg-card border border-border hover:bg-muted text-muted-foreground rounded-xl text-sm font-medium transition-colors"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* ======================================================= */}

            {/* AI Briefs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-4 flex items-center">
                  <FileText className="w-4 h-4 mr-1.5" /> AI Medical Brief (EN)
                </h3>
                <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap text-sm">{caseData.briefEnglish}</p>
              </div>
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm bg-gradient-to-bl from-card to-muted/30">
                <h3 className="text-sm font-bold uppercase tracking-wider text-secondary mb-4 flex items-center justify-end">
                  الملخص الطبي <FileText className="w-4 h-4 ml-1.5" />
                </h3>
                <p className="text-foreground/90 leading-relaxed font-arabic text-base text-right whitespace-pre-wrap" dir="rtl">{caseData.briefArabic}</p>
              </div>
            </div>

            {/* Doctor Assignment */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <button
                onClick={() => setShowAssignPanel(!showAssignPanel)}
                className="w-full flex items-center justify-between p-5 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-xl", assignedDoctor ? "bg-green-500/10 text-green-600" : "bg-primary/10 text-primary")}>
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">Doctor Assignment</p>
                    <p className="text-xs text-muted-foreground">
                      {assignedDoctor ? `Assigned: ${assignedDoctor.nameAr} — ${assignedDoctor.specialtyLabelAr}` : "No doctor assigned yet"}
                    </p>
                  </div>
                </div>
                {showAssignPanel ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>
              {showAssignPanel && (
                <div className="border-t border-border p-5 space-y-4 bg-muted/20">
                  {assignedDoctor && (
                    <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-400/20 rounded-xl text-sm">
                      <div className="w-8 h-8 rounded-xl bg-green-500/20 flex items-center justify-center text-green-700 font-black text-xs">
                        {assignedDoctor.avatarInitials}
                      </div>
                      <div>
                        <p className="font-semibold text-green-700">{assignedDoctor.nameAr}</p>
                        <p className="text-xs text-green-600">{assignedDoctor.specialtyLabelAr}</p>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto" />
                    </div>
                  )}
                  <div className="flex gap-3">
                    <select
                      value={selectedDoctorId}
                      onChange={e => setSelectedDoctorId(e.target.value)}
                      className="flex-1 bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="">— Select a doctor —</option>
                      {availableDoctors.map((d: Doctor) => (
                        <option key={d.id} value={d.id}>{d.nameAr} — {d.specialtyLabelAr} ⭐ {d.rating}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => { if (selectedDoctorId) assignDoctor({ id, data: { doctorId: parseInt(selectedDoctorId) } }); }}
                      disabled={!selectedDoctorId || isAssigning}
                      className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-bold shadow-sm transition-colors disabled:opacity-40"
                    >
                      {isAssigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                      Assign
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">Only currently available doctors are shown.</p>
                </div>
              )}
            </div>

            {/* Diagnosis Notes */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-secondary/10 text-secondary">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Diagnosis Notes</p>
                    <p className="text-xs text-muted-foreground">ملاحظات التشخيص</p>
                  </div>
                </div>
                {!diagnosisEditing && (
                  <button
                    onClick={() => { setDiagnosisEditing(true); setDiagnosisText(caseData.diagnosisNotes ?? ""); }}
                    className="px-3 py-1.5 bg-card border border-border hover:bg-muted rounded-lg text-xs font-semibold text-muted-foreground transition-colors"
                  >
                    {caseData.diagnosisNotes ? "Edit" : "+ Add Notes"}
                  </button>
                )}
              </div>
              <div className="border-t border-border p-5">
                {diagnosisEditing ? (
                  <div className="space-y-3">
                    <textarea
                      value={diagnosisText}
                      onChange={e => setDiagnosisText(e.target.value)}
                      rows={5}
                      placeholder="Enter diagnosis, findings, treatment plan..."
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    />
                    <div className="flex items-center gap-3">
                      <select
                        value={diagnosisStatus}
                        onChange={e => setDiagnosisStatus(e.target.value as any)}
                        className="bg-background border border-border rounded-xl px-3 py-2 text-xs font-medium text-foreground focus:outline-none"
                      >
                        <option value="DIAGNOSIS_IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Mark Completed</option>
                      </select>
                      <button
                        onClick={() => updateDiagnosis({ id, data: { diagnosisNotes: diagnosisText, status: diagnosisStatus } })}
                        disabled={!diagnosisText || isSavingDiagnosis}
                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-bold transition-colors disabled:opacity-40"
                      >
                        {isSavingDiagnosis ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        Save
                      </button>
                      <button
                        onClick={() => setDiagnosisEditing(false)}
                        className="px-3 py-2 bg-card border border-border hover:bg-muted text-muted-foreground rounded-xl text-sm transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : caseData.diagnosisNotes ? (
                  <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap bg-muted/40 p-4 rounded-xl border border-border/50">
                    {caseData.diagnosisNotes}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-xl border border-dashed border-border text-center">
                    No diagnosis notes recorded yet.
                  </p>
                )}
              </div>
            </div>

            {/* Raw Report */}
            {caseData.rawReport && (
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Raw Report ({caseData.reportType})</h3>
                <pre className="text-xs font-mono text-muted-foreground bg-muted/50 p-4 rounded-xl overflow-x-auto border border-border/50">
                  {caseData.rawReport}
                </pre>
              </div>
            )}

          </div>

          {/* Right Column: Vitals & Risk Factors */}
          <div className="space-y-6">

            {/* Risk Factors */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center">
                <ShieldAlert className="w-4 h-4 mr-1.5" /> Identified Risk Factors
              </h3>
              {caseData.riskFactors && caseData.riskFactors.length > 0 ? (
                <ul className="space-y-3">
                  {caseData.riskFactors.map((factor, i) => (
                    <li key={i} className="flex items-start text-sm font-medium text-foreground bg-destructive/5 border border-destructive/10 p-3 rounded-xl">
                      <AlertTriangle className="w-4 h-4 text-destructive mr-2 mt-0.5 flex-shrink-0" />
                      {factor}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground bg-muted p-4 rounded-xl border border-border/50 text-center">No specific elevated risk factors identified.</p>
              )}
            </div>

            {/* Vital Signs Grid */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center">
                <HeartPulse className="w-4 h-4 mr-1.5" /> Vital Signs
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <VitalBox label="Temp"      value={caseData.vitalSigns?.temperature}    unit="°C" />
                <VitalBox label="Heart Rate" value={caseData.vitalSigns?.heartRate}      unit="bpm" />
                <VitalBox label="SpO2"       value={caseData.vitalSigns?.oxygenSaturation} unit="%" />
                <VitalBox label="Resp. Rate" value={caseData.vitalSigns?.respiratoryRate} unit="/min" />
              </div>
              <div className="mt-3 bg-muted p-3 rounded-xl border border-border/50 text-center">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Blood Pressure</p>
                <p className="font-display font-bold text-xl text-foreground">
                  {caseData.vitalSigns?.bloodPressureSystolic || '--'}
                  <span className="text-muted-foreground mx-1">/</span>
                  {caseData.vitalSigns?.bloodPressureDiastolic || '--'}
                  <span className="text-sm font-normal text-muted-foreground ml-1">mmHg</span>
                </p>
              </div>
            </div>

            {/* History & Meds */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Medical History</h3>
                <p className="text-sm text-foreground/90 bg-muted/50 p-3 rounded-xl border border-border/50 min-h-[3rem]">{caseData.medicalHistory || "None reported"}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Current Medications</h3>
                <p className="text-sm text-foreground/90 bg-muted/50 p-3 rounded-xl border border-border/50 min-h-[3rem]">{caseData.currentMedications || "None reported"}</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function VitalBox({ label, value, unit }: { label: string; value?: number; unit: string }) {
  return (
    <div className="bg-muted p-3 rounded-xl border border-border/50 text-center flex flex-col justify-center h-20">
      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">{label}</p>
      <p className="font-display font-bold text-xl text-foreground">
        {value !== undefined && value !== null ? value : '--'}
        {value !== undefined && value !== null && <span className="text-xs font-normal text-muted-foreground ml-0.5">{unit}</span>}
      </p>
    </div>
  );
}
