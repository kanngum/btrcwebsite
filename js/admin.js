/* ================================================
   BTRC - Admin Dashboard JavaScript
   Supports both the Node/Express API backend and
   a localStorage fallback for static hosting.
   ================================================ */

(function() {
    const config = window.BTRC_ADMIN_CONFIG || { PIN: 'BTRC1234', API_BASE: '/api' };
    const API = config.API_BASE;

let apiMode = false;
    let currentTab = 'projects';
    let editingId = null;
    let editingType = null;
    let authToken = null;

    // Field schemas per content type
    const SCHEMAS = {
        projects: {
            label: 'Project',
            fields: [
                { name: 'name', label: 'Project Name', type: 'text', required: true },
                { name: 'category', label: 'Category', type: 'select', required: true, options: [
                    { value: 'ai', label: 'Artificial Intelligence' },
                    { value: 'cybersecurity', label: 'Cybersecurity' },
                    { value: 'iot', label: 'IoT' },
                    { value: 'software', label: 'Software Engineering' },
                    { value: 'data', label: 'Data Science' }
                ]},
                { name: 'categoryLabel', label: 'Category Label (display)', type: 'text', required: false },
                { name: 'image', label: 'Image Path (e.g. images/xxx.jpg)', type: 'text', required: false },
                { name: 'description', label: 'Short Description', type: 'textarea', required: true },
                { name: 'detailsLink', label: 'Details/Project Page Link (optional)', type: 'text', required: false }
            ]
        },
        programs: {
            label: 'Program',
            fields: [
                { name: 'name', label: 'Program Name', type: 'text', required: true },
                { name: 'image', label: 'Image Path (e.g. images/xxx.jpg)', type: 'text', required: false },
                { name: 'description', label: 'Short Description', type: 'textarea', required: true },
                { name: 'applyLink', label: 'Application Page Link (optional)', type: 'text', required: false }
            ]
        },
        news: {
            label: 'News Post',
            fields: [
                { name: 'title', label: 'Title', type: 'text', required: true },
                { name: 'category', label: 'Category', type: 'text', required: true },
                { name: 'date', label: 'Date (YYYY-MM-DD)', type: 'date', required: true },
                { name: 'author', label: 'Author', type: 'text', required: false },
                { name: 'image', label: 'Image Path (e.g. images/xxx.jpg)', type: 'text', required: false },
                { name: 'summary', label: 'Summary', type: 'textarea', required: true },
                { name: 'link', label: 'Read More Link (optional)', type: 'text', required: false }
            ]
        }
    };

    // DOM refs
    const loginScreen = document.getElementById('login-screen');
    const dashboard = document.getElementById('dashboard');
    const loginForm = document.getElementById('login-form');
    const pinInput = document.getElementById('pin-input');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');
    const tabTitle = document.getElementById('tab-title');
    const addBtn = document.getElementById('add-btn');
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalClose = document.getElementById('modal-close');
    const modalCancel = document.getElementById('modal-cancel');
    const itemForm = document.getElementById('item-form');
    const formFields = document.getElementById('form-fields');
    const toast = document.getElementById('toast');

    /* ---------- Data access ---------- */
    async function apiAvailable() {
        try {
            const res = await fetch(API + '/health');
            return res.ok;
        } catch (e) {
            return false;
        }
    }

    async function fetchAll() {
        if (apiMode) {
            const res = await fetch(API + '/data');
            return await res.json();
        }
        // localStorage fallback - seed from BTRC_DATA
        let data = localStorage.getItem('btrc_admin_data');
        if (data) {
            return JSON.parse(data);
        }
        data = (window.BTRC_DATA || { projects: [], programs: [], news: [] });
        localStorage.setItem('btrc_admin_data', JSON.stringify(data));
        return data;
    }

function authHeaders() {
        const h = { 'Content-Type': 'application/json' };
        if (authToken) h['Authorization'] = 'Bearer ' + authToken;
        return h;
    }

    async function saveItem(type, item) {
        if (apiMode) {
            const method = item.id ? 'PUT' : 'POST';
            const url = item.id ? (API + '/' + type + '/' + item.id) : (API + '/' + type);
            const res = await fetch(url, {
                method,
                headers: authHeaders(),
                body: JSON.stringify(item)
            });
            return res.ok;
        }
        // localStorage fallback
        const data = await fetchAll();
        if (item.id) {
            const idx = data[type].findIndex(x => x.id === item.id);
            if (idx !== -1) data[type][idx] = item;
        } else {
            item.id = Date.now();
            data[type].push(item);
        }
        localStorage.setItem('btrc_admin_data', JSON.stringify(data));
        return true;
    }

    async function deleteItem(type, id) {
        if (apiMode) {
            const res = await fetch(API + '/' + type + '/' + id, {
                method: 'DELETE',
                headers: authHeaders()
            });
            return res.ok;
        }
        const data = await fetchAll();
        data[type] = data[type].filter(x => x.id !== id);
        localStorage.setItem('btrc_admin_data', JSON.stringify(data));
        return true;
    }

    /* ---------- UI rendering ---------- */
    function listEl(item, type) {
        const schema = SCHEMAS[type];
        const title = item.name || item.title || '';
        const desc = item.description || item.summary || '';
        const img = item.image ? '<img src="' + item.image + '" alt="">' : '<span>No image</span>';

        const div = document.createElement('div');
        div.className = 'admin-list-item';
        div.innerHTML = `
            <div class="admin-item-thumb">${img}</div>
            <div class="admin-item-info">
                <h4>${title}</h4>
                <p>${desc}</p>
            </div>
            <div class="admin-item-actions">
                <button class="btn btn-outline edit-btn">Edit</button>
                <button class="btn btn-secondary delete-btn">Delete</button>
            </div>
        `;

        div.querySelector('.edit-btn').addEventListener('click', () => openModal(type, item));
        div.querySelector('.delete-btn').addEventListener('click', () => confirmDelete(type, item));
        return div;
    }

    async function renderList() {
        const data = await fetchAll();
        const listId = currentTab + '-list';
        const container = document.getElementById(listId);
        if (!container) return;

        container.innerHTML = '';
        const items = data[currentTab] || [];
        if (items.length === 0) {
            container.innerHTML = '<p class="empty-state">No ' + SCHEMAS[currentTab].label.replace(' News Post', '') + 's yet. Click "+ Add New".</p>';
            return;
        }
        items.forEach(item => container.appendChild(listEl(item, currentTab)));
    }

    function switchTab(tab) {
        currentTab = tab;
        document.querySelectorAll('.admin-nav-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.toggle('active', t.id === 'tab-' + tab));
        tabTitle.textContent = SCHEMAS[tab].label.replace(' News Post', '') + 's';
        renderList();
    }

    /* ---------- Modal ---------- */
    function buildFormFields(type) {
        formFields.innerHTML = '';
        SCHEMAS[type].fields.forEach(f => {
            const group = document.createElement('div');
            group.className = 'form-group';
            let inputHtml = '';
            if (f.type === 'textarea') {
                inputHtml = `<textarea name="${f.name}" ${f.required ? 'required' : ''}></textarea>`;
            } else if (f.type === 'select') {
                let opts = f.options.map(o => `<option value="${o.value}">${o.label}</option>`).join('');
                inputHtml = `<select name="${f.name}" ${f.required ? 'required' : ''}>${opts}</select>`;
            } else {
                inputHtml = `<input type="${f.type}" name="${f.name}" ${f.required ? 'required' : ''}>`;
            }
            group.innerHTML = `<label>${f.label}${f.required ? ' *' : ''}</label>${inputHtml}`;
            formFields.appendChild(group);
        });
    }

    function openModal(type, item) {
        editingType = type;
        editingId = item ? item.id : null;
        modalTitle.textContent = (item ? 'Edit ' : 'Add ') + SCHEMAS[type].label;
        buildFormFields(type);

        if (item) {
            Object.keys(item).forEach(k => {
                const input = formFields.querySelector(`[name="${k}"]`);
                if (input) input.value = item[k] || '';
            });
        }
        modal.style.display = 'flex';
    }

    function closeModal() {
        modal.style.display = 'none';
        editingId = null;
        editingType = null;
        itemForm.reset();
    }

    /* ---------- Login / Logout ---------- */
    async function doLogin(pin) {
        if (apiMode) {
            // Authenticate against the API to get a write token
            try {
                const res = await fetch(API + '/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pin })
                });
                if (!res.ok) {
                    loginError.textContent = 'Incorrect PIN. Please try again.';
                    return;
                }
                const data = await res.json();
                authToken = data.token;
            } catch (e) {
                loginError.textContent = 'Server error. Please check the backend.';
                return;
            }
        } else if (pin !== config.PIN) {
            loginError.textContent = 'Incorrect PIN. Please try again.';
            return;
        }

loginError.textContent = '';
        loginScreen.style.display = 'none';
        dashboard.style.display = 'flex';
        sessionStorage.setItem('btrc_admin_auth', '1');
        if (authToken) sessionStorage.setItem('btrc_admin_token', authToken);
        renderList();
    }

    function doLogout() {
        sessionStorage.removeItem('btrc_admin_auth');
        sessionStorage.removeItem('btrc_admin_token');
        authToken = null;
        dashboard.style.display = 'none';
        loginScreen.style.display = 'flex';
        pinInput.value = '';
    }

    /* ---------- Toast ---------- */
    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }

    /* ---------- Confirm delete ---------- */
    function confirmDelete(type, item) {
        if (confirm('Delete this ' + SCHEMAS[type].label + '?')) {
            deleteItem(type, item.id).then(() => {
                showToast('Deleted successfully');
                renderList();
            });
        }
    }

    /* ---------- Event wiring ---------- */
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        doLogin(pinInput.value.trim());
    });

    logoutBtn.addEventListener('click', doLogout);

    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    addBtn.addEventListener('click', () => openModal(currentTab, null));

    modalClose.addEventListener('click', closeModal);
    modalCancel.addEventListener('click', closeModal);
    modal.addEventListener('click', e => {
        if (e.target === modal) closeModal();
    });

    itemForm.addEventListener('submit', async e => {
        e.preventDefault();
        const data = await fetchAll();
        const existing = editingId ? data[editingType].find(x => x.id === editingId) : null;
        const item = existing ? Object.assign({}, existing) : {};

        SCHEMAS[editingType].fields.forEach(f => {
            const input = formFields.querySelector(`[name="${f.name}"]`);
            item[f.name] = input ? input.value.trim() : '';
        });

        await saveItem(editingType, item);
        closeModal();
        showToast('Saved successfully');
        renderList();
    });

    /* ---------- Init ---------- */
    async function init() {
        apiMode = await apiAvailable();
        authToken = sessionStorage.getItem('btrc_admin_token') || null;
        if (sessionStorage.getItem('btrc_admin_auth') === '1') {
            loginScreen.style.display = 'none';
            dashboard.style.display = 'flex';
            renderList();
        }
    }

    init();
})();
