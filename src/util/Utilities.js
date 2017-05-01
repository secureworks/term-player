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

const _createUnimplementedError = Symbol('createUnimplementedError')

/**
 * Contains utility methods that are useful throughout the application.
 *
 * @public
 */
class Utilities {

  /**
   * Returns a rejected promise for an error indicating that a given method on a specific class has not been
   * implemented.
   *
   * @param {string} className - the name of the class on which the method has not been implemented
   * @param {string} methodName - the name of the method which has not been implemented
   * @return {Promise.<*, Error>} A rejected <code>Promise</code> describing the class method which has not been
   * implemented.
   * @public
   * @static
   */
  static rejectUnimplemented(className, methodName) {
    return Promise.reject(Utilities[_createUnimplementedError](className, methodName))
  }

  /**
   * Throws an error indicating that a given method on a specific class has not been implemented.
   *
   * @param {string} className - the name of the class on which the method has not been implemented
   * @param {string} methodName - the name of the method which has not been implemented
   * @return {void}
   * @throws {Error} The error describing the class method which has not been implemented.
   * @public
   * @static
   */
  static throwUnimplemented(className, methodName) {
    throw Utilities[_createUnimplementedError](className, methodName)
  }

  /**
   * Creates an error indicating that a given method on a specific class has not been implemented.
   *
   * @param {string} className - the name of the class on which the method has not been implemented
   * @param {string} methodName - the name of the method which has not been implemented
   * @return {Error} The error describing the class method which has not been implemented.
   * @private
   * @static
   */
  static [_createUnimplementedError](className, methodName) {
    return new Error(`"${methodName}" method must be implemented on the ${className} class`)
  }

}

module.exports = Utilities
