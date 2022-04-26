import AbstractObserver from '../utils/abstract-observer.js';

export default class Points extends AbstractObserver {
  constructor() {
    super();
    this._points = [];
  }

  setPoints(updateType, points) {
    this._points = points.slice();

    this._notify(updateType);
  }

  getPoints() {
    return this._points;
  }

  updatePoint(updateType, update) {
    const index = this._points.findIndex((point) => point.id === update.id);

    if(index === -1) {
      throw new Error ('Can\'t update unexisting point');
    }

    this._points = this._points.map((point) => (point.id === update.id) ? update : point);

    this._notify(updateType, update);
  }

  addPoint(updateType, update) {
    this._points = [
      update,
      ...this._points,
    ];

    this._notify(updateType, update);
  }

  deletePoint(updateType, update) {
    const index = this._points.findIndex((point) => point.id === update.id);

    if(index === -1) {
      throw new Error ('Can\'t delete unexisting point');
    }

    this._points = this._points.filter((point) => point.id !== update.id);

    this._notify(updateType, update);
  }

  static adaptToClient(point) {
    const adaptedPoint = Object.assign(
      {},
      point,
      {
        basePrice: point['base_price'],
        dateFrom: point['date_from'],
        dateTo: point['date_to'],
        isFavorite: point['is_favorite'],
        currentOffers: point['offers'],
        namePoint: point['destination'],
      },
    );

    delete adaptedPoint['base_price'];
    delete adaptedPoint['date_from'];
    delete adaptedPoint['date_to'];
    delete adaptedPoint['is_favorite'];
    delete adaptedPoint['offers'];
    delete adaptedPoint['destination'];

    return adaptedPoint;
  }

  static adaptToServer(point) {
    const adaptedPoint = Object.assign(
      {},
      point,
      {
        'base_price': point.basePrice,
        'date_from': point.dateFrom,
        'date_to': point.dateTo,
        'is_favorite': point.isFavorite,
        'offers': point.currentOffers,
        'destination': point.namePoint,
      },
    );

    delete adaptedPoint.basePrice;
    delete adaptedPoint.dateFrom;
    delete adaptedPoint.dateTo;
    delete adaptedPoint.isFavorite;
    delete adaptedPoint.currentOffers;
    delete adaptedPoint.namePoint;

    return adaptedPoint;
  }
}