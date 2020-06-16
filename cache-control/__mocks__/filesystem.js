

export default {
    stat: jest.fn(()=>Promise.resolve({mtime:new Date(0)})),
    exists: jest.fn(()=> Promise.resolve(true)),
    readFile: jest.fn(()=>Promise.resolve()),
    writeFile: jest.fn(()=>Promise.resolve()),
    readdir: jest.fn(()=>Promise.resolve()),
    mkdir: jest.fn(()=> Promise.resolve()),
    rmdir: jest.fn(()=>Promise.resolve()),
    unlink: jest.fn(()=>Promise.resolve()),
};