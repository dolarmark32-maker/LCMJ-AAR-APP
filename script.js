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

function renumberNarratives() {
  $$('#narrative-container .narrative-group').forEach((wrapper, index) => {
    const number = index + 1;
    const textarea = $('textarea', wrapper);
    textarea.name = `narrative_${number}`;
  });
}

function addNarrative() {

  const container = $('#narrative-container');

  const wrapper = document.createElement('div');

  wrapper.className = 'narrative-group';


  wrapper.innerHTML = `
    <textarea
      name="narrative[]"
      aria-label="Narrative"
    ></textarea>

    <button
      type="button"
      class="btn-remove"
      aria-label="Remove narrative"
    >
      ✕
    </button>
  `;


  wrapper
    .querySelector('.btn-remove')
    .addEventListener('click', () => {

      wrapper.remove();

      renumberNarratives();

    });


  container.appendChild(wrapper);

  renumberNarratives();
}

function renumberNarratives() {

  const narratives =
    $$('#narrative-container .narrative-group');


  narratives.forEach((group, index) => {

    const textarea =
      $('textarea', group);

    const letter =
      String.fromCharCode(97 + index);

    textarea.setAttribute(
      'data-narrative-letter',
      letter
    );

  });

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

// ==========================================
// AAR FILE UPLOAD SETTINGS
// ==========================================

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5 MB per image


// ==========================================
// FILE INPUT SETUP
// ==========================================

function setupFileInput(inputId) {

  const input = document.getElementById(inputId);

  if (!input) return;

  const status = document.createElement('small');

  status.className = 'file-status';

  status.setAttribute('aria-live', 'polite');

  input.insertAdjacentElement('afterend', status);


  input.addEventListener('change', () => {

    const files = [...input.files];

    status.className = 'file-status';


    // No files selected
    if (files.length === 0) {

      status.textContent = 'No files selected';

      return;
    }


    // Check every selected file
    for (const file of files) {

      // Check file type
      if (!file.type.startsWith('image/')) {

        input.value = '';

        status.classList.add('file-error');

        status.textContent =
          `${file.name} is not a valid image. Please use PNG, JPEG, or WebP.`;

        return;
      }


      // Check file size
      if (file.size > MAX_UPLOAD_SIZE) {

        input.value = '';

        status.classList.add('file-error');

        status.textContent =
          `${file.name} is larger than 5 MB.`;

        return;
      }

    }


    // Everything is valid
    status.classList.add('file-selected');

    status.textContent =
      `${files.length} image${files.length > 1 ? 's' : ''} selected`;

  });
}


// ==========================================
// COLLECT AAR DATA
// ==========================================

function createDoc() {

  const form = $('#activityReport');

  // Validate required fields
  if (!form.checkValidity()) {

    form.reportValidity();

    return;
  }


  // ------------------------------------------
  // BASIC FORM DATA
  // ------------------------------------------

  const subject =
    $('#subject').value.trim();

  const date =
    $('#date').value;

  const purpose =
    $('#purpose').value.trim();

  const placesCovered =
    $('#places_covered').value.trim();

  const datesCovered =
    $('#dates_covered').value.trim();

  const participants =
    $('#participants').value.trim();

  const issuesConcerns =
    $('#issues_concerns').value.trim();


  // ------------------------------------------
  // REFERENCES
  // ------------------------------------------

  const references = $$('#reference-container textarea')
    .map(textarea => textarea.value.trim())
    .filter(value => value !== '');


  // ------------------------------------------
  // NARRATIVES
  // ------------------------------------------

  const narratives = $$('#narrative-container textarea')
    .map(textarea => textarea.value.trim())
    .filter(value => value !== '');


  // ------------------------------------------
  // DOCUMENTATION PICTURES
  // ------------------------------------------

  const documentationFiles =
    [...($('#documentations')?.files || [])];


  // ------------------------------------------
  // ATTENDANCE PICTURES
  // ------------------------------------------

  const attendanceFiles =
    [...($('#attendance')?.files || [])];


  // ------------------------------------------
  // PREPARE REPORT OBJECT
  // ------------------------------------------

  const report = {

    subject: subject,

    date: date,

    references: references,

    purpose: purpose,

    placesCovered: placesCovered,

    datesCovered: datesCovered,

    participants: participants,

    narratives: narratives,

    issuesConcerns: issuesConcerns,

    documentationFiles: documentationFiles,

    attendanceFiles: attendanceFiles

  };


  console.log('AAR report:', report);

  console.log(
    'Documentation pictures:',
    documentationFiles.length
  );

  console.log(
    'Attendance pictures:',
    attendanceFiles.length
  );

  console.log(
    'Narratives:',
    narratives.length
  );

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