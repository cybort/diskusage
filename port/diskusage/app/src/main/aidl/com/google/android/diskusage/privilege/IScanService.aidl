package com.google.android.diskusage.privilege;

interface IScanService {
    ParcelFileDescriptor openScan(String path);
    String readMounts();
    void destroy();
}
