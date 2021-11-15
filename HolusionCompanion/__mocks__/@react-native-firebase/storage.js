const {URL} = require("url");
const getMetadata = jest.fn(()=> Promise.resolve({}));
const writeToFile = jest.fn(()=>Promise.resolve());
const refFromURL = jest.fn((u)=>{
  let ref = new URL(u);
  return { 
    name: ref.pathname.split("/").slice(-1),
    bucket: {
      name: ref.hostname
    },
    getMetadata,
    writeToFile,
  }
});

export default ()=> ({
  refFromURL,
  _getMetadata: getMetadata,
  _writeToFile: writeToFile,
})