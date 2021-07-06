"use strict";

// tslint:disable:variable-name
module.exports.errorHandle = (error: any) => {
  if (Array.isArray(error)) {
    let error_values = "";
    for (const errorPart of error) {
      error_values += getErrorValue(errorPart);
    }
    return error_values;
  } else {
    return getErrorValue(error);
  }
};

const getErrorValue = (error: any) => {
  if (typeof error.stack !== "undefined") {
    logger.system.error(error.stack);
    return error.stack;
  } else if (typeof error.message !== "undefined") {
    logger.system.error(error.message);
    return error.message;
  }
  logger.system.error(error);
  return error;
};
