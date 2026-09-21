import api from './axiosConfig';

/** Fetches every page while keeping each API response bounded. */
export const fetchAllPages = async (url, params = {}, { pageSize = 500, signal } = {}) => {
  const allRows = [];
  let page = 1;

  while (true) {
    const response = await api.get(url, {
      params: { ...params, page, limit: pageSize },
      signal,
    });
    const payload = response.data;
    const rows = Array.isArray(payload) ? payload : (payload?.data ?? []);
    allRows.push(...rows);

    if (payload?.hasMore === false) break;
    if (typeof payload?.total === 'number' && allRows.length >= payload.total) break;
    if (rows.length < pageSize) break;
    page += 1;
  }

  return allRows;
};
