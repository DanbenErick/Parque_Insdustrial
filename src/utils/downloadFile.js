export const MIME_TYPES = {
  PDF: 'application/pdf',
  EXCEL: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

export const createBlobUrl = (data, mimeType) => {
  const blob = data instanceof Blob ? data : new Blob([data], mimeType ? { type: mimeType } : undefined);
  return URL.createObjectURL(blob);
};

export const downloadBlob = (data, filename, mimeType) => {
  const url = createBlobUrl(data, mimeType);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};

export const openBlobInNewTab = (data, mimeType) => {
  const url = createBlobUrl(data, mimeType);
  const openedWindow = window.open(url, '_blank');

  if (!openedWindow) {
    URL.revokeObjectURL(url);
    return false;
  }

  openedWindow.opener = null;

  // The new tab needs the URL long enough to finish loading the document.
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return true;
};
