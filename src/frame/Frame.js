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
const Dimension = require('../Dimension')
const Paint = require('./Paint')

const _countColors = Symbol('countColors')
const _dimension = Symbol('dimension')
const _index = Symbol('index')
const _paintCache = Symbol('paintCache')
const _pixels = Symbol('pixels')

/**
 * Contains the information for a single frame within media which can be used to paint an image onto a {@link Display}
 * to present that frame on the terminal.
 *
 * @public
 */
class Frame {

  /**
   * Creates an instance of {@link Frame} based on the dimensions provided and with the specified <code>pixels</code>.
   *
   * @param {number} index - the index to be used
   * @param {Uint8Array} pixels - the pixels to be used
   * @param {number} width - the width to be used
   * @param {number} height - the height to be used
   * @public
   */
  constructor(index, pixels, width, height) {
    this[_index] = index
    this[_pixels] = pixels
    this[_dimension] = new Dimension(width, height)
    this[_paintCache] = new Map()
  }

  /**
   * Returns information which can be used to paint a view port.
   *
   * The returned object contains an ASCII string filled with a spacer whose foreground has been painted with ANSI
   * colors derived from the pixels of this {@link Frame} and based on the view port <code>dimension</code> provided.
   *
   * If this {@link Frame} is missing pixel information, this method will attempt to extract the missing colors from the
   * previous frame that has been provided.
   *
   * @param {Dimension} dimension - the {@link Dimension} of the view port
   * @param {?Frame} [previousFrame] - the previous {@link Frame} that was painted, where applicable (may be
   * <code>null</code>)
   * @return {Paint} The {@link Paint} information which can be used to paint the view port.
   * @public
   */
  getPaint(dimension, previousFrame) {
    const cacheKey = `${dimension}`
    let paint = this[_paintCache].get(cacheKey)

    if (paint == null) {
      const countedColors = this[_countColors](dimension)
      const lastPaint = previousFrame && previousFrame.getPaint(dimension)
      paint = new Paint(this, countedColors, lastPaint)

      this[_paintCache].set(cacheKey, paint)
    }

    return paint
  }

  /**
   * Returns the ANSI color code to represent the pixel at the specified <code>index</code>.
   *
   * @param {Uint8Array} pixels - the pixels from which the color is to be extracted
   * @param {number} index - the index of the pixel from which the ANSI color is to be derived
   * @return {number} The ANSI color code of the pixel at the given <code>index</code>.
   * @protected
   */
  getPixelColor(pixels, index) {
    const color = new Color(pixels[index], pixels[index + 1], pixels[index + 2], pixels[index + 3])

    return color.hasTransparency() ? Paint.TRANSPARENT_ANSI : color.toAnsi()
  }

  /**
   * Returns the number of the items in the pixels grouped for each pixel.
   *
   * @return {number} The length of pixel information.
   * @protected
   */
  getPixelLength() {
    return 4
  }

  /**
   * Counts the number of colors within each "pixel area" of this {@link Frame}.
   *
   * Since the media is scaled to fit within the view port, a "pixel area" is calculated to get a good sample of pixel
   * colors from scaled groups across this {@link Frame}.
   *
   * @param {Dimension} dimension - the {@link Dimension} of the view port
   * @return {Array.<Object.<string, number>>} An array of color count mappings representing "pixel areas" captured
   * across the entire frame.
   * @private
   */
  [_countColors](dimension) {
    const blockHeight = Math.max(this.dimension.height / dimension.height, 1)
    const blockWidth = Math.max(this.dimension.width / dimension.width, 1)
    const counts = []
    const pixelLength = this.getPixelLength()

    for (let i = 0; i < this[_pixels].length; i += pixelLength) {
      const pixelIndex = i / pixelLength
      const index = (Math.floor(pixelIndex / blockWidth) % dimension.width) +
        (Math.floor(pixelIndex / this.dimension.width / blockHeight) * dimension.width)

      if (!counts[index]) {
        counts[index] = {}
      }

      const color = this.getPixelColor(this[_pixels], i)

      if (!(color in counts[index])) {
        counts[index][color] = 0
      }

      counts[index][color]++
    }

    return counts
  }

  /**
   * Returns the dimension for this {@link Frame}.
   *
   * @return {Dimension} The {@link Dimension}.
   * @public
   */
  get dimension() {
    return this[_dimension]
  }

  /**
   * Returns the index for this {@link Frame}.
   *
   * @return {number} The index.
   * @public
   */
  get index() {
    return this[_index]
  }

  /**
   * Returns a copy of the pixels for this {@link Frame}.
   *
   * @return {Uint8Array} The pixels.
   * @public
   */
  get pixels() {
    return new Uint8Array(this[_pixels])
  }

}

module.exports = Frame
