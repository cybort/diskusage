import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Download, HardDrive, Lock } from "lucide-react";
import {
  OLD_MOUNTS,
  TIERS,
  TIER_RANK,
  VOLUMES,
  bundle,
  formatBytes,
  kindLabel,
  newMounts,
  project,
  type Kind,
  type Row,
  type Tier,
  type Volume,
} from "@/lib/disk-model";
import { treemap } from "@/lib/treemap";

const KIND_BG: Record<Kind, string> = {
  media: "bg-media",
  appdata: "bg-apps",
  obb: "bg-obb",
  private: "bg-down",
  system: "bg-sys",
  alias: "bg-surface-2",
  own: "bg-accent",
  gap: "gap-hatch",
  free: "bg-free",
};

const KIND_INK: Record<Kind, string> = {
  media: "text-accent-ink",
  appdata: "text-accent-ink",
  obb: "text-accent-ink",
  private: "text-accent-ink",
  system: "text-bg",
  alias: "text-fg",
  own: "text-accent-ink",
  gap: "text-bg",
  free: "text-muted",
};

function useMatch(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const apply = () => setMatches(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [query]);
  return matches;
}

function blocksForTouch(rows: Row[], fold: boolean): Row[] {
  if (!fold) return rows;
  const pinned = rows.filter((row) => row.kind === "gap" || row.kind === "free");
  const content = rows.filter((row) => row.kind !== "gap" && row.kind !== "free");
  const total = content.reduce((sum, row) => sum + row.bytes, 0) || 1;
  const big: Row[] = [];
  const small: Row[] = [];
  for (const row of [...content].sort((a, b) => b.bytes - a.bytes)) {
    const share = row.bytes / total;
    const keep = big.length < 5 && (share >= 0.08 || (big.length < 3 && share >= 0.045));
    if (keep) big.push(row);
    else small.push(row);
  }
  if (small.length === 0) return rows;
  if (small.length === 1) return [...big, ...pinned];
  const rest: Row = {
    id: "__rest",
    name: `其余 ${small.length} 项`,
    path: "",
    bytes: small.reduce((sum, row) => sum + row.bytes, 0),
    kind: "system",
    reveal: "app",
    zoomable: false,
    detail: small.map((row) => row.name).join("、"),
  };
  return [...big, rest, ...pinned];
}

