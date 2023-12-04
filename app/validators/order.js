const commonService = require('../services/common_services');
const { Joi } = require('../services/imports');

const create = Joi.object({
    products: Joi.array().items({
        name: Joi.string().required().error(commonService.getValidationMessage),
        kg: Joi.number().required().error(commonService.getValidationMessage),
        kgRate: Joi.number().optional().error(commonService.getValidationMessage)
    }).required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const update = Joi.object({
    products: Joi.array().items({
        name: Joi.string().optional().error(commonService.getValidationMessage),
        kg: Joi.number().optional().error(commonService.getValidationMessage),
        kgRate: Joi.number().optional().error(commonService.getValidationMessage)
    }).required().error(commonService.getValidationMessage),
}).error(commonService.getValidationMessage);

const get = Joi.object({
    status: Joi.string().optional().error(commonService.getValidationMessage),
    type: Joi.string().optional().error(commonService.getValidationMessage),
    time: Joi.string().optional().error(commonService.getValidationMessage),
    user: Joi.string().optional().error(commonService.getValidationMessage),
    date: Joi.string().optional().error(commonService.getValidationMessage)
}).error(commonService.getValidationMessage);

const addCart = Joi.object({
    name: Joi.string().required().error(commonService.getValidationMessage),
    kg: Joi.number().required().error(commonService.getValidationMessage),
    kgRate: Joi.number().optional().error(commonService.getValidationMessage)
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
    validateOrderCrate: async (dataToValidate) => validateFunc(create, dataToValidate),
    validateOrderUpdate: async (dataToValidate) => validateFunc(update, dataToValidate),
    validateOrderGet: async (dataToValidate) => validateFunc(get, dataToValidate),
    validateAddCart: async (dataToValidate) => validateFunc(addCart, dataToValidate),

};
