/**
 * Create League Modal Component
 * 
 * Modal for creating new leagues.
 */

/**
 * Render the create league modal
 * @returns HTML string
 */
export function renderCreateLeagueModal(): string {
  return `
    <div id="create-league-modal" class="modal-overlay">
      <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header">
          <h2 class="modal-title">Create New League</h2>
          <button class="modal-close" id="close-create-league-modal" aria-label="Close">
            ×
          </button>
        </div>
        <div class="modal-body">
          <form id="create-league-form">
            <div class="form-group">
              <label class="form-label">League Type</label>
              <div class="flex flex-column gap-sm">
                <label class="flex flex-center gap-sm" style="cursor: pointer; padding: var(--spacing-md); border: 2px solid var(--color-border); border-radius: var(--radius-sm); transition: var(--transition-fast);">
                  <input 
                    type="radio" 
                    name="leagueType" 
                    value="public" 
                    checked
                    style="margin: 0; margin-right: var(--spacing-sm);"
                  >
                  <div class="flex flex-column" style="flex: 1;">
                    <div style="font-weight: var(--font-weight-medium);">Public League</div>
                    <div class="text-secondary" style="font-size: var(--font-size-sm);">
                      Anyone can join this league
                    </div>
                  </div>
                </label>
                <label class="flex flex-center gap-sm" style="cursor: pointer; padding: var(--spacing-md); border: 2px solid var(--color-border); border-radius: var(--radius-sm); transition: var(--transition-fast);">
                  <input 
                    type="radio" 
                    name="leagueType" 
                    value="private"
                    style="margin: 0; margin-right: var(--spacing-sm);"
                  >
                  <div class="flex flex-column" style="flex: 1;">
                    <div style="font-weight: var(--font-weight-medium);">Private League</div>
                    <div class="text-secondary" style="font-size: var(--font-size-sm);">
                      Only invited members can join
                    </div>
                  </div>
                </label>
              </div>
            </div>
            <div id="create-league-error" class="alert alert-error hidden"></div>
            <div class="flex gap-sm" style="justify-content: flex-end; margin-top: var(--spacing-lg);">
              <button type="button" class="btn btn-secondary" id="cancel-create-league">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" id="submit-create-league">
                Create League
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

/**
 * Show the create league modal
 */
export function showCreateLeagueModal(onCreate: (isPublic: boolean) => Promise<void>): void {
  const container = document.querySelector('#app');
  if (!container) return;

  // Create modal HTML
  const modalHTML = renderCreateLeagueModal();
  const modalContainer = document.createElement('div');
  modalContainer.innerHTML = modalHTML;
  container.appendChild(modalContainer);

  const modal = document.querySelector('#create-league-modal') as HTMLDivElement;
  if (!modal) return;

  // Show modal with animation
  setTimeout(() => {
    modal.classList.add('modal-show');
  }, 10);

  // Close modal handlers
  const closeModal = () => {
    modal.classList.remove('modal-show');
    setTimeout(() => {
      modal.remove();
    }, 300);
  };

  const closeBtn = document.querySelector('#close-create-league-modal') as HTMLButtonElement;
  const cancelBtn = document.querySelector('#cancel-create-league') as HTMLButtonElement;
  
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }
  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeModal);
  }

  // Close on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Handle form submission
  const form = document.querySelector('#create-league-form') as HTMLFormElement;
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = document.querySelector('#submit-create-league') as HTMLButtonElement;
      const errorDiv = document.querySelector('#create-league-error') as HTMLDivElement;
      
      // Get selected league type
      const formData = new FormData(form);
      const leagueType = formData.get('leagueType') as string;
      // Backend: true = public, false = private (reversed from intuitive)
      const isPublic = leagueType === 'public';

      // Clear previous errors
      errorDiv.classList.add('hidden');
      errorDiv.textContent = '';

      // Disable submit button
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Creating...';

      try {
        await onCreate(isPublic);
        // Success - close modal (page will refresh or navigate)
        closeModal();
      } catch (error: any) {
        // Show error
        errorDiv.textContent = error.message || 'Failed to create league. Please try again.';
        errorDiv.classList.remove('hidden');
        
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        
        console.error('Failed to create league:', error);
      }
    });
  }
}

