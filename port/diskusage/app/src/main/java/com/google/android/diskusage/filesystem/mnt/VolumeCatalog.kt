package com.google.android.diskusage.filesystem.mnt

import android.content.Context
import android.os.Build
import android.os.Environment
import android.os.storage.StorageManager
import android.os.storage.StorageVolume
import com.google.android.diskusage.R
import com.google.android.diskusage.privilege.PrivilegeBroker
import java.io.File

/**
 * Volumes the old code missed.
 *
 * It asked for getExternalFilesDirs() and stripped
 * /Android/data/<package>/files. A volume with no app-private directory
 * yet (typical SD card, USB) never appeared. StorageManager knows those
 * volumes directly. With Shizuku or root, /mnt/media_rw and adoptable
 * /mnt/expand are added too.
 *
 * Bind mounts of the same bytes are dropped: /storage/self/primary,
 * /mnt/user/0/emulated/0, /mnt/pass_through, /mnt/androidwritable,
 * /data/media (the backing store of the emulated view).
 */
object VolumeCatalog {
    class Volume(
        val title: String,
        val path: String,
        val hasApps: Boolean,
        val rootRequired: Boolean,
    )

    @JvmStatic
    fun sharedVolumes(context: Context): List<Volume> {
        val found = LinkedHashMap<String, Volume>()
        val primary = Environment.getExternalStorageDirectory()?.absolutePath?.normalize()
        collectStorageManager(context, found, primary)
        collectAppDirs(context, found, primary)
        if (primary != null && !found.containsKey(primary)) {
            found[primary] = Volume(
                context.getString(R.string.storage_card),
                primary,
                true,
                false,
            )
        }
        collectPrivileged(context, found)
        return found.values.toList()
    }

    @JvmStatic
    fun rootedVolumes(context: Context): List<Volume> {
        val shared = sharedVolumes(context).map { it.path }.toSet()
        val text = PrivilegeBroker.readMountInfo(context)
        val out = LinkedHashMap<String, Volume>()
        for (raw in text.lineSequence()) {
            val parsed = parseMount(raw) ?: continue
            val path = parsed.mount.normalize()
            val fs = parsed.fs
            if (!interestingFs(fs, path)) continue
            if (isNoise(path)) continue
            if (isDuplicateOfShared(path, shared)) continue
            if (path == "/data/media" || path.startsWith("/data/media/")) continue
            if (path == "/data/user" || path.startsWith("/data/user/")) continue
            if (out.containsKey(path)) continue
            out[path] = Volume(path, path, false, true)
        }
        // Always offer /data when we are allowed to ask for root, even if the
        // app mount namespace hid the line. The scan itself uses su -mm.
        if (!out.containsKey("/data")) {
            out["/data"] = Volume("/data", "/data", false, true)
        }
        return out.values.toList()
    }

    private fun collectStorageManager(context: Context, found: MutableMap<String, Volume>, primary: String?) {
        val sm = context.getSystemService(StorageManager::class.java) ?: return
        val volumes: List<StorageVolume> = if (Build.VERSION.SDK_INT < 24) {
            emptyList()
        } else {
            try {
                sm.storageVolumes
            } catch (_: Throwable) {
                emptyList()
            }
        }
        for (volume in volumes) {
            val dir = volumeDirectory(volume)?.normalize() ?: continue
            if (isNoise(dir) || isDuplicateOfShared(dir, emptySet())) continue
            val removable = try {
                volume.isRemovable
            } catch (_: Throwable) {
                dir != primary
            }
            val title = when {
                !removable || dir == primary -> context.getString(R.string.storage_card)
                volume.getDescription(context).isNullOrBlank() -> dir
                else -> volume.getDescription(context)
            }
            found.putIfAbsent(dir, Volume(title, dir, !removable, false))
        }
    }

    private fun collectAppDirs(context: Context, found: MutableMap<String, Volume>, primary: String?) {
        val dirs = context.getExternalFilesDirs(null) ?: return
        val marker = "/Android/data/${context.packageName}/files"
        for (dir in dirs) {
            if (dir == null) continue
            val absolute = dir.absolutePath
            val root = if (absolute.contains(marker)) {
                absolute.substring(0, absolute.indexOf(marker))
            } else absolute
            val path = root.normalize()
            if (path.isEmpty() || isNoise(path)) continue
            val internal = path == primary || path.startsWith("/storage/emulated/")
            found.putIfAbsent(
                path,
                Volume(if (internal) context.getString(R.string.storage_card) else path, path, internal, false),
            )
        }
    }

