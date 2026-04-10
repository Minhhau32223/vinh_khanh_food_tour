const OFFLINE_PACKAGE_KEY = 'guest_offline_package_v1';

export function saveOfflinePackage(pkg) {
  localStorage.setItem(OFFLINE_PACKAGE_KEY, JSON.stringify(pkg));
}

export function loadOfflinePackage() {
  const raw = localStorage.getItem(OFFLINE_PACKAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearOfflinePackage() {
  localStorage.removeItem(OFFLINE_PACKAGE_KEY);
}

export function findOfflinePoiPackageItem(poiId) {
  const pkg = loadOfflinePackage();
  if (!pkg?.items?.length) return null;
  return pkg.items.find(item => Number(item.poi?.id) === Number(poiId)) || null;
}

export function getOfflinePackageMeta() {
  const pkg = loadOfflinePackage();
  if (!pkg) return null;
  return {
    language: pkg.language,
    generatedAt: pkg.generatedAt,
    totalPois: pkg.totalPois ?? pkg.items?.length ?? 0,
  };
}

export function downloadOfflinePackageFile(pkg) {
  const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `food-tour-offline-${pkg.language || 'vi'}-${date}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
