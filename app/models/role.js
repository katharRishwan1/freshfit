const { boolean } = require('joi');
const { mongoose } = require('../services/imports');

module.exports = mongoose.model(
    'role',
    new mongoose.Schema(
        {
            name: { type: String, uppercase: true },
            description: String,
            menus: [{
                name: { type: mongoose.Schema.Types.ObjectId, ref: 'menus' },
                display: { type: Boolean, default: false },
                sortOrder: Number
            }],
            display: { type: Boolean, default: false },
            isDeleted: { type: Boolean, default: false }
        },
        { timestamps: true, versionKey: false }
    ),
    'role'
);
