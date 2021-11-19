'use strict';
import {firebase} from "firebase";
import {mediasPath} from "../path";

/**
 * @typedef FileRef
 * @property {string} src - source URL (gs://[...])
 * @property {string} dest - destination absolute pah (without file:// prefix)
 * @property {string} hash - base64-encoded md5 hash
 * @property {string} [contentType] - might be missing on improper uploads
 * @property {number} size
 */

/**
 * 
 * @param {string} src URL of a stored file (gs://[...])
 * @returns {Promise<[string, FileRef]>}
 */
export async function getMetadata(src){
  const storage = firebase.app().storage();
  const ref = storage.refFromURL(src);
  const name = ref.name;
  const dest = `${mediasPath()}/${name}`;
  if(!name) throw new Error(`Invalid ref name ${name} for source : ${src}`);
  let {md5Hash, size, contentType} = await ref.getMetadata();
  
  return [dest, {
    src,
    dest: dest,
    hash: md5Hash,
    contentType,
    size,
  }];
}

/**
 * 
 * @param {string} src - source path (eg. gs://example.com/foo.png or //foo.png)
 * @returns {[string, string]} - source and destination URIs (eg. [gs://example.com/foo.png, file:///storage/foo.png])
 */
export function parseLink(src, project){
  const storage = firebase.app().storage();
  let ref;
  if(/^gs:\/\/.*/.test(src)){
    ref = storage.refFromURL(src);
  }else{
    if(!project) throw new Error("Unsupported call to parseLink with project not specified and a relative link : "+src);
    ref = storage.ref(`applications/${project}/${src}`)
  }
  if(!ref || !ref.bucket || !ref.fullPath) throw new Error(`Invalid ref to ${src}. Maybe it is not a valid storage object`);
  const name = ref.name;
  const dest = `file://${mediasPath()}/${name}`;
  return [`gs://${ref.bucket}/${ref.fullPath}`, dest];
}