import {FileError} from "../errors";

/**
 * uses native fetch API. Good for platforms where fetch isn't polyfilled
 * @param {string} url - target url (eg. http://192.168.1.10) 
 * @param {object} file - a file reference
 * @param {string} file.uri - path to file on local filesystem
 * @param {string} file.name - the file's name that will be used as identifier in playlist
 * @param {string} [file.hash] - file's hash
 * @param {AbortSignal} [signal] - an AbortController's signal to give to fetch() 
 */
export async function uploadFile(url, file, signal) {
  let body;
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
    if (!response.ok) {
      try{
        body = await response.json();
      }catch(e){
        //Invalid JSON
        body = {};
      }
      if (body.message) {
        throw new FileError(file.uri, (typeof body.message == 'object') ? JSON.stringify(body.message) : body.message);
      } else {
        throw new FileError(file.uri, response.statusText);
      }
    }
    if (file.hash) {
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
              conf: { hash: file.hash }
            }
          },
        })
      });
      if (!response.ok) {
        try{
          body = await response.json();
        }catch(e){
          //Error is always Invalid JSON
          body = {};
        }
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