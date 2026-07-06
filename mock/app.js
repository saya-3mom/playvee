/**
 * ココミケ ホーム画面 - ダミーデータ & 描画
 */

const FRESHNESS = {
  green: { label: '7日以内に確認', class: 'freshness--green' },
  yellow: { label: '30日以内に確認', class: 'freshness--yellow' },
  orange: { label: '90日以内に確認', class: 'freshness--orange' },
  red: { label: '半年以上未確認', class: 'freshness--red' },
};

const dummyData = {
  filters: [
    { id: 'parking', icon: 'local_parking', label: '駐車場あり' },
    { id: 'diaper', icon: 'baby_changing_station', label: 'おむつ替え台' },
    { id: 'toddler', icon: 'child_care', label: '幼児向け遊具' },
    { id: 'picnic', icon: 'park', label: 'ピクニック可' },
    { id: 'toilet', icon: 'wc', label: 'トイレあり' },
  ],

  recentPhotos: [
    {
      id: 1,
      park: 'こもれび公園',
      facility: 'ローラー滑り台',
      category: '遊具',
      addedAt: '2日前',
      gradient: 'linear-gradient(135deg, #81c784 0%, #388e3c 100%)',
    },
    {
      id: 2,
      park: 'さくら児童公園',
      facility: '幼児用ブランコ',
      category: '遊具',
      addedAt: '3日前',
      gradient: 'linear-gradient(135deg, #aed581 0%, #689f38 100%)',
    },
    {
      id: 3,
      park: '青空公園',
      facility: '駐車場',
      category: '駐車場',
      addedAt: '5日前',
      gradient: 'linear-gradient(135deg, #4db6ac 0%, #00796b 100%)',
    },
    {
      id: 4,
      park: 'みどり丘公園',
      facility: '多目的トイレ',
      category: 'トイレ',
      addedAt: '1週間前',
      gradient: 'linear-gradient(135deg, #7986cb 0%, #3949ab 100%)',
    },
    {
      id: 5,
      park: 'こもれび公園',
      facility: '公園全体',
      category: '公園全体',
      addedAt: '1週間前',
      gradient: 'linear-gradient(135deg, #ffb74d 0%, #f57c00 100%)',
    },
  ],

  nearbyParks: [
    {
      id: 1,
      name: 'こもれび公園',
      distance: '1.2km',
      freshness: 'green',
      tags: ['駐車場', '幼児向け'],
    },
    {
      id: 2,
      name: 'さくら児童公園',
      distance: '2.5km',
      freshness: 'yellow',
      tags: ['おむつ替え', '滑り台'],
    },
    {
      id: 3,
      name: 'みどり丘公園',
      distance: '3.8km',
      freshness: 'green',
      tags: ['ピクニック', '芝生'],
    },
  ],

  recentFacilities: [
    {
      facility: '駐車場',
      park: 'こもれび公園',
      distance: '1.2km',
      freshness: 'green',
      confirmedAt: '3日前',
      confirmCount: 5,
    },
    {
      facility: 'ローラー滑り台',
      park: 'こもれび公園',
      distance: '1.2km',
      freshness: 'green',
      confirmedAt: '5日前',
      confirmCount: 3,
    },
    {
      facility: '幼児用ブランコ',
      park: '青空公園',
      distance: '4.1km',
      freshness: 'green',
      confirmedAt: '2日前',
      confirmCount: 4,
    },
    {
      facility: 'おむつ替え台',
      park: 'さくら児童公園',
      distance: '2.5km',
      freshness: 'yellow',
      confirmedAt: '18日前',
      confirmCount: 2,
    },
    {
      facility: '駐車場',
      park: '青空公園',
      distance: '4.1km',
      freshness: 'orange',
      confirmedAt: '72日前',
      confirmCount: 1,
    },
  ],
};

/** 鮮度バッジHTML */
function renderFreshness(level, prominent = false) {
  const f = FRESHNESS[level];
  const prominentClass = prominent ? ' freshness--prominent' : '';
  return `
    <span class="freshness ${f.class}${prominentClass}">
      <span class="freshness__dot" aria-hidden="true"></span>
      ${f.label}
    </span>
  `;
}

/** よく探す条件 */
function renderFilters() {
  const container = document.getElementById('filter-chips');
  if (!container) return;

  container.innerHTML = dummyData.filters
    .map(
      (filter) => `
      <a class="filter-chip" href="#" data-filter="${filter.id}">
        <span class="material-icons-round">${filter.icon}</span>
        ${filter.label}
      </a>
    `
    )
    .join('');

  container.querySelectorAll('.filter-chip').forEach((chip) => {
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      chip.classList.toggle('filter-chip--active');
    });
  });
}

/** 最近追加された写真 */
function renderRecentPhotos() {
  const container = document.getElementById('recent-photos');
  if (!container) return;

  container.innerHTML = dummyData.recentPhotos
    .map(
      (photo) => `
      <a class="photo-card" href="#">
        <div class="photo-card__image" style="background: ${photo.gradient}">
          <span class="photo-card__category">${photo.category}</span>
          <span class="material-icons-round" aria-hidden="true">photo_camera</span>
        </div>
        <div class="photo-card__body">
          <p class="photo-card__park">${photo.park}</p>
          <p class="photo-card__facility">${photo.facility}</p>
          <p class="photo-card__date">${photo.addedAt}に追加</p>
        </div>
      </a>
    `
    )
    .join('');
}

/** 近くの公園カード */
function renderNearbyParks() {
  const container = document.getElementById('nearby-parks');
  if (!container) return;

  container.innerHTML = dummyData.nearbyParks
    .map(
      (park) => `
      <a class="park-card" href="#">
        <div class="park-card__image" aria-hidden="true">
          <span class="material-icons-round">photo_camera</span>
        </div>
        <div class="park-card__body">
          <h3 class="park-card__name">${park.name}</h3>
          <p class="park-card__meta">${park.distance}</p>
          <div class="park-card__tags">
            ${renderFreshness(park.freshness, true)}
            ${park.tags.map((tag) => `<span class="feature-tag">${tag}</span>`).join('')}
          </div>
        </div>
      </a>
    `
    )
    .join('');
}

/** 最近確認された設備 */
function renderRecentFacilities() {
  const list = document.getElementById('recent-facilities');
  if (!list) return;

  list.innerHTML = dummyData.recentFacilities
    .map(
      (item) => `
      <li class="facility-item facility-item--${item.freshness}">
        <a class="facility-item__link" href="#">
          <div class="facility-item__top">
            <div>
              <h3 class="facility-item__name">${item.facility}</h3>
              <p class="facility-item__park">${item.park} · ${item.distance}</p>
            </div>
            ${renderFreshness(item.freshness, true)}
          </div>
          <div class="facility-item__meta">
            <span>
              <span class="material-icons-round" aria-hidden="true">schedule</span>
              最終確認 ${item.confirmedAt}
            </span>
            <span class="facility-item__confirm-count">${item.confirmCount}人が確認</span>
          </div>
        </a>
      </li>
    `
    )
    .join('');
}

function init() {
  renderFilters();
  renderRecentPhotos();
  renderNearbyParks();
  renderRecentFacilities();
}

document.addEventListener('DOMContentLoaded', init);
