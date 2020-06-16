import { join, basename, dirname } from 'path';
import { promises, constants, createWriteStream } from 'fs';
import { firebase } from '@firebase/app';
import https from 'https';
import '@firebase/storage';

var fs = {
  readdir: path => promises.readdir(path, {
    withFileTypes: true
  }),
  rmdir: path => promises.rmdir(path, {
    recursive: true
  }),
  unlink: promises.unlink,
  exists: path => promises.access(path, constants.R_OK).then(() => true).catch(() => false),
  mkdir: path => promises.mkdir(path, {
    recursive: true
  }),
  readFile: promises.readFile,
  writeFile: promises.writeFile
};

let _basePath;

const setBasePath = p => {
  if (typeof p !== "string") throw new Error(`path must be a string. got ${typeof p} (in "setBasePath")`);
  _basePath = p;
};

const getSuffix = p => {
  if (!_basePath) throw new Error("basePath is not set. Please call setBasePath first");
  return join(_basePath, p);
};

const storagePath = () => getSuffix("storage");
const mediasPath = () => getSuffix("medias");
const createStorage = () => Promise.all([fs.mkdir(storagePath()), fs.mkdir(mediasPath())]);
function filename(path) {
  if (typeof path !== "string") throw new Error(`path must be a string. Got ${typeof path}`);
  return path.split("/").slice(-1)[0];
}

var AsyncLock = function (opts) {
  opts = opts || {};
  this.Promise = opts.Promise || Promise; // format: {key : [fn, fn]}
  // queues[key] = null indicates no job running for key

  this.queues = Object.create(null); // domain of current running func {key : fn}

  this.domains = Object.create(null); // lock is reentrant for same domain

  this.domainReentrant = opts.domainReentrant || false;
  this.timeout = opts.timeout || AsyncLock.DEFAULT_TIMEOUT;
  this.maxPending = opts.maxPending || AsyncLock.DEFAULT_MAX_PENDING;
};

AsyncLock.DEFAULT_TIMEOUT = 0; //Never

AsyncLock.DEFAULT_MAX_PENDING = 1000;
/**
 * Acquire Locks
 *
 * @param {String|Array} key 	resource key or keys to lock
 * @param {function} fn 	async function
 * @param {function} cb 	callback function, otherwise will return a promise
 * @param {Object} opts 	options
 */

AsyncLock.prototype.acquire = function (key, fn, cb, opts) {
  if (Array.isArray(key)) {
    return this._acquireBatch(key, fn, cb, opts);
  }

  if (typeof fn !== 'function') {
    throw new Error('You must pass a function to execute');
  } // faux-deferred promise using new Promise() (as Promise.defer is deprecated)


  var deferredResolve = null;
  var deferredReject = null;
  var deferred = null;

  if (typeof cb !== 'function') {
    opts = cb;
    cb = null; // will return a promise

    deferred = new this.Promise(function (resolve, reject) {
      deferredResolve = resolve;
      deferredReject = reject;
    });
  }

  opts = opts || {};
  var resolved = false;
  var timer = null;
  var self = this;

  var done = function (locked, err, ret) {
    if (locked) {
      if (self.queues[key].length === 0) {
        delete self.queues[key];
      }

      delete self.domains[key];
    }

    if (!resolved) {
      if (!deferred) {
        if (typeof cb === 'function') {
          cb(err, ret);
        }
      } else {
        //promise mode
        if (err) {
          deferredReject(err);
        } else {
          deferredResolve(ret);
        }
      }

      resolved = true;
    }

    if (locked) {
      //run next func
      if (!!self.queues[key] && self.queues[key].length > 0) {
        self.queues[key].shift()();
      }
    }
  };

  var exec = function (locked) {
    if (resolved) {
      // may due to timed out
      return done(locked);
    }

    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    if (locked) {
      self.domains[key] = process.domain;
    } // Callback mode


    if (fn.length === 1) {
      var called = false;
      fn(function (err, ret) {
        if (!called) {
          called = true;
          done(locked, err, ret);
        }
      });
    } else {
      // Promise mode
      self._promiseTry(function () {
        return fn();
      }).then(function (ret) {
        done(locked, undefined, ret);
      }, function (error) {
        done(locked, error);
      });
    }
  };

  if (!!process.domain) {
    exec = process.domain.bind(exec);
  }

  if (!self.queues[key]) {
    self.queues[key] = [];
    exec(true);
  } else if (self.domainReentrant && !!process.domain && process.domain === self.domains[key]) {
    // If code is in the same domain of current running task, run it directly
    // Since lock is re-enterable
    exec(false);
  } else if (self.queues[key].length >= self.maxPending) {
    done(false, new Error('Too much pending tasks'));
  } else {
    var taskFn = function () {
      exec(true);
    };

    if (opts.skipQueue) {
      self.queues[key].unshift(taskFn);
    } else {
      self.queues[key].push(taskFn);
    }

    var timeout = opts.timeout || self.timeout;

    if (timeout) {
      timer = setTimeout(function () {
        timer = null;
        done(false, new Error('async-lock timed out'));
      }, timeout);
    }
  }

  if (deferred) {
    return deferred;
  }
};
/*
 * Below is how this function works:
 *
 * Equivalent code:
 * self.acquire(key1, function(cb){
 *     self.acquire(key2, function(cb){
 *         self.acquire(key3, fn, cb);
 *     }, cb);
 * }, cb);
 *
 * Equivalent code:
 * var fn3 = getFn(key3, fn);
 * var fn2 = getFn(key2, fn3);
 * var fn1 = getFn(key1, fn2);
 * fn1(cb);
 */


