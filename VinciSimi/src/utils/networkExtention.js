import { network, assetManager } from '@holusion/react-native-holusion'

export const activeOnlyLoop = async (url) => {
    if(url) {
        await network.desactiveAll(url);

        let yamlLoop = assetManager.getObjectFromType('loop', true).map(name => `${name}.mp4`)
        yamlLoop.sort((a, b) => a.localeCompare(b));
        for(elem of yamlLoop) {
            await network.active(url, elem)
        }
    }
}