/**
 * 返回随机值[start, end)
 */
export const renderByRange = (start: number, end: number) => {
  return Math.floor(Math.random() * (start + (end - start)));
};
