import AbstractView from './abstract.js';
import { getDateFormate, getDurationFormated } from '../utils/point.js';

const createListEventItemOffersTemplate = (offers) => (
  `${offers.length ? `<h4 class="visually-hidden">Offers:</h4>
    <ul class="event__selected-offers">
      ${offers.map(({title, price}) => `
        <li class="event__offer">
          <span class="event__offer-title">${title}</span>
          &plus;&euro;&nbsp;
          <span class="event__offer-price">${price}</span>
        </li>
      `).join('')}
    </ul>` : ''}`
);


const createAppListEventItemTemplate = (point) => {
  const { basePrice, dateFrom, dateTo, isFavorite, currentOffers, namePoint, type } = point;

  const duration = getDurationFormated(dateFrom, dateTo);

  const offersTemplate = createListEventItemOffersTemplate(currentOffers);

  const favoriteClassName = isFavorite ? 'event__favorite-btn--active' : '';

  return `<li class="trip-events__item">
    <div class="event">
      <time class="event__date" datetime="${getDateFormate(dateFrom, 'YYYY-MM-DD')}">${getDateFormate(dateFrom, 'MMM D')}</time>
      <div class="event__type">
        <img class="event__type-icon" width="42" height="42" src="img/icons/${type}.png" alt="Event type icon">
      </div>
      <h3 class="event__title">${type} ${namePoint.name}</h3>
      <div class="event__schedule">
        <p class="event__time">
          <time class="event__start-time" datetime="${getDateFormate(dateFrom, 'YYYY-MM-DDTHH:mm')}">${getDateFormate(dateFrom, 'HH:mm')}</time>
          &mdash;
          <time class="event__end-time" datetime="${getDateFormate(dateTo,'YYYY-MM-DDTHH:mm' )}">${getDateFormate(dateTo, 'HH:mm')}</time>
        </p>
        <p class="event__duration">${duration}</p>
      </div>
      <p class="event__price">
        &euro;&nbsp;<span class="event__price-value">${basePrice}</span>
      </p>
      ${offersTemplate}
      <button class="event__favorite-btn ${favoriteClassName}" type="button">
        <span class="visually-hidden">Add to favorite</span>
        <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
          <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
        </svg>
      </button>
      <button class="event__rollup-btn" type="button">
        <span class="visually-hidden">Open event</span>
      </button>
    </div>
  </li>`;
};

export default class AppListEventItem extends AbstractView {
  constructor(point) {
    super();
    this._point = point;

    this._editClickHandler = this._editClickHandler.bind(this);
    this._favoriteClickHandler = this._favoriteClickHandler.bind(this);
  }

  getTemplate() {
    return createAppListEventItemTemplate(this._point);
  }

  _editClickHandler(evt) {
    evt.preventDefault();
    this._callback.editClick();
  }

  _favoriteClickHandler(evt) {
    evt.preventDefault();
    this._callback.favoriteClick();
  }

  setEditClickHandler(callback) {
    this._callback.editClick = callback;
    this.getElement().querySelector('.event__rollup-btn').addEventListener('click', this._editClickHandler);
  }

  setFavoriteClickHandler(callback) {
    this._callback.favoriteClick = callback;
    this.getElement().querySelector('.event__favorite-btn').addEventListener('click', this._favoriteClickHandler);
  }
}
