import flatpickr from 'flatpickr';
import '../../node_modules/flatpickr/dist/flatpickr.min.css';
import SmartView from './smart.js';
import { getDateFormate } from '../utils/point.js';

const LABEL_DISABLED_STYLE = 'style="pointer-events:none;opacity:0.5"';

const BLANK_POINT = {
  basePrice: 1,
  currentOffers: [],
  dateFrom: new Date().toISOString(),
  dateTo: new Date().toISOString(),
  isFavorite: false,
  namePoint: {
    name: '',
    description: '',
    pictures: [],
  },
  type: 'taxi',
};

const getUpperCaseFirstLetter = (word) => word.charAt(0).toUpperCase() + word.slice(1);

const isExistsNamePoint = (namePoint, destinations) => destinations.filter((destination) => destination.name === namePoint);

const createEditPointEventTypeItemTemplate = (id, offers) => (
  offers.map(({type}) => `<div class="event__type-item">
    <input id="event-type-${type}-${id}" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${type}">
    <label class="event__type-label  event__type-label--${type}" for="event-type-${type}-${id}">${getUpperCaseFirstLetter(type)}</label>
  </div>`).join('')
);

const createEditPointEventDestinationItemTemplate = (destinations) => (
  destinations.map((item) => `<option value="${item.name}"></option>`).join('')
);

const getDestinationDescription = (namePoint, destinations) => (isExistsNamePoint(namePoint, destinations).length > 0) ? destinations.filter((destination) => destination.name === namePoint)[0].description : '';

const createEditPointOffersTemplate = (type, currentOffers, offers, id, isDisabled) => {
  const isCheckedOffer = (title) => currentOffers.map((item) => item.title).includes(title) ? 'checked' : '';

  const offersByType = offers.filter((offer) => offer.type === type)[0].offers;

  return `${offersByType.length ? `<section class="event__section  event__section--offers">
    <h3 class="event__section-title  event__section-title--offers">Offers</h3>

      <div class="event__available-offers">
        ${offersByType.map(({title, price}) => `<div class="event__offer-selector">
            <input class="event__offer-checkbox  visually-hidden" id="event-offer-${title}-${id}" type="checkbox" name="event-offer-${title}-${price}" ${isCheckedOffer(title)} ${isDisabled ? 'disabled' : ''}>
            <label class="event__offer-label" for="event-offer-${title}-${id}" ${isDisabled ? LABEL_DISABLED_STYLE : ''} >
              <span class="event__offer-title">${title}</span>
              &plus;&euro;&nbsp;
              <span class="event__offer-price">${price}</span>
            </label>
          </div>
        `).join('')}
      </div>
    </section>` : ''}`;
};

const createPhotosTemplate = (namePoint, destinations) => {
  const pictures = (isExistsNamePoint(namePoint, destinations).length > 0) ? destinations.filter((destination) => destination.name === namePoint)[0].pictures : [];

  return `${pictures.length ? `<div class="event__photos-container">
  <div class="event__photos-tape">
  ${pictures.map(({src}) => `<img class="event__photo" src="${src}" alt="Event photo">`).join('')}
  </div>
</div>`: ''}`;
};

const createEventRollupBtnTemplate = (isDisabled, isNewEvent) => (
  `${!isNewEvent ? `<button class="event__rollup-btn" type="button" ${isDisabled ? 'disabled' : ''}>
    <span class="visually-hidden">Open event</span>
  </button>`: ''}`
);

