import fs from "./filesystem";


export default jest.fn((src, dest)=>fs.writeFile(dest, src));