AsyncLock.prototype._acquireBatch = function (keys, fn, cb, opts) {
  if (typeof cb !== 'function') {
    opts = cb;
    cb = null;
  }

  var self = this;

  var getFn = function (key, fn) {
    return function (cb) {
      self.acquire(key, fn, cb, opts);
    };
  };

  var fnx = fn;
  keys.reverse().forEach(function (key) {
    fnx = getFn(key, fnx);
  });

  if (typeof cb === 'function') {
    fnx(cb);
  } else {
    return new this.Promise(function (resolve, reject) {
      // check for promise mode in case keys is empty array
      if (fnx.length === 1) {
        fnx(function (err, ret) {
          if (err) {
            reject(err);
          } else {
            resolve(ret);
          }
        });
      } else {
        resolve(fnx());
      }
    });
  }
};
/*
 *	Whether there is any running or pending asyncFunc
 *
 *	@param {String} key
 */


AsyncLock.prototype.isBusy = function (key) {
  if (!key) {
    return Object.keys(this.queues).length > 0;
  } else {
    return !!this.queues[key];
  }
};
/**
 * Promise.try() implementation to become independent of Q-specific methods
 */


AsyncLock.prototype._promiseTry = function (fn) {
  try {
    return this.Promise.resolve(fn());
  } catch (e) {
    return this.Promise.reject(e);
  }
};

var lib = AsyncLock;

var asyncLock = lib;

const lock = new asyncLock({
  maxPending: 2
});
class FileError extends Error {
  constructor(sourceFile, messageOrError) {
    const message = typeof messageOrError === "string" ? messageOrError : messageOrError.message;
    super(message);
    this.sourceFile = sourceFile;
    this.code = messageOrError.code;
    this.stack = messageOrError.stack;
  }

}
async function loadFile(name) {
  return await lock.acquire(`${name}-rw`, () => fs.readFile(`${storagePath()}/${name}`, 'utf8'));
}
async function saveFile(name, data) {
  await lock.acquire(`${name}-rw`, async () => {
    try {
      //console.log("write ", data, "to", `${storagePath()}/${name}`);
      await fs.writeFile(`${storagePath()}/${name}`, data, 'utf8');
    } catch (e) {
      throw new FileError(`${storagePath()}/${name}`, e.message);
    }
  });
}

const localFiles = () => new Map([`${storagePath()}/cache.json`, `${storagePath()}/data.json`, `${storagePath()}/conf.json`].map(f => [f, true])); //Return a map of cache files

