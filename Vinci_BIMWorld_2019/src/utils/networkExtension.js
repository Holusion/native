import { network } from '@holusion/react-native-holusion'

export const activeOnlyYamlItems = (url, yamlFiles) => {
    network.activeWithPredicate(url, (elem) => {
        let name = elem.name.split('.')[0];
        return yamlFiles[name];
    }, true)
}