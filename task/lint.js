/*
 * Copyright 2017 SecureWorks
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict'

const CLIEngine = require('eslint').CLIEngine
const moan = require('moan')
const path = require('path')
const Utils = require('moan/src/Utils')

module.exports = () => {
  return moan.fileSet('lintFiles')
    .get()
    .then((lintFiles) => {
      const engine = new CLIEngine()
      const report = engine.executeOnFiles(lintFiles)

      for (const result of report.results) {
        const filePath = path.relative(process.cwd(), result.filePath)

        moan.log.writeln(`Linting file: ${filePath}`)

        for (const message of result.messages) {
          const output = `"${message.ruleId}" at line ${message.line} col ${message.column}: ${message.message}`

          switch (message.severity) {
          case 2:
            moan.log.error(output)
            break
          case 1:
            moan.log.warn(output)
            break
          default:
            moan.log.writeln(output)
            break
          }
        }
      }

      if (report.errorCount > 0) {
        throw new Error(`${report.errorCount} lint error${Utils.plural(report.errorCount)} found`)
      }
    })
}
