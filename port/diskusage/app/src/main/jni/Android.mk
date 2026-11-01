LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

LOCAL_MODULE    := scan
LOCAL_SRC_FILES := scan.c
LOCAL_LDLIBS    := -llog
# 16 KB page devices (Android 15+). NDK r27+ also honors
# APP_SUPPORT_FLEXIBLE_PAGE_SIZES in Application.mk.
LOCAL_LDFLAGS   := -Wl,-z,max-page-size=16384

# Shared library, not an executable. Android 10+ refuses execve() from an
# app directory (and the native lib dir is often noexec). Callers load this
# with System.loadLibrary and write the scan protocol to a pipe.
include $(BUILD_SHARED_LIBRARY)
