import fs from "filesystem";

import AsyncLock from 'async-lock';

export const lock = new AsyncLock({ });

import {storagePath} from "./path";

import {FileError} from "./errors";

export async function loadFile(name) {
  return await lock.acquire(`${name}-rw`, () => fs.readFile(`${storagePath()}/${name}`, 'utf8'))
}

export async function saveFile(name, data) {
  await lock.acquire(`${name}-rw`, async () => {
    try {
      //console.log("write ", data, "to", `${storagePath()}/${name}`);
      await fs.atomicWrite(`${storagePath()}/${name}`, data);
    } catch (e) {
      throw new FileError(`${storagePath()}/${name}`, e.message);
    }
  });
}

