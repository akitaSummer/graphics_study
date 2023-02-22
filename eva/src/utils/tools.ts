/**
 * 返回随机值[start, end)
 */
export const renderByRange = (start: number, end: number) => {
  return Math.floor(start + Math.random() * (end - start));
};
