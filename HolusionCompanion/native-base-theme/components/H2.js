// @flow

import variable from './../variables/platform';

export default (variables /* : * */ = variable) => {
  const h2Theme = {
    color: variables.textColor,
    fontSize: variables.fontSizeH2,
    fontFamily: variables.fontFamilyH2,
    lineHeight: variables.lineHeightH2,
    '.primary':{
      color: variables.brandPrimary
    },
    '.secondary':{
      color: variables.brandSecondary
    }
  };

  return h2Theme;
};
