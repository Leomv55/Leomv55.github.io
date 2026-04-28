/**
 * llm.js — Client-side LLM chat via WebLLM (WebGPU)
 * - Model loads on first chat open, not page load
 * - System prompt built from /content/ project files (inlined below)
 * - Graceful fallback if WebGPU unavailable → static FAQ
 * - Max 10 messages per session
 * - No data sent anywhere
 */

(function () {
  const TOGGLE_ID   = 'chat-toggle';
  const PANEL_ID    = 'chat-panel';
  const MAX_MESSAGES = 10;
  const MODEL_ID    = 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC';
  const WEBLLM_CDN  = 'https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.73/lib/index.js';

  // ── System prompt (knowledge base) ────────────────────────────────────────
  const SYSTEM_PROMPT = `You are a concise AI assistant on Leo Varghese's portfolio website. Answer questions about Leo based only on the facts below. Keep answers to 2-4 sentences. Never fabricate numbers or experiences. If asked something not covered, say you don't have that information.

ABOUT LEO
Leo Varghese is a backend engineer at SII India, working on search infrastructure for Thomson Reuters. Previously at Impress.ai. 3+ years with Python and Django in production. AWS certified (2023).

PROJECTS

1. Bias Detection Filter (Thomson Reuters via SII India)
Built an in-house bias detection filter for OpenSearch results as an alternative to a paid vendor (Coactive). Achieved 94% accuracy with a 2-second Lambda response time. Used Python, LangChain, AWS Lambda, Serverless Framework, and GraphQL. Also built a prompt-iterator Claude skill to make future model migrations easier — reusable by the team.

2. ARM Migration + OpenSearch (Thomson Reuters via SII India)
Migrated OpenSearch cluster from x86 to ARM after benchmarking both architectures on the actual workload. Saved $11,000/year. Fixed a 7GB memory issue from an _id-field sorting anti-pattern. Migrated CI/CD from Jenkins to GitHub Actions. Also leading solo migration from OpenSearch 2 to OpenSearch 3 — derived vector feature saves 40% storage.

3. Enterprise Assessment Integrations (Impress.ai)
Owned end-to-end integration of 7+ enterprise assessment platforms (SHL, Aon, Aon Gate, Pulsify, HackerRank, HackerEarth) into a production hiring system used by DBS Bank, processing thousands of candidates daily. Built a client-facing analytics dashboard and an internal test platform so ops could self-serve integration checks.

4. This Portfolio
Static portfolio site running an LLM entirely in the visitor's browser using WebLLM and WebGPU. No server, no API keys, no cost. Built with vanilla JS on GitHub Pages using the BMad Method.

STACK
Languages: Python, Django, DRF, Celery, Django Channels
Cloud: AWS (Lambda, ECS, CloudFormation, S3), DigitalOcean
Search: OpenSearch
AI: LangChain, LLM/SLM integration, Claude
Infra: Docker, GitHub Actions, Jenkins, Serverless Framework
Databases: PostgreSQL, Redis, SQLite3
Observability: Sentry, Grafana, Kibana, Loki
APIs: REST, SOAP, GraphQL

WORKING STYLE
Reaches for automation when something is done more than twice. Builds custom Claude skills for daily engineering workflows. Uses the BMad Method for structured AI-assisted development.`;

  // ── Static FAQ fallback ────────────────────────────────────────────────────
  const FAQ = [
    { q: 'What does Leo work on?', a: 'Currently building search infrastructure at SII India for Thomson Reuters — OpenSearch migrations, bias detection, and infrastructure cost work.' },
    { q: 'What is Leo\'s main stack?', a: 'Python, Django, AWS (Lambda, ECS, CloudFormation), OpenSearch, LangChain. Comfortable with REST, SOAP, GraphQL, and Docker.' },
    { q: 'What are Leo\'s key projects?', a: 'Bias detection filter (94% accuracy, replaced paid vendor), ARM migration ($11k/year saved), 7+ enterprise integrations at Impress.ai, and this portfolio.' },
    { q: 'How do I contact Leo?', a: 'Hit the POST /api/hire button or scroll to the contact section.' },
  ];

  // ── State ──────────────────────────────────────────────────────────────────
  let engine        = null;
  let isLoading     = false;
  let messageCount  = 0;
  let webgpuAvailable = false;
  let panelOpen     = false;

  // ── WebGPU detection ───────────────────────────────────────────────────────
  async function checkWebGPU() {
    if (!navigator.gpu) return false;
    try {
      const adapter = await navigator.gpu.requestAdapter();
      return !!adapter;
    } catch (_) {
      return false;
    }
  }

  // ── Build panel HTML ───────────────────────────────────────────────────────
  function createPanel(withLLM) {
    const panel = document.createElement('div');
    panel.id = PANEL_ID;
    panel.className = 'chat-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Chat with Leo\'s AI');

    panel.innerHTML = `
      <div class="chat-panel__header">
        <div class="chat-panel__title">
          <span class="chat-panel__dot"></span>
          Ask Leo's AI
        </div>
        <button class="chat-panel__close" id="chat-close" aria-label="Close chat">✕</button>
      </div>
      <p class="chat-panel__disclaimer">Running in your browser — no data sent anywhere</p>
      <div class="chat-panel__messages" id="chat-messages">
        <div class="chat-msg chat-msg--ai">
          Hey — I'm a local AI trained on Leo's projects. Ask me anything.
        </div>
      </div>
      ${withLLM ? `
      <div class="chat-panel__progress" id="chat-progress" hidden>
        <div class="chat-progress__bar">
          <div class="chat-progress__fill" id="chat-progress-fill"></div>
        </div>
        <p class="chat-progress__label" id="chat-progress-label">Loading model...</p>
      </div>
      <div class="chat-panel__input-row" id="chat-input-row">
        <input type="text" class="chat-panel__input" id="chat-input"
               placeholder="Ask about Leo's work..." autocomplete="off" />
        <button class="chat-panel__send btn btn--primary" id="chat-send">Send</button>
      </div>
      ` : `
      <div class="chat-panel__faq">
        <p class="chat-panel__faq-note">Your browser doesn't support WebGPU. Here are some quick answers:</p>
        ${FAQ.map(function (item) {
          return `<div class="faq-item">
            <p class="faq-item__q">${item.q}</p>
            <p class="faq-item__a">${item.a}</p>
          </div>`;
        }).join('')}
      </div>
      `}
    `;

    document.body.appendChild(panel);
    return panel;
  }

  // ── Message helpers ────────────────────────────────────────────────────────
  function appendMessage(role, text) {
    const messages = document.getElementById('chat-messages');
    if (!messages) return;
    const div = document.createElement('div');
    div.className = 'chat-msg chat-msg--' + role;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function showTyping() {
    const messages = document.getElementById('chat-messages');
    if (!messages) return;
    const div = document.createElement('div');
    div.className = 'chat-msg chat-msg--ai chat-msg--typing';
    div.id = 'chat-typing';
    div.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function removeTyping() {
    const el = document.getElementById('chat-typing');
    if (el) el.remove();
  }

  function setInputEnabled(enabled) {
    const input  = document.getElementById('chat-input');
    const send   = document.getElementById('chat-send');
    if (input) input.disabled = !enabled;
    if (send)  send.disabled  = !enabled;
  }

  // ── Model load ─────────────────────────────────────────────────────────────
  async function loadModel() {
    if (engine || isLoading) return;
    isLoading = true;

    const progress     = document.getElementById('chat-progress');
    const progressFill = document.getElementById('chat-progress-fill');
    const progressLabel= document.getElementById('chat-progress-label');
    const inputRow     = document.getElementById('chat-input-row');

    if (progress) progress.hidden = false;
    if (inputRow) inputRow.hidden = true;
    setInputEnabled(false);

    try {
      const { CreateMLCEngine } = await import(WEBLLM_CDN);

      engine = await CreateMLCEngine(MODEL_ID, {
        initProgressCallback: function (report) {
          const pct = Math.round((report.progress || 0) * 100);
          if (progressFill)  progressFill.style.width = pct + '%';
          if (progressLabel) progressLabel.textContent = report.text || ('Loading... ' + pct + '%');
        },
      });

      if (progress) progress.hidden = true;
      if (inputRow) inputRow.hidden = false;
      setInputEnabled(true);

      const input = document.getElementById('chat-input');
      if (input) input.focus();

    } catch (err) {
      console.error('[llm] model load failed:', err);
      if (progress) progress.hidden = true;
      appendMessage('ai', 'Model failed to load. Try refreshing, or use a Chrome/Edge browser with WebGPU enabled.');
    }

    isLoading = false;
  }

  // ── Send message ───────────────────────────────────────────────────────────
  async function sendMessage(text) {
    if (!text.trim() || !engine || messageCount >= MAX_MESSAGES) return;

    messageCount++;
    appendMessage('user', text);
    setInputEnabled(false);

    const input = document.getElementById('chat-input');
    if (input) input.value = '';

    if (messageCount >= MAX_MESSAGES) {
      appendMessage('ai', 'Session limit reached (10 messages). Refresh the page to start a new session.');
      return;
    }

    showTyping();
    try {
      const reply = await engine.chat.completions.create({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user',   content: text },
        ],
        max_tokens: 200,
        temperature: 0.3,
      });
      removeTyping();
      const answer = reply.choices[0].message.content.trim();
      appendMessage('ai', answer);
    } catch (err) {
      removeTyping();
      console.error('[llm] inference error:', err);
      appendMessage('ai', 'Something went wrong. Try asking again.');
    }

    setInputEnabled(true);
    const inp = document.getElementById('chat-input');
    if (inp) inp.focus();
  }

  // ── Toggle panel ───────────────────────────────────────────────────────────
  function openPanel() {
    let panel = document.getElementById(PANEL_ID);
    if (!panel) {
      panel = createPanel(webgpuAvailable);
      // Wire close button
      document.getElementById('chat-close').addEventListener('click', closePanel);

      if (webgpuAvailable) {
        // Wire send button + enter key
        document.getElementById('chat-send').addEventListener('click', function () {
          const input = document.getElementById('chat-input');
          if (input) sendMessage(input.value);
        });
        document.getElementById('chat-input').addEventListener('keydown', function (e) {
          if (e.key === 'Enter') sendMessage(e.target.value);
        });

        // Load model on first open
        loadModel();
      }
    }

    panel.classList.add('is-open');
    panelOpen = true;
    window.__llmLoaded = true;
  }

  function closePanel() {
    const panel = document.getElementById(PANEL_ID);
    if (panel) panel.classList.remove('is-open');
    panelOpen = false;
  }

  // ── Init ───────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', async function () {
    const toggle = document.getElementById(TOGGLE_ID);
    if (!toggle) return;

    webgpuAvailable = await checkWebGPU();

    toggle.addEventListener('click', function () {
      panelOpen ? closePanel() : openPanel();
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panelOpen) closePanel();
    });
  });

})();
