import fs from "filesystem";
import {join} from "filepaths";

import AsyncLock from 'async-lock';

export const lock = new AsyncLock({ });

import {storagePath} from "./path";

import {FileError} from "./errors";

export async function loadFile(name) {
  return await lock.acquire(`${name}-rw`, () => fs.readFile(join(storagePath(), name), 'utf8'))
}

export async function saveFile(name, data) {
  await lock.acquire(`${name}-rw`, async () => {
    try {
      //console.log("write ", data, "to", `${storagePath()}/${name}`);
      await fs.atomicWrite(join(storagePath(), name), data);
    } catch (e) {
      throw new FileError(join(storagePath(), name), e.message);
    }
  });
}

