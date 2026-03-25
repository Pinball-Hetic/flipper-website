import { render, screen } from '@testing-library/react'
import MapContainer from './MapContainer'

// Mock dynamic import
jest.mock('next/dynamic', () => () => {
  const DynamicComponent = () => <div data-testid="dynamic-map" />
  DynamicComponent.displayName = 'DynamicComponent'
  return DynamicComponent
})

describe('MapContainer Component', () => {
  it('renders the dynamic map', () => {
    render(<MapContainer position={[48, 2]} checkpoints={[]} />)
    expect(screen.getByTestId('dynamic-map')).toBeInTheDocument()
  })
})
