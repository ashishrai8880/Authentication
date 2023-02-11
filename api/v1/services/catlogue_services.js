const Model = require('../models/catlogues')

module.exports = {
    create: async function (data) {
        try {
            return await Model.create(data)
        } catch (error) {
            console.log("Error in create", error)
            return new Error(error);
        }
    },

    getOne: async function (data) {
        try {
            return await Model.findOne(data).select('-_id');
        } catch (error) {
            console.log("Error in getOne", error)
            return new Error(error);
        }
    },

    getAll: async function (data) {
        try {
            return await Model.find(data).select('-_id');
        } catch (error) {
            console.log("Error in getAll", error)
            return new Error(error);
        }
    },

    getByPagination: async function (data,limit,skipIndex) {
        try {
            return await Model.find(data).sort({ _id: 1 }).limit(limit).skip(skipIndex).exec();
        } catch (error) {
            console.log("Error in getByPagination", error)
            return new Error(error);
        }
    },

    findOneUpdate: async function (condition, data, opts) {
        try {
            return await Model.findOneAndUpdate(condition, data, opts);
        } catch (error) {
            console.log("Error in findOneUpdate", error)
            return new Error(error);
        }
    },

    deleteOne: async function (data) {
        try {
            return await Model.deleteOne(data);
        } catch (error) {
            console.log("Error in deleteOne", error)
            return new Error(error);
        }
    },

    deleteAll: async function () {
        try {
            return await Model.remove();
        } catch (error) {
            console.log("Error in deleteAll", error)
            return new Error(error);
        }
    },
}