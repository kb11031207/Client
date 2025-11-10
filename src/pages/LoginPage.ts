import { authService } from '../services/auth.service';
import { router } from '../utils/router';

/**
 * Render the Login Page
 * 
 * Displays a login form and handles user authentication.
 * On successful login, navigates to the dashboard.
 */
export function renderLoginPage() {
  const container = document.querySelector('#app');
  if (!container) return;

  container.innerHTML = `
    <div class="page">
      <div class="page-container">
        <div class="card">
          <div class="page-header">
            <h1 class="page-title">Login</h1>
          </div>
          <form id="login-form" class="form">
            <div class="form-group">
              <label for="email" class="form-label">Email</label>
              <input 
                type="email" 
                id="email" 
                class="form-input"
                placeholder="Enter your email" 
                required 
              >
            </div>
            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <input 
                type="password" 
                id="password" 
                class="form-input"
                placeholder="Enter your password" 
                required 
              >
            </div>
            <button type="submit" id="login-button" class="btn btn-primary">
              Login
            </button>
          </form>
          <div class="page-footer">
            <p>
              Don't have an account? <a href="#/register">Register</a>
            </p>
          </div>
          <div id="error-message" class="alert alert-error hidden"></div>
          <div id="success-message" class="alert alert-success hidden"></div>
        </div>
      </div>
    </div>
  `;

  const form = document.querySelector('#login-form') as HTMLFormElement;
  const errorDiv = document.querySelector('#error-message') as HTMLDivElement;
  const successDiv = document.querySelector('#success-message') as HTMLDivElement;
  const loginButton = document.querySelector('#login-button') as HTMLButtonElement;

  // Clear any previous messages
  errorDiv.classList.add('hidden');
  successDiv.classList.add('hidden');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    errorDiv.classList.add('hidden');
    successDiv.classList.add('hidden');
    errorDiv.textContent = '';
    
    // Disable button and show loading state
    loginButton.disabled = true;
    loginButton.textContent = 'Logging in...';

    const email = (document.querySelector('#email') as HTMLInputElement).value;
    const password = (document.querySelector('#password') as HTMLInputElement).value;

    try {
      const result = await authService.login(email, password);
      
      // Show success message briefly
      successDiv.textContent = `Welcome back, ${result.username || result.email}!`;
      successDiv.classList.remove('hidden');
      
      // Navigate to dashboard after a short delay
      setTimeout(() => {
        router.navigate('/dashboard');
      }, 500);
    } catch (error: any) {
      // Show error message
      errorDiv.textContent = error.message || 'Login failed. Please check your credentials and try again.';
      errorDiv.classList.remove('hidden');
      
      // Re-enable button
      loginButton.disabled = false;
      loginButton.textContent = 'Login';
    }
  });
}
