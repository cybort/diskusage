package com.google.android.diskusage.datasource

interface AppStats {
    val cacheSize: Long
    val dataSize: Long
    val codeSize: Long
    val externalCacheSize: Long
    val externalCodeSize: Long
    val externalDataSize: Long
    val externalMediaSize: Long
    val externalObbSize: Long
}
