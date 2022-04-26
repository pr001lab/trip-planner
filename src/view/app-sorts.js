import AbstractView from './abstract.js';

const sortTypesStatuses = new Map ([
  ['day', ''],
  ['event', 'disabled'],
  ['time', ''],
  ['price', ''],
  ['offer', 'disabled'],
]);

const createAppSortsTemplate = (sortTypeChecked) => {
  let sortsTemplate = '<form class="trip-events__trip-sort  trip-sort" action="#" method="get">';
  sortTypesStatuses.forEach((sortStatus, sortType) => {
    const sortState = (sortTypeChecked === `sort-${sortType}`) ? 'checked' : '';
    sortsTemplate += `<div class="trip-sort__item  trip-sort__item--${sortType}">
      <input id="sort-${sortType}" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="sort-${sortType}" ${sortStatus} ${sortState}>
      <label class="trip-sort__btn" for="sort-${sortType}">${sortType}</label>
    </div>`;
  });

  return `${sortsTemplate}</form>`;
};

export default class AppSorts extends AbstractView {
  constructor(sortType) {
    super();
    this._sortType = sortType;

    this._sortTypeChangeHandler = this._sortTypeChangeHandler.bind(this);
  }

  getTemplate() {
    return createAppSortsTemplate(this._sortType);
  }

  _sortTypeChangeHandler(evt) {
    if(evt.target.tagName !== 'INPUT') {
      return;
    }
    evt.preventDefault();
    this._callback.sortTypeChange(evt.target.value);
  }

  setSortTypeChangeHandler(callback) {
    this._callback.sortTypeChange = callback;
    this.getElement().addEventListener('click', this._sortTypeChangeHandler);
  }
}
