package com.google.android.diskusage.privilege

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class SuShellTest {
    @Test
    fun filterExistingCandidates_skipsMissingAbsolutePathsAndDeduplicates() {
        val existing = setOf("/system/xbin/su")
        val result = SuShell.filterExistingCandidates(
            listOf(
                "/system/xbin/su",
                "su",
                "/debug_ramdisk/su",
                "/system/bin/su",
                "/system/xbin/su",
                "/sbin/su",
            )
        ) { it in existing }

        assertEquals(listOf("/system/xbin/su", "su"), result)
    }

    @Test
    fun isRootIdOutput_matchesOnlyExactUidZero() {
        assertTrue(SuShell.isRootIdOutput("uid=0(root) gid=0(root) groups=0(root)"))
        assertFalse(SuShell.isRootIdOutput("uid=2000(shell) gid=2000(shell)"))
        assertFalse(SuShell.isRootIdOutput("uid=0123(app)"))
        assertFalse(SuShell.isRootIdOutput("su: invalid uid/gid '-c'"))
    }
}
