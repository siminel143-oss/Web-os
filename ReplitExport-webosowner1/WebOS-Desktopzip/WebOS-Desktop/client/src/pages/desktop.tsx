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

type AppId = "notes" | "files" | "browser" | "settings" | "about";

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
  aurora: { name: "Aurora", src: aurora },
  sky: { name: "Sky", src: sky },
  graphite: { name: "Graphite", src: graphite },
  mountain: { name: "Mountain", src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1000" },
  forest: { name: "Forest", src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1000" },
  ocean: { name: "Ocean", src: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&q=80&w=1000" },
  desert: { name: "Desert", src: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&q=80&w=1000" },
  night: { name: "Night", src: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&q=80&w=1000" },
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
}: {
  isMobile: boolean;
  clock: string;
  date: string;
}) {
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [wifiConnected, setWifiConnected] = useState(true);
  const [batteryLevel] = useState(85);
  const [isBatterySaving, setIsBatterySaving] = useState(false);

  return (
    <div className="flex items-center gap-1 pr-2">
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 hover:bg-white/10 transition">
            <Wifi className="h-4 w-4" />
            <div className="flex items-center gap-0.5">
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </div>
            <div className="flex items-center gap-1">
              <Battery className="h-4 w-4" />
              {!isMobile && <span className="text-[11px] font-medium">{batteryLevel}%</span>}
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-72 glass p-4 mb-2" side="top" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-xl", wifiConnected ? "bg-[var(--desktop-accent)] text-white" : "bg-white/10")}>
                  <Wifi className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Diddy's House</div>
                  <div className="text-xs text-muted-foreground">{wifiConnected ? "Connected, Secured" : "Available"}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWifiConnected(!wifiConnected)}
                className="rounded-xl px-3 py-1.5 text-sm font-medium bg-white/10 hover:bg-white/12 transition"
              >
                {wifiConnected ? "Disconnect" : "Connect"}
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  <span className="text-xs font-medium">Volume</span>
                </div>
                <span className="text-xs text-muted-foreground">{isMuted ? "Muted" : `${volume}%`}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" className="h-8 w-8" onClick={() => setIsMuted(!isMuted)}>
                   {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={100}
                  step={1}
                  onValueChange={(v: number[]) => {
                    setVolume(v[0]);
                    setIsMuted(false);
                  }}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-xl", isBatterySaving ? "bg-amber-500 text-white" : "bg-white/10")}>
                  <BatteryMedium className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{batteryLevel}% Remaining</div>
                  <div className="text-xs text-muted-foreground">{isBatterySaving ? "Power Saving On" : "Optimized Mode"}</div>
                </div>
              </div>
              <UISwitch checked={isBatterySaving} onCheckedChange={setIsBatterySaving} />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <div className="h-4 w-px bg-white/15 mx-1" />

      <button className="flex flex-col items-end px-2 py-1 rounded-lg hover:bg-white/10 transition">
        <span className="text-[12px] font-medium leading-tight">{clock}</span>
        <span className="text-[10px] text-white/60 leading-tight">{date}</span>
      </button>
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
    case "about":
      return { title: "About", icon: Info };
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
    title: meta.title,
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
                localStorage.removeItem(LS_KEYS.firstRun);
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
              "absolute left-3 bottom-[72px] w-[340px] rounded-2xl glass p-3",
              isMobile && "left-3 right-3 w-auto bottom-[78px]",
            )}
            onMouseDown={(e) => e.stopPropagation()}
            data-testid="panel-start-menu"
          >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[12px] font-semibold tracking-tight">Start</div>
            <div className="text-[11px] text-muted-foreground">Open an app</div>
          </div>
          <div className="text-right">
            <div className="text-[12px] font-medium" data-testid="text-start-clock">
              {clock}
            </div>
            <div className="text-[11px] text-muted-foreground" data-testid="text-start-date">
              {date}
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          {([
            ["notes", FileText],
            ["files", Folder],
            ["browser", Globe],
            ["settings", Cog],
          ] as Array<[AppId, any]>).map(([id, Icon]) => {
            const meta = appMeta(id);
            return (
              <button
                key={id}
                className="group flex items-center gap-3 rounded-xl border bg-white/55 dark:bg-white/5 px-3 py-2 text-left hover:bg-white/65 dark:hover:bg-white/8 transition"
                onClick={() => {
                  onOpenApp(id);
                  onClose();
                }}
                data-testid={`button-start-open-${id}`}
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--desktop-accent)] text-white shadow-[0_16px_36px_rgba(0,0,0,.22)]">
                  <Icon className="h-4.5 w-4.5" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-medium">{meta.title}</div>
                  <div className="truncate text-[11px] text-muted-foreground">Open {meta.title}</div>
                </div>
              </button>
            );
          })}
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
  const [path, setPath] = useState<string[]>([FAKE_FS.name]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "size">("name");

  const currentNode = useMemo(() => {
    let cur: FakeNode = FAKE_FS;
    for (let i = 1; i < path.length; i++) {
      if (cur.type !== "folder" || !cur.children) break;
      const next = cur.children.find((c: FakeNode) => c.name === path[i]);
      if (!next) break;
      cur = next;
    }
    return cur;
  }, [path]);

  const items = useMemo(() => {
    if (currentNode.type !== "folder" || !currentNode.children) return [];
    let filtered = currentNode.children.filter((it: FakeNode) => it.name.toLowerCase().includes(search.toLowerCase()));
    return filtered.sort((a: FakeNode, b: FakeNode) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return (a.size || "").localeCompare(b.size || "");
    });
  }, [currentNode, search, sortBy]);

  function openFolder(name: string) {
    setPath((p) => [...p, name]);
  }

  function goUp() {
    if (path.length > 1) setPath(path.slice(0, -1));
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-3 border-b flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goUp} disabled={path.length <= 1}>
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border">
          <Folder className="h-3.5 w-3.5 opacity-50" />
          <div className="flex items-center text-xs overflow-hidden">
            {path.map((p, i) => (
              <span key={i} className="flex items-center shrink-0">
                {i > 0 && <span className="mx-1 opacity-30">/</span>}
                <button onClick={() => setPath(path.slice(0, i + 1))} className="hover:underline">{p}</button>
              </span>
            ))}
          </div>
        </div>
        <div className="w-48 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 opacity-40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border rounded-xl py-1.5 pl-9 pr-3 text-xs outline-none focus:ring-1 ring-[var(--desktop-accent)]"
            placeholder="Search..."
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left border-b bg-white/2">
              <th className="p-3 text-[11px] font-semibold uppercase tracking-wider opacity-50 cursor-pointer hover:bg-white/5" onClick={() => setSortBy("name")}>Name</th>
              <th className="p-3 text-[11px] font-semibold uppercase tracking-wider opacity-50 cursor-pointer hover:bg-white/5 text-right" onClick={() => setSortBy("size")}>Size</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => {
              const isFolder = it.type === "folder";
              return (
                <tr
                  key={idx}
                  className="group hover:bg-white/5 transition-colors cursor-pointer border-b border-transparent"
                  onDoubleClick={() => isFolder && openFolder(it.name)}
                >
                  <td className="p-2">
                    <div className="flex items-center gap-3">
                      <div className={cn("h-9 w-9 rounded-xl grid place-items-center", isFolder ? "bg-[var(--desktop-accent)] text-white" : "bg-white/10")}>
                        {isFolder ? <Folder className="h-4.5 w-4.5" /> : <FileText className="h-4.5 w-4.5" />}
                      </div>
                      <span className="text-sm">{it.name}</span>
                    </div>
                  </td>
                  <td className="p-2 text-right">
                    <span className="text-xs text-muted-foreground">{it.type === "file" ? it.size : "—"}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BrowserApp() {
  const [history, setHistory] = useState<string[]>(["https://www.google.com/search?igu=1"]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [urlInput, setUrlInput] = useState(history[0]);
  const [tabs, setTabs] = useState([{ id: "1", url: history[0], title: "Google" }]);
  const [activeTabId, setActiveTabId] = useState("1");
  const [externalNotice, setExternalNotice] = useState<string | null>(null);

  const activeTab = tabs.find(t => t.id === activeTabId);
  const currentUrl = activeTab?.url || "";

  const navigate = (newUrl: string) => {
    let finalUrl = newUrl;
    if (!newUrl.startsWith("http")) finalUrl = "https://" + newUrl;
    // Some major sites (eg. Google) deny embedding via X-Frame-Options.
    // Detect those and open externally instead of trying to load them in an iframe.
    const hostname = (() => {
      try {
        return new URL(finalUrl).hostname.replace(/^www\./, "");
      } catch {
        return "";
      }
    })();

    const EMBED_BLOCKED = ["google.com", "accounts.google.com"];
    if (EMBED_BLOCKED.includes(hostname)) {
      // Open in a new tab and mark this tab as external (iframe will not load it).
      window.open(finalUrl, "_blank", "noopener,noreferrer");
      setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: "about:blank", title: hostname || finalUrl } : t));
      setUrlInput(finalUrl);
      setExternalNotice(hostname || finalUrl);
      return;
    }

    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: finalUrl, title: finalUrl.replace("https://", "").split("/")[0] } : t));
    setUrlInput(finalUrl);
  };

  const isAllowed = ALLOWED_SITES.some(s => currentUrl.startsWith(s.value));

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      <div className="flex items-center gap-1 p-1 bg-white/5 overflow-x-auto">
        {tabs.map(tab => (
          <div
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs min-w-[120px] max-w-[200px] cursor-pointer transition group",
              activeTabId === tab.id ? "bg-white/15 shadow-sm" : "hover:bg-white/5"
            )}
          >
             <Globe className="h-3 w-3 shrink-0" />
             <span className="truncate flex-1">{tab.title}</span>
             <button
               className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-white/10 rounded"
               onClick={(e) => {
                 e.stopPropagation();
                 setTabs(prev => prev.filter(t => t.id !== tab.id));
               }}
             >
               <X className="h-3 w-3" />
             </button>
          </div>
        ))}
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
          const id = randomId();
          setTabs([...tabs, { id, url: "https://example.com", title: "New Tab" }]);
          setActiveTabId(id);
        }}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-2 border-b flex items-center gap-2">
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8"><RotateCcw className="h-4 w-4" /></Button>
        </div>
        <div className="flex-1 relative">
           <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 opacity-40" />
           <input
             value={urlInput}
             onChange={(e) => setUrlInput(e.target.value)}
             onKeyDown={(e) => e.key === "Enter" && navigate(urlInput)}
             className="w-full bg-white/5 border rounded-xl py-1.5 pl-9 pr-3 text-sm outline-none focus:ring-1 ring-[var(--desktop-accent)]"
             placeholder="Search or enter address"
           />
        </div>
      </div>

      <div className="flex-1 relative bg-white">
        {currentUrl === "about:blank" ? (
          <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center">
            <div className="text-sm font-medium mb-2">External page opened</div>
            <div className="text-xs text-muted-foreground mb-4">This site blocks embedding in an iframe, so it was opened in a new tab.</div>
            <div className="flex gap-2">
              <Button onClick={() => {
                if (activeTab) window.open(activeTab.title.startsWith("http") ? activeTab.title : urlInput, "_blank", "noopener,noreferrer");
              }}>
                Open again
              </Button>
              <Button variant="ghost" onClick={() => setExternalNotice(null)}>Close</Button>
            </div>
          </div>
        ) : (
          <iframe
            key={currentUrl}
            src={currentUrl}
            className="h-full w-full border-none"
            sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
          />
        )}
      </div>
    </div>
  );
}

