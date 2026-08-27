/**
 * ==========================================================================
 * AL-MUALIJ CLINIC - BOTPRESS WEBCHAT INTEGRATION & FLOATING TRIGGER
 * Scaffold ready for Botpress Cloud / v2 Webchat with Fallback Assistant
 * ==========================================================================
 */

/*
==============================================================================
BOTPRESS INJECTION INSTRUCTIONS:
To connect your live Botpress Cloud Bot:
1. Uncomment the script loader below and provide your Bot ID & Client ID.
2. The custom floating trigger button on the page will automatically hook
   into window.botpressWebChat.sendEvent({ type: 'toggle' })
==============================================================================
*/

const BOTPRESS_CONFIG = {
  enabled: false, // Set to true once you paste your Botpress scripts below
  botId: "YOUR_BOT_ID_HERE",
  clientId: "YOUR_CLIENT_ID_HERE",
  hostUrl: "https://cdn.botpress.cloud/webchat/v2",
  messagingUrl: "https://messaging.botpress.cloud"
};

/**
 * Injects Botpress Webchat Scripts dynamically into the DOM
 */
function initBotpressWebchat() {
  if (!BOTPRESS_CONFIG.enabled || BOTPRESS_CONFIG.botId === "YOUR_BOT_ID_HERE") {
    console.info("ℹ️ [Botpress] Webchat running in interactive AI Triage Assistant mode. Set enabled: true and configure BOTPRESS_CONFIG to hook into live Botpress Cloud.");
    return;
  }

  // Inject Botpress Core Scripts
  const injectScript = document.createElement('script');
  injectScript.src = `${BOTPRESS_CONFIG.hostUrl}/inject.js`;
  injectScript.async = true;
  injectScript.onload = () => {
    if (window.botpressWebChat) {
      window.botpressWebChat.init({
        botId: BOTPRESS_CONFIG.botId,
        clientId: BOTPRESS_CONFIG.clientId,
        hostUrl: BOTPRESS_CONFIG.hostUrl,
        messagingUrl: BOTPRESS_CONFIG.messagingUrl,
        botName: "Al-Mualij AI Triage",
        botAvatar: "assets/images/bot-avatar.png",
        themeName: "prism",
        frontendVersion: "v2",
        showBotInfoPage: false,
        enableConversationDeletion: true
      });
      console.log("🤖 [Botpress] Webchat initialized successfully.");
    }
  };
  document.body.appendChild(injectScript);
}

/**
 * Handles clicks on the UI floating chatbot trigger button.
 */
function handleBotpressTriggerClick() {
  if (BOTPRESS_CONFIG.enabled && window.botpressWebChat) {
    window.botpressWebChat.sendEvent({ type: 'toggle' });
  } else {
    // Open the sleek embedded Eastern Medicine AI Triage Modal
    openAiTriageModal();
  }
}

/**
 * Interactive Fallback AI Triage & Treatment Finder Modal
 */
function openAiTriageModal() {
  let modal = document.getElementById('aiTriageModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'aiTriageModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 540px;">
        <button class="modal-close-btn" onclick="closeAiTriageModal()">&times;</button>
        <div style="background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-jade) 100%); padding: 1.75rem 2rem; color: #FFFFFF; border-radius: var(--radius-xl) var(--radius-xl) 0 0;">
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
            <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">
              <i class="fas fa-robot"></i>
            </div>
            <div>
              <h3 style="color: #FFFFFF; font-size: 1.25rem; margin: 0;">Al-Mualij AI Health Assistant</h3>
              <span style="font-size: 0.75rem; color: #A7F3D0;"><i class="fas fa-circle" style="font-size: 8px;"></i> Online • Eastern Medicine Triage</span>
            </div>
          </div>
          <p style="font-size: 0.85rem; color: #E2E8F0; margin: 0;">Ask quick questions about our non-surgical therapies, Hijama, or herbal formulations.</p>
        </div>
        
        <div style="padding: 1.5rem; max-height: 380px; overflow-y: auto;" id="triageChatArea">
          <div style="display: flex; gap: 0.75rem; margin-bottom: 1rem;">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--color-jade); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; flex-shrink: 0;">
              AM
            </div>
            <div style="background: var(--color-bg-alt); padding: 0.85rem 1rem; border-radius: var(--radius-md); font-size: 0.9rem; color: var(--color-text-main); max-width: 80%;">
              Greetings! I am the Al-Mualij clinical triage assistant. Are you experiencing joint pain, chronic migraines, digestive disorders, or seeking post-injury non-surgical recovery?
            </div>
          </div>
          
          <div style="margin: 1.25rem 0 0.5rem 0; font-size: 0.8rem; font-weight: 600; color: var(--color-text-muted);">Quick Symptom Topics:</div>
          <div style="display: flex; flex-direction: column; gap: 0.5rem;" id="triageQuickPrompts">
            <button class="triage-prompt-btn" onclick="sendTriageSample('Hijama for Sciatica & Lower Back Pain')">
              🩺 Can Hijama (Cupping) relieve Sciatica and lumbar disc bulge?
            </button>
            <button class="triage-prompt-btn" onclick="sendTriageSample('Herbal Care for Chronic Acidity & IBS')">
              🌿 What Unani herbal regimens cure chronic IBS & Gastritis?
            </button>
            <button class="triage-prompt-btn" onclick="sendTriageSample('Acupuncture for Migraines')">
              ⚡ How many Acupuncture sessions are needed for chronic Migraines?
            </button>
            <button class="triage-prompt-btn" onclick="sendTriageSample('Eastern Spinal Alignment without Surgery')">
              🦴 How does Eastern spinal decompression prevent cervical surgery?
            </button>
          </div>
        </div>

        <div style="padding: 1rem 1.5rem; background: var(--color-bg-light); border-top: 1px solid var(--color-border); display: flex; gap: 0.5rem;">
          <input type="text" id="triageCustomInput" placeholder="Type your health query..." class="form-input" style="flex-grow: 1; padding: 0.6rem 0.85rem; font-size: 0.9rem;" onkeydown="if(event.key === 'Enter') sendCustomTriageMessage()">
          <button class="btn btn-primary btn-sm" onclick="sendCustomTriageMessage()">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Inject prompt button styles
    const style = document.createElement('style');
    style.innerHTML = `
      .triage-prompt-btn {
        text-align: left;
        padding: 0.65rem 0.85rem;
        background: #FFFFFF;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        font-size: 0.825rem;
        color: var(--color-primary);
        font-weight: 500;
        transition: all 0.2s;
        cursor: pointer;
      }
      .triage-prompt-btn:hover {
        border-color: var(--color-jade);
        background: rgba(16, 185, 129, 0.06);
        color: var(--color-jade);
        transform: translateX(4px);
      }
    `;
    document.head.appendChild(style);
  }

  modal.classList.add('active');
}

