export type OfficeItem = {
  _id?: string
  city: string
  state?: string
  label?: string
  isMain?: boolean
  address: string
  phone?: string
  mobile?: string
  mapUrl?: string
}

export const DEFAULT_OFFICES: OfficeItem[] = [
  {
    _id: 'default-delhi',
    city: 'Delhi (NCR)',
    state: 'Delhi',
    label: 'Main Branch (Headquarters)',
    isMain: true,
    address: 'DDA BUILDING, LAXMI NAGAR COMMERCIAL COMPLEX, DELHI 110092',
    phone: '011-36650267',
    mobile: '+91 96259 70722',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=DDA+BUILDING+LAXMI+NAGAR+COMMERCIAL+COMPLEX+DELHI+110092',
  },
  {
    _id: 'default-patna',
    city: 'Patna',
    state: 'Bihar',
    label: 'Patna Branch',
    isMain: false,
    address: 'Ground Floor, Gokul Nagar, Patna, Bihar',
    mobile: '+91 96259 70722',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Ground+Floor+Gokul+Nagar+Patna+Bihar',
  },
  {
    _id: 'default-lucknow',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    label: 'Lucknow Branch',
    isMain: false,
    address: 'Near KGMC, Chowk, Lucknow-226003, Uttar Pradesh',
    mobile: '+91 96259 70722',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Near+KGMC+Chowk+Lucknow+226003',
  },
]