const createAppEditPointTemplate = (state, offers, destinations, isNewEvent) => {
  const { basePrice, dateFrom, dateTo, currentOffers, namePoint, type, id, isDisabled, isSaving, isDeleting } = state;

  const createEventTypeItems = createEditPointEventTypeItemTemplate(id, offers);

  const createEventDestinationItems = createEditPointEventDestinationItemTemplate(destinations);

  const createOffers = createEditPointOffersTemplate(type, currentOffers, offers, id, isDisabled);

  const createDestinationDescription = getDestinationDescription(namePoint.name, destinations);

  const createPhotos = createPhotosTemplate(namePoint.name, destinations);

  const eventResetBtnText = () => {
    if(isNewEvent) {
      return 'Cancel';
    }

    return (isDeleting) ? 'Deleting...' : 'Delete';
  };

  const createEventRollupBtnElement = createEventRollupBtnTemplate(isDisabled, isNewEvent);

  return `<li class="trip-events__item">
    <form class="event event--edit" action="#" method="post">
      <header class="event__header">
        <div class="event__type-wrapper">
          <label class="event__type  event__type-btn" for="event-type-toggle-${id}" ${isDisabled ? LABEL_DISABLED_STYLE : ''}>
            <span class="visually-hidden">Choose event type</span>
            <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
          </label>
          <input class="event__type-toggle  visually-hidden" id="event-type-toggle-${id}" type="checkbox" ${isDisabled ? 'disabled' : ''}>

          <div class="event__type-list">
            <fieldset class="event__type-group">
              <legend class="visually-hidden">Event type</legend>
              ${createEventTypeItems}
            </fieldset>
          </div>
        </div>

        <div class="event__field-group  event__field-group--destination">
          <label class="event__label  event__type-output" for="event-destination-${id}">
            ${type}
          </label>
          <input class="event__input  event__input--destination" id="event-destination-${id}" type="text" name="event-destination" value="${namePoint.name}" list="destination-list-${id}" ${isDisabled ? 'disabled' : ''}>
          <datalist id="destination-list-${id}">
            ${createEventDestinationItems}
          </datalist>
        </div>

        <div class="event__field-group  event__field-group--time">
          <label class="visually-hidden" for="event-start-time-${id}">From</label>
          <input class="event__input  event__input--time" id="event-start-time-${id}" type="text" name="event-start-time" value="${getDateFormate(dateFrom, 'DD/MM/YY HH:mm')}" ${isDisabled ? 'disabled' : ''}>
          &mdash;
          <label class="visually-hidden" for="event-end-time-${id}">To</label>
          <input class="event__input  event__input--time" id="event-end-time-${id}" type="text" name="event-end-time" value="${getDateFormate(dateTo, 'DD/MM/YY HH:mm')}" ${isDisabled ? 'disabled' : ''}>
        </div>

        <div class="event__field-group  event__field-group--price">
          <label class="event__label" for="event-price-${id}">
            <span class="visually-hidden">Price</span>
            &euro;
          </label>
          <input class="event__input  event__input--price" id="event-price-${id}" type="text" name="event-price" value="${basePrice}" ${isDisabled ? 'disabled' : ''}>
        </div>

        <button class="event__save-btn  btn  btn--blue" type="submit" ${isDisabled ? 'disabled' : ''}>${isSaving ? 'Saving...' : 'Save'}</button>
        <button class="event__reset-btn" type="reset" ${isDisabled ? 'disabled' : ''}>${eventResetBtnText()}</button>
        ${createEventRollupBtnElement}
      </header>
      <section class="event__details">
        ${createOffers}

        <section class="event__section  event__section--destination">
          <h3 class="event__section-title  event__section-title--destination">Destination</h3>
          <p class="event__destination-description">${createDestinationDescription}</p>
          ${createPhotos}
        </section>
      </section>
    </form>
  </li>`;
};

export default class AppEditPoint extends SmartView {
  constructor(data) {
    super();
    this._dataPoint = data.point;
    const {point = BLANK_POINT, offers, destinations} = data;
    this._state = AppEditPoint.parseDataToState(point);
    this._offers = offers;
    this._destinations = destinations;
    this._datepicker = null;
    this._datepickerStartOrEnd = '';

    this._formSubmitHandler = this._formSubmitHandler.bind(this);
    this._formDeleteClickHandler = this._formDeleteClickHandler.bind(this);
    this._clickCloseHandler = this._clickCloseHandler.bind(this);
    this._nameChangeHandler = this._nameChangeHandler.bind(this);
    this._typeChangeHandler = this._typeChangeHandler.bind(this);
    this._priceChangeHandler = this._priceChangeHandler.bind(this);
    this._dateChangeHandler = this._dateChangeHandler.bind(this);
    this._offerChangeHandler = this._offerChangeHandler.bind(this);
    this._setDatepicker = this._setDatepicker.bind(this);

    this._setInnerHandlers();
  }

  removeElement() {
    super.removeElement();
    this._destroyDatepicker();
  }

  _destroyDatepicker() {
    if (this._datepicker) {
      this._datepicker.destroy();
      this._datepicker = null;
    }
  }

  _setDatepicker(evt) {
    this._destroyDatepicker();
    this._datepickerStartOrEnd = evt.target.id;

    const minDateDatepicker = (this._datepickerStartOrEnd === `event-start-time-${this._state.id}`) ? null : this._state.dateFrom;
    this._datepicker = flatpickr(evt.target,
      {
        dateFormat: 'd/m/y H:i',
        defaultDate: this._state.dateFrom,
        minDate: minDateDatepicker,
        onChange: this._dateChangeHandler,
        ['time_24hr']: true,
        enableTime: true,
      },
    );
  }

  _dateChangeHandler([userDate]) {
    this._destroyDatepicker();
    const dateStartOrEnd = (this._datepickerStartOrEnd === `event-start-time-${this._state.id}`) ? 'dateFrom' : 'dateTo';
    this.updateState({[dateStartOrEnd]: userDate.toISOString()}, 'noUpdateElement');
  }

