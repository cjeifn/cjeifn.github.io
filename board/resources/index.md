---
title: 자료실
resources:
  - title: 교수단위 작성 자료
    date: 2026-10-31
    url: /board/resources/teaching-unit/
    id: teaching-unit
---

{% assign resources = page.resources | sort: "date" | reverse %}

# {% include icon.html icon="fa-solid fa-folder-open" %}자료실

{% include section.html %}

<div class="board-page" data-board-list data-views-endpoint="https://cjeifn-board-views.cgsongmath.chatgpt.site/api/views">
  <div class="board-toolbar">
    <p>총 <span data-board-total>{{ resources.size }}</span>건</p>
    <form class="board-search" role="search" aria-label="자료실 검색">
      <input type="search" name="q" aria-label="검색어" placeholder="검색어">
      <button type="submit">검색</button>
    </form>
  </div>
<div class="resource-board">
  <table class="resource-board__table">
    <caption class="resource-board__caption">자료실 게시글 목록</caption>
    <colgroup>
      <col class="resource-board__number">
      <col class="resource-board__title">
      <col class="resource-board__date">
      <col class="resource-board__views">
    </colgroup>
    <thead>
      <tr>
        <th scope="col">번호</th>
        <th scope="col">제목</th>
        <th scope="col">날짜</th>
        <th scope="col">조회</th>
      </tr>
    </thead>
    <tbody>
      {% for resource in resources %}
        <tr data-board-row data-title="{{ resource.title | escape }}">
          <td class="resource-board__number">{{ forloop.rindex }}</td>
          <td class="resource-board__title">
            <a href="{{ resource.url | relative_url | escape }}">{{ resource.title | escape }}</a>
          </td>
          <td class="resource-board__date"><time datetime="{{ resource.date | date: '%Y-%m-%d' }}">{{ resource.date | date: "%Y-%m-%d" }}</time></td>
          <td class="resource-board__views"><span data-view-count="{{ resource.id }}">—</span></td>
        </tr>
      {% endfor %}
      <tr data-board-empty {% if resources.size > 0 %}hidden{% endif %}>
        <td class="resource-board__empty" colspan="4">게시글이 없습니다.</td>
      </tr>
    </tbody>
  </table>
</div>

<nav class="board-pagination" aria-label="게시글 페이지" data-board-pagination><button type="button" aria-current="page">1</button></nav>
</div>
