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
const Frame = require('./Frame')

/**
 * A simple implementation of {@link Frame} that does not support transparency.
 *
 * This relies on the provided pixels only containing RGB information and <i>not</i> RGBA.
 *
 * @public
 * @extends Frame
 */
class OpaqueFrame extends Frame {

  /**
   * @override
   */
  getPixelColor(pixels, index) {
    const color = new Color(pixels[index], pixels[index + 1], pixels[index + 2])

    return color.toAnsi()
  }

  /**
   * @override
   */
  getPixelLength() {
    return 3
  }

}

module.exports = OpaqueFrame
