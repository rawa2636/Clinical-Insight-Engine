import { useRoute, Link, useLocation } from "wouter";
import { useGetCase, useDeleteCase, useAcknowledgeCase } from "@/hooks/use-cases";
import { format } from "date-fns";
import { 
  ArrowLeft, Activity, User, Clock, AlertTriangle, 
  Trash2, ShieldAlert, HeartPulse, Stethoscope, 
  FileText, CheckCircle2 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function CaseDetail() {
  const [, params] = useRoute("/cases/:id");
  const [, setLocation] = useLocation();
  const id = params?.id ? parseInt(params.id) : 0;
  
  const { data: caseData, isLoading, error } = useGetCase(id);
  const { mutate: deleteCase, isPending: isDeleting } = useDeleteCase();
  const { mutate: acknowledge, isPending: isAcknowledging } = useAcknowledgeCase();

  if (isLoading) return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
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
      case 'LOW': return 'success';
      case 'MEDIUM': return 'warning';
      case 'HIGH': return 'destructive';
      case 'CRITICAL': return 'critical';
      default: return 'default';
    }
  };

  const isCriticalAlert = caseData.riskLevel === 'CRITICAL' && !caseData.acknowledged;

  return (
    <div className="flex-1 overflow-auto bg-background/50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-2 -ml-3 rounded-lg hover:bg-muted">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Triage
          </Link>
          
          <div className="flex items-center gap-3">
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Patient & Clinical Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header Card */}
            <div className={cn(
              "bg-card rounded-2xl border p-6 md:p-8 relative overflow-hidden",
              isCriticalAlert ? "border-destructive shadow-[0_0_30px_rgba(225,29,72,0.15)] ring-1 ring-destructive/20" : "border-border shadow-sm"
            )}>
              {isCriticalAlert && (
                <div className="absolute top-0 left-0 w-full h-1.5 bg-destructive animate-pulse-fast"></div>
              )}
              
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <User className="w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-display font-bold text-foreground">{caseData.patientName}</h1>
                    <div className="flex items-center gap-3 mt-1 text-muted-foreground font-medium">
                      <span>{caseData.age} years</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-border"></span>
                      <span>{caseData.gender}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-border"></span>
                      <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {format(new Date(caseData.createdAt), 'MMM d, HH:mm')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <Badge variant={getRiskColor(caseData.riskLevel) as any} className="text-sm px-3 py-1 uppercase">
                    {caseData.riskLevel} RISK
                  </Badge>
                  <p className="mt-2 text-sm font-bold text-foreground bg-muted px-3 py-1 rounded-lg inline-block border border-border">
                    {caseData.recommendedAction.replace('_', ' ')}
                  </p>
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

            {/* AI Briefs - Bilingual */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-4 flex items-center">
                  <FileText className="w-4 h-4 mr-1.5" /> AI Medical Brief (EN)
                </h3>
                <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap text-sm">
                  {caseData.briefEnglish}
                </p>
              </div>
              
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm bg-gradient-to-bl from-card to-muted/30">
                <h3 className="text-sm font-bold uppercase tracking-wider text-secondary mb-4 flex items-center justify-end">
                  الملخص الطبي <FileText className="w-4 h-4 ml-1.5" />
                </h3>
                <p className="text-foreground/90 leading-relaxed font-arabic text-base text-right whitespace-pre-wrap" dir="rtl">
                  {caseData.briefArabic}
                </p>
              </div>
            </div>
            
            {/* Raw Report Data if available */}
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
              {caseData.riskFactors.length > 0 ? (
                <ul className="space-y-3">
                  {caseData.riskFactors.map((factor, i) => (
                    <li key={i} className="flex items-start text-sm font-medium text-foreground bg-destructive/5 border border-destructive/10 p-3 rounded-xl">
                      <AlertTriangle className="w-4 h-4 text-destructive mr-2 mt-0.5 flex-shrink-0" />
                      {factor}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No specific elevated risk factors identified in report.</p>
              )}
            </div>

            {/* Vital Signs Grid */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center">
                <HeartPulse className="w-4 h-4 mr-1.5 text-red-500" /> Vital Signs
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <VitalBox label="Temp" value={caseData.vitalSigns?.temperature} unit="°C" />
                <VitalBox label="Heart Rate" value={caseData.vitalSigns?.heartRate} unit="bpm" />
                <VitalBox label="SpO2" value={caseData.vitalSigns?.oxygenSaturation} unit="%" />
                <VitalBox label="Resp. Rate" value={caseData.vitalSigns?.respiratoryRate} unit="bpm" />
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
                <p className="text-sm text-foreground/90 bg-muted/50 p-3 rounded-xl border border-border/50">{caseData.medicalHistory || "None reported"}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Current Medications</h3>
                <p className="text-sm text-foreground/90 bg-muted/50 p-3 rounded-xl border border-border/50">{caseData.currentMedications || "None reported"}</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

function VitalBox({ label, value, unit }: { label: string, value?: number, unit: string }) {
  return (
    <div className="bg-muted p-3 rounded-xl border border-border/50 text-center flex flex-col justify-center h-20">
      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">{label}</p>
      <p className="font-display font-bold text-xl text-foreground">
        {value !== undefined ? value : '--'}
        {value !== undefined && <span className="text-xs font-normal text-muted-foreground ml-0.5">{unit}</span>}
      </p>
    </div>
  );
}
