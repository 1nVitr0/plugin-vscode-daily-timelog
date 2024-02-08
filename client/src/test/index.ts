/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import { glob } from 'glob';
import { resolve as resolvePath } from 'path';

export async function run(): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    ui: 'tdd',
    color: true,
  });
  mocha.timeout(100000);

  const testsRoot = __dirname;

  const files = await glob('**.test.js', { cwd: testsRoot });

    // Add files to the test suite
  files.forEach((f) => mocha.addFile(resolvePath(testsRoot, f)));

  // Run the mocha test
  mocha.run((failures) => {
    if (failures > 0) throw new Error(`${failures} tests failed.`);
  });
}
