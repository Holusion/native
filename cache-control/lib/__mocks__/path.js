


export const storagePath = jest.fn(()=> "/tmp/storage");
export const mediasPath = jest.fn(()=>"/tmp/medias");

export const createStorage = jest.fn(()=>Promise.resolve());