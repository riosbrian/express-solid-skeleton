import { envs } from "@/config/envs.js";
import { connectToMongoDB } from "@/db/mongodb/mongodb-connection.js";
import { startServer } from "@/server/app.js";

(async () => {
  const { PORT, NODE_ENV } = envs;
  await connectToMongoDB();
  startServer(PORT, NODE_ENV);
})();
