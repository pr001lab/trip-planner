import AbstractView from './abstract.js';

const createAppListEventsTemplate = () => '<ul class="trip-events__list"></ul>';

export default class AppListEvents extends AbstractView {
  getTemplate() {
    return createAppListEventsTemplate();
  }
}