async function getCacheFiles() {
  return await lock.acquire("cache-file", async () => {
    let flatList = localFiles();
    let content = "{}";

    try {
      content = await loadFile("cache.json");
    } catch (e) {
      if (e.code !== "ENOENT") {
        throw e;
      }
    }

    let cache = JSON.parse(content);

    for (let zone in cache) {
      for (let file in cache[zone]) {
        flatList.set(file, cache[zone][file]);
      }
    }

    return flatList;
  });
}
async function getCachedHash(file) {
  let cacheFiles;

  try {
    cacheFiles = await getCacheFiles();
  } catch (e) {
    console.warn("Failed to get cached files list : ", e);
    cacheFiles = localFiles();
  }

  return cacheFiles.get(file);
} //Low level cache merge

async function saveCacheFile(key, data) {
  return await lock.acquire("cache-file", async () => {
    let cache;

    try {
      cache = JSON.parse(await loadFile("cache.json"));
    } catch (e) {
      throw new FileError(`${storagePath()}/cache.json`, e.message, e.code);
    }

    let mergedCache = Object.assign({}, cache, {
      [key]: data
    });
    console.warn("Save cache data : ", cache, mergedCache);
    await saveFile("cache.json", JSON.stringify(mergedCache));
  });
}
class CacheStage {
  constructor(name) {
    this.name = name;
    this._id = `${name}.${Date.now().toString(36)}.${Math.random().toString(36).slice(2)}`;
    this.files = {};
    this._closed = false;
  }

  get id() {
    return this._id;
  }

  static async load() {

    try {
      return JSON.parse(await loadFile("cache.json"));
    } catch (e) {
      if (e.code !== "ENOENT") {
        console.warn(new FileError(`${storagePath()}/cache.json`, e.message, e.code));
      }

      return {};
    }
  }
  /* returns a promise that resolves once cache is saved */


  async set(file, hash = true) {
    return await this.batch({
      [file]: hash
    });
  }

  async batch(b) {
    if (this.closed) throw new Error("can not append files to cache after staging area has been closed");
    return await lock.acquire("cache-file", async () => {
      Object.assign(this.files, b);
      let cache = await CacheStage.load();
      let mergedCache = Object.assign({}, cache, {
        [this.id]: this.files
      }); //console.warn("Save cache data : ",cache, mergedCache);

      await saveFile("cache.json", JSON.stringify(mergedCache, null, 2));
    });
  }

  async close() {
    return await lock.acquire("cache-file", async () => {
      let cache = await CacheStage.load();
      let stages = [],
          otherZones = {};

      for (let zone in cache) {
        if (zone.startsWith(`${this.name}.`)) {
          stages.push(cache[zone]);
        } else {
          otherZones[zone] = cache[zone];
        }
      }

      let files = stages.sort().reduce((res, keyFiles) => {
        return Object.assign(res, keyFiles);
      }, {}); //console.info("Closed cache file : ", JSON.stringify(Object.assign(otherZones, {[this.name]: files }), null, 2));

      await saveFile("cache.json", JSON.stringify(Object.assign(otherZones, {
        [this.name]: files
      }), null, 2));
    });
  }

  static async closeAll() {
    return await lock.acquire("cache-file", async () => {
      let cache = await CacheStage.load();
      let stages = {},
          otherZones = {};

      for (let zone in cache) {
        let m = /^(\w+)\.[0-9a-z]+\.[0-9a-z]*$/i.exec(zone);

        if (m) {
          if (!Array.isArray(stages[m[1]])) stages[m[1]] = [cache[zone]];else stages[m[1]].push(cache[zone]);
        } else {
          otherZones[zone] = cache[zone];
        }
      }

      let closures = Object.keys(stages).reduce((res, key) => {
        return Object.assign(res, {
          [key]: stages[key].sort().reduce((r, k) => Object.assign(r, k), {})
        });
      }, {});
      await saveFile("cache.json", JSON.stringify(Object.assign(otherZones, closures), null, 2));
    });
  }

}

