import yaml from 'js-yaml';
import RNFS from 'react-native-fs'

export let yamlCache = {};
export let allTheme = [];
export let allCatalogue = [];

export const getObjectFromType = (type, content) => {
    let res = [];
    for(let key of Object.keys(yamlCache)) {
        if(yamlCache[key][type] === content) {
            res.push(key)
        }
    }
    return res;
}

const loadAllYamlFiles = async () => {
    let files = await RNFS.readDir(RNFS.DocumentDirectoryPath);
    let yamlFiles = files.filter(f => f.name.endsWith('.yaml'));
    yamlFiles.sort((a, b) => a.name.localeCompare(b.name));
    let names = yamlFiles.map(elem => elem.name).map(name => name.replace(".yaml", ""));
    let yamlLoads = yamlFiles.map((f, i) => 
        RNFS.readFile(f.path).then(filePath => {
            return new Promise((resolve) => {
                try {
                    let load = yaml.safeLoad(filePath);
                    resolve({key: names[i], value: load});
                } catch(err) {
                    // We should throw, but if we throw, all the file coud be not loaded correctly, so we send an error for the corresponding key to the application
                    // The error here is a YAMLException (throw when the file has syntax error)
                    resolve({key: names[i], err: err});
                }
            })
        })
    )
    
    return Promise.all(yamlLoads).then(values => values.reduce((map, elem) => {
        if(elem.err) {
            map[elem.key] = elem.err;
        } else {
            map[elem.key] = elem.value;
        }
        return map;
    }, {}));
}

const findAll = (type) => {
    let uniq = [];
    for(obj of Object.keys(yamlCache)) {
        if(yamlCache[obj][type] && uniq.indexOf(yamlCache[obj][type]) == -1) {
            uniq.push(yamlCache[obj][type]);
        } 
    }
    return uniq;
}

export const manage = async () => {
    yamlCache = await loadAllYamlFiles();
    allTheme = findAll('Theme');
    allCatalogue = findAll('Collections');
    return Object.keys(yamlCache).filter(elem => yamlCache[elem] instanceof yaml.YAMLException).map(elem => ({name: elem, error: yamlCache[elem]}));
}
