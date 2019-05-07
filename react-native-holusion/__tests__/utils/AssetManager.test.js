import * as assetManager from "../../src/utils/AssetManager";

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

beforeEach(async () => {
    await assetManager.manage();
})

test('yamlCache', async () => {
    expect(assetManager.yamlCache).toMatchObject({
        foo: {
            Theme: 'theme',
            Collections: 'collections'
        },
        bar: {
            Theme: 'blabla',
            Collections: 'collections'
        }
    })
    expect(assetManager.yamlCache.error.name).toEqual("YAMLException");
})

test('allTheme', async () => {
    expect(assetManager.allTheme).toEqual(['blabla', 'theme'])
})

test('allCatalogue', async () => {
    expect(assetManager.allCatalogue).toEqual(['collections'])
})

test('.getObjectFromType', async () => {
    expect(assetManager.getObjectFromType("Theme", "blabla")).toEqual(['bar'])
})