async function doClean(dir, flatList) {
  let localFiles,
      unlinked = [],
      kept = [];

  try {
    localFiles = await fs.readdir(dir);
  } catch (e) {
    let fe = new FileError(dir, e.message);
    fe.code = e.code;
    throw e;
  }

  for (let file of localFiles) {
    //console.log("Checking local file : ", file);
    if (file.isDirectory()) {
      if (flatList.filter(path => path.indexOf(file.path) === 0).length == 0) {
        //No file has this prefix
        await fs.rmdir(file.path); // unlike node's unlink, this works recursively

        unlinked.push(file.path);
      } else {
        let [other_unlinked, other_kept] = await doClean(file.path, flatList);
        unlinked.push(...other_unlinked);
        kept.push(...other_kept);
      }
    } else if (flatList.indexOf(file.path) == -1) {
      await fs.unlink(file.path);
      unlinked.push(file.path);
    } else {
      kept.push(file.path);
    }
  }

  return [unlinked, kept];
}

async function cleanup(dir = mediasPath(), flatList) {
  return await lock.acquire("cleanup", async () => {
    await CacheStage.closeAll();
    const flatList = Array.from((await getCacheFiles()).keys());
    let res = await doClean(dir, flatList);
    return res;
  });
}

async function makeLocal(d, {
  signal
} = {}) {
  let filelist = new Map();
  let res = Array.isArray(d) ? [] : {};
  const storage = firebase.app().storage();

  const isCancelled = () => signal && signal.aborted;

  for (let key in d) {
    if (isCancelled()) break;

    if (typeof d[key] === "string" && d[key].indexOf("gs://") == 0 && !d[key].endsWith("/") && key !== 'repo') {
      const ref = storage.refFromURL(d[key]);
      const name = ref.name;
      const dest = `${mediasPath()}/${name}`;
      let {
        md5Hash
      } = await ref.getMetadata().catch(e => {
        console.warn("for " + dest, e);
        return {
          md5Hash: true
        };
      });
      filelist.set(dest, {
        src: d[key],
        hash: md5Hash
      });
      res[key] = `file://${dest}`;
    } else if (typeof d[key] === "object") {
      let [internal_res, other_files] = await makeLocal(d[key], {
        signal
      });
      res[key] = internal_res;
      filelist = new Map([...filelist, ...other_files]);
    } else {
      res[key] = d[key];
    }
  }

  return [res, filelist];
}

function fetchFile(src, {
  dest,
  signal = {}
} = {}) {
  if (/^file:\/\//.test(dest)) {
    dest = dest.slice(7);
  }

  const tmp_dest = join(dirname(dest), `~${basename(dest)}`);
  const f = createWriteStream(tmp_dest);
  f.on("error", e => console.warn("WriteStream internal error : ", e));
  return new Promise((resolve, reject) => {
    https.get(src, function (response) {
      response.on("error", e => {
        console.warn("Response error");
        f.close();
        promises.unlink(tmp_dest).catch(() => {}).finally(() => reject(e));
      });
      response.on("data", d => {
        if (signal.aborted) {
          response.abort(); //socket will emit an error
        } else {
          f.write(d);
        }
      });
      response.on("end", () => {
        f.close();

        if (!signal.aborted) {
          promises.rename(tmp_dest, dest).then(() => resolve(dest));
        }
      });
    });
  });
}
async function writeToFile(src, dest) {
  const ref = firebase.storage().refFromURL(src);
  const fullPath = ref.fullPath;
  const name = basename(fullPath);

  try {
    const src = await ref.getDownloadURL();
    await fetchFile(src, {
      dest
    });
  } catch (e) {
    console.warn("Download error on %s : ", fullPath, e.message);

    if (e.code == "storage/object-not-found") {
      throw new FileError(name, `${name} could not be found at ${ref.fullPath}`);
    } else {
      throw new FileError(name, e);
    }
  }
}

