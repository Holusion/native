import * as zeroconfManager from '../../src/utils/zeroconfManager'

test('.getUrl when no url', () => {
    expect(zeroconfManager.getUrl()).toEqual(null);
})