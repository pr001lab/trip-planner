import { FilterType } from '../consts.js';
import { dateDifferenceInDay } from './point.js';

export const filter = {
  [FilterType.EVERYTHING]: (points) => points.filter((point) => point),

  [FilterType.FUTURE]: (points) => points.filter((point) => dateDifferenceInDay(point.dateFrom, new Date()) >= 0 || dateDifferenceInDay(point.dateFrom, new Date()) < 0 && dateDifferenceInDay(point.dateTo, new Date()) > 0),

  [FilterType.PAST]: (points) => points.filter((point) => dateDifferenceInDay(point.dateTo, new Date()) < 0 || dateDifferenceInDay(point.dateFrom, new Date()) < 0 && dateDifferenceInDay(point.dateTo, new Date()) > 0),
};
