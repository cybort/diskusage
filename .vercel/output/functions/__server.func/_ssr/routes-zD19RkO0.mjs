import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as ChevronRight, i as Download, n as Lock, o as ChevronLeft, r as HardDrive } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-zD19RkO0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var G = 1024 ** 3;
var gb = (n) => Math.round(n * G);
var TIER_RANK = {
	app: 0,
	all: 1,
	shizuku: 2,
	root: 3
};
var TIERS = [
	{
		id: "app",
		label: "仅应用",
		hint: "没开存储权限"
	},
	{
		id: "all",
		label: "所有文件",
		hint: "Android 13+ 仍看不见 data"
	},
	{
		id: "shizuku",
		label: "Shizuku",
		hint: "shell，列 Android/data"
	},
	{
		id: "root",
		label: "Magisk",
		hint: "su -mm，读 /data"
	}
];
var media = [
	{
		id: "dcim",
		name: "DCIM",
		path: "/storage/emulated/0/DCIM",
		bytes: gb(18.4),
		kind: "media",
		reveal: "all",
		detail: "相机目录。所有文件权限即可。"
	},
	{
		id: "pic",
		name: "Pictures",
		path: "/storage/emulated/0/Pictures",
		bytes: gb(4.2),
		kind: "media",
		reveal: "all",
		detail: "相册。"
	},
	{
		id: "mov",
		name: "Movies",
		path: "/storage/emulated/0/Movies",
		bytes: gb(22.1),
		kind: "media",
		reveal: "all",
		detail: "本地视频。"
	},
	{
		id: "dl",
		name: "Download",
		path: "/storage/emulated/0/Download",
		bytes: gb(9.6),
		kind: "media",
		reveal: "all",
		detail: "下载。"
	},
	{
		id: "music",
		name: "Music",
		path: "/storage/emulated/0/Music",
		bytes: gb(3.1),
		kind: "media",
		reveal: "all",
		detail: "音乐。"
	},
	{
		id: "doc",
		name: "Documents",
		path: "/storage/emulated/0/Documents",
		bytes: gb(1.4),
		kind: "media",
		reveal: "all",
		detail: "文档。"
	},
	{
		id: "pod",
		name: "Podcasts",
		path: "/storage/emulated/0/Podcasts",
		bytes: gb(.6),
		kind: "media",
		reveal: "all",
		detail: "播客。"
	},
	{
		id: "misc",
		name: "其他媒体",
		path: "/storage/emulated/0",
		bytes: gb(2.2),
		kind: "media",
		reveal: "all",
		detail: "铃声、闹钟和零散目录。"
	}
];
var appdata = [
	{
		id: "wx",
		name: "微信",
		path: "/storage/emulated/0/Android/data/com.tencent.mm",
		bytes: gb(28.6),
		kind: "appdata",
		reveal: "shizuku",
		detail: "Android/data。API 33 起所有文件权限也列不出，要 Shizuku 的 shell 或 root。"
	},
	{
		id: "ys",
		name: "原神",
		path: "/storage/emulated/0/Android/data/com.miHoYo.Yuanshen",
		bytes: gb(41.2),
		kind: "appdata",
		reveal: "shizuku",
		detail: "游戏数据在 Android/data，不在 DCIM。"
	},
	{
		id: "tg",
		name: "Telegram",
		path: "/storage/emulated/0/Android/data/org.telegram.messenger",
		bytes: gb(11.4),
		kind: "appdata",
		reveal: "shizuku",
		detail: "Android/data。"
	},
	{
		id: "cr",
		name: "Chrome",
		path: "/storage/emulated/0/Android/data/com.android.chrome",
		bytes: gb(6.1),
		kind: "appdata",
		reveal: "shizuku",
		detail: "Android/data。"
	},
	{
		id: "yt",
		name: "YouTube",
		path: "/storage/emulated/0/Android/data/com.google.android.youtube",
		bytes: gb(8.7),
		kind: "appdata",
		reveal: "shizuku",
		detail: "Android/data。"
	},
	{
		id: "bili",
		name: "哔哩哔哩",
		path: "/storage/emulated/0/Android/data/tv.danmaku.bili",
		bytes: gb(9.3),
		kind: "appdata",
		reveal: "shizuku",
		detail: "Android/data。"
	},
	{
		id: "rest",
		name: "其他应用数据",
		path: "/storage/emulated/0/Android/data",
		bytes: gb(14.8),
		kind: "appdata",
		reveal: "shizuku",
		detail: "其余 Android/data 子目录。"
	}
];
var obb = [{
	id: "yso",
	name: "原神 obb",
	path: "/storage/emulated/0/Android/obb/com.miHoYo.Yuanshen",
	bytes: gb(12.6),
	kind: "obb",
	reveal: "shizuku",
	detail: "Android/obb，和 data 一样从 Android 13 起对普通应用关闭。"
}, {
	id: "cod",
	name: "使命召唤 obb",
	path: "/storage/emulated/0/Android/obb/com.activision.callofduty.shooter",
	bytes: gb(8.2),
	kind: "obb",
	reveal: "shizuku",
	detail: "Android/obb。"
}];
var own = {
	id: "own",
	name: "本应用目录",
	path: "/storage/emulated/0/Android/data/com.google.android.diskusage/files",
	bytes: gb(.04),
	kind: "own",
	reveal: "app",
	detail: "不授权时，getExternalFilesDirs 只能看见自己。旧代码靠剪掉这段路径来猜卷，所以没建过目录的 SD 卡会整卷消失。"
};
var priv = [
	{
		id: "pwx",
		name: "微信 私有",
		path: "/data/data/com.tencent.mm",
		bytes: gb(4.8),
		kind: "private",
		reveal: "root",
		detail: "数据库在 /data/data，不在模拟存储里。Magisk 不用 -mm 时这个目录是空的。"
	},
	{
		id: "pmedia",
		name: "媒体提供者",
		path: "/data/data/com.android.providers.media",
		bytes: gb(3.4),
		kind: "private",
		reveal: "root",
		detail: "缩略图索引。"
	},
	{
		id: "pchrome",
		name: "Chrome 私有",
		path: "/data/data/com.android.chrome",
		bytes: gb(1.6),
		kind: "private",
		reveal: "root",
		detail: "/data/data。"
	},
	{
		id: "pys",
		name: "原神 私有",
		path: "/data/data/com.miHoYo.Yuanshen",
		bytes: gb(2.2),
		kind: "private",
		reveal: "root",
		detail: "/data/data。"
	},
	{
		id: "psysui",
		name: "系统界面",
		path: "/data/data/com.android.systemui",
		bytes: gb(1.1),
		kind: "private",
		reveal: "root",
		detail: "/data/data。"
	},
	{
		id: "ptg",
		name: "Telegram 私有",
		path: "/data/data/org.telegram.messenger",
		bytes: gb(.9),
		kind: "private",
		reveal: "root",
		detail: "/data/data。"
	},
	{
		id: "prest",
		name: "其他应用私有",
		path: "/data/data",
		bytes: gb(8.5),
		kind: "private",
		reveal: "root",
		detail: "其余 /data/data。/data/user/0 是指向这里的符号链接，扫描不跟随，避免算两遍。"
	}
];
var aliasChildren = [
	...media,
	...appdata,
	...obb
].map((n) => ({
	...n,
	id: `alias-${n.id}`,
	reveal: "root",
	kind: "alias",
	detail: `${n.detail} 这是 /data/media/0 的实体，和内部存储是同一份，不是第二份占用。`
}));
var VOLUMES = [
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
			root: "Shizuku；没有则 su -mm"
		},
		children: [
			own,
			...media,
			...appdata,
			...obb
		]
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
			root: "su -mm 或 Shizuku"
		},
		children: [
			{
				id: "sd-dcim",
				name: "DCIM",
				path: "/storage/9C33-18F2/DCIM",
				bytes: gb(40),
				kind: "media",
				reveal: "all",
				detail: "SD 上的相机目录。"
			},
			{
				id: "sd-dl",
				name: "Download",
				path: "/storage/9C33-18F2/Download",
				bytes: gb(6),
				kind: "media",
				reveal: "all",
				detail: "SD 上的下载。"
			},
			{
				id: "sd-data",
				name: "Android/data",
				path: "/storage/9C33-18F2/Android/data",
				bytes: gb(18),
				kind: "appdata",
				reveal: "shizuku",
				detail: "外置卡上的 Android/data，同样要 shell 或 root。"
			}
		]
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
			root: "su -mm + app_process"
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
				detail: "优化后的代码缓存。"
			},
			{
				id: "overhead",
				name: "其余系统",
				path: "/data",
				bytes: gb(2.8),
				kind: "system",
				reveal: "root",
				detail: "app-staging、misc 以及扫不进树的零头。"
			},
			{
				id: "alias",
				name: "媒体（同一份）",
				path: "/data/media/0",
				bytes: gb(202.5),
				kind: "alias",
				reveal: "root",
				detail: "/data/media/0 是内部存储的后端。列出来是为了让 statfs 对得上，不是第二份占用。",
				children: aliasChildren
			}
		]
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
			root: "su -mm"
		},
		children: [
			{
				id: "sysapp",
				name: "app",
				path: "/system/app",
				bytes: gb(2.4),
				kind: "system",
				reveal: "root",
				detail: "系统应用。"
			},
			{
				id: "priv",
				name: "priv-app",
				path: "/system/priv-app",
				bytes: gb(1.8),
				kind: "system",
				reveal: "root",
				detail: "特权系统应用。"
			},
			{
				id: "fw",
				name: "framework",
				path: "/system/framework",
				bytes: gb(1.4),
				kind: "system",
				reveal: "root",
				detail: "framework-res 与 jar。"
			},
			{
				id: "fonts",
				name: "fonts 等",
				path: "/system/fonts",
				bytes: gb(.8),
				kind: "system",
				reveal: "root",
				detail: "字体和其他只读文件。"
			}
		]
	}
];
function project(volume, tier) {
	if (TIER_RANK[tier] < TIER_RANK[volume.unlock]) return {
		rows: [],
		scanned: 0,
		gap: 0
	};
	const visible = volume.children.filter((n) => TIER_RANK[tier] >= TIER_RANK[n.reveal]);
	const scanned = visible.reduce((s, n) => s + n.bytes, 0);
	const used = volume.capacity - volume.free;
	const gap = Math.max(0, used - scanned);
	const rows = visible.map((n) => ({
		...n,
		zoomable: (n.children?.length ?? 0) > 0
	}));
	if (gap > G / 20) rows.push({
		id: "gap",
		name: "系统数据",
		path: volume.path,
		bytes: gap,
		kind: "gap",
		reveal: tier,
		zoomable: false,
		detail: tier === "app" ? "没有存储权限，共享目录全部落进这一块。旧版看起来像系统占满了盘。" : tier === "all" ? "Android/data 和 Android/obb 被拒绝，再加上 /data/data。这就是「路径不全」之后的系统数据。" : "内部存储这条路径上，/data/data 本来就不在树里。打开 /data 才能拆开。"
	});
	rows.push({
		id: "free",
		name: "空闲",
		path: volume.path,
		bytes: volume.free,
		kind: "free",
		reveal: tier,
		zoomable: false,
		detail: "statfs 的可用块。"
	});
	return {
		rows,
		scanned,
		gap
	};
}
function bundle(nodes) {
	const order = [
		"own",
		"media",
		"appdata",
		"obb",
		"private",
		"system",
		"alias"
	];
	const groups = /* @__PURE__ */ new Map();
	for (const node of nodes) {
		const list = groups.get(node.kind) ?? [];
		list.push(node);
		groups.set(node.kind, list);
	}
	const rows = [];
	for (const kind of order) {
		const list = groups.get(kind);
		if (!list?.length) continue;
		if (list.length === 1) {
			rows.push({
				...list[0],
				zoomable: (list[0].children?.length ?? 0) > 0
			});
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
			detail: list.map((node) => `${node.name} ${formatBytes(node.bytes)}`).join(" · ")
		});
	}
	return rows;
}
function kindLabel(kind) {
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
function formatBytes(n) {
	const units = [
		"B",
		"KB",
		"MB",
		"GB",
		"TB"
	];
	let v = n;
	let i = 0;
	while (v >= 1024 && i < units.length - 1) {
		v /= 1024;
		i += 1;
	}
	const digits = v >= 10 || i === 0 ? 0 : 1;
	return `${v.toFixed(digits)} ${units[i]}`;
}
var OLD_MOUNTS = [
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
	"tmpfs × 14"
];
function newMounts(tier) {
	const base = ["/storage/emulated/0"];
	if (TIER_RANK[tier] >= TIER_RANK.all) base.push("/storage/9C33-18F2");
	if (tier === "root") base.push("/data", "/system", "/vendor", "/product");
	return base;
}
/** Squarified treemap. Large entries stay close to square instead of becoming strips. */
function treemap(weights, width, height) {
	const total = weights.reduce((sum, n) => sum + n, 0);
	if (total <= 0 || width < 1 || height < 1) return [];
	const items = weights.map((bytes, index) => ({
		index,
		area: bytes / total * width * height
	})).filter((item) => item.area > 0).sort((a, b) => b.area - a.area);
	const out = [];
	squarify(items, {
		x: 0,
		y: 0,
		w: width,
		h: height
	}, out);
	return out;
}
function squarify(items, box, out) {
	if (items.length === 0 || box.w < 1 || box.h < 1) return;
	if (items.length === 1) {
		out.push({
			x: box.x,
			y: box.y,
			w: box.w,
			h: box.h,
			index: items[0].index
		});
		return;
	}
	const vertical = box.w < box.h;
	const side = vertical ? box.h : box.w;
	const row = [];
	let rest = items;
	while (rest.length > 0) {
		const next = rest[0];
		if (row.length === 0 || worst(row, side) >= worst([...row, next], side)) {
			row.push(next);
			rest = rest.slice(1);
		} else break;
	}
	const thickness = row.reduce((sum, item) => sum + item.area, 0) / side;
	let cursor = vertical ? box.y : box.x;
	for (const item of row) {
		const extent = item.area / thickness;
		if (vertical) out.push({
			x: box.x,
			y: cursor,
			w: thickness,
			h: extent,
			index: item.index
		});
		else out.push({
			x: cursor,
			y: box.y,
			w: extent,
			h: thickness,
			index: item.index
		});
		cursor += extent;
	}
	if (vertical) squarify(rest, {
		x: box.x + thickness,
		y: box.y,
		w: box.w - thickness,
		h: box.h
	}, out);
	else squarify(rest, {
		x: box.x,
		y: box.y + thickness,
		w: box.w,
		h: box.h - thickness
	}, out);
}
function worst(row, side) {
	const sum = row.reduce((total, item) => total + item.area, 0);
	let max = 0;
	let min = Number.POSITIVE_INFINITY;
	for (const item of row) {
		if (item.area > max) max = item.area;
		if (item.area < min) min = item.area;
	}
	const side2 = side * side;
	const sum2 = sum * sum;
	return Math.max(side2 * max / sum2, sum2 / (side2 * min));
}
var KIND_BG = {
	media: "bg-media",
	appdata: "bg-apps",
	obb: "bg-obb",
	private: "bg-down",
	system: "bg-sys",
	alias: "bg-surface-2",
	own: "bg-accent",
	gap: "gap-hatch",
	free: "bg-free"
};
var KIND_INK = {
	media: "text-accent-ink",
	appdata: "text-accent-ink",
	obb: "text-accent-ink",
	private: "text-accent-ink",
	system: "text-bg",
	alias: "text-fg",
	own: "text-accent-ink",
	gap: "text-bg",
	free: "text-muted"
};
function useMatch(query) {
	const [matches, setMatches] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const mq = window.matchMedia(query);
		const apply = () => setMatches(mq.matches);
		apply();
		mq.addEventListener("change", apply);
		return () => mq.removeEventListener("change", apply);
	}, [query]);
	return matches;
}
function blocksForTouch(rows, fold) {
	if (!fold) return rows;
	const pinned = rows.filter((row) => row.kind === "gap" || row.kind === "free");
	const content = rows.filter((row) => row.kind !== "gap" && row.kind !== "free");
	const total = content.reduce((sum, row) => sum + row.bytes, 0) || 1;
	const big = [];
	const small = [];
	for (const row of [...content].sort((a, b) => b.bytes - a.bytes)) {
		const share = row.bytes / total;
		if (big.length < 5 && (share >= .08 || big.length < 3 && share >= .045)) big.push(row);
		else small.push(row);
	}
	if (small.length === 0) return rows;
	if (small.length === 1) return [...big, ...pinned];
	const rest = {
		id: "__rest",
		name: `其余 ${small.length} 项`,
		path: "",
		bytes: small.reduce((sum, row) => sum + row.bytes, 0),
		kind: "system",
		reveal: "app",
		zoomable: false,
		detail: small.map((row) => row.name).join("、")
	};
	return [
		...big,
		rest,
		...pinned
	];
}
function UsageMap() {
	const [tier, setTier] = (0, import_react.useState)("all");
	const [volumeId, setVolumeId] = (0, import_react.useState)("internal");
	const [zoom, setZoom] = (0, import_react.useState)(null);
	const [selected, setSelected] = (0, import_react.useState)(null);
	const compact = useMatch("(max-width: 1023px)");
	const coarse = useMatch("(pointer: coarse)");
	(0, import_react.useEffect)(() => {
		const saved = localStorage.getItem("du-tier");
		if (saved === "app" || saved === "all" || saved === "shizuku" || saved === "root") setTier(saved);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!selected || !compact) return;
		document.getElementById(`entry-${selected}`)?.scrollIntoView({ block: "nearest" });
	}, [selected, compact]);
	function pickTier(next) {
		setTier(next);
		setZoom(null);
		setSelected(null);
		localStorage.setItem("du-tier", next);
		const current = VOLUMES.find((v) => v.id === volumeId);
		if (current && TIER_RANK[next] < TIER_RANK[current.unlock]) setVolumeId("internal");
	}
	function enter(id) {
		setZoom(id);
		setSelected(null);
	}
	function leave() {
		setZoom(null);
		setSelected(null);
	}
	const volume = VOLUMES.find((v) => v.id === volumeId) ?? VOLUMES[0];
	const locked = TIER_RANK[tier] < TIER_RANK[volume.unlock];
	const projected = (0, import_react.useMemo)(() => project(volume, tier), [volume, tier]);
	const grouped = (0, import_react.useMemo)(() => {
		if (TIER_RANK[tier] < TIER_RANK[volume.unlock]) return [];
		return bundle(volume.children.filter((node) => TIER_RANK[tier] >= TIER_RANK[node.reveal]));
	}, [volume, tier]);
	const zoomGroup = zoom?.startsWith("group-") ? grouped.find((row) => row.id === zoom) : void 0;
	const zoomNode = !zoomGroup && zoom ? volume.children.find((node) => node.id === zoom) : void 0;
	const rows = zoomGroup ? volume.children.filter((node) => node.kind === zoomGroup.kind && TIER_RANK[tier] >= TIER_RANK[node.reveal]).map((node) => ({
		...node,
		zoomable: (node.children?.length ?? 0) > 0
	})) : zoomNode?.children ? zoomNode.children.map((node) => ({
		...node,
		zoomable: false
	})) : [...grouped, ...projected.rows.filter((row) => row.kind === "gap" || row.kind === "free")];
	const used = volume.capacity - volume.free;
	const hint = TIERS.find((item) => item.id === tier)?.hint;
	const listed = [...rows].sort((a, b) => b.bytes - a.bytes);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "shell",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs tracking-widest text-muted uppercase",
							children: "DiskUsage 5.1"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-1 text-2xl font-semibold tracking-tight sm:text-3xl",
							children: "磁盘里少掉的那一段"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: "Android 16 样机，256 GB userdata。换授权，看哪些目录从「系统数据」里拆出来。"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: "/downloads/diskusage-v5.1.0-debug.apk",
					download: "diskusage-v5.1.0-debug.apk",
					className: "inline-flex h-12 shrink-0 items-center gap-2 rounded-card bg-accent px-3 text-sm font-medium text-accent-ink sm:px-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
							className: "size-4",
							"aria-hidden": true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden sm:inline",
							children: "下载 APK"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "sm:hidden",
							children: "APK"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-4 gap-2",
				children: TIERS.map((item) => {
					const on = item.id === tier;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"aria-pressed": on,
						onClick: () => pickTier(item.id),
						className: `tier-btn min-h-12 min-w-0 rounded-card border px-1 text-center text-sm font-medium sm:px-3 sm:py-2 sm:text-left ${on ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface text-fg"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block leading-tight",
							children: item.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `mt-1 hidden text-xs sm:block ${on ? "text-accent-ink/80" : "text-muted"}`,
							children: item.hint
						})]
					}, item.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted sm:hidden",
				children: hint
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
				children: VOLUMES.map((item) => {
					const open = TIER_RANK[tier] >= TIER_RANK[item.unlock];
					const on = item.id === volume.id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"aria-pressed": on,
						onClick: () => {
							setVolumeId(item.id);
							setZoom(null);
							setSelected(null);
						},
						className: `vol-btn inline-flex min-h-12 min-w-0 items-center justify-start gap-2 rounded-card border px-3 text-sm ${on ? "border-accent bg-surface-2 text-fg" : "border-line text-muted"}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HardDrive, {
								className: "size-4 shrink-0",
								"aria-hidden": true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate",
								children: item.title
							}),
							!open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, {
								className: "size-3.5 shrink-0",
								"aria-hidden": true
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "sr-only",
								children: "锁定"
							})] })
						]
					}, item.id);
				})
			}),
			locked ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-card border border-line bg-surface p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "text-lg font-medium",
						children: [volume.path, " 还打不开"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: volume.note
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-mono text-sm text-warn",
						children: volume.backend[tier]
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-3 flex flex-wrap items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex min-w-0 items-center gap-1 text-sm",
								children: [zoom ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "crumb-back",
									onClick: leave,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {
										className: "size-4",
										"aria-hidden": true
									}), "返回"]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: volume.title
								}), zoom && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
									className: "size-4 shrink-0 text-muted",
									"aria-hidden": true
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate font-medium",
									children: zoomGroup?.name ?? zoomNode?.name
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-mono text-sm text-muted",
								children: [
									"已列入 ",
									formatBytes(zoomNode ? zoomNode.bytes : zoomGroup ? zoomGroup.bytes : projected.scanned),
									!zoom && projected.gap > 0 && ` · 系统数据 ${formatBytes(projected.gap)}`,
									` · ${volume.backend[tier]}`
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map$1, {
							rows,
							fold: compact,
							coarse,
							selected,
							onSelect: setSelected,
							onZoom: enter
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { rows }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "entry-list",
							id: "dir-list",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { children: ["目录 · ", rows.length] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: listed.map((row) => {
								const on = selected === row.id;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									id: `entry-${row.id}`,
									className: on ? "entry is-on" : "entry",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "entry-main",
											"aria-pressed": on,
											onClick: () => setSelected(row.id),
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: `entry-swatch ${KIND_BG[row.kind]}`,
													"aria-hidden": true
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "entry-text",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "entry-name truncate",
														children: row.name
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "entry-kind",
														children: kindLabel(row.kind)
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "entry-size",
													children: formatBytes(row.bytes)
												})
											]
										}),
										row.zoomable ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "entry-go",
											"aria-label": `进入 ${row.name}`,
											onClick: () => enter(row.id),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
												className: "size-5",
												"aria-hidden": true
											})
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "entry-go invisible",
											"aria-hidden": true
										}),
										on && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "entry-detail",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: row.detail }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "entry-path",
													children: row.path
												}),
												row.zoomable && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													type: "button",
													className: "entry-enter",
													onClick: () => enter(row.id),
													children: ["进入", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
														className: "size-4",
														"aria-hidden": true
													})]
												})
											]
										})
									]
								}, row.id);
							}) })]
						}),
						zoom && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "back-wide",
							onClick: leave,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {
									className: "size-4",
									"aria-hidden": true
								}),
								"返回",
								volume.title
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Detail, {
					volume,
					tier,
					rows,
					selectedId: selected,
					scanned: projected.scanned,
					gap: projected.gap,
					used,
					zoomed: Boolean(zoom),
					onZoom: enter,
					onBack: leave
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-4 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MountList, {
					title: "改之前，root 之后的列表",
					paths: OLD_MOUNTS,
					tone: "warn"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MountList, {
					title: "现在这个授权能看到的卷",
					paths: newMounts(tier),
					tone: "ok"
				})]
			})
		]
	});
}
function Legend({ rows }) {
	const kinds = [];
	for (const row of rows) if (!kinds.includes(row.kind)) kinds.push(row.kind);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "legend",
		"aria-label": "图例",
		children: kinds.map((kind) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: `legend-swatch ${KIND_BG[kind]}`,
			"aria-hidden": true
		}), kindLabel(kind)] }, kind))
	});
}
function Map$1({ rows, fold, coarse, selected, onSelect, onZoom }) {
	const frame = (0, import_react.useRef)(null);
	const [box, setBox] = (0, import_react.useState)({
		w: 640,
		h: 480
	});
	(0, import_react.useEffect)(() => {
		const el = frame.current;
		if (!el) return;
		const measure = () => setBox({
			w: el.clientWidth,
			h: el.clientHeight
		});
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);
	const display = (0, import_react.useMemo)(() => blocksForTouch(rows, fold), [rows, fold]);
	const layout = (0, import_react.useMemo)(() => treemap(display.map((row) => row.bytes), box.w, box.h), [
		display,
		box.w,
		box.h
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: frame,
		className: "treemap-frame relative overflow-hidden rounded-card border border-line bg-bg",
		children: layout.map((rect) => {
			const row = display[rect.index];
			const pad = 4;
			const w = Math.max(0, rect.w - pad);
			const h = Math.max(0, rect.h - pad);
			if (w < 1 || h < 1) return null;
			const rest = row.id === "__rest";
			const showName = w >= 52 && h >= 26;
			const showSize = w >= 64 && h >= 44;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": rest ? `${row.name}：${row.detail}。到下面的目录里查看` : `${row.name}，${formatBytes(row.bytes)}${row.zoomable ? "，可进入" : ""}`,
				onClick: () => {
					if (rest) {
						document.getElementById("dir-list")?.scrollIntoView({
							behavior: "smooth",
							block: "start"
						});
						return;
					}
					if (row.zoomable && (!coarse || selected === row.id)) {
						onZoom(row.id);
						return;
					}
					onSelect(row.id);
				},
				className: `tile absolute overflow-hidden rounded-sm text-left ${rest ? "bg-surface-2 text-fg" : `${KIND_BG[row.kind]} ${KIND_INK[row.kind]}`} ${selected === row.id ? "is-on" : ""}`,
				style: {
					left: rect.x,
					top: rect.y,
					width: w,
					height: h
				},
				children: showName && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "block px-1.5 py-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block truncate text-sm font-medium",
						children: row.name
					}), showSize && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block font-mono text-xs opacity-80",
						children: formatBytes(row.bytes)
					})]
				})
			}, row.id);
		})
	});
}
function Detail({ volume, tier, rows, selectedId, scanned, gap, used, zoomed, onZoom, onBack }) {
	const row = rows.find((item) => item.id === selectedId) ?? rows[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "hidden flex-col gap-3 rounded-card border border-line bg-surface p-4 lg:flex",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-xs text-muted",
				children: volume.path
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-lg font-medium",
				children: row?.name ?? volume.title
			}),
			row && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-sm",
					children: formatBytes(row.bytes)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: kindLabel(row.kind)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-fg",
					children: row.detail
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "break-all font-mono text-xs text-muted",
					children: row.path
				}),
				row.zoomable && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => onZoom(row.id),
					className: "inline-flex h-12 items-center justify-center gap-1 rounded-card bg-accent text-sm font-medium text-accent-ink",
					children: ["进入", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
						className: "size-4",
						"aria-hidden": true
					})]
				})
			] }),
			zoomed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: onBack,
				className: "inline-flex h-12 items-center justify-center gap-1 rounded-card border border-line text-sm font-medium",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {
					className: "size-4",
					"aria-hidden": true
				}), "返回上一级"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 border-t border-line pt-3 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["已用 ", formatBytes(used)] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-muted",
						children: ["列入 ", formatBytes(scanned)]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: gap > 0 ? "text-warn" : "text-muted",
						children: ["未列入 ", formatBytes(gap)]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: volume.note
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "font-mono text-xs text-muted",
				children: [
					TIERS.find((item) => item.id === tier)?.label,
					" · ",
					volume.backend[tier]
				]
			})
		]
	});
}
function MountList({ title, paths, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "min-w-0 rounded-card border border-line bg-surface p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-medium",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 flex flex-col",
				children: paths.map((path) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "mount-path py-1.5 font-mono text-sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: tone === "warn" && path !== "/storage/emulated/0" ? "text-warn" : "text-fg",
						children: path
					})
				}, path))
			}),
			tone === "warn" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: "橙色是同一份数据的 bind，或根本不该拿来扫的伪文件系统。SD 卡不在里面。"
			}),
			tone === "ok" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: "SD 从「所有文件」起出现。/data 只在 Magisk 这一档，并且不再带 /data/user/0。"
			})
		]
	});
}
var SplitComponent = UsageMap;
//#endregion
export { SplitComponent as component };
