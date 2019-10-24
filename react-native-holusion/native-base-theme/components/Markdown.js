import variable from './../variables/platform';

export default (variables /* : * */ = variable) => {
    const mdTheme = {
        heading1:{
            fontFamily: variables.fontFamilyH1,
            color: variables.brandPrimary,
            fontSize: 28,
        },
        heading2:{
            fontFamily: variables.fontFamilyH2,
            color: variables.brandSecondary,
            fontSize: 24,
        }
    };

  return mdTheme;
};

