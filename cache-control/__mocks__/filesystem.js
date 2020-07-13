
let contents = {};

const readMock = (path)=>{
    if(typeof contents[path] === "undefined"){
        let e = new Error(`No such file or directory : ${path}`);
        e.code = "ENOENT";
        return Promise.reject(e);
    }
    return Promise.resolve(contents[path]);
}

const writeMock = (path, data) =>{
    contents[path] = data;
    return Promise.resolve();
}

const renameMock = (src, dest)=>{
    if(typeof contents[src] === "undefined"){
        let e = new Error(`No such file or directory : ${src}`);
        e.code = "ENOENT";
        return Promise.reject(e);
    }
    contents[dest] = contents[src];
    delete contents[src];
    return Promise.resolve();
}

export default {
    stat: jest.fn(()=>Promise.resolve({mtime:new Date(0)})),
    exists: jest.fn(()=> Promise.resolve(true)),
    readFile: jest.fn(readMock),
    writeFile: jest.fn(writeMock),
    rename: jest.fn(renameMock),
    readdir: jest.fn(()=>Promise.resolve()),
    mkdir: jest.fn(()=> Promise.resolve()),
    rmdir: jest.fn(()=>Promise.resolve()),
    unlink: jest.fn(()=>Promise.resolve()),
    _reset: ()=>{ contents = {}},
    _set: (path, data)=> {contents[path] = data},
    get contents(){ return contents},
};