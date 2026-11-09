/**
 * Навигация через hash (#/products): работает на GitHub Pages без серверных
 * перенаправлений и сохраняет раздел при обновлении страницы.
 */
export type Route =
  | { page: 'overview' }
  | { page: 'calculator'; editId?: string }
  | { page: 'products'; selectedId?: string }

export type PageId = Route['page']

function safeDecode(part: string): string {
  try {
    return decodeURIComponent(part)
  } catch {
    return part
  }
}

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(safeDecode)
  const [page, ...rest] = parts

  if (page === 'calculator') {
    return rest[0] === 'edit' && rest[1] ? { page, editId: rest[1] } : { page }
  }
  if (page === 'products') {
    return rest[0] ? { page, selectedId: rest[0] } : { page }
  }
  return { page: 'overview' }
}

export function routeToHash(route: Route): string {
  switch (route.page) {
    case 'overview':
      return '#/overview'
    case 'calculator':
      return route.editId ? `#/calculator/edit/${encodeURIComponent(route.editId)}` : '#/calculator'
    case 'products':
      return route.selectedId ? `#/products/${encodeURIComponent(route.selectedId)}` : '#/products'
  }
}
