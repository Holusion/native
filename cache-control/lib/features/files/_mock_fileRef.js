export function makeFileRef(name, opts={}){
  return Object.assign({
    src: `gs://example.com/${name}`,
    hash: "xxxxxx",
    name,
    size: 16,
    contentType: /\.mp4/.test(name)?"video/mp4": "image/png",
  }, opts);
}