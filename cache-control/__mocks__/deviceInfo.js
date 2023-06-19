

export const getUniqueId = jest.fn(()=> {
  if (0.5 < Math.random()){
    //Returned by react-native in iOS
    return Promise.resolve("FCDBD8EF-62FC-4ECB-B2F5-92C9E79AC7F9");
  }else {
    //returned on linux machines
    return Promise.resolve('ExOGU5C_RKyCe_dPhjx7Lg');
  }
})

export const getDeviceName = jest.fn(()=>Promise.resolve("example"));

export const getApplicationName = ()=> "HolusionCompanion";