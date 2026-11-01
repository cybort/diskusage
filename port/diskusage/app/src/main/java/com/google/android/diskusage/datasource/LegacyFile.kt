package com.google.android.diskusage.datasource

import java.io.IOException

interface LegacyFile {
    val name: String?

    /** Path as stored, not canonical. Canonical paths follow symlinks. */
    val path: String?

    @get:Throws(IOException::class)
    val canonicalPath: String?
    val isLink: Boolean
    val isFile: Boolean
    fun length(): Long
    fun listFiles(): Array<LegacyFile>?
    fun list(): Array<String>?
    fun getChild(string: String): LegacyFile?
}