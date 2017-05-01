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

const Destroyable = require('./Destroyable')
const Files = require('./util/Files')

const _display = Symbol('display')
const _player = Symbol('player')

/**
 * Controls interactions to and between a {@link Display} and a {@link Player}.
 *
 * @public
 * @extends Destroyable
 */
class Controller extends Destroyable {

  /**
   * Creates an instance of {@link Controller} for the <code>display</code> and <code>player</code> provided.
   *
   * @param {Display} display - the {@link Display} to be controlled
   * @param {Player} player - the {@link Player} to be controlled
   * @public
   */
  constructor(display, player) {
    super()

    display.controller = this
    player.controller = this

    this[_display] = display
    this[_player] = player
  }

  /**
   * @override
   */
  destroy() {
    this.display.destroy()
    this.player.destroy()

    return super.destroy()
  }

  /**
   * Toggles the display of help information for controlling the application.
   *
   * @return {boolean} <code>true</code> if the help information is now being displayed; otherwise <code>false</code>.
   * @public
   */
  help() {
    const wasShowing = this.display.isShowingHelp()

    if (wasShowing) {
      this.display.hideHelp()
    } else {
      this.display.showHelp()
    }

    return !wasShowing
  }

  /**
   * Pauses the media that's currently being played by the controlled {@link Player}.
   *
   * Playback can be resumed again by calling the {@link Controller#resume} method.
   *
   * A "pause" event is fired after playback has been paused.
   *
   * @return {boolean} <code>true</code> if {@link Player} was paused; otherwise <code>false</code>.
   * @public
   */
  pause() {
    if (!this.player.playing) {
      return false
    }

    this.player.paused = true
    this.display.frozen = true

    this.emit('pause')

    return true
  }

  /**
   * Plays the media file at the specified path in the controlled {@link Player}.
   *
   * A "play" event is fired just before the media file is read, with <code>filePath</code>, the derived media title,
   * and the specified <code>options</code> being passed with the event.
   *
   * An error will be thrown if the specified file path is not a valid file or if a file is already playing.
   *
   * @param {string} filePath - the path of the media file to be played
   * @param {MediaReader~options} [options] - the options to be used
   * @return {Promise.<FrameSet, Error>} A <code>Promise</code> to indicate once the media has started playing.
   * @public
   */
  play(filePath, options) {
    if (options == null) {
      options = {}
    }

    if (!this.player.stopped) {
      return Promise.reject(new Error('Player must be stopped before playing another file'))
    }

    return Files.isFile(filePath)
      .then((isFile) => {
        if (!isFile) {
          throw new Error(`Cannot play invalid file path: ${filePath}`)
        }

        return this.player.getTitle(filePath, options)
      })
      .then((title) => {
        this.display.title = title

        this.emit('play', filePath, title, options)

        return this.player.play(filePath, options)
      })
      .then((frameSet) => {
        this.display
          .render()
          .load(frameSet)

        return frameSet
      })
  }

  /**
   * Resumes playback of the media that had been previously paused in the controlled {@link Player}.
   *
   * A "resume" event is fired after playback has been resumed.
   *
   * @return {boolean} <code>true</code> if {@link Player} was resumed; otherwise <code>false</code>.
   * @public
   */
  resume() {
    if (!this.player.paused) {
      return false
    }

    this.player.playing = true
    this.display.frozen = false

    this.emit('resume')

    return true
  }

  /**
   * Stops playing of the media entirely, effectively removing it from the controlled {@link Display}.
   *
   * Once stopped, media playback cannot be resumed and, in order to play it again, the {@link Controller#play} method
   * must be called to replay the media from the beginning.
   *
   * A "stop" event is fired after playback has been stopped, but only if it had not already been stopped.
   *
   * @return {boolean} <code>true</code> if {@link Player} was stopped; otherwise <code>false</code>.
   * @public
   */
  stop() {
    const wasStopped = this.player.stopped

    this.player.stopped = true
    this.display.unload()

    if (!wasStopped) {
      this.emit('stop')

      return true
    }

    return false
  }

  /**
   * Returns the display controlled by this {@link Controller}.
   *
   * @return {Display} The {@link Display}.
   * @public
   */
  get display() {
    return this[_display]
  }

  /**
   * Returns the player controlled by this {@link Controller}.
   *
   * @return {Player} The {@link Player}.
   * @public
   */
  get player() {
    return this[_player]
  }

}

module.exports = Controller
