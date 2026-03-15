import { Link } from "wouter";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Clock, AlertTriangle, ArrowRight, User, Stethoscope, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ClinicalCase } from "@workspace/api-client-react";
import { useAcknowledgeCase } from "@/hooks/use-cases";
import { useState } from "react";

export function CaseCard({ data }: { data: ClinicalCase }) {
  const { mutate: acknowledge, isPending: isAcknowledging } = useAcknowledgeCase();
  const [showArabic, setShowArabic] = useState(false);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'success';
      case 'MEDIUM': return 'warning';
      case 'HIGH': return 'destructive';
      case 'CRITICAL': return 'critical';
      default: return 'default';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'EMERGENCY_RESPONSE': return 'text-destructive bg-destructive/10 border-destructive/20';
      case 'HOSPITAL_VISIT': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'SCHEDULE_CONSULTATION': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'SELF_CARE': return 'text-success bg-success/10 border-success/20';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const isCriticalAlert = data.riskLevel === 'CRITICAL' && !data.acknowledged;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group relative flex flex-col rounded-2xl bg-card p-5 shadow-sm border transition-all duration-300",
        isCriticalAlert 
          ? "border-destructive/50 shadow-[0_4px_20px_-4px_rgba(225,29,72,0.3)] ring-1 ring-destructive/20" 
          : "border-border hover:border-primary/30 hover:shadow-lg hover:-translate-y-1"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full",
            isCriticalAlert ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
          )}>
            <User className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg text-foreground line-clamp-1">
              {data.patientName}
            </h3>
            <p className="text-sm font-medium text-muted-foreground">
              {data.age} yrs • {data.gender}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={getRiskColor(data.riskLevel) as any} className="uppercase tracking-wider">
            {data.riskLevel}
          </Badge>
          <span className="flex items-center text-xs text-muted-foreground">
            <Clock className="mr-1 h-3 w-3" />
            {format(new Date(data.createdAt), 'HH:mm')}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 mb-4 space-y-4">
        <div>
          <h4 className="flex items-center text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            <Stethoscope className="mr-1.5 h-3.5 w-3.5" /> Chief Complaint
          </h4>
          <p className="text-sm font-medium text-foreground line-clamp-2">
            {data.chiefComplaint}
          </p>
        </div>

        <div className="rounded-xl bg-muted/50 p-3 border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              AI Summary
            </h4>
            <button 
              onClick={(e) => { e.preventDefault(); setShowArabic(!showArabic); }}
              className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              {showArabic ? "Show English" : "عربي"}
            </button>
          </div>
          
          {showArabic ? (
            <p className="text-sm text-foreground/90 font-arabic leading-relaxed text-right" dir="rtl">
              {data.briefArabic}
            </p>
          ) : (
            <p className="text-sm text-foreground/90 leading-relaxed line-clamp-3">
              {data.briefEnglish}
            </p>
          )}
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="mt-auto pt-4 border-t border-border flex items-center justify-between gap-3">
        <div className={cn(
          "px-3 py-1.5 rounded-lg text-xs font-bold flex items-center border",
          getActionColor(data.recommendedAction)
        )}>
          {data.recommendedAction.replace('_', ' ')}
        </div>

        <div className="flex items-center gap-2">
          {isCriticalAlert && (
            <button
              onClick={(e) => {
                e.preventDefault();
                acknowledge({ id: data.id });
              }}
              disabled={isAcknowledging}
              className="flex items-center px-4 py-2 bg-destructive hover:bg-destructive/90 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 shadow-md shadow-destructive/20"
            >
              {isAcknowledging ? (
                <span className="flex items-center"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> Saving...</span>
              ) : (
                <span className="flex items-center"><CheckCircle2 className="mr-1.5 h-4 w-4" /> Acknowledge</span>
              )}
            </button>
          )}
          
          <Link
            href={`/cases/${data.id}`}
            className="flex items-center justify-center h-9 w-9 rounded-xl bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
          >
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
