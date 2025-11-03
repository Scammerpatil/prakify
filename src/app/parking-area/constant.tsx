import { SideNavItem } from "@/Types";
import {
  IconLayoutDashboard,
  IconParking,
  IconClipboardCheck,
  IconClockHour4,
  IconAlertTriangle,
  IconFileText,
  IconSettings,
} from "@tabler/icons-react";

export const SIDENAV_ITEMS: SideNavItem[] = [
  {
    title: "Dashboard",
    path: "/parking-area/dashboard",
    icon: <IconLayoutDashboard width="22" height="22" />,
  },
  {
    title: "Manage Check-ins",
    path: "/parking-area/checkin-checkout",
    icon: <IconClipboardCheck width="22" height="22" />,
  },
  {
    title: "Reports",
    path: "/parking-area/reports",
    icon: <IconFileText width="22" height="22" />,
  },
];
