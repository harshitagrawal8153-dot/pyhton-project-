/**
 * Screen 5: Profile (Basic)
 * Displays a peer's basic profile or lets the current user update their own profile.
 */
import { getStudentById, store, updateCurrentUserProfile } from '../state/store.js';
import { escapeHtml } from '../utils/dom.js';

const COMMUNICATION_OPTIONS = [
  'In-app chat first',
  'WhatsApp after group forms',
  'Quick call before pickup',
];

export function renderProfile(container, { navigate }) {
  const student = getStudentById(store.viewingStudentId) || store.currentUser;
  const isSelf = student.id === store.currentUser.id;
  const showBackToGroup = !isSelf || store.previousScreen === 'group';

  if (!isSelf) {
    const tagsHtml = (student.preferences || [])
      .map((pref) => `<span class="tag">${escapeHtml(pref)}</span>`)
      .join('');

    container.innerHTML = `
      <div class="container container-narrow">
        <div class="back-row">
          <button type="button" class="btn btn-ghost" id="profile-back-btn">← Back to group</button>
        </div>

        <section class="card" aria-labelledby="profile-name">
          <div class="profile-header">
            <span class="avatar avatar-lg" aria-hidden="true">${escapeHtml(student.initials)}</span>
            <div>
              <h1 id="profile-name" class="page-title" style="font-size: 1.5rem;">${escapeHtml(student.name)}</h1>
              <p class="muted" style="margin: 4px 0 0;">${escapeHtml(student.yearDept)} · ${escapeHtml(student.campusArea)}</p>
            </div>
          </div>

          <div class="profile-rows">
            <div>
              <div class="profile-item-label">Home city</div>
              <div class="profile-item-value">${escapeHtml(student.homeCity)}</div>
            </div>

            <div>
              <div class="profile-item-label">Travel preferences</div>
              <div class="tag-list">${tagsHtml}</div>
            </div>

            <div>
              <div class="profile-item-label">Communication comfort</div>
              <div class="profile-item-value">${escapeHtml(student.communicationComfort)}</div>
            </div>
          </div>
        </section>
      </div>
    `;

    container.querySelector('#profile-back-btn')?.addEventListener('click', () => {
      navigate('group');
    });
    return;
  }

  const commOptionsHtml = COMMUNICATION_OPTIONS.map(
    (opt) =>
      `<option value="${escapeHtml(opt)}" ${student.communicationComfort === opt ? 'selected' : ''}>${escapeHtml(opt)}</option>`
  ).join('');

  container.innerHTML = `
    <div class="container container-narrow">
      ${
        showBackToGroup
          ? `<div class="back-row">
              <button type="button" class="btn btn-ghost" id="profile-back-btn">← Back to group</button>
            </div>`
          : ''
      }

      <div class="page-header">
        <span class="eyebrow">Your student profile</span>
        <h1 class="page-title">Profile &amp; travel comfort</h1>
        <p>Shown to fellow campus travellers when you join a group.</p>
      </div>

      <form class="card" id="profile-form" novalidate>
        <div class="profile-header">
          <span class="avatar avatar-lg" aria-hidden="true">${escapeHtml(student.initials)}</span>
          <div>
            <div style="font-weight: 600; font-size: 1rem;">${escapeHtml(student.name)}</div>
            <div class="muted">${escapeHtml(student.yearDept)} · ${escapeHtml(student.campusArea)}</div>
          </div>
        </div>

        <div class="form-grid">
          <div class="field">
            <label for="prof-name">Name</label>
            <input
              id="prof-name"
              type="text"
              class="input"
              value="${escapeHtml(student.name)}"
              required
            />
            <span class="field-error" id="err-prof-name" aria-live="polite"></span>
          </div>

          <div class="field">
            <label for="prof-city">Home city</label>
            <input
              id="prof-city"
              type="text"
              class="input"
              value="${escapeHtml(student.homeCity)}"
              placeholder="e.g. Ranchi"
            />
          </div>

          <div class="field field-full">
            <label for="prof-prefs">Travel preferences (comma-separated)</label>
            <input
              id="prof-prefs"
              type="text"
              class="input"
              value="${escapeHtml((student.preferences || []).join(', '))}"
              placeholder="e.g. Quiet ride, 1 cabin bag, On-time departure"
            />
          </div>

          <div class="field field-full">
            <label for="prof-comm">Communication comfort</label>
            <select id="prof-comm" class="select">
              ${commOptionsHtml}
            </select>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Save profile</button>
        </div>

        <div id="profile-status" aria-live="polite"></div>
      </form>
    </div>
  `;

  container.querySelector('#profile-back-btn')?.addEventListener('click', () => {
    navigate('group');
  });

  const form = container.querySelector('#profile-form');
  const nameInput = container.querySelector('#prof-name');
  const cityInput = container.querySelector('#prof-city');
  const prefsInput = container.querySelector('#prof-prefs');
  const commSelect = container.querySelector('#prof-comm');
  const errName = container.querySelector('#err-prof-name');

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const nameVal = nameInput.value.trim();
    if (!nameVal) {
      errName.textContent = 'Please enter your name.';
      nameInput.classList.add('has-error');
      nameInput.focus();
      return;
    }

    errName.textContent = '';
    nameInput.classList.remove('has-error');

    const prefsList = prefsInput.value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    updateCurrentUserProfile({
      name: nameVal,
      homeCity: cityInput.value.trim(),
      preferences: prefsList.length ? prefsList : ['Flexible'],
      communicationComfort: commSelect.value,
    });

    renderProfile(container, { navigate });
    const updatedStatus = container.querySelector('#profile-status');
    if (updatedStatus) {
      updatedStatus.innerHTML = `<div class="status-banner">Profile updated</div>`;
    }
  });
}
