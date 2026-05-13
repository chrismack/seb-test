// Import Material Web Components
import '@material/web/elevation/elevation.js';
import '@material/web/textfield/filled-text-field.js';
import '@material/web/list/list.js';
import '@material/web/list/list-item.js';
import '@material/web/divider/divider.js';
import '@material/web/chips/assist-chip.js';
import '@material/web/ripple/ripple.js';

import data from './data.json';
import {
  buildNavigateUrl,
  canCallLocation,
  copyTextToClipboard,
  filterLocations,
  getRecentLocations,
  pushRecentLocation,
  readRecentIds,
  writeRecentIds,
  type DataCollection,
  type LocationData,
} from './location-helpers';

// Cast the imported data to our type
const locationData: DataCollection = data as DataCollection;

// Get DOM elements
const searchInput = document.getElementById('searchInput') as any; // Material text field
const dropdown = document.getElementById('dropdown') as HTMLDivElement;
const resultSection = document.getElementById('resultSection') as HTMLDivElement;
const recentSection = document.getElementById('recentSection') as HTMLDivElement;
const recentList = document.getElementById('recentList') as HTMLDivElement;
const feedbackToast = document.getElementById('feedbackToast') as HTMLDivElement;
const RECENT_IDS_STORAGE_KEY = 'recent-location-ids';

// Store all location keys and data
const locationKeys = Object.keys(locationData);

interface AppState {
  query: string;
  filteredResults: Array<{ key: string; data: LocationData }>;
  selectedLocationId: string | null;
  recentLocationIds: string[];
  showStatusConfirm: boolean;
}

const state: AppState = {
  query: '',
  filteredResults: [],
  selectedLocationId: null,
  recentLocationIds: readRecentIds(window.localStorage, RECENT_IDS_STORAGE_KEY),
  showStatusConfirm: false,
};

let toastTimer: ReturnType<typeof setTimeout> | null = null;

function showToast(message: string) {
  feedbackToast.textContent = message;
  feedbackToast.classList.add('active');

  if (toastTimer) {
    clearTimeout(toastTimer);
  }

  toastTimer = setTimeout(() => {
    feedbackToast.classList.remove('active');
  }, 1800);
}

function renderRecentSection() {
  const recentLocations = getRecentLocations(locationData, state.recentLocationIds);
  const shouldShowRecents = state.query.trim() === '' && recentLocations.length > 0;

  if (!shouldShowRecents) {
    recentSection.classList.remove('active');
    recentList.innerHTML = '';
    return;
  }

  recentList.innerHTML = recentLocations
    .map(({ key, data }) => {
      return `<button type="button" class="recent-item" data-recent-key="${escapeHtml(key)}">${escapeHtml(data.name)}</button>`;
    })
    .join('');

  recentSection.classList.add('active');

  recentList.querySelectorAll('.recent-item').forEach(item => {
    item.addEventListener('click', () => {
      const key = item.getAttribute('data-recent-key');
      if (key && locationData[key]) {
        selectLocation(key);
      }
    });
  });
}

function selectLocation(key: string) {
  if (!locationData[key]) {
    return;
  }

  state.selectedLocationId = key;
  state.showStatusConfirm = false;
  state.recentLocationIds = pushRecentLocation(state.recentLocationIds, key);
  writeRecentIds(window.localStorage, RECENT_IDS_STORAGE_KEY, state.recentLocationIds);

  searchInput.value = locationData[key].name;
  dropdown.classList.remove('active');
  renderLocation();
  renderRecentSection();
}

/**
 * Render dropdown with filtered results using Material List
 */
function renderDropdown(results: Array<{ key: string; data: LocationData }>) {
  if (results.length === 0 && searchInput.value.trim()) {
    dropdown.innerHTML = '<div class="no-results">No locations found</div>';
    dropdown.classList.add('active');
    return;
  }

  if (results.length === 0) {
    dropdown.classList.remove('active');
    return;
  }

  const listItems = results.map(({ key, data }) => `
    <md-list-item type="button" data-key="${key}">
      <span class="material-icons" slot="start">place</span>
      <div slot="headline">${escapeHtml(data.name)}</div>
      <div slot="supporting-text">${escapeHtml(data.location)}</div>
    </md-list-item>
  `).join('');

  dropdown.innerHTML = `<md-list>${listItems}</md-list>`;
  dropdown.classList.add('active');

  // Add click listeners to dropdown items
  dropdown.querySelectorAll('md-list-item').forEach(item => {
    item.addEventListener('click', () => {
      const key = item.getAttribute('data-key');
      if (key) {
        selectLocation(key);
      }
    });
  });
}

/**
 * Display selected location details using Material Design components
 */
