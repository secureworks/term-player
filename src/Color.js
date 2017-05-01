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

const convert = require('color-convert')

const _alpha = Symbol('alpha')
const _ansiCache = Symbol('ansiCache')
const _blue = Symbol('blue')
const _green = Symbol('green')
const _red = Symbol('red')

/**
 * Contains the RGBA information for a specific color.
 *
 * This class also supports the ability to convert {@link Color} instances to ANSI color codes as well as paint
 * background and foreground colors on the terminal.
 *
 * @public
 */
class Color {

  /**
   * Closes an opened ANSI color styling for the terminal.
   *
   * @return {string} A string used to close the last opened color styling.
   * @public
   * @static
   */
  static closeAnsi() {
    return '\u001b[39m'
  }

  /**
   * Creates a {@link Color} from the serialized <code>color</code> provided.
   *
   * @param {?string} color - the serialized color (may be <code>null</code>)
   * @return {?Color} The deserialized {@link Color} or <code>null</code> if <code>color</code> is <code>null</code>.
   * @public
   * @static
   */
  static deserialize(color) {
    if (color == null) {
      return null
    }

    const rgb = color.split(',')

    return new Color(rgb[0], rgb[1], rgb[2], rgb[3])
  }

  /**
   * Returns whether the ANSI color identified by the <code>code</code> provided is considered grayscale.
   *
   * @param {number} code - the ANSI color code to be checked
   * @return {boolean} <code>true</code> if the ANSI color is grayscale; otherwise <code>false</code>.
   * @public
   * @static
   */
  static isAnsiGrayscale(code) {
    return code >= 232 || code === 59 || code === 16
  }

  /**
   * Opens ANSI color styling for the terminal based on the color <code>code</code> provided.
   *
   * @param {number} code - the ANSI color code to be used for styling
   * @return {string} A string used to open color styling.
   * @public
   * @static
   */
  static openAnsi(code) {
    return `\u001b[38;5;${code}m`
  }

  /**
   * Creates a string serialization from the <code>color</code> provided.
   *
   * @param {?Color} color - the {@link Color} to be serialized (may be <code>null</code>)
   * @return {?string} The serialized color string or <code>null</code> if <code>color</code> is <code>null</code>.
   * @public
   * @static
   */
  static serialize(color) {
    if (color == null) {
      return null
    }

    return `${color.red},${color.green},${color.blue},${color.alpha}`
  }

  /**
   * Creates an instance of {@link Color} based on the RGBA information provided.
   *
   * @param {number} red - the red value (between 0-255 inclusive)
   * @param {number} green - the green value (between 0-255 inclusive)
   * @param {number} blue - the blue value (between 0-255 inclusive)
   * @param {number} [alpha=255] - the alpha value (between 0-255 inclusive)
   * @public
   */
  constructor(red, green, blue, alpha) {
    this[_red] = red
    this[_green] = green
    this[_blue] = blue
    this[_alpha] = alpha != null ? alpha : 255
  }

  /**
   * Returns whether this {@link Color} has some transparency.
   *
   * @return {boolean} <code>true</code> if this color has some transparency; otherwise <code>false</code>.
   * @public
   */
  hasTransparency() {
    return this.alpha < 255
  }

  /**
   * Converts this {@link Color} to an ANSI color code.
   *
   * @return {number} The ANSI color.
   * @public
   */
  toAnsi() {
    const serialized = Color.serialize(this)
    let ansiColor = Color[_ansiCache].get(serialized)

    if (ansiColor == null) {
      ansiColor = convert.rgb.ansi256(this.red, this.green, this.blue)

      Color[_ansiCache].set(serialized, ansiColor)
    }

    return ansiColor
  }

  /**
   * @override
   */
  toString() {
    return Color.serialize(this)
  }

  /**
   * Returns the alpha value for this {@link Color}.
   *
   * @return {number} The alpha value.
   * @public
   */
  get alpha() {
    return this[_alpha]
  }

  /**
   * Returns the blue value for this {@link Color}.
   *
   * @return {number} The blue value.
   * @public
   */
  get blue() {
    return this[_blue]
  }

  /**
   * Returns the green value for this {@link Color}.
   *
   * @return {number} The green value.
   * @public
   */
  get green() {
    return this[_green]
  }

  /**
   * Returns the red value for this {@link Color}.
   *
   * @return {number} The red value.
   * @public
   */
  get red() {
    return this[_red]
  }

}

/**
 * A cache containing a map of serialized colors and their corresponding ANSI codes.
 *
 * This is an attempt to minimize the performance impact of converting RGB colors to ANSI on the fly.
 *
 * @private
 * @static
 * @type {Map.<string, number>}
 */
Color[_ansiCache] = new Map()

module.exports = Color
