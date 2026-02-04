import { app } from "./index.js";
import "dotenv/config";
import { connectDB } from "./src/config/db.config.js";

const PORT = process.env.PORT || 3000;
const URI = process.env.DB_URI;

await connectDB(URI);

app.listen(PORT, () => {
    console.log("Express server started.");
});