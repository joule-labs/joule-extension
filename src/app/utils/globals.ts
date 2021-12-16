export function setAppContainer(ac: 'page' | 'popup') {
  (window as any).__APP_CONTAINER = ac;
}

export function getAppContainer() {
  return (window as any).__APP_CONTAINER as 'page' | 'popup' | undefined;
}
