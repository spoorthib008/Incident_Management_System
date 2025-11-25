// client/public/app.js

const API_BASE = 'http://localhost:3000/api/incidents';

// ---------- DOM REFERENCES ----------
const createModal = document.getElementById('createModal');
const updateModal = document.getElementById('updateModal');

const openCreateModalBtn = document.getElementById('openCreateModalBtn');
const closeCreateModalBtn = document.getElementById('closeCreateModalBtn');
const closeUpdateModalBtn = document.getElementById('closeUpdateModalBtn');

const createIncidentForm = document.getElementById('createIncidentForm');
const updateIncidentForm = document.getElementById('updateIncidentForm');

const createMessage = document.getElementById('createMessage');
const updateMessage = document.getElementById('updateMessage');

const incidentsTableBody = document.querySelector('#incidentsTable tbody');

const statusFilter = document.getElementById('statusFilter');
const loadingIndicator = document.getElementById('loadingIndicator');
const globalMessage = document.getElementById('globalMessage');

// ---------- MODAL HELPERS ----------
function openModal(modal) {
  if (modal === createModal) createMessage.textContent = '';
  if (modal === updateModal) updateMessage.textContent = '';
  modal.style.display = 'flex';
}

function closeModal(modal) {
  modal.style.display = 'none';
}

// open / close events
openCreateModalBtn.addEventListener('click', () => openModal(createModal));
closeCreateModalBtn.addEventListener('click', () => closeModal(createModal));
closeUpdateModalBtn.addEventListener('click', () => closeModal(updateModal));

window.addEventListener('click', (e) => {
  if (e.target === createModal) closeModal(createModal);
  if (e.target === updateModal) closeModal(updateModal);
});

// ---------- LOADING STATE ----------
function setLoading(isLoading) {
  if (loadingIndicator) {
    loadingIndicator.style.display = isLoading ? 'inline-block' : 'none';
  }

  // disable main button
  if (openCreateModalBtn) openCreateModalBtn.disabled = isLoading;

  // disable form submit buttons
  const createSubmit = createIncidentForm?.querySelector('button[type="submit"]');
  const updateSubmit = updateIncidentForm?.querySelector('button[type="submit"]');
  if (createSubmit) createSubmit.disabled = isLoading;
  if (updateSubmit) updateSubmit.disabled = isLoading;

  // disable table action buttons
  document.querySelectorAll('.edit-btn, .close-btn').forEach((btn) => {
    const status = btn.dataset.status;
    btn.disabled = isLoading || status === 'closed';
  });
}

// ---------- API SERVICE FUNCTIONS ----------
async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

async function createIncident(data) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err.message || 'Failed to create incident');
  }

  return res.json();
}

async function getAllIncidents(status) {
  const url = status ? `${API_BASE}?status=${status}` : API_BASE;
  const res = await fetch(url);

  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err.message || 'Failed to fetch incidents');
  }

  return res.json();
}

async function getIncidentById(id) {
  const res = await fetch(`${API_BASE}/${id}`);

  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err.message || 'Failed to fetch incident');
  }

  return res.json();
}

async function updateIncident(id, data) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err.message || 'Failed to update incident');
  }

  return res.json();
}

async function closeIncident(id) {
  const res = await fetch(`${API_BASE}/${id}/close`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err.message || 'Failed to close incident');
  }

  return res.json();
}

// ---------- FORM HANDLERS ----------

// CREATE INCIDENT
createIncidentForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  createMessage.textContent = '';
  globalMessage.textContent = '';

  const formData = new FormData(createIncidentForm);
  const data = Object.fromEntries(formData.entries());

  // validation
  if (!data.type.trim()) {
    createMessage.textContent = 'Type is required.';
    return;
  }
  if (!data.incidentStartDate) {
    createMessage.textContent = 'Incident Start Date is required.';
    return;
  }
  if (!data.description.trim()) {
    createMessage.textContent = 'Description is required.';
    return;
  }
  if (data.incidentEndDate && data.incidentEndDate < data.incidentStartDate) {
    createMessage.textContent = 'End date cannot be before start date.';
    return;
  }

  try {
    setLoading(true);
    await createIncident(data);
    createMessage.textContent = 'Incident created successfully!';
    createIncidentForm.reset();
    await loadIncidents();
  } catch (err) {
    createMessage.textContent = err.message;
  } finally {
    setLoading(false);
  }
});

