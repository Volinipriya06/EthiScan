const mongoose =
    require("mongoose");

const searchHistorySchema =
    new mongoose.Schema({

        query: String,

        status: String,

        userId: {

            type:
            mongoose.Schema.Types.ObjectId,

            ref: "User",

            required: true
        }

    }, {

        timestamps: true
    });

module.exports =
    mongoose.model(
        "SearchHistory",
        searchHistorySchema
    );
