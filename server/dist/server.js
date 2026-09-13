import app from './app.js';
import { env } from "./config/env.js";
import { pool } from "./db/client.js";
const startServer = async () => {
    try {
        await pool.query("SELECT 1");
        console.log("PostgreSQL connection successful");
        app.listen(env.PORT, () => {
            console.log(`WorkHub API running on port ${env.PORT}`);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};
void startServer();
//# sourceMappingURL=server.js.map