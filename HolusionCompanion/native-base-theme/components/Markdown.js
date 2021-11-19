import variable from './../variables/platform';

export default (variables /* : * */ = variable) => {
    const mdTheme = {
        heading1:{
            fontSize: variables. fontSizeH1,
            fontFamily: variables.fontFamilyH1,
            color: variables.brandPrimary,
        },
        heading2:{
            fontSize: variables. fontSizeH2,
            fontFamily: variables.fontFamilyH2,
            color: variables.brandSecondary,
        },
        text: {
            fontSize: variables.DefaultFontSize,
        },
    };

  return mdTheme;
};

