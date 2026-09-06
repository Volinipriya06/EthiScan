const mongoose = require("mongoose");
const csv = require("csv-parser");
const fs = require("fs");

const Brand = require("./models/Brand");

if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is required to import brands.");
    process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI);

const results = [];

fs.createReadStream("brands_50k.csv")
    .pipe(csv())

    .on("data", (data) => {

        results.push({

    brandName: data.brandName,

    industry: data.industry || "General",

    ethicalScore: isNaN(Number(data.ethicalScore))
        ? 0
        : Number(data.ethicalScore),

    category: data.category || "WARNING",

    country: data.country || "Unknown",

    pros: data.pros || "",

    cons: data.cons || "",

    sustainability: data.description || "",

    alternatives: data.alternatives
        ? data.alternatives.split(",")
        : []
});

    })

    .on("end", async () => {

        try {

            await Brand.deleteMany({});

            await Brand.insertMany(results);

            console.log("50K Brands Imported Successfully");

            process.exit();

        } catch (error) {

            console.log(error);
        }
    });
