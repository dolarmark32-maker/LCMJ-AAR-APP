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

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5 MB per original image
const MAX_IMAGE_WIDTH = 1600;
const JPEG_QUALITY = 0.80;


// ==========================================
// FILE INPUT SETUP
// ==========================================

// ------------------------------------------
// SETUP FILE INPUT
// ------------------------------------------

function setupFileInput(inputId) {

  const input = document.getElementById(inputId);

  if (!input) return;

  // Create status message
  const status = document.createElement('small');
  status.className = 'file-status';
  status.setAttribute('aria-live', 'polite');

  input.insertAdjacentElement('afterend', status);


  // Create preview container
  const preview = document.createElement('div');
  preview.className = 'image-preview-container';

  input.insertAdjacentElement('afterend', preview);


  input.addEventListener('change', () => {

    preview.innerHTML = '';

    status.className = 'file-status';


    const files = [...input.files];


    if (files.length === 0) {

      status.textContent = 'No files selected';

      return;
    }


    // ------------------------------------------
    // Validate all selected images
    // ------------------------------------------

    for (const file of files) {

      if (!file.type.startsWith('image/')) {

        input.value = '';

        status.classList.add('file-error');

        status.textContent =
          `${file.name} is not a valid image.`;

        return;
      }


      if (file.size > MAX_UPLOAD_SIZE) {

        input.value = '';

        status.classList.add('file-error');

        status.textContent =
          `${file.name} is larger than 5 MB.`;

        return;
      }

    }


    // ------------------------------------------
    // Display selected files
    // ------------------------------------------

    status.classList.add('file-selected');

    status.textContent =
      `${files.length} image${files.length > 1 ? 's' : ''} selected`;


    files.forEach((file, index) => {

      createImagePreview(
        file,
        preview,
        index
      );

    });

  });
}


// ------------------------------------------
// CREATE IMAGE PREVIEW
// ------------------------------------------

function createImagePreview(file, container, index) {

  const wrapper = document.createElement('div');

  wrapper.className = 'image-preview';


  const image = document.createElement('img');

  image.alt = file.name;


  const info = document.createElement('div');

  info.className = 'image-preview-info';

  info.textContent =
    `${index + 1}. ${file.name}`;


  const size = document.createElement('small');

  size.textContent =
    `${(file.size / 1024 / 1024).toFixed(2)} MB`;


  const removeButton = document.createElement('button');

  removeButton.type = 'button';

  removeButton.className = 'btn-remove-image';

  removeButton.textContent = '✕';


  removeButton.addEventListener('click', () => {

    wrapper.remove();

    removeFileFromInput(
      document.querySelector(
        `#${CSS.escape(container.previousElementSibling.id)}`
      ),
      index
    );

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


// ------------------------------------------
// REMOVE FILE
// ------------------------------------------

function removeFileFromInput(input, index) {

  if (!input || !input.files) return;


  const files =
    [...input.files];


  files.splice(index, 1);


  const dataTransfer =
    new DataTransfer();


  files.forEach(file => {

    dataTransfer.items.add(file);

  });


  input.files =
    dataTransfer.files;


  // Trigger change so previews/status update
  input.dispatchEvent(
    new Event('change')
  );

}


// ------------------------------------------
// COMPRESS IMAGE
// ------------------------------------------

function compressImage(file) {

  return new Promise((resolve, reject) => {

    const reader = new FileReader();


    reader.onload = (event) => {

      const img = new Image();


      img.onload = () => {

        let width = img.width;
        let height = img.height;


        // Resize large images
        if (width > MAX_IMAGE_WIDTH) {

          const ratio =
            MAX_IMAGE_WIDTH / width;

          width =
            MAX_IMAGE_WIDTH;

          height =
            Math.round(height * ratio);

        }


        const canvas =
          document.createElement('canvas');

        canvas.width = width;
        canvas.height = height;


        const ctx =
          canvas.getContext('2d');


        ctx.drawImage(
          img,
          0,
          0,
          width,
          height
        );


        canvas.toBlob(
          blob => {

            if (!blob) {

              reject(
                new Error(
                  'Unable to compress image.'
                )
              );

              return;
            }


            resolve(blob);

          },
          'image/jpeg',
          JPEG_QUALITY
        );

      };


      img.onerror = () => {

        reject(
          new Error(
            `Unable to read ${file.name}`
          )
        );

      };


      img.src =
        event.target.result;

    };


    reader.onerror = () => {

      reject(
        new Error(
          `Unable to read ${file.name}`
        )
      );

    };


    reader.readAsDataURL(file);

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
renumberNarratives();

setupFileInput('documentations');
setupFileInput('attendance');
});