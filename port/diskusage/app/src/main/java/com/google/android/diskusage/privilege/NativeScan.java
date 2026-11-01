package com.google.android.diskusage.privilege;

import android.os.ParcelFileDescriptor;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

/** In-process scan. Avoids execve of libscan.so, which Android 10+ blocks. */
public final class NativeScan {
    private static final boolean LOADED;

    static {
        boolean ok = false;
        try {
            System.loadLibrary("scan");
            ok = true;
        } catch (Throwable ignored) {
            ok = false;
        }
        LOADED = ok;
    }

    private NativeScan() {}

    public static boolean available() {
        return LOADED;
    }

    private static native void scanToFd(String path, int fd);

    public static InputStream open(String path) throws IOException {
        return new ParcelFileDescriptor.AutoCloseInputStream(start(path));
    }

    public static ParcelFileDescriptor start(String path) throws IOException {
        ParcelFileDescriptor[] pipe = ParcelFileDescriptor.createPipe();
        if (LOADED) {
            final int writeFd = pipe[1].detachFd();
            new Thread(() -> {
                try {
                    scanToFd(path, writeFd);
                } catch (Throwable t) {
                    try {
                        ParcelFileDescriptor.adoptFd(writeFd).close();
                    } catch (IOException ignored) {
                        // already closed by fdopen
                    }
                }
            }, "native-scan").start();
        } else {
            final OutputStream out = new FileOutputStream(pipe[1].getFileDescriptor());
            final ParcelFileDescriptor write = pipe[1];
            new Thread(() -> {
                try {
                    ProtocolScanner.scan(path, out);
                } catch (IOException ignored) {
                } finally {
                    try {
                        out.flush();
                        write.close();
                    } catch (IOException ignored) {
                    }
                }
            }, "java-scan").start();
        }
        return pipe[0];
    }
}
