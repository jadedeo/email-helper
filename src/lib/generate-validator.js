// lib/generate-validator.js
// if changed, run 'node src/lib/generate-validator.js' to generate new schema file
// see: https://ajv.js.org/standalone.html

import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import Ajv from "ajv";
import standaloneCode from "ajv/dist/standalone/index.js";

// console.log("generating template-validator.mjs...");

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const schemaTemplates = {
    $id: "Templates",
    type: "object",
    properties: {
        body: { type: "string" },
        id: { type: "string" },
        section: { type: "string" },
        title: { type: "string" },
    },
    required: ["body", "id", "section", "title"],
};

const ajv = new Ajv({
    schemas: [schemaTemplates],
    code: { source: true, esm: true },
});
let moduleCode = standaloneCode(ajv, {
    Templates: "Templates",
});

// write module code to file
writeFileSync(join(__dirname, "../lib/template-validator.mjs"), moduleCode);
