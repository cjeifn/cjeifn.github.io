---
title: 지도 사례 토론
permalink: /board/teaching-discussion/
---

# {% include icon.html icon="fa-solid fa-comments" %}지도 사례 토론

{% include section.html %}

<div class="board-page teaching-discussion" data-discussion-board data-discussion-endpoint="https://cjeifn-board-views.cgsongmath.chatgpt.site/api/discussion">
  <div class="discussion-notice" data-discussion-notice hidden>
    <p data-discussion-status role="status" aria-live="polite"></p>
    <button class="board-button" type="button" data-discussion-retry hidden>다시 시도</button>
    <button class="board-button" type="button" data-discussion-status-back hidden>목록</button>
  </div>

  <div data-discussion-view="list">
    <div class="board-toolbar">
      <p>총 <span data-discussion-total>—</span>건</p>
      <form class="board-search" data-discussion-search role="search" aria-label="지도 사례 토론 검색">
        <input type="search" name="q" aria-label="검색어" placeholder="검색어" maxlength="150">
        <button type="submit">검색</button>
      </form>
    </div>
    <div class="resource-board">
      <table class="resource-board__table">
        <caption class="resource-board__caption">지도 사례 토론 게시글 목록</caption>
        <colgroup>
          <col class="resource-board__number">
          <col class="resource-board__title">
          <col class="resource-board__date">
          <col class="resource-board__views">
        </colgroup>
        <thead><tr><th scope="col">번호</th><th scope="col">제목</th><th scope="col">날짜</th><th scope="col">조회</th></tr></thead>
        <tbody data-discussion-rows>
          <tr><td class="resource-board__empty" colspan="4">불러오는 중...</td></tr>
        </tbody>
      </table>
    </div>
    <div class="board-post__actions"><button class="board-button" type="button" data-discussion-write>글쓰기</button></div>
    <nav class="board-pagination" data-discussion-pagination aria-label="게시글 페이지"></nav>
  </div>

  <div data-discussion-view="editor" hidden>
    <h2 class="discussion-view-title" data-discussion-editor-title tabindex="-1">글쓰기</h2>
    <form class="discussion-form" data-discussion-editor>
      <fieldset>
        <legend class="discussion-sr-only">게시글 작성</legend>
        <div class="discussion-field">
          <label for="discussion-author">작성자(닉네임)</label>
          <input id="discussion-author" name="author" required maxlength="30" autocomplete="nickname">
        </div>
        <div class="discussion-field">
          <label for="discussion-title">제목</label>
          <input id="discussion-title" name="title" required maxlength="150">
        </div>
        <div class="discussion-field">
          <label for="discussion-body">내용</label>
          <textarea id="discussion-body" name="body" required maxlength="20000" rows="12"></textarea>
        </div>
        <div class="discussion-field">
          <label for="discussion-password">비밀번호(8자 이상)</label>
          <input id="discussion-password" name="password" type="password" required minlength="8" maxlength="128" autocomplete="new-password" aria-describedby="discussion-password-hint">
          <p class="discussion-hint" id="discussion-password-hint">비밀번호는 수정·삭제에 사용됩니다.</p>
        </div>
        <div class="discussion-trap" aria-hidden="true"><label for="discussion-website">Website</label><input id="discussion-website" name="website" tabindex="-1" autocomplete="off"></div>
        <p class="discussion-form-error" data-form-error role="alert" hidden></p>
        <div class="board-post__actions">
          <button class="board-button" type="button" data-discussion-editor-cancel>취소</button>
          <button class="board-button" type="submit" data-discussion-editor-submit>등록</button>
        </div>
      </fieldset>
    </form>
  </div>

  <article class="board-post" data-discussion-view="detail" hidden>
    <div class="board-post__header">
      <h2 class="board-post__title" data-discussion-post-title tabindex="-1"></h2>
      <div class="board-post__meta">
        <span>작성자 <span data-discussion-post-author></span></span>
        <span>작성일 <time data-discussion-post-date></time></span>
        <span>조회 <span data-discussion-post-views>—</span></span>
      </div>
    </div>
    <div class="discussion-body" data-discussion-post-body></div>
    <div class="board-post__actions">
      <button class="board-button" type="button" data-discussion-edit>수정</button>
      <button class="board-button" type="button" data-discussion-delete-post>삭제</button>
      <button class="board-button" type="button" data-discussion-back>목록</button>
    </div>

    <div class="discussion-comments-section">
      <h3 class="discussion-comments-heading">댓글 <span data-discussion-comment-total>0</span></h3>
      <ul class="discussion-comments" data-discussion-comments></ul>
      <p class="discussion-comments-empty" data-discussion-comments-empty>등록된 댓글이 없습니다.</p>
      <form class="discussion-form" data-discussion-comment-form>
        <fieldset>
          <legend class="discussion-sr-only">댓글 작성</legend>
          <div class="discussion-field-row">
            <div class="discussion-field">
              <label for="discussion-comment-author">작성자(닉네임)</label>
              <input id="discussion-comment-author" name="author" required maxlength="30" autocomplete="nickname">
            </div>
            <div class="discussion-field">
              <label for="discussion-comment-password">비밀번호(8자 이상)</label>
              <input id="discussion-comment-password" name="password" type="password" required minlength="8" maxlength="128" autocomplete="new-password" aria-describedby="discussion-comment-password-hint">
            </div>
          </div>
          <p class="discussion-hint" id="discussion-comment-password-hint">비밀번호는 삭제에 사용됩니다.</p>
          <div class="discussion-field">
            <label for="discussion-comment-body">댓글</label>
            <textarea id="discussion-comment-body" name="body" required maxlength="5000" rows="4"></textarea>
          </div>
          <div class="discussion-trap" aria-hidden="true"><label for="discussion-comment-website">Website</label><input id="discussion-comment-website" name="website" tabindex="-1" autocomplete="off"></div>
          <p class="discussion-form-error" data-form-error role="alert" hidden></p>
          <div class="board-post__actions"><button class="board-button" type="submit">댓글 등록</button></div>
        </fieldset>
      </form>
    </div>
  </article>

  <dialog class="discussion-confirm" data-discussion-delete-dialog aria-labelledby="discussion-delete-title">
    <h2 id="discussion-delete-title" data-discussion-delete-title>삭제</h2>
    <p data-discussion-delete-message></p>
    <form class="discussion-form" data-discussion-delete-form>
      <fieldset>
        <legend class="discussion-sr-only">삭제 확인</legend>
        <div class="discussion-field">
          <label for="discussion-delete-password">비밀번호(8자 이상)</label>
          <input id="discussion-delete-password" name="password" type="password" required minlength="8" maxlength="128" autocomplete="current-password">
        </div>
        <p class="discussion-form-error" data-form-error role="alert" hidden></p>
        <div class="board-post__actions">
          <button class="board-button" type="button" data-discussion-delete-cancel>취소</button>
          <button class="board-button" type="submit">삭제</button>
        </div>
      </fieldset>
    </form>
  </dialog>
  <noscript><p>게시판을 이용하려면 JavaScript를 켜 주세요.</p></noscript>
</div>
