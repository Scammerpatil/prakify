import { SideNavItem } from "@/Types";
import {
  IconLayoutDashboard,
  IconMapPin,
  IconParking,
  IconUsersGroup,
  IconUserCog,
  IconFileText,
  IconSettings,
  IconChartLine,
  IconAlertTriangle,
} from "@tabler/icons-react";

export const SIDENAV_ITEMS: SideNavItem[] = [
  {
    title: "Dashboard",
    path: "/admin/dashboard",
    icon: <IconLayoutDashboard width="22" height="22" />,
  },
  {
    title: "Parking Areas",
    path: "/admin/areas",
    icon: <IconMapPin width="22" height="22" />,
  },
  {
    title: "User Records",
    path: "/admin/users",
    icon: <IconUserCog width="22" height="22" />,
  },
];
