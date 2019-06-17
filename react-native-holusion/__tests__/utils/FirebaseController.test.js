import FirebaseController from '../../src/utils/FirebaseController';
import FirebaseDownloadError from '../../src/errors/FirebaseDownloadError';

jest.mock('react-native-fs', () => {
    const dir = [{name: "foo.yaml", path: "foo.yaml"}, {name: "bar.yaml", path: "bar.yaml"}, {name: "error.yaml", path: "error.yaml"}];
    const content1 = `---
    Theme: theme
    Collections: collections
    `
    const content2 = `---
    Theme: blabla
    Collections: collections
    `
    const content3 = `"toString": !<tag:yaml.org,2002:js/function> "function(){very_bad_things();}`

    return {
        readDir: s => {
            return Promise.resolve(dir);
        },
        readFile: s => {
            switch(s) {
                case "bar.yaml": return Promise.resolve(content2);
                case "foo.yaml": return Promise.resolve(content1);
                default: return Promise.resolve(content3);
            }
        }
    }
})

describe("FirestoreController", () => {
    describe(".constructor", () => {
        it("verify collection accessing", () => {
            const controller = new FirebaseController(("foo"));
            expect(controller.collection.id).toBe('foo')
        })
    })
    
    describe(".downloadFile", () => {
        it("when ref exists", async () => {
            const controller = new FirebaseController(("foo"));
            const ref = {
                downloadFile: async (path) => {}
            }
            const res = await controller.downloadFile(ref, "foo");
            expect(res).toBe(undefined);
        })

        it("check if a FirebaseDownloadError is thrown when downloadFile throw", async () => {
            const controller = new FirebaseController(("foo"));
            const ref = {
                downloadFile: async (path) => {throw {code: "anycode", message: "blabla"}}
            }
            try {
                await controller.downloadFile(ref, "foo");
                fail(new Error("this should throw an error"));
            } catch(err) {
                expect(err instanceof FirebaseDownloadError).toBe(true);
                expect(err.message).toBe("blabla");
                expect(err.fileName).toBe("foo");
            }
        })
    })

    describe(".getFiles", () => {
        it("basic usage", async () => {
            const controller = new FirebaseController(("foo"));
            const res = await controller.getFiles([{name: 'projects', properties: ['uri']}]);
            expect(res.length).toBe(0);
        })

        it("when files not found", async() => {
            const controller = new FirebaseController(("foo"));
            const res = await controller.getFiles([{name: 'projects', properties: ['error']}]);
            expect(res.length).toBe(2);
        })

        it("when files not found and some files found", async () => {
            const controller = new FirebaseController(("foo"));
            const res = await controller.getFiles([{name: 'projects', properties: ['uri', 'error']}]);
            expect(res.length).toBe(2);
        })
    })
})