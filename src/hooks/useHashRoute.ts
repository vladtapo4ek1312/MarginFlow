import { useCallback, useEffect, useState } from 'react'
import { parseHash, routeToHash, type Route } from '../utils/route'

export function useHashRoute(): [Route, (route: Route) => void] {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash))

  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash))
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const navigate = useCallback((next: Route) => {
    const hash = routeToHash(next)
    if (window.location.hash !== hash) {
      window.location.hash = hash
    } else {
      setRoute(next)
    }
    window.scrollTo({ top: 0 })
  }, [])

  return [route, navigate]
}
