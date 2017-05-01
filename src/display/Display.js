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

const numeral = require('numeral')

const CommandLineInterface = require('../CommandLineInterface')
const Destroyable = require('../Destroyable')
const Utilities = require('../util/Utilities')

const _currentFrame = Symbol('currentFrame')
const _defaultTitle = Symbol('defaultTitle')
const _frameSet = Symbol('frameSet')
const _frozen = Symbol('frozen')
const _paintNextFrame = Symbol('paintNextFrame')
const _refreshId = Symbol('refreshId')
const _refreshRate = Symbol('refreshRate')
const _status = Symbol('status')
const _statuses = Symbol('statuses')
const _title = Symbol('title')
const _updateStatus = Symbol('updateStatus')

/**
 * A display which paints frames onto the terminal.
 *
 * @public
 * @extends Destroyable
 */
class Display extends Destroyable {

  /**
   * Creates an instance of {@link Display}.
   *
   * @param {Display~Options} [options] - the options to be used
   * @public
   */
  constructor(options) {
    super()

    if (options == null) {
      options = {}
    }

    this[_currentFrame] = null
    this[_defaultTitle] = options.title || CommandLineInterface.NAME
    this[_frameSet] = null
    this[_frozen] = true
    this[_refreshId] = null
    this[_refreshRate] = options.refreshRate || 10
    this.status = options.status
    this.title = options.title

    /**
     * The {@link Controller} controlling this {@link Display}.
     *
     * This will be <code>null</code> until it is under control.
     *
     * @public
     * @type {?Controller}
     */
    this.controller = null
  }

  /**
   * @override
   */
  destroy() {
    this.unload()

    return super.destroy()
  }

  /**
   * Returns the dimension of this {@link Display}.
   *
   * This method <b>must</b> be implemented by all children of {@link Display}.
   *
   * @return {Dimension} The dimension.
   * @public
   * @abstract
   */
  getDimension() {
    Utilities.throwUnimplemented('Display', 'getDimension')
  }

  /**
   * Hides the help information for controlling the application.
   *
   * This method does nothing by default.
   *
   * @return {Display} A reference to this {@link Display} for chaining purposes.
   * @public
   */
  hideHelp() {
    return this
  }

  /**
   * Returns whether this {@link Display} has been rendered.
   *
   * This method <b>must</b> be implemented by all children of {@link Display}.
   *
   * @return {boolean} <code>true</code> if this display has been rendered; otherwise <code>false</code>.
   * @protected
   * @abstract
   */
  isRendered() {
    Utilities.throwUnimplemented('Display', 'isRendered')
  }

  /**
   * Returns whether this {@link Display} is currently showing help information.
   *
   * This method <b>must</b> be implemented by all children of {@link Display}.
   *
   * @return {boolean} <code>true</code> if this display is showing help; otherwise <code>false</code>.
   * @public
   * @abstract
   */
  isShowingHelp() {
    Utilities.throwUnimplemented('Display', 'isShowingHelp')
  }

  /**
   * Loads the specified frame set into this {@link Display} and starts a refresh cycle - based on the configured rate -
   * which will be responsible for painting each {@link Frame}.
   *
   * {@link Display#unload} must be called before calling this method again in order to load a frame set afterwards.
   *
   * @param {FrameSet} frameSet - the {@link FrameSet} to be loaded
   * @return {Display} A reference to this {@link Display} for chaining purposes.
   * @throws {Error} If a {@link FrameSet} is already loaded.
   * @public
   */
  load(frameSet) {
    if (this[_frameSet]) {
      throw new Error('Existing frame set has not been unloaded')
    }

    this[_frameSet] = frameSet
    this.frozen = false

    this[_updateStatus]()

    return this
  }

  /**
   * Paints the specified <code>frame</code> on this {@link Display}.
   *
   * This method <b>must</b> be implemented by all children of {@link Display}. It should only be called when the
   * display is not frozen and has already been rendered.
   *
   * @param {Frame} frame - the {@link Frame} to be pained
   * @param {?Frame} currentFrame - the {@link Frame} that is currently painted (may be <code>null</code>)
   * @return {void}
   * @protected
   * @abstract
   */
  paint(frame, currentFrame) {
    Utilities.throwUnimplemented('Display', 'paint')
  }

  /**
   * Renders this {@link Display} so that frames can be painted on it.
   *
   * This method does nothing by default.
   *
   * @return {Display} A reference to this {@link Display} for chaining purposes.
   * @public
   */
  render() {
    return this
  }

  /**
   * Shows the help information for controlling the application.
   *
   * This method does nothing by default.
   *
   * @return {Display} A reference to this {@link Display} for chaining purposes.
   * @public
   */
  showHelp() {
    return this
  }

  /**
   * Unloads any previously specified frame set from this {@link Display} and stops any running refresh cycle to prevent
   * further painting.
   *
   * @return {Display} A reference to this {@link Display} for chaining purposes.
   * @public
   */
  unload() {
    this.frozen = true
    this.title = null
    this[_frameSet] = null

    this[_updateStatus]()

    return this
  }

  /**
   * Updates the status and title and re-renders this {@link Display}.
   *
   * This method <b>must</b> be implemented by all children of {@link Display}. It should only be called when the
   * display has already been rendered.
   *
   * @return {void}
   * @protected
   * @abstract
   */
  update() {
    Utilities.throwUnimplemented('Display', 'update')
  }

