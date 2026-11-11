/*
 * DiskUsage - displays sdcard usage on android.
 * Copyright (C) 2008 Ivan Volosyuk
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

package com.google.android.diskusage.ui;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.AppOpsManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.Settings;
import android.util.Log;
import android.widget.Toast;
import com.google.android.diskusage.R;
import com.google.android.diskusage.privilege.PrivilegeBroker;
import com.google.android.diskusage.privilege.ShizukuScan;
import rikka.shizuku.Shizuku;
import com.google.android.diskusage.databinding.ActivityCommonBinding;
import com.google.android.diskusage.filesystem.mnt.MountPoint;
import splitties.toast.ToastKt;
import timber.log.Timber;

public class PermissionRequestActivity extends Activity {
    private final static int DISKUSAGE_REQUEST_CODE = 10;
    private final static int PERMISSION_REQUEST_USAGE_ACCESS_CODE = 11;
    private final static int PERMISSION_REQUEST_EXTERNAL_STORAGE_CODE = 12;
    private boolean offeredPrivilege;
    private AlertDialog activeDialog;
    private Shizuku.OnRequestPermissionResultListener shizukuListener;

    private void dismissActiveDialog() {
        if (activeDialog != null) {
            if (activeDialog.isShowing()) {
                activeDialog.dismiss();
            }
            activeDialog = null;
        }
    }

    @Override
    protected void onDestroy() {
        if (shizukuListener != null) {
            PrivilegeBroker.unlistenForShizuku(shizukuListener);
            shizukuListener = null;
        }
        dismissActiveDialog();
        super.onDestroy();
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        ActivityCommonBinding binding = ActivityCommonBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());
        Intent i = getIntent();

        final String key = i.getStringExtra(DiskUsage.KEY_KEY);
        if (key == null) {
            // Just close instead of crashing later
            finish();
            return;
        }

        MountPoint mountPoint = MountPoint.getForKey(this, key);
        if (mountPoint == null) {
            finish();
            return;
        }
        if ((!mountPoint.hasApps()) || isAccessGranted()) {
            forwardToDiskUsage();
            return;
        }

        activeDialog = new AlertDialog.Builder(this)
                .setTitle(R.string.dialog_usage_access_title)
                .setMessage(R.string.dialog_usage_access_desc)
                .setPositiveButton(android.R.string.ok, (dialogInterface, i1) -> {
                    Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
                    startActivityForResult(intent, PERMISSION_REQUEST_USAGE_ACCESS_CODE);
                })
                .setNegativeButton(android.R.string.cancel, (dialogInterface, i12) ->
                        forwardToDiskUsage()).create();
        activeDialog.show();

        requestExternalStoragePermission();
    }

    public void forwardToDiskUsage() {
        if (isFinishing() || isDestroyed()) {
            return;
        }
        if (!offeredPrivilege && Build.VERSION.SDK_INT >= 33) {
            offeredPrivilege = true;
            dismissActiveDialog();
            activeDialog = new AlertDialog.Builder(this)
                    .setTitle(R.string.dialog_privilege_title)
                    .setMessage(R.string.dialog_privilege_desc)
                    .setPositiveButton(R.string.button_shizuku, (dialogInterface, which) -> requestShizukuThenForward())
                    .setNeutralButton(R.string.button_magisk, (dialogInterface, which) -> probeRootThenForward())
                    .setNegativeButton(R.string.button_skip, (dialogInterface, which) -> forwardToDiskUsage())
                    .setOnCancelListener(dialog -> forwardToDiskUsage())
                    .create();
            activeDialog.show();
            return;
        }
        dismissActiveDialog();
        Intent input = getIntent();
        Intent diskusage = new Intent(this, DiskUsage.class);
        diskusage.putExtra(DiskUsage.KEY_KEY, input.getStringExtra(DiskUsage.KEY_KEY));
        diskusage.putExtra(DiskUsage.STATE_KEY, input.getBundleExtra(DiskUsage.STATE_KEY));
        startActivityForResult(diskusage, DISKUSAGE_REQUEST_CODE);
    }

    private void probeRootThenForward() {
        if (isFinishing() || isDestroyed()) {
            return;
        }
        dismissActiveDialog();
        activeDialog = new AlertDialog.Builder(this)
                .setTitle(R.string.dialog_root_probing_title)
                .setMessage(R.string.dialog_root_probing_desc)
                .setCancelable(false)
                .create();
        activeDialog.show();
        new Thread(() -> {
            boolean granted = PrivilegeBroker.probeRoot() || ShizukuScan.isRootMode();
            runOnUiThread(() -> {
                if (isFinishing() || isDestroyed()) {
                    return;
                }
                dismissActiveDialog();
                if (granted) {
                    forwardToDiskUsage();
                } else {
                    showRootUnavailableDialog();
                }
            });
        }).start();
    }

    private void showRootUnavailableDialog() {
        if (isFinishing() || isDestroyed()) {
            return;
        }
        dismissActiveDialog();
        activeDialog = new AlertDialog.Builder(this)
                .setTitle(R.string.dialog_root_unavailable_title)
                .setMessage(R.string.dialog_root_unavailable_desc)
                .setPositiveButton(R.string.button_continue_scan, (d, w) -> forwardToDiskUsage())
                .setNeutralButton(R.string.button_back, (d, w) -> {
                    offeredPrivilege = false;
                    forwardToDiskUsage();
                })
                .setOnCancelListener(d -> {
                    offeredPrivilege = false;
                    forwardToDiskUsage();
                })
                .create();
        activeDialog.show();
    }

    private void requestShizukuThenForward() {
        if (!ShizukuScan.isInstalled(this) || !ShizukuScan.isRunning()) {
            PrivilegeBroker.requestShizuku(this);
            Toast.makeText(this, R.string.dialog_shizuku_missing, Toast.LENGTH_LONG).show();
            forwardToDiskUsage();
            return;
        }
        if (ShizukuScan.isGranted()) {
            forwardToDiskUsage();
            return;
        }
        shizukuListener = (requestCode, grantResult) -> {
            if (requestCode != PrivilegeBroker.REQUEST_CODE) return;
            PrivilegeBroker.unlistenForShizuku(shizukuListener);
            shizukuListener = null;
            runOnUiThread(() -> {
                if (!isFinishing() && !isDestroyed()) {
                    forwardToDiskUsage();
                }
            });
        };
        PrivilegeBroker.listenForShizuku(shizukuListener);
        PrivilegeBroker.requestShizuku(this);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == DISKUSAGE_REQUEST_CODE) {
            setResult(0, data);
            finish();
        } else if (requestCode == PERMISSION_REQUEST_USAGE_ACCESS_CODE) {
            forwardToDiskUsage();
        } else if (requestCode == PERMISSION_REQUEST_EXTERNAL_STORAGE_CODE) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                if (Environment.isExternalStorageManager()) {
                    forwardToDiskUsage();
                } else {
                    ToastKt.toast(R.string.dialog_external_storage_access_error);
                }
            }
        }
    }

    private void requestExternalStoragePermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            if (Environment.isExternalStorageManager()) {
                forwardToDiskUsage();
                return;
            } else {
                try {
                    final Intent i = new Intent(Settings.ACTION_MANAGE_ALL_FILES_ACCESS_PERMISSION);
                    i.setData(Uri.parse("package:" + getPackageName()));
                    startActivityForResult(i, PERMISSION_REQUEST_EXTERNAL_STORAGE_CODE);
                    return;
                } catch (Exception e) {
                    Log.d("diskusage", "failed to obtain all files access", e);
                }
            }
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (checkSelfPermission(Manifest.permission.READ_EXTERNAL_STORAGE
                ) == PackageManager.PERMISSION_GRANTED &&
                checkSelfPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE
                ) == PackageManager.PERMISSION_GRANTED) {
                forwardToDiskUsage();
            } else {
                requestPermissions(
                        new String[] {
                                Manifest.permission.READ_EXTERNAL_STORAGE,
                                Manifest.permission.WRITE_EXTERNAL_STORAGE
                        },
                        PERMISSION_REQUEST_EXTERNAL_STORAGE_CODE
                );
            }
        }
    }

    private boolean isAccessGranted() {
        try {
            PackageManager packageManager = getPackageManager();
            ApplicationInfo applicationInfo = packageManager.getApplicationInfo(getPackageName(), 0);
            AppOpsManager appOpsManager = (AppOpsManager) getSystemService(Context.APP_OPS_SERVICE);
            int mode = 0;
            mode = appOpsManager.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS,
                    applicationInfo.uid, applicationInfo.packageName);
            return (mode == AppOpsManager.MODE_ALLOWED);

        } catch (PackageManager.NameNotFoundException e) {
            return false;
        }
    }

}
