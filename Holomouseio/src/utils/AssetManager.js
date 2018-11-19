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

const findAllYamlFile = () => {
    return RNFS.readDir(RNFS.DocumentDirectoryPath)
    .then(files => {
        let yamlFiles = files.filter(f => f.name.endsWith('.yaml'));
        let allFiles = Promise.all(yamlFiles.map(f => RNFS.readFile(f.path)))
        
        return allFiles.then(result => {
            let res = {};
            for(let i = 0; i < result.length; i++) {
                let name = yamlFiles[i].name.replace('.yaml', '');
                res[name] = yaml.load(result[i]);
            }
            return res;
        });
    }).catch(err => {
        console.error(err);
    })
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

findAllYamlFile().then(obj => {
    yamlCache = obj;
    allTheme = findAll('Theme');
    allCatalogue = findAll('Collections');
})