---
title: 게시판
nav:
  order: 7
  tooltip: 게시판
  children:
    - title: 갤러리
      url: /board/gallery/
    - title: 자료실
      url: /board/resources/
    - title: 지도 사례 토론
      url: /board/teaching-discussion/
---

<div class="board-page">
  <div class="board-heading"><h1>게시판</h1></div>
  <div class="board-post__actions">
    <a class="board-button" href="{{ '/board/gallery/' | relative_url }}">갤러리</a>
    <a class="board-button" href="{{ '/board/resources/' | relative_url }}">자료실</a>
    <a class="board-button" href="{{ '/board/teaching-discussion/' | relative_url }}">지도 사례 토론</a>
  </div>
</div>
