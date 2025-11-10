import { authService } from '../services/auth.service';
import { router } from '../utils/router';

/**
 * Render the Register Page
 * 
 * Displays a registration form and handles user registration.
 * On successful registration, navigates to the login page.
 */
export function renderRegisterPage() {
  const container = document.querySelector('#app');
  if (!container) return;

  container.innerHTML = `
    <div class="page">
      <div class="page-container">
        <div class="card">
          <div class="page-header">
            <h1 class="page-title">Register</h1>
          </div>
          <form id="register-form" class="form">
            <div class="form-group">
              <label for="username" class="form-label">Username</label>
              <input 
                type="text" 
                id="username" 
                class="form-input"
                placeholder="Enter your username" 
                required 
                minlength="3"
                maxlength="50"
              >
              <small class="form-help">3-50 characters</small>
            </div>
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
                minlength="8"
              >
              <small class="form-help">Minimum 8 characters</small>
            </div>
            <div class="form-group">
              <label for="school" class="form-label">School (Optional)</label>
              <input 
                type="text" 
                id="school" 
                class="form-input"
                placeholder="Enter your school name" 
                maxlength="100"
              >
            </div>
            <button type="submit" id="register-button" class="btn btn-primary">
              Register
            </button>
          </form>
          <div class="page-footer">
            <p>
              Already have an account? <a href="#/login">Login</a>
            </p>
          </div>
          <div id="error-message" class="alert alert-error hidden"></div>
          <div id="success-message" class="alert alert-success hidden"></div>
        </div>
      </div>
    </div>
  `;

  const form = document.querySelector('#register-form') as HTMLFormElement;
  const errorDiv = document.querySelector('#error-message') as HTMLDivElement;
  const successDiv = document.querySelector('#success-message') as HTMLDivElement;
  const registerButton = document.querySelector('#register-button') as HTMLButtonElement;

  // Clear any previous messages
  errorDiv.classList.add('hidden');
  successDiv.classList.add('hidden');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    errorDiv.classList.add('hidden');
    successDiv.classList.add('hidden');
    errorDiv.textContent = '';
    
    // Get form values
    const username = (document.querySelector('#username') as HTMLInputElement).value.trim();
    const email = (document.querySelector('#email') as HTMLInputElement).value.trim();
    const password = (document.querySelector('#password') as HTMLInputElement).value;
    const school = (document.querySelector('#school') as HTMLInputElement).value.trim();

    // Validate input
    if (username.length < 3 || username.length > 50) {
      errorDiv.textContent = 'Username must be between 3 and 50 characters.';
      errorDiv.classList.remove('hidden');
      return;
    }

    if (password.length < 8) {
      errorDiv.textContent = 'Password must be at least 8 characters long.';
      errorDiv.classList.remove('hidden');
      return;
    }

    // Disable button and show loading state
    registerButton.disabled = true;
    registerButton.textContent = 'Registering...';

    try {
      const result = await authService.register(
        username, 
        email, 
        password, 
        school || undefined
      );
      
      // Show success message
      successDiv.textContent = `Registration successful! Welcome, ${result.username}! Redirecting to login...`;
      successDiv.classList.remove('hidden');
      
      // Navigate to login page after a short delay
      setTimeout(() => {
        router.navigate('/login');
      }, 2000);
    } catch (error: any) {
      // Show error message
      errorDiv.textContent = error.message || 'Registration failed. Please try again.';
      errorDiv.classList.remove('hidden');
      
      // Re-enable button
      registerButton.disabled = false;
      registerButton.textContent = 'Register';
    }
  });
}
