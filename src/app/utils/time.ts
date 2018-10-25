import moment from 'moment';

export function unixMoment(value: string | number) {
  return moment.unix(parseInt(value as string, 10));
}

export const SHORT_FORMAT = 'MMM Do, h:mm A';