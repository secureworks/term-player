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

const _finalized = Symbol('finalized')
const _frames = Symbol('frames')
const _totalLength = Symbol('totalLength')

/**
 * Contains a set of frames.
 *
 * @public
 * @extends EventEmitter
 */
class FrameSet extends EventEmitter {

  /**
   * Creates an instance of {@link FrameSet}.
   *
   * @param {Frame[]} [frames=[]] - the initial frames to be added to the set
   * @public
   */
  constructor(frames) {
    super()

    this[_finalized] = false
    this[_frames] = frames ? frames.slice() : []
    this[_totalLength] = 0
  }

  /**
   * Adds the specified <code>frame</code> to the end of this {@link FrameSet}.
   *
   * An "add" event is fired after <code>frame</code> has been added, with <code>frame</code> being passed with the
   * event.
   *
   * @param {Frame} frame - the {@link Frame} to be added
   * @return {FrameSet} A reference to this {@link FrameSet} for chaining purposes.
   * @throws {Error} If this {@link FrameSet} has been finalized.
   * @public
   */
  add(frame) {
    if (this.finalized) {
      throw new Error('Cannot add to frame set which has been finalized')
    }

    this[_frames].push(frame)
    this[_totalLength]++

    this.emit('add', frame)

    return this
  }

  /**
   * Finalizes this {@link FrameSet}, marking it as "complete" and preventing any more frames from being added to it.
   *
   * A "finalize" event is fired only if this {@link FrameSet} had not already been marked as finalized.
   *
   * @return {FrameSet} A reference to this {@link FrameSet} for chaining purposes.
   * @public
   */
  finalize() {
    if (this[_finalized]) {
      return this
    }

    this[_finalized] = true

    this.emit('finalize')

    return this
  }

  /**
   * Returns whether this {@link FrameSet} has another {@link Frame}.
   *
   * It's recommended that this method is called before calling {@link FrameSet#next} to avoid an error being thrown.
   *
   * @return {boolean} <code>true</code> if this frame set contains at least one frame; otherwise <code>false</code>.
   * @public
   */
  hasNext() {
    return this[_frames].length > 0
  }

  /**
   * Removes the {@link Frame} from the front of this {@link FrameSet} and returns it.
   *
   * It is recommended that {@link FrameSet#hasNext} is called prior to calling this method to avoid an error being
   * thrown. Also, it's important to note that, while a {@link FrameSet} may have no more frames, it may still be
   * expecting some. Only when a set has been finalized is it clear if you're at the end of the set or just what's been
   * loaded so far (see {@link FrameSet#finalized}).
   *
   * A "next" event is fired after the frame has been removed from the front of this {@link FrameSet}, with the frame
   * being passed with the event.
   *
   * @return {Frame} The next {@link Frame}.
   * @throws {Error} If this frame set contains no more frames.
   * @public
   */
  next() {
    if (!this.hasNext()) {
      throw new Error('No more frames in set')
    }

    const frame = this[_frames].shift()

    this.emit('next', frame)

    return frame
  }

  /**
   * Returns a subset of this {@link FrameSet} in a new {@link FrameSet}.
   *
   * If this {@link FrameSet} has been finalized, so will the instance returned by this method. The total number of
   * frames that have been added to the set will not be transferred and will be reset to the number of frames within the
   * subset.
   *
   * @param {number} [begin=0] - the index at which to begin extraction (inclusive)
   * @param {number} [end=this.length] - the index at which to end extraction (exclusive)
   * @return {FrameSet} A {@link FrameSet} instance containing a subset of the frames within this {@link FrameSet}.
   * @public
   */
  subSet(begin, end) {
    const frameSet = new FrameSet(this[_frames].slice(begin, end))
    frameSet[_totalLength] = frameSet.length

    if (this[_finalized]) {
      frameSet[_finalized] = true
    }

    return frameSet
  }

  /**
   * Returns whether this {@link FrameSet} has been finalized.
   *
   * Finalized frame sets should be considered as being marked as "complete". That is; no more frames can be added to
   * them.
   *
   * @return {boolean} <code>true</code> if this {@link FrameSet} is finalized; otherwise <code>false</code>.
   * @public
   */
  get finalized() {
    return this[_finalized]
  }

  /**
   * Returns the number of frames within this {@link FrameSet}.
   *
   * This count will only include remaining frames in this set and <b>not</b> those that have been removed as a result
   * of calling {@link FrameSet#next}. In order to retrieve the total number of frames that have been added to this set,
   * use {@link FrameSet#totalLength}.
   *
   * @return {number} The number of frames.
   * @public
   */
  get length() {
    return this[_frames].length
  }

  /**
   * Returns the total number of frames that have been added to this {@link FrameSet}.
   *
   * @return {number} The total number of frames.
   * @public
   */
  get totalLength() {
    return this[_totalLength]
  }

}

module.exports = FrameSet
