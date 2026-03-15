import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FilePlus2, Activity, Settings, LogOut, Video } from "lucide-react";

const navigation = [
  { name: "Dashboard", nameAr: "لوحة القيادة", href: "/", icon: LayoutDashboard },
  { name: "New Report", nameAr: "تقرير جديد", href: "/new", icon: FilePlus2 },
  { name: "Consultations", nameAr: "استشارات", href: "/consultations", icon: Video },
  { name: "System Status", nameAr: "حالة النظام", href: "#", icon: Activity },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="flex h-screen w-72 flex-col border-r border-border bg-sidebar px-4 py-6 text-sidebar-foreground shadow-xl shadow-black/5 z-10 hidden md:flex">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/20">
          <img 
            src={`${import.meta.env.BASE_URL}images/logo.png`} 
            alt="Hospital Intel Logo" 
            className="h-7 w-7 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }}
          />
          <Activity className="h-6 w-6 text-white hidden" />
        </div>
        <div>
          <h1 className="text-lg font-display font-bold leading-tight text-foreground">Hospital Intel</h1>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Triage System</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary shadow-sm shadow-primary/5"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <div className="flex flex-col">
                <span>{item.name}</span>
                <span className="text-[10px] opacity-70 font-arabic font-bold" dir="rtl">{item.nameAr}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-2 border-t pt-4">
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <Settings className="h-5 w-5" />
          Settings
        </button>
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
