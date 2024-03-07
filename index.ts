import express from "express";
import loaders from "./loaders";

async function startServer() {
  const app = express();
  await loaders({ expressApp: app })
  app.listen(process.env.PORT, () => {
    console.log(`app is running in port ${process.env.PORT}`);
  });

}
startServer();
