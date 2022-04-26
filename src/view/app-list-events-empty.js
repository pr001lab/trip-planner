import AbstractView from './abstract.js';
import { FilterType } from '../consts.js';

const noPointsTextType = {
  [FilterType.EVERYTHING]: 'Click New Event to create your first point',
  [FilterType.PAST]: 'There are no past events now',
  [FilterType.FUTURE]: 'There are no future events now',
};

const createAppListEventsEmptyTemplate = (filterType) => {
  const noPointsTextValue = noPointsTextType[filterType];

  return (
    `<p class="trip-events__msg">${noPointsTextValue}</p>`
  );
};

export default class AppListEventsEmpty extends AbstractView {
  constructor(filterType) {
    super();
    this._filterType = filterType;
  }

  getTemplate() {
    return createAppListEventsEmptyTemplate(this._filterType);
  }
}
