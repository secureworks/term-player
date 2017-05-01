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

const _paused = Symbol('paused')
const _playing = Symbol('playing')
const _stopped = Symbol('stopped')

/**
 * Contains the various valid states for a {@link Player}.
 *
 * @public
 */
class PlayerState {

  /**
   * Returns the state indicating that the {@link Player} is currently paused which means that, although it is not
   * currently playing any media, it has been and playing can be resumed.
   *
   * @return {symbol} The paused state.
   * @public
   * @static
   */
  static get PAUSED() {
    return _paused
  }

  /**
   * Returns the state indicating that the {@link Player} is currently playing media.
   *
   * @return {symbol} The playing state.
   * @public
   * @static
   */
  static get PLAYING() {
    return _playing
  }

  /**
   * Returns the state indicating that the {@link Player} has been stopped which means that it has either not played any
   * media or, if it had been, that media will need to be played again from the beginning and cannot be resumed.
   *
   * @return {symbol} The stopped state.
   * @public
   * @static
   */
  static get STOPPED() {
    return _stopped
  }

}

module.exports = PlayerState
