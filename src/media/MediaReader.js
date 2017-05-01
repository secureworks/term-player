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

const path = require('path')

const Destroyable = require('../Destroyable')
const Utilities = require('../util/Utilities')

const _codec = Symbol('codec')
const _filePath = Symbol('filePath')
const _format = Symbol('format')

/**
 * Reads useful information and content from a media file.
 *
 * @public
 * @extends Destroyable
 */
class MediaReader extends Destroyable {

  /**
   * Creates an instance of {@link MediaReader}.
   *
   * @param {string} filePath - the path of the media file to read
   * @param {MediaReader~Options} [options] - the options to be used
   * @public
   */
  constructor(filePath, options) {
    super()

    if (options == null) {
      options = {}
    }

    this[_filePath] = filePath
    this[_codec] = options.codec
    this[_format] = options.format
  }

  /**
   * Reads the dimensions from the media file.
   *
   * This method <b>must</b> be implemented by all children of {@link MediaReader}.
   *
   * @return {Promise.<Dimension, Error>} A <code>Promise</code> for the media {@link Dimension}.
   * @public
   * @abstract
   */
  readDimension() {
    return Utilities.rejectUnimplemented('MediaReader', 'readDimension')
  }

  /**
   * Reads all of the frames from the media file.
   *
   * This method will fire a "start" event once it has began to read the frames. A "frame" event is fired for each
   * {@link Frame} that's read, with it being passed with the event. A "finish" event is fired once all frames have been
   * read, with the array of frames being passed with the event.
   *
   * This method <b>must</b> be implemented by all children of {@link MediaReader}.
   *
   * @param {Dimension} dimension - the {@link Dimension} used to read the frames from the media file
   * @return {Promise.<Frame[], Error>} A <code>Promise</code> for the frames extracted from the media file.
   * @public
   * @abstract
   */
  readFrames(dimension) {
    return Utilities.rejectUnimplemented('MediaReader', 'readFrames')
  }

  /**
   * Reads the title from the media file.
   *
   * By default, this will be the media file name but implementations of {@link MediaReader} are free to override this
   * method to implement their own logic to get a more friendly title.
   *
   * @return {Promise.<string, Error>} A <code>Promise</code> for the media title.
   * @public
   */
  readTitle() {
    return Promise.resolve(path.basename(this[_filePath]))
  }

  /**
   * Returns the codec specified for the video file being read by this {@link MediaReader}, where applicable.
   *
   * If this is <code>null</code>, this {@link MediaReader} will attempt to derive the codec from the file.
   *
   * @return {?string} The video codec or <code>null</code> if it should be derived from the file.
   * @public
   */
  get codec() {
    return this[_codec]
  }

  /**
   * Returns the path of the media being read by this {@link MediaReader}.
   *
   * @return {string} The media file path.
   * @public
   */
  get filePath() {
    return this[_filePath]
  }

  /**
   * Returns the format specified for the media file being read by this {@link MediaReader}.
   *
   * If this is <code>null</code>, this {@link MediaReader} will attempt to derive the format from the file.
   *
   * @return {?string} The media format or <code>null</code> if it should be derived from the file.
   * @public
   */
  get format() {
    return this[_format]
  }

}

module.exports = MediaReader

/**
 * The options for the {@link MediaReader} constructor.
 *
 * @typedef {Object} MediaReader~Options
 * @property {string} [codec] - The codec of the video file, where applicable (will attempt to derive from file if
 * omitted).
 * @property {string} [format] - The format of the media file (will attempt to derive from file if omitted).
 */
