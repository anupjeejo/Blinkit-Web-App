const types  = require("../constants/constants");

exports.isFileTypeSupported = (type) => {
    return types.SUPPORTED_TYPES.includes(type);
};