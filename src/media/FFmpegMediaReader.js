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

const ffmpeg = require('fluent-ffmpeg')
const GifReader = require('omggif').GifReader
const Writable = require('stream').Writable

const Dimension = require('../Dimension')
const Frame = require('../frame/Frame')
const MediaReader = require('./MediaReader')

const _createWritable = Symbol('createWritable')
const _destroyCommand = Symbol('destroyCommand')
const _probe = Symbol('probe')
const _probeCache = Symbol('probeCache')
const _probeCommand = Symbol('probeCommand')
const _runCommand = Symbol('runCommand')

/**
 * A {@link MediaReader} implementation that uses the FFmpeg tool to read the media file information and content.
 *
 * @public
 * @extends MediaReader
 */
class FFmpegMediaReader extends MediaReader {

  /**
   * Creates an instance of {@link FFmpegMediaReader}.
   *
   * @param {string} filePath - the path of the media file to read
   * @param {MediaReader~Options} [options] - the options to be used
   * @public
   */
  constructor(filePath, options) {
    super(filePath, options)

    this[_probeCache] = null
    this[_probeCommand] = null
    this[_runCommand] = null
  }

  /**
   * @override
   */
  destroy() {
    this[_probeCache] = null

    this[_destroyCommand](_probeCommand)
    this[_destroyCommand](_runCommand)

    return super.destroy()
  }

  /**
   * @override
   */
  readDimension() {
    return this[_probe]()
      .then((data) => {
        const stream = data.streams[0]

        return new Dimension(stream.width, stream.height)
      })
  }

  /**
   * @override
   */
  readFrames(dimension) {
    return new Promise((resolve, reject) => {
      if (this[_runCommand]) {
        this[_runCommand].kill()
      }

      const output = this[_createWritable](resolve, reject)

      this[_runCommand] = ffmpeg(this.filePath)

      if (this.codec) {
        this[_runCommand] = this[_runCommand].videoCodec(this.codec)
      }
      if (this.format) {
        this[_runCommand] = this[_runCommand].inputFormat(this.format)
      }

      // Convert media to GIF to fit the display screen so that each frame can be painted individually
      // TODO: How can it be done without gif?
      this[_runCommand] = this[_runCommand]
        .noAudio()
        .format('gif')
        .size(`${dimension}`)
        .output(output, { end: true })
        .on('error', reject)
        .run()

      this.emit('start')
    })
  }

  /**
   * @override
   */
  readTitle() {
    let defaultTitle

    return super.readTitle()
      .then((title) => {
        defaultTitle = title

        return this[_probe]()
      })
      .then((data) => {
        const title = data.format.tags && data.format.tags.title

        return title || defaultTitle
      })
  }

  /**
   * Creates a <code>Writable</code> implementation which is used to read the frames from the FFmpeg output stream.
   *
   * @param {Function} resolve - the function to be called with the complete array of frames
   * @param {Function} reject - the function to be called with any error that occurs
   * @return {Writable} The newly created <code>Writable</code> instance.
   * @private
   */
  [_createWritable](resolve, reject) {
    // TODO: Try to support better buffering than waiting for all chunks to be read to support streaming
    let buffer = new Buffer(0)
    const output = new Writable({
      write(chunk, encoding, next) {
        buffer = Buffer.concat([ buffer, chunk ])

        return next()
      }
    })

    output.on('error', reject)
    output.on('finish', () => {
      const gifReader = new GifReader(new Uint8Array(buffer))
      const frameCount = gifReader.numFrames()
      const frameSize = gifReader.width * gifReader.height * 4
      const frames = []

      for (let i = 0; i < frameCount; i++) {
        const pixels = new Uint8Array(frameSize)
        gifReader.decodeAndBlitFrameRGBA(i, pixels)

        const frame = new Frame(i, pixels, gifReader.width, gifReader.height)
        frames.push(frame)

        this.emit('frame', frame)
      }

      this.emit('finish', frames)

      return resolve(frames)
    })

    return output
  }

  /**
   * Destroys a FFmpeg-related command which may be referenced by the specified <code>field</code> on this
   * {@link FFmpegMediaReader}.
   *
   * @param {string|symbol} field - the identifier for the FFmpeg command field
   * @return {void}
   * @private
   */
  [_destroyCommand](field) {
    if (this[field]) {
      this[field].kill()

      this[field] = null
    }
  }

  /**
   * Retrieves information provided by FFprobe for the media file.
   *
   * This information is cached after the first successful invocation of this method to prevent unnecessary subsequent
   * command execution.
   *
   * @return {Promise.<Object, Error>} A <code>Promise</code> for the FFprobe information for the media file.
   * @private
   */
  [_probe]() {
    if (this[_probeCache]) {
      return Promise.resolve(this[_probeCache])
    }

    return new Promise((resolve, reject) => {
      if (!this[_probeCommand]) {
        this[_probeCommand] = ffmpeg(this.filePath)
      }

      this[_probeCommand].ffprobe((error, data) => {
        if (error) {
          return reject(error)
        }

        this[_probeCache] = data

        return resolve(data)
      })
    })
  }

}

module.exports = FFmpegMediaReader
