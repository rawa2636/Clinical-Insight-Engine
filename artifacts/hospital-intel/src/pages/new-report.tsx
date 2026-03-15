import { useState } from "react";
import { useLocation } from "wouter";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateCase } from "@/hooks/use-cases";
import { 
  User, Activity, FileText, ClipboardList, 
  ArrowRight, ArrowLeft, CheckCircle2, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CreateCaseRequest } from "@workspace/api-client-react";

// Form Schema matching the OpenAPI spec exactly
const formSchema = z.object({
  patientName: z.string().min(2, "Name must be at least 2 characters"),
  age: z.coerce.number().min(0).max(150),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  chiefComplaint: z.string().min(5, "Please detail the chief complaint"),
  symptoms: z.string().transform(str => str.split(',').map(s => s.trim()).filter(Boolean)),
  medicalHistory: z.string().optional(),
  currentMedications: z.string().optional(),
  vitalSigns: z.object({
    temperature: z.coerce.number().optional(),
    heartRate: z.coerce.number().optional(),
    bloodPressureSystolic: z.coerce.number().optional(),
    bloodPressureDiastolic: z.coerce.number().optional(),
    oxygenSaturation: z.coerce.number().optional(),
    respiratoryRate: z.coerce.number().optional(),
  }).optional(),
  reportType: z.enum(["SOAP", "JSON"]),
  rawReport: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const STEPS = [
  { id: 1, title: "Patient Info", icon: User },
  { id: 2, title: "Clinical Details", icon: StethoscopeIcon },
  { id: 3, title: "Vital Signs", icon: Activity },
  { id: 4, title: "Raw Report", icon: FileText },
];

function StethoscopeIcon(props: any) {
  return <ClipboardList {...props} />;
}

export default function NewReport() {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const { mutate: createCase, isPending } = useCreateCase();
  
  const { register, handleSubmit, control, formState: { errors }, trigger } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reportType: "SOAP",
      gender: "MALE"
    }
  });

  const handleNext = async () => {
    let fieldsToValidate: any[] = [];
    if (step === 1) fieldsToValidate = ['patientName', 'age', 'gender'];
    if (step === 2) fieldsToValidate = ['chiefComplaint', 'symptoms'];
    
    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) setStep(s => Math.min(s + 1, 4));
  };

  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const onSubmit = (data: FormValues) => {
    // Ensure nested objects are clean (remove undefined vitals if empty)
    const payload: CreateCaseRequest = {
      ...data,
      vitalSigns: Object.values(data.vitalSigns || {}).some(v => v !== undefined && !isNaN(v as number)) 
        ? data.vitalSigns 
        : undefined
    };
    
    createCase({ data: payload }, {
      onSuccess: () => {
        setLocation("/");
      }
    });
  };

  return (
    <div className="flex-1 overflow-auto bg-background/50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">New Clinical Report</h1>
          <p className="text-muted-foreground mt-1">Submit case data for AI risk analysis and brief generation.</p>
        </div>

        {/* Stepper */}
        <div className="mb-8 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-border -translate-y-1/2 rounded-full z-0 hidden md:block"></div>
          <div className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 rounded-full z-0 transition-all duration-500 hidden md:block" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
          
          <div className="relative z-10 flex justify-between gap-2 overflow-x-auto pb-4 md:pb-0">
            {STEPS.map((s) => {
              const isActive = step === s.id;
              const isPast = step > s.id;
              return (
                <div key={s.id} className="flex flex-col items-center gap-2 min-w-[80px]">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300",
                    isActive ? "bg-primary border-primary/20 text-white shadow-lg shadow-primary/30" : 
                    isPast ? "bg-primary border-primary text-white" : "bg-card border-border text-muted-foreground"
                  )}>
                    {isPast ? <CheckCircle2 className="w-6 h-6" /> : <s.icon className="w-5 h-5" />}
                  </div>
                  <span className={cn(
                    "text-xs font-semibold uppercase tracking-wider",
                    isActive || isPast ? "text-foreground" : "text-muted-foreground"
                  )}>{s.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 md:p-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                
                {/* STEP 1: Patient Info */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Patient Full Name</label>
                        <input 
                          {...register("patientName")} 
                          className={cn(
                            "w-full px-4 py-3 rounded-xl bg-background border-2 border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all",
                            errors.patientName && "border-destructive focus:border-destructive focus:ring-destructive/10"
                          )}
                          placeholder="e.g. John Doe"
                        />
                        {errors.patientName && <p className="text-xs text-destructive flex items-center mt-1"><AlertCircle className="w-3 h-3 mr-1"/>{errors.patientName.message}</p>}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-foreground">Age</label>
                          <input 
                            type="number"
                            {...register("age")} 
                            className={cn(
                              "w-full px-4 py-3 rounded-xl bg-background border-2 border-border text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all",
                              errors.age && "border-destructive"
                            )}
                            placeholder="Years"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-foreground">Gender</label>
                          <select 
                            {...register("gender")}
                            className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all appearance-none"
                          >
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Clinical Details */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Chief Complaint</label>
                      <textarea 
                        {...register("chiefComplaint")} 
                        rows={3}
                        className={cn(
                          "w-full px-4 py-3 rounded-xl bg-background border-2 border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none",
                          errors.chiefComplaint && "border-destructive"
                        )}
                        placeholder="Primary reason for visit..."
                      />
                      {errors.chiefComplaint && <p className="text-xs text-destructive">{errors.chiefComplaint.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground flex justify-between">
                        Symptoms
                        <span className="text-xs font-normal text-muted-foreground">Comma separated</span>
                      </label>
                      <input 
                        {...register("symptoms")} 
                        className={cn(
                          "w-full px-4 py-3 rounded-xl bg-background border-2 border-border text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all",
                          errors.symptoms && "border-destructive"
                        )}
                        placeholder="Fever, cough, chest pain..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Medical History</label>
                        <textarea 
                          {...register("medicalHistory")} 
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                          placeholder="Past conditions, surgeries..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Current Medications</label>
                        <textarea 
                          {...register("currentMedications")} 
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                          placeholder="List active medications..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Vitals */}
                {step === 3 && (
                  <div className="space-y-6">
                    <p className="text-sm text-muted-foreground mb-4">Enter available vital signs. Leave blank if not measured.</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Temp (°C)</label>
                        <input type="number" step="0.1" {...register("vitalSigns.temperature")} className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Heart Rate (bpm)</label>
                        <input type="number" {...register("vitalSigns.heartRate")} className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">SpO2 (%)</label>
                        <input type="number" {...register("vitalSigns.oxygenSaturation")} className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Resp. Rate (bpm)</label>
                        <input type="number" {...register("vitalSigns.respiratoryRate")} className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">BP Systolic</label>
                        <input type="number" {...register("vitalSigns.bloodPressureSystolic")} className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">BP Diastolic</label>
                        <input type="number" {...register("vitalSigns.bloodPressureDiastolic")} className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: Raw Report */}
                {step === 4 && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-foreground">Report Format</label>
                      <div className="flex gap-4">
                        <label className="flex-1 cursor-pointer">
                          <input type="radio" value="SOAP" {...register("reportType")} className="peer sr-only" />
                          <div className="p-4 rounded-xl border-2 border-border text-center peer-checked:border-primary peer-checked:bg-primary/5 transition-all">
                            <span className="font-bold text-foreground">SOAP Note</span>
                          </div>
                        </label>
                        <label className="flex-1 cursor-pointer">
                          <input type="radio" value="JSON" {...register("reportType")} className="peer sr-only" />
                          <div className="p-4 rounded-xl border-2 border-border text-center peer-checked:border-primary peer-checked:bg-primary/5 transition-all">
                            <span className="font-bold text-foreground">JSON Data</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Raw Notes (Optional)</label>
                      <textarea 
                        {...register("rawReport")} 
                        rows={6}
                        className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none font-mono text-sm"
                        placeholder="Paste full physician notes here..."
                      />
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>

            <div className="mt-8 pt-6 border-t border-border flex justify-between">
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 1}
                className="px-6 py-2.5 rounded-xl font-semibold text-foreground hover:bg-muted disabled:opacity-30 transition-colors flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </button>
              
              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-md shadow-primary/20 flex items-center"
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-8 py-2.5 rounded-xl font-bold bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 disabled:opacity-70 flex items-center"
                >
                  {isPending ? (
                    <span className="flex items-center"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> Analyzing...</span>
                  ) : (
                    <span className="flex items-center"><Activity className="w-5 h-5 mr-2" /> Analyze & Submit</span>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
