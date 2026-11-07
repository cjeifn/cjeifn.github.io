---
title: 갤러리
---

# {% include icon.html icon="fa-solid fa-images" %}갤러리

{% include section.html dark=false size="wide" %}

<div class="event-gallery">
  <article class="event-gallery-card">
    <button class="event-gallery-photo" type="button" data-gallery-open="seminar-01-card" aria-haspopup="dialog" aria-controls="seminar-01-card" aria-label="제1회 기초수리력 세미나 사진 카드 보기">
      <img src="{{ '/images/gallery/seminar-01-2026-11-06.jpg' | relative_url }}" alt="제1회 기초수리력 세미나 현장" width="4000" height="3000" decoding="async">
    </button>
    <time class="event-gallery-date" datetime="2026-11-06">2026. 11. 6.</time>
    <h2 class="event-gallery-title"><button type="button" data-gallery-open="seminar-01-card" aria-haspopup="dialog" aria-controls="seminar-01-card">제1회 기초수리력 세미나</button></h2>
    <p class="event-gallery-caption">청주교육대학교 청남마루</p>
  </article>
</div>

<dialog class="event-gallery-dialog" id="seminar-01-card" aria-labelledby="seminar-01-card-title">
  <div class="event-gallery-dialog-toolbar">
    <button class="event-gallery-close" type="button" data-gallery-close aria-label="사진 카드 닫기">
      <svg class="event-gallery-close-icon" viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" focusable="false"><path d="M5 5L15 15M15 5L5 15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
    </button>
  </div>
  <img class="event-gallery-dialog-image" src="{{ '/images/gallery/seminar-01-2026-11-06.jpg' | relative_url }}" alt="제1회 기초수리력 세미나 현장" width="4000" height="3000" loading="lazy" decoding="async">
  <div class="event-gallery-dialog-caption">
    <time datetime="2026-11-06">2026. 11. 6.</time>
    <h2 id="seminar-01-card-title" tabindex="-1" autofocus>제1회 기초수리력 세미나</h2>
    <p>청주교육대학교 청남마루</p>
  </div>
</dialog>
