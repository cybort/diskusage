export type Tier = "app" | "all" | "shizuku" | "root";

export type Kind = "media" | "appdata" | "obb" | "private" | "system" | "alias" | "own" | "gap" | "free";

export type Node = {
  id: string;
  name: string;
  path: string;
  bytes: number;
  kind: Kind;
  reveal: Tier;
  detail: string;
  children?: Node[];
};

export type Volume = {
  id: string;
  title: string;
  path: string;
  capacity: number;
  free: number;
  unlock: Tier;
  backend: Record<Tier, string>;
  note: string;
  children: Node[];
};

const G = 1024 ** 3;
const gb = (n: number) => Math.round(n * G);

export const TIER_RANK: Record<Tier, number> = { app: 0, all: 1, shizuku: 2, root: 3 };

export const TIERS: { id: Tier; label: string; hint: string }[] = [
  { id: "app", label: "仅应用", hint: "没开存储权限" },
  { id: "all", label: "所有文件", hint: "Android 13+ 仍看不见 data" },
  { id: "shizuku", label: "Shizuku", hint: "shell，列 Android/data" },
  { id: "root", label: "Magisk", hint: "su -mm，读 /data" },
];

const media: Node[] = [
  { id: "dcim", name: "DCIM", path: "/storage/emulated/0/DCIM", bytes: gb(18.4), kind: "media", reveal: "all", detail: "相机目录。所有文件权限即可。" },
  { id: "pic", name: "Pictures", path: "/storage/emulated/0/Pictures", bytes: gb(4.2), kind: "media", reveal: "all", detail: "相册。" },
  { id: "mov", name: "Movies", path: "/storage/emulated/0/Movies", bytes: gb(22.1), kind: "media", reveal: "all", detail: "本地视频。" },
  { id: "dl", name: "Download", path: "/storage/emulated/0/Download", bytes: gb(9.6), kind: "media", reveal: "all", detail: "下载。" },
  { id: "music", name: "Music", path: "/storage/emulated/0/Music", bytes: gb(3.1), kind: "media", reveal: "all", detail: "音乐。" },
  { id: "doc", name: "Documents", path: "/storage/emulated/0/Documents", bytes: gb(1.4), kind: "media", reveal: "all", detail: "文档。" },
  { id: "pod", name: "Podcasts", path: "/storage/emulated/0/Podcasts", bytes: gb(0.6), kind: "media", reveal: "all", detail: "播客。" },
  { id: "misc", name: "其他媒体", path: "/storage/emulated/0", bytes: gb(2.2), kind: "media", reveal: "all", detail: "铃声、闹钟和零散目录。" },
];

const appdata: Node[] = [
  { id: "wx", name: "微信", path: "/storage/emulated/0/Android/data/com.tencent.mm", bytes: gb(28.6), kind: "appdata", reveal: "shizuku", detail: "Android/data。API 33 起所有文件权限也列不出，要 Shizuku 的 shell 或 root。" },
  { id: "ys", name: "原神", path: "/storage/emulated/0/Android/data/com.miHoYo.Yuanshen", bytes: gb(41.2), kind: "appdata", reveal: "shizuku", detail: "游戏数据在 Android/data，不在 DCIM。" },
  { id: "tg", name: "Telegram", path: "/storage/emulated/0/Android/data/org.telegram.messenger", bytes: gb(11.4), kind: "appdata", reveal: "shizuku", detail: "Android/data。" },
  { id: "cr", name: "Chrome", path: "/storage/emulated/0/Android/data/com.android.chrome", bytes: gb(6.1), kind: "appdata", reveal: "shizuku", detail: "Android/data。" },
  { id: "yt", name: "YouTube", path: "/storage/emulated/0/Android/data/com.google.android.youtube", bytes: gb(8.7), kind: "appdata", reveal: "shizuku", detail: "Android/data。" },
  { id: "bili", name: "哔哩哔哩", path: "/storage/emulated/0/Android/data/tv.danmaku.bili", bytes: gb(9.3), kind: "appdata", reveal: "shizuku", detail: "Android/data。" },
  { id: "rest", name: "其他应用数据", path: "/storage/emulated/0/Android/data", bytes: gb(14.8), kind: "appdata", reveal: "shizuku", detail: "其余 Android/data 子目录。" },
];

const obb: Node[] = [
  { id: "yso", name: "原神 obb", path: "/storage/emulated/0/Android/obb/com.miHoYo.Yuanshen", bytes: gb(12.6), kind: "obb", reveal: "shizuku", detail: "Android/obb，和 data 一样从 Android 13 起对普通应用关闭。" },
  { id: "cod", name: "使命召唤 obb", path: "/storage/emulated/0/Android/obb/com.activision.callofduty.shooter", bytes: gb(8.2), kind: "obb", reveal: "shizuku", detail: "Android/obb。" },
];

