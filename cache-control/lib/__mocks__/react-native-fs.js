
export default {
  uploadFiles: jest.fn(()=>({jobId:10, promise: Promise.resolve({statusCode: 200, body: `{"code": 200, "message": "OK"}`})})),
  stopUpload: jest.fn(()=>Promise.resolve()),
}