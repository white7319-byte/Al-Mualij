/**
 * ==========================================================================
 * AL-MUALIJ CLINIC - n8n AUTOMATION & WEBHOOK INTEGRATIONS
 * Asynchronous event dispatchers with simulation fallback and toast alerts
 * ==========================================================================
 */

const N8N_CONFIG = {
  // Replace these URLs with your active n8n webhook nodes
  WEBHOOKS: {
    booking_submit: "https://your-n8n-instance.com/webhook/booking-submit",
    contact_inquiry: "https://your-n8n-instance.com/webhook/contact-inquiry",
    urgent_callback: "https://your-n8n-instance.com/webhook/urgent-callback",
    insurance_verify: "https://your-n8n-instance.com/webhook/insurance-check"
  },
  TIMEOUT_MS: 8000
};

/**
 * Toast Notification Utility
 * @param {string} message 
 * @param {'success'|'error'|'info'} type 
 * @param {number} duration 
 */
function showToast(message, type = 'success', duration = 4500) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let iconClass = 'fa-check-circle';
  if (type === 'error') iconClass = 'fa-exclamation-circle';
  if (type === 'info') iconClass = 'fa-info-circle';

  toast.innerHTML = `
    <i class="fas ${iconClass}" style="color: ${type === 'error' ? '#EF4444' : type === 'info' ? 'var(--color-cyan)' : 'var(--color-jade)'}; font-size: 1.25rem; margin-top: 2px;"></i>
    <div style="flex-grow: 1;">
      <div style="font-weight: 600; font-size: 0.9rem; color: var(--color-primary);">${type.toUpperCase()}</div>
      <div style="font-size: 0.85rem; color: var(--color-text-muted); margin-top: 2px;">${message}</div>
    </div>
    <button style="color: var(--color-text-light); font-size: 0.9rem;" onclick="this.parentElement.remove()">&times;</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Dispatches an asynchronous JSON payload to an n8n webhook endpoint.
 * @param {string} endpointKey - Key in N8N_CONFIG.WEBHOOKS
 * @param {Object} payload - Data payload to send
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
async function dispatchN8nWebhook(endpointKey, payload) {
  const url = N8N_CONFIG.WEBHOOKS[endpointKey];
  
  if (!url) {
    console.error(`[n8n Webhook] Unknown endpoint key: ${endpointKey}`);
    return { success: false, error: 'Invalid webhook endpoint' };
  }

  // If using placeholder domain, simulate a live webhook response
  if (url.includes('your-n8n-instance.com')) {
    console.group(`⚡ [n8n Webhook Simulation] Dispatched to: ${endpointKey}`);
    console.log("Endpoint URL:", url);
    console.log("Payload:", payload);
    console.groupEnd();
    
    // Simulate minor network delay
    await new Promise(resolve => setTimeout(resolve, 600));
    return { success: true, simulated: true, message: 'Simulated n8n dispatch successful' };
  }

  // Live fetch to n8n webhook
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), N8N_CONFIG.TIMEOUT_MS);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        source: 'al_mualij_web_app',
        event_type: endpointKey,
        timestamp: new Date().toISOString(),
        payload: payload
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`n8n webhook responded with HTTP ${response.status}`);
    }

    const data = await response.json().catch(() => ({ status: 'received' }));
    console.log(`✅ [n8n Webhook] Successfully processed by n8n workflow (${endpointKey})`);
    return { success: true, data };
  } catch (error) {
    console.error(`❌ [n8n Webhook Error] Failed to send payload to ${url}:`, error);
    return { success: false, error: error.message };
  }
}

// Global exposure
window.showToast = showToast;
window.dispatchN8nWebhook = dispatchN8nWebhook;
