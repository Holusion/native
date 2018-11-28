import { network, assetManager } from '@holusion/react-native-holusion'

export const activeOnlyLoop = async (url) => {
    if(url) {
        await network.desactiveAll(url);

        let yamlLoop = assetManager.getObjectFromType('loop', true);
        for(elem in yamlLoop) {
            await network.active(url, elem)
        }
    }
}