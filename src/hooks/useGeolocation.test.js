import { renderHook, act } from '@testing-library/react'
import { useGeolocation } from './useGeolocation'

describe('useGeolocation Hook', () => {
  const mockGeolocation = {
    getCurrentPosition: jest.fn(),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
  }

  beforeAll(() => {
    global.navigator.geolocation = mockGeolocation
  })

  it('should return initial loading state', () => {
    const { result } = renderHook(() => useGeolocation())
    expect(result.current.loading).toBe(true)
    expect(result.current.position).toBe(null)
  })

  it('should set position on success', async () => {
    const mockPos = {
      coords: {
        latitude: 10,
        longitude: 20,
      },
    }

    mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => success(mockPos))

    const { result } = renderHook(() => useGeolocation())

    expect(result.current.position).toEqual([10, 20])
    expect(result.current.loading).toBe(false)
  })

  it('should handle error and fallback to default position', () => {
    mockGeolocation.getCurrentPosition.mockImplementationOnce((success, error) => error({ code: 1 }))

    const { result } = renderHook(() => useGeolocation())

    expect(result.current.error).toBeDefined()
    expect(result.current.position).toEqual([48.8566, 2.3522])
    expect(result.current.loading).toBe(false)
  })

  it('should handle cases where geolocation is not available', () => {
    const originalGeolocation = global.navigator.geolocation
    delete global.navigator.geolocation

    const { result } = renderHook(() => useGeolocation())

    expect(result.current.error).toMatch(/pas supportée/)
    expect(result.current.position).toEqual([48.8566, 2.3522])
    
    global.navigator.geolocation = originalGeolocation
  })
})
