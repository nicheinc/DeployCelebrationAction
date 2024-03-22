import { resolve } from "path";
import { config } from "dotenv";

const pathToConfig = "../../.env";
config({ path: resolve(__dirname, pathToConfig) });
console.log(pathToConfig, "loaded");
