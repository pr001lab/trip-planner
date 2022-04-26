import PointModel from '../model/points.js';
import { Endpoints } from '../consts.js';

const Method = {
  GET: 'GET',
  PUT: 'PUT',
  POST: 'POST',
  DELETE: 'DELETE',
};

export default class Api {
  constructor(endPoint, authorization) {
    this._endPoint = endPoint;
    this._authorization = authorization;
  }

  getPoints() {
    return this._load({url: Endpoints.POINTS})
      .then(Api.toJSON)
      .then((points) => points.filter((item) => 'destination' in item))
      .then((points) => points.map(PointModel.adaptToClient));
  }

  getOffers() {
    return this._load({url: Endpoints.OFFERS})
      .then(Api.toJSON);
  }

  getDestinations() {
    return this._load({url: Endpoints.DESTINATIONS})
      .then(Api.toJSON);
  }

  updatePoint(point) {
    return this._load({
      url: `${Endpoints.POINTS}/${point.id}`,
      method: Method.PUT,
      body: JSON.stringify(PointModel.adaptToServer(point)),
      headers: new Headers({'Content-Type': 'application/json'}),
    })
      .then(Api.toJSON)
      .then(PointModel.adaptToClient);
  }

  addPoint(point) {
    return this._load({
      url: Endpoints.POINTS,
      method: Method.POST,
      body: JSON.stringify(PointModel.adaptToServer(point)),
      headers: new Headers({'Content-Type': 'application/json'}),
    })
      .then(Api.toJSON)
      .then(PointModel.adaptToClient);
  }

  deletePoint (point) {
    return this._load({
      url: `${Endpoints.POINTS}/${point.id}`,
      method: Method.DELETE,
    });
  }

  _load({
    url,
    method = Method.GET,
    body = null,
    headers = new Headers(),
  }) {
    headers.append('Authorization', this._authorization);

    return fetch(
      `${this._endPoint}/${url}`,
      {method, body, headers},
    )
      .then(Api.checkStatus)
      .catch(Api.catchError);
  }

  sync(data) {
    return this._load({
      url: `${Endpoints.POINTS}/${Endpoints.SYNC}`,
      method: Method.POST,
      body: JSON.stringify(data),
      headers: new Headers({'Content-Type': 'application/json'}),
    })
      .then(Api.toJSON);
  }

  static checkStatus(response) {
    if(!response.ok) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }

    return response;
  }

  static toJSON(response) {
    return response.json();
  }

  static catchError(error) {
    throw error;
  }
}
