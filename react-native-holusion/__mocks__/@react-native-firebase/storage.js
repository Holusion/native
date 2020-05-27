
const getMetadata = jest.fn(()=> Promise.resolve({}));
const writeToFile = jest.fn(()=>Promise.resolve());
const refFromURL = jest.fn(()=>({
  name: "bar.mp4",
  bucket: {
    name: "foo"
  },
  getMetadata,
  writeToFile,
}));

export default ()=> ({
  refFromURL,
})