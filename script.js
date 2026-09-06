function showTime() {
	document.getElementById('currentTime').innerHTML = new Date().toUTCString();
}
showTime();
setInterval(function () {
	showTime();
}, 1000);
function addReference() {
  const container = document.getElementById('reference-container');
  const count = container.querySelectorAll('.reference-group').length + 1;

  const group = document.createElement('div');
  group.className = 'reference-group';

  const label = document.createElement('label');
  label.textContent = `${count}. REFERENCE `;

  const textarea = document.createElement('textarea');
  textarea.name = 'reference[]';
  textarea.rows = 2;
  textarea.cols = 40;

  // Create Remove Button
  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'btn-remove';
  removeBtn.textContent = '✕';
  removeBtn.onclick = function () {
    group.remove();
    renumberReferences(); // Re-indexes labels (1, 2, 3...) after removal
  };

  group.appendChild(label);
  group.appendChild(textarea);
  group.appendChild(removeBtn);
  container.appendChild(group);
}

// Re-sequences reference numbers after any row is deleted
function renumberReferences() {
  const groups = document.querySelectorAll('#reference-container .reference-group');
  groups.forEach((group, index) => {
    const label = group.querySelector('label');
    const textarea = group.querySelector('textarea');
    
    label.textContent = `${index + 1}. REFERENCE `;
    label.setAttribute('for', `reference_${index + 1}`);
    textarea.id = `reference_${index + 1}`;
  });
}

function addNarrative() {
  const container = document.getElementById('narrative-container');

  const wrapper = document.createElement('div');
  wrapper.className = 'narrative-group';

  const textarea = document.createElement('textarea');
  textarea.name = 'narrative[]';

  // Create Remove Button
  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'btn-remove';
  removeBtn.textContent = '✕';
  removeBtn.onclick = function () {
    wrapper.remove();
  };

  wrapper.appendChild(textarea);
  wrapper.appendChild(removeBtn);
  container.appendChild(wrapper);
}