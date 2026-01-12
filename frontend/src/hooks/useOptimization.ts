import { useCallback, useMemo, useRef, useEffect, useState } from 'react'

export const useStableMemo = <T>(
  factory: () => T,
  deps: React.DependencyList
): T => {
  return useMemo(factory, deps)
}

export const useStableCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  return useCallback(callback, deps)
}

export const useDeepMemo = <T>(value: T, deps: React.DependencyList): T => {
  const ref = useRef<T>(value)

  return useMemo(() => {
    const newValue = value
    if (JSON.stringify(newValue) !== JSON.stringify(ref.current)) {
      ref.current = newValue
    }
    return ref.current
  }, deps)
}

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export const useVirtualization = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [startIndex, setStartIndex] = useState(0)
  const [endIndex, setEndIndex] = useState(0)

  const visibleItems = useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight) + 1
    const start = Math.max(0, startIndex - 1)
    const end = Math.min(items.length, startIndex + visibleCount + 1)

    setEndIndex(end)
    return items.slice(start, end)
  }, [items, startIndex, itemHeight, containerHeight])

  const onScroll = useCallback(
    (scrollTop: number) => {
      const newStartIndex = Math.floor(scrollTop / itemHeight)
      setStartIndex(newStartIndex)
    },
    [itemHeight]
  )

  return {
    visibleItems,
    startIndex,
    endIndex,
    onScroll,
    totalHeight: items.length * itemHeight,
  }
}

export const useLazyImage = (src: string) => {
  const [imageSrc, setImageSrc] = useState<string>()
  const [isLoaded, setIsLoaded] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    let observer: IntersectionObserver

    if (imageRef.current) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setImageSrc(src)
            observer.unobserve(entry.target)
          }
        },
        { threshold: 0.1 }
      )

      observer.observe(imageRef.current)
    }

    return () => {
      if (observer) observer.disconnect()
    }
  }, [src])

  const onLoad = useCallback(() => {
    setIsLoaded(true)
  }, [])

  return { imageRef, imageSrc, isLoaded, onLoad }
}

export const useApiCache = <T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5 minutos
) => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const cacheRef = useRef(new Map<string, { data: T; timestamp: number }>())

  const fetchData = useCallback(async () => {
    const cache = cacheRef.current
    const cached = cache.get(key)
    if (cached && Date.now() - cached.timestamp < ttl) {
      setData(cached.data)
      return cached.data
    }

    setLoading(true)
    setError(null)

    try {
      const result = await fetcher()
      cache.set(key, { data: result, timestamp: Date.now() })
      setData(result)
      return result
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [key, fetcher, ttl])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const invalidateCache = useCallback(() => {
    cacheRef.current.delete(key)
  }, [key])

  return { data, loading, error, refetch: fetchData, invalidateCache }
}