const own: Node = {
  id: "own",
  name: "本应用目录",
  path: "/storage/emulated/0/Android/data/com.google.android.diskusage/files",
  bytes: gb(0.04),
  kind: "own",
  reveal: "app",
  detail: "不授权时，getExternalFilesDirs 只能看见自己。旧代码靠剪掉这段路径来猜卷，所以没建过目录的 SD 卡会整卷消失。",
};

const priv: Node[] = [
  { id: "pwx", name: "微信 私有", path: "/data/data/com.tencent.mm", bytes: gb(4.8), kind: "private", reveal: "root", detail: "数据库在 /data/data，不在模拟存储里。Magisk 不用 -mm 时这个目录是空的。" },
  { id: "pmedia", name: "媒体提供者", path: "/data/data/com.android.providers.media", bytes: gb(3.4), kind: "private", reveal: "root", detail: "缩略图索引。" },
  { id: "pchrome", name: "Chrome 私有", path: "/data/data/com.android.chrome", bytes: gb(1.6), kind: "private", reveal: "root", detail: "/data/data。" },
  { id: "pys", name: "原神 私有", path: "/data/data/com.miHoYo.Yuanshen", bytes: gb(2.2), kind: "private", reveal: "root", detail: "/data/data。" },
  { id: "psysui", name: "系统界面", path: "/data/data/com.android.systemui", bytes: gb(1.1), kind: "private", reveal: "root", detail: "/data/data。" },
  { id: "ptg", name: "Telegram 私有", path: "/data/data/org.telegram.messenger", bytes: gb(0.9), kind: "private", reveal: "root", detail: "/data/data。" },
  { id: "prest", name: "其他应用私有", path: "/data/data", bytes: gb(8.5), kind: "private", reveal: "root", detail: "其余 /data/data。/data/user/0 是指向这里的符号链接，扫描不跟随，避免算两遍。" },
];

const aliasChildren: Node[] = [...media, ...appdata, ...obb].map((n) => ({
  ...n,
  id: `alias-${n.id}`,
  reveal: "root" as const,
  kind: "alias" as const,
  detail: `${n.detail} 这是 /data/media/0 的实体，和内部存储是同一份，不是第二份占用。`,
}));

export const VOLUMES: Volume[] = [
  {
    id: "internal",
    title: "内部存储",
    path: "/storage/emulated/0",
    capacity: gb(256),
    free: gb(24.8),
    unlock: "app",
    note: "statfs 报的是整块 userdata。扫 /storage/emulated/0 即使有 root 也进不了 /data/data，那截差额仍是系统数据。要看明细，打开 /data。",
    backend: {
      app: "JNI，进程内",
      all: "JNI，进程内",
      shizuku: "Shizuku user service",
      root: "Shizuku；没有则 su -mm",
    },
    children: [own, ...media, ...appdata, ...obb],
  },
  {
    id: "sd",
    title: "SD 卡",
    path: "/storage/9C33-18F2",
    capacity: gb(128),
    free: gb(64),
    unlock: "all",
    note: "旧代码要本应用先在这张卡上创建 files 目录，卷才会出现。StorageManager 不需要这一步。",
    backend: {
      app: "不可见",
      all: "JNI。Android/data 仍被拒绝",
      shizuku: "Shizuku user service",
      root: "su -mm 或 Shizuku",
    },
    children: [
      { id: "sd-dcim", name: "DCIM", path: "/storage/9C33-18F2/DCIM", bytes: gb(40), kind: "media", reveal: "all", detail: "SD 上的相机目录。" },
      { id: "sd-dl", name: "Download", path: "/storage/9C33-18F2/Download", bytes: gb(6), kind: "media", reveal: "all", detail: "SD 上的下载。" },
      { id: "sd-data", name: "Android/data", path: "/storage/9C33-18F2/Android/data", bytes: gb(18), kind: "appdata", reveal: "shizuku", detail: "外置卡上的 Android/data，同样要 shell 或 root。" },
    ],
  },
  {
    id: "data",
    title: "/data",
    path: "/data",
    capacity: gb(256),
    free: gb(24.8),
    unlock: "root",
    note: "和内部存储同一块盘。媒体以「同一份」标出，不再当成多出来的空间。符号链接 /data/user/0 不进入。",
    backend: {
      app: "不可见",
      all: "不可见",
      shizuku: "仅当 Shizuku 以 root 启动",
      root: "su -mm + app_process",
    },
    children: [
      ...priv,
      {
        id: "dalvik",
        name: "dalvik-cache",
        path: "/data/dalvik-cache",
        bytes: gb(3.4),
        kind: "system",
        reveal: "root",
        detail: "优化后的代码缓存。",
      },
      {
        id: "overhead",
        name: "其余系统",
        path: "/data",
        bytes: gb(2.8),
        kind: "system",
        reveal: "root",
        detail: "app-staging、misc 以及扫不进树的零头。",
      },
      {
        id: "alias",
        name: "媒体（同一份）",
        path: "/data/media/0",
        bytes: gb(202.5),
        kind: "alias",
        reveal: "root",
        detail: "/data/media/0 是内部存储的后端。列出来是为了让 statfs 对得上，不是第二份占用。",
        children: aliasChildren,
      },
    ],
  },
  {
    id: "system",
    title: "/system",
    path: "/system",
    capacity: gb(8),
    free: gb(1.6),
    unlock: "root",
    note: "独立分区，不在 userdata 的 256 GB 里。",
    backend: {
      app: "不可见",
      all: "不可见",
      shizuku: "只读目录，shell 常常不够",
      root: "su -mm",
    },
    children: [
      { id: "sysapp", name: "app", path: "/system/app", bytes: gb(2.4), kind: "system", reveal: "root", detail: "系统应用。" },
      { id: "priv", name: "priv-app", path: "/system/priv-app", bytes: gb(1.8), kind: "system", reveal: "root", detail: "特权系统应用。" },
      { id: "fw", name: "framework", path: "/system/framework", bytes: gb(1.4), kind: "system", reveal: "root", detail: "framework-res 与 jar。" },
      { id: "fonts", name: "fonts 等", path: "/system/fonts", bytes: gb(0.8), kind: "system", reveal: "root", detail: "字体和其他只读文件。" },
    ],
  },
];

