import AppEditPointView from '../view/app-edit-point.js';
import AppListEventItemView from '../view/app-list-event-item.js';
import { isOnline } from '../utils/common.js';
import { toast } from '../utils/toast.js';
import { RenderPosition, render, replace, remove } from '../utils/render.js';
import { UserAction, UpdateType } from '../consts.js';


const Mode = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING',
};

export const State = {
  SAVING: 'SAVING',
  DELETING: 'DELETING',
  ABORTING: 'ABORTING',
};

export default class Point {
  constructor(classContainer, changeData, changeMode) {
    this._classContainer = classContainer;
    this._changeData = changeData;
    this._changeMode = changeMode;

    this._pointComponent = null;
    this._pointEditComponent = null;
    this._mode = Mode.DEFAULT;

    this._handleEditClick = this._handleEditClick.bind(this);
    this._handleFormSubmit = this._handleFormSubmit.bind(this);
    this._handleClickClose = this._handleClickClose.bind(this);
    this._escKeyDownHandler = this._escKeyDownHandler.bind(this);
    this._handleFavoriteClick = this._handleFavoriteClick.bind(this);
    this._handleDeleteClick = this._handleDeleteClick.bind(this);
  }

  init(point, offers, destinations) {
    this._point = point;

    const prevPointComponent = this._pointComponent;
    const prevPointEditComponent = this._pointEditComponent;

    this._pointComponent = new AppListEventItemView(point);
    if(isOnline()) {
      this._pointEditComponent = new AppEditPointView({point, offers, destinations});
      this._pointEditComponent.setFormSubmitHandler(this._handleFormSubmit);
      this._pointEditComponent.setClickCloseHandler(this._handleClickClose);
      this._pointEditComponent.setDeleteClickHandler(this._handleDeleteClick);
    }

    this._pointComponent.setEditClickHandler(this._handleEditClick);
    this._pointComponent.setFavoriteClickHandler(this._handleFavoriteClick);

    if(prevPointComponent === null || prevPointEditComponent === null) {
      render(this._classContainer, this._pointComponent, RenderPosition.BEFOREEND);
      return;
    }

    if(this._mode === Mode.DEFAULT) {
      replace(this._pointComponent, prevPointComponent);
    }

    if(this._mode === Mode.EDITING) {
      replace(this._pointEditComponent, prevPointEditComponent);
      this._mode === Mode.DEFAULT;
    }

    remove(prevPointComponent);
    remove(prevPointEditComponent);
  }

  setViewState(state) {
    if(this._mode === Mode.DEFAULT) {
      return;
    }

    const resetFormState = () => {
      this._pointEditComponent.updateState({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
    };

    switch(state) {
      case State.SAVING:
        this._pointEditComponent.updateState({
          isDisabled: true,
          isSaving: true,
        });
        break;
      case State.DELETING:
        this._pointEditComponent.updateState({
          isDisabled: true,
          isDeleting: true,
        });
        break;
      case State.ABORTING:
        this._pointComponent.shake(resetFormState);
        this._pointEditComponent.shake(resetFormState);
        break;
    }
  }

  destroy() {
    remove(this._pointComponent);
    remove(this._pointEditComponent);
  }

  resetView() {
    if(this._mode !== Mode.DEFAULT) {
      this._replaceEditToPoint();
    }
  }

  _handleDeleteClick(point) {
    if (!isOnline()) {
      toast('You can\'t delete point offline');
      this._pointEditComponent.shake();
      return;
    }

    this._changeData(
      UserAction.DELETE_POINT,
      UpdateType.MINOR,
      point,
    );
  }

  _replacePointToEdit() {
    replace(this._pointEditComponent, this._pointComponent);
    document.addEventListener('keydown', this._escKeyDownHandler);
    this._changeMode();
    this._mode = Mode.EDITING;
  }

  _replaceEditToPoint() {
    this._pointEditComponent.reset(this._point);
    replace(this._pointComponent, this._pointEditComponent);
    document.removeEventListener('keydown', this._escKeyDownHandler);
    this._mode = Mode.DEFAULT;
  }

  _escKeyDownHandler(evt) {
    if(evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this._pointEditComponent.reset(this._point);
      this._replaceEditToPoint();
      document.removeEventListener('keydown', this._escKeyDownHandler);
    }
  }

  _handleEditClick() {
    if (!isOnline()) {
      toast('You can\'t edit point offline');
      return;
    }

    this._replacePointToEdit();
  }

  _handleFormSubmit(point) {
    if (!isOnline()) {
      toast('You can\'t save point offline');
      this._pointEditComponent.shake();
      return;
    }

    this._changeData(
      UserAction.UPDATE_POINT,
      UpdateType.MINOR,
      point,
    );
  }

  _handleClickClose() {
    this._pointEditComponent.reset(this._point);
    this._replaceEditToPoint();
  }

  _handleFavoriteClick() {
    this._changeData(
      UserAction.UPDATE_POINT,
      UpdateType.MINOR,
      Object.assign({}, this._point, { isFavorite: !this._point.isFavorite }),
    );
  }
}
