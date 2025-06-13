import { SSTConfig } from "sst";
import { MyStack } from "./stacks/MyStack";

export default {
  config() {
    return {
      name: "reflect-therapy",
      region: "ap-southeast-2",
    };
  },
  stacks(app) {
    app.stack(MyStack);
  },
} satisfies SSTConfig;
