import mongoose from "mongoose";

export const connectDB = async (uri) => {
    try {
        const conn = await mongoose.connect(uri);
        console.log("Database connected, Host: ", conn.connection.host);
    } catch (error) {
        console.error("Error while connection database: ", error.message);
        process.exit(1);
    }
};