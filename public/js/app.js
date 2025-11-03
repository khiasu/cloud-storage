// Make sure closeModal is available globally
window.closeModal = closeModal;

const api = {
  async req(path, opts = {}) {
    const token = localStorage.getItem('token');
    opts.headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
    if (token) opts.headers['Authorization'] = 'Bearer ' + token;
    const r = await fetch(path, opts);
    if (!r.ok) {
      const err = await r.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || 'error');
    }
    return r.json();
  },
  async register(email, password) {
    const r = await this.req('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) });
    localStorage.setItem('token', r.token);
    localStorage.setItem('email', email);
  },
  async login(email, password) {
    const r = await this.req('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    localStorage.setItem('token', r.token);
    localStorage.setItem('email', email);
  },
  async list() { return this.req('/api/files/list'); }
};

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// Toast notifications
function showToast(message, type = 'success') {
  const toast = $('#toast');
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// Modal
function showModal(title, body) {
  $('#modalTitle').textContent = title;
  $('#modalBody').innerHTML = body;
  $('#modal').classList.remove('hidden');
}

function closeModal() {
  $('#modal').classList.add('hidden');
}

// closeModal is now exported as part of the module

// Auth handlers
document.addEventListener('DOMContentLoaded', () => {
  // Login button
  const loginBtn = $('#login');
  if (loginBtn) {
    loginBtn.onclick = async () => {
      try {
        const email = $('#email').value.trim();
        const password = $('#password').value;
        
        if (!email || !password) {
          showToast('Please enter both email and password', 'error');
          return;
        }

        await api.login(email, password);
        afterLogin();
      } catch (err) {
        showToast(err.message || 'Login failed', 'error');
        console.error('Login error:', err);
      }
    };
  }

  // Register button
  const registerBtn = $('#register');
  if (registerBtn) {
    registerBtn.onclick = async () => {
      try {
        const email = $('#email').value.trim();
        const password = $('#password').value;
        
        if (!email || !password) {
          showToast('Please enter both email and password', 'error');
          return;
        }
        
        if (password.length < 6) {
          showToast('Password must be at least 6 characters', 'error');
          return;
        }

        await api.register(email, password);
        showToast('Registration successful! Please login.', 'success');
      } catch (err) {
        showToast(err.message || 'Registration failed', 'error');
        console.error('Registration error:', err);
      }
    };
  }

  // Logout button
  const logoutBtn = $('#logoutBtn');
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      window.location.reload();
    };
  }
});

// Upload handlers
const uploadArea = $('#uploadArea');
const fileInput = $('#fileInput');

$('#uploadBtn').onclick = () => fileInput.click();
uploadArea.onclick = () => fileInput.click();

fileInput.onchange = async () => {
  const f = fileInput.files[0];
  if (!f) return;
  await uploadFile(f);
};

// Drag and drop
uploadArea.ondragover = (e) => {
  e.preventDefault();
  uploadArea.classList.add('drag-over');
};

uploadArea.ondragleave = () => {
  uploadArea.classList.remove('drag-over');
};

uploadArea.ondrop = async (e) => {
  e.preventDefault();
  uploadArea.classList.remove('drag-over');
  const f = e.dataTransfer.files[0];
  if (f) await uploadFile(f);
};

async function uploadFile(file) {
  const fd = new FormData();
  fd.append('file', file);
  const token = localStorage.getItem('token');
  try {
    const r = await fetch('/api/files/upload', { method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: fd });
    if (!r.ok) throw new Error('Upload failed');
    showToast(`${file.name} uploaded successfully!`);
    fileInput.value = '';
    await loadFiles();
  } catch (e) {
    showToast(e.message, 'error');
  }
}

// File list
async function loadFiles() {
  try {
    const files = await api.list();
    const fileList = $('#fileList');
    const emptyState = $('#emptyState');
    const fileCount = $('#fileCount');

    fileCount.textContent = `${files.length} file${files.length !== 1 ? 's' : ''}`;

    if (files.length === 0) {
      emptyState.classList.remove('hidden');
      fileList.innerHTML = '';
      return;
    }

    emptyState.classList.add('hidden');
    fileList.innerHTML = files.map(f => {
      const ext = f.original_name.split('.').pop().toUpperCase().slice(0, 4);
      const size = formatSize(f.size);
      const date = new Date(f.created_at).toLocaleDateString();
      return `
        <div class="file-item">
          <div class="file-info">
            <div class="file-icon">${ext}</div>
            <div class="file-details">
              <div class="file-name">${escapeHtml(f.original_name)}</div>
              <div class="file-meta">${size} • ${date}</div>
            </div>
          </div>
          <div class="file-actions">
            <button class="btn-icon btn-download" data-id="${f.id}" title="Download">↓</button>
            <button class="btn-icon btn-share" data-id="${f.id}" title="Share">🔗</button>
            <button class="btn-icon btn-delete" data-id="${f.id}" title="Delete">×</button>
          </div>
        </div>
      `;
    }).join('');

    $$('.btn-download').forEach(b => b.onclick = downloadFile);
    $$('.btn-share').forEach(b => b.onclick = shareFile);
    $$('.btn-delete').forEach(b => b.onclick = deleteFile);
  } catch (e) {
    showToast('Failed to load files', 'error');
  }
}

async function downloadFile(e) {
  const id = e.currentTarget.dataset.id;
  const token = localStorage.getItem('token');
  try {
    const r = await fetch('/api/files/download/' + id, { headers: { Authorization: 'Bearer ' + token } });
    if (!r.ok) throw new Error('Download failed');
    const blob = await r.blob();
    const disposition = r.headers.get('Content-Disposition') || '';
    const m = disposition.match(/filename="?([^";]+)"?/i);
    const name = m ? decodeURIComponent(m[1]) : 'download';
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('Download started');
  } catch (e) {
    showToast(e.message, 'error');
  }
}

async function deleteFile(e) {
  const id = e.currentTarget.dataset.id;
  if (!confirm('Delete this file permanently?')) return;
  const token = localStorage.getItem('token');
  try {
    const r = await fetch('/api/files/' + id, { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } });
    if (!r.ok) throw new Error('Delete failed');
    showToast('File deleted');
    await loadFiles();
  } catch (e) {
    showToast(e.message, 'error');
  }
}

async function shareFile(e) {
  const id = e.currentTarget.dataset.id;
  const token = localStorage.getItem('token');
  try {
    const r = await fetch('/api/files/share/' + id, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ ttl: 3600 })
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || 'Share failed');
    const shareUrl = location.origin + j.url;
    showModal('Share Link', `
      <div class="share-link-container">
        <div class="share-link-input">${escapeHtml(shareUrl)}</div>
        <div class="share-info">
          <span>⏱️</span>
          <span>Link expires in 1 hour</span>
        </div>
        <button class="btn-copy" onclick="copyShareLink('${shareUrl}')">Copy Link</button>
      </div>
    `);
  } catch (e) {
    showToast(e.message, 'error');
  }
}

// Make copyShareLink available globally
window.copyShareLink = (url) => {
  navigator.clipboard.writeText(url).then(() => {
    showToast('Link copied to clipboard!');
    closeModal();
  });
};

function afterLogin() {
  const email = localStorage.getItem('email');
  $('#userEmail').textContent = email;
  $('#auth').classList.add('hidden');
  $('#app').classList.remove('hidden');
  loadFiles();
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Auto-login if token exists
if (localStorage.getItem('token')) afterLogin();
