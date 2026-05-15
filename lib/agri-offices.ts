export interface AgriOffice {
  id: string
  name: string
  nameBn: string
  lat: number
  lng: number
  address: string
  addressBn: string
  phone: string
}

export const AGRI_OFFICES: AgriOffice[] = [
  {
    id: '1',
    name: 'Dhaka Agricultural Office',
    nameBn: 'ঢাকা কৃষি অফিস',
    lat: 23.8103,
    lng: 90.4125,
    address: 'Farmgate, Dhaka',
    addressBn: 'ফার্মগেট, ঢাকা',
    phone: '+880 2 9123456',
  },
  {
    id: '2',
    name: 'Gazipur Agricultural Office',
    nameBn: 'গাজীপুর কৃষি অফিস',
    lat: 24.0025,
    lng: 90.4264,
    address: 'Gazipur Sadar, Gazipur',
    addressBn: 'গাজীপুর সদর, গাজীপুর',
    phone: '+880 2 9123457',
  },
  {
    id: '3',
    name: 'Savar Agricultural Office',
    nameBn: 'সাভার কৃষি অফিস',
    lat: 23.8567,
    lng: 90.26,
    address: 'Savar, Dhaka',
    addressBn: 'সাভার, ঢাকা',
    phone: '+880 2 9123458',
  },
  {
    id: '4',
    name: 'Sylhet Agricultural Office',
    nameBn: 'সিলেট কৃষি অফিস',
    lat: 24.8949,
    lng: 91.8687,
    address: 'Zindabazar, Sylhet',
    addressBn: 'জিন্দাবাজার, সিলেট',
    phone: '+880 821 712345',
  },
  {
    id: '5',
    name: 'Chittagong Agricultural Office',
    nameBn: 'চট্টগ্রাম কৃষি অফিস',
    lat: 22.3569,
    lng: 91.7832,
    address: 'Agrabad, Chittagong',
    addressBn: 'আগ্রাবাদ, চট্টগ্রাম',
    phone: '+880 31 7123456',
  },
]

export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function googleMapsDirectionsUrl(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${from.lat},${from.lng}&destination=${to.lat},${to.lng}&travelmode=driving`
}
