export interface User {
  _id?: string;
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  profileImage?: string;
  vehicle: {
    number: string;
    model: string;
  };
}

export interface SideNavItem {
  title: string;
  path: string;
  icon?: JSX.Element;
  submenu?: boolean;
  subMenuItems?: SideNavItem[];
}

export interface ParkingArea {
  _id?: string;
  name: string;
  displayImage?: string;
  contactEmail: string;
  contactPhone: string;
  staffLoginCredentials?: {
    username?: string;
    password?: string;
  };
  address: {
    street: string;
    village: string;
    taluka: string;
    district: string;
    state: string;
    pincode: string;
  };
  latitude: number;
  longitude: number;
  totalSlots: number;
  availableSlots?: number;
  hourlyRate: number;
  slots?: Slot[];
}

export interface Slot {
  _id?: string;
  slotNumber: string;
  status: "available" | "occupied" | "reserved";
  currentBooking?: string;
}

export interface Booking {
  _id?: string;
  user: User;
  slot: Slot;
  area: ParkingArea;
  vehicleNumber: string;
  startTime: Date;
  endTime: Date;
  extended?: boolean;
  extensionCount?: number;
  status: "active" | "checked-in" | "completed" | "cancelled";
  totalAmount?: number;
}
