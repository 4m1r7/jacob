import type { CodegenConfig } from "@graphql-codegen/cli";
import fs from "node:fs";
import path from "node:path";

function loadEnvFile(fileName: string) {
  const filePath = path.join(process.cwd(), fileName);
  if (!fs.existsSync(filePath)) {
    return;
  }

  const fileContent = fs.readFileSync(filePath, "utf8");
  for (const rawLine of fileContent.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) {
      continue;
    }

    const value =
      (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
      (rawValue.startsWith("'") && rawValue.endsWith("'"))
        ? rawValue.slice(1, -1)
        : rawValue;

    process.env[key] = value;
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const endpoint =
  process.env.WORDPRESS_GRAPHQL_ENDPOINT ??
  "https://cms.jacobcarpet.com/graphql";

const schema: CodegenConfig["schema"] = process.env.WORDPRESS_GRAPHQL_AUTH_TOKEN
  ? [
      {
        [endpoint]: {
          headers: {
            Authorization: `Bearer ${process.env.WORDPRESS_GRAPHQL_AUTH_TOKEN}`,
          },
        },
      },
    ]
  : endpoint;

const config: CodegenConfig = {
  schema,
  documents: ["src/lib/graphql/documents/**/*.graphql"],
  ignoreNoDocuments: true,
  generates: {
    "src/lib/graphql/generated.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-graphql-request",
      ],
    },
  },
};

export default config;
