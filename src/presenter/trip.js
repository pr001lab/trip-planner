import AppTripInfoView from '../view/app-info.js';
import AppSortsView from '../view/app-sorts.js';
import AppListEventsView from '../view/app-list-events.js';
import LoadingView from '../view/loading.js';
import AppListEventsEmptyView from '../view/app-list-events-empty.js';
import PointPresenter, { State as PointPresenterViewState } from './point.js';
import PointNewPresenter from './point-new.js';
import { RenderPosition, render, remove } from '../utils/render.js';
import { filter } from '../utils/filter.js';
import { sortTimeUp, sortPriceDown, sortTimeDurationDown } from '../utils/point.js';
import { SortType, UserAction, UpdateType, FilterType } from '../consts.js';

export default class Trip {
  constructor(infoContainer, tripContainer, pointsModel, filterModel, offersModel, api, destinationsModel) {
    this._infoContainer = infoContainer;
    this._tripContainer = tripContainer;
    this._pointsModel = pointsModel;
    this._filterModel = filterModel;
    this._offersModel = offersModel;
    this._destinationsModel = destinationsModel;
    this._api = api;
    this._pointPresenter = new Map();
    this._currentSortType = SortType.DEFAULT;
    this._filterType = FilterType.EVERYTHING;

    this._sortComponent = null;
    this._infoComponent = null;
    this._noPointsComponent = null;

    this._isLoading = true;
    this._loadingComponent = new LoadingView();

    this._appListEventsComponent = new AppListEventsView();

    this._handleModeChange = this._handleModeChange.bind(this);
    this._handleSortTypeChange = this._handleSortTypeChange.bind(this);
    this._handleViewAction = this._handleViewAction.bind(this);
    this._handleModelEvent = this._handleModelEvent.bind(this);

    this._pointNewPresenter = new PointNewPresenter(this._appListEventsComponent, this._handleViewAction);
  }

  init() {
    this._pointsModel.addObserver(this._handleModelEvent);
    this._filterModel.addObserver(this._handleModelEvent);

    this._renderTrip();
  }

  destroy() {
    this._clearTrip({resetSortType: true});

    remove(this._infoComponent);
    remove(this._appListEventsComponent);

    this._pointsModel.removeObserver(this._handleModelEvent);
    this._filterModel.removeObserver(this._handleModelEvent);
  }

  createPoint(callback) {
    this._offers = this._offersModel.getOffers();
    this._destinations = this._destinationsModel.getDestinations();

    this._currentSortType = SortType.DEFAULT;
    this._filterModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);

    remove(this._noPointsComponent);
    render(this._tripContainer, this._appListEventsComponent, RenderPosition.BEFOREEND);
    this._pointNewPresenter.init(this._offers, this._destinations, callback);
  }

  _getPoints() {
    this._filterType = this._filterModel.getFilter();
    const points = this._pointsModel.getPoints();
    const filteredPoints = filter[this._filterType](points);

    switch(this._currentSortType) {
      case SortType.SORT_PRICE:
        return filteredPoints.sort(sortPriceDown);
      case SortType.SORT_TIME:
        return filteredPoints.sort(sortTimeDurationDown);
    }

    return filteredPoints.sort(sortTimeUp);
  }

  _handleViewAction(actionType, updateType, update) {
    switch(actionType) {
      case UserAction.UPDATE_POINT:
        this._pointPresenter.get(update.id).setViewState(PointPresenterViewState.SAVING);
        this._api.updatePoint(update)
          .then((response) => {
            this._pointsModel.updatePoint(updateType, response);
          })
          .catch(() => {
            this._pointPresenter.get(update.id).setViewState(PointPresenterViewState.ABORTING);
          });
        break;
      case UserAction.ADD_POINT:
        this._pointNewPresenter.setSaving();
        this._api.addPoint(update)
          .then((response) => {
            this._pointsModel.addPoint(updateType, response);
          })
          .catch(() => {
            this._pointNewPresenter.setAborting();
          });
        break;
      case UserAction.DELETE_POINT:
        this._pointPresenter.get(update.id).setViewState(PointPresenterViewState.DELETING);
        this._api.deletePoint(update)
          .then(() => {
            this._pointsModel.deletePoint(updateType, update);
          })
          .catch(() => {
            this._pointPresenter.get(update.id).setViewState(PointPresenterViewState.ABORTING);
          });
        break;
    }
  }

  _handleModelEvent(updateType, data) {
    switch(updateType) {
      case UpdateType.PATCH:
        this._pointPresenter.get(data.id).init(data);
        break;
      case UpdateType.MINOR:
        this._clearTrip();
        this._renderTrip();
        break;
      case UpdateType.MAJOR:
        this._clearTrip({resetSortType: true});
        this._renderTrip();
        break;
      case UpdateType.INIT:
        this._isLoading = false;
        remove(this._loadingComponent);
        this._renderTrip();
        break;
    }
  }

  _handleModeChange() {
    this._pointNewPresenter.destroy();
    this._pointPresenter.forEach((presenter) => presenter.resetView());
  }

  _handleSortTypeChange(sortType) {
    if(this._currentSortType === sortType) {
      return;
    }

    this._currentSortType = sortType;
    this._clearTrip();
    this._renderTrip();
  }

  renderInfo() {
    if(this._infoComponent !== null) {
      this._infoComponent = null;
    }

    this._infoComponent = new AppTripInfoView(this._pointsModel.getPoints());

    render(this._infoContainer, this._infoComponent, RenderPosition.AFTERBEGIN);
  }

  _renderSort() {
    if(this._sortComponent !== null) {
      this._sortComponent = null;
    }

    this._sortComponent = new AppSortsView(this._currentSortType);
    this._sortComponent.setSortTypeChangeHandler(this._handleSortTypeChange);

    render(this._tripContainer, this._sortComponent, RenderPosition.BEFOREEND);
  }

  _renderPoint(point) {
    this._offers = this._offersModel.getOffers();
    this._destinations = this._destinationsModel.getDestinations();

    const pointPresenter = new PointPresenter(this._appListEventsComponent, this._handleViewAction, this._handleModeChange);
    this._pointPresenter.set(point.id, pointPresenter);
    pointPresenter.init(point, this._offers, this._destinations);
  }

  _renderPointList() {
    render(this._tripContainer, this._appListEventsComponent, RenderPosition.BEFOREEND);

    this._getPoints().slice().forEach((point) => this._renderPoint(point));
  }

  _renderNoPoints() {
    this._noPointsComponent = new AppListEventsEmptyView(this._filterType);
    render(this._tripContainer, this._noPointsComponent, RenderPosition.BEFOREEND);
  }

  _renderLoading() {
    render(this._tripContainer, this._loadingComponent, RenderPosition.BEFOREEND);
  }

  _clearTrip({resetSortType = false} = {}) {
    this._pointNewPresenter.destroy();
    this._pointPresenter.forEach((presenter) => presenter.destroy());
    this._pointPresenter.clear();

    remove(this._appListEventsComponent);
    remove(this._sortComponent);
    remove(this._loadingComponent);
    remove(this._infoComponent);

    if(this._noPointsComponent) {
      remove(this._noPointsComponent);
    }

    if(resetSortType) {
      this._currentSortType = SortType.DEFAULT;
    }
  }

  _renderTrip() {
    if(this._isLoading) {
      this._renderLoading();
      return;
    }

    if(this._pointsModel.getPoints().length !== 0) {
      this.renderInfo();
    }

    if(this._getPoints().length === 0) {
      this._renderNoPoints();
      return;
    }

    this._renderSort();
    this._renderPointList();
  }
}
