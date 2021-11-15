// @flow

import variable from '../variables/platform';

export default (variables /* : * */ = variable) => {
  const prevNextTheme = {
    controlIcons:{
      color: variables.brandPrimary,
    },
  }

  return prevNextTheme;
};

