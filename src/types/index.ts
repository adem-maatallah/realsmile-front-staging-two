import { CouponType } from '@/config/enums';

export interface Coupon {
  id: string;
  name: string;
  type: CouponType;
  slug: string;
  amount?: string;
  code?: string;
}

export interface Address {
  customerName?: string;
  phoneNumber?: string;
  country?: string;
  state?: string;
  city?: string;
  zip?: string;
  street?: string;
}

export interface GoogleMapLocation {
  lat?: number;
  lng?: number;
  street_number?: string;
  route?: string;
  street_address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
  formattedAddress?: string;
}

export type ProductColor = {
  name?: string;
  code?: string;
};

export interface CartItem {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  image: string;
  color?: ProductColor | null;
  price: number;
  salePrice?: number;
  quantity: number;
  size: number;
  stock?: number;
  discount?: number;
}

export type Product = {
  id: number;
  slug?: string;
  title: string;
  description?: string;
  price: number;
  sale_price?: number;
  thumbnail: string;
  colors?: ProductColor[];
  sizes?: number[];
};

export type PosProduct = {
  id: number;
  name: string;
  description: string;
  image: string;
  price: number;
  salePrice: number;
  quantity: number;
  size: number;
  discount?: number;
};
export interface CalendarEvent {
  id?: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  title: string;
  description?: string;
  location?: string;
}

export interface FlightingCardProps {
  id: number;
  image: string;
  title: string;
  price: string;
  meta?: {
    model: string;
    hours: string;
    stop: string;
  };
  class: string;
  bucket: {
    luggage?: string;
    bag?: string;
  };
  airlines?: string;
  routes?: {
    arrivalDate: Date | string;
    arrivalTime: Date | string;
    departureDate: Date | string;
    departureTime: Date | string;
    departureCityCode: string;
    departureCity: string;
    departureTerminal: string;
    arrivalCityCode: string;
    arrivalCity: string;
    arrivalTerminal: string;
    layover: {
      layoverCityCode: string;
      layoverCity: string;
      layoverTerminal: string;
      layoverTime: string;
    }[];
  };
  cheapest?: boolean;
  best?: boolean;
  quickest?: boolean;
}
export interface Video {
  id: string;
  thumbnail: string;
  iframe?: string;
}

export interface TreatmentSlot {
  id: number;
  case_id: number;
  treatment_number: number;
  video_with_aligners_link: string | null;
  video_without_aligners_link: string | null;
  video_with_aligners_upload_date: string | null;
  video_without_aligners_upload_date: string | null;
  video_with_aligners_status: 'pending' | 'approved' | 'rejected';
  video_without_aligners_status: 'pending' | 'approved' | 'rejected';
  start_date: string;
  end_date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  finalized: boolean;
  qr_code: string;
  verified: boolean;
  comments?: any[];
}

export interface VideoData {
  with_aligners: Video | null;
  without_aligners: Video | null;
  finalized: boolean;
}

// You might also want to move the UserAdapted interface here if it's consistently used:
export interface UserAdapted {
  id: number;
  email: string;
  role: string | number;
  roleId: number;
  firstName: string;
  lastName: string;
}