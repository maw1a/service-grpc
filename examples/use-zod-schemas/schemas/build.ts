import type { ZodToProtoBufOptions } from "./types";

import { zodToProtobufService } from "@globalart/zod-to-proto";
import fs from "fs/promises";
import path from "path";

import { userService } from "./user-service";

const zodProtoSchemasOptions: Array<ZodToProtoBufOptions> = [userService];

const protoDir = path.join(__dirname, "..", "protos");

// Creates .proto file from zod schema options
const createProtoFile = async (options: ZodToProtoBufOptions) => {
  const fileName = `${options.packageName || `default_${new Date().getTime()}`}.proto`;
  try {
    const content = zodToProtobufService(options);
    await fs.writeFile(path.join(protoDir, fileName), content);
    return { success: true, fileName };
  } catch (error) {
    return { success: false, fileName };
  }
};

// Build function which builds all schemas defined in "zodProtoSchemasOptions" var
async function buildSchemas() {
  const dirPath = await fs.mkdir(protoDir, { recursive: true });
  if (dirPath) console.log(`Created protos directory: ${dirPath}`);

  const results = await Promise.all(
    zodProtoSchemasOptions.map(createProtoFile),
  );

  const summary: { success: Array<string>; failed: Array<string> } =
    results.reduce(
      (s, res) =>
        res.success
          ? { ...s, success: [...s.success, res.fileName] }
          : { ...s, failed: [...s.failed, res.fileName] },
      { success: [], failed: [] },
    );

  console.log(
    `Build completed:\n\n${summary.success.length} Success\n${summary.failed.length} Failed`,
  );

  return summary;
}

buildSchemas();
