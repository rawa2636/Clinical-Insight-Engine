import { useState } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ambulance, ArrowLeftRight, Plus, Clock, CheckCircle2,
  XCircle, AlertTriangle, Building2, Send, Download,
  Loader2, ChevronDown, ChevronUp, RefreshCcw, Plane
} from "lucide-react";
import {
  useListTransfers,
  useListHospitals,
  useListCases,
  useCreateTransfer,
  useAcceptTransfer,
  useRejectTransfer,
  useMarkTransferInTransit,
  useMarkTransferArrived,
  useCancelTransfer,
  getListTransfersQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const TRANSPORT_ICONS = {
  AMBULANCE: Ambulance,
  AIR_AMBULANCE: Plane,
  PRIVATE_VEHICLE: ArrowLeftRight,
  HOSPITAL_TRANSPORT: Building2,
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-700 border-yellow-400/30",
  ACCEPTED: "bg-blue-500/10 text-blue-700 border-blue-400/30",
  IN_TRANSIT: "bg-purple-500/10 text-purple-700 border-purple-400/30",
  ARRIVED: "bg-green-500/10 text-green-700 border-green-400/30",
  REJECTED: "bg-red-500/10 text-red-600 border-red-400/30",
  CANCELLED: "bg-gray-500/10 text-gray-600 border-gray-400/30",
};

const RISK_STYLES: Record<string, string> = {
  LOW: "bg-green-500/10 text-green-700 border-green-400/30",
  MEDIUM: "bg-yellow-500/10 text-yellow-700 border-yellow-400/30",
  HIGH: "bg-orange-500/10 text-orange-700 border-orange-400/30",
  CRITICAL: "bg-red-500/10 text-red-600 border-red-400/30",
};

type Transfer = {
  id: number;
  direction: string;
  status: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  chiefComplaint: string;
  riskLevel: string;
  transportMethod: string;
  clinicalSummary: string;
  specialRequirements?: string;
  estimatedArrival?: string;
  transferCode: string;
  caseId?: number;
  fromHospital?: { nameEn: string; city: string };
  toHospital?: { nameEn: string; city: string };
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
};

export default function TransfersPage() {
  const [activeTab, setActiveTab] = useState<"outgoing" | "incoming">("outgoing");
  const [showNewForm, setShowNewForm] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const queryClient = useQueryClient();
  const { data: transfers = [], isLoading, refetch } = useListTransfers();
  const { data: hospitals = [] } = useListHospitals();
  const { data: cases = [] } = useListCases();

  const { mutate: createTransfer, isPending: isCreating } = useCreateTransfer({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTransfersQueryKey() });
        setShowNewForm(false);
        resetForm();
      },
    },
  });
  const { mutate: acceptTransfer } = useAcceptTransfer({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListTransfersQueryKey() }) },
  });
  const { mutate: rejectTransfer } = useRejectTransfer({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListTransfersQueryKey() }) },
  });
  const { mutate: markInTransit } = useMarkTransferInTransit({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListTransfersQueryKey() }) },
  });
  const { mutate: markArrived } = useMarkTransferArrived({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListTransfersQueryKey() }) },
  });
  const { mutate: cancelTransfer } = useCancelTransfer({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListTransfersQueryKey() }) },
  });

  const [form, setForm] = useState({
    direction: "OUTGOING" as "OUTGOING" | "INCOMING",
    caseId: "",
    toHospitalId: "",
    fromHospitalId: "",
    patientName: "",
    patientAge: "",
    patientGender: "MALE",
    chiefComplaint: "",
    riskLevel: "HIGH",
    transportMethod: "AMBULANCE" as "AMBULANCE" | "AIR_AMBULANCE" | "PRIVATE_VEHICLE" | "HOSPITAL_TRANSPORT",
    clinicalSummary: "",
    specialRequirements: "",
    estimatedArrival: "",
  });

  function resetForm() {
    setForm({
      direction: "OUTGOING",
      caseId: "",
      toHospitalId: "",
      fromHospitalId: "",
      patientName: "",
      patientAge: "",
      patientGender: "MALE",
      chiefComplaint: "",
      riskLevel: "HIGH",
      transportMethod: "AMBULANCE",
      clinicalSummary: "",
      specialRequirements: "",
      estimatedArrival: "",
    });
  }

  function autofillFromCase(caseId: string) {
    const found = cases.find((c) => c.id === parseInt(caseId));
    if (!found) return;
    setForm((prev) => ({
      ...prev,
      caseId,
      patientName: found.patientName,
      patientAge: String(found.age),
      patientGender: found.gender,
      chiefComplaint: found.chiefComplaint,
      riskLevel: found.riskLevel,
      clinicalSummary: found.briefEnglish,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createTransfer({
      data: {
        direction: form.direction,
        caseId: form.caseId ? parseInt(form.caseId) : undefined,
        toHospitalId: form.toHospitalId ? parseInt(form.toHospitalId) : undefined,
        fromHospitalId: form.fromHospitalId ? parseInt(form.fromHospitalId) : undefined,
        patientName: form.patientName,
        patientAge: parseInt(form.patientAge),
        patientGender: form.patientGender,
        chiefComplaint: form.chiefComplaint,
        riskLevel: form.riskLevel,
        transportMethod: form.transportMethod,
        clinicalSummary: form.clinicalSummary,
        specialRequirements: form.specialRequirements || undefined,
        estimatedArrival: form.estimatedArrival || undefined,
      },
    });
  }

  const outgoing = (transfers as Transfer[]).filter((t) => t.direction === "OUTGOING");
  const incoming = (transfers as Transfer[]).filter((t) => t.direction === "INCOMING");
  const displayed = activeTab === "outgoing" ? outgoing : incoming;

  return (
    <div className="flex-1 overflow-auto bg-background/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
              <ArrowLeftRight className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Hospital Transfers</h1>
              <p className="text-sm text-muted-foreground mt-0.5">تحويلات المستشفيات</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-3 py-2 bg-card border border-border hover:bg-muted rounded-xl text-sm font-medium text-muted-foreground transition-colors"
            >
              <RefreshCcw className="w-4 h-4" /> Refresh
            </button>
            <button
              onClick={() => setShowNewForm(!showNewForm)}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-bold shadow-sm shadow-primary/20 transition-colors"
            >
              <Plus className="w-4 h-4" /> New Transfer
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total", value: transfers.length, color: "text-foreground bg-card" },
            { label: "Outgoing", value: outgoing.length, color: "text-blue-700 bg-blue-500/10" },
            { label: "Incoming", value: incoming.length, color: "text-purple-700 bg-purple-500/10" },
            { label: "In Transit", value: (transfers as Transfer[]).filter(t => t.status === "IN_TRANSIT").length, color: "text-orange-700 bg-orange-500/10" },
          ].map((s) => (
            <div key={s.label} className={cn("rounded-xl border border-border p-4 shadow-sm", s.color)}>
              <p className="text-xs font-bold uppercase tracking-wider opacity-70">{s.label}</p>
              <p className="text-2xl font-display font-bold mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        {/* New Transfer Form */}
        <AnimatePresence>
          {showNewForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-card border border-primary/20 rounded-2xl p-6 shadow-sm overflow-hidden"
            >
              <h2 className="text-lg font-display font-bold text-foreground mb-5 flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" /> Create Transfer Request
                <span className="text-sm font-normal text-muted-foreground mr-2">— إنشاء طلب تحويل</span>
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Direction</label>
                    <select value={form.direction} onChange={e => setForm(p => ({ ...p, direction: e.target.value as any }))}
                      className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                      <option value="OUTGOING">Outgoing — إلى مستشفى آخر</option>
                      <option value="INCOMING">Incoming — قادم من مستشفى آخر</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Link to Existing Case</label>
                    <select value={form.caseId} onChange={e => { setForm(p => ({ ...p, caseId: e.target.value })); autofillFromCase(e.target.value); }}
                      className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                      <option value="">— Select case (optional) —</option>
                      {cases.map(c => (
                        <option key={c.id} value={c.id}>#{c.id} — {c.patientName} ({c.riskLevel})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      {form.direction === "OUTGOING" ? "To Hospital" : "From Hospital"}
                    </label>
                    <select
                      value={form.direction === "OUTGOING" ? form.toHospitalId : form.fromHospitalId}
                      onChange={e => setForm(p => ({ ...p, [form.direction === "OUTGOING" ? "toHospitalId" : "fromHospitalId"]: e.target.value }))}
                      className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                      <option value="">— Select hospital —</option>
                      {(hospitals as any[]).map(h => (
                        <option key={h.id} value={h.id}>{h.nameEn} — {h.city}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Transport Method</label>
                    <select value={form.transportMethod} onChange={e => setForm(p => ({ ...p, transportMethod: e.target.value as any }))}
                      className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                      <option value="AMBULANCE">🚑 Ambulance</option>
                      <option value="AIR_AMBULANCE">✈️ Air Ambulance</option>
                      <option value="PRIVATE_VEHICLE">🚗 Private Vehicle</option>
                      <option value="HOSPITAL_TRANSPORT">🏥 Hospital Transport</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Patient Name</label>
                    <input required value={form.patientName} onChange={e => setForm(p => ({ ...p, patientName: e.target.value }))}
                      placeholder="Full patient name"
                      className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Age</label>
                    <input required type="number" min="0" max="130" value={form.patientAge} onChange={e => setForm(p => ({ ...p, patientAge: e.target.value }))}
                      placeholder="Age"
                      className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Chief Complaint</label>
                    <input required value={form.chiefComplaint} onChange={e => setForm(p => ({ ...p, chiefComplaint: e.target.value }))}
                      placeholder="Primary medical concern"
                      className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Risk Level</label>
                    <select value={form.riskLevel} onChange={e => setForm(p => ({ ...p, riskLevel: e.target.value }))}
                      className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="CRITICAL">CRITICAL</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Clinical Summary</label>
                  <textarea required value={form.clinicalSummary} onChange={e => setForm(p => ({ ...p, clinicalSummary: e.target.value }))}
                    rows={3} placeholder="Clinical details, current condition, treatment given..."
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Special Requirements</label>
                    <input value={form.specialRequirements} onChange={e => setForm(p => ({ ...p, specialRequirements: e.target.value }))}
                      placeholder="ICU bed, ventilator, interpreter..."
                      className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Estimated Arrival</label>
                    <input type="datetime-local" value={form.estimatedArrival} onChange={e => setForm(p => ({ ...p, estimatedArrival: e.target.value }))}
                      className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={isCreating}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-bold shadow-sm transition-colors disabled:opacity-50">
                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {isCreating ? "Creating..." : "Create Transfer Request"}
                  </button>
                  <button type="button" onClick={() => { setShowNewForm(false); resetForm(); }}
                    className="px-4 py-2.5 bg-card border border-border hover:bg-muted text-muted-foreground rounded-xl text-sm font-medium transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex bg-card border border-border rounded-xl p-1 w-fit gap-1">
          {(["outgoing", "incoming"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={cn(
                "px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all",
                activeTab === tab ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"
              )}>
              {tab === "outgoing" ? "↑ Outgoing" : "↓ Incoming"}
              <span className="ml-2 px-1.5 py-0.5 text-[10px] rounded-full bg-white/20">
                {tab === "outgoing" ? outgoing.length : incoming.length}
              </span>
            </button>
          ))}
        </div>

        {/* Transfer List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border">
            <ArrowLeftRight className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground">No {activeTab} transfers</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {activeTab === "outgoing" ? "Create a transfer to route a patient to another hospital." : "No incoming transfers registered yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayed.map((transfer: Transfer) => {
              const isExpanded = expandedId === transfer.id;
              return (
                <motion.div key={transfer.id} layout
                  className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">

                    {/* Transfer Code & Direction */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className={cn("p-2.5 rounded-xl", activeTab === "outgoing" ? "bg-blue-500/10 text-blue-600" : "bg-purple-500/10 text-purple-600")}>
                        {activeTab === "outgoing" ? <Send className="w-5 h-5" /> : <Download className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-mono text-xs font-bold text-muted-foreground">{transfer.transferCode}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(transfer.createdAt), 'MMM d, HH:mm')}</p>
                      </div>
                    </div>

                    {/* Patient Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">{transfer.patientName}, {transfer.patientAge}</p>
                      <p className="text-sm text-muted-foreground truncate">{transfer.chiefComplaint}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-full border", RISK_STYLES[transfer.riskLevel])}>
                          {transfer.riskLevel}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {transfer.fromHospital?.nameEn || "This Hospital"} → {transfer.toHospital?.nameEn || "This Hospital"}
                        </span>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={cn("text-[11px] font-bold px-2.5 py-1 rounded-full border", STATUS_STYLES[transfer.status])}>
                        {transfer.status.replace("_", " ")}
                      </span>
                      <button onClick={() => setExpandedId(isExpanded ? null : transfer.id)}
                        className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border bg-muted/30 overflow-hidden">
                        <div className="p-5 space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Clinical Summary</p>
                              <p className="text-foreground/80 leading-relaxed">{transfer.clinicalSummary}</p>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Transport</p>
                                <p className="text-foreground font-medium">{transfer.transportMethod.replace("_", " ")}</p>
                              </div>
                              {transfer.specialRequirements && (
                                <div>
                                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Special Requirements</p>
                                  <p className="text-foreground/80">{transfer.specialRequirements}</p>
                                </div>
                              )}
                              {transfer.estimatedArrival && (
                                <div>
                                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Estimated Arrival</p>
                                  <p className="text-foreground font-medium">{format(new Date(transfer.estimatedArrival), 'MMM d, yyyy HH:mm')}</p>
                                </div>
                              )}
                              {transfer.rejectionReason && (
                                <div>
                                  <p className="text-xs font-bold uppercase tracking-wider text-red-600 mb-1">Rejection Reason</p>
                                  <p className="text-red-700">{transfer.rejectionReason}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                            {transfer.status === "PENDING" && activeTab === "incoming" && (
                              <>
                                <button onClick={() => acceptTransfer({ id: transfer.id })}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-700 border border-green-400/30 rounded-lg text-xs font-semibold transition-colors">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Accept & Register
                                </button>
                                <button onClick={() => { const r = prompt("Rejection reason?"); if (r) rejectTransfer({ id: transfer.id, data: { reason: r } }); }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-400/30 rounded-lg text-xs font-semibold transition-colors">
                                  <XCircle className="w-3.5 h-3.5" /> Reject
                                </button>
                              </>
                            )}
                            {transfer.status === "ACCEPTED" && activeTab === "outgoing" && (
                              <button onClick={() => markInTransit({ id: transfer.id })}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 border border-purple-400/30 rounded-lg text-xs font-semibold transition-colors">
                                <Ambulance className="w-3.5 h-3.5" /> Mark In-Transit
                              </button>
                            )}
                            {transfer.status === "IN_TRANSIT" && (
                              <button onClick={() => markArrived({ id: transfer.id })}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-700 border border-green-400/30 rounded-lg text-xs font-semibold transition-colors">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Mark Arrived
                              </button>
                            )}
                            {["PENDING", "ACCEPTED"].includes(transfer.status) && (
                              <button onClick={() => cancelTransfer({ id: transfer.id })}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-500/10 hover:bg-gray-500/20 text-gray-600 border border-gray-400/30 rounded-lg text-xs font-semibold transition-colors">
                                <XCircle className="w-3.5 h-3.5" /> Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
