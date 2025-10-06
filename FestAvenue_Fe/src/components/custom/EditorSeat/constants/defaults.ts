export const DEFAULT_LAYOUT_PARAMS = {
  rows: 10,
  seatsPerRow: 15,
  seatSpacing: 30
}

export const DEFAULT_SECTION_CONFIG = {
  name: 'New Section',
  rows: 10,
  seatsPerRow: 15,
  price: 10,
  category: 'standard' as const
}

export const DEFAULT_COLOR_PICKER = {
  isOpen: false,
  color: '#3b82f6',
  sectionId: ''
}

export const DEFAULT_STAGE = {
  x: 350,
  y: 50,
  width: 300,
  height: 80
}