async function transformSnapshot(transforms, snapshot) {
  let res = Object.assign(snapshot.exists ? snapshot.data() : {}, {
    id: snapshot.id
  });
  let files = new Map();

  for (let t of transforms) {
    let [tr_res, new_files] = await t(res);
    res = tr_res;
    files = new Map([...files, ...new_files]);
  }

  return [res, files];
}
function watchFiles({
  projectName,
  dispatch,
  transforms = [makeLocal],
  onProgress = function () {},
  onUpdate = function () {}
} = {}) {
  if (!projectName) {
    throw new Error(`A valid projectName is required. Got ${projectName}`);
  }

  let unsubscribes = [];
  let abortConfig, abortProject;
  const db = firebase.app().firestore();
  const projectRef = db.collection("applications").doc(projectName);
  const collectionsRef = projectRef.collection("pages");
  unsubscribes.push(projectRef.onSnapshot(configSnapshot => {
    if (abortConfig) abortConfig.abort(); //Cancel any previous run

    abortConfig = new AbortController();
    onUpdate("config");
    onConfigSnapshot(transformSnapshot(transforms, configSnapshot), {
      signal: abortConfig.signal,
      onProgress,
      projectRef,
      dispatch
    });
  }, e => onProgress("Can't get project snapshot for " + projectRef.path + " :", e.message)));
  unsubscribes.push(collectionsRef.onSnapshot(projectsSnapshot => {
    if (abortProject) abortProject.abort();
    abortProject = new AbortController();
    onUpdate("items");
    onProjectSnapshot(Promise.all(projectsSnapshot.docs.map(ps => transformSnapshot(transforms, ps))), {
      signal: abortProject.signal,
      onProgress,
      projectRef,
      dispatch
    });
  }, e => onProgress("Can't get collections snapshot for " + collectionsRef.path + " :", e.message)));
  return () => {
    unsubscribes.forEach(fn => fn());
  };
}
async function onConfigSnapshot(tr, {
  signal,
  onProgress = console.log,
  dispatch
}) {
  let cache = new CacheStage("config");
  let [config, files] = await tr;
  let requiredFiles = [];

  if (!config) {
    console.warn("Application has no configuration set. Using defaults.");
  }

  try {
    for (let [dest, {
      src,
      hash
    }] of files.entries()) {
      const name = dest.split("/").slice(-1)[0];
      const [localExists, localHash] = await Promise.all([fs.exists(dest), getCachedHash(dest)]);

      if (!(localExists && localHash && localHash === hash)) {
        if (!localExists) console.info(`${dest} doesn't exists`);else if (!localHash) console.info(`no cached hash for ${dest}`);else console.info(`local hash for ${name} is ${localHash}. remote is ${hash}`);
        requiredFiles.push([src, dest]);
      } else {//console.info(`cache for ${name} is up to date`);
      }
    }

    const cacheFiles = Array.from(files.entries()).reduce((res, [dest, {
      hash
    }]) => {
      res[dest] = hash;
      return res;
    }, {});
    await cache.batch(cacheFiles);

    for (let index = 0; index < requiredFiles.length; index++) {
      let [src, dest] = requiredFiles[index];
      onProgress(`GET ${src.split("/").slice(-1)[0]} (${index + 1}/${requiredFiles.length})`);
      await writeToFile(src, dest);
      if (signal && signal.aborted) return;
    }
  } catch (e) {
    return onProgress("Failed to fetch config resources : " + e.message);
  }

  if (signal && signal.aborted) return; //Don't do nothing on abort

  config.categories = Array.isArray(config.categories) ? config.categories.map(c => {
    return typeof c === "string" ? {
      name: c
    } : c;
  }) : [];
  await cache.close().catch(e => {
    onProgress(`Failed to save cache file : ${e.message}`);
  });
  dispatch({
    config
  });
  onProgress("Updated configuration");
}

