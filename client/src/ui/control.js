import _ from "lodash";

import { Child } from "../engine/object";
import Message from "../engine/message";

export default class Control extends Child {
  constructor(rect) {
    super(rect);

    this.forwarder = {};
    this.state = null;
    this.disabled = false;
    this.border.xy = [2, 2];
  }

  /**
   * Add forwarder to UI control
   * @param type      Event type
   * @param callback  Callback
   * @returns {Control}
   */
  addForwarder(type, callback) {
    let oldForwarder = this.forwarder[type];
    this.forwarder[type] = oldForwarder ? _.wrap(oldForwarder, callback) : callback;
    return this;
  }

  /**
   * Check is mouse hover
   * @param event Event
   * @private
   */
  _checkMouseEvent(event) {
    return !event.isMouseEvent() || this.rect.contains(event.data);
  }

  /**
   * Send event to forwarder
   * @param event Event
   * @returns {Control}
   * @private
   */
  _sendToForwarder(event) {
    let callback = this.forwarder[event.type];
    callback && callback.bind(this)(event);
    return this;
  }

  /**
   * Check component has focus(when has mouse click or drag event
   * @returns {Boolean} if has
   */
  hasFocus() {
    return this.state === Message.Type.MOUSE_CLICK;
  }

  /**
   * Forward event to callbacks
   * @param event  Event
   */
  onEvent(event) {
    // TODO: Add more event types
    if(!this._checkMouseEvent(event) && event.type != Message.Type.MOUSE_MOVE) {
      this.state = 0;
      return false;
    }

    // Set focus on object
    if(this.layer)
      this.layer.focus = this;

    // Set state only on mouse event, that helps with setting focus
    if(event.isMouseEvent() && event.type != Message.Type.MOUSE_MOVE)
      this.state = event.type;

    // Assign state and call callback
    this._sendToForwarder(event);
  }
}