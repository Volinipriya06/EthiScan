const mongoose = require("mongoose");

const connectDatabase = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error("MONGODB_URI is required.");
        }

        await mongoose.connect(uri);
        
        console.log("MongoDB connection deployment status: SUCCESSFUL");
    } catch (err) {
        console.error("MongoDB engine configuration cluster connectivity fault:", err.message);
        process.exit(1);
    }
};

module.exports = connectDatabase;
