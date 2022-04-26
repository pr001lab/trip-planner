import PointsModel from '../model/points.js';
import { isOnline } from '../utils/common.js';

const getSyncedPoints = (items) =>
  items
    .filter(({success}) => success)
    .map(({payload}) => payload.point);

const createStoreStructure = (items) =>
  items
    .reduce((acc, current) => ({...acc, ...{[current.id]: current}}), {});

const createStoreStructureDestinations = (items) =>
  items
    .reduce((acc, current) => ({...acc, ...{[current.name]: current}}), {});

const createStoreStructureOffers = (items) =>
  items
    .reduce((acc, current) => ({...acc, ...{[current.type]: current}}), {});

export default class Provider {
  constructor(api, store) {
    this._api = api;
    this._store = store;
  }

  getPoints() {
    if(isOnline()) {
      return this._api.getPoints()
        .then((points) => {
          const items = createStoreStructure(points.map(PointsModel.adaptToServer));
          this._store.setItems(items);
          return points;
        });
    }

    const storePoints = Object.values(this._store.getItems());

    return Promise.resolve(storePoints.map(PointsModel.adaptToClient));
  }

  getOffers() {
    if(isOnline()) {
      return this._api.getOffers()
        .then((offers) => {
          this._store.setItems(createStoreStructureOffers(offers));
          return offers;
        });
    }

    const storeOffers = Object.values(this._store.getItems());

    return Promise.resolve(storeOffers);
  }

  getDestinations() {
    if(isOnline()) {
      return this._api.getDestinations()
        .then((destinations) => {
          this._store.setItems(createStoreStructureDestinations(destinations));
          return destinations;
        });
    }

    const storeDestinations = Object.values(this._store.getItems());

    return Promise.resolve(storeDestinations);
  }

  updatePoint(point) {
    if(isOnline()) {
      return this._api.updatePoint(point)
        .then((updatedPoint) => {
          this._store.setItem(updatedPoint.id, PointsModel.adaptToServer(updatedPoint));
          return updatedPoint;
        });
    }

    this._store.setItem(point.id, PointsModel.adaptToServer(Object.assign({}, point)));

    return Promise.resolve(point);
  }

  addPoint(point) {
    if(isOnline()) {
      return this._api.addPoint(point)
        .then((newPoint) => {
          this._store.setItem(newPoint.id, PointsModel.adaptToServer(newPoint));
          return newPoint;
        });
    }

    return Promise.reject(new Error('Add point failed'));
  }

  deletePoint(point) {
    if(isOnline()) {
      return this._api.deletePoint(point)
        .then(() => this._store.removeItem(point.id));
    }

    return Promise.reject(new Error('Delete point failed'));
  }

  sync() {
    if(isOnline()) {
      const storePoints = Object.values(this._store.getItems());

      return this._api.sync(storePoints)
        .then((response) => {
          const createdPoint = getSyncedPoints(response.created);
          const updatedPoint = getSyncedPoints(response.updated);
          const items = createStoreStructure([...createdPoint, ...updatedPoint]);

          this._store.setItems(items);
        });
    }

    return Promise.reject(new Error('Sync data failed'));
  }
}
