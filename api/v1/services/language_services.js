const Model = require('../models/language')

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
        } catch (e) {
            console.log("Error", error)
            return new Error(error);
        }
    },

    findOneUpdateData: async function (condition, data, opts) {
        try {
            return await Model.findOneAndUpdate(condition, data, opts);
        } catch (e) {
            console.log("Error", error)
            return new Error(error);
        }
    },
    deleteOne: async function (data) {
        try {
            return await Model.deleteOne(data);
        } catch (e) {
            console.log("Error", error)
            return new Error(error);
        }
    },
}