export const convertDateToClientFormat = (d, withTime) => {
  if (!(d instanceof Date)) { return d; }

  const v = (vv) => `${vv < 10 ? '0' : ''}${vv}`;

  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  let time = '';

  if (withTime) {
    const hours = d.getHours();
    const minutes = d.getMinutes();
    time = ` ${v(hours)}:${v(minutes)}`;
  }

  return `${v(day)}.${v(month)}.${v(year)}${time}`;
};
