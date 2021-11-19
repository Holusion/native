'use strict'

const db = [{uri: "gs://foo.yaml", error: "error"}, {uri: "gs://bar.yaml", error: "error"}, {erroruri: "gs://error.yaml"}]
const files = ["foo.yaml", "bar.yaml"];

const DocumentSnapshot = jest.fn((dbItem) => ({
    data: jest.fn(() => dbItem)
}))
const docs = db.map(elem => DocumentSnapshot(elem));


const collection = jest.fn((name) => {
    return {
        id: name,
        doc: jest.fn((projectName) => {
            return {
                id: projectName,
                collection: collection,
                onSnapshot: jest.fn(()=>jest.fn()),
            }
        }),
        get: jest.fn(() => ({
            docs: docs,
            forEach: jest.fn((fn) => docs.forEach(fn))
        })),
        onSnapshot: jest.fn(()=>jest.fn()),
    }
});


export const auth = jest.fn(()=>({}))

export const storage = {
    _getMetadata: jest.fn(),
    ref: jest.fn(),
    refFromURL: jest.fn(),
    _reset(){
        storage.ref.mockReset();
        storage.ref.mockImplementation((path)=>{
            return {
              getMetadata: jest.fn(()=>Promise.resolve({
                  size: 24,
                  md5Hash: "xxxxxx",
                  contentType: /mp4$/.test(path)?"video/mp4": "image/png",
              })),
              name: path.split("/").slice(-1)[0],
              bucket: "example.com",
              fullPath: path,
            }
        });
        storage.refFromURL.mockReset();
        storage.refFromURL.mockImplementation((url)=>{
            const u = new URL(url);
            if(! u.pathname) throw new Error(`${url} has no valid pathname (this is a mock error, not a real one)`);
            return storage.ref(u.pathname.slice(1));
        });
    }
};

export const firestore = jest.fn();

export const app = jest.fn();

export const firebase = {
    app,
    auth,
    _collection: collection,
    _reset(){
        storage._reset();
        firestore.mockReset();
        firestore.mockImplementation(() => ({
            collection: collection,
            enableNetwork: jest.fn(()=>Promise.resolve()),
            disableNetwork: jest.fn(()=>Promise.resolve()),
        }));
        app.mockReset();
        app.mockImplementation(()=>({
            firestore,
            storage: jest.fn(()=> storage)
        }));
    }
}
        
firebase._reset();