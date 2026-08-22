---
title: 행사
nav:
  order: 3
  tooltip: 학술 세미나 및 연구소 행사
---

# {% include icon.html icon="fa-solid fa-calendar-days" %}행사

청주교대 기초수리력 연구소에서 주최 및 주관하는 학술 행사 및 세미나 안내입니다.

{% include section.html %}

<style>
  .seminar-wrap {
    width: 100%;
    margin: 20px auto;
    padding: 0;
  }

  /* PC: 3열 그리드 */
  .seminar-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 20px;
    width: 100%;
  }

  .seminar-card {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 0;
    border: 1px solid var(--border-color, #e5e5e5);
    border-radius: 8px;
    padding: 20px;
    text-decoration: none !important;
    color: inherit !important;
    background: var(--card-background, #fff);
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.04);
  }

  .seminar-card:hover {
    border-color: #999;
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.08);
  }

  .event-no {
    font-size: 13px;
    font-weight: 600;
    color: #0366d6;
    margin-bottom: 6px;
    word-break: keep-all;
  }

  .event-topic {
    font-size: 18px;
    font-weight: 700;
    line-height: 1.4;
    margin-bottom: 14px;
    word-break: keep-all;
    overflow-wrap: break-word;
    color: var(--heading-color, #24292f);
  }

  .event-info {
    font-size: 13.5px;
    line-height: 1.6;
    color: var(--text-color, #57606a);
    word-break: keep-all;
    margin-top: auto;
  }

  .event-info > div {
    margin-bottom: 3px;
  }

  /* 태블릿: 2열 그리드 */
  @media (max-width: 1024px) {
    .seminar-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
    }
  }

  /* 모바일: 1열 그리드 */
  @media (max-width: 650px) {
    .seminar-grid {
      grid-template-columns: 1fr;
      gap: 14px;
    }

    .seminar-card {
      padding: 16px;
    }

    .event-topic {
      font-size: 16px;
    }
  }
</style>

<div class="seminar-wrap">
  <div class="seminar-grid">

    <a class="seminar-card"
       href="https://sites.google.com/view/cnue-ifn/%ED%96%89%EC%82%AC/seminar-01?authuser=4"
       target="_blank"
       rel="noopener noreferrer">

      <div class="event-no">
        제1회 CNUE-IFN 기초수리력 세미나
      </div>

      <div class="event-topic">
        Fractions in Realistic Mathematics Education
      </div>

      <div class="event-info">
        <div><strong>일시:</strong> 2026.11.7. 18:00 ~ 21:00</div>
        <div><strong>장소:</strong> 청주교대 교육문화관 205호</div>
        <div>
          <strong>발표자:</strong> 김응관, 방민재, 김수진, 임규남, 이원우, 이영후
        </div>
      </div>

    </a>

  </div>
</div>
