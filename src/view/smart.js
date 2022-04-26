import AbstractView from './abstract.js';

export default class Smart extends AbstractView {
  constructor() {
    super();
    this._state = {};
  }

  updateState(update, optionNoUpdateElement) {
    if(!update) {
      return;
    }

    this._state = Object.assign ({}, this._state, update);

    if(optionNoUpdateElement === 'noUpdateElement') {
      return;
    }

    this.updateElement();
  }

  updateElement() {
    const prevElement = this.getElement();
    const parent = prevElement.parentElement;
    this.removeElement();
    const newElement = this.getElement();

    parent.replaceChild(newElement, prevElement);

    this.restoreHandlers();
  }

  restoreHandlers() {
    throw new Error ('Abstract method not implemented: restoreHandlers');
  }
}
