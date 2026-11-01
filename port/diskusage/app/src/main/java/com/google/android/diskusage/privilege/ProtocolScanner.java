package com.google.android.diskusage.privilege;

import android.system.ErrnoException;
import android.system.Os;
import android.system.OsConstants;
import android.system.StructStat;
import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashSet;

/**
 * Java twin of jni/scan.c. Used when the scan must run as another uid
 * (Magisk {@code app_process}, or a Shizuku user-service that failed to
 * load the native library). The byte protocol matches NativeScanner.
 */
public final class ProtocolScanner {
    private static final int MAX_DEPTH = 96;

    private ProtocolScanner() {}

    public static void scan(String path, OutputStream raw) throws IOException {
        OutputStream out = raw;
        StructStat st;
        try {
            st = Os.lstat(path);
        } catch (ErrnoException e) {
            writeError(out, 'D', nameOf(path), 1, 0, e.errno);
            out.write('Z');
            out.flush();
            return;
        }
        if (isType(st.st_mode, OsConstants.S_IFLNK)) {
            try {
                st = Os.stat(path);
            } catch (ErrnoException e) {
                writeError(out, 'D', nameOf(path), 1, 0, e.errno);
                out.write('Z');
                out.flush();
                return;
            }
        }
        if (!isType(st.st_mode, OsConstants.S_IFDIR)) {
            writeError(out, 'D', nameOf(path), st.st_blocks, st.st_size, 0);
            out.write('Z');
            out.flush();
            return;
        }
        scanDir(path, st, out, new HashSet<String>(), 0);
        out.flush();
    }

    private static void scanDir(String path, StructStat st, OutputStream out,
                                 HashSet<String> seen, int depth) throws IOException {
        String key = st.st_dev + ":" + st.st_ino;
        if (!seen.add(key) || depth > MAX_DEPTH) {
            writeError(out, 'D', nameOf(path), st.st_blocks, st.st_size, 0);
            out.write('Z');
            return;
        }
        String[] names = new File(path).list();
        if (names == null) {
            int err = OsConstants.EACCES;
            writeError(out, 'D', nameOf(path), st.st_blocks, st.st_size, err);
            out.write('Z');
            return;
        }
        writeEntry(out, 'D', nameOf(path), st.st_blocks, st.st_size);
        ArrayList<String> subdirs = new ArrayList<>();
        ArrayList<StructStat> subStats = new ArrayList<>();
        for (String name : names) {
            if (".".equals(name) || "..".equals(name)) continue;
            String child = path.endsWith("/") ? path + name : path + "/" + name;
            StructStat cs;
            try {
                cs = Os.lstat(child);
            } catch (ErrnoException e) {
                writeError(out, 'F', name, 0, 0, e.errno);
                continue;
            }
            if (isType(cs.st_mode, OsConstants.S_IFLNK)) continue;
            if (cs.st_dev != st.st_dev) continue;
            if (isType(cs.st_mode, OsConstants.S_IFDIR)) {
                subdirs.add(child);
                subStats.add(cs);
            } else {
                writeEntry(out, 'F', name, cs.st_blocks, cs.st_size);
            }
        }
        for (int i = 0; i < subdirs.size(); i++) {
            scanDir(subdirs.get(i), subStats.get(i), out, seen, depth + 1);
        }
        out.write('Z');
    }

    private static boolean isType(int mode, int type) {
        return (mode & OsConstants.S_IFMT) == type;
    }

    private static String nameOf(String path) {
        if (path == null || path.isEmpty()) return "";
        int slash = path.lastIndexOf('/');
        if (slash < 0) return path;
        if (slash == path.length() - 1) return path;
        return path.substring(slash + 1);
    }

    private static void writeEntry(OutputStream out, char type, String name,
                                   long blocks, long bytes) throws IOException {
        out.write(type);
        out.write(name.getBytes(StandardCharsets.UTF_8));
        out.write(0);
        writeLong(out, blocks);
        writeLong(out, bytes);
    }

    private static void writeError(OutputStream out, char type, String name,
                                   long blocks, long bytes, int errno) throws IOException {
        String suffix;
        if (errno == OsConstants.EACCES) suffix = " <No access>";
        else if (errno == OsConstants.ENOENT || errno == OsConstants.ENOTDIR) suffix = " <deleted>";
        else suffix = " <error>";
        writeEntry(out, type, name + suffix, blocks, bytes);
    }

    private static void writeLong(OutputStream out, long v) throws IOException {
        if (v < 0) v = 0;
        out.write(Long.toString(v).getBytes(StandardCharsets.US_ASCII));
        out.write(0);
    }
}
