// @flow

export default () => {
  const contentTheme = {
    flex: 1,
    backgroundColor: 'transparent',
    'NativeBase.Segment': {
      borderWidth: 0,
      backgroundColor: 'transparent'
    },
    ".settings": {
      "NativeBase.ListItem": {
        "NativeBase.Left": {
          "NativeBase.Text": {
            fontSize: 17,
            lineHeight: 17,
          },
        },
        "NativeBase.Body": {
          "NativeBase.Text": {
            fontSize: 17,
            lineHeight: 17,
          },
        },
        "NativeBase.Right": {
          "NativeBase.Text": {
            fontSize: 17,
            lineHeight: 17,
          },
        },
      }
    }
  };

  return contentTheme;
};
