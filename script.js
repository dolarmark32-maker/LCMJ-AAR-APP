const AAR_API_URL =
  'https://script.google.com/macros/s/AKfycbyrvr6bYzTOsysxO39A3aPgUZRzGdbMgSHsb3P0rV0Vj3-t55NDo-rr_Ywvxo7pNX8Tww/exec';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// ==========================================
// DYNAMIC FORM SECTIONS
// ==========================================

function addReference() {
  const container = $('#reference-container');
  if (!container) return;

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
    if (label) {
      label.textContent = `${number}. REFERENCE`;
      label.htmlFor = `reference_${number}`;
    }
    if (textarea) textarea.id = `reference_${number}`;
  });
}

function addNarrative() {
  const container = $('#narrative-container');
  if (!container) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'narrative-group';
  wrapper.innerHTML = `
    <textarea name="narrative[]" aria-label="Narrative"></textarea>
    <button type="button" class="btn-remove" aria-label="Remove narrative">✕</button>
  `;
  wrapper.querySelector('.btn-remove').addEventListener('click', () => {
    wrapper.remove();
    renumberNarratives();
  });
  container.appendChild(wrapper);
  renumberNarratives();
}

// Single merged renumberNarratives function
function renumberNarratives() {
  $$('#narrative-container .narrative-group').forEach((group, index) => {
    const textarea = $('textarea', group);
    if (textarea) {
      const letter = String.fromCharCode(97 + index);
      textarea.setAttribute('data-narrative-letter', letter);
      textarea.name = 'narrative[]'; // Preserved for FormData collection
    }
  });
}

// ==========================================
// PMAR TABLE MANAGEMENT
// ==========================================

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
  const body = $('#tableBody');
  if (body) body.appendChild(createEntryRow());
}

function deleteRow(row) {
  const rows = $$('#tableBody .entry-row');
  if (rows.length > 1) row.remove();
}

function submitReport() {
  const rows = $$('#tableBody .entry-row').map((row) => ({
    mfo: $('.mfo', row)?.value || '',
    actual: $('.actual', row)?.value || '',
    pdlBenefitted: $('.PDL-benefitted', row)?.value || '',
    personnelBenefitted: $('.Personnel-Benefitted', row)?.value || '',
    remarks: $('.remarks', row)?.value.trim() || ''
  }));
  console.log('PMAR report:', rows);
  return rows;
}

// ==========================================
// AAR FILE UPLOAD & COMPRESSION
// ==========================================

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5 MB per original image
const MAX_IMAGE_WIDTH = 1600;
const JPEG_QUALITY = 0.80;

function setupFileInput(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;

  const status = document.createElement('small');
  status.className = 'file-status';
  status.setAttribute('aria-live', 'polite');

  const preview = document.createElement('div');
  preview.className = 'image-preview-container';

  input.insertAdjacentElement('afterend', status);
  input.insertAdjacentElement('afterend', preview);

  input.addEventListener('change', () => {
    preview.innerHTML = '';
    status.className = 'file-status';

    const files = [...input.files];

    if (files.length === 0) {
      status.textContent = 'No files selected';
      return;
    }

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        input.value = '';
        status.classList.add('file-error');
        status.textContent = `${file.name} is not a valid image.`;
        return;
      }

      if (file.size > MAX_UPLOAD_SIZE) {
        input.value = '';
        status.classList.add('file-error');
        status.textContent = `${file.name} is larger than 5 MB.`;
        return;
      }
    }

    status.classList.add('file-selected');
    status.textContent = `${files.length} image${files.length > 1 ? 's' : ''} selected`;

    files.forEach((file, index) => {
      createImagePreview(file, preview, index, input);
    });
  });
}

