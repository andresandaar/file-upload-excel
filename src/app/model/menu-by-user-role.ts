interface SidebarMenu {
    icon: string;
    menu: string;
    children: MenuChildren[];
    expanded: boolean;
}
export interface MenuChildren {
    link: string;
    icon: string;
    menu: string;
}

export interface MenuByUserRole {
    roles: string[];
    menus: SidebarMenu[];
}