  /**
   * Paints the {@link Frame} at the front of the set on this {@link Display}.
   *
   * This method does nothing in the following scenarios:
   *
   * <ul>
   *     <li>The display is currently frozen to prevent painting</li>
   *     <li>The display has not been rendered yet</li>
   *     <li>There are no frames in the set to be painted</li>
   * </ul>
   *
   * A "finished" event is fired if there are no more frames left after the next one and the {@link FrameSet} has been
   * marked as finalized.
   *
   * @return {void}
   * @private
   */
  [_paintNextFrame]() {
    if (this.frozen || !(this.isRendered() && this[_frameSet].hasNext())) {
      return
    }

    const currentFrame = this[_currentFrame]
    const frame = this[_frameSet].next()

    this[_currentFrame] = frame

    this[_updateStatus](frame)
    this.paint(frame, currentFrame)

    if (!this[_frameSet].hasNext() && this[_frameSet].finalized) {
      this.controller.stop()
    }
  }

  /**
   * Updates the status text for this {@link Display}.
   *
   * @param {Frame} [frame] - the painted {@link Frame}
   * @return {void}
   * @private
   */
  [_updateStatus](frame) {
    this.status = Array.from(Display[_statuses].entries())
      .map((entry) => {
        const key = entry[0]
        const value = entry[1](this, frame)

        return `${key}: ${value != null ? value : '?'}`
      })
      .join(' | ')
  }

  /**
   * Returns whether this {@link Display} is currently prevented from refreshing.
   *
   * @return {boolean} <code>true</code> if this {@link Display} is frozen; otherwise <code>false</code>.
   * @public
   */
  get frozen() {
    return this[_frozen]
  }

  /**
   * Sets whether this {@link Display} is currently prevented from refreshing to <code>frozen</code>.
   *
   * If <code>frozen</code> is <code>true</code> a new refresh cycle will be started; otherwise, it will stop any
   * running refresh cycles to prevent further painting.
   *
   * @param {boolean} frozen - <code>true</code> to freeze this {@link Display}; otherwise <code>false</code>
   * @return {void}
   * @public
   */
  set frozen(frozen) {
    this[_frozen] = Boolean(frozen)

    if (!this[_frozen]) {
      this[_refreshId] = setInterval(this[_paintNextFrame].bind(this), this.refreshRate)
    } else if (this[_refreshId]) {
      clearInterval(this[_refreshId])

      this[_refreshId] = null
    }
  }

  /**
   * Returns the number of milliseconds between each frame is painted by this {@link Display}.
   *
   * @return {number} The refresh rate.
   * @public
   */
  get refreshRate() {
    return this[_refreshRate]
  }

  /**
   * Returns the status for this {@link Display}.
   *
   * @return {string} The status.
   * @public
   */
  get status() {
    return this[_status]
  }

  /**
   * Sets the status for this {@link Display} to <code>status</code>.
   *
   * @param {string} status - the status to be set
   * @public
   */
  set status(status) {
    this[_status] = status || ''

    if (this.isRendered()) {
      this.update()
    }
  }

  /**
   * Returns the title for this {@link Display}.
   *
   * @return {string} The title.
   * @public
   */
  get title() {
    return this[_title]
  }

  /**
   * Sets the title for this {@link Display} to <code>title</code>.
   *
   * If <code>title</code> is <code>null</code> or empty, then the default title (i.e. the <code>title</code> option
   * passed to the constructor, where applicable) will be assigned instead.
   *
   * @param {string} title - the title to be set
   * @return {void}
   * @public
   */
  set title(title) {
    this[_title] = title || this[_defaultTitle]

    if (this.isRendered()) {
      this.update()
    }
  }

}

/**
 * A map of status descriptions and functions to be used to get their corresponding value on-demand.
 *
 * @private
 * @static
 * @type {Map.<string, Display~StatusCallback>}
 */
Display[_statuses] = new Map()
Display[_statuses].set('Display Res', (display) => display.getDimension())
Display[_statuses].set('Media Res', (display, frame) => frame && frame.dimension)
Display[_statuses].set('Frames', (display) => {
  if (!display[_frameSet] || !display[_frameSet].finalized) {
    return null
  }

  const total = display[_frameSet].totalLength
  const current = total - display[_frameSet].length

  return numeral(current / total).format('0%')
})
Display[_statuses].set('RAM', () => {
  const format = '0.0b'
  const memory = process.memoryUsage()
  const total = numeral(memory.heapTotal).format(format)
  const used = numeral(memory.heapUsed).format(format)

  return `${used}/${total}`
})
Display[_statuses].set('Help', () => 'Press "?"')

module.exports = Display

/**
 * The options for the {@link Display} constructor.
 *
 * @typedef {Object} Display~Options
 * @property {number} [refreshRate=10] - The number of milliseconds between each {@link Frame} is painted.
 * @property {string} [status] - The status to be displayed.
 * @property {string} [title] - The title to be displayed.
 */

/**
 * Returns status text to be displayed based on the <code>display</code> and <code>frame</code> provided.
 *
 * @callback Display~StatusCallback
 * @param {Display} display - the {@link Display} on which the status is to be displayed
 * @param {?Frame} frame - the painted {@link Frame}
 * @return {?string} The status text or <code>null</code> if there is no status.
 */
