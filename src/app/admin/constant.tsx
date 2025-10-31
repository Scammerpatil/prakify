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
    title: "Manage Slots",
    path: "/admin/slots",
    icon: <IconParking width="22" height="22" />,
  },
  {
    title: "Staff Management",
    path: "/admin/staff",
    icon: <IconUsersGroup width="22" height="22" />,
  },
  {
    title: "User Records",
    path: "/admin/users",
    icon: <IconUserCog width="22" height="22" />,
  },
  {
    title: "Analytics",
    path: "/admin/analytics",
    icon: <IconChartLine width="22" height="22" />,
  },
  {
    title: "Reports",
    path: "/admin/reports",
    icon: <IconFileText width="22" height="22" />,
  },
  {
    title: "Alerts",
    path: "/admin/alerts",
    icon: <IconAlertTriangle width="22" height="22" />,
  },
  {
    title: "Settings",
    path: "/admin/settings",
    icon: <IconSettings width="22" height="22" />,
  },
];
