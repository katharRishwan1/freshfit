const commonService = require('../services/common_services');
const { Joi } = require('../services/imports');

const create = Joi.object({
    name: Joi.string().required().error(commonService.getValidationMessage),
    description: Joi.string().optional().allow('', null).error(commonService.getValidationMessage),
    img_url: Joi.string().required().error(commonService.getValidationMessage),
    todayRate: Joi.number().optional().error(commonService.getValidationMessage),
    yesterDayRate: Joi.number().optional().error(commonService.getValidationMessage),
    dayBeforeDay: Joi.number().optional().error(commonService.getValidationMessage),
    type: Joi.string().required().error(commonService.getValidationMessage),
    status: Joi.string().optional().error(commonService.getValidationMessage),
    boxRate: Joi.number().optional().error(commonService.getValidationMessage),
    boxQuantity: Joi.number().optional().error(commonService.getValidationMessage),
    thanglishName: Joi.string().required().error(commonService.getValidationMessage),
    tamilName: Joi.string().required().error(commonService.getValidationMessage),
    modestyPrice: Joi.number().optional().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const update = Joi.object({
    name: Joi.string().optional().error(commonService.getValidationMessage),
    description: Joi.string().optional().allow('', null).error(commonService.getValidationMessage),
    img_url: Joi.string().optional().error(commonService.getValidationMessage),
    todayRate: Joi.number().optional().error(commonService.getValidationMessage),
    yesterDayRate: Joi.number().optional().error(commonService.getValidationMessage),
    dayBeforeDay: Joi.number().optional().error(commonService.getValidationMessage),
    type: Joi.string().optional().error(commonService.getValidationMessage),
    status: Joi.string().optional().error(commonService.getValidationMessage),
    boxRate: Joi.string().optional().error(commonService.getValidationMessage),
    boxQuantity: Joi.string().optional().error(commonService.getValidationMessage),
    thanglishName: Joi.string().optional().error(commonService.getValidationMessage),
    tamilName: Joi.string().optional().error(commonService.getValidationMessage),
    modestyPrice: Joi.number().optional().error(commonService.getValidationMessage),

}).error(commonService.getValidationMessage);

const get = Joi.object({
    status: Joi.string().optional().error(commonService.getValidationMessage),
    type: Joi.string().optional().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const rateUpdate = Joi.object({
    todayRate: Joi.number().required().error(commonService.getValidationMessage),
    modestyPrice: Joi.number().optional().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

async function validateFunc(schemaName, dataToValidate) {
    try {
        const { error, value } = schemaName.validate(dataToValidate);
        return {
            error: error ? commonService.convertJoiErrors(error.details) : '',
            validatedData: value,
        };
    } catch (error) {
        return {
            error,
        };
    }
}

module.exports = {
    validateCreate: async (dataToValidate) => validateFunc(create, dataToValidate),
    validateUpdate: async (dataToValidate) => validateFunc(update, dataToValidate),
    validateGet: async (dataToValidate) => validateFunc(get, dataToValidate),
    validateRatetUpdate: async (dataToValidate) => validateFunc(rateUpdate, dataToValidate),

};