// UPDATE INCIDENT
updateIncidentForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  updateMessage.textContent = '';
  globalMessage.textContent = '';

  const formData = new FormData(updateIncidentForm);
  const data = Object.fromEntries(formData.entries());
  const id = data.id;
  delete data.id;

  // validation
  if (!data.type.trim()) {
    updateMessage.textContent = 'Type is required.';
    return;
  }
  if (!data.incidentStartDate) {
    updateMessage.textContent = 'Incident Start Date is required.';
    return;
  }
  if (!data.description.trim()) {
    updateMessage.textContent = 'Description is required.';
    return;
  }
  if (data.incidentEndDate && data.incidentEndDate < data.incidentStartDate) {
    updateMessage.textContent = 'End date cannot be before start date.';
    return;
  }

  try {
    setLoading(true);
    await updateIncident(id, data);
    updateMessage.textContent = 'Incident updated successfully!';
    await loadIncidents();
    setTimeout(() => {
      updateMessage.textContent = '';
      closeModal(updateModal);
    }, 700);
  } catch (err) {
    updateMessage.textContent = err.message;
  } finally {
    setLoading(false);
  }
});

// ---------- RENDERING & FILTER ----------

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString();
}

function renderIncidents(incidents) {
  incidentsTableBody.innerHTML = '';

  incidents.forEach((incident) => {
    const tr = document.createElement('tr');
    const statusClass = incident.status === 'open' ? 'status-open' : 'status-closed';
    const isClosed = incident.status === 'closed';

    tr.innerHTML = `
      <td>${incident.type}</td>
      <td>${formatDate(incident.incidentStartDate)}</td>
      <td>${formatDate(incident.incidentEndDate)}</td>
      <td>${incident.description}</td>
      <td>${incident.remarks || ''}</td>
      <td class="${statusClass}">${incident.status}</td>
      <td>
        <button class="edit-btn" data-id="${incident._id}" data-status="${incident.status}" ${isClosed ? 'disabled' : ''}>Edit</button>
        <button class="close-btn" data-id="${incident._id}" data-status="${incident.status}" ${isClosed ? 'disabled' : ''}>Close</button>
      </td>
    `;

    incidentsTableBody.appendChild(tr);
  });

  // re-apply disabled logic after re-render
  setLoading(false);
}

// load table using current filter
async function loadIncidents() {
  globalMessage.textContent = '';

  try {
    setLoading(true);
    const status = statusFilter ? statusFilter.value : '';
    const incidents = await getAllIncidents(status);
    renderIncidents(incidents);
  } catch (err) {
    console.error(err);
    globalMessage.textContent = err.message || 'Failed to load incidents.';
  } finally {
    setLoading(false);
  }
}

// filter dropdown → reload
if (statusFilter) {
  statusFilter.addEventListener('change', () => {
    loadIncidents();
  });
}

// ---------- TABLE BUTTONS (EDIT / CLOSE) ----------

incidentsTableBody.addEventListener('click', (e) => {
  const btn = e.target;
  const id = btn.dataset.id;
  if (!id) return;

  if (btn.classList.contains('edit-btn')) {
    openUpdateModal(id);
  } else if (btn.classList.contains('close-btn')) {
    handleCloseIncident(id, btn);
  }
});

async function openUpdateModal(id) {
  try {
    setLoading(true);
    const incident = await getIncidentById(id);

    const form = updateIncidentForm;
    form.elements['id'].value = incident._id;
    form.elements['type'].value = incident.type;
    form.elements['incidentStartDate'].value = incident.incidentStartDate
      ? incident.incidentStartDate.substring(0, 10)
      : '';
    form.elements['incidentEndDate'].value = incident.incidentEndDate
      ? incident.incidentEndDate.substring(0, 10)
      : '';
    form.elements['description'].value = incident.description;
    form.elements['remarks'].value = incident.remarks || '';
    form.elements['status'].value = incident.status;

    openModal(updateModal);
  } catch (err) {
    alert(err.message || 'Failed to load incident for update');
  } finally {
    setLoading(false);
  }
}

// enhanced close: confirm + instant UI + visual feedback
async function handleCloseIncident(id, button) {
  globalMessage.textContent = '';

  const confirmed = confirm('Are you sure you want to close this incident?');
  if (!confirmed) return;

  const previousText = button.textContent;
  button.textContent = 'Closing...';
  button.disabled = true;

  try {
    setLoading(true);
    await closeIncident(id);
    globalMessage.textContent = 'Incident closed successfully.';
    await loadIncidents();
  } catch (err) {
    globalMessage.textContent = err.message || 'Failed to close incident.';
    button.textContent = previousText;
    button.disabled = false;
  } finally {
    setLoading(false);
  }
}

// ---------- INITIAL LOAD ----------
document.addEventListener('DOMContentLoaded', () => {
  loadIncidents();
});