  getTemplate() {
    const isNewEvent = (!this._dataPoint);

    return createAppEditPointTemplate(this._state, this._offers, this._destinations, isNewEvent);
  }

  _formSubmitHandler(evt) {
    evt.preventDefault();
    this._callback.formSubmit(AppEditPoint.parseStateToData(this._state));
  }

  setFormSubmitHandler(callback) {
    this._callback.formSubmit = callback;
    this.getElement().querySelector('form').addEventListener('submit', this._formSubmitHandler);
  }

  _clickCloseHandler(evt) {
    evt.preventDefault();
    this._callback.clickClose();
  }

  setClickCloseHandler(callback) {
    this._callback.clickClose = callback;
    if(this.getElement().querySelector('.event__rollup-btn')) {
      this.getElement()
        .querySelector('.event__rollup-btn')
        .addEventListener('click', this._clickCloseHandler);
    }
  }

  _formDeleteClickHandler(evt) {
    evt.preventDefault();
    this._callback.deleteClick(AppEditPoint.parseStateToData(this._state));
  }

  setDeleteClickHandler(callback) {
    this._callback.deleteClick = callback;
    this.getElement().querySelector('.event__reset-btn').addEventListener('click', this._formDeleteClickHandler);
  }

  restoreHandlers() {
    this._setInnerHandlers();
    this.setFormSubmitHandler(this._callback.formSubmit);
    this.setDeleteClickHandler(this._callback.deleteClick);
  }

  _setInnerHandlers() {
    this.getElement()
      .querySelector('.event__input--destination')
      .addEventListener('change', this._nameChangeHandler);
    this.getElement()
      .querySelector('.event__type-group')
      .addEventListener('click', this._typeChangeHandler);
    this.getElement()
      .querySelector('.event__input--price')
      .addEventListener('input', this._priceChangeHandler);
    if(this.getElement().querySelector('.event__rollup-btn')) {
      this.getElement()
        .querySelector('.event__rollup-btn')
        .addEventListener('click', this._clickCloseHandler);
    }
    this.getElement()
      .querySelector(`#event-start-time-${this._state.id}`)
      .addEventListener('focus', this._setDatepicker);
    this.getElement()
      .querySelector(`#event-end-time-${this._state.id}`)
      .addEventListener('focus', this._setDatepicker);
    if(this.getElement().querySelector('.event__available-offers')) {
      this.getElement()
        .querySelector('.event__available-offers')
        .addEventListener('change', this._offerChangeHandler);
    }
  }

  _nameChangeHandler(evt) {
    evt.preventDefault();
    evt.target.required = true;
    evt.target.autocomplete = 'off';
    const isExists = this._destinations.filter((destination) => destination.name === evt.target.value);
    if(isExists.length <= 0) {
      evt.target.setCustomValidity('There must be values from the list');
    } else {
      evt.target.setCustomValidity('');
      this.updateState({namePoint: isExists[0]});
    }
    evt.target.reportValidity();
  }

  _typeChangeHandler(evt) {
    evt.preventDefault();
    if(evt.target.tagName === 'LABEL') {
      this.updateState({type: (evt.target.textContent).toLowerCase()});
    }
  }

  _priceChangeHandler(evt) {
    evt.preventDefault();
    evt.target.required = true;
    evt.target.autocomplete = 'off';
    if(isNaN(evt.target.value) || + evt.target.value <= 0 || !Number.isInteger(+ evt.target.value)) {
      evt.target.setCustomValidity('There should be onlya positive number');
    } else {
      evt.target.setCustomValidity('');
      this.updateState({basePrice: + evt.target.value}, 'noUpdateElement');
    }
    evt.target.reportValidity();
  }

  _offerChangeHandler(evt) {
    evt.preventDefault();
    const checkboxElements = this.getElement().querySelectorAll('.event__offer-checkbox');

    const currentOffers = [];
    checkboxElements.forEach((checkbox) => {
      if(checkbox.checked) {
        currentOffers.push({
          title: checkbox.name.split('-')[2],
          price: + checkbox.name.split('-')[3],
        });
      }
    });
    this.updateState({currentOffers: currentOffers}, 'noUpdateElement');
  }

  reset(point) {
    this._destroyDatepicker();
    this.updateState(AppEditPoint.parseDataToState(point));
  }

  static parseDataToState(point) {
    return Object.assign({}, point, {isDisabled: false, isSaving: false, isDeleting: false});
  }

  static parseStateToData(state) {
    state = Object.assign({}, state);

    delete state.isDisabled;
    delete state.isSaving;
    delete state.isDeleting;

    return state;
  }
}
