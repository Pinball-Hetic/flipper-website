import { createCustomIcon } from './Icons'
import L from 'leaflet'

describe('Map Icons', () => {
  it('should return a Leaflet Icon when window is defined', () => {
    const icon = createCustomIcon('/test.png')
    expect(icon).toBeInstanceOf(L.Icon)
    expect(icon.options.iconUrl).toBe('/test.png')
  })

  it('should have correct default size', () => {
    const icon = createCustomIcon('/test.png')
    expect(icon.options.iconSize).toEqual([40, 40])
  })

  it('should support custom size', () => {
    const icon = createCustomIcon('/test.png', [60, 60])
    expect(icon.options.iconSize).toEqual([60, 60])
    expect(icon.options.iconAnchor).toEqual([30, 60])
  })
})
