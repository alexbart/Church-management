// utils/dateUtils.js
function getDateRange(query) {
  let { startDate, endDate } = query;

  if (!startDate) startDate = new Date(new Date().getFullYear(), 0, 1);
  if (!endDate) endDate = new Date();

  if (typeof startDate === "string") startDate = new Date(startDate);
  if (typeof endDate === "string") endDate = new Date(endDate);

  return { startDate, endDate };
}

module.exports = { getDateRange };