function createImagePreview(file, container, index, inputElement) {
  const wrapper = document.createElement('div');
  wrapper.className = 'image-preview';

  const image = document.createElement('img');
  image.alt = file.name;

  const info = document.createElement('div');
  info.className = 'image-preview-info';
  info.textContent = `${index + 1}. ${file.name}`;

  const size = document.createElement('small');
  size.textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB`;

  const removeButton = document.createElement('button');
  removeButton.type = 'button';
  removeButton.className = 'btn-remove-image';
  removeButton.textContent = '✕';

  removeButton.addEventListener('click', () => {
    removeFileFromInput(inputElement, index);
  });

  const reader = new FileReader();
  reader.onload = (event) => {
    image.src = event.target.result;
  };
  reader.readAsDataURL(file);

  wrapper.appendChild(image);
  wrapper.appendChild(info);
  wrapper.appendChild(size);
  wrapper.appendChild(removeButton);
  container.appendChild(wrapper);
}

function removeFileFromInput(input, index) {
  if (!input || !input.files) return;

  const files = [...input.files];
  files.splice(index, 1);

  const dataTransfer = new DataTransfer();
  files.forEach((file) => dataTransfer.items.add(file));
  input.files = dataTransfer.files;

  input.dispatchEvent(new Event('change'));
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > MAX_IMAGE_WIDTH) {
          const ratio = MAX_IMAGE_WIDTH / width;
          width = MAX_IMAGE_WIDTH;
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert directly to Base64 string for API payload
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
      };
      img.onerror = () => reject(new Error(`Unable to read ${file.name}`));
      img.src = event.target.result;
    };
    reader.onerror = () => reject(new Error(`Unable to read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

async function processFileInputImages(inputId) {
  const input = document.getElementById(inputId);
  if (!input || !input.files.length) return [];
  const files = [...input.files];
  return Promise.all(files.map((file) => compressImage(file)));
}

// ==========================================
// COLLECT AAR DATA & SUBMIT
// ==========================================

async function createDoc() {
  const form = $('#activityReport');
  if (!form) return;

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const button = $('#generateReportBtn');
  if (button) {
    button.disabled = true;
    button.textContent = 'GENERATING REPORT...';
  }

  try {
    const formData = new FormData(form);

    // Compress & convert selected images to Base64
    const [pictures, attendance] = await Promise.all([
      processFileInputImages('documentations'),
      processFileInputImages('attendance')
    ]);

    const report = {
      subject: formData.get('subject') || '',
      date: formData.get('date') || '',
      references: formData.getAll('reference[]'),
      purpose: formData.get('purpose') || '',
      placesCovered: formData.get('places_covered') || '',
      datesCovered: formData.get('dates_covered') || '',
      participants: formData.get('participants') || '',
      narratives: formData.getAll('narrative[]'),
      issuesConcerns: formData.get('issues_concerns') || '',
      pictures,
      attendance
    };

    console.log('Sending AAR:', report);

    const response = await fetch(AAR_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(report)
    });

    if (!response.ok) {
      throw new Error(`Server returned status code ${response.status}`);
    }

    const result = await response.json();
    console.log('Apps Script response:', result);

    if (!result.success) {
      throw new Error(result.error || 'Unable to generate the report.');
    }

    alert('After Activity Report generated successfully!');

    if (result.documentUrl) {
      window.open(result.documentUrl, '_blank');
    }
  } catch (error) {
    console.error('AAR generation error:', error);
    alert('Unable to generate the After Activity Report.\n\n' + error.message);
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = 'GENERATE AFTER ACTIVITY REPORT';
    }
  }
}

// ==========================================
// EVENT LISTENERS & INITIALIZATION
// ==========================================

document.addEventListener('focusin', ({ target }) => {
  if (target.matches('[data-default]') && target.value === target.dataset.default) {
    target.value = '';
  }
});

document.addEventListener('input', ({ target }) => {
  if (target.matches('input[inputmode="numeric"]')) {
    target.value = target.value.replace(/\D/g, '');
  }
});

document.addEventListener('focusout', ({ target }) => {
  if (target.matches('[data-default]') && !target.value.trim()) {
    target.value = target.dataset.default;
  }
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

  const activityReportForm = $('#activityReport');
  if (activityReportForm) {
    activityReportForm.addEventListener('submit', (event) => {
      event.preventDefault();
      createDoc();
    });
  }

  const initialDeleteBtn = $('#tableBody .delete-row');
  if (initialDeleteBtn) {
    initialDeleteBtn.addEventListener('click', ({ currentTarget }) => {
      deleteRow(currentTarget.closest('.entry-row'));
    });
  }

  renumberReferences();
  renumberNarratives();

  setupFileInput('documentations');
  setupFileInput('attendance');
});