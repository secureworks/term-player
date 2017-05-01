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

const fs = require('fs')

const _checkExistsAndStatMethod = Symbol('checkExistsAndStatMethod')

/**
 * A utility class for working with the file system.
 *
 * @public
 */
class Files {

  /**
   * Retrieves the stats for the specified file path.
   *
   * This method will fail if this process cannot access the given file path (see {@link Files.isAccessible}).
   *
   * @param {string} filePath - the file path to be checked
   * @return {Promise.<fs.Stats, Error>} A <code>Promise</code> to retrieve the file path stats.
   * @public
   * @static
   */
  static getStats(filePath) {
    return new Promise((resolve, reject) => {
      fs.stat(filePath, (error, stats) => {
        if (error) {
          return reject(stats)
        }

        return resolve(stats)
      })
    })
  }

  /**
   * Checks whether the specified file path is accessible.
   *
   * @param {string} filePath - the file path to be checked
   * @return {Promise.<boolean>} A <code>Promise</code> to indicate whether the file path is accessible.
   * @public
   * @static
   */
  static isAccessible(filePath) {
    return new Promise((resolve) => {
      fs.access(filePath, fs.F_OK, (error) => {
        resolve(error == null)
      })
    })
  }

  /**
   * Checks whether the specified file path exists and is a valid directory.
   *
   * @param {string} filePath - the file path to be checked
   * @return {Promise.<boolean, Error>} A <code>Promise</code> to indicate whether the file path is a valid directory.
   * @public
   * @static
   */
  static isDirectory(filePath) {
    return Files[_checkExistsAndStatMethod](filePath, 'isDirectory')
  }

  /**
   * Checks whether the specified file path exists and is a valid file.
   *
   * @param {string} filePath - the file path to be checked
   * @return {Promise.<boolean, Error>} A <code>Promise</code> to indicate whether the file path is a valid file.
   * @public
   * @static
   */
  static isFile(filePath) {
    return Files[_checkExistsAndStatMethod](filePath, 'isFile')
  }

  /**
   * Checks whether the specified file path exists and that calling the named method of the <code>fs.Stats</code> object
   * returns <code>true</code>.
   *
   * @param {string} filePath - the file path to be checked
   * @param {string} statMethod - the name of the method on <code>fs.Stats</code> to be called
   * @return {Promise.<boolean, Error>} A <code>Promise</code> to indicate whether the file path the
   * <code>fs.Stats</code> is as expected.
   * @private
   * @static
   */
  static [_checkExistsAndStatMethod](filePath, statMethod) {
    return Files.isAccessible(filePath)
      .then((accessible) => accessible ? Files.getStats(filePath) : null)
      .then((stats) => stats != null && stats[statMethod]())
  }

}

module.exports = Files
