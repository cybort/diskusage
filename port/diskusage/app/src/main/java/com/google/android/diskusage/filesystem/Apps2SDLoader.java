/*
 * DiskUsage - displays sdcard usage on android.
 * Copyright (C) 2008-2011 Ivan Volosyuk
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

package com.google.android.diskusage.filesystem;

import android.app.usage.StorageStats;
import android.app.usage.StorageStatsManager;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Handler;
import android.os.storage.StorageManager;
import android.os.storage.StorageVolume;
import com.google.android.diskusage.filesystem.entity.FileSystemEntry;
import com.google.android.diskusage.filesystem.entity.FileSystemPackage;
import com.google.android.diskusage.ui.DiskUsage;
import com.google.android.diskusage.ui.common.ScanProgressDialog;
import timber.log.Timber;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class Apps2SDLoader {

  private final DiskUsage diskUsage;
  private CharSequence lastAppName = "";
  private boolean switchToSecondary = true;
  private int numLoadedPackages = 0;

  public Apps2SDLoader(DiskUsage activity) {
    this.diskUsage = activity;
  }


  public FileSystemEntry[] load(final long blockSize) throws Throwable {
    UsageStatsManager usageStatsManager = (UsageStatsManager) diskUsage.getSystemService(Context.USAGE_STATS_SERVICE);
    StorageStatsManager storageStatsManager = (StorageStatsManager) diskUsage.getSystemService(Context.STORAGE_STATS_SERVICE);
    final ArrayList<FileSystemEntry> entries = new ArrayList<FileSystemEntry>();
    PackageManager packageManager = diskUsage.getApplicationContext().getPackageManager();
    final Set<String> packages = new HashSet<>();
    try {
      int flags = PackageManager.MATCH_DISABLED_COMPONENTS | PackageManager.MATCH_UNINSTALLED_PACKAGES;
      for (ApplicationInfo info : packageManager.getInstalledApplications(flags)) {
        packages.add(info.packageName);
      }
    } catch (Throwable t) {
      Timber.e(t, "load: installed packages");
    }
    try {
      final List<UsageStats> queryUsageStats = usageStatsManager.queryUsageStats(
              UsageStatsManager.INTERVAL_YEARLY, 0, System.currentTimeMillis());
      if (queryUsageStats != null) {
        for (UsageStats s : queryUsageStats) packages.add(s.getPackageName());
      }
    } catch (Throwable t) {
      Timber.e(t, "load: usage stats");
    }
    Timber.d("load: package set = %s", packages.size());

    final Handler handler = diskUsage.handler;
    Runnable progressUpdater = new Runnable() {
      @Override
      public void run() {
        ScanProgressDialog dialog = diskUsage.getPersistantState().loading;
        if (dialog != null) {
          if (switchToSecondary) {
            dialog.switchToSecondary();
            switchToSecondary = false;
          }
          dialog.setMax(packages.size());
          final CharSequence appName;
          synchronized (Apps2SDLoader.this) {
            appName = lastAppName;
          }
          dialog.setProgress(numLoadedPackages, appName);
        }
        diskUsage.handler.postDelayed(this, 50);
      }
    };
    handler.post(progressUpdater);


    for (String pkg : packages) {
      Timber.d("app: " + pkg);
      try {
        ApplicationInfo metadata = packageManager.getApplicationInfo(pkg, PackageManager.GET_META_DATA);
        String appName = metadata.loadLabel(packageManager).toString();
        lastAppName = appName;
        long[] stats = sumStats(storageStatsManager, pkg);
        Timber.d("stats: " + stats[0] + " " + stats[1]);
        FileSystemPackage p = new FileSystemPackage(
                appName,
                pkg,
                stats[0],
                stats[1],
                stats[2],
                metadata.flags);
        p.applyFilter(blockSize);
        entries.add(p);
        numLoadedPackages++;
      } catch (Throwable e) {
        Timber.d(e, "Failed to get package %s", pkg);
      }
    }

    FileSystemEntry[] result = entries.toArray(new FileSystemEntry[] {});
    Arrays.sort(result, FileSystemEntry.COMPARE);
    handler.removeCallbacks(progressUpdater);
    return result;
  }

  /** app, data, cache. One failure on a single volume does not drop the package. */
  private long[] sumStats(StorageStatsManager manager, String pkg) throws Exception {
    java.util.ArrayList<java.util.UUID> uuids = new java.util.ArrayList<>();
    uuids.add(StorageManager.UUID_DEFAULT);
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      StorageManager sm = (StorageManager) diskUsage.getSystemService(Context.STORAGE_SERVICE);
      if (sm != null) {
        for (StorageVolume volume : sm.getStorageVolumes()) {
          java.io.File dir = volume.getDirectory();
          if (dir == null) continue;
          try {
            java.util.UUID uuid = sm.getUuidForPath(dir);
            if (!uuids.contains(uuid)) uuids.add(uuid);
          } catch (Throwable ignored) {
          }
        }
      }
    }
    long app = 0;
    long data = 0;
    long cache = 0;
    boolean any = false;
    for (java.util.UUID uuid : uuids) {
      try {
        StorageStats stats = manager.queryStatsForPackage(uuid, pkg, android.os.Process.myUserHandle());
        app += stats.getAppBytes();
        data += stats.getDataBytes();
        cache += stats.getCacheBytes();
        any = true;
      } catch (Throwable ignored) {
      }
    }
    if (!any) throw new java.io.IOException("no storage stats for " + pkg);
    return new long[] { app, data, cache };
  }
}