function closeAiTriageModal() {
  const modal = document.getElementById('aiTriageModal');
  if (modal) modal.classList.remove('active');
}

/**
 * Appends simulated clinical answers based on query
 */
function sendTriageSample(topic) {
  const chatArea = document.getElementById('triageChatArea');
  if (!chatArea) return;

  // Add User Message
  const userMsg = document.createElement('div');
  userMsg.style.cssText = "display: flex; justify-content: flex-end; margin-bottom: 1rem;";
  userMsg.innerHTML = `
    <div style="background: var(--color-primary); color: #fff; padding: 0.75rem 1rem; border-radius: var(--radius-md); font-size: 0.875rem; max-width: 80%;">
      ${topic}
    </div>
  `;
  chatArea.appendChild(userMsg);

  // Response mapping
  let responseText = "Our certified Hakims and Eastern Medicine specialists can evaluate your pulse and humoral temperament (Mizaj) to prescribe tailored natural non-surgical therapies.";
  if (topic.includes('Sciatica') || topic.includes('Back Pain')) {
    responseText = "<strong>Yes!</strong> Hijama (Wet Cupping) combined with Eastern lumbar realignment clears stagnant blood in the sciatic pathway, reducing nerve inflammation by up to 85% within 3-4 targeted sessions without requiring spinal surgery.";
  } else if (topic.includes('Acidity') || topic.includes('IBS')) {
    responseText = "Our Unani Herbal formulations (including specialized Jawarish, cooling mucilages, and temperament-balancing extracts) soothe gut lining inflammation, restore digestive fire (Hararat-e-Ghariziya), and eradicate IBS triggers without pharmaceutical dependency.";
  } else if (topic.includes('Acupuncture') || topic.includes('Migraines')) {
    responseText = "Acupuncture stimulates endorphin release and clears vascular constriction along cranial meridians. Most chronic migraine sufferers experience significant relief after 4 to 6 sessions.";
  } else if (topic.includes('Spinal Alignment')) {
    responseText = "Our non-surgical Eastern spinal mobilization decompresses disc herniations naturally through manual traction and herbal anti-inflammatory fomentation, preserving natural spinal biomechanics.";
  }

  // Add Assistant Response
  setTimeout(() => {
    const botMsg = document.createElement('div');
    botMsg.style.cssText = "display: flex; gap: 0.75rem; margin-bottom: 1rem;";
    botMsg.innerHTML = `
      <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--color-jade); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; flex-shrink: 0;">AM</div>
      <div style="background: var(--color-bg-alt); padding: 0.85rem 1rem; border-radius: var(--radius-md); font-size: 0.875rem; color: var(--color-text-main); max-width: 80%; line-height: 1.5;">
        ${responseText}
        <div style="margin-top: 0.75rem;">
          <button class="btn btn-primary btn-sm" onclick="closeAiTriageModal(); openBookingModal();" style="font-size: 0.75rem; padding: 0.4rem 0.85rem;">
            <i class="fas fa-calendar-check"></i> Book Consultation
          </button>
        </div>
      </div>
    `;
    chatArea.appendChild(botMsg);
    chatArea.scrollTop = chatArea.scrollHeight;
  }, 400);
}

function sendCustomTriageMessage() {
  const input = document.getElementById('triageCustomInput');
  if (!input || !input.value.trim()) return;
  const msg = input.value.trim();
  input.value = '';
  sendTriageSample(msg);
}

// Auto-initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => {
  initBotpressWebchat();
  
  // Attach trigger button if exists
  const floatingBtn = document.getElementById('botpressTriggerBtn');
  if (floatingBtn) {
    floatingBtn.addEventListener('click', handleBotpressTriggerClick);
  }
});

// Global exposure
window.handleBotpressTriggerClick = handleBotpressTriggerClick;
window.openAiTriageModal = openAiTriageModal;
window.closeAiTriageModal = closeAiTriageModal;
window.sendTriageSample = sendTriageSample;
window.sendCustomTriageMessage = sendCustomTriageMessage;
