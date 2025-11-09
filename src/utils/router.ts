/**
 * Simple Hash-based Router
 * 
 * Handles client-side routing using URL hash fragments.
 * Example: #/login, #/register, #/dashboard
 */

type RouteHandler = () => void;

class Router {
  private routes: Map<string, RouteHandler> = new Map();
  private currentRoute: string = '';

  constructor() {
    // Listen for hash changes
    window.addEventListener('hashchange', () => {
      this.handleRoute();
    });

    // Handle initial route on page load
    window.addEventListener('load', () => {
      this.handleRoute();
    });
  }

  /**
   * Register a route handler
   * @param path Route path (e.g., '/login', '/register')
   * @param handler Function to call when route matches
   */
  register(path: string, handler: RouteHandler) {
    this.routes.set(path, handler);
  }

  /**
   * Navigate to a route
   * @param path Route path to navigate to
   */
  navigate(path: string) {
    window.location.hash = path;
  }

  /**
   * Get the current route from the hash
   */
  getCurrentRoute(): string {
    const hash = window.location.hash;
    return hash ? hash.substring(1) : '/';
  }

  /**
   * Handle the current route
   */
  private handleRoute() {
    const route = this.getCurrentRoute();
    this.currentRoute = route;

    // Try exact match first
    if (this.routes.has(route)) {
      const handler = this.routes.get(route)!;
      handler();
      return;
    }

    // Try parameterized routes (e.g., /squad/1, /squad/2)
    // Check if route starts with a registered base route
    for (const [registeredPath, handler] of this.routes.entries()) {
      if (route.startsWith(registeredPath + '/')) {
        handler();
        return;
      }
    }

    // Try to find a default route or 404
    if (this.routes.has('/')) {
      const handler = this.routes.get('/')!;
      handler();
    }
  }

  /**
   * Get the current route path
   */
  getCurrentPath(): string {
    return this.currentRoute;
  }

  /**
   * Manually trigger route handling
   * Useful for initial page load after routes are registered
   */
  init() {
    this.handleRoute();
  }
}

export const router = new Router();

