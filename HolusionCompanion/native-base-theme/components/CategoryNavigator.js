// @flow

import variable from './../variables/platform';

export default (variables /* : * */ = variable) => {
  const catTheme = {
        title: {
          //From https://github.com/software-mansion/react-native-screens/tree/master/native-stack#headertitlestyle
          color: variables.titleFontColor,
          fontFamily: variables.titleFontfamily,
          fontSize: variables.titleFontSize,
        },
        header: {
          backgroundColor: variables.headerStyle,
        },
        back: {
          fontFamily: variables.titleFontfamily,
          fontSize: variables.titleFontSize,
        }
    }
  return catTheme;
};

