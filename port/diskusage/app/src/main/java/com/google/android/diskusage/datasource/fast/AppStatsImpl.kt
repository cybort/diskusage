package com.google.android.diskusage.datasource.fast

import android.content.pm.PackageStats
import com.google.android.diskusage.datasource.AppStats

class AppStatsImpl(private val packageStats: PackageStats) : AppStats {
    override val cacheSize: Long
        get() = packageStats.cacheSize
    override val dataSize: Long
        get() = packageStats.dataSize
    override val codeSize: Long
        get() = packageStats.codeSize
    override val externalCacheSize: Long
        get() = packageStats.externalCacheSize
    override val externalCodeSize: Long
        get() = packageStats.externalCodeSize
    override val externalDataSize: Long
        get() = packageStats.externalDataSize
    override val externalMediaSize: Long
        get() = packageStats.externalMediaSize
    override val externalObbSize: Long
        get() = packageStats.externalObbSize
}
