package com.google.android.diskusage.privilege

import android.content.Context
import android.content.pm.PackageManager
import java.io.File
import java.io.InputStream
import java.util.concurrent.TimeUnit

/**
 * Magisk, KernelSU and APatch. Magisk isolates the app mount namespace, which
 * hides other apps under /data unless {@code su -mm} (--mount-master) is used.
 * The scanner is not executed from the app lib dir (noexec since Android 10);
 * {@code app_process} loads [ScanMain] out of the apk.
 */
object SuShell {
    private val MANAGERS = listOf(
        "com.topjohnwu.magisk",
        "io.github.huskydg.magisk",
        "me.weishu.kernelsu",
        "me.bmax.apatch",
        "com.rifsxd.ksunext",
    )

    @Volatile private var suBin: String? = null
    @Volatile private var magisk: Boolean = false
    @Volatile private var probed = false
    @Volatile private var granted = false

    @JvmStatic
    fun hasManager(context: Context): Boolean {
        val pm = context.packageManager
        return MANAGERS.any { pkg ->
            try {
                pm.getPackageInfo(pkg, 0)
                true
            } catch (_: PackageManager.NameNotFoundException) {
                false
            }
        }
    }

    @JvmStatic
    fun isReady(): Boolean = granted && suBin != null

    /** Blocks up to a couple of seconds. Shows the manager's grant dialog once. */
    @JvmStatic
    @Synchronized
    fun probe(): Boolean {
        if (probed && granted) return true
        probed = true
        for (bin in candidates()) {
            val process = try {
                ProcessBuilder(bin, "-c", "id").redirectErrorStream(true).start()
            } catch (_: Exception) {
                continue
            }
            if (!process.waitFor(2, TimeUnit.SECONDS)) {
                process.destroyForcibly()
                continue
            }
            val out = process.inputStream.bufferedReader().readText()
            if (process.exitValue() == 0 && isRootIdOutput(out)) {
                granted = true
                suBin = bin
                magisk = flavor(bin)
                return true
            }
        }
        return false
    }

    @JvmStatic
    fun openScan(path: String, apk: String): InputStream {
        val bin = suBin ?: throw java.io.IOException("root not granted")
        val appProcess = listOf(
            "/system/bin/app_process64",
            "/system/bin/app_process32",
            "/system/bin/app_process",
        ).firstOrNull { File(it).exists() }
            ?: throw java.io.IOException("app_process missing")
        val cmd = "CLASSPATH=${q(apk)} exec ${q(appProcess)} /system/bin ${ScanMain.keep()} ${q(path)}"
        val args = if (magisk) arrayOf(bin, "-mm", "-c", cmd) else arrayOf(bin, "-c", cmd)
        return ProcessBuilder(*args).start().inputStream
    }

    @JvmStatic
    fun readText(command: String): String? {
        val bin = suBin ?: return null
        val args = if (magisk) arrayOf(bin, "-mm", "-c", command) else arrayOf(bin, "-c", command)
        return try {
            val process = ProcessBuilder(*args).redirectErrorStream(false).start()
            if (!process.waitFor(4, TimeUnit.SECONDS)) {
                process.destroyForcibly()
                return null
            }
            process.inputStream.bufferedReader().readText()
        } catch (_: Exception) {
            null
        }
    }

    private fun candidates(): List<String> {
        val fromPath = try {
            val process = ProcessBuilder("/system/bin/sh", "-c", "command -v su").start()
            if (process.waitFor(700, TimeUnit.MILLISECONDS) && process.exitValue() == 0) {
                process.inputStream.bufferedReader().readText().trim().ifEmpty { null }
            } else null
        } catch (_: Exception) {
            null
        }
        val raw = listOfNotNull(
            fromPath,
            if (fromPath == null) "su" else null,
            "/debug_ramdisk/su",
            "/system/bin/su",
            "/system/xbin/su",
            "/sbin/su",
            "/data/adb/ksu/bin/su",
            "/data/adb/ap/bin/su",
        )
        return filterExistingCandidates(raw) { File(it).exists() }
    }

    internal fun filterExistingCandidates(
        candidates: List<String>,
        exists: (String) -> Boolean,
    ): List<String> = candidates
        .filter { !it.startsWith("/") || exists(it) }
        .distinct()

    internal fun isRootIdOutput(output: String): Boolean =
        Regex("""\buid=0\b""").containsMatchIn(output)

    private fun flavor(bin: String): Boolean {
        return try {
            val process = ProcessBuilder(bin, "-v").redirectErrorStream(true).start()
            if (!process.waitFor(1, TimeUnit.SECONDS)) {
                process.destroyForcibly()
                return true
            }
            val text = process.inputStream.bufferedReader().readText()
            text.contains("MAGISK", ignoreCase = true) || text.contains("magisk")
        } catch (_: Exception) {
            true
        }
    }

    private fun q(value: String): String = "'" + value.replace("'", "'\\''") + "'"
}
