import { useListCases } from "@workspace/api-client-react";
import { CaseCard } from "@/components/case-card";
import { AlertTriangle, Activity, Users, Filter, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: cases, isLoading, error } = useListCases();

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="relative flex items-center justify-center w-20 h-20 mb-4">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
          <Activity className="h-8 w-8 text-primary animate-pulse" />
        </div>
        <h2 className="text-xl font-display font-semibold text-foreground">Loading Triage Data</h2>
        <p className="text-muted-foreground mt-1 text-sm">Connecting to Hospital Intelligence Engine...</p>
      </div>
    );
  }

  if (error || !cases) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-display font-bold text-foreground">Failed to load cases</h2>
        <p className="text-muted-foreground mt-2 max-w-md">There was an error connecting to the database. Please try again later.</p>
      </div>
    );
  }

  const stats = {
    total: cases.length,
    critical: cases.filter(c => c.riskLevel === 'CRITICAL').length,
    high: cases.filter(c => c.riskLevel === 'HIGH').length,
    medium: cases.filter(c => c.riskLevel === 'MEDIUM').length,
    low: cases.filter(c => c.riskLevel === 'LOW').length,
  };

  const activeAlerts = cases.filter(c => c.riskLevel === 'CRITICAL' && !c.acknowledged);
  const otherCases = cases.filter(c => !(c.riskLevel === 'CRITICAL' && !c.acknowledged));

  // Sort other cases by severity then date
  const sortedCases = [...otherCases].sort((a, b) => {
    const riskWeight = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
    if (riskWeight[a.riskLevel] !== riskWeight[b.riskLevel]) {
      return riskWeight[b.riskLevel] - riskWeight[a.riskLevel];
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="flex-1 overflow-auto bg-background/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Stats */}
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">Active Triage</h1>
            <p className="text-muted-foreground mt-1">Live monitoring and AI analysis of incoming cases.</p>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto">
            <div className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3 min-w-[140px] shadow-sm">
              <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total</p>
                <p className="text-xl font-bold text-foreground leading-none">{stats.total}</p>
              </div>
            </div>
            
            <div className="bg-destructive/5 border border-destructive/20 rounded-xl px-4 py-3 flex items-center gap-3 min-w-[140px]">
              <div className="bg-destructive/10 p-2 rounded-lg text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-destructive font-medium uppercase tracking-wider">Critical</p>
                <p className="text-xl font-bold text-destructive leading-none">{stats.critical}</p>
              </div>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 flex items-center gap-3 min-w-[140px] hidden sm:flex">
              <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-orange-600 font-medium uppercase tracking-wider">High</p>
                <p className="text-xl font-bold text-orange-700 leading-none">{stats.high}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Alerts Section */}
        {activeAlerts.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
              </span>
              <h2 className="text-xl font-display font-bold text-destructive flex items-center">
                Action Required ({activeAlerts.length})
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {activeAlerts.map(case_ => (
                <CaseCard key={`alert-${case_.id}`} data={case_} />
              ))}
            </div>
          </motion.div>
        )}

        {/* General Queue Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-xl font-display font-bold text-foreground">Patient Queue</h2>
            <button className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <Filter className="h-4 w-4 mr-2" /> Filter
            </button>
          </div>

          {sortedCases.length === 0 ? (
            <div className="bg-card border border-dashed border-border rounded-2xl p-12 text-center">
              <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-display font-semibold text-foreground">Queue is empty</h3>
              <p className="text-muted-foreground mt-1">No pending cases at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedCases.map(case_ => (
                <CaseCard key={`case-${case_.id}`} data={case_} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