function SettingsApp({
  settings,
  onSettings,
  onOpenAbout,
}: {
  settings: SettingsState;
  onSettings: (next: SettingsState) => void;
  onOpenAbout: () => void;
}) {
  return (
    <div className="h-full flex flex-col bg-background/50 overflow-hidden">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-semibold">Settings</div>
            <div className="text-xs text-muted-foreground" data-testid="text-settings-hint">
              Personalize your desktop
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenAbout}
            className="rounded-xl"
            data-testid="button-open-about"
          >
            About
          </Button>
        </div>

        <div className="grid gap-4">
          <div className="rounded-2xl border bg-white/55 dark:bg-white/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-medium">Dark mode</div>
                <div className="text-xs text-muted-foreground">Toggles the UI theme</div>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-muted-foreground" />
                <UISwitch
                  checked={settings.darkMode}
                  onCheckedChange={(v: boolean) => onSettings({ ...settings, darkMode: v })}
                  data-testid="toggle-dark-mode"
                />
                <Moon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-white/55 dark:bg-white/5 p-4">
            <div className="text-sm font-medium mb-3">Accent color</div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {ACCENTS.map((a) => {
                const selected = settings.accent === a.value;
                return (
                  <button
                    key={a.value}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-[12px] transition",
                      selected
                        ? "border-transparent bg-[var(--desktop-accent)] text-white"
                        : "bg-white/55 dark:bg-white/5 hover:bg-white/65 dark:hover:bg-white/8",
                    )}
                    onClick={() => onSettings({ ...settings, accent: a.value })}
                    data-testid={`button-accent-${a.name.toLowerCase()}`}
                  >
                    <span className="font-medium">{a.name}</span>
                    <span
                      className="h-4 w-4 rounded-full ring-1 ring-black/10"
                      style={{ background: `hsl(${a.value})` }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border bg-white/55 dark:bg-white/5 p-4">
            <div className="text-sm font-medium mb-3">Wallpaper</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(WALLPAPERS) as WallpaperId[]).map((id) => {
                const w = WALLPAPERS[id];
                const selected = settings.wallpaper === id;
                return (
                  <button
                    key={id}
                    className={cn(
                      "overflow-hidden rounded-2xl border text-left transition",
                      selected ? "ring-2 ring-[var(--desktop-accent)] border-transparent" : "hover:bg-white/10",
                    )}
                    onClick={() => onSettings({ ...settings, wallpaper: id })}
                    data-testid={`button-wallpaper-${id}`}
                  >
                    <div className="aspect-[16/9] w-full">
                      <img src={w.src} alt={w.name} className="h-full w-full object-cover" data-testid={`img-wallpaper-${id}`} />
                    </div>
                    <div className="px-3 py-2">
                      <div className="text-[12px] font-medium">{w.name}</div>
                      <div className="text-[11px] text-muted-foreground">Click to apply</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="rounded-2xl border bg-white/55 dark:bg-white/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-medium">Transparency</div>
                <div className="text-xs text-muted-foreground">Glass effects</div>
              </div>
              <UISwitch
                checked={settings.transparency}
                onCheckedChange={(v: boolean) => onSettings({ ...settings, transparency: v })}
              />
            </div>
          </div>

          <div className="rounded-2xl border bg-white/55 dark:bg-white/5 p-4 mb-2">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-medium">Animations</div>
                <div className="text-xs text-muted-foreground">Window transitions</div>
              </div>
              <UISwitch
                checked={settings.animations}
                onCheckedChange={(v: boolean) => onSettings({ ...settings, animations: v })}
              />
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

  function renderApp(appId: AppId) {
    switch (appId) {
      case "notes":
        return <NotesApp />;
      case "files":
        return <FilesApp />;
      case "browser":
        return <BrowserApp />;
      case "settings":
        return (
          <SettingsApp
            settings={settings}
            onSettings={setSettings}
            onOpenAbout={() => openApp("about")}
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
    { id: "settings" as const, label: "Settings", Icon: Cog },
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

        <div
          className={cn(
            "relative z-[9000] mx-3 mb-3 rounded-2xl glass taskbar-shadow",
            "px-2 py-2",
          )}
          data-testid="taskbar"
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={cn(
                "flex items-center gap-2 rounded-2xl px-3 py-2 text-[13px] font-medium",
                "bg-white/55 dark:bg-white/6 hover:bg-white/65 dark:hover:bg-white/9 transition",
              )}
              onClick={(e) => {
                e.stopPropagation();
                setStartOpen((v) => !v);
              }}
              data-testid="button-start"
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Start</span>
            </button>

            <div className="flex-1 overflow-auto">
              <div className="flex items-center gap-2">
                {windows.map((w) => {
                  const meta = appMeta(w.appId);
                  const active = !w.minimized && w.id === activeWindowId;
                  const Icon = meta.icon;
                  return (
                    <button
                      key={w.id}
                      className={cn(
                        "flex items-center gap-2 rounded-2xl px-3 py-2 text-[12px] transition whitespace-nowrap",
                        active
                          ? "bg-[var(--desktop-accent)] text-white"
                          : "bg-white/45 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/8",
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (w.minimized) {
                          toggleMinimize(w.id);
                        } else if (active) {
                          toggleMinimize(w.id);
                        } else {
                          bringToFront(w.id);
                        }
                      }}
                      data-testid={`taskbar-window-${w.id}`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="max-w-[120px] truncate hidden sm:inline">{w.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <SystemTray isMobile={isMobile} clock={clock} date={date} />
            </div>
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
      </div>

      {!firstRunDismissed ? (
        <FirstRunOverlay
          onDismiss={() => {
            setFirstRunDismissed(true);
          }}
        />
      ) : null}
    </div>
    </>
  );
}
