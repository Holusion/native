'use strict';
import {parseLink} from "./filerefs";

export function* matchImages(txt){ 
  let m, re = /!\[[^\]]*\]\((?!https?:\/\/)(?<filename>.*?)(?=\"|\))(?<optionalpart>\".*\")?\)/g;
  while((m = re.exec(txt)) !== null){
    yield m;
  }
}

export function searchAndReplace(txt, project){
  let res="", files = new Set(), offset=0;
  for(let m of matchImages(txt)){
    if(offset < m.index){
      res += txt.slice(offset, m.index)
    }
    const [src, dest] = parseLink(m.groups.filename, project);
    res += m[0].replace(m.groups.filename, dest);
    files.add(src);
    offset = m.index + m[0].length;
  }

  if(offset < txt.length){
    res += txt.slice(offset);
  }
  return [res, files];
}

export function _transformMarkdown(projectName, d){
  let res = {}, filelist = new Set();
  for (let key of ["mainText", "abstract", "description"]){
    if(!d[key]) continue;
    let files;
    ([res[key], files] = searchAndReplace(d[key], projectName))
    filelist = new Set([...filelist, ...files]);
  }
  return [{
    ...d,
    ...res,
  }, filelist]
}

/**
 * @type {import(".").TransformFactory}
 */
export function transformMarkdownFactory(projectName){
  return _transformMarkdown.bind(null, projectName)
}