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

const Color = require('../Color')

const _ascii = Symbol('ascii')
const _colors = Symbol('colors')
const _frame = Symbol('frame')
const _getProminentColor = Symbol('getProminentColor')

/**
 * Contains information which can be used to paint a view port.
 *
 * @public
 */
class Paint {

  /**
   * Returns the character used to fill ASCII strings.
   *
   * @return {string} The ASCII character.
   * @public
   * @static
   */
  static get ASCII_CHARACTER() {
    return '#'
  }

  /**
   * Returns the code used to represent a transparent ANSI color.
   *
   * @return {number} The transparent ANSI color code.
   * @public
   * @static
   */
  static get TRANSPARENT_ANSI() {
    return -1
  }

  /**
   * Returns the prominent color from those provided. That is; the color which appeared most within the "pixel area".
   *
   * This method will return <code>null</code> if <code>colors</code> is <code>null</code> or empty. If a color is
   * transparent, the prominent color for the same "pixel area" painted previously will be used instead. However, this
   * will only be returned if it's still prominent.
   *
   * @param {number} index - the index of the "pixel area" for which the color will represent
   * @param {?Object.<string, number>} colors - the color count for a specific "pixel area" (may be <code>null</code>)
   * @param {?Array.<Object.<string, number>>} previousColors - the overall color count from the previous paint (may be
   * <code>null</code>)
   * @return {?number} The prominent ANSI color code within the specified <code>colors</code> or <code>null</code> if
   * <code>colors</code> is <code>null</code>.
   * @private
   * @static
   */
  static [_getProminentColor](index, colors, previousColors) {
    if (colors == null) {
      return null
    }

    const sorted = Object.keys(colors)
      .map((color) => {
        let ansiColor = parseInt(color, 10)
        let count = colors[color]

        // Take color from previously painted colors if this paint doesn't have the color information
        if (ansiColor === Paint.TRANSPARENT_ANSI && previousColors) {
          ansiColor = previousColors[index]
        }

        // Count color but use less weight for grayscale colors in attempt to encourage more colors
        if (Color.isAnsiGrayscale(ansiColor)) {
          count /= 2
        }

        return {
          color: ansiColor,
          count
        }
      })
      .sort((a, b) => {
        if (a.count < b.count) {
          return 1
        } else if (a.count > b.count) {
          return -1
        }
        return 0
      })
    const prominentColor = sorted[0]

    return prominentColor ? prominentColor.color : null
  }

  /**
   * Creates an instance of {@link Paint} for the specified <code>frame</code>.
   *
   * If a prominent color is missing (i.e. value is {@link Paint.TRANSPARENT_ANSI}), then this color will be replaced
   * with that taken from the last {@link Paint} provided, where possible.
   *
   * @param {Frame} frame - the parent {@link Frame}
   * @param {Array.<Object.<string, number>>} countedColors - an array of color count mappings representing "pixel
   * areas" to be pained
   * @param {Paint} [lastPaint] - the last {@link Paint} to be used to extract "missing" colors
   * @public
   */
  constructor(frame, countedColors, lastPaint) {
    this[_frame] = frame
    this[_ascii] = ''
    this[_colors] = []

    let previousColor = null
    const previousColors = lastPaint && lastPaint[_colors]

    for (let i = 0; i < countedColors.length; i++) {
      const colors = countedColors[i]
      const ansiColor = Paint[_getProminentColor](i, colors, previousColors)

      this[_colors][i] = ansiColor

      if (ansiColor !== previousColor) {
        if (this[_ascii]) {
          this[_ascii] += Color.closeAnsi()
        }

        this[_ascii] += Color.openAnsi(ansiColor)

        previousColor = ansiColor
      }

      this[_ascii] += Paint.ASCII_CHARACTER
    }

    if (this[_ascii]) {
      this[_ascii] += Color.closeAnsi()
    }
  }

  /**
   * @override
   */
  toString() {
    return this.ascii
  }

  /**
   * Returns the ASCII string for this {@link Paint}.
   *
   * @return {string} The ASCII string.
   * @public
   */
  get ascii() {
    return this[_ascii]
  }

  /**
   * Returns an array of ANSI color codes to be used to represent each "pixel area" for this {@link Paint}.
   *
   * @return {number[]} The ANSI color codes.
   * @public
   */
  get colors() {
    return this[_colors].slice()
  }

  /**
   * Returns the parent frame for this {@link Paint}.
   *
   * @return {Frame} The parent {@link Frame}.
   * @public
   */
  get frame() {
    return this[_frame]
  }

}

module.exports = Paint
