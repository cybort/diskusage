#include <sys/types.h>
#include <sys/stat.h>
#include <errno.h>
#include <stdio.h>
#include <unistd.h>
#include <string.h>
#include <dirent.h>
#include <stdlib.h>
#include <jni.h>

/*
 * DiskUsage native walker.
 *
 * Symlinks are not followed (lstat). A directory is skipped when its device
 * differs from the scan root, so bind-mounts and the FUSE emulated view are
 * not counted twice. Directory inodes already seen are not entered again, so
 * /data/user/0 -> /data/data cannot be walked twice even if a caller passes
 * the symlink as the root after one stat().
 *
 * The same protocol is written to stdout (main) or to a pipe (JNI), so the
 * process does not need to execve() the library. Android 10+ rejects execute
 * from app-private directories; loadLibrary + this entry point does not.
 */

dev_t dev;
static FILE *out_file;
static const int sep = 0;

#define SEEN_BITS 18
#define SEEN_SIZE (1u << SEEN_BITS)
static unsigned long long seen[SEEN_SIZE];

static void seen_reset(void) {
  memset(seen, 0, sizeof(seen));
}

static int seen_add(dev_t d, ino_t ino) {
  unsigned long long key = ((unsigned long long) d << 32) ^ (unsigned long long) ino;
  unsigned idx;
  int n;
  if (key == 0) key = 1;
  idx = (unsigned) (key ^ (key >> SEEN_BITS)) & (SEEN_SIZE - 1);
  for (n = 0; n < 64; n++) {
    if (seen[idx] == key) return 0;
    if (seen[idx] == 0) {
      seen[idx] = key;
      return 1;
    }
    idx = (idx + 1) & (SEEN_SIZE - 1);
  }
  return 1;
}

struct Entity {
  long long sizeInBlocks;
  long long sizeInBytes;
  const char *name;
  struct Entity *next;
  char isdir;
};

void scan_dir(const char *path, struct Entity *entity);

static void emit_char(int c) { fputc(c, out_file); }

static void emit_str(const char *s) { fputs(s, out_file); }

static void emit_ll(long long v) { fprintf(out_file, "%lld", v); }

static void emit_sep(void) { fputc(sep, out_file); }

const char *getName(const char *path) {
  const char *slash = strrchr(path, '/');
  if (slash == NULL) return path;
  if (slash[1] == 0) return slash;
  return slash + 1;
}

int nfiles = 0;

void dump_file(struct Entity *entity) {
  emit_char(entity->isdir ? 'D' : 'F');
  emit_str(entity->name);
  emit_sep();
  emit_ll(entity->sizeInBlocks);
  emit_sep();
  emit_ll(entity->sizeInBytes);
  emit_sep();
  nfiles++;
  if (nfiles % 10 == 0) fflush(out_file);
}

const char *get_error(void) {
  switch (errno) {
    case EACCES:
      return " <No access>";
    case ENOENT:
    case ENOTDIR:
      return " <deleted>";
    default:
      return " <error>";
  }
}

void dump_error(char type, const char *path,
    long long sizeInBlocks, long long sizeInBytes) {
  emit_char(type);
  emit_str(getName(path));
  emit_str(get_error());
  emit_sep();
  emit_ll(sizeInBlocks);
  emit_sep();
  emit_ll(sizeInBytes);
  emit_sep();
}

struct Entity *make_entity_internal(const char *path, struct stat *stbuf) {
  struct Entity *e = malloc(sizeof(struct Entity));
  e->name = strdup(getName(path));
  e->sizeInBlocks = stbuf->st_blocks;
  e->sizeInBytes = stbuf->st_size;
  e->isdir = S_ISDIR(stbuf->st_mode);
  e->next = NULL;
  return e;
}

