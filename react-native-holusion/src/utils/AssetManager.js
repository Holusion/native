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

const loadAlYamlFiles = async () => {
    let files = await RNFS.readDir(RNFS.DocumentDirectoryPath);
    let yamlFiles = files.filter(f => f.name.endsWith('.yaml'));
    yamlFiles.sort((a, b) => a.name.localeCompare(b.name));
    let allFiles = Promise.all(yamlFiles.map(f => RNFS.readFile(f.path)))
    
    let result = await allFiles;
    let res = {};
    for(let i = 0; i < result.length; i++) {
        let name = yamlFiles[i].name.replace('.yaml', '');
        res[name] = yaml.load(result[i]);
    }
    return res;
}

const findAll = (type) => {
    let uniq = [];
    for(obj of Object.keys(yamlCache)) {
        if(uniq.indexOf(yamlCache[obj][type]) == -1) {
            uniq.push(yamlCache[obj][type]);
        } 
    }
    return uniq;
}

export const manage = async () => {
    yamlCache = await loadAlYamlFiles();
    allTheme = findAll('Theme');
    allCatalogue = findAll('Collections');
}
