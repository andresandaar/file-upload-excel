import { inject } from "@angular/core";
import { UserService } from "@services/user/user.service";

/**
 * Clase Permiso
 * 
 * Gestiona la autorización basada en roles de usuarios en una aplicación Angular.
 */
export class Permiso {

  /**
   * Lista de roles permitidos para acceder a una funcionalidad.
   */
  private allowedRoles: string[] = [];

  /**
   * Lista de roles actuales del usuario autenticado.
   */
  private currentUserRoles: string[] = [];

  /**
   * Constructor
   * 
   * Utiliza `inject` para inyectar dinámicamente el servicio `UserService` 
   * y obtiene los roles del usuario actual al suscribirse al observable `getUserData`.
   */
  constructor() {
    const userService = inject(UserService);
    userService.getUserData().subscribe(user => {
      // Mapea los roles del usuario actual a una lista de niveles.
      this.currentUserRoles = user.roles.map(role => role.nivel);
    });
  }

  /**
   * Comprueba si el usuario tiene alguno de los roles especificados.
   * 
   * @param roles - Lista de roles permitidos.
   * @returns `true` si el usuario tiene permiso, de lo contrario `false`.
   */
  public comprobar(roles: string[]): boolean {
    this.allowedRoles = roles;
    return this.isRoleAllowed();
  }

  /**
   * Determina si el usuario tiene un rol permitido.
   * 
   * @returns `true` si el rol más alto del usuario está en los roles permitidos, de lo contrario `false`.
   */
  private isRoleAllowed(): boolean {
    // Determina el rol más alto del usuario
    const highestUserRole = this.getHighestRole(this.currentUserRoles);
    // Verifica si el rol más alto está dentro de los roles permitidos
    return this.allowedRoles.includes(highestUserRole);
  }

  /**
   * Obtiene el rol más alto de una lista de roles.
   * 
   * @param roles - Lista de roles del usuario.
   * @returns El rol más alto del usuario basado en una jerarquía predefinida.
   */
  private getHighestRole(roles: string[]): string {
    const roleHierarchy = ['USER', 'ADMIN', 'SUPERADMIN'];
    // Itera desde el rol más alto al más bajo para encontrar coincidencias
    for (let i = roleHierarchy.length - 1; i >= 0; i--) {
      if (roles.includes(roleHierarchy[i])) {
        return roleHierarchy[i];
      }
    }
    return '';
  }

}
