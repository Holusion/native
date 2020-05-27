import {promises as fs} from "fs";

export default {
    stat: jest.fn(()=>Promise.resolve({mtime:new Date(0)})),
    exists: jest.fn(()=> true),
    DocumentDirectoryPath: "/tmp/react-native-holusion-tests",
    readFile: jest.fn(fs.readFile),
    writeFile: jest.fn(()=>Promise.resolve()),
    readDir: jest.fn(fs.readdir),
    mkdir: jest.fn(()=> Promise.resolve),
    unlink: jest.fn(()=>Promise.resolve()/* do not auto-mock to prevent accidental unlinks */)
};