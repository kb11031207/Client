/**
 * Join Private League Modal Component
 * 
 * Modal for joining a private league by entering the league ID.
 */

/**
 * Render the join private league modal HTML
 */
function renderJoinPrivateLeagueModal(): string {
  return `
    <div id="join-private-league-modal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">Join Private League</h2>
          <button id="close-join-private-league-modal" class="btn btn-icon" aria-label="Close modal">
            ×
          </button>
        </div>
        <div class="modal-body">
          <form id="join-private-league-form">
            <div class="form-group">
              <label for="league-id-input">League ID</label>
              <input 
                type="number" 
                id="league-id-input" 
                name="leagueId" 
                class="form-control" 
                placeholder="Enter league ID"
                required
                min="1"
              />
              <small class="form-help">
                Enter the league ID provided by the league owner.
              </small>
            </div>
            <div id="join-private-league-error" class="alert alert-danger hidden" role="alert"></div>
            <div class="modal-footer">
              <button type="button" id="cancel-join-private-league" class="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" id="submit-join-private-league" class="btn btn-primary">
                Join League
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

/**
 * Show the join private league modal
 */
export function showJoinPrivateLeagueModal(onJoin: (leagueId: number) => Promise<void>): void {
  const container = document.querySelector('#app');
  if (!container) return;

  // Remove existing modal if any
  const existingModal = document.querySelector('#join-private-league-modal');
  if (existingModal) {
    existingModal.remove();
  }

  // Create modal HTML
  const modalHTML = renderJoinPrivateLeagueModal();
  container.insertAdjacentHTML('beforeend', modalHTML);

  const modal = document.querySelector('#join-private-league-modal') as HTMLDivElement;
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

  const closeBtn = document.querySelector('#close-join-private-league-modal') as HTMLButtonElement;
  const cancelBtn = document.querySelector('#cancel-join-private-league') as HTMLButtonElement;
  
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
  const form = document.querySelector('#join-private-league-form') as HTMLFormElement;
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = document.querySelector('#submit-join-private-league') as HTMLButtonElement;
      const errorDiv = document.querySelector('#join-private-league-error') as HTMLDivElement;
      const leagueIdInput = document.querySelector('#league-id-input') as HTMLInputElement;
      
      // Get league ID
      const leagueId = parseInt(leagueIdInput.value.trim());
      
      if (!leagueId || leagueId < 1) {
        errorDiv.textContent = 'Please enter a valid league ID.';
        errorDiv.classList.remove('hidden');
        return;
      }

      // Clear previous errors
      errorDiv.classList.add('hidden');
      errorDiv.textContent = '';

      // Disable submit button
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Joining...';

      try {
        await onJoin(leagueId);
        // Success - close modal (page will refresh or navigate)
        closeModal();
      } catch (error: any) {
        // Show error
        errorDiv.textContent = error.message || 'Failed to join league. Please try again.';
        errorDiv.classList.remove('hidden');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }
}

