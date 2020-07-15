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

const ref = jest.fn((url) => ({
    getMetadata: ()=>Promise.resolve({}),
}));


export const storage = jest.fn(() => ({
  refFromURL: ref
}));

export const firestore = jest.fn(() => ({
  collection: collection,
  enableNetwork: jest.fn(()=>Promise.resolve()),
  disableNetwork: jest.fn(()=>Promise.resolve()),
}));

export const app = ()=>({
    firestore,
    storage
});

export const firebase = {
    app,
    storage,
    firestore,
}