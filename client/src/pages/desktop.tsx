import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button as _Button } from "@/components/ui/button";
const Button = _Button as unknown as any;
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch as UISwitch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
// @ts-ignore - image modules may not have type declarations in this project
import aurora from "@/assets/images/wallpaper-aurora.png";
// @ts-ignore - image modules may not have type declarations in this project
import sky from "@/assets/images/wallpaper-sky.png";
// @ts-ignore - image modules may not have type declarations in this project
import graphite from "@/assets/images/wallpaper-graphite.png";

import {
  AppWindow,
  BookOpen,
  Cog,
  FileText,
  Folder,
  Globe,
  Info,
  LayoutGrid,
  Maximize2,
  Minus,
  Moon,
  Sun,
  X,
  Wifi,
  Volume2,
  VolumeX,
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Plus,
  Search,
  ArrowUp,
  Download,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const LS_KEYS = {
  firstRun: "webos.firstRunDismissed.v1",
  notes: "webos.notes.v2",
  theme: "webos.theme.v1",
  accent: "webos.accent.v1",
  wallpaper: "webos.wallpaper.v1",
  customWallpapers: "webos.customWallpapers.v1",
  settings: "webos.settings.v1",
};

type AppId = "notes" | "files" | "browser" | "settings" | "about" | "store";

type App = {
  id: string;
  name: string;
  icon: any;
  description: string;
  isInstalled: boolean;
};

function AppStore({ onInstall }: { onInstall: (app: App) => void }) {
  const [apps, setApps] = useState<App[]>([
    { id: "calculator", name: "Calculator", icon: LayoutGrid, description: "Basic calculator app", isInstalled: false },
    { id: "calendar", name: "Calendar", icon: BookOpen, description: "Advanced calendar and scheduling", isInstalled: false },
    { id: "terminal", name: "Terminal", icon: Cog, description: "System command line interface", isInstalled: false },
    { id: "snake", name: "Snake Game", icon: LayoutGrid, description: "Classic retro snake game", isInstalled: false },
  ]);

  return (
    <div className="p-6 space-y-6 overflow-auto h-full bg-white/5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">App Store</h2>
          <p className="text-sm text-muted-foreground">Discover and install new applications</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {apps.map((app) => (
          <div key={app.id} className="glass p-4 rounded-2xl flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-[var(--desktop-accent)] text-white">
                <app.icon className="h-6 w-6" />
              </div>
              <div>
                <div className="font-semibold">{app.name}</div>
                <div className="text-xs text-muted-foreground">{app.description}</div>
              </div>
            </div>
            <Button
              className="w-full rounded-xl"
              onClick={() => {
                onInstall(app);
                setApps(apps.map(a => a.id === app.id ? { ...a, isInstalled: true } : a));
              }}
              disabled={app.isInstalled}
            >
              {app.isInstalled ? "Installed" : "Install"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

type WindowState = {
  id: string;
  appId: AppId;
  title: string;
  minimized: boolean;
  maximized: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
};

type WallpaperId = "aurora" | "sky" | "graphite" | string;

type SettingsState = {
  darkMode: boolean;
  accent: string;
  wallpaper: WallpaperId;
  transparency: boolean;
  animations: boolean;
};

const WALLPAPERS: Record<string, { name: string; src: string }> = {
  aurora: { name: "Aurora", src: "https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?auto=format&fit=crop&q=100&w=3840" },
  sky: { name: "Sky", src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=100&w=3840" },
  graphite: { name: "Graphite", src: "https://images.unsplash.com/photo-1477346611705-65d1883cee1e?auto=format&fit=crop&q=100&w=3840" },
  mountain: { name: "Mountain", src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=100&w=3840" },
  forest: { name: "Forest", src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=100&w=3840" },
  ocean: { name: "Ocean", src: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&q=100&w=3840" },
  desert: { name: "Desert", src: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&q=100&w=3840" },
  night: { name: "Night", src: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&q=100&w=3840" },
};

const ALLOWED_SITES = [
  { label: "Google", value: "https://www.google.com/search?igu=1" },
  { label: "Wikipedia", value: "https://en.wikipedia.org" },
  { label: "Replit", value: "https://replit.com" },
  { label: "Example", value: "https://example.com" },
];

function SystemTray({
  isMobile,
  clock,
  date,
  wifiConnected,
  setWifiConnected,
}: {
  isMobile: boolean;
  clock: string;
  date: string;
  wifiConnected: boolean;
  setWifiConnected: (v: boolean | ((prev: boolean) => boolean)) => void;
}) {
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [batteryLevel] = useState(85);
  const [isBatterySaving, setIsBatterySaving] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  return (
    <div className="flex items-center gap-1 pr-2">
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 hover:bg-white/10 transition">
            <Wifi className={cn("h-4 w-4", !wifiConnected && "opacity-40")} />
            <div className="flex items-center gap-0.5">
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </div>
            <div className="flex items-center gap-1">
              <Battery className="h-4 w-4" />
              {!isMobile && <span className="text-[11px] font-medium">{batteryLevel}%</span>}
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 glass p-4 mb-2 rounded-2xl" side="top" align="end">
          <div className="space-y-6">
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-bold px-1">Quick Settings</h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setWifiConnected(!wifiConnected)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl transition",
                    wifiConnected ? "bg-[var(--desktop-accent)] text-white" : "bg-white/10 hover:bg-white/15"
                  )}
                >
                  <Wifi className="h-5 w-5" />
                  <span className="text-[10px] font-medium">WiFi</span>
                </button>
                <button
                  onClick={() => setIsBatterySaving(!isBatterySaving)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl transition",
                    isBatterySaving ? "bg-amber-500 text-white" : "bg-white/10 hover:bg-white/15"
                  )}
                >
                  <BatteryMedium className="h-5 w-5" />
                  <span className="text-[10px] font-medium">Battery</span>
                </button>
                <button
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/10 hover:bg-white/15 transition"
                >
                  <Moon className="h-5 w-5" />
                  <span className="text-[10px] font-medium">Night light</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  <span className="text-[11px] font-medium">Volume</span>
                </div>
                <span className="text-[11px] text-muted-foreground">{isMuted ? "Muted" : `${volume}%`}</span>
              </div>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={100}
                step={1}
                onValueChange={(v: number[]) => {
                  setVolume(v[0]);
                  setIsMuted(false);
                }}
                className="px-1"
              />
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-4 px-1">
              <div className="flex items-center gap-2">
                <BatteryFull className="h-4 w-4 text-emerald-400" />
                <span className="text-[11px] font-medium">{batteryLevel}% Charged</span>
              </div>
              <button className="text-[11px] font-medium text-[var(--desktop-accent)]">Settings</button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <div className="h-4 w-px bg-white/15 mx-1" />

      <Popover>
        <PopoverTrigger asChild>
          <button className="flex flex-col items-end px-2 py-1 rounded-lg hover:bg-white/10 transition">
            <span className="text-[12px] font-medium leading-tight">{clock}</span>
            <span className="text-[10px] text-white/60 leading-tight">{date}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] glass p-4 mb-2 rounded-2xl" side="top" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-bold">{currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold opacity-40 uppercase">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth()) }).map((_, i) => (
                <div key={`empty-${i}`} className="h-9 w-full" />
              ))}
              {Array.from({ length: daysInMonth(currentMonth.getFullYear(), currentMonth.getMonth()) }).map((_, i) => {
                const isToday = i + 1 === new Date().getDate() && 
                               currentMonth.getMonth() === new Date().getMonth() &&
                               currentMonth.getFullYear() === new Date().getFullYear();
                return (
                  <button
                    key={i}
                    className={cn(
                      "h-9 w-full rounded-xl text-[12px] transition flex items-center justify-center",
                      isToday ? "bg-[var(--desktop-accent)] text-white shadow-lg" : "hover:bg-white/10"
                    )}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

const ACCENTS = [
  { name: "Blue", value: "206 92% 60%" },
  { name: "Violet", value: "265 92% 64%" },
  { name: "Mint", value: "165 78% 44%" },
  { name: "Amber", value: "36 92% 55%" },
  { name: "Rose", value: "350 88% 62%" },
];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function useLocalStorageState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return initial;
      return JSON.parse(raw) as T;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  }, [key, value]);

  return [value, setValue] as const;
}

function formatClock(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(d: Date) {
  return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

function appMeta(appId: AppId) {
  switch (appId) {
    case "notes":
      return { title: "Notes", icon: FileText };
    case "files":
      return { title: "Files", icon: Folder };
    case "browser":
      return { title: "Browser", icon: Globe };
    case "settings":
      return { title: "Settings", icon: Cog };
    case "store":
      return { title: "App Store", icon: Download };
    case "about":
      return { title: "About", icon: Info };
    case "calculator":
      return { title: "Calculator", icon: LayoutGrid };
    case "calendar":
      return { title: "Calendar", icon: BookOpen };
    case "terminal":
      return { title: "Terminal", icon: Cog };
    case "snake":
      return { title: "Snake Game", icon: LayoutGrid };
    default:
      return { title: appId, icon: AppWindow };
  }
}

function randomId() {
  return Math.random().toString(36).slice(2, 9);
}

function defaultWindowFor(appId: AppId, index: number, isMobile: boolean): Omit<WindowState, "z"> {
  const meta = appMeta(appId);
  const baseW = isMobile ? 0.94 : 0.6;
  const baseH = isMobile ? 0.85 : 0.65;

  return {
    id: `${appId}-${Date.now()}-${randomId()}`,
    appId,
    title: meta?.title || appId,
    minimized: false,
    maximized: isMobile,
    x: isMobile ? 12 : 80 + index * 24,
    y: isMobile ? 12 : 60 + index * 20,
    w: isMobile ? Math.floor(window.innerWidth - 24) : Math.floor(window.innerWidth * baseW),
    h: isMobile ? Math.floor(window.innerHeight - 100) : Math.floor(window.innerHeight * baseH),
  };
}

function isSmallScreen() {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches;
}

function DesktopIcon({
  label,
  Icon,
  onOpen,
  testId,
}: {
  label: string;
  Icon: any;
  onOpen: () => void;
  testId: string;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex w-[92px] flex-col items-center gap-2 rounded-xl px-2 py-3 text-left text-white/90 hover:bg-white/10 active:bg-white/14 transition ease-out-smooth"
      data-testid={testId}
    >
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/12 ring-1 ring-white/15 shadow-[0_10px_30px_rgba(0,0,0,.22)] group-hover:bg-white/16 transition ease-out-smooth">
        <Icon className="h-6 w-6" strokeWidth={1.8} />
      </span>
      <span className="text-center text-[12px] leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,.45)]">
        {label}
      </span>
    </button>
  );
}

function WindowChrome({
  title,
  icon: Icon,
  active,
  maximized,
  onMinimize,
  onMaximize,
  onClose,
  dragHandleProps,
}: {
  title: string;
  icon: any;
  active: boolean;
  maximized: boolean;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
  dragHandleProps?: any;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 rounded-t-[16px] px-3 py-2",
        "bg-black/20 dark:bg-black/30",
        active ? "ring-1 ring-white/20" : "ring-1 ring-white/12",
      )}
      {...dragHandleProps}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className={cn("grid h-8 w-8 place-items-center rounded-xl", active ? "bg-white/14" : "bg-white/10")}>
          <Icon className="h-4.5 w-4.5" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <div className="truncate text-[13px] font-medium text-white/90" data-testid="text-window-title">
            {title}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          className="grid h-9 w-9 place-items-center rounded-xl text-white/85 hover:bg-white/12 active:bg-white/16 transition"
          onClick={onMinimize}
          data-testid="button-window-minimize"
          aria-label="Minimize"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="grid h-9 w-9 place-items-center rounded-xl text-white/85 hover:bg-white/12 active:bg-white/16 transition"
          onClick={onMaximize}
          data-testid="button-window-maximize"
          aria-label={maximized ? "Restore" : "Maximize"}
        >
          <Maximize2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="grid h-9 w-9 place-items-center rounded-xl text-white/85 hover:bg-red-500/40 active:bg-red-500/55 transition"
          onClick={onClose}
          data-testid="button-window-close"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ResizerHandle({ onPointerDown, testId }: { onPointerDown: (e: any) => void; testId: string }) {
  return (
    <div
      onPointerDown={onPointerDown}
      className="absolute bottom-0 right-0 h-5 w-5 cursor-nwse-resize"
      data-testid={testId}
    >
      <div className="absolute bottom-1.5 right-1.5 h-3 w-3 rounded-sm bg-white/18 ring-1 ring-white/25" />
    </div>
  );
}

function FirstRunOverlay({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="absolute inset-0 z-[9999] grid place-items-center p-4">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-md" />
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-xl rounded-2xl glass p-6 text-foreground"
        data-testid="modal-first-run"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--desktop-accent)] text-white shadow-[0_18px_40px_rgba(0,0,0,.25)]">
              <LayoutGrid className="h-5 w-5" />
            </span>
            <div>
              <div className="text-sm font-semibold tracking-tight">Welcome to WebOS Desktop</div>
              <div className="text-xs text-muted-foreground">A desktop-style web simulation</div>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-3 text-sm">
          <p data-testid="text-first-run-disclaimer">
            This is a <span className="font-medium">web simulation</span> inspired by modern desktop interfaces. It is not
            affiliated with Microsoft and does not use Microsoft trademarks or assets.
          </p>
          <div className="rounded-xl border bg-white/50 dark:bg-white/5 p-3">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid h-8 w-8 place-items-center rounded-xl bg-white/70 dark:bg-white/10">
                <BookOpen className="h-4 w-4" />
              </span>
              <div className="space-y-1">
                <div className="text-sm font-medium">Quick tips</div>
                <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1">
                  <li>Single-click desktop icons to open apps.</li>
                  <li>Use the taskbar buttons to switch and minimize windows.</li>
                  <li>On mobile, windows open full-screen for easier use.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end">
          <Button
            variant="secondary"
            className="rounded-xl"
            onClick={() => {
          try {
               localStorage.setItem(LS_KEYS.firstRun, JSON.stringify(true));
                 } catch {
  // ignore
                  }
                 onDismiss();

            }}
            data-testid="button-first-run-continue"
          >
            Enter Desktop
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function StartMenu({
  open,
  onOpenApp,
  onClose,
  clock,
  date,
  isMobile,
}: {
  open: boolean;
  onOpenApp: (id: AppId) => void;
  onClose: () => void;
  clock: string;
  date: string;
  isMobile: boolean;
}) {
  const [search, setSearch] = useState("");

  return (
    <AnimatePresence>
      {open && (
        <div className="absolute inset-0 z-[8000]" onMouseDown={onClose} data-testid="overlay-start-menu">
          <div className="absolute inset-0" />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "absolute left-3 bottom-[72px] w-[440px] rounded-2xl glass p-4 flex flex-col gap-4",
              isMobile && "left-3 right-3 w-auto bottom-[78px]",
            )}
            onMouseDown={(e) => e.stopPropagation()}
            data-testid="panel-start-menu"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for apps, files, and more"
                className="w-full bg-white/10 border-none rounded-xl pl-10 py-2.5 text-sm focus:ring-2 ring-[var(--desktop-accent)] outline-none transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[11px] font-bold uppercase opacity-40 tracking-wider">Pinned Apps</span>
                <button className="text-[10px] font-bold opacity-60 hover:opacity-100 transition">All apps &gt;</button>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {([
                  ["notes", FileText],
                  ["files", Folder],
                  ["browser", Globe],
                  ["settings", Cog],
                  ["store", Download],
                ] as Array<[AppId, any]>).filter(([id]) => appMeta(id).title.toLowerCase().includes(search.toLowerCase())).map(([id, Icon]) => {
                  const meta = appMeta(id);
                  return (
                    <button
                      key={id}
                      className="group flex flex-col items-center gap-1.5 rounded-xl p-3 hover:bg-white/10 transition"
                      onClick={() => {
                        onOpenApp(id);
                        onClose();
                      }}
                    >
                      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--desktop-accent)] text-white shadow-lg group-hover:scale-105 transition-transform">
                        <Icon className="h-5 w-5" strokeWidth={2} />
                      </span>
                      <span className="text-[11px] font-medium text-center truncate w-full">{meta.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-auto border-t border-white/10 pt-4 flex items-center justify-between px-1">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[var(--desktop-accent)] flex items-center justify-center text-[10px] font-bold text-white shadow-inner">JD</div>
                <div className="text-[11px] font-semibold">User Account</div>
              </div>
              <button className="p-2 rounded-xl hover:bg-white/10 transition"><Cog className="h-4 w-4" /></button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

type Note = {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
};

function NotesApp() {
  const [notes, setNotes] = useLocalStorageState<Note[]>(LS_KEYS.notes, [
    { id: "1", title: "Welcome", content: "Welcome to your notes!", updatedAt: Date.now() },
  ]);
  const [activeNoteId, setActiveNoteId] = useState<string>(notes[0]?.id || "");
  const activeNote = notes.find((n) => n.id === activeNoteId);

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n))
    );
  };

  const createNote = () => {
    const newNote: Note = {
      id: randomId(),
      title: "New Note",
      content: "",
      updatedAt: Date.now(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (activeNoteId === id) setActiveNoteId(notes[0]?.id || "");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        createNote();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="h-full flex overflow-hidden">
      <div className="w-64 border-r bg-white/5 flex flex-col">
        <div className="p-3 border-b flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider opacity-60">My Notes</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={createNote}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-2 space-y-1">
          {notes.map((note) => (
            <button
              key={note.id}
              onClick={() => setActiveNoteId(note.id)}
              className={cn(
                "w-full text-left p-3 rounded-xl transition group",
                activeNoteId === note.id ? "bg-[var(--desktop-accent)] text-white" : "hover:bg-white/10"
              )}
            >
              <div className="text-sm font-medium truncate">{note.title || "Untitled"}</div>
              <div className={cn("text-[11px] truncate mt-0.5", activeNoteId === note.id ? "text-white/70" : "text-muted-foreground")}>
                {note.content.substring(0, 40) || "No content"}
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col bg-white/2">
        {activeNote ? (
          <>
            <div className="p-3 border-b flex items-center gap-3">
              <input
                value={activeNote.title}
                onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                className="bg-transparent border-none outline-none font-semibold text-sm flex-1"
                placeholder="Note title..."
              />
              <div className="text-[10px] text-muted-foreground">
                Last saved {new Date(activeNote.updatedAt).toLocaleTimeString()}
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-500/10" onClick={() => deleteNote(activeNote.id)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <textarea
              value={activeNote.content}
              onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
              className="flex-1 p-6 bg-transparent resize-none outline-none font-mono text-sm leading-relaxed"
              placeholder="Start writing..."
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
             <FileText className="h-12 w-12 mb-3 opacity-20" />
             <p className="text-sm">Select a note or create a new one</p>
          </div>
        )}
      </div>
    </div>
  );
}

type FakeNode = {
  name: string;
  type: "folder" | "file";
  size?: string;
  children?: FakeNode[];
};

const FAKE_FS: FakeNode = {
  name: "Root",
  type: "folder",
  children: [
    {
      name: "Documents",
      type: "folder",
      children: [
        { name: "Readme.txt", type: "file", size: "1.2 KB" },
        { name: "Project.docx", type: "file", size: "24 KB" },
      ],
    },
    {
      name: "Pictures",
      type: "folder",
      children: [
        { name: "Wallpaper.png", type: "file", size: "4.5 MB" },
        { name: "Photo.jpg", type: "file", size: "2.1 MB" },
      ],
    },
  ],
};

function FilesApp() {
  const [currentFolder, setCurrentFolder] = useState("Documents");
  const folders = ["Documents", "Downloads", "Pictures", "Music", "Videos"];
  
  return (
    <div className="h-full flex flex-col bg-white/5">
      <div className="p-4 border-b flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentFolder("This PC")}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
        </div>
        <div className="flex-1 bg-white/5 rounded-xl px-3 py-1.5 text-xs border flex items-center gap-2">
          <Folder className="h-3.5 w-3.5 opacity-40" />
          <span>This PC &gt; {currentFolder}</span>
        </div>
      </div>
      <div className="flex-1 p-4 grid grid-cols-4 sm:grid-cols-6 gap-4 content-start">
        {currentFolder === "This PC" ? (
          folders.map(folder => (
            <div key={folder} className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setCurrentFolder(folder)}>
              <div className="p-4 rounded-2xl bg-white/10 group-hover:bg-white/15 transition shadow-sm">
                <Folder className="h-8 w-8 text-blue-400" />
              </div>
              <span className="text-[11px] font-medium text-center">{folder}</span>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center p-12 opacity-40">
            <Folder className="h-12 w-12 mb-2" />
            <span className="text-sm italic">This folder is empty</span>
          </div>
        )}
      </div>
    </div>
  );
}

function SnakeGame() {
  const [score, setScore] = useState(0);
  return (
    <div className="h-full flex flex-col items-center justify-center bg-black text-emerald-500 font-mono p-8 text-center">
      <div className="text-4xl mb-4 tracking-widest">SNAKE</div>
      <div className="mb-4 text-xl">Score: {score}</div>
      <div className="border-2 border-emerald-500/30 w-64 h-64 flex flex-col items-center justify-center rounded-2xl mb-6 bg-emerald-500/5 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
        <div className="text-sm opacity-60 mb-2">Retro Engine 1.0</div>
        <div className="text-[10px] opacity-40 px-6">Use arrow keys or WASD to navigate. Eat pixels to grow and gain points.</div>
      </div>
      <Button 
        variant="outline" 
        className="border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/20 rounded-xl px-8 py-6 text-lg transition-all active:scale-95" 
        onClick={() => setScore(s => s + 10)}
      >
        Start Game
      </Button>
    </div>
  );
}

function BrowserApp({ wifiConnected, onOpenSettings }: { wifiConnected: boolean; onOpenSettings: () => void }) {
  const [url, setUrl] = useState("https://www.google.com/search?igu=1");
  const [input, setInput] = useState("https://www.google.com/search?igu=1");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let target = input;
    if (!target.startsWith("http")) target = `https://${target}`;
    setUrl(target);
  };

  if (!wifiConnected) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white/5">
        <Wifi className="h-16 w-16 opacity-20 mb-6" />
        <h2 className="text-2xl font-bold mb-2">No Internet Connection</h2>
        <p className="text-muted-foreground max-w-xs mb-6">Your device is offline. Please check your WiFi settings to continue browsing.</p>
        <Button variant="secondary" className="rounded-xl" onClick={onOpenSettings}>Go to Settings</Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center gap-2 border-b bg-white p-2">
        <div className="flex items-center gap-1 mr-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-black/60"><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-black/60"><ChevronRight className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-black/60"><RotateCcw className="h-4 w-4" /></Button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-9 rounded-xl border bg-black/5 px-4 text-[13px] text-black focus:bg-white focus:ring-2 ring-[var(--desktop-accent)] outline-none transition"
          />
        </form>
      </div>
      <div className="relative flex-1 bg-white">
        <iframe
          src={url}
          className="h-full w-full border-none"
          title="Browser"
          sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        />
      </div>
    </div>
  );
}

function SettingsApp({
  settings,
  onSettings,
  onOpenAbout,
  wifiConnected,
  setWifiConnected,
}: {
  settings: SettingsState;
  onSettings: (next: SettingsState) => void;
  onOpenAbout: () => void;
  wifiConnected: boolean;
  setWifiConnected: (v: boolean | ((prev: boolean) => boolean)) => void;
}) {
  return (
    <div className="h-full flex flex-col bg-white/5 overflow-hidden">
      <div className="flex h-full">
        <div className="w-64 border-r bg-white/5 flex flex-col p-4 gap-2">
          <h2 className="text-lg font-bold mb-4 px-2">Settings</h2>
          {["System", "Devices", "Network & Internet", "Personalization", "Apps", "Accounts", "Time & Language", "Update & Security"].map(item => (
            <button key={item} className={cn("text-left px-3 py-2 rounded-xl text-sm transition", item === "Personalization" ? "bg-[var(--desktop-accent)] text-white" : "hover:bg-white/10")}>
              {item}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Personalization</h3>
            <div className="grid gap-4">
              <div className="rounded-2xl border glass p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Dark mode</div>
                  <div className="text-xs text-muted-foreground">Toggles system-wide theme</div>
                </div>
                <UISwitch checked={settings.darkMode} onCheckedChange={(v: boolean) => onSettings({ ...settings, darkMode: v })} />
              </div>
              <div className="rounded-2xl border glass p-4 space-y-4">
                <div className="text-sm font-medium">Accent color</div>
                <div className="grid grid-cols-5 gap-2">
                  {ACCENTS.map((a) => (
                    <button
                      key={a.value}
                      className={cn("h-8 rounded-xl ring-2 ring-offset-2 ring-transparent transition", settings.accent === a.value && "ring-[var(--desktop-accent)]")}
                      style={{ backgroundColor: `hsl(${a.value})` }}
                      onClick={() => onSettings({ ...settings, accent: a.value })}
                    />
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border glass p-4 space-y-4">
                <div className="text-sm font-medium">Wallpaper</div>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.keys(WALLPAPERS) as WallpaperId[]).map((id) => (
                    <button
                      key={id}
                      onClick={() => onSettings({ ...settings, wallpaper: id })}
                      className={cn("relative aspect-video rounded-xl overflow-hidden ring-2 ring-transparent transition", settings.wallpaper === id && "ring-[var(--desktop-accent)]")}
                    >
                      <img src={WALLPAPERS[id].src} className="w-full h-full object-cover" alt="" />
                      <div className="absolute inset-0 bg-black/20 flex items-end p-2">
                        <span className="text-[10px] font-bold text-white">{WALLPAPERS[id].name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Network & Internet</h3>
            <div className="rounded-2xl border glass p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-2xl", wifiConnected ? "bg-[var(--desktop-accent)] text-white" : "bg-white/10")}>
                  <Wifi className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm font-medium">Wi-Fi</div>
                  <div className="text-xs text-muted-foreground">{wifiConnected ? "Connected to Diddy's House" : "Disconnected"}</div>
                </div>
              </div>
              <UISwitch checked={wifiConnected} onCheckedChange={setWifiConnected} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AboutApp() {
  return (
    <div className="h-full p-4 overflow-y-auto custom-scrollbar">
      <div className="text-sm font-semibold">About WebOS Desktop</div>
      <div className="mt-2 space-y-2 text-xs text-muted-foreground">
        <p data-testid="text-about-1">
          WebOS Desktop is a front-end demo that mimics a desktop operating system experience inside your browser.
        </p>
        <p data-testid="text-about-2">
          Notes are saved to <span className="font-medium">localStorage</span> on this device.
        </p>
      </div>
    </div>
  );
}

function BootScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 800);
          return 100;
        }
        const diff = Math.random() * 25;
        return Math.min(oldProgress + diff, 100);
      });
    }, 150);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-black text-white">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-6"
      >
        <div className="text-4xl font-semibold tracking-tight">Web OS</div>
        <div className="w-72">
          <div className="mb-2 text-xs text-white/70 text-center">Booting — {Math.round(progress)}%</div>
          <div className="relative h-3 bg-white/12 rounded-full overflow-hidden">
            <motion.div
              className="absolute left-0 top-0 h-full bg-white rounded-full shadow-[0_6px_20px_rgba(255,255,255,0.18)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeInOut" }}
            />
            <div
              className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.06),rgba(255,255,255,0.12),rgba(255,255,255,0.06))]"
              style={{ mixBlendMode: "overlay" }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Desktop() {
  const [booting, setBooting] = useState(true);
  const isMobile = useMemo(() => isSmallScreen(), []);

  const [notes, setNotes] = useLocalStorageState<Note[]>(LS_KEYS.notes, []);
  const [firstRunDismissed, setFirstRunDismissed] = useLocalStorageState<boolean>(LS_KEYS.firstRun, false);
  const [settings, setSettings] = useLocalStorageState<SettingsState>(LS_KEYS.settings, {
    darkMode: true,
    accent: ACCENTS[0]!.value,
    wallpaper: "aurora",
    transparency: true,
    animations: true,
  });

  const [windows, setWindows] = useState<WindowState[]>([]);
  const zTop = useRef(10);
  const draggingId = useRef<string | null>(null);
  const resizingId = useRef<string | null>(null);
  const dragOffset = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const resizeStart = useRef<{ x: number; y: number; w: number; h: number }>({ x: 0, y: 0, w: 0, h: 0 });

  const [clock, setClock] = useState(() => formatClock(new Date()));
  const [date, setDate] = useState(() => formatDate(new Date()));
  const [startOpen, setStartOpen] = useState(false);

  useEffect(() => {
    const t = window.setInterval(() => {
      const now = new Date();
      setClock(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setDate(now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }));
    }, 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.darkMode);
    document.documentElement.style.setProperty("--accent", settings.accent);
    document.documentElement.style.setProperty("--glass-opacity", settings.transparency ? "0.72" : "0.95");
  }, [settings.darkMode, settings.accent, settings.transparency]);

  const [customWallpapers] = useLocalStorageState<string[]>(LS_KEYS.customWallpapers, []);
  
  const wallpaperSrc = useMemo(() => {
    if (WALLPAPERS[settings.wallpaper]) return WALLPAPERS[settings.wallpaper].src;
    return settings.wallpaper; // It's a data URL
  }, [settings.wallpaper]);

  function bringToFront(id: string) {
    zTop.current += 1;
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, z: zTop.current } : w)));
  }

  function openApp(appId: AppId) {
    setStartOpen(false);
    zTop.current += 1;
    const idx = windows.length;
    const base = defaultWindowFor(appId, idx, isMobile);
    const win: WindowState = {
      ...base,
      z: zTop.current,
    };

    setWindows((prev) => {
      const existing = prev.find(w => w.appId === appId);
      if (existing) {
        return prev.map(w => w.appId === appId ? { ...w, minimized: false, z: zTop.current } : w);
      }
      const next = isMobile ? prev.map((w) => ({ ...w, minimized: true })) : prev;
      return [...next, win];
    });
  }

  function closeWindow(id: string) {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }

  function toggleMinimize(id: string) {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        const willMin = !w.minimized;
        if (!willMin) {
          zTop.current += 1;
          return { ...w, minimized: false, z: zTop.current };
        }
        return { ...w, minimized: true };
      }),
    );
  }

  function toggleMaximize(id: string) {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        const nextMax = !w.maximized;
        return { ...w, maximized: nextMax, minimized: false };
      }),
    );
  }

  const activeWindowId = useMemo(() => {
    const visible = windows.filter((w) => !w.minimized);
    if (visible.length === 0) return null;
    return visible.reduce((a, b) => (a.z > b.z ? a : b)).id;
  }, [windows]);

  useEffect(() => {
    function onPointerMove(e: PointerEvent) {
      if (draggingId.current) {
        const id = draggingId.current;
        setWindows((prev) =>
          prev.map((w) => {
            if (w.id !== id) return w;
            if (w.maximized) return w;
            const nx = e.clientX - dragOffset.current.dx;
            const ny = e.clientY - dragOffset.current.dy;
            const maxX = window.innerWidth - 80;
            const maxY = window.innerHeight - 110;
            return { ...w, x: clamp(nx, 10, maxX), y: clamp(ny, 10, maxY) };
          }),
        );
      }

      if (resizingId.current) {
        const id = resizingId.current;
        setWindows((prev) =>
          prev.map((w) => {
            if (w.id !== id) return w;
            if (w.maximized || isMobile) return w;
            const dx = e.clientX - resizeStart.current.x;
            const dy = e.clientY - resizeStart.current.y;
            const nw = clamp(resizeStart.current.w + dx, 320, window.innerWidth - w.x - 12);
            const nh = clamp(resizeStart.current.h + dy, 220, window.innerHeight - w.y - 90);
            return { ...w, w: nw, h: nh };
          }),
        );
      }
    }

    function onPointerUp() {
      draggingId.current = null;
      resizingId.current = null;
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [isMobile]);

  const [wifiConnected, setWifiConnected] = useState(true);

  function renderApp(appId: AppId) {
    switch (appId) {
      case "snake":
        return <SnakeGame />;
      case "notes":
        return <NotesApp />;
      case "files":
        return <FilesApp />;
      case "browser":
        return <BrowserApp wifiConnected={wifiConnected} onOpenSettings={() => openApp("settings")} />;
      case "store":
        return (
          <AppStore 
            onInstall={(app) => {
              setWindows(prev => {
                const exists = prev.some(w => w.appId === app.id as any);
                if (exists) return prev;
                const idx = prev.length;
                const base = defaultWindowFor(app.id as any, idx, isMobile);
                return [...prev, { ...base, z: zTop.current + 1 }];
              });
            }} 
          />
        );
      case "settings":
        return (
          <SettingsApp
            settings={settings}
            onSettings={setSettings}
            onOpenAbout={() => openApp("about")}
            wifiConnected={wifiConnected}
            setWifiConnected={setWifiConnected}
          />
        );
      case "about":
        return <AboutApp />;
    }
  }

  const desktopIcons = [
    { id: "notes" as const, label: "Notes", Icon: FileText },
    { id: "files" as const, label: "Files", Icon: Folder },
    { id: "browser" as const, label: "Browser", Icon: Globe },
    { id: "snake" as const, label: "Snake", Icon: LayoutGrid },
    { id: "settings" as const, label: "Settings", Icon: Cog },
    { id: "store" as const, label: "App Store", Icon: Download },
  ];

  return (
    <>
      <AnimatePresence>
        {booting && <BootScreen onComplete={() => setBooting(false)} />}
      </AnimatePresence>
      
      <div
        className="relative h-full w-full overflow-hidden desktop-noise"
        onMouseDown={() => setStartOpen(false)}
        data-testid="page-desktop"
      >
      <div className="absolute inset-0">
        <img
          src={wallpaperSrc}
          alt="Wallpaper"
          className="h-full w-full object-cover"
          draggable={false}
          data-testid="img-wallpaper"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/15 to-black/45" />
      </div>

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex-1 p-4 sm:p-6">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-1 sm:gap-3 w-fit">
            {desktopIcons.map((ic) => (
              <DesktopIcon
                key={ic.id}
                label={ic.label}
                Icon={ic.Icon}
                onOpen={() => openApp(ic.id)}
                testId={`icon-open-${ic.id}`}
              />
            ))}
          </div>

          <AnimatePresence>
            {windows
              .filter((w) => !w.minimized)
              .map((w) => {
                const meta = appMeta(w.appId);
                const active = w.id === activeWindowId;

                const style: React.CSSProperties = w.maximized
                  ? {
                      left: 10,
                      top: 10,
                      width: "calc(100% - 20px)",
                      height: "calc(100% - 90px)",
                      zIndex: w.z,
                    }
                  : {
                      left: w.x,
                      top: w.y,
                      width: w.w,
                      height: w.h,
                      zIndex: w.z,
                    };

                return (
                  <motion.div
                    key={w.id}
                    initial={settings.animations ? { opacity: 0, scale: 0.9, y: 20 } : {}}
                    animate={settings.animations ? { opacity: 1, scale: 1, y: 0 } : {}}
                    exit={settings.animations ? { opacity: 0, scale: 0.9, y: 20 } : {}}
                    transition={{ type: "spring", damping: 25, stiffness: 350 }}
                    className={cn(
                      "absolute rounded-[18px] window-shadow overflow-hidden",
                      settings.transparency ? "glass" : "bg-card border shadow-xl",
                      active ? "ring-2 ring-white/18" : "ring-1 ring-white/10",
                    )}
                    style={style}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      bringToFront(w.id);
                    }}
                    data-testid={`window-${w.id}`}
                  >
                    <WindowChrome
                      title={w.title}
                      icon={meta.icon}
                      active={active}
                      maximized={w.maximized}
                      onMinimize={() => toggleMinimize(w.id)}
                      onMaximize={() => toggleMaximize(w.id)}
                      onClose={() => closeWindow(w.id)}
                      dragHandleProps={{
                        onPointerDown: (e: any) => {
                          if (isMobile) return;
                          bringToFront(w.id);
                          draggingId.current = w.id;
                          dragOffset.current = { dx: e.clientX - w.x, dy: e.clientY - w.y };
                          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
                        },
                        style: { cursor: isMobile ? "default" : "grab" },
                      }}
                    />

                    <div className="h-[calc(100%-48px)] bg-white/35 dark:bg-black/20">
                      {renderApp(w.appId)}
                    </div>

                    {!isMobile && !w.maximized ? (
                      <ResizerHandle
                        onPointerDown={(e) => {
                          bringToFront(w.id);
                          resizingId.current = w.id;
                          resizeStart.current = { x: e.clientX, y: e.clientY, w: w.w, h: w.h };
                          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
                        }}
                        testId={`handle-resize-${w.id}`}
                      />
                    ) : null}
                  </motion.div>
                );
              })}
          </AnimatePresence>
        </div>

        <div className="relative z-[9000] h-14 w-full glass-strong border-t border-white/15 px-3 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setStartOpen(!startOpen)}
              className={cn(
                "group relative grid h-10 w-10 place-items-center rounded-xl transition-all duration-300",
                startOpen ? "bg-white/20 shadow-inner" : "hover:bg-white/10 active:scale-90"
              )}
              data-testid="button-start-menu"
            >
              <div className="grid grid-cols-2 gap-0.5 p-1 transition-transform group-hover:rotate-12">
                <div className="h-2 w-2 rounded-sm bg-blue-400" />
                <div className="h-2 w-2 rounded-sm bg-blue-400 opacity-80" />
                <div className="h-2 w-2 rounded-sm bg-blue-400 opacity-60" />
                <div className="h-2 w-2 rounded-sm bg-blue-400 opacity-40" />
              </div>
            </button>
            <div className="h-6 w-px bg-white/10 mx-1" />
            <div className="flex items-center gap-1">
              {windows.map((w) => {
                const meta = appMeta(w.appId);
                const active = w.id === activeWindowId;
                return (
                  <button
                    key={w.id}
                    onClick={() => toggleMinimize(w.id)}
                    className={cn(
                      "relative h-10 w-10 rounded-xl transition flex items-center justify-center",
                      active ? "bg-white/15 shadow-sm" : "hover:bg-white/8"
                    )}
                  >
                    {meta?.icon && <meta.icon className="h-5 w-5" />}
                    {active && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-1 bg-[var(--desktop-accent)] rounded-full" />}
                  </button>
                );
              })}
            </div>
          </div>

          <SystemTray 
            isMobile={isMobile} 
            clock={clock} 
            date={date} 
            wifiConnected={wifiConnected}
            setWifiConnected={setWifiConnected}
          />
        </div>

        <StartMenu
          open={startOpen}
          onOpenApp={openApp}
          onClose={() => setStartOpen(false)}
          clock={clock}
          date={date}
          isMobile={isMobile}
        />
      </div>
      
   {!firstRunDismissed && (
  <FirstRunOverlay onDismiss={() => setFirstRunDismissed(true)} />
)}

      </div>
    </>
  );
}