export function UsageMap() {
  const [tier, setTier] = useState<Tier>("all");
  const [volumeId, setVolumeId] = useState("internal");
  const [zoom, setZoom] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const compact = useMatch("(max-width: 1023px)");
  const coarse = useMatch("(pointer: coarse)");

  useEffect(() => {
    const saved = localStorage.getItem("du-tier");
    if (saved === "app" || saved === "all" || saved === "shizuku" || saved === "root") {
      setTier(saved);
    }
  }, []);

  useEffect(() => {
    if (!selected || !compact) return;
    document.getElementById(`entry-${selected}`)?.scrollIntoView({ block: "nearest" });
  }, [selected, compact]);

  function pickTier(next: Tier) {
    setTier(next);
    setZoom(null);
    setSelected(null);
    localStorage.setItem("du-tier", next);
    const current = VOLUMES.find((v) => v.id === volumeId);
    if (current && TIER_RANK[next] < TIER_RANK[current.unlock]) {
      setVolumeId("internal");
    }
  }

  function enter(id: string) {
    setZoom(id);
    setSelected(null);
  }

  function leave() {
    setZoom(null);
    setSelected(null);
  }

  const volume = VOLUMES.find((v) => v.id === volumeId) ?? VOLUMES[0];
  const locked = TIER_RANK[tier] < TIER_RANK[volume.unlock];
  const projected = useMemo(() => project(volume, tier), [volume, tier]);
  const grouped = useMemo(() => {
    if (TIER_RANK[tier] < TIER_RANK[volume.unlock]) return [];
    const visible = volume.children.filter((node) => TIER_RANK[tier] >= TIER_RANK[node.reveal]);
    return bundle(visible);
  }, [volume, tier]);
  const zoomGroup = zoom?.startsWith("group-") ? grouped.find((row) => row.id === zoom) : undefined;
  const zoomNode = !zoomGroup && zoom ? volume.children.find((node) => node.id === zoom) : undefined;
  const rows: Row[] = zoomGroup
    ? volume.children
        .filter((node) => node.kind === zoomGroup.kind && TIER_RANK[tier] >= TIER_RANK[node.reveal])
        .map((node) => ({ ...node, zoomable: (node.children?.length ?? 0) > 0 }))
    : zoomNode?.children
      ? zoomNode.children.map((node) => ({ ...node, zoomable: false }))
      : [
          ...grouped,
          ...projected.rows.filter((row) => row.kind === "gap" || row.kind === "free"),
        ];

  const used = volume.capacity - volume.free;
  const hint = TIERS.find((item) => item.id === tier)?.hint;
  const listed = [...rows].sort((a, b) => b.bytes - a.bytes);

  return (
    <main className="shell">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs tracking-widest text-muted uppercase">DiskUsage 5.1</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">磁盘里少掉的那一段</h1>
          <p className="mt-2 text-sm text-muted">
            Android 16 样机，256 GB userdata。换授权，看哪些目录从「系统数据」里拆出来。
          </p>
        </div>
        <a
          href="/downloads/diskusage-v5.1.0-debug.apk"
          download="diskusage-v5.1.0-debug.apk"
          className="inline-flex h-12 shrink-0 items-center gap-2 rounded-card bg-accent px-3 text-sm font-medium text-accent-ink sm:px-4"
        >
          <Download className="size-4" aria-hidden />
          <span className="hidden sm:inline">下载 APK</span>
          <span className="sm:hidden">APK</span>
        </a>
      </header>

      <div className="grid grid-cols-4 gap-2">
        {TIERS.map((item) => {
          const on = item.id === tier;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={on}
              onClick={() => pickTier(item.id)}
              className={`tier-btn min-h-12 min-w-0 rounded-card border px-1 text-center text-sm font-medium sm:px-3 sm:py-2 sm:text-left ${
                on ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface text-fg"
              }`}
            >
              <span className="block leading-tight">{item.label}</span>
              <span className={`mt-1 hidden text-xs sm:block ${on ? "text-accent-ink/80" : "text-muted"}`}>{item.hint}</span>
            </button>
          );
        })}
      </div>
      <p className="text-sm text-muted sm:hidden">{hint}</p>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {VOLUMES.map((item) => {
          const open = TIER_RANK[tier] >= TIER_RANK[item.unlock];
          const on = item.id === volume.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={on}
              onClick={() => {
                setVolumeId(item.id);
                setZoom(null);
                setSelected(null);
              }}
              className={`vol-btn inline-flex min-h-12 min-w-0 items-center justify-start gap-2 rounded-card border px-3 text-sm ${
                on ? "border-accent bg-surface-2 text-fg" : "border-line text-muted"
              }`}
            >
              <HardDrive className="size-4 shrink-0" aria-hidden />
              <span className="truncate">{item.title}</span>
              {!open && (
                <>
                  <Lock className="size-3.5 shrink-0" aria-hidden />
                  <span className="sr-only">锁定</span>
                </>
              )}
            </button>
          );
        })}
      </div>

      {locked ? (
        <section className="rounded-card border border-line bg-surface p-5">
          <h2 className="text-lg font-medium">{volume.path} 还打不开</h2>
          <p className="mt-2 text-sm text-muted">{volume.note}</p>
          <p className="mt-3 font-mono text-sm text-warn">{volume.backend[tier]}</p>
        </section>
      ) : (
        <section className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-1 text-sm">
                {zoom ? (
                  <button type="button" className="crumb-back" onClick={leave}>
                    <ChevronLeft className="size-4" aria-hidden />
                    返回
                  </button>
                ) : (
                  <span className="font-medium">{volume.title}</span>
                )}
                {zoom && (
                  <>
                    <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
                    <span className="truncate font-medium">{zoomGroup?.name ?? zoomNode?.name}</span>
                  </>
                )}
              </div>
              <p className="font-mono text-sm text-muted">
                已列入 {formatBytes(zoomNode ? zoomNode.bytes : zoomGroup ? zoomGroup.bytes : projected.scanned)}
                {!zoom && projected.gap > 0 && ` · 系统数据 ${formatBytes(projected.gap)}`}
                {` · ${volume.backend[tier]}`}
              </p>
            </div>
            <Map
              rows={rows}
              fold={compact}
              coarse={coarse}
              selected={selected}
              onSelect={setSelected}
              onZoom={enter}
            />
            <Legend rows={rows} />
            <div className="entry-list" id="dir-list">
              <h2>目录 · {rows.length}</h2>
              <ul>
                {listed.map((row) => {
                  const on = selected === row.id;
                  return (
                    <li key={row.id} id={`entry-${row.id}`} className={on ? "entry is-on" : "entry"}>
                      <button
                        type="button"
                        className="entry-main"
                        aria-pressed={on}
                        onClick={() => setSelected(row.id)}
                      >
                        <span className={`entry-swatch ${KIND_BG[row.kind]}`} aria-hidden />
                        <span className="entry-text">
                          <span className="entry-name truncate">{row.name}</span>
                          <span className="entry-kind">{kindLabel(row.kind)}</span>
                        </span>
                        <span className="entry-size">{formatBytes(row.bytes)}</span>
                      </button>
                      {row.zoomable ? (
                        <button
                          type="button"
                          className="entry-go"
                          aria-label={`进入 ${row.name}`}
                          onClick={() => enter(row.id)}
                        >
                          <ChevronRight className="size-5" aria-hidden />
                        </button>
                      ) : (
                        <span className="entry-go invisible" aria-hidden />
                      )}
                      {on && (
                        <div className="entry-detail">
                          <p>{row.detail}</p>
                          <p className="entry-path">{row.path}</p>
                          {row.zoomable && (
                            <button type="button" className="entry-enter" onClick={() => enter(row.id)}>
                              进入
                              <ChevronRight className="size-4" aria-hidden />
                            </button>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
            {zoom && (
              <button type="button" className="back-wide" onClick={leave}>
                <ChevronLeft className="size-4" aria-hidden />
                返回{volume.title}
              </button>
            )}
          </div>
          <Detail
            volume={volume}
            tier={tier}
            rows={rows}
            selectedId={selected}
            scanned={projected.scanned}
            gap={projected.gap}
            used={used}
            zoomed={Boolean(zoom)}
            onZoom={enter}
            onBack={leave}
          />
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        <MountList title="改之前，root 之后的列表" paths={OLD_MOUNTS} tone="warn" />
        <MountList title="现在这个授权能看到的卷" paths={newMounts(tier)} tone="ok" />
      </section>
    </main>
  );
}

function Legend({ rows }: { rows: Row[] }) {
  const kinds: Kind[] = [];
  for (const row of rows) {
    if (!kinds.includes(row.kind)) kinds.push(row.kind);
  }
  return (
    <ul className="legend" aria-label="图例">
      {kinds.map((kind) => (
        <li key={kind}>
          <span className={`legend-swatch ${KIND_BG[kind]}`} aria-hidden />
          {kindLabel(kind)}
        </li>
      ))}
    </ul>
  );
}

function Map({
  rows,
  fold,
  coarse,
  selected,
  onSelect,
  onZoom,
}: {
  rows: Row[];
  fold: boolean;
  coarse: boolean;
  selected: string | null;
  onSelect: (id: string) => void;
  onZoom: (id: string) => void;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 640, h: 480 });
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const display = useMemo(() => blocksForTouch(rows, fold), [rows, fold]);
  const layout = useMemo(
    () => treemap(display.map((row) => row.bytes), box.w, box.h),
    [display, box.w, box.h],
  );

  return (
    <div ref={frame} className="treemap-frame relative overflow-hidden rounded-card border border-line bg-bg">
      {layout.map((rect) => {
        const row = display[rect.index];
        const pad = 4;
        const w = Math.max(0, rect.w - pad);
        const h = Math.max(0, rect.h - pad);
        if (w < 1 || h < 1) return null;
        const rest = row.id === "__rest";
        const showName = w >= 52 && h >= 26;
        const showSize = w >= 64 && h >= 44;
        return (
          <button
            key={row.id}
            type="button"
            aria-label={
              rest
                ? `${row.name}：${row.detail}。到下面的目录里查看`
                : `${row.name}，${formatBytes(row.bytes)}${row.zoomable ? "，可进入" : ""}`
            }
            onClick={() => {
              if (rest) {
                document.getElementById("dir-list")?.scrollIntoView({ behavior: "smooth", block: "start" });
                return;
              }
              if (row.zoomable && (!coarse || selected === row.id)) {
                onZoom(row.id);
                return;
              }
              onSelect(row.id);
            }}
            className={`tile absolute overflow-hidden rounded-sm text-left ${
              rest ? "bg-surface-2 text-fg" : `${KIND_BG[row.kind]} ${KIND_INK[row.kind]}`
            } ${selected === row.id ? "is-on" : ""}`}
            style={{ left: rect.x, top: rect.y, width: w, height: h }}
          >
            {showName && (
              <span className="block px-1.5 py-1">
                <span className="block truncate text-sm font-medium">{row.name}</span>
                {showSize && <span className="block font-mono text-xs opacity-80">{formatBytes(row.bytes)}</span>}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function Detail({
  volume,
  tier,
  rows,
  selectedId,
  scanned,
  gap,
  used,
  zoomed,
  onZoom,
  onBack,
}: {
  volume: Volume;
  tier: Tier;
  rows: Row[];
  selectedId: string | null;
  scanned: number;
  gap: number;
  used: number;
  zoomed: boolean;
  onZoom: (id: string) => void;
  onBack: () => void;
}) {
  const row = rows.find((item) => item.id === selectedId) ?? rows[0];
  return (
    <aside className="hidden flex-col gap-3 rounded-card border border-line bg-surface p-4 lg:flex">
      <p className="font-mono text-xs text-muted">{volume.path}</p>
      <h2 className="text-lg font-medium">{row?.name ?? volume.title}</h2>
      {row && (
        <>
          <p className="font-mono text-sm">{formatBytes(row.bytes)}</p>
          <p className="text-xs text-muted">{kindLabel(row.kind)}</p>
          <p className="text-sm text-fg">{row.detail}</p>
          <p className="break-all font-mono text-xs text-muted">{row.path}</p>
          {row.zoomable && (
            <button
              type="button"
              onClick={() => onZoom(row.id)}
              className="inline-flex h-12 items-center justify-center gap-1 rounded-card bg-accent text-sm font-medium text-accent-ink"
            >
              进入
              <ChevronRight className="size-4" aria-hidden />
            </button>
          )}
        </>
      )}
      {zoomed && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-12 items-center justify-center gap-1 rounded-card border border-line text-sm font-medium"
        >
          <ChevronLeft className="size-4" aria-hidden />
          返回上一级
        </button>
      )}
      <div className="mt-2 border-t border-line pt-3 text-sm">
        <p>已用 {formatBytes(used)}</p>
        <p className="text-muted">列入 {formatBytes(scanned)}</p>
        <p className={gap > 0 ? "text-warn" : "text-muted"}>未列入 {formatBytes(gap)}</p>
      </div>
      <p className="text-xs text-muted">{volume.note}</p>
      <p className="font-mono text-xs text-muted">{TIERS.find((item) => item.id === tier)?.label} · {volume.backend[tier]}</p>
    </aside>
  );
}

function MountList({ title, paths, tone }: { title: string; paths: string[]; tone: "warn" | "ok" }) {
  return (
    <section className="min-w-0 rounded-card border border-line bg-surface p-4">
      <h2 className="text-sm font-medium">{title}</h2>
      <ul className="mt-3 flex flex-col">
        {paths.map((path) => (
          <li key={path} className="mount-path py-1.5 font-mono text-sm">
            <span className={tone === "warn" && path !== "/storage/emulated/0" ? "text-warn" : "text-fg"}>{path}</span>
          </li>
        ))}
      </ul>
      {tone === "warn" && (
        <p className="mt-3 text-sm text-muted">橙色是同一份数据的 bind，或根本不该拿来扫的伪文件系统。SD 卡不在里面。</p>
      )}
      {tone === "ok" && (
        <p className="mt-3 text-sm text-muted">SD 从「所有文件」起出现。/data 只在 Magisk 这一档，并且不再带 /data/user/0。</p>
      )}
    </section>
  );
}
