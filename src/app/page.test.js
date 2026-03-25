import { render, screen } from '@testing-library/react'
import Home from './page'

// Mocking the geolocation hook
jest.mock('@/hooks/useGeolocation', () => ({
  useGeolocation: jest.fn(() => ({
    position: null,
    loading: true,
    error: null,
    defaultPosition: [48.8566, 2.3522]
  }))
}))

// Mocking the MapContainer because Leaflet is hard to test in JSDOM
jest.mock('@/components/Map/MapContainer', () => ({
  __esModule: true,
  default: () => <div data-testid="map-container" />
}))

describe('Home Page', () => {
  it('renders loading state initially', () => {
    render(<Home />)
    expect(screen.getByText(/Chargement.../i)).toBeInTheDocument()
  })

  it('renders map when loading is finished', () => {
    const { useGeolocation } = require('@/hooks/useGeolocation')
    useGeolocation.mockReturnValue({
      position: [48.8566, 2.3522],
      loading: false,
      error: null,
      defaultPosition: [48.8566, 2.3522]
    })

    render(<Home />)
    expect(screen.getByTestId('map-container')).toBeInTheDocument()
  })
})
