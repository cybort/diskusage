package com.google.android.diskusage.privilege;

import android.os.ParcelFileDescriptor;
import android.os.RemoteException;
import java.io.ByteArrayOutputStream;
import java.io.FileInputStream;
import java.io.IOException;

/**
 * Shizuku user service. The process uid is shell (2000) for ADB Shizuku, or
 * 0 when Shizuku itself was started from root. Either way it can list
 * Android/data and Android/obb, which targetSdk 33+ apps cannot.
 */
public class ScanUserService extends IScanService.Stub {
    @Override
    public ParcelFileDescriptor openScan(String path) throws RemoteException {
        try {
            return NativeScan.start(path);
        } catch (Exception e) {
            throw new RemoteException(e.getMessage());
        }
    }

    @Override
    public String readMounts() {
        try (FileInputStream in = new FileInputStream("/proc/self/mountinfo")) {
            ByteArrayOutputStream buf = new ByteArrayOutputStream();
            byte[] tmp = new byte[4096];
            int n;
            while ((n = in.read(tmp)) > 0) buf.write(tmp, 0, n);
            return buf.toString("UTF-8");
        } catch (IOException e) {
            return "";
        }
    }

    @Override
    public void destroy() {
        System.exit(0);
    }
}
