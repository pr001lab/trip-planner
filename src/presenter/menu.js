import AppMenuView from '../view/app-menu.js';
import StatisticsView from '../view/statistics.js';
import { RenderPosition, render, replace, remove } from '../utils/render.js';
import { MenuItem } from '../consts.js';

export default class Menu {
  constructor(menuContainer, statsContainer, tripPresenter, pointsModel) {
    this._menuContainer = menuContainer;
    this._statsContainer = statsContainer;
    this._tripPresenter = tripPresenter;
    this._pointsModel = pointsModel;

    this._menuComponent = null;
    this._currentMenuItem = MenuItem.TABLE;
    this._statisticsComponent = null;

    this._handleModelEvent = this._handleModelEvent.bind(this);
    this._handleAppMenuClick = this._handleAppMenuClick.bind(this);

    this._pointsModel.addObserver(this._handleModelEvent);
  }

  init() {
    const prevMenuComponent = this._menuComponent;

    this._menuComponent = new AppMenuView(this._pointsModel.getPoints());
    this._menuComponent.setMenuClickHandler(this._handleAppMenuClick);

    if (prevMenuComponent === null) {
      render(this._menuContainer, this._menuComponent, RenderPosition.BEFOREEND);
      return;
    }

    replace(this._menuComponent, prevMenuComponent);
    remove(prevMenuComponent);
  }

  _handleModelEvent() {
    this.init();
  }

  _handleAppMenuClick(menuItem) {
    switch(menuItem) {
      case MenuItem.TABLE:
        if(this._currentMenuItem !== MenuItem.TABLE) {
          this._tripPresenter.destroy();
          this._tripPresenter.init();
          remove(this._statisticsComponent);
          this._currentMenuItem = MenuItem.TABLE;
          this._menuComponent.setMenuItem(MenuItem.TABLE);
        }
        break;
      case MenuItem.STATS:
        if(this._currentMenuItem !== MenuItem.STATS) {
          this._tripPresenter.destroy();
          this._tripPresenter.renderInfo();
          this._statisticsComponent = new StatisticsView(this._pointsModel.getPoints());
          render(this._statsContainer, this._statisticsComponent, RenderPosition.BEFOREEND);
          this._currentMenuItem = MenuItem.STATS;
          this._menuComponent.setMenuItem(MenuItem.STATS);
        }
        break;
    }
  }
}
