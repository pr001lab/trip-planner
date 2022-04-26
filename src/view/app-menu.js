import AbstractView from './abstract.js';
import { MenuItem } from '../consts.js';

const LINK_DISABLED_STYLE = 'style="pointer-events:none;opacity:0.5"';

const isDisabledStats = (count) => (count === 0) ? LINK_DISABLED_STYLE : '';

const createAppMenuTemplate = (points) =>
  `<nav class="trip-controls__trip-tabs  trip-tabs">
    <a class="trip-tabs__btn  trip-tabs__btn--active" href="#">${MenuItem.TABLE}</a>
    <a class="trip-tabs__btn" href="#" ${isDisabledStats(points.length)}>${MenuItem.STATS}</a>
  </nav>`;

export default class AppMenu extends AbstractView{
  constructor(points) {
    super();
    this._points = points;

    this._menuClickHandler = this._menuClickHandler.bind(this);
  }

  getTemplate() {
    return createAppMenuTemplate(this._points);
  }

  _menuClickHandler(evt) {
    evt.preventDefault();
    this._callback.menuClick(evt.target.text);
  }

  setMenuClickHandler(callback) {
    this._callback.menuClick = callback;
    this.getElement().addEventListener('click', this. _menuClickHandler);
  }

  setMenuItem(menuItem) {
    const items = this.getElement().querySelectorAll('.trip-tabs__btn');
    items.forEach((item) => {
      (item.text === menuItem) ? item.classList.add('trip-tabs__btn--active') : item.classList.remove('trip-tabs__btn--active');
    });
  }
}
