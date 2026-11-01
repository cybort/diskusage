# DiskUsage 5.1.0

基于 [WhiredPlanck/diskusage](https://github.com/WhiredPlanck/diskusage) `current`（2024-12-30，targetSdk 30）的适配。GPL-2.0，版权仍属原作者，本目录的改动同样按 GPL-2.0 发布。

浏览器里打不开手机存储。预览里的图用的是一台 Android 16 样机的目录模型，用来对照下面这三处缺口；真正扫描的是这份工程。

## 路径为什么不全

1. **卷枚举。** `MountPoint` 只用 `getExternalFilesDirs()`，再把 `/Android/data/<包名>/files` 剪掉。SD 卡或 U 盘上还没有本应用目录时，整卷不会出现。`VolumeCatalog` 改为读 `StorageManager.getStorageVolumes()`（API 30 用 `getDirectory()`，更老的用隐藏的 `getPath()`），再把应用目录当作补充。`/storage/self/primary`、`/mnt/user/*`、`/mnt/pass_through/*`、`/mnt/androidwritable/*` 与主存储是同一份数据，不再各列一次。`/data/media` 是模拟存储的后端，也不再单独当一块盘。

2. **Android 13+ 的 Android/data 与 Android/obb。** `MANAGE_EXTERNAL_STORAGE` 只能 `lstat` 到目录本身，`opendir` 返回 EACCES。扫出来的大小进不了树，差额全部进「系统数据」。API 33 及以上，如果 Shizuku 已授权，整卷改由 Shizuku user service 扫描（进程 uid 是 shell，root 方式启动的 Shizuku 则是 0）。没有 Shizuku 但有 root 时走下面的 su。

3. **应用列表。** 原来只收「过去一年有 UsageStats 的包」，没打开过的应用直接消失。现在用 `QUERY_ALL_PACKAGES` 取已安装、已停用、残留数据的包，再并上 UsageStats。每个包的 `StorageStats` 按存储卷 uuid 相加，避免只问 `UUID_DEFAULT` 时漏掉装在 SD 上的部分。单个包查询失败不再中断整表。

4. **符号链接与挂载点。** `scan.c` 和 Java 回退扫描都改为 `lstat`。链接不跟随。`st_dev` 不同（跨文件系统）不进入。目录 inode 记入哈希，避免环。根路径本身如果是链接（例如把 `/data/user/0` 当扫描根），只 `stat` 一次。这样 `/data/user/0` → `/data/data` 不会算两遍。

## 授权

| 方式 | 进程 | 能看到 |
| --- | --- | --- |
| 应用自己 | `System.loadLibrary("scan")`，协议写到管道 | 共享存储里未被锁的文件。Android 10 起不能再 `exec` 应用目录里的二进制，所以不再 `Runtime.exec(libscan.so)` |
| 所有文件 | 同上，外加 `MANAGE_EXTERNAL_STORAGE` | API 32 及以下的 Android/data；API 33+ 仍然不行 |
| Shizuku | `ScanUserService`（AIDL `IScanService`） | shell 可读的 Android/data、obb、`/mnt/media_rw` |
| Magisk / KernelSU / APatch | `su -mm -c 'CLASSPATH=base.apk app_process64 … ScanMain'` | 全局挂载命名空间里的 `/data`。`-mm` 即 `--mount-master`，对应上游 issue：不用它时 Magisk 的命名空间里 `/data` 是空的。KernelSU / APatch 不支持 `-mm` 时退回 `su -c`。二进制放在 `/data/local/tmp` 也不需要，`app_process` 直接跑 apk 里的 Java 扫描器 |

启动页第一项是当前授权状态，点它会请求 Shizuku，并在后台探测 root（每个候选 `su` 只试一次，避免连弹多个授权框）。进入存储前会再问一次，可以跳过。

Root 挂载列表不再把 `/proc/mounts` 原样倒出来。伪文件系统（tmpfs、cgroup、debugfs、apex、overlay…）丢掉；与共享存储重复的 bind 丢掉。`/data` 始终提供，真正扫描时才要 root。

## 系统版本

- minSdk 23，compileSdk / targetSdk 36（Android 16）
- NDK r27，`APP_SUPPORT_FLEXIBLE_PAGE_SIZES`，链接 `-Wl,-z,max-page-size=16384`，以过 Android 15 的 16 KB page
- 组件补了 `android:exported`（target 31+ 安装要求）
- 读存储权限限制了 `maxSdkVersion`，高版本只走「所有文件访问」

## 构建

Android Studio 或：

```
./gradlew :app:assembleDebug
```

需要已安装的 SDK 36 与 NDK 27.2.12479018。Shizuku 依赖 `dev.rikka.shizuku:api:13.1.5`。

没有 Shizuku、也没有 root 时，应用仍然能扫共享存储，只是 Android/data 继续显示为「系统数据」。这是系统限制，不是再要一个权限开关就能绕过去的。
