package com.google.android.diskusage.datasource.fast

import com.google.android.diskusage.privilege.PrivilegeBroker
import java.io.IOException
import java.io.InputStream

/**
 * Scan stream. The historical implementation exec'd libscan.so, which Android
 * 10+ rejects, and called {@code su} without {@code --mount-master}. Both are
 * gone: [PrivilegeBroker] loads the walker in-process, in a Shizuku user
 * service, or under {@code su -mm} via app_process.
 */
class NativeScannerStream(
    private val input: InputStream,
    private val onClose: () -> Unit = {},
) : InputStream() {

    @Throws(IOException::class)
    override fun read(): Int = input.read()

    @Throws(IOException::class)
    override fun read(buffer: ByteArray): Int = input.read(buffer)

    @Throws(IOException::class)
    override fun read(buffer: ByteArray, byteOffset: Int, byteCount: Int): Int =
        input.read(buffer, byteOffset, byteCount)

    @Throws(IOException::class)
    override fun close() {
        input.close()
        onClose()
    }

    companion object Factory {
        @JvmStatic
        @Throws(IOException::class)
        fun create(path: String, rootRequired: Boolean): NativeScannerStream {
            val stream = PrivilegeBroker.openScan(path, rootRequired)
            return NativeScannerStream(stream)
        }
    }
}
