import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListDoctors,
  useListCases,
  useAssignDoctor,
  getListCasesQueryKey,
  getGetCaseQueryKey,
} from "@workspace/api-client-react";
import { Stethoscope, Star, Globe, Award, UserCheck, Search, CheckCircle2, Loader2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const SPECIALTY_COLORS: Record<string, string> = {
  CARDIOLOGY: "bg-red-500/10 text-red-700 border-red-400/30",
  EMERGENCY_MEDICINE: "bg-orange-500/10 text-orange-700 border-orange-400/30",
  NEUROLOGY: "bg-purple-500/10 text-purple-700 border-purple-400/30",
  PULMONOLOGY: "bg-blue-500/10 text-blue-700 border-blue-400/30",
  INTERNAL_MEDICINE: "bg-teal-500/10 text-teal-700 border-teal-400/30",
  PEDIATRICS: "bg-pink-500/10 text-pink-700 border-pink-400/30",
  ORTHOPEDICS: "bg-amber-500/10 text-amber-700 border-amber-400/30",
  DERMATOLOGY: "bg-lime-500/10 text-lime-700 border-lime-400/30",
  GENERAL: "bg-gray-500/10 text-gray-700 border-gray-400/30",
  PSYCHIATRY: "bg-violet-500/10 text-violet-700 border-violet-400/30",
};

type Doctor = {
  id: number;
  nameEn: string;
  nameAr: string;
  specialty: string;
  specialtyLabelEn: string;
  specialtyLabelAr: string;
  qualifications: string;
  experience: number;
  rating: number;
  avatarInitials: string;
  isAvailable: boolean;
  consultationFeeUsd: number;
  languages: string[];
};

export default function DoctorsPage() {
  const queryClient = useQueryClient();
  const { data: doctors = [], isLoading } = useListDoctors();
  const { data: cases = [] } = useListCases();
  const { mutate: assignDoctor, isPending: isAssigning } = useAssignDoctor({
    mutation: {
      onSuccess: (data: any) => {
        queryClient.invalidateQueries({ queryKey: getListCasesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetCaseQueryKey(data.id) });
        setAssignSuccess(`Doctor assigned to case #${data.id} successfully.`);
        setSelectedCaseId("");
        setSelectedDoctorId(null);
        setTimeout(() => setAssignSuccess(""), 4000);
      },
    },
  });

  const [search, setSearch] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("");
  const [filterAvailable, setFilterAvailable] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [assignSuccess, setAssignSuccess] = useState("");

  const specialties = [...new Set((doctors as Doctor[]).map(d => d.specialtyLabelEn))];

  const filtered = (doctors as Doctor[]).filter(d => {
    const matchSearch = search === "" || d.nameEn.toLowerCase().includes(search.toLowerCase()) || d.specialtyLabelEn.toLowerCase().includes(search.toLowerCase());
    const matchSpec = filterSpecialty === "" || d.specialtyLabelEn === filterSpecialty;
    const matchAvail = !filterAvailable || d.isAvailable;
    return matchSearch && matchSpec && matchAvail;
  });

  const unassignedCases = cases.filter(c => !c.assignedDoctorId && c.caseStatus !== "COMPLETED");

  function handleAssign() {
    if (!selectedDoctorId || !selectedCaseId) return;
    assignDoctor({ id: parseInt(selectedCaseId), data: { doctorId: selectedDoctorId } });
  }

  return (
    <div className="flex-1 overflow-auto bg-background/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
          <div className="flex items-center gap-3">
            <div className="bg-secondary/10 p-2.5 rounded-xl text-secondary">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Doctor Assignment</h1>
              <p className="text-sm text-muted-foreground mt-0.5">تعيين الأطباء</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Doctors</p>
            <p className="text-2xl font-display font-bold text-foreground mt-1">{doctors.length}</p>
          </div>
          <div className="bg-green-500/10 border border-green-400/20 rounded-xl p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-green-700">Available Now</p>
            <p className="text-2xl font-display font-bold text-green-700 mt-1">{(doctors as Doctor[]).filter(d => d.isAvailable).length}</p>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-400/20 rounded-xl p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-yellow-700">Unassigned Cases</p>
            <p className="text-2xl font-display font-bold text-yellow-700 mt-1">{unassignedCases.length}</p>
          </div>
        </div>

        {/* Quick Assignment Panel */}
        <div className="bg-card border border-primary/20 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-display font-bold text-foreground mb-4 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary" /> Quick Doctor Assignment
            <span className="text-sm font-normal text-muted-foreground">— تعيين طبيب للحالة</span>
          </h2>

          {assignSuccess && (
            <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-green-500/10 text-green-700 border border-green-400/30 rounded-xl text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" /> {assignSuccess}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Select Case</label>
              <select value={selectedCaseId} onChange={e => setSelectedCaseId(e.target.value)}
                className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">— Select unassigned case —</option>
                {unassignedCases.map(c => (
                  <option key={c.id} value={c.id}>#{c.id} — {c.patientName} [{c.riskLevel}]</option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Assign Doctor</label>
              <select value={selectedDoctorId ?? ""} onChange={e => setSelectedDoctorId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">— Select doctor —</option>
                {(doctors as Doctor[]).filter(d => d.isAvailable).map(d => (
                  <option key={d.id} value={d.id}>{d.nameEn} — {d.specialtyLabelEn} ⭐{d.rating}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button onClick={handleAssign} disabled={!selectedDoctorId || !selectedCaseId || isAssigning}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-bold shadow-sm transition-colors disabled:opacity-40">
                {isAssigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                Assign
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or specialty..."
              className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <select value={filterSpecialty} onChange={e => setFilterSpecialty(e.target.value)}
            className="bg-card border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="">All Specialties</option>
            {specialties.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <label className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl cursor-pointer text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
            <input type="checkbox" checked={filterAvailable} onChange={e => setFilterAvailable(e.target.checked)} className="rounded" />
            Available Only
          </label>
        </div>

        {/* Doctor Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border">
            <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No doctors match your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((doctor: Doctor) => (
              <div key={doctor.id}
                onClick={() => setSelectedDoctorId(selectedDoctorId === doctor.id ? null : doctor.id)}
                className={cn(
                  "bg-card border rounded-2xl p-5 shadow-sm cursor-pointer transition-all hover:shadow-md",
                  selectedDoctorId === doctor.id ? "border-primary ring-2 ring-primary/20" : "border-border",
                  !doctor.isAvailable && "opacity-60"
                )}>

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black",
                      doctor.isAvailable ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    )}>
                      {doctor.avatarInitials}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground leading-tight">{doctor.nameEn}</p>
                      <p className="text-xs text-muted-foreground font-arabic mt-0.5" dir="rtl">{doctor.nameAr}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-1 rounded-full border",
                    doctor.isAvailable ? "bg-green-500/10 text-green-700 border-green-400/30" : "bg-gray-500/10 text-gray-600 border-gray-400/30"
                  )}>
                    {doctor.isAvailable ? "Available" : "Unavailable"}
                  </span>
                </div>

                <span className={cn("inline-block text-[11px] font-bold px-2.5 py-1 rounded-full border mb-3", SPECIALTY_COLORS[doctor.specialty] || SPECIALTY_COLORS.GENERAL)}>
                  {doctor.specialtyLabelEn}
                </span>
                <p className="text-xs text-muted-foreground" dir="rtl">{doctor.specialtyLabelAr}</p>

                <div className="mt-3 pt-3 border-t border-border/50 space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" /> {doctor.experience} yrs exp</span>
                    <span className="flex items-center gap-1 text-amber-600 font-semibold"><Star className="w-3.5 h-3.5 fill-amber-500" /> {doctor.rating}</span>
                  </div>
                  <div className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> {doctor.languages.join(", ")}</div>
                  <div className="font-semibold text-foreground">${doctor.consultationFeeUsd} / consultation</div>
                </div>

                <p className="text-[11px] text-muted-foreground mt-2 italic leading-snug">{doctor.qualifications}</p>

                {selectedDoctorId === doctor.id && (
                  <div className="mt-3 pt-3 border-t border-primary/20">
                    <p className="text-xs font-semibold text-primary text-center">✓ Selected — pick a case above to assign</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
