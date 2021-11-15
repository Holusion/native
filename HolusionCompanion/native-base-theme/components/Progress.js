// @flow

import variable from '../variables/platform';

export default (variables /* : * */ = variable) => {
  const progressTheme = {
    ".pending": {
      progress: {
        backgroundColor: "#00A5E8ff",
      }
    },
    ".blocked": {
      progress: {
        backgroundColor: "#FF9966FF",
      }
    },
    ".complete": {
      progress: {
        backgroundColor: "#28A745FF",
      },
    }
  }
  return progressTheme;
};

