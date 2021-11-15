// @flow

import variable from './../variables/platform';

export default (variables /* : * */ = variable) => {
  const textTheme = {
    fontSize: variables.DefaultFontSize,
    fontFamily: variables.fontFamily,
    color: variables.textColor,
    '.note': {
      color: '#a7a7a7',
      fontSize: variables.noteFontSize
    },
    '.primary': {
      color: variables.brandPrimary,
    },
    '.secondary': {
      color: variables.brandSecondary,
    }
  };

  return textTheme;
};
