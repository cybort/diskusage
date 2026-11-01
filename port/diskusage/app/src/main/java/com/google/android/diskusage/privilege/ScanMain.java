package com.google.android.diskusage.privilege;

import java.io.FileDescriptor;
import java.io.FileOutputStream;

/**
 * Entry point for {@code app_process} started by Magisk / KernelSU / APatch.
 *
 * <pre>
 * su -mm -c 'CLASSPATH=base.apk app_process64 /system/bin \
 *   com.google.android.diskusage.privilege.ScanMain /data'
 * </pre>
 *
 * Runs in the root mount namespace, so /data/data is visible and the FUSE
 * namespace of the app is not. Does not exec anything from the app lib dir.
 */
public final class ScanMain {
    public static void main(String[] args) {
        String path = args != null && args.length > 0 ? args[0] : "/data";
        try {
            FileOutputStream out = new FileOutputStream(FileDescriptor.out);
            ProtocolScanner.scan(path, out);
            out.flush();
        } catch (Throwable t) {
            t.printStackTrace();
            System.exit(1);
        }
    }

    private ScanMain() {}

    /** Referenced from SuShell so R8 keeps this class. */
    public static String keep() {
        return ScanMain.class.getName();
    }
}