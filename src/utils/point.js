import dayjs from 'dayjs';

const dateTemplate = (date) => dayjs(date.substring(0, 23));

const localISOTime = (date) => new Date(new Date(date) - (new Date()).getTimezoneOffset() * 60000).toISOString();

export const getDateFormate = (date, dateFormate) => dateTemplate(localISOTime(date)).format(dateFormate);

export const getDiffDuration = (dateEnd, dateStart) => dayjs(dateEnd).diff(dayjs(dateStart));

export const sortPriceDown = (pointA, pointB) => pointB.basePrice - pointA.basePrice;

export const sortTimeUp = (pointA, pointB) => new Date(pointA.dateFrom) - new Date(pointB.dateFrom);

export const sortTimeDurationDown = (pointA, pointB) => getDiffDuration(pointB.dateTo, pointB.dateFrom) - getDiffDuration(pointA.dateTo, pointA.dateFrom);

export const dateDifferenceInDay = (dateEnd, dateStart) => dayjs(dateEnd).diff(dateStart);

export const getDurationFormated = (dateStart, dateEnd) => {
  const diffDuration = (dateEnd !== undefined) ? getDiffDuration(dateEnd, dateStart) : dateStart;
  let minutes = Math.floor(diffDuration / 60000);
  let hours = Math.floor(minutes / 60);
  minutes = minutes % 60;
  const days = Math.floor(hours / 24);
  hours = hours % 24;

  const diffDays = days > 0 ? `${(`00${days}`).slice(-2)}D` : '';

  let diffHours = '';
  if(hours > 0) {
    diffHours = `${(`00${hours}`).slice(-2)}H`;
  } else {
    if(days > 0) {
      diffHours = '00H';
    }
  }
  const diffMinutes = minutes > 0 ? `${(`00${minutes}`).slice(-2)}M` : '00M';

  return `${diffDays} ${diffHours} ${diffMinutes}`;
};