    private fun collectPrivileged(context: Context, found: MutableMap<String, Volume>) {
        if (!com.google.android.diskusage.privilege.ShizukuScan.isGranted()
            && !com.google.android.diskusage.privilege.SuShell.isReady()
        ) return
        val text = PrivilegeBroker.readMountInfo(context)
        val known = found.keys.toSet()
        for (raw in text.lineSequence()) {
            val parsed = parseMount(raw) ?: continue
            val path = parsed.mount.normalize()
            if (!path.startsWith("/mnt/media_rw/") && !path.startsWith("/mnt/expand/")) continue
            if (isDuplicateOfShared(path, known)) continue
            val title = if (path.startsWith("/mnt/expand/")) "Adoptable $path" else "SD $path"
            found.putIfAbsent(path, Volume(title, path, false, false))
        }
    }

    private fun volumeDirectory(volume: StorageVolume): String? {
        if (Build.VERSION.SDK_INT >= 30) {
            try {
                volume.directory?.absolutePath?.let { return it }
            } catch (_: Throwable) {
            }
        }
        return try {
            val method = volume.javaClass.getMethod("getPath")
            method.invoke(volume) as? String
        } catch (_: Throwable) {
            try {
                val method = volume.javaClass.getMethod("getDirectory")
                val file = method.invoke(volume) as? File
                file?.absolutePath
            } catch (_: Throwable) {
                null
            }
        }
    }

    private data class Mount(val mount: String, val fs: String)

    private fun parseMount(line: String): Mount? {
        val trimmed = line.trim()
        if (trimmed.isEmpty() || trimmed.startsWith("#")) return null
        val sep = trimmed.indexOf(" - ")
        if (sep > 0) {
            val left = trimmed.substring(0, sep)
            val right = trimmed.substring(sep + 3)
            val mount = unescape(mountPointFromMountInfo(left)) ?: return null
            val fs = right.substringBefore(' ')
            return Mount(mount, fs)
        }
        val parts = trimmed.split(Regex(" +"))
        if (parts.size < 3) return null
        return Mount(unescape(parts[1]) ?: return null, parts[2])
    }

    /** mountinfo: id parent major:minor root mountpoint options ... */
    private fun mountPointFromMountInfo(left: String): String? {
        val parts = left.split(' ')
        if (parts.size < 5) return null
        return parts[4]
    }

    private fun unescape(value: String?): String? {
        if (value == null) return null
        if (!value.contains('\\')) return value
        val out = StringBuilder()
        var i = 0
        while (i < value.length) {
            if (value[i] == '\\' && i + 3 < value.length) {
                val oct = value.substring(i + 1, i + 4)
                val code = oct.toIntOrNull(8)
                if (code != null) {
                    out.append(code.toChar())
                    i += 4
                    continue
                }
            }
            out.append(value[i])
            i++
        }
        return out.toString()
    }

    private fun interestingFs(fs: String, path: String): Boolean {
        val skip = setOf(
            "proc", "sysfs", "tmpfs", "devtmpfs", "devpts", "cgroup", "cgroup2",
            "pstore", "debugfs", "tracefs", "bpf", "securityfs", "selinuxfs",
            "configfs", "functionfs", "fusectl", "binder", "binfmt_misc", "nsfs",
            "none", "ramfs", "rootfs", "efivarfs", "overlay",
        )
        if (fs in skip) return false
        if (fs.startsWith("fuse.") && !path.startsWith("/storage") && !path.startsWith("/mnt/media_rw")) {
            return false
        }
        return true
    }

    private fun isNoise(path: String): Boolean {
        val prefixes = listOf(
            "/dev", "/sys", "/proc", "/apex", "/acct", "/config", "/linkerconfig",
            "/mnt/secure", "/mnt/installer", "/mnt/runtime", "/mnt/user",
            "/mnt/pass_through", "/mnt/androidwritable", "/mnt/asec",
            "/storage/self", "/debug_ramdisk", "/system/bin", "/system/lib",
        )
        if (path == "/" || path == "/mnt" || path == "/mnt/sdcard/.android_secure") return true
        return prefixes.any { path == it || path.startsWith("$it/") }
    }

    private fun isDuplicateOfShared(path: String, shared: Set<String>): Boolean {
        if (path in shared) return true
        if (path == "/sdcard" || path == "/storage/self/primary" || path == "/mnt/sdcard") return true
        if (path.startsWith("/mnt/user/") || path.startsWith("/mnt/pass_through/")
            || path.startsWith("/mnt/androidwritable/") || path.startsWith("/mnt/runtime/")
        ) return true
        return false
    }

    private fun String.normalize(): String {
        if (this.length > 1 && this.endsWith("/")) return this.dropLast(1)
        return this
    }
}
