

export function defaultCategoryFactory(projectName){
  return function defaultCategoryTransform(d){
    if(typeof d.category === "undefined") d.category = d.id;
    return [d, new Set()];
  };
}