async function onProjectSnapshot(projects, {
  signal,
  onProgress,
  projectRef,
  dispatch
}) {
  projects = await projects;
  const items = {};
  let cache = new CacheStage("items");

  if (projects.length == 0) {
    throw new Error(`no project found in ${projectRef.id}`);
  }

  let requiredFiles = [];
  console.log("Projects :", projects);

  for (let [d] of projects) {
    if (d.active === false) continue;
    items[d.id] = d;
  }

  let files = projects.reduce((prev, [, files]) => new Map([...prev, ...files]), new Map());

  for (let [dest, {
    src,
    hash
  }] of files.entries()) {
    console.log();
    const name = dest.split("/").slice(-1)[0];
    const [localExists, localHash] = await Promise.all([fs.exists(dest), getCachedHash(dest)]);

    if (!(localExists && localHash && localHash === hash)) {
      requiredFiles.push([src, dest]);
    }
  }

  await cache.batch(Array.from(files.entries()).reduce((res, [dest, {
    hash
  }]) => {
    res[dest] = hash;
    return res;
  }, {}));

  for (let index = 0; index < requiredFiles.length; index++) {
    let [src, dest] = requiredFiles[index];
    onProgress(`Downloading ${src.split("/").slice(-1)[0]} (${index + 1}/${requiredFiles.length})`);
    await writeToFile(src, dest);
    if (signal && signal.aborted) return;
  }

  await cache.close().catch(e => {
    onProgress(`Failed to save cache file : ${e.message}`);
  });
  dispatch({
    items
  });
  onProgress("Updated item collections");
}

var fetch = window.fetch;

