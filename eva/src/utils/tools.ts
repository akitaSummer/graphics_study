/**
 * 返回随机值[start, end)
 */
export const renderByRange = (start: number, end: number) => {
  return Math.floor(start + Math.random() * (end - start));
};

export const randomByLength = (len: number) => {
  let str = "";
  for (let i = 0; i < len; i++) {
    str += Math.floor(Math.random() * 10);
  }
  return str;
};
