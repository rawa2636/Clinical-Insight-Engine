import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { format, addDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Video, Calendar as CalendarIcon, Clock, User, 
  Stethoscope, Globe, Star, FileText, CheckCircle2,
  XCircle, Loader2, PhoneCall, Mic, MicOff, Camera, CameraOff
} from "lucide-react";
import { 
  useListCases, 
  useListDoctors, 
  useListConsultations,
  useCreateConsultation,
  useCancelConsultation,
  useJoinConsultation
} from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const TIME_SLOTS = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

export default function ConsultationsPage() {
  const [activeTab, setActiveTab] = useState<"book" | "my-consultations">("book");

  // Switch to "my-consultations" if requested via state (not standard React Router, simulating logic)
  return (
    <div className="flex-1 overflow-auto bg-background/50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col gap-2 border-b border-border pb-6">
          <div className="flex items-center gap-3">
            <div className="bg-secondary/10 p-2.5 rounded-xl text-secondary">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">Online Consultations</h1>
              <h2 className="text-xl font-arabic font-bold text-muted-foreground" dir="rtl">الاستشارات الطبية عن بُعد</h2>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-muted rounded-xl w-fit border border-border/50 shadow-inner">
          <button
            onClick={() => setActiveTab("book")}
            className={cn(
              "px-6 py-2.5 rounded-lg text-sm font-bold transition-all relative",
              activeTab === "book" ? "text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {activeTab === "book" && (
              <motion.div layoutId="consult-tab" className="absolute inset-0 bg-card rounded-lg border border-border shadow-sm -z-10" />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <span>Book Consultation</span>
              <span className="font-arabic opacity-70">حجز موعد</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab("my-consultations")}
            className={cn(
              "px-6 py-2.5 rounded-lg text-sm font-bold transition-all relative",
              activeTab === "my-consultations" ? "text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {activeTab === "my-consultations" && (
              <motion.div layoutId="consult-tab" className="absolute inset-0 bg-card rounded-lg border border-border shadow-sm -z-10" />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <span>My Consultations</span>
              <span className="font-arabic opacity-70">مواعيدي</span>
            </span>
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === "book" ? (
            <motion.div
              key="book"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <BookConsultationForm onBooked={() => setActiveTab("my-consultations")} />
            </motion.div>
          ) : (
            <motion.div
              key="my-consultations"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <MyConsultationsList />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

function BookConsultationForm({ onBooked }: { onBooked: () => void }) {
  // Parse URL caseId safely
  const getUrlCaseId = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('caseId') ? parseInt(params.get('caseId')!) : null;
    } catch {
      return null;
    }
  };

  const { data: cases, isLoading: isLoadingCases } = useListCases();
  const { data: doctors, isLoading: isLoadingDoctors } = useListDoctors();
  const { mutate: createConsultation, isPending } = useCreateConsultation();

  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(getUrlCaseId());
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  
  // Date setup
  const today = new Date();
  const next7Days = Array.from({ length: 7 }).map((_, i) => addDays(today, i));
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const [notes, setNotes] = useState("");
  const [lang, setLang] = useState<"EN" | "AR">("EN");

  // Filter cases that actually need a consultation
  const eligibleCases = cases?.filter(c => 
    c.recommendedAction === 'SCHEDULE_CONSULTATION' || c.recommendedAction === 'HOSPITAL_VISIT'
  ) || [];

  const handleBook = () => {
    if (!selectedCaseId || !selectedDoctorId || !selectedDate || !selectedTime) return;

    // Create a proper Date object from selected date + time
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const scheduledAt = new Date(selectedDate);
    scheduledAt.setHours(hours, minutes, 0, 0);

    createConsultation({
      data: {
        caseId: selectedCaseId,
        doctorId: selectedDoctorId,
        scheduledAt: scheduledAt.toISOString(),
        patientNotes: notes,
        preferredLanguage: lang
      }
    }, {
      onSuccess: () => {
        onBooked();
      }
    });
  };

  const isFormValid = selectedCaseId && selectedDoctorId && selectedDate && selectedTime;

  if (isLoadingCases || isLoadingDoctors) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div className="xl:col-span-2 space-y-8">
        
        {/* Step 1: Case */}
        <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs">1</span>
            <h3 className="font-display font-bold text-lg">Select Patient Case</h3>
          </div>
          
          {eligibleCases.length === 0 ? (
            <div className="bg-muted border border-border/50 p-6 rounded-xl text-center">
              <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-foreground font-medium">No pending cases require a consultation.</p>
              <Link href="/new" className="text-primary hover:underline text-sm mt-2 inline-block">Create a new report</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {eligibleCases.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCaseId(c.id)}
                  className={cn(
                    "text-left p-4 rounded-xl border transition-all",
                    selectedCaseId === c.id 
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                      : "border-border hover:border-primary/30 hover:bg-muted/50"
                  )}
                >
                  <p className="font-bold text-foreground mb-1">{c.patientName}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{c.chiefComplaint}</p>
                  <Badge variant={c.riskLevel === 'HIGH' ? 'destructive' : 'warning'} className="text-[10px]">
                    {c.riskLevel} RISK
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Step 2: Doctor */}
        <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs">2</span>
            <h3 className="font-display font-bold text-lg">Choose Specialist</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {doctors?.map(doc => (
              <button
                key={doc.id}
                onClick={() => setSelectedDoctorId(doc.id)}
                disabled={!doc.isAvailable}
                className={cn(
                  "text-left p-4 rounded-xl border transition-all flex flex-col h-full",
                  selectedDoctorId === doc.id 
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                    : !doc.isAvailable 
                      ? "border-border/50 opacity-50 cursor-not-allowed bg-muted/50"
                      : "border-border hover:border-primary/30 hover:bg-muted/50"
                )}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center font-display font-bold text-lg flex-shrink-0">
                    {doc.avatarInitials}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">{doc.nameEn}</h4>
                    <p className="text-xs text-muted-foreground font-arabic" dir="rtl">{doc.nameAr}</p>
                    <div className="flex items-center text-xs mt-1 text-primary font-medium">
                      <Stethoscope className="w-3 h-3 mr-1" /> {doc.specialtyLabelEn}
                    </div>
                  </div>
                </div>
                
                <div className="mt-auto pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center"><Star className="w-3.5 h-3.5 mr-1 text-amber-500 fill-amber-500" /> {doc.rating}</span>
                  <span className="flex items-center"><Globe className="w-3.5 h-3.5 mr-1" /> {doc.languages.join(", ")}</span>
                  <span className="font-bold text-foreground">${doc.consultationFeeUsd}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

      </div>

      {/* Right Column: Time & Details */}
      <div className="space-y-6">
        <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs">3</span>
            <h3 className="font-display font-bold text-lg">Date & Time</h3>
          </div>
          
          <div className="mb-4">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Select Day</label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {next7Days.map((d, i) => {
                const isSelected = format(d, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(d)}
                    className={cn(
                      "flex flex-col items-center justify-center min-w-[60px] p-2 rounded-xl border transition-all",
                      isSelected ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20" : "bg-muted/50 border-border hover:border-primary/30"
                    )}
                  >
                    <span className="text-xs opacity-80">{format(d, 'EEE')}</span>
                    <span className="text-lg font-bold">{format(d, 'dd')}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Select Time Slot</label>
            <div className="grid grid-cols-3 gap-2">
              {TIME_SLOTS.map(time => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={cn(
                    "py-2 rounded-lg text-sm font-medium border transition-all",
                    selectedTime === time 
                      ? "bg-secondary text-secondary-foreground border-secondary shadow-md shadow-secondary/20" 
                      : "bg-background border-border hover:border-secondary/50 text-foreground"
                  )}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs">4</span>
            <h3 className="font-display font-bold text-lg">Details</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Language Preference</label>
              <div className="flex gap-3">
                <button 
                  onClick={() => setLang("EN")}
                  className={cn("flex-1 py-2 rounded-lg border text-sm font-medium transition-colors", lang === "EN" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground")}
                >
                  English
                </button>
                <button 
                  onClick={() => setLang("AR")}
                  className={cn("flex-1 py-2 rounded-lg border text-sm font-medium transition-colors font-arabic", lang === "AR" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground")}
                >
                  العربية
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Notes for Doctor (Optional)</label>
              <textarea 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any specific questions..."
                className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none h-24"
              />
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <button
              onClick={handleBook}
              disabled={!isFormValid || isPending}
              className="w-full flex items-center justify-center py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/25 disabled:opacity-50 disabled:shadow-none transition-all"
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Appointment"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}


function MyConsultationsList() {
  const { data: consultations, isLoading, refetch } = useListConsultations();
  const { mutate: cancel } = useCancelConsultation();
  const [joinModalRoomId, setJoinModalRoomId] = useState<string | null>(null);

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!consultations || consultations.length === 0) {
    return (
      <div className="bg-card border border-dashed border-border rounded-2xl p-12 text-center">
        <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-display font-semibold text-foreground">No consultations found</h3>
        <p className="text-muted-foreground mt-1 mb-6">You don't have any upcoming or past appointments.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {consultations.map(c => {
          const isUpcoming = c.status === 'SCHEDULED' || c.status === 'ACTIVE';
          const isDone = c.status === 'COMPLETED' || c.status === 'CANCELLED';

          return (
            <div key={c.id} className={cn(
              "bg-card border rounded-2xl p-5 transition-all flex flex-col",
              c.status === 'ACTIVE' ? "border-success/50 shadow-md shadow-success/10" : "border-border",
              isDone ? "opacity-70" : ""
            )}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-foreground text-lg">{c.patientName}</h4>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <CalendarIcon className="w-3.5 h-3.5 mr-1" /> {format(new Date(c.scheduledAt), 'PPP')}
                    <Clock className="w-3.5 h-3.5 ml-3 mr-1" /> {format(new Date(c.scheduledAt), 'HH:mm')}
                  </p>
                </div>
                <Badge variant={
                  c.status === 'ACTIVE' ? 'success' : 
                  c.status === 'SCHEDULED' ? 'default' : 
                  c.status === 'CANCELLED' ? 'destructive' : 'secondary'
                } className="uppercase text-[10px] tracking-wider">
                  {c.status}
                </Badge>
              </div>

              <div className="bg-muted/50 rounded-xl p-3 mb-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-display font-bold border border-border/50 text-sm">
                  {c.doctor?.avatarInitials || 'DR'}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Dr. {c.doctor?.nameEn}</p>
                  <p className="text-xs text-muted-foreground">{c.doctor?.specialtyLabelEn}</p>
                </div>
              </div>

              <div className="mt-auto flex gap-2">
                {isUpcoming && (
                  <button 
                    onClick={() => setJoinModalRoomId(c.meetingRoomId)}
                    className={cn(
                      "flex-1 flex items-center justify-center py-2.5 rounded-xl text-sm font-bold transition-all",
                      c.status === 'ACTIVE' 
                        ? "bg-success hover:bg-success/90 text-white shadow-md shadow-success/20 animate-pulse-fast" 
                        : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                    )}
                  >
                    <Video className="w-4 h-4 mr-2" /> Join Call
                  </button>
                )}
                {c.status === 'SCHEDULED' && (
                  <button 
                    onClick={() => {
                      if (confirm('Cancel this consultation?')) {
                        cancel({ id: c.id }, { onSuccess: () => refetch() });
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl text-sm font-bold text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Fake Video Call Modal */}
      <AnimatePresence>
        {joinModalRoomId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 w-full max-w-4xl aspect-video rounded-3xl overflow-hidden shadow-2xl relative border border-zinc-800 flex flex-col"
            >
              {/* Header */}
              <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/60 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-success animate-pulse"></div>
                  <span className="text-white font-medium">Room: {joinModalRoomId}</span>
                </div>
                <button 
                  onClick={() => setJoinModalRoomId(null)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white backdrop-blur-md transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Main View */}
              <div className="flex-1 flex flex-col items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center border-4 border-zinc-700 mx-auto mb-6">
                      <User className="w-10 h-10 text-zinc-500" />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-white mb-2">Connecting to Doctor...</h2>
                    <p className="text-zinc-400 font-arabic" dir="rtl">جاري الاتصال بالطبيب المختص...</p>
                  </div>
                </div>
                
                {/* Self View PIP */}
                <div className="absolute bottom-24 right-6 w-48 aspect-video bg-zinc-800 rounded-xl border-2 border-zinc-700 overflow-hidden shadow-xl">
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-8 h-8 text-zinc-600" />
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="absolute bottom-0 left-0 w-full p-6 flex justify-center items-center gap-4 bg-gradient-to-t from-black/80 to-transparent">
                <button className="w-14 h-14 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center transition-colors border border-zinc-700">
                  <Mic className="w-6 h-6" />
                </button>
                <button className="w-14 h-14 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center transition-colors border border-zinc-700">
                  <Camera className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => setJoinModalRoomId(null)}
                  className="w-14 h-14 rounded-full bg-destructive hover:bg-destructive/90 text-white flex items-center justify-center transition-colors shadow-lg shadow-destructive/20"
                >
                  <PhoneCall className="w-6 h-6 rotate-135" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
