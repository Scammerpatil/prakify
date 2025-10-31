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
    title: "Extend Slot",
    path: "/user/extend",
    icon: <IconClockHour4 width="22" height="22" />,
  },
  {
    title: "Booking History",
    path: "/user/history",
    icon: <IconHistory width="22" height="22" />,
  },
  {
    title: "Settings",
    path: "/user/settings",
    icon: <IconSettings width="22" height="22" />,
  },
];
