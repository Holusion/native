jest.mock('react-native-firebase', () => {
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
                    collection: collection
                }
            }),
            get: jest.fn(() => ({
                docs: docs,
                forEach: jest.fn((fn) => docs.forEach(fn))
            }))
        }
    })

    const ref = jest.fn((url) => ({
        downloadFile: jest.fn(async (path) => {
            if(files.filter(elem => url.endsWith(elem)).length === 0) throw new Error("blabla"); 
        })
    }))

    return {
        firestore: jest.fn(() => ({
            collection: collection
        })),
        storage: jest.fn(() => ({
            refFromURL: ref
        }))
    }
});