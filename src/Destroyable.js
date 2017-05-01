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

const EventEmitter = require('events').EventEmitter

/**
 * An <code>EventEmitter</code> that allows itself to be easily destroyed.
 *
 * @public
 * @extends EventEmitter
 */
class Destroyable extends EventEmitter {

  /**
   * Destroys this {@link Destroyable} object.
   *
   * By default, this method only fires a "destroy" event and removes <em>all</em> event listeners, however,
   * implementations are encouraged to extend this behaviour.
   *
   * @return {Destroyable} A reference to this {@link Destroyable} for chaining purposes.
   * @public
   */
  destroy() {
    this.emit('destroy')

    this.removeAllListeners()

    return this
  }

}

module.exports = Destroyable
