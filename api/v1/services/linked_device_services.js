const Model = require('../models/linked_device')

module.exports = {
    create: async function (data) {
        try {
            return await Model.create(data)
        } catch (error) {
            console.log("Error", error)
            return new Error(error);
        }
    },
    getOne: async function (data) {
        try {
            return await Model.findOne(data);
        } catch (error) {
            console.log("Error", error)
            return new Error(error);
        }
    },

    getAll: async function (data) {
        try {
            return await Model.find(data);
        } catch (error) {
            console.log("Error", error)
            return new Error(error);
        }
    },
    findOneAndUpdate: async function (conditions, update, opts) {
        try {
            return await Model.findOneAndUpdate(conditions, update, opts)
        } catch (error) {
            console.log("Error", error);
            return new Error(error);
        }
    },
}