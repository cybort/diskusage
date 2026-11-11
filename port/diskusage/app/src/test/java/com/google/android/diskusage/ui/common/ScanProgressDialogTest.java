package com.google.android.diskusage.ui.common;

import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class ScanProgressDialogTest {
    @Test
    public void computeProgressRatio_clampsAndHandlesNonPositiveMax() {
        assertEquals(0.0, ScanProgressDialog.computeProgressRatio(10, 0), 1e-9);
        assertEquals(0.0, ScanProgressDialog.computeProgressRatio(10, -5), 1e-9);
        assertEquals(0.0, ScanProgressDialog.computeProgressRatio(-10, 100), 1e-9);
        assertEquals(0.45, ScanProgressDialog.computeProgressRatio(45, 100), 1e-9);
        assertEquals(1.0, ScanProgressDialog.computeProgressRatio(150, 100), 1e-9);
    }
}
