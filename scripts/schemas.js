const fs = require('fs');
const path = require('path');
const TJS = require('typescript-json-schema');

const { existsSync, mkdir, writeFile } = fs;
const { join, resolve } = path;

const schemaDir = 'client/out/schemas/';
const types = [
  "StructuredLog"
];

const settings = {
  required: true,
};

const program = TJS.programFromConfig('client/tsconfig.json');

async function createSchemas (schemas) {
  if (!existsSync(schemaDir)) { await new Promise(r => mkdir(schemaDir, { recursive: true }, resolve)); }

  const promises = [];
  for (const type of types) {
    const schema = TJS.generateSchema(program, type, settings);
    const data = JSON.stringify(schema, null, 2);

    promises.push(new Promise(r => writeFile(join(schemaDir, `${type}.json`), data, r)));
  }

  await Promise.all(promises);
}

createSchemas(types);