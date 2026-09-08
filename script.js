const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function addReference() {
  const container = $('#reference-container');
  const group = document.createElement('div');
  group.className = 'reference-group';
  group.innerHTML = `
    <label></label>
    <textarea name="reference[]" rows="2" cols="40"></textarea>
    <button type="button" class="btn-remove" aria-label="Remove reference">✕</button>
  `;
  group.querySelector('.btn-remove').addEventListener('click', () => {
    group.remove();
    renumberReferences();
  });
  container.appendChild(group);
  renumberReferences();
}

function renumberReferences() {
  $$('#reference-container .reference-group').forEach((group, index) => {
    const number = index + 1;
    const label = $('label', group);
    const textarea = $('textarea', group);
    label.textContent = `${number}. REFERENCE`;
    label.htmlFor = `reference_${number}`;
    textarea.id = `reference_${number}`;
  });
}

function addNarrative() {
  const container = $('#narrative-container');
  const wrapper = document.createElement('div');
  wrapper.className = 'narrative-group';
  wrapper.innerHTML = `
    <textarea name="narrative[]" aria-label="Narrative"></textarea>
    <button type="button" class="btn-remove" aria-label="Remove narrative">✕</button>
  `;
  wrapper.querySelector('.btn-remove').addEventListener('click', () => wrapper.remove());
  container.appendChild(wrapper);
}

function createEntryRow() {
  const row = document.createElement('tr');
  row.className = 'entry-row';
  row.innerHTML = `
    <td><select class="mfo" aria-label="Major final output"><option value="">Loading...</option></select></td>
    ${['actual', 'PDL-benefitted', 'Personnel-Benefitted'].map((className) => `
      <td><input type="text" inputmode="numeric" class="${className}" value="N/A" data-default="N/A"></td>
    `).join('')}
    <td><textarea class="remarks" placeholder="Evidenciary Requirements"></textarea></td>
    <td><button type="button" class="delete-row" aria-label="Delete row">🗑</button></td>
  `;
  row.querySelector('.delete-row').addEventListener('click', () => deleteRow(row));
  return row;
}

function addRow() {
  $('#tableBody').appendChild(createEntryRow());
}

function deleteRow(row) {
  const rows = $$('#tableBody .entry-row');
  if (rows.length > 1) row.remove();
}

function submitReport() {
  const rows = $$('#tableBody .entry-row').map((row) => ({
    mfo: $('.mfo', row).value,
    actual: $('.actual', row).value,
    pdlBenefitted: $('.PDL-benefitted', row).value,
    personnelBenefitted: $('.Personnel-Benefitted', row).value,
    remarks: $('.remarks', row).value.trim()
  }));
  console.log('PMAR report:', rows);
}

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

function setupFileInput(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;

  const status = document.createElement('small');
  status.className = 'file-status';
  status.setAttribute('aria-live', 'polite');
  input.insertAdjacentElement('afterend', status);

  input.addEventListener('change', () => {
    const [file] = input.files;
    status.className = 'file-status';

    if (!file) {
      status.textContent = 'No file selected';
      return;
    }

    if (!file.type.startsWith('image/')) {
      input.value = '';
      status.classList.add('file-error');
      status.textContent = 'Please select a PNG, JPEG, or WebP image.';
      return;
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      input.value = '';
      status.classList.add('file-error');
      status.textContent = 'The image must be 5 MB or smaller.';
      return;
    }

    status.classList.add('file-selected');
    status.textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
  });
}

function createDoc() {
  const form = $('#activityReport');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const formData = new FormData(form);
  const report = Object.fromEntries(formData.entries());
  report.documentations = $('#documentations')?.files[0] || null;
  report.attendance = $('#attendance')?.files[0] || null;

  console.log('AAR report:', report);
}



document.addEventListener('focusin', ({ target }) => {
  if (target.matches('[data-default]') && target.value === target.dataset.default) target.value = '';
});

document.addEventListener('input', ({ target }) => {
  if (target.matches('input[inputmode="numeric"]')) target.value = target.value.replace(/\D/g, '');
});

document.addEventListener('focusout', ({ target }) => {
  if (target.matches('[data-default]') && !target.value.trim()) target.value = target.dataset.default;
});

function showPage(pageId) {
  $$('.pageView, #pmar_container, #aar_container, .placeholder-page').forEach((page) => {
    page.hidden = page.id !== pageId;
  });

  $$('.nav-link').forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === `#${pageId}`);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  $$('.nav-link').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const pageId = link.getAttribute('href').slice(1);
      showPage(pageId);
      history.replaceState(null, '', `#${pageId}`);
    });
  });

  const initialPage = window.location.hash.slice(1) || 'home_page';
  showPage(document.getElementById(initialPage) ? initialPage : 'home_page');

  $('#activityReport').addEventListener('submit', (event) => {
    event.preventDefault();
    createDoc();
  });

  $('#tableBody .delete-row').addEventListener('click', ({ currentTarget }) => {
    deleteRow(currentTarget.closest('.entry-row'));
  });

  renumberReferences();
  setupFileInput('documentations');
  setupFileInput('attendance');
});