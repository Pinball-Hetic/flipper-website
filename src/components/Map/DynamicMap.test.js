import { render, screen, fireEvent } from '@testing-library/react'
import DynamicMap from './DynamicMap'

// Mock react-leaflet
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }) => <div data-testid="popup">{children}</div>,
  useMap: () => ({
    flyTo: jest.fn(),
  }),
}))

describe('DynamicMap Component', () => {
  const mockProps = {
    position: [48.8566, 2.3522],
    checkpoints: [
      { id: 1, name: 'CP 1', description: 'Desc 1', position: [48.8566, 2.3522] }
    ]
  }

  it('renders correctly with position', () => {
    render(<DynamicMap {...mockProps} />)
    expect(screen.getByTestId('map-container')).toBeInTheDocument()
    expect(screen.getByText(/LVL 12/i)).toBeInTheDocument()
    expect(screen.getByText(/Explorateur/i)).toBeInTheDocument()
  })

  it('renders markers for player and checkpoints', () => {
    render(<DynamicMap {...mockProps} />)
    const markers = screen.getAllByTestId('marker')
    // 1 player marker + 1 checkpoint marker
    expect(markers.length).toBe(2)
  })

  it('returns null if no position is provided', () => {
    const { container } = render(<DynamicMap position={null} checkpoints={[]} />)
    expect(container.firstChild).toBeNull()
  })
})
