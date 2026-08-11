export function initCommandBar(tools, onSelect) {
  const modal = document.createElement('div');
  modal.className = 'cmd-modal-overlay hidden';
  modal.innerHTML = `
    <div class="cmd-modal">
      <div class="cmd-input-wrapper">
        <span class="cmd-icon">🔍</span>
        <input type="text" id="cmdSearchInput" placeholder="Type a tool name or command (e.g. JSON, IP, Ping, Base64)..." />
        <kbd>ESC</kbd>
      </div>
      <div class="cmd-results" id="cmdResults"></div>
    </div>
  `;
  document.body.appendChild(modal);

  const input = modal.querySelector('#cmdSearchInput');
  const results = modal.querySelector('#cmdResults');

  function open() {
    modal.classList.remove('hidden');
    input.value = '';
    render(tools);
    setTimeout(() => input.focus(), 50);
  }

  function close() {
    modal.classList.add('hidden');
  }

  function render(list) {
    if (list.length === 0) {
      results.innerHTML = `<div class="cmd-empty">No tools found</div>`;
      return;
    }
    results.innerHTML = list.map((item, index) => `
      <div class="cmd-item" data-index="${index}">
        <span class="cmd-item-icon">${item.icon}</span>
        <div class="cmd-item-text">
          <div class="cmd-item-title">${item.title}</div>
          <div class="cmd-item-desc">${item.desc}</div>
        </div>
      </div>
    `).join('');

    results.querySelectorAll('.cmd-item').forEach((el, idx) => {
      el.addEventListener('click', () => {
        onSelect(list[idx]);
        close();
      });
    });
  }

  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (modal.classList.contains('hidden')) {
        open();
      } else {
        close();
      }
    }
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      close();
    }
  });

  input.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = tools.filter(t => t.title.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.id.toLowerCase().includes(q));
    render(filtered);
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  return { open, close };
}
