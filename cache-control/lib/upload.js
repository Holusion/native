import fs from "filesystem";

import {FileError} from "./readWrite";

import {filename} from "./path";

export function dedupeList(uploads, list = []) {
  // Remove existing files
  const filteredUploads = uploads.filter((file, index) => {
    const idx = list.findIndex((i) => {
      if (i.name !== file.name) return false;
      if (typeof i.conf !== "object" || !i.conf.mtime) return false;
      return file.mtime.getTime() === (new Date(i.conf.mtime)).getTime();
    });
    if (idx !== -1) {
      return false;
    } else if (uploads.findIndex((i) => i.name == file.name && i.uri == file.uri) != index) {
      return false;
    } else {
      return true;
    }
  })
  //Check for duplicates
  const dupes = filteredUploads.filter((file, index) => {
    return filteredUploads.findIndex((i) => i.name == file.name) != index;
  })
  if (dupes.length != 0) throw new Error("found duplicates : " + dupes.map(d => d.name).join("\n"));

  return filteredUploads;
}

export function sendFiles({ target, videos = [], onStatusChange = console.warn.bind(null, "sendFiles status change : "), purge = false }) {
  const abortController = new AbortController();
  if (!target) {
    return onStatusChange({ status: "error", statusText: "no target product selected" })
  }
  if (typeof target !== "object" || !target.url) {
    return onStatusChange({ status: "error", statusText: "bad target product provided" });
  }
  onStatusChange({ status: "loading", statusText: "fetching playlist" });
  const url = `http://${target.url}`;
  const op = fetch(`${url}/playlist`, {
    method: "GET",
    signal: abortController.signal
  })
  .then(async r => {
    const list = await r.json();
    //console.warn("List : ", list);
    let uploads = [];
    const errors = [];
    if (!r.ok) {
      return onStatusChange({ status: "error", statusText: list.message });
    }
    for (const video of videos) {
      uploads.push({
        uri: `${video}`,
        name: filename(video),
        type: "video/mp4"
      })
    }

    onStatusChange({ status: "loading", statusText: "Getting modification time" });
    //Can throw an error but we don't want to catch it here
    const uploads_with_mtime = [];
    //Don't parallelize : it cause iOS to crash the app
    for (let upload of uploads) {
      try{
        const stat = await fs.stat(upload.uri);
        uploads_with_mtime.push(Object.assign({ mtime: stat.mtime }, upload))
      }catch(e){
        let wrap = new Error("Could no find file's mtime : " + e.message);
        wrap.stack = e.stack;
        errors.push(wrap);
      }
      if (abortController.signal.aborted) {
        let e = new Error("Transfer aborted during files.stat");
        e.name = "AbortError";
        throw e;
      }
    }

    const unique_uploads = dedupeList(uploads_with_mtime, list);
    onStatusChange({ status: "loading", statusText: "Uploading files" });
    for (const file of unique_uploads) {
      try {
        if (list.find(i => i.name == file.name)) {
          onStatusChange({ status: "loading", statusText: "Deleting old " + file.name });
          await fetch(`${url}/medias/${file.name}`, { method: "DELETE", signal: abortController.signal });
        }
        onStatusChange({ status: "loading", statusText: "Uploading " + file.name });
        await uploadFile(url, file, abortController.signal);
      } catch (e) {
        if (e.name === "AbortError") throw e;
        errors.push(e);
      }
    }
    let statusText;
    if (unique_uploads.length == 0) {
      statusText = "Rien à envoyer\n";
    } else {
      statusText = "Synchronisé :\n";
      statusText += unique_uploads.slice(0, 5).map(f => (`${f.name} Envoyé`)).join("\n")
      if (5 < unique_uploads.length) {
        statusText += `Et ${unique_uploads.length - 5} autres`;
      }
    }

    if (purge === true) {
      const unused_items = list.filter((i) => {
        return uploads.findIndex(u => u.name == i.name) === -1;
      })
      for (let item of unused_items) {
        try {
          await fetch(`${url}/medias/${item.name}`, { method: "DELETE", signal: abortController.signal });
        } catch (e) {
          if (e.name == "AbortError") throw e;
          console.warn(e);
          errors.push(e);
        }
      }
      let s = 1 < unused_items.length ? "s" : ""
      statusText += `${unused_items.length} ancienne${s} vidéo${s} supprimée${s}\n`;
    }


    if (0 < errors.length) {
      console.warn('Errors : ', errors);
      return onStatusChange({ status: "error", statusText: errors.map(e => `${e.sourceFile} : ${e.message}`).join("\n") });
    }
    onStatusChange({ status: "idle", statusText });

  }).catch(e => {
    if (e.name === "AbortError") {
      return console.warn("Aborted files transfer to product");// Do nothing : component doesn't wan't any updates after abort.
    }
    console.warn("Caught error : ", e.message, e.stack);
    onStatusChange({ status: "error", statusText: "Error : " + e.message });
  });

  return [abortController.abort.bind(abortController), op];
}

export async function uploadFile(url, file, signal) {
  //It's a bad pattern but react-native's XMLHttpRequest implementation will randomly throw on missing file
  if (!await fs.exists(file.uri)) {
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
        'Content-Type': 'multipart/form-data',
      },
      signal: signal,
    });
    let body = await response.json();
    if (!response.ok) {
      if (body.message) {
        console.warn("Body : ", body);
        throw new FileError(file.uri, (typeof body.message == 'object') ? JSON.stringify(body.message) : body.message);
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
          query: { name: file.name },
          modifier: {
            $set: {
              conf: { mtime: file.mtime }
            }
          },
        })
      });
      body = await response.json();
      if (!response.ok) {
        if (body.message) {
          throw new FileError(file.uri, (typeof body.message == 'object') ? JSON.stringify(body.message) : body.message);
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