function renderLocation() {
  if (!state.selectedLocationId || !locationData[state.selectedLocationId]) {
    resultSection.classList.remove('active');
    resultSection.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <span class="material-icons">location_on</span>
        </div>
        <h3>No location selected</h3>
        <p>Use the search box above to find a location</p>
      </div>
    `;
    return;
  }

  const key = state.selectedLocationId;
  const data = locationData[key];
  const chipClass = data.help ? 'help-needed' : 'no-help';
  const chipLabel = data.help ? 'Help Needed' : 'No Help Needed';
  const chipIcon = data.help ? 'error' : 'check_circle';
  const canCall = canCallLocation(data.phone);

  resultSection.innerHTML = `
    <md-divider></md-divider>
    <div class="result-header">
      <div class="result-icon-container">
        <span class="material-icons">location_on</span>
      </div>
      <div class="result-title">
        <h2>${escapeHtml(data.name)}</h2>
        <p class="subtitle">ID: ${escapeHtml(key)}</p>
      </div>
    </div>
    <div class="result-details">
      <div class="detail-card">
        <div class="detail-icon">
          <span class="material-icons">place</span>
        </div>
        <div class="detail-content">
          <div class="detail-label">Location</div>
          <div class="detail-value">${escapeHtml(data.location)}</div>
        </div>
      </div>
      <div class="detail-card">
        <div class="detail-icon">
          <span class="material-icons">${chipIcon}</span>
        </div>
        <div class="detail-content">
          <div class="detail-label">Status</div>
          <div class="detail-value">
            <md-assist-chip class="${chipClass}" label="${chipLabel}"></md-assist-chip>
          </div>
        </div>
      </div>
      <div class="detail-card">
        <div class="detail-icon">
          <span class="material-icons">badge</span>
        </div>
        <div class="detail-content">
          <div class="detail-label">Identifier</div>
          <div class="detail-value">${escapeHtml(key)}</div>
        </div>
      </div>
    </div>
    <div class="quick-actions">
      <button type="button" class="quick-action-button" id="actionNavigate">
        <span class="material-icons">map</span>
        <span>Navigate</span>
      </button>
      <button type="button" class="quick-action-button" id="actionCall" ${canCall ? '' : 'disabled'}>
        <span class="material-icons">call</span>
        <span>${canCall ? 'Call' : 'Call Unavailable'}</span>
      </button>
      <button type="button" class="quick-action-button" id="actionCopyId">
        <span class="material-icons">content_copy</span>
        <span>Copy ID</span>
      </button>
      <button type="button" class="quick-action-button" id="actionToggleHelp">
        <span class="material-icons">sync</span>
        <span>Toggle Help</span>
      </button>
    </div>
    <div class="status-confirm ${state.showStatusConfirm ? 'active' : ''}" id="statusConfirm">
      <div class="status-confirm-text">Confirm status change for this location?</div>
      <div class="status-confirm-actions">
        <button type="button" class="quick-action-button" id="confirmToggleHelp">
          <span class="material-icons">check</span>
          <span>Confirm</span>
        </button>
        <button type="button" class="quick-action-button" id="cancelToggleHelp">
          <span class="material-icons">close</span>
          <span>Cancel</span>
        </button>
      </div>
    </div>
  `;

  resultSection.classList.add('active');

  const navigateButton = document.getElementById('actionNavigate') as HTMLButtonElement | null;
  const callButton = document.getElementById('actionCall') as HTMLButtonElement | null;
  const copyButton = document.getElementById('actionCopyId') as HTMLButtonElement | null;
  const toggleButton = document.getElementById('actionToggleHelp') as HTMLButtonElement | null;
  const confirmButton = document.getElementById('confirmToggleHelp') as HTMLButtonElement | null;
  const cancelButton = document.getElementById('cancelToggleHelp') as HTMLButtonElement | null;

  navigateButton?.addEventListener('click', () => {
    window.open(buildNavigateUrl(data.location, data.mapLabel), '_blank', 'noopener,noreferrer');
  });

  callButton?.addEventListener('click', () => {
    if (!canCall || !data.phone) {
      showToast('Call unavailable for this location');
      return;
    }

    window.location.href = `tel:${data.phone}`;
  });

  copyButton?.addEventListener('click', async () => {
    const result = await copyTextToClipboard(navigator, key);
    showToast(result.ok ? 'Location ID copied' : 'Unable to copy ID');
  });

  toggleButton?.addEventListener('click', () => {
    state.showStatusConfirm = true;
    renderLocation();
  });

  cancelButton?.addEventListener('click', () => {
    state.showStatusConfirm = false;
    renderLocation();
  });

  confirmButton?.addEventListener('click', () => {
    data.help = !data.help;
    state.showStatusConfirm = false;
    renderLocation();
    showToast('Status updated');
  });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Handle search input
 */
searchInput.addEventListener('input', (e: Event) => {
  state.query = (e.target as any).value;
  state.filteredResults = filterLocations(locationData, state.query);
  renderDropdown(state.filteredResults);
  renderRecentSection();
});

/**
 * Close dropdown when clicking outside
 */
document.addEventListener('click', (e: MouseEvent) => {
  if (!searchInput.contains(e.target as Node) && !dropdown.contains(e.target as Node)) {
    dropdown.classList.remove('active');
  }
});

/**
 * Handle search input focus
 */
searchInput.addEventListener('focus', () => {
  if (searchInput.value.trim()) {
    state.query = searchInput.value;
    state.filteredResults = filterLocations(locationData, state.query);
    renderDropdown(state.filteredResults);
  }
});

/**
 * Handle keyboard navigation
 */
searchInput.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    dropdown.classList.remove('active');
    searchInput.blur();
  }
});

renderLocation();
renderRecentSection();

console.log('Location Finder App initialized ✨');
console.log(`Loaded ${locationKeys.length} locations`);
