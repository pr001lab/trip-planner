import AppEditPointView from '../view/app-edit-point.js';
import { RenderPosition, render, remove } from '../utils/render.js';
import { UserAction, UpdateType } from '../consts.js';
import { isOnline } from '../utils/common.js';
import { toast } from '../utils/toast.js';

export default class PointNew {
  constructor(pointContainer, changeData) {
    this._pointContainer = pointContainer;
    this._changeData = changeData;

    this._pointEditComponent = null;
    this._destroyCallback = null;

    this._handleFormSubmit = this._handleFormSubmit.bind(this);
    this._handleClickClose = this._handleClickClose.bind(this);
    this._handleDeleteClick = this._handleDeleteClick.bind(this);
    this._escKeyDownHandler = this._escKeyDownHandler.bind(this);
  }

  init(offers, destinations, callback) {
    if(this._pointEditComponent !== null) {
      return;
    }

    this._destroyCallback = callback;

    this._pointEditComponent = new AppEditPointView({offers, destinations});
    this._pointEditComponent.setFormSubmitHandler(this._handleFormSubmit);
    this._pointEditComponent.setClickCloseHandler(this._handleClickClose);
    this._pointEditComponent.setDeleteClickHandler(this._handleDeleteClick);

    render(this._pointContainer, this._pointEditComponent, RenderPosition.AFTERBEGIN);

    document.addEventListener('keydown', this._escKeyDownHandler);
  }

  setSaving() {
    this._pointEditComponent.updateState({
      isDaisabled: true,
      isSaving: true,
    });
  }

  setAborting() {
    const resetFormState = () => {
      this._pointEditComponent.updateState({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
    };

    this._pointEditComponent.shake(resetFormState);
  }

  destroy() {
    if(this._pointEditComponent === null) {
      return;
    }

    if(this._destroyCallback !== null) {
      this._destroyCallback();
    }

    remove(this._pointEditComponent);
    this._pointEditComponent = null;

    document.removeEventListener('keydown', this._escKeyDownHandler);
  }

  _handleFormSubmit(point) {
    if (!isOnline()) {
      toast('You can\'t save point offline');
      this._pointEditComponent.shake();
      return;
    }

    this._changeData(
      UserAction.ADD_POINT,
      UpdateType.MINOR,
      point,
    );
  }

  _handleDeleteClick() {
    this.destroy();
  }

  _handleClickClose() {
    this.destroy();
  }

  _escKeyDownHandler(evt) {
    if(evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.destroy();
    }
  }
}
