import PointModel from './model/points.js';
import FilterModel from './model/filter.js';
import OffersModel from './model/offers.js';
import DestinationsModel from './model/destinations.js';
import MenuPresenter from './presenter/menu.js';
import TripPresenter from './presenter/trip.js';
import FilterPresenter from './presenter/filter.js';
import { isOnline } from './utils/common.js';
import { toast } from './utils/toast.js';
import { UpdateType, Endpoints } from './consts.js';
import Api from './api/api.js';
import Store from './api/store.js';
import Provider from './api/provider.js';

const AUTHORIZATION = 'Basic TwygmAEUhu1RFGIXBdvr177';
const END_POINT = 'https://15.ecmascript.pages.academy/big-trip';
const STORE_PREFIX = 'big-trip-localstorage';
const STORE_VER = 'v15';
const STORE_NAME_POINTS = `${STORE_PREFIX}-${STORE_VER}-${Endpoints.POINTS}`;
const STORE_NAME_DESTINATIONS = `${STORE_PREFIX}-${STORE_VER}-${Endpoints.DESTINATIONS}`;
const STORE_NAME_OFFERS = `${STORE_PREFIX}-${STORE_VER}-${Endpoints.OFFERS}`;

const tripMainElement = document.querySelector('.trip-main');
const tripControlsNavigationElement = tripMainElement.querySelector('.trip-controls__navigation');
const tripControlsFiltersElement = tripMainElement.querySelector('.trip-controls__filters');
const tripEventsElement = document.querySelector('.trip-events');
const pageMainElement = document.querySelector('.page-body__page-main');
const pageBodyContainerElement = pageMainElement.querySelector('.page-body__container');
const eventAddBtnElement = document.querySelector('.trip-main__event-add-btn');

eventAddBtnElement.disabled = true;
const handlePointNewFormClose = () => {
  eventAddBtnElement.disabled = false;
};

const api = new Api(END_POINT, AUTHORIZATION);
const storePoints = new Store(STORE_NAME_POINTS, window.localStorage);
const storeDestinations = new Store(STORE_NAME_DESTINATIONS, window.localStorage);
const storeOffers = new Store(STORE_NAME_OFFERS, window.localStorage);
const apiWithProviderPoints = new Provider(api, storePoints);
const apiWithProviderDestinations = new Provider(api, storeDestinations);
const apiWithProviderOffers = new Provider(api, storeOffers);
const pointsModel = new PointModel();
const filterModel = new FilterModel();
const offersModel = new OffersModel();
const destinationsModel =  new DestinationsModel();

const filterPresenter = new FilterPresenter(tripControlsFiltersElement, filterModel, pointsModel);
const tripPresenter = new TripPresenter(tripMainElement, tripEventsElement, pointsModel, filterModel, offersModel, apiWithProviderPoints, destinationsModel);
const menuPresenter = new MenuPresenter(tripControlsNavigationElement, pageBodyContainerElement, tripPresenter, pointsModel);

menuPresenter.init();
filterPresenter.init();
tripPresenter.init();

eventAddBtnElement.addEventListener('click', (evt) => {
  evt.preventDefault();
  if(!isOnline()) {
    toast('You can\'t create new task offline');
    return;
  }
  eventAddBtnElement.disabled = true;
  tripPresenter.createPoint(handlePointNewFormClose);
});

Promise.all([
  apiWithProviderDestinations.getDestinations(),
  apiWithProviderOffers.getOffers(),
  apiWithProviderPoints.getPoints(),
]).then((values) => {
  const [destinations, offers, points] = values;
  destinationsModel.setDestinations(destinations);
  offersModel.setOffers(offers);
  pointsModel.setPoints(UpdateType.INIT, points);
  eventAddBtnElement.disabled = false;
}).catch(() => {
  pointsModel.setPoints(UpdateType.INIT, []);
  eventAddBtnElement.disabled = false;
});

window.addEventListener('load', () => {
  navigator.serviceWorker.register('/sw.js');
});

window.addEventListener('online', () => {
  document.title = document.title.replace(' [offline]', '');
  apiWithProviderPoints.sync();
  if(document.querySelector('.event__type-btn')) {
    document.querySelector('.event__type-btn').style.pointerEvents = 'auto';
    document.querySelector('.event__type-btn').style.opacity = 1;
  }
  if(document.querySelector('.event__input--destination')) {
    document.querySelector('.event__input--destination').disabled = false;
  }
  tripPresenter.destroy();
  tripPresenter.init();
});


window.addEventListener('offline', () => {
  document.title += ' [offline]';
  if(document.querySelector('.event__type-btn')) {
    document.querySelector('.event__type-btn').style.pointerEvents = 'none';
    document.querySelector('.event__type-btn').style.opacity = 0.5;
  }
  if(document.querySelector('.event__input--destination')) {
    document.querySelector('.event__input--destination').disabled = true;
  }
  const refresh = window.localStorage.getItem('refresh');
  if (refresh === null){
    window.location.reload();
    window.localStorage.setItem('refresh', '1');
  }
});
