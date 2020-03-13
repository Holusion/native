export default {
    stat: jest.fn(()=>Promise.resolve({mtime:new Date(0)})),
    exists: jest.fn(()=> true)
};