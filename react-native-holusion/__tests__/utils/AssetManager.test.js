import * as assetManager from "../../src/utils/AssetManager";

jest.mock('react-native-fs', () => {
    const dir = [{name: "foo.yaml", path: "foo.yaml"}, {name: "bar.yaml", path: "bar.yaml"}];
    const content1 = `---
    Theme: theme
    Collections: collections
    `
    const content2 = `---
    Theme: blabla
    Collections: collections
    `

    return {
        readDir: s => {
            return Promise.resolve(dir);
        },
        readFile: s => {
            return s === "bar.yaml" ? Promise.resolve(content2) : Promise.resolve(content1);
        }
    }
})

beforeEach(async () => {
    await assetManager.manage();
})

test('yamlCache', async () => {
    expect(assetManager.yamlCache).toEqual({
        foo: {
            Theme: 'theme',
            Collections: 'collections'
        },
        bar: {
            Theme: 'blabla',
            Collections: 'collections'
        }
    })
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
