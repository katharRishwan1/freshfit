const { mongoose } = require('../services/imports');

module.exports = mongoose.model(
    'user',
    new mongoose.Schema(
        {
            ownerName: { type: String, unique: true },
            name: { type: String, trim: true },
            email: { type: String, trim: true, lowercase: true },
            mobile: { type: String, trim: true, unique: true },
            alternativeMobileNumber: { type: String, trim: true },
            password: String,
            provider: {
                type: String,
                enum: ['rizwan'],
                default: 'rizwan',
            },
            role: { type: mongoose.Schema.Types.ObjectId, ref: 'role' },
            mobileVerified: {
                type: Boolean,
                default: false,
            },
            emailVerified: {
                type: Boolean,
                default: false,
            },
            areaName: String,
            pin_code: String,
            status: { type: String, enum: ['active', 'inactive'], default: 'active' },
            isDeleted: { type: Boolean, default: false },
        },
        { timestamps: true, versionKey: false }
    ),
    'users'
);
