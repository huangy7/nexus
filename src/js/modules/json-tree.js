/**
 * Renders JSON data into an interactive, collapsible DOM structure with syntax highlighting
 */
export function renderJsonTree(data, isLast = true, level = 0) {
  const container = document.createElement('div');
  container.className = 'json-tree-node';

  if (data === null) {
    container.innerHTML = `<span class="json-val-null">null</span>${isLast ? '' : '<span class="json-comma">,</span>'}`;
    return container;
  }

  const type = typeof data;

  if (type === 'boolean') {
    container.innerHTML = `<span class="json-val-bool">${data}</span>${isLast ? '' : '<span class="json-comma">,</span>'}`;
    return container;
  }

  if (type === 'number') {
    container.innerHTML = `<span class="json-val-num">${data}</span>${isLast ? '' : '<span class="json-comma">,</span>'}`;
    return container;
  }

  if (type === 'string') {
    const escaped = escapeHtml(JSON.stringify(data));
    container.innerHTML = `<span class="json-val-str">${escaped}</span>${isLast ? '' : '<span class="json-comma">,</span>'}`;
    return container;
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      container.innerHTML = `<span class="json-bracket">[]</span>${isLast ? '' : '<span class="json-comma">,</span>'}`;
      return container;
    }

    const foldBtn = document.createElement('span');
    foldBtn.className = 'json-tree-toggle open';
    foldBtn.textContent = '▼';

    const header = document.createElement('div');
    header.className = 'json-tree-header';
    header.appendChild(foldBtn);

    const openBracket = document.createElement('span');
    openBracket.className = 'json-bracket';
    openBracket.textContent = '[';
    header.appendChild(openBracket);

    const badge = document.createElement('span');
    badge.className = 'json-badge';
    badge.textContent = ` ${data.length} items `;
    header.appendChild(badge);

    const body = document.createElement('div');
    body.className = 'json-tree-body';

    data.forEach((item, idx) => {
      const child = renderJsonTree(item, idx === data.length - 1, level + 1);
      body.appendChild(child);
    });

    const footer = document.createElement('div');
    footer.className = 'json-tree-footer';
    footer.innerHTML = `<span class="json-bracket">]</span>${isLast ? '' : '<span class="json-comma">,</span>'}`;

    container.appendChild(header);
    container.appendChild(body);
    container.appendChild(footer);

    foldBtn.onclick = (e) => {
      e.stopPropagation();
      const isOpen = foldBtn.classList.contains('open');
      if (isOpen) {
        foldBtn.classList.remove('open');
        foldBtn.textContent = '▶';
        body.style.display = 'none';
        badge.style.display = 'inline-block';
      } else {
        foldBtn.classList.add('open');
        foldBtn.textContent = '▼';
        body.style.display = 'block';
        badge.style.display = 'none';
      }
    };

    return container;
  }

  if (type === 'object') {
    const keys = Object.keys(data);
    if (keys.length === 0) {
      container.innerHTML = `<span class="json-bracket">{}</span>${isLast ? '' : '<span class="json-comma">,</span>'}`;
      return container;
    }

    const foldBtn = document.createElement('span');
    foldBtn.className = 'json-tree-toggle open';
    foldBtn.textContent = '▼';

    const header = document.createElement('div');
    header.className = 'json-tree-header';
    header.appendChild(foldBtn);

    const openBrace = document.createElement('span');
    openBrace.className = 'json-bracket';
    openBrace.textContent = '{';
    header.appendChild(openBrace);

    const badge = document.createElement('span');
    badge.className = 'json-badge';
    badge.textContent = ` ${keys.length} keys `;
    header.appendChild(badge);

    const body = document.createElement('div');
    body.className = 'json-tree-body';

    keys.forEach((key, idx) => {
      const row = document.createElement('div');
      row.className = 'json-tree-row';

      const keySpan = document.createElement('span');
      keySpan.className = 'json-key';
      keySpan.textContent = `"${key}": `;
      row.appendChild(keySpan);

      const valNode = renderJsonTree(data[key], idx === keys.length - 1, level + 1);
      row.appendChild(valNode);

      body.appendChild(row);
    });

    const footer = document.createElement('div');
    footer.className = 'json-tree-footer';
    footer.innerHTML = `<span class="json-bracket">}</span>${isLast ? '' : '<span class="json-comma">,</span>'}`;

    container.appendChild(header);
    container.appendChild(body);
    container.appendChild(footer);

    foldBtn.onclick = (e) => {
      e.stopPropagation();
      const isOpen = foldBtn.classList.contains('open');
      if (isOpen) {
        foldBtn.classList.remove('open');
        foldBtn.textContent = '▶';
        body.style.display = 'none';
        badge.style.display = 'inline-block';
      } else {
        foldBtn.classList.add('open');
        foldBtn.textContent = '▼';
        body.style.display = 'block';
        badge.style.display = 'none';
      }
    };

    return container;
  }

  return container;
}

export function expandAllTreeNodes(container) {
  container.querySelectorAll('.json-tree-toggle').forEach(btn => {
    btn.classList.add('open');
    btn.textContent = '▼';
  });
  container.querySelectorAll('.json-tree-body').forEach(body => {
    body.style.display = 'block';
  });
  container.querySelectorAll('.json-badge').forEach(badge => {
    badge.style.display = 'none';
  });
}

export function collapseAllTreeNodes(container) {
  container.querySelectorAll('.json-tree-toggle').forEach(btn => {
    btn.classList.remove('open');
    btn.textContent = '▶';
  });
  container.querySelectorAll('.json-tree-body').forEach(body => {
    body.style.display = 'none';
  });
  container.querySelectorAll('.json-badge').forEach(badge => {
    badge.style.display = 'inline-block';
  });
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
