
function ENOENT(path){
    let e = new Error(`No such file or directory : ${path}`);
    e.code = "ENOENT";
    return e;
}

const fs =  {
    stat: jest.fn(),
    exists: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn(),
    atomicWrite: jest.fn(),
    rename: jest.fn(),
    readdir: jest.fn(),
    mkdir: jest.fn(),
    rmdir: jest.fn(),
    unlink: jest.fn(),
    _reset: ()=>{ 
        let contents = {};
        for(let m of Object.keys(fs)){
            if(typeof fs[m].mockReset === "function"){
                fs[m].mockReset();
            }
        }
        fs.stat.mockImplementation(()=>Promise.resolve({mtime:new Date(0)}));
        fs.exists.mockImplementation((p)=> Promise.resolve(!!contents[p]));
        fs.readFile.mockImplementation((path)=>{
            if(typeof contents[path] === "undefined"){
                
                return Promise.reject(ENOENT(path));
            }
            return Promise.resolve(contents[path]);
        });

        const writeMock = (path, data) =>{
            contents[path] = data;
            return Promise.resolve();
        }
        fs.writeFile.mockImplementation(writeMock);
        fs.atomicWrite.mockImplementation(writeMock);

        fs.rename.mockImplementation((src, dest)=>{
            if(typeof contents[src] === "undefined"){
                return Promise.reject(ENOENT(src));
            }
            contents[dest] = contents[src];
            delete contents[src];
            return Promise.resolve();
        });
        fs.readdir.mockImplementation(()=>Promise.resolve());
        fs.mkdir.mockImplementation(()=> Promise.resolve());
        fs.rmdir.mockImplementation(()=>Promise.resolve());
        fs.unlink.mockImplementation((path)=>{
            if(contents[path]){
                delete contents[path];
                return Promise.resolve();   
            }else{
                return Promise.reject(ENOENT(path));
            }
        })
        fs._set = (path, data)=> {contents[path] = data};
        fs.contents = contents;
    }
};

fs._reset();
export default fs;