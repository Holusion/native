

export const getUniqueId = jest.fn(()=> "0.0.0");

export const getDeviceName = jest.fn(()=>Promise.resolve("example"));

export const getApplicationName = ()=> "com.holusion.native.example";