export type Row = Node & { zoomable: boolean };

export function project(volume: Volume, tier: Tier): { rows: Row[]; scanned: number; gap: number } {
  if (TIER_RANK[tier] < TIER_RANK[volume.unlock]) {
    return { rows: [], scanned: 0, gap: 0 };
  }
  const visible = volume.children.filter((n) => TIER_RANK[tier] >= TIER_RANK[n.reveal]);
  const scanned = visible.reduce((s, n) => s + n.bytes, 0);
  const used = volume.capacity - volume.free;
  const gap = Math.max(0, used - scanned);
  const rows: Row[] = visible.map((n) => ({ ...n, zoomable: (n.children?.length ?? 0) > 0 }));
  if (gap > G / 20) {
    rows.push({
      id: "gap",
      name: "系统数据",
      path: volume.path,
      bytes: gap,
      kind: "gap",
      reveal: tier,
      zoomable: false,
      detail:
        tier === "app"
          ? "没有存储权限，共享目录全部落进这一块。旧版看起来像系统占满了盘。"
          : tier === "all"
            ? "Android/data 和 Android/obb 被拒绝，再加上 /data/data。这就是「路径不全」之后的系统数据。"
            : "内部存储这条路径上，/data/data 本来就不在树里。打开 /data 才能拆开。",
    });
  }
  rows.push({
    id: "free",
    name: "空闲",
    path: volume.path,
    bytes: volume.free,
    kind: "free",
    reveal: tier,
    zoomable: false,
    detail: "statfs 的可用块。",
  });
  return { rows, scanned, gap };
}

export function bundle(nodes: Node[]): Row[] {
  const order: Kind[] = ["own", "media", "appdata", "obb", "private", "system", "alias"];
  const groups = new Map<Kind, Node[]>();
  for (const node of nodes) {
    const list = groups.get(node.kind) ?? [];
    list.push(node);
    groups.set(node.kind, list);
  }
  const rows: Row[] = [];
  for (const kind of order) {
    const list = groups.get(kind);
    if (!list?.length) continue;
    if (list.length === 1) {
      rows.push({ ...list[0], zoomable: (list[0].children?.length ?? 0) > 0 });
      continue;
    }
    const bytes = list.reduce((sum, node) => sum + node.bytes, 0);
    rows.push({
      id: `group-${kind}`,
      name: kindLabel(kind),
      path: list[0].path.replace(/\/[^/]+$/, "") || list[0].path,
      bytes,
      kind,
      reveal: list[0].reveal,
      zoomable: true,
      detail: list.map((node) => `${node.name} ${formatBytes(node.bytes)}`).join(" · "),
    });
  }
  return rows;
}

export function kindLabel(kind: Kind): string {
  switch (kind) {
    case "media": return "媒体";
    case "appdata": return "Android/data";
    case "obb": return "Android/obb";
    case "private": return "应用私有";
    case "system": return "系统";
    case "alias": return "同一份";
    case "own": return "本应用";
    case "gap": return "未列入";
    case "free": return "空闲";
  }
}

export function formatBytes(n: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let v = n;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  const digits = v >= 10 || i === 0 ? 0 : 1;
  return `${v.toFixed(digits)} ${units[i]}`;
}

export const OLD_MOUNTS = [
  "/storage/emulated/0",
  "/storage/self/primary",
  "/mnt/user/0/emulated/0",
  "/mnt/pass_through/0/emulated/0",
  "/mnt/androidwritable/0/emulated/0",
  "/data/media",
  "/data/user/0",
  "/data/data",
  "/apex/com.android.art",
  "/dev",
  "tmpfs × 14",
];

export function newMounts(tier: Tier): string[] {
  const base = ["/storage/emulated/0"];
  if (TIER_RANK[tier] >= TIER_RANK.all) base.push("/storage/9C33-18F2");
  if (tier === "root") base.push("/data", "/system", "/vendor", "/product");
  return base;
}
