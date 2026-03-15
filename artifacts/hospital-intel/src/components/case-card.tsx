import { Link } from "wouter";
import { format } from "date-fns";
import { User, Clock, Stethoscope, Video, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ClinicalCase } from "@workspace/api-client-react";

export function CaseCard({ data }: { data: ClinicalCase }) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'success';
      case 'MEDIUM': return 'warning';
      case 'HIGH': return 'destructive';
      case 'CRITICAL': return 'critical';
      default: return 'default';
    }
  };

  const isCriticalAlert = data.riskLevel === 'CRITICAL' && !data.acknowledged;
  const needsConsultation = data.recommendedAction === 'SCHEDULE_CONSULTATION' || data.recommendedAction === 'HOSPITAL_VISIT';

  return (
    <div className={cn(
      "group flex flex-col bg-card rounded-2xl border transition-all duration-300 relative overflow-hidden",
      isCriticalAlert ? "border-destructive/50 shadow-[0_0_20px_rgba(225,29,72,0.1)] hover:shadow-[0_0_25px_rgba(225,29,72,0.2)]" : "border-border shadow-sm hover:shadow-md hover:border-primary/30"
    )}>
      {isCriticalAlert && (
        <div className="absolute top-0 left-0 w-full h-1 bg-destructive animate-pulse-fast"></div>
      )}
      
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              isCriticalAlert ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
            )}>
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-foreground line-clamp-1">{data.patientName}</h3>
              <div className="flex items-center text-xs text-muted-foreground gap-1.5 mt-0.5">
                <span>{data.age}y</span>
                <span className="w-1 h-1 rounded-full bg-border"></span>
                <span>{data.gender.substring(0, 1)}</span>
                <span className="w-1 h-1 rounded-full bg-border"></span>
                <span className="flex items-center"><Clock className="w-3 h-3 mr-0.5" /> {format(new Date(data.createdAt), 'HH:mm')}</span>
              </div>
            </div>
          </div>
          <Badge variant={getRiskColor(data.riskLevel) as any} className="text-[10px] px-2 py-0.5">
            {data.riskLevel}
          </Badge>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center">
              <Stethoscope className="w-3 h-3 mr-1" /> Complaint
            </p>
            <p className="text-sm text-foreground font-medium line-clamp-2">{data.chiefComplaint}</p>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
            <div className="flex justify-between items-center mb-1.5">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">AI Summary</p>
              <p className="text-xs font-bold font-arabic text-secondary" dir="rtl">عربي</p>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
              {data.briefEnglish.split('\n')[2] || data.briefEnglish}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-border p-3 bg-muted/20 flex items-center justify-between gap-2">
        {needsConsultation && !isCriticalAlert ? (
          <Link 
            href={`/consultations?caseId=${data.id}`}
            className="flex-1 flex items-center justify-center px-3 py-2 bg-secondary/10 hover:bg-secondary/20 text-secondary text-xs font-bold rounded-lg transition-colors border border-secondary/20"
          >
            <Video className="w-3.5 h-3.5 mr-1.5" /> Book Consult
          </Link>
        ) : (
          <p className="flex-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate px-2">
            ACT: {data.recommendedAction.replace('_', ' ')}
          </p>
        )}
        
        <Link 
          href={`/cases/${data.id}`}
          className="flex items-center justify-center px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-lg transition-colors shadow-sm"
        >
          View Details <ChevronRight className="w-3.5 h-3.5 ml-1 -mr-1" />
        </Link>
      </div>
    </div>
  );
}
