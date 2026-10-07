import { defineConfig } from "hardhat/config";
import solc from "solc";

export default defineConfig({
  solidity: {
    version: "0.8.34",
    compilerPath: solc.path,
  },
});

