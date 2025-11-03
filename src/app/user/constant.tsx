import { SideNavItem } from "@/Types";
import {
  IconLayoutDashboard,
  IconCar,
  IconClockHour4,
  IconHistory,
  IconBell,
  IconMapPin,
  IconFileText,
  IconSettings,
} from "@tabler/icons-react";

export const SIDENAV_ITEMS: SideNavItem[] = [
  {
    title: "Dashboard",
    path: "/user/dashboard",
    icon: <IconLayoutDashboard width="22" height="22" />,
  },
  {
    title: "Book Slot",
    path: "/user/book",
    icon: <IconCar width="22" height="22" />,
  },
  {
    title: "Booking History & Extend Time",
    path: "/user/history",
    icon: <IconHistory width="22" height="22" />,
  },
];
