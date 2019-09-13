// @flow

import variable from './../variables/platform';

export default (variables /* : * */ = variable) => {
  const cardTheme = {
        container: {
            borderColor: variables.brandPrimary,
        },
        titleText: {
            color: variables.brandPrimary,
        },
        icon: {
          color: variables.brandPrimary
        }
    }

  return cardTheme;
};

