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
          <label for="discussion-category">글 유형</label>
          <select id="discussion-category" name="category" required><option value="question">질문</option><option value="case">사례 공유</option></select>
        </div>
        <div class="discussion-field">
          <label for="discussion-author">작성자(닉네임)</label>
          <input id="discussion-author" name="author" required maxlength="30" autocomplete="nickname">
        </div>
        <div class="discussion-field">
          <label for="discussion-title">제목</label>
          <input id="discussion-title" name="title" required maxlength="150">
        </div>
        <div class="discussion-field">
          <label id="discussion-body-label">내용</label>
          <div class="discussion-editor-shell">
            <div class="discussion-editor-toolbars" data-discussion-rich-toolbar>
              <div class="discussion-editor-toolbar discussion-editor-toolbar--insert" role="group" aria-label="본문 삽입">
                <button class="discussion-editor-action" type="button" data-discussion-insert-photo title="이미지 삽입" aria-label="이미지 삽입">
                  <svg viewBox="0 0 20 20" aria-hidden="true"><rect x="2.5" y="3" width="15" height="14" rx="1"></rect><circle cx="7" cy="7.5" r="1.5"></circle><path d="m3 14 4-4 3 3 3-4 4 5"></path></svg><span>이미지</span>
                </button>
                <button class="discussion-editor-action" type="button" data-discussion-attach-file title="파일 첨부" aria-label="파일 첨부">
                  <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 10 5-5a3 3 0 0 1 4.2 4.2l-7.4 7.4a4 4 0 0 1-5.6-5.6l7.4-7.4M6.5 12.5l5.4-5.4a1 1 0 0 1 1.4 1.4L8 14"></path></svg><span>파일 첨부</span>
                </button>
                <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" multiple data-discussion-photo-input aria-label="본문에 넣을 사진 선택" hidden>
              </div>
              <div class="discussion-editor-toolbar discussion-editor-toolbar--format" role="group" aria-label="본문 서식">
                <div class="discussion-editor-tool-group" role="group" aria-label="글꼴과 크기">
                  <select class="discussion-editor-font" data-editor-font title="글꼴" aria-label="글꼴"><option value="">기본 글꼴</option><option value="sans-serif">고딕</option><option value="serif">명조</option><option value="monospace">고정폭</option></select>
                  <select class="discussion-editor-size" data-editor-size title="글자 크기" aria-label="글자 크기"><option value="12">12</option><option value="14">14</option><option value="16" selected>16</option><option value="18">18</option><option value="20">20</option><option value="24">24</option><option value="28">28</option><option value="32">32</option></select>
                </div>
                <div class="discussion-editor-tool-group" role="group" aria-label="글자 서식">
                  <button class="discussion-editor-tool" type="button" data-editor-command="bold" title="굵게" aria-label="굵게" aria-pressed="false"><span class="discussion-editor-icon-bold" aria-hidden="true">B</span></button>
                  <button class="discussion-editor-tool" type="button" data-editor-command="italic" title="기울임" aria-label="기울임" aria-pressed="false"><span class="discussion-editor-icon-italic" aria-hidden="true">I</span></button>
                  <button class="discussion-editor-tool" type="button" data-editor-command="underline" title="밑줄" aria-label="밑줄" aria-pressed="false"><span class="discussion-editor-icon-underline" aria-hidden="true">U</span></button>
                  <button class="discussion-editor-tool" type="button" data-editor-command="strike" title="취소선" aria-label="취소선" aria-pressed="false"><span class="discussion-editor-icon-strike" aria-hidden="true">S</span></button>
                  <input class="discussion-editor-color" type="color" value="#111111" data-editor-color title="글자색" aria-label="글자색">
                </div>
                <div class="discussion-editor-tool-group" role="group" aria-label="목록">
                  <button class="discussion-editor-tool" type="button" data-editor-command="bulletList" title="글머리 기호 목록" aria-label="글머리 기호 목록" aria-pressed="false"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M8 5h9M8 10h9M8 15h9"></path><circle cx="3.5" cy="5" r=".8"></circle><circle cx="3.5" cy="10" r=".8"></circle><circle cx="3.5" cy="15" r=".8"></circle></svg></button>
                  <button class="discussion-editor-tool" type="button" data-editor-command="orderedList" title="번호 목록" aria-label="번호 목록" aria-pressed="false"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M8 5h9M8 10h9M8 15h9M2.5 3.5h1v4M2 7.5h3M2 11.5c0-2 3-2 3 0 0 1-3 2-3 4h3"></path></svg></button>
                </div>
                <div class="discussion-editor-tool-group" role="group" aria-label="문단 정렬">
                  <button class="discussion-editor-tool" type="button" data-editor-command="alignLeft" title="왼쪽 정렬" aria-label="왼쪽 정렬" aria-pressed="false"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 4h14M3 8h9M3 12h14M3 16h9"></path></svg></button>
                  <button class="discussion-editor-tool" type="button" data-editor-command="alignCenter" title="가운데 정렬" aria-label="가운데 정렬" aria-pressed="false"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 4h14M5.5 8h9M3 12h14M5.5 16h9"></path></svg></button>
                  <button class="discussion-editor-tool" type="button" data-editor-command="alignRight" title="오른쪽 정렬" aria-label="오른쪽 정렬" aria-pressed="false"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 4h14M8 8h9M3 12h14M8 16h9"></path></svg></button>
                </div>
                <div class="discussion-editor-tool-group" role="group" aria-label="표와 링크">
                  <select class="discussion-editor-table" data-editor-table title="표" aria-label="표"><option value="">표</option><option value="insert">표 삽입</option><option value="addRow">행 추가</option><option value="addColumn">열 추가</option><option value="deleteRow">행 삭제</option><option value="deleteColumn">열 삭제</option><option value="deleteTable">표 삭제</option></select>
                  <button class="discussion-editor-tool" type="button" data-editor-command="link" title="링크" aria-label="링크" aria-pressed="false"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m8 6 2-2a4 4 0 0 1 6 6l-2 2M6 8l-2 2a4 4 0 0 0 6 6l2-2M7 13l6-6"></path></svg></button>
                  <button class="discussion-editor-tool" type="button" data-editor-command="clear" title="서식 지우기" aria-label="서식 지우기"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 3h12M9 3l-3 14M12 12l5 5M17 12l-5 5"></path></svg></button>
                </div>
                <div class="discussion-editor-tool-group" role="group" aria-label="실행 취소와 다시 실행">
                  <button class="discussion-editor-tool" type="button" data-editor-command="undo" title="실행 취소" aria-label="실행 취소"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 3-4 4 4 4M3 7h9a5 5 0 0 1 0 10H9"></path></svg></button>
                  <button class="discussion-editor-tool" type="button" data-editor-command="redo" title="다시 실행" aria-label="다시 실행"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m13 3 4 4-4 4M17 7H8a5 5 0 0 0 0 10h3"></path></svg></button>
                </div>
              </div>
            </div>
            <div id="discussion-body" class="discussion-rich-editor" data-discussion-composer></div>
          </div>
          <textarea name="body" data-discussion-body-value hidden></textarea>
        </div>
        <div class="discussion-field">
          <label for="discussion-files">사진·파일 첨부</label>
          <input id="discussion-files" name="attachments" type="file" multiple aria-describedby="discussion-files-hint" data-discussion-files>
          <p class="discussion-hint" id="discussion-files-hint">최대 5개, 파일당 10MB</p>
          <ul class="discussion-editor-attachments" data-discussion-editor-attachments></ul>
        </div>
        <div class="discussion-field">
          <label for="discussion-password">비밀번호(4자 이상)</label>
          <input id="discussion-password" name="password" type="password" required minlength="4" maxlength="128" autocomplete="new-password" aria-describedby="discussion-password-hint">
          <p class="discussion-hint" id="discussion-password-hint">비밀번호는 수정·삭제에 사용됩니다.</p>
        </div>
        <div class="discussion-trap" aria-hidden="true"><label for="discussion-website">Website</label><input id="discussion-website" name="website" tabindex="-1" autocomplete="off"></div>
        <p class="discussion-form-error" data-form-error role="alert" hidden></p>
        <p class="discussion-upload-status" data-discussion-upload-status role="status" aria-live="polite" hidden></p>
        <div class="board-post__actions">
          <a class="board-button" data-discussion-saved-post hidden>저장된 글 보기</a>
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
    <div class="board-attachments discussion-post-attachments" data-discussion-post-attachments hidden>
      <h2>첨부파일</h2>
      <ul data-discussion-post-attachment-list></ul>
    </div>
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
              <label for="discussion-comment-password">비밀번호(4자 이상)</label>
              <input id="discussion-comment-password" name="password" type="password" required minlength="4" maxlength="128" autocomplete="new-password" aria-describedby="discussion-comment-password-hint">
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
          <label for="discussion-delete-password">비밀번호(4자 이상)</label>
          <input id="discussion-delete-password" name="password" type="password" required minlength="4" maxlength="128" autocomplete="current-password">
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

<script src="{{ '/assets/discussion-rich-editor.js' | relative_url }}?v={{ site.time | date: '%s' }}" defer></script>
