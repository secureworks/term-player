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

const Destroyable = require('../Destroyable')
const FrameSet = require('../frame/FrameSet')
const PlayerState = require('./PlayerState')
const Utilities = require('../util/Utilities')

const _state = Symbol('stateSymbol')

// TODO: Support playing static images (slideshows?)

/**
 * Plays media files by reading their information using a {@link MediaReader}.
 *
 * @public
 * @extends Destroyable
 */
class Player extends Destroyable {

  /**
   * Creates an instance of {@link Player}.
   *
   * @public
   */
  constructor() {
    super()

    this[_state] = PlayerState.STOPPED

    /**
     * The {@link Controller} controlling this {@link Player}.
     *
     * This will be <code>null</code> until it is under control.
     *
     * @public
     * @type {?Controller}
     */
    this.controller = null
  }

  /**
   * Returns the {@link MediaReader} implementation used to extract the necessary information from the media file at the
   * specified path.
   *
   * This method <b>must</b> be implemented by all children of {@link Player}.
   *
   * @param {string} filePath - the path of the media file to read
   * @param {MediaReader~Options} [options] - the options to be used
   * @return {MediaReader} The {@link MediaReader} implementation to be used.
   * @protected
   * @abstract
   */
  getMediaReader(filePath, options) {
    Utilities.throwUnimplemented('Player', 'getMediaReader')
  }

  /**
   * Retrieves the title for the media file at the specified path.
   *
   * @param {string} filePath - the path of the media file whose title is to be retrieved
   * @param {MediaReader~Options} [options] - the options to be used
   * @return {Promise.<string, Error>} A <code>Promise</code> for the media title.
   * @public
   */
  getTitle(filePath, options) {
    const mediaReader = this.getMediaReader(filePath, options)

    return mediaReader.readTitle()
      .then((title) => {
        mediaReader.destroy()

        return title
      })
      .catch((error) => {
        mediaReader.destroy()

        throw error
      })
  }

  /**
   * Plays the media file at the specified path using the <code>options</code> provided.
   *
   * @param {string} filePath - the path of the media file to be played
   * @param {MediaReader~Options} [options] - the options to be used
   * @return {Promise.<FrameSet, Error>} A <code>Promise</code> to indicate once all of the frames from the media have
   * been read.
   * @public
   */
  play(filePath, options) {
    const frameSet = new FrameSet()
    const mediaReader = this.getMediaReader(filePath, options)

    this[_state] = PlayerState.PLAYING

    mediaReader.on('frame', frameSet.add.bind(frameSet))
    mediaReader.on('finish', frameSet.finalize.bind(frameSet))

    return mediaReader.readDimension()
      .then((dimension) => {
        return mediaReader.readFrames(dimension)
      })
      .then(() => {
        mediaReader.destroy()

        return frameSet
      })
      .catch((error) => {
        mediaReader.destroy()

        throw error
      })
  }

  /**
   * Returns whether this {@link Player} is currently paused.
   *
   * When this is <code>true</code>, it means that previously paused media can be resumed again without starting from
   * the beginning.
   *
   * @return {boolean} <code>true</code> if this {@link Player} is paused; otherwise <code>false</code>.
   * @public
   */
  get paused() {
    return this[_state] === PlayerState.PAUSED
  }

  /**
   * Sets this {@link Player} as paused when <code>paused</code> is truthy.
   *
   * If <code>paused</code> is falsey, nothing happens. That means, if this {@link Player} is already indicating that
   * it's currently paused, it will remain so regardless of <code>paused</code>.
   *
   * @param {boolean} paused - <code>true</code> to pause this {@link Player}
   * @return {void}
   * @public
   */
  set paused(paused) {
    if (paused) {
      this[_state] = PlayerState.PAUSED
    }
  }

  /**
   * Returns whether this {@link Player} is currently playing a media file.
   *
   * @return {boolean} <code>true</code> if this {@link Player} is playing; otherwise <code>false</code>.
   * @public
   */
  get playing() {
    return this[_state] === PlayerState.PLAYING
  }

  /**
   * Sets this {@link Player} as playing a media file when <code>playing</code> is truthy.
   *
   * If <code>playing</code> is falsey, nothing happens. That means, if this {@link Player} is already indicating that
   * it's currently playing, it will remain so regardless of <code>playing</code>.
   *
   * @param {boolean} playing - <code>true</code> to play this {@link Player}
   * @return {void}
   * @public
   */
  set playing(playing) {
    if (playing) {
      this[_state] = PlayerState.PLAYING
    }
  }

  /**
   * Returns whether this {@link Player} has been stopped.
   *
   * When this is <code>true</code>, it means that either no media file has been played yet or, if it has been, it
   * cannot resumed and must be played again from the beginning.
   *
   * @return {boolean} <code>true</code> if this {@link Player} is stopped; otherwise <code>false</code>.
   * @public
   */
  get stopped() {
    return this[_state] === PlayerState.STOPPED
  }

  /**
   * Sets this {@link Player} as stopped when <code>stopped</code> is truthy.
   *
   * If <code>stopped</code> is falsey, nothing happens. That means, if this {@link Player} is already indicating that
   * it's been stopped, it will remain so regardless of <code>stopped</code>.
   *
   * @param {boolean} stopped - <code>true</code> to stop this {@link Player}
   * @return {void}
   * @public
   */
  set stopped(stopped) {
    if (stopped) {
      this[_state] = PlayerState.STOPPED
    }
  }

}

module.exports = Player
