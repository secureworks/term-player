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

const blessed = require('blessed')

const Dimension = require('../Dimension')
const Display = require('./Display')

const _destroyNode = Symbol('destroyNode')
const _help = Symbol('help')
const _keyBindings = Symbol('keyBindings')
const _screen = Symbol('screen')
const _statusBar = Symbol('statusBar')
const _titleBar = Symbol('titleBar')
const _viewPort = Symbol('viewPort')

/**
 * A {@link Display} implementation that uses the blessed library to paint the terminal.
 *
 * @public
 * @extends Display
 */
class BlessedDisplay extends Display {

  /**
   * Creates an instance of {@link BlessedDisplay}.
   *
   * @param {Display~Options} [options] - the options to be used
   * @public
   */
  constructor(options) {
    super(options)

    this[_help] = null
    this[_screen] = null
    this[_statusBar] = null
    this[_titleBar] = null
    this[_viewPort] = null
  }

  /**
   * @override
   */
  destroy() {
    this[_destroyNode](_help)
    this[_destroyNode](_viewPort)
    this[_destroyNode](_titleBar)
    this[_destroyNode](_statusBar)
    this[_destroyNode](_screen)

    return super.destroy()
  }

  /**
   * @override
   */
  getDimension() {
    if (!this.isRendered()) {
      return null
    }

    return new Dimension(this[_viewPort].width - 2, this[_viewPort].height - 2)
  }

  /**
   * @override
   */
  hideHelp() {
    this[_destroyNode](_help)

    return super.hideHelp()
  }

  /**
   * @override
   */
  isRendered() {
    return this[_screen] != null && this[_statusBar] != null && this[_titleBar] != null && this[_viewPort] != null
  }

  /**
   * @override
   */
  isShowingHelp() {
    return this[_help] != null
  }

  /**
   * @override
   */
  paint(frame, currentFrame) {
    const paint = frame.getPaint(this.getDimension(), currentFrame)

    this[_viewPort].setContent(paint.ascii)

    this.update()
  }

  /**
   * @override
   */
  render() {
    // Simply refresh the screen if it's already been rendered initially
    if (this[_screen]) {
      this.update()

      return super.render()
    }

    // Create the main screen to contain the media view port and status + title bars
    this[_screen] = blessed.screen({ fastCSR: true })

    for (const entry of BlessedDisplay[_keyBindings].entries()) {
      const keys = entry[0].split(/,\s*/)
      const callback = entry[1]

      this[_screen].key(keys, () => callback(this.controller))
    }

    // Create the view port through which the media will be displayed
    this[_viewPort] = blessed.box({
      border: 'line',
      height: '100%',
      left: 0,
      parent: this[_screen],
      style: { bg: 'black' },
      top: 0,
      width: '100%'
    })

    // Create a bar to display the status text
    this[_statusBar] = blessed.box({
      bottom: -1,
      height: 1,
      left: 1,
      padding: {
        left: 1,
        right: 1
      },
      parent: this[_viewPort],
      type: 'overlay',
      width: 'shrink'
    })

    // Create a bar to display the title
    this[_titleBar] = blessed.box({
      height: 1,
      left: 1,
      padding: {
        left: 1,
        right: 1
      },
      parent: this[_viewPort],
      top: -1,
      type: 'overlay',
      width: 'shrink'
    })

    this.update()

    return super.render()
  }

  /**
   * @override
   */
  showHelp() {
    this[_help] = blessed.box({
      border: 'line',
      height: 'shrink',
      left: 'center',
      parent: this[_screen],
      tags: true,
      top: 'center',
      width: 'shrink'
    })
    // TODO: Populate keyboard shortcuts dynamically
    this[_help].setContent(`{bold}Help Instructions{/bold}

{underline}Keyboard Shortcuts:{/underline}
Pause          - Space
Resume         - Space
Stop           - Enter (same as Quit)
Show/Hide Help - ?
Quit           - Esc, Q, ${process.platform === 'darwin' ? 'Command' : 'Control'}+C`)

    return super.showHelp()
  }

  /**
   * @override
   */
  update() {
    this[_statusBar].setText(this.status)
    this[_titleBar].setText(this.title)
    this[_screen].render()
  }

  /**
   * Destroys a screen object which may be referenced by the specified <code>field</code> on this
   * {@link BlessedDisplay}.
   *
   * @param {string|symbol} field - the identifier for the screen object field
   * @return {void}
   * @private
   */
  [_destroyNode](field) {
    if (this[field]) {
      this[field].destroy()

      this[field] = null
    }
  }

}

/**
 * A map of key bindings and functions to be called when those bindings are triggered.
 *
 * @private
 * @static
 * @type {Map.<string, BlessedDisplay~KeyBindingCallback>}
 */
BlessedDisplay[_keyBindings] = new Map()
BlessedDisplay[_keyBindings].set('?', (controller) => controller.help())
BlessedDisplay[_keyBindings].set('enter', (controller) => controller.stop())
BlessedDisplay[_keyBindings].set('escape, q, C-c', (controller) => controller.destroy())
BlessedDisplay[_keyBindings].set('space', (controller) => {
  if (controller.player.playing) {
    controller.pause()
  } else {
    controller.resume()
  }
})

module.exports = BlessedDisplay

/**
 * Handles the triggering of a key binding.
 *
 * @callback BlessedDisplay~KeyBindingCallback
 * @param {Controller} controller - the {@link Controller} to be used
 * @return {void}
 */