function dedupeList(uploads, list = []) {
  // Remove existing files
  const filteredUploads = uploads.filter((file, index) => {
    const idx = list.findIndex(i => {
      if (i.name !== file.name) return false;
      if (typeof i.conf !== "object" || !i.conf.mtime) return false;
      return file.mtime.getTime() === new Date(i.conf.mtime).getTime();
    });

    if (idx !== -1) {
      return false;
    } else if (uploads.findIndex(i => i.name == file.name && i.uri == file.uri) != index) {
      return false;
    } else {
      return true;
    }
  }); //Check for duplicates

  const dupes = filteredUploads.filter((file, index) => {
    return filteredUploads.findIndex(i => i.name == file.name) != index;
  });
  if (dupes.length != 0) throw new Error("found duplicates : " + dupes.map(d => d.name).join("\n"));
  return filteredUploads;
}
function sendFiles({
  target,
  videos = [],
  onStatusChange = console.warn.bind(null, "sendFiles status change : "),
  purge = false
}) {
  const abortController = new AbortController();

  if (!target) {
    return onStatusChange({
      status: "error",
      statusText: "no target product selected"
    });
  }

  if (typeof target !== "object" || !target.url) {
    return onStatusChange({
      status: "error",
      statusText: "bad target product provided"
    });
  }

  onStatusChange({
    status: "loading",
    statusText: "fetching playlist"
  });
  const url = `http://${target.url}`;
  const op = fetch(`${url}/playlist`, {
    method: "GET",
    signal: abortController.signal
  }).then(async r => {
    const list = await r.json(); //console.warn("List : ", list);

    let uploads = [];
    const errors = [];

    if (!r.ok) {
      return onStatusChange({
        status: "error",
        statusText: list.message
      });
    }

    for (const video of videos) {
      uploads.push({
        uri: `${video}`,
        name: filename(video),
        type: "video/mp4"
      });
    }

    onStatusChange({
      status: "loading",
      statusText: "Getting modification time"
    }); //Can throw an error but we don't want to catch it here

    const uploads_with_mtime = []; //Don't parallelize : it cause iOS to crash the app

    for (let upload of uploads) {
      const stat = await fs.stat(upload.uri);
      uploads_with_mtime.push(Object.assign({
        mtime: stat.mtime
      }, upload));

      if (abortController.signal.aborted) {
        let e = new Error("Transfer aborted during files.stat");
        e.name = "AbortError";
        throw e;
      }
    }

    const unique_uploads = dedupeList(uploads_with_mtime, list);
    onStatusChange({
      status: "loading",
      statusText: "Uploading files"
    });

    for (const file of unique_uploads) {
      try {
        if (list.find(i => i.name == file.name)) {
          onStatusChange({
            status: "loading",
            statusText: "Deleting old " + file.name
          });
          await fetch(`${url}/medias/${file.name}`, {
            method: "DELETE",
            signal: abortController.signal
          });
        }

        onStatusChange({
          status: "loading",
          statusText: "Uploading " + file.name
        });
        await uploadFile(url, file, abortController.signal);
      } catch (e) {
        if (e.name === "AbortError") throw e;
        console.warn(e);
        errors.push(e);
      }
    }

    let statusText;

    if (unique_uploads.length == 0) {
      statusText = "Rien à envoyer\n";
    } else {
      statusText = "Synchronisé :\n";
      statusText += unique_uploads.slice(0, 5).map(f => `${f.name} Envoyé`).join("\n");

      if (5 < unique_uploads.length) {
        statusText += `Et ${unique_uploads.length - 5} autres`;
      }
    }

    if (purge === true) {
      const unused_items = list.filter(i => {
        return uploads.findIndex(u => u.name == i.name) === -1;
      });

      for (let item of unused_items) {
        try {
          await fetch(`${url}/medias/${item.name}`, {
            method: "DELETE",
            signal: abortController.signal
          });
        } catch (e) {
          if (e.name == "AbortError") throw e;
          console.warn(e);
          errors.push(e);
        }
      }

      let s = 1 < unused_items.length ? "s" : "";
      statusText += `${unused_items.length} ancienne${s} vidéo${s} supprimée${s}\n`;
    }

    if (0 < errors.length) {
      console.warn('Errors : ', errors);
      return onStatusChange({
        status: "error",
        statusText: errors.map(e => `${e.sourceFile} : ${e.message}`).join("\n")
      });
    }

    onStatusChange({
      status: "idle",
      statusText
    });
  }).catch(e => {
    if (e.name === "AbortError") {
      return console.warn("Aborted files transfer to product"); // Do nothing : component doesn't wan't any updates after abort.
    }

    console.warn("Caught error : ", e);
    onStatusChange({
      status: "error",
      statusText: "Error : " + e.message
    });
  });
  return [abortController.abort.bind(abortController), op];
}
async function uploadFile(url, file, signal) {
  //It's a bad pattern but react-native's XMLHttpRequest implementation will randomly throw on missing file
  if (!(await fs.exists(file.uri))) {
    console.warn("File ", file.uri, "does not exists");
    throw new FileError(file.uri, "File does not exists");
  }

  const form = new FormData();
  form.append("file", file);

  try {
    let response = await fetch(`${url}/medias`, {
      body: form,
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data'
      },
      signal: signal
    });
    let body = await response.json();

    if (!response.ok) {
      if (body.message) {
        console.warn("Body : ", body);
        throw new FileError(file.uri, typeof body.message == 'object' ? JSON.stringify(body.message) : body.message);
      } else {
        throw new FileError(file.uri, response.statusText);
      }
    }

    if (file.mtime) {
      response = await fetch(`${url}/playlist`, {
        method: "PUT",
        signal: signal,
        headers: {
          'Accept': 'application/json',
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query: {
            name: file.name
          },
          modifier: {
            $set: {
              conf: {
                mtime: file.mtime
              }
            }
          }
        })
      });
      body = await response.json();

      if (!response.ok) {
        if (body.message) {
          throw new FileError(file.uri, typeof body.message == 'object' ? JSON.stringify(body.message) : body.message);
        } else {
          throw new FileError(file.uri, `Failed to get ${url}/playlist : ${response.statusText}`);
        }
      }
    }
  } catch (e) {
    if (e.name === "AbortError") throw e;
    throw new FileError(file.uri, e.message);
  }
}

export { CacheStage, FileError, cleanup, createStorage, dedupeList, filename, getCacheFiles, getCachedHash, loadFile, localFiles, lock, makeLocal, mediasPath, onConfigSnapshot, saveCacheFile, saveFile, sendFiles, setBasePath, storagePath, transformSnapshot, uploadFile, watchFiles };
