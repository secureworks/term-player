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

const _height = Symbol('height')
const _width = Symbol('width')

/**
 * Contains width and height dimensions.
 *
 * @public
 */
class Dimension {

  /**
   * Creates an instance of {@link Dimension} for the specified <code>width</code> and <code>height</code>.
   *
   * If either <code>width</code> or <code>height>/code> are negative values, they will be converted to positive values.
   *
   * @param {number} [width=0] - the width to be used
   * @param {number} [height=0] - the height to be used
   * @public
   */
  constructor(width, height) {
    this[_width] = width ? Math.abs(width) : 0
    this[_height] = height ? Math.abs(height) : 0
  }

  /**
   * @override
   */
  toString() {
    return `${this.width}x${this.height}`
  }

  /**
   * Returns the surface area for this {@link Dimension}.
   *
   * @return {number} The surface area.
   * @public
   */
  get area() {
    return this.width * this.height
  }

  /**
   * Returns the height for this {@link Dimension}.
   *
   * @return {number} The height.
   * @public
   */
  get height() {
    return this[_height]
  }

  /**
   * Returns the width for this {@link Dimension}.
   *
   * @return {number} The width.
   * @public
   */
  get width() {
    return this[_width]
  }

}

module.exports = Dimension
