export function exportLocalStorageData() {
  if (typeof window === 'undefined') {
    return {
      activeRequests: [],
      completedRequests: [],
      settings: null,
      tableLayout: null,
    };
  }

  return {
    activeRequests: JSON.parse(localStorage.getItem('restaurant_active_requests') || '[]'),
    completedRequests: JSON.parse(localStorage.getItem('restaurant_completed_requests') || '[]'),
    settings: JSON.parse(localStorage.getItem('restaurant_settings') || 'null'),
    tableLayout: JSON.parse(localStorage.getItem('restaurant_table_layout') || 'null'),
  };
}

export function hasLocalStorageData(): boolean {
  if (typeof window === 'undefined') return false;

  const data = exportLocalStorageData();
  return (
    data.completedRequests.length > 0 ||
    data.settings !== null ||
    data.tableLayout !== null
  );
}

export function clearLocalStorageData() {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('restaurant_active_requests');
  localStorage.removeItem('restaurant_completed_requests');
  localStorage.removeItem('restaurant_settings');
  localStorage.removeItem('restaurant_table_layout');
}
