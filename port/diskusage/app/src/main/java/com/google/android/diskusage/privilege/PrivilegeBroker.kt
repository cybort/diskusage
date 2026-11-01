package com.google.android.diskusage.privilege

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import com.google.android.diskusage.utils.AppHelper
import java.io.File
import java.io.InputStream

/**
 * Picks a scanner that can actually see the path.
 *
 * App / all-files: in-process JNI. Fast, but on API 33+ the directory entries
 * of Android/data and Android/obb are EACCES and collapse into "System data".
 * Shizuku: user service, shell uid, same JNI. Lists those directories.
 * Magisk / KernelSU / APatch: {@code su -mm} + app_process. Global mount
 * namespace, so /data/data is the real one and /data/user/0 is only a symlink.
 */
object PrivilegeBroker {
    const val REQUEST_CODE = 42

    enum class Tier { APP, SHIZUKU, ROOT }

    @JvmStatic
    fun shouldOfferRoot(context: Context): Boolean =
        SuShell.isReady() || SuShell.hasManager(context) || ShizukuScan.isRootMode()

    @JvmStatic
    fun shouldOfferShizuku(context: Context): Boolean =
        ShizukuScan.isInstalled(context) || ShizukuScan.isRunning()

    @JvmStatic
    fun statusLabel(context: Context): String {
        val shizuku = when {
            ShizukuScan.isRootMode() -> "Shizuku · root"
            ShizukuScan.isGranted() -> "Shizuku · shell"
            ShizukuScan.isRunning() -> "Shizuku · 未授权"
            ShizukuScan.isInstalled(context) -> "Shizuku · 未启动"
            else -> "Shizuku · 未安装"
        }
        val root = when {
            SuShell.isReady() -> "Root · 已授权"
            SuShell.hasManager(context) -> "Root · 未授权"
            else -> "Root · 未安装"
        }
        return "$shizuku  /  $root"
    }

    @JvmStatic
    fun requestShizuku(context: Context) {
        if (!ShizukuScan.isInstalled(context)) {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://shizuku.rikka.app/download/"))
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            try {
                context.startActivity(intent)
            } catch (_: ActivityNotFoundException) {
            }
            return
        }
        if (ShizukuScan.isRunning() && !ShizukuScan.isGranted()) {
            ShizukuScan.requestPermission(REQUEST_CODE)
        }
    }

    @JvmStatic
    fun listenForShizuku(listener: rikka.shizuku.Shizuku.OnRequestPermissionResultListener) {
        if (!ShizukuScan.isRunning()) return
        ShizukuScan.addPermissionListener(listener)
    }

    @JvmStatic
    fun unlistenForShizuku(listener: rikka.shizuku.Shizuku.OnRequestPermissionResultListener) {
        try {
            ShizukuScan.removePermissionListener(listener)
        } catch (_: Throwable) {
        }
    }

    /** Blocks; call off the main thread. */
    @JvmStatic
    fun probeRoot(): Boolean = SuShell.probe()

    @JvmStatic
    @Throws(java.io.IOException::class)
    fun openScan(path: String, rootRequired: Boolean): InputStream {
        val context = AppHelper.appContext
        val tier = choose(path, rootRequired)
        return when (tier) {
            Tier.ROOT -> SuShell.openScan(path, context.applicationInfo.sourceDir)
            Tier.SHIZUKU -> ShizukuScan.openScan(context, path)
            Tier.APP -> NativeScan.open(path)
        }
    }

    @JvmStatic
    fun readMountInfo(context: Context): String {
        if (SuShell.isReady()) {
            SuShell.readText("cat /proc/self/mountinfo")?.takeIf { it.isNotBlank() }?.let { return it }
        }
        if (ShizukuScan.isGranted()) {
            ShizukuScan.readMounts(context)?.takeIf { it.isNotBlank() }?.let { return it }
        }
        return try {
            File("/proc/self/mountinfo").readText()
        } catch (_: Exception) {
            try {
                File("/proc/mounts").readText()
            } catch (_: Exception) {
                ""
            }
        }
    }

    private fun choose(path: String, rootRequired: Boolean): Tier {
        if (rootRequired || isPrivateData(path)) {
            if (SuShell.isReady() || SuShell.probe()) return Tier.ROOT
            if (ShizukuScan.isRootMode()) return Tier.SHIZUKU
            throw java.io.IOException("需要 Magisk、KernelSU、APatch，或以 root 启动的 Shizuku 才能读取 $path")
        }
        if (Build.VERSION.SDK_INT >= 33 && restrictedTree(path)) {
            if (ShizukuScan.isGranted()) return Tier.SHIZUKU
            if (SuShell.isReady()) return Tier.ROOT
        }
        return Tier.APP
    }

    private fun isPrivateData(path: String): Boolean {
        return path == "/data" || path.startsWith("/data/")
            || path == "/system" || path.startsWith("/system/")
            || path == "/vendor" || path.startsWith("/vendor/")
            || path == "/product" || path.startsWith("/product/")
            || path == "/system_ext" || path.startsWith("/system_ext/")
            || path.startsWith("/mnt/expand/")
    }

    /** Whole shared volume on API 33+, because Android/data sits inside it. */
    private fun restrictedTree(path: String): Boolean {
        if (path.contains("/Android/data") || path.contains("/Android/obb")) return true
        return path.startsWith("/storage/") || path.startsWith("/sdcard") || path.startsWith("/mnt/media_rw/")
    }
}
