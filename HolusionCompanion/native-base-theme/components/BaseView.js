// @flow

import variable from './../variables/platform';

export default (variables /* : * */ = variable) => {
  let baseViewTheme = {
      contentView: {
        backgroundColor: variables.descriptionBackground,
        height: variables.descriptionHeight + "%",
        width: variables.descriptionWidth + "%",
        top: variables.descriptionTop + "%",
        right: variables.descriptionRight + "%",
        
      },
      image:{
      }
    }
    if(variables.descriptionBackground !== "transparent" && !variables.descriptionTop && !variables.descriptionRight){
      baseViewTheme.contentView.position = "relative";
      baseViewTheme.contentView.height = "100%";
      baseViewTheme.contentView.top = "0%";
      baseViewTheme.contentView.right = "0%";
    }
    if(variables.descriptionBackground == "transparent"){
      baseViewTheme.contentView.maxHeight = 100 - variables.descriptionTop + "%";
    }
    
  return baseViewTheme;
};

