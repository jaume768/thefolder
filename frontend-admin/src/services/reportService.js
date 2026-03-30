import api from './api';

export const getReports = async (status = '') => {
  const params = status ? { status } : {};
  const res = await api.get('/api/reports', { params });
  return res.data;
};

export const updateReportStatus = async (reportId, status) => {
  const res = await api.patch(`/api/reports/${reportId}`, { status });
  return res.data;
};
