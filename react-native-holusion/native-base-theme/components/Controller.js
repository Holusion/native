// @flow

import variable from './../variables/platform';

export default (variables /* : * */ = variable) => {
  const controllerTheme = {
    controlIcons:{
      color: variables.brandPrimary,
    },
    icon: {
      color: "#fff",
    }
  }

  return controllerTheme;
};

