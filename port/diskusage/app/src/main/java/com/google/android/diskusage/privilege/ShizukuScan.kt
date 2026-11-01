package com.google.android.diskusage.privilege

import android.content.ComponentName
import android.content.Context
import android.content.ServiceConnection
import android.content.pm.PackageManager
import android.os.IBinder
import android.os.ParcelFileDescriptor
import com.google.android.diskusage.BuildConfig
import rikka.shizuku.Shizuku
import java.io.InputStream
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

/** Shell (or root, if Shizuku was started by Magisk) scan via a user service. */
object ShizukuScan {
    private const val PKG = "moe.shizuku.privileged.api"

    @Volatile private var service: IScanService? = null
    private var connection: ServiceConnection? = null

    @JvmStatic
    fun isInstalled(context: Context): Boolean = try {
        context.packageManager.getPackageInfo(PKG, 0)
        true
    } catch (_: PackageManager.NameNotFoundException) {
        false
    }

    @JvmStatic
    fun isRunning(): Boolean = try {
        Shizuku.pingBinder()
    } catch (_: Throwable) {
        false
    }

    @JvmStatic
    fun isGranted(): Boolean {
        if (!isRunning()) return false
        return try {
            Shizuku.checkSelfPermission() == PackageManager.PERMISSION_GRANTED
        } catch (_: Throwable) {
            false
        }
    }

    @JvmStatic
    fun isRootMode(): Boolean {
        if (!isGranted()) return false
        return try {
            Shizuku.getUid() == 0
        } catch (_: Throwable) {
            false
        }
    }

    @JvmStatic
    fun requestPermission(code: Int) {
        if (!isRunning()) return
        if (isGranted()) return
        Shizuku.requestPermission(code)
    }

    @JvmStatic
    fun addPermissionListener(listener: Shizuku.OnRequestPermissionResultListener) {
        Shizuku.addRequestPermissionResultListener(listener)
    }

    @JvmStatic
    fun removePermissionListener(listener: Shizuku.OnRequestPermissionResultListener) {
        Shizuku.removeRequestPermissionResultListener(listener)
    }

    @JvmStatic
    @Throws(java.io.IOException::class)
    fun openScan(context: Context, path: String): InputStream {
        val bound = ensure(context) ?: throw java.io.IOException("Shizuku user service did not start")
        val pfd: ParcelFileDescriptor = bound.openScan(path)
        return ParcelFileDescriptor.AutoCloseInputStream(pfd)
    }

    @JvmStatic
    fun readMounts(context: Context): String? {
        val bound = ensure(context) ?: return null
        return try {
            bound.readMounts()
        } catch (_: Exception) {
            null
        }
    }

    @Synchronized
    private fun ensure(context: Context): IScanService? {
        service?.let { return it }
        if (!isGranted()) return null
        val latch = CountDownLatch(1)
        val args = Shizuku.UserServiceArgs(
            ComponentName(context, ScanUserService::class.java),
        )
            .daemon(false)
            .processNameSuffix("scan")
            .debuggable(BuildConfig.DEBUG)
            .version(BuildConfig.VERSION_CODE)
        val conn = object : ServiceConnection {
            override fun onServiceConnected(name: ComponentName, binder: IBinder) {
                service = IScanService.Stub.asInterface(binder)
                try {
                    binder.linkToDeath({ service = null }, 0)
                } catch (_: Exception) {
                }
                latch.countDown()
            }

            override fun onServiceDisconnected(name: ComponentName) {
                service = null
            }
        }
        connection = conn
        try {
            Shizuku.bindUserService(args, conn)
        } catch (_: Throwable) {
            return null
        }
        latch.await(6, TimeUnit.SECONDS)
        return service
    }
}
