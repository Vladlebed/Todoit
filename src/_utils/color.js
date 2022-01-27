export const hslToHex = (h, s, l) => {
  const _l = l / 100;
  const a = (s * Math.min(_l, 1 - _l)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = _l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

export const generateColor = () => {
  const hue = Math.floor(Math.random() * 359);
  const saturation = Math.floor(Math.random() * 40);
  const lightness = Math.floor(Math.random() * 40);

  return hslToHex(hue, saturation, lightness).toUpperCase();
};
