---
title: 게시판
nav:
  order: 6
  tooltip: 게시판
  children:
    - title: 행사
      url: /events/
    - title: 자료실
      url: /board/resources/
---

<div class="board-page">
  <div class="board-heading"><h1>게시판</h1></div>
  <div class="board-post__actions">
    <a class="board-button" href="{{ '/events/' | relative_url }}">행사</a>
    <a class="board-button" href="{{ '/board/resources/' | relative_url }}">자료실</a>
  </div>
</div>
