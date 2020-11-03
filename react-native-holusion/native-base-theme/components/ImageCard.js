// @flow

import variable from './../variables/platform';

export default (variables /* : * */ = variable) => {
  const cardTheme = {
        container: {
            borderColor: variables.brandPrimary,
        },
        titleContainer: {
          backgroundColor: variables.brandPrimary,
        },
        titleText: {
            color: variables.cardTitleColor
        },
        icon: {
          color: variables.brandPrimary
        }
    }

  return cardTheme;
};

