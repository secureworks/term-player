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

const Command = require('commander').Command
const EOL = require('os').EOL

const BlessedDisplay = require('./display/BlessedDisplay')
const Controller = require('./Controller')
const FFmpegPlayer = require('./player/FFmpegPlayer')
const pkg = require('../package.json')

const _command = Symbol('command')

/**
 * Manages interaction with this module from the command-line interface.
 *
 * @public
 */
class CommandLineInterface {

  /**
   * Returns the name of the application.
   *
   * @return {string} The application name.
   * @public
   * @static
   */
  static get NAME() {
    return pkg.name
  }

  /**
   * Returns the version of the application.
   *
   * @return {string} The application version.
   * @public
   * @static
   */
  static get VERSION() {
    return pkg.version
  }

  /**
   * Creates an instance of {@link CommandLineInterface}.
   *
   * @public
   */
  constructor() {
    this[_command] = new Command()
      .usage('[options] <file>')
      .version(CommandLineInterface.VERSION)
      .option('-c, --codec <name>', 'video codec')
      .option('-f, --format <name>', 'media format')
      .option('-r, --refresh <rate>', 'refresh rate in milliseconds', parseInt)
  }

  /**
   * Parses the specified command-line arguments and invokes the necessary action(s) as a result.
   *
   * If <code>args</code> includes either the <code>help</code> or <code>version</code> option, the appropriate
   * information will be printed and the process will exit.
   *
   * @param {string|string[]} [args=[]] - the command-line arguments to be parsed
   * @return {Controller} The {@link Controller} created to handle the parsed arguments.
   * @public
   */
  parse(args) {
    if (args == null) {
      args = []
    }

    args = Array.isArray(args) ? args : [ args ]

    const command = this[_command].parse(args)
    const filePath = command.args[0]
    const displayOptions = { refreshRate: command.refresh }
    const playOptions = {
      codec: command.codec,
      format: command.format
    }

    const display = new BlessedDisplay(displayOptions)
    const player = new FFmpegPlayer()
    const controller = new Controller(display, player)

    controller.on('stop', () => controller.destroy())
    controller.play(filePath, playOptions)
      .catch((error) => {
        controller.destroy()

        if (error.stack) {
          process.stderr.write(`${error.stack}${EOL}`)
        } else {
          process.stdout.write(`${error}${EOL}`)
        }

        process.exit(1)
      })

    return controller
  }

}

module.exports = CommandLineInterface
