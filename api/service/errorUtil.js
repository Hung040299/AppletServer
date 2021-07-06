"use strict";
// tslint:disable:variable-name
module.exports.errorHandle = (error) => {
    if (Array.isArray(error)) {
        let error_values = "";
        for (const errorPart of error) {
            error_values += getErrorValue(errorPart);
        }
        return error_values;
    }
    else {
        return getErrorValue(error);
    }
};
const getErrorValue = (error) => {
    if (typeof error.stack !== "undefined") {
        logger.system.error(error.stack);
        return error.stack;
    }
    else if (typeof error.message !== "undefined") {
        logger.system.error(error.message);
        return error.message;
    }
    logger.system.error(error);
    return error;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JVdGlsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZXJyb3JVdGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQztBQUViLCtCQUErQjtBQUMvQixNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsR0FBRyxDQUFDLEtBQVUsRUFBRSxFQUFFO0lBQzFDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUN4QixJQUFJLFlBQVksR0FBRyxFQUFFLENBQUM7UUFDdEIsS0FBSyxNQUFNLFNBQVMsSUFBSSxLQUFLLEVBQUU7WUFDN0IsWUFBWSxJQUFJLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUMxQztRQUNELE9BQU8sWUFBWSxDQUFDO0tBQ3JCO1NBQU07UUFDTCxPQUFPLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUM3QjtBQUNILENBQUMsQ0FBQztBQUVGLE1BQU0sYUFBYSxHQUFHLENBQUMsS0FBVSxFQUFFLEVBQUU7SUFDbkMsSUFBSSxPQUFPLEtBQUssQ0FBQyxLQUFLLEtBQUssV0FBVyxFQUFFO1FBQ3RDLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNqQyxPQUFPLEtBQUssQ0FBQyxLQUFLLENBQUM7S0FDcEI7U0FBTSxJQUFJLE9BQU8sS0FBSyxDQUFDLE9BQU8sS0FBSyxXQUFXLEVBQUU7UUFDL0MsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ25DLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQztLQUN0QjtJQUNELE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzNCLE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQyxDQUFDIn0=