package com.google.android.diskusage.utils

import com.google.android.diskusage.privilege.PrivilegeBroker

object DeviceHelper {
    /** Manager installed, Shizuku-root, or a previous su grant. Does not block. */
    @JvmStatic
    fun isDeviceRooted(): Boolean = PrivilegeBroker.shouldOfferRoot(AppHelper.appContext)
}