struct Entity *make_entity(const char *path) {
  struct stat stbuf;
  if (lstat(path, &stbuf) < 0) return NULL;
  if (S_ISLNK(stbuf.st_mode)) return NULL;
  if (stbuf.st_dev != dev) return NULL;
  if (S_ISDIR(stbuf.st_mode) && !seen_add(stbuf.st_dev, stbuf.st_ino)) return NULL;
  return make_entity_internal(path, &stbuf);
}

char *makePath(const char *base, const char *name) {
  int baseLen = strlen(base);
  int nameLen = strlen(name);
  int needSlash = baseLen > 0 && base[baseLen - 1] != '/';
  char *res = (char *) malloc(baseLen + nameLen + 2);
  memcpy(res, base, baseLen);
  if (needSlash) res[baseLen++] = '/';
  memcpy(res + baseLen, name, nameLen);
  res[baseLen + nameLen] = 0;
  return res;
}

void scan_dir(const char *path, struct Entity *dirEntity) {
  DIR *dir = opendir(path);
  struct Entity *curr;
  struct Entity *prev;
  struct Entity *first = NULL;
  struct Entity **last = &first;

  if (dir == NULL) {
    dump_error('D', path, dirEntity->sizeInBlocks, dirEntity->sizeInBytes);
    emit_char('Z');
    return;
  }
  dump_file(dirEntity);

  struct dirent *entity;
  while ((entity = readdir(dir)) != NULL) {
    if (entity->d_name[0] == '.' && (
          entity->d_name[1] == 0 ||
          (entity->d_name[1] == '.' && entity->d_name[2] == 0))) continue;
    char *entityPath = makePath(path, entity->d_name);
    struct Entity *e = make_entity(entityPath);
    free(entityPath);
    if (e == NULL) continue;
    if (!e->isdir) {
      dump_file(e);
      free((void *) e->name);
      free(e);
      continue;
    }
    *last = e;
    last = &(e->next);
  }
  *last = NULL;
  closedir(dir);

  curr = first;
  while (curr != NULL) {
    char *entityPath = makePath(path, curr->name);
    scan_dir(entityPath, curr);
    free(entityPath);
    free((void *) curr->name);
    prev = curr;
    curr = curr->next;
    free(prev);
  }
  emit_char('Z');
}

void scan_tree(const char *path) {
  struct stat stbuf;
  if (lstat(path, &stbuf) != 0) {
    dump_error('D', path, 1, 0);
    emit_char('Z');
    return;
  }
  if (S_ISLNK(stbuf.st_mode)) {
    if (stat(path, &stbuf) != 0 || !S_ISDIR(stbuf.st_mode)) {
      dump_error('D', path, 1, 0);
      emit_char('Z');
      return;
    }
  }
  if (!S_ISDIR(stbuf.st_mode)) {
    dump_error('D', path, stbuf.st_blocks, stbuf.st_size);
    emit_char('Z');
    return;
  }
  dev = stbuf.st_dev;
  seen_add(stbuf.st_dev, stbuf.st_ino);
  scan_dir(path, make_entity_internal(path, &stbuf));
}

static void scan_begin(const char *path, FILE *out) {
  out_file = out;
  nfiles = 0;
  seen_reset();
  scan_tree(path);
  fflush(out);
}

int main(int argc, char **argv) {
  if (argv[1] == 0 || strchr(argv[1], '/') == NULL) return 1;
  scan_begin(argv[1], stdout);
  return 0;
}

JNIEXPORT void JNICALL
Java_com_google_android_diskusage_privilege_NativeScan_scanToFd(
    JNIEnv *env, jclass clazz, jstring jpath, jint fd) {
  const char *path;
  FILE *out;
  (void) clazz;
  path = (*env)->GetStringUTFChars(env, jpath, NULL);
  if (path == NULL) {
    close(fd);
    return;
  }
  out = fdopen(fd, "w");
  if (out == NULL) {
    close(fd);
    (*env)->ReleaseStringUTFChars(env, jpath, path);
    return;
  }
  scan_begin(path, out);
  fclose(out);
  (*env)->ReleaseStringUTFChars(env, jpath, path);
}
