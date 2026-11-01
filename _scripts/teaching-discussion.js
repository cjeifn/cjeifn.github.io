(() => {
  const init = () => {
    const root = document.querySelector("[data-discussion-board]");
    if (!root) return;

    const select = (selector) => root.querySelector(selector);
    const endpoint = root.dataset.discussionEndpoint.replace(/\/$/, "");
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const preview = location.pathname.startsWith("/preview/");
    const searchForm = select("[data-discussion-search]");
    const editorForm = select("[data-discussion-editor]");
    const commentForm = select("[data-discussion-comment-form]");
    const deleteForm = select("[data-discussion-delete-form]");
    const deleteDialog = select("[data-discussion-delete-dialog]");
    const retryButton = select("[data-discussion-retry]");
    const statusBack = select("[data-discussion-status-back]");
    const rows = select("[data-discussion-rows]");
    const pagination = select("[data-discussion-pagination]");
    const requestKeys = new WeakMap();
    const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
      timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit",
    });
    let route = { q: "", page: 1, id: null, mode: "list" };
    let routeVersion = 0;
    let readController;
    let currentPost;
    let deleteTarget;
    let deleteReturnFocus;
    let memoryVisitId;

    const element = (tag, className, text) => {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (text !== undefined) node.textContent = String(text);
      return node;
    };
    const number = (value) => Number.isSafeInteger(value) && value >= 0
      ? value.toLocaleString("ko-KR") : "—";
    const dateText = (value) => {
      const date = new Date(value);
      if (!Number.isFinite(date.getTime())) return "—";
      const parts = Object.fromEntries(dateFormatter.formatToParts(date)
        .map((part) => [part.type, part.value]));
      return `${parts.year}-${parts.month}-${parts.day}`;
    };
    const timeElement = (value) => {
      const node = element("time", "", dateText(value));
      const date = new Date(value);
      if (Number.isFinite(date.getTime())) node.dateTime = date.toISOString();
      return node;
    };
    const uuid = () => {
      if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
      const bytes = crypto.getRandomValues(new Uint8Array(16));
      bytes[6] = (bytes[6] & 15) | 64;
      bytes[8] = (bytes[8] & 63) | 128;
      const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    };
    const visitId = () => {
      if (memoryVisitId) return memoryVisitId;
      try {
        const stored = sessionStorage.getItem("ifn-discussion-visit-v1");
        memoryVisitId = stored && uuidPattern.test(stored) ? stored : uuid();
        sessionStorage.setItem("ifn-discussion-visit-v1", memoryVisitId);
      } catch {
        memoryVisitId = uuid();
      }
      return memoryVisitId;
    };
    const requestId = (form, payload) => {
      const signature = JSON.stringify(payload);
      let saved = requestKeys.get(form);
      if (!saved || saved.signature !== signature) {
        saved = { signature, id: uuid() };
        requestKeys.set(form, saved);
      }
      return saved.id;
    };
    const clearRequestId = (form, id) => {
      if (requestKeys.get(form)?.id === id) requestKeys.delete(form);
    };

    class ApiError extends Error {
      constructor(message, status = 0) {
        super(message);
        this.status = status;
      }
    }
    const api = async (path, { method = "GET", body, signal } = {}) => {
      const controller = new AbortController();
      let timedOut = false;
      const cancel = () => controller.abort();
      if (signal?.aborted) cancel();
      else signal?.addEventListener("abort", cancel, { once: true });
      const timer = setTimeout(() => { timedOut = true; cancel(); }, 20000);
      try {
        const response = await fetch(`${endpoint}${path}`, {
          method,
          headers: { Accept: "application/json", ...(body ? { "Content-Type": "application/json" } : {}) },
          ...(body ? { body: JSON.stringify(body) } : {}),
          credentials: "omit",
          cache: "no-store",
          referrerPolicy: "no-referrer",
          signal: controller.signal,
        });
        let data;
        try { data = await response.json(); } catch { throw new ApiError("응답을 확인하지 못했습니다. 다시 시도해 주세요.", response.status); }
        if (!response.ok) {
          const message = typeof data.message === "string" ? data.message : "요청을 처리하지 못했습니다. 다시 시도해 주세요.";
          throw new ApiError(message, response.status);
        }
        return data;
      } catch (error) {
        if (signal?.aborted) throw error;
        if (timedOut) throw new ApiError("응답이 지연되고 있습니다. 입력한 내용은 유지되며 다시 시도할 수 있습니다.");
        if (error instanceof ApiError) throw error;
        throw new ApiError("연결하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      } finally {
        clearTimeout(timer);
        signal?.removeEventListener("abort", cancel);
      }
    };

    const notice = (message = "", { retry = false, back = false, error = false } = {}) => {
      const container = select("[data-discussion-notice]");
      const status = select("[data-discussion-status]");
      status.setAttribute("role", error ? "alert" : "status");
      status.textContent = message;
      container.hidden = !message;
      retryButton.hidden = !retry;
      statusBack.hidden = !back;
    };
    const formError = (form, message = "") => {
      const error = form.querySelector("[data-form-error]");
      error.textContent = message;
      error.hidden = !message;
    };
    const busy = (form, value) => {
      form.dataset.busy = String(value);
      form.setAttribute("aria-busy", String(value));
      Array.from(form.elements).forEach((control) => { control.disabled = value; });
    };
    const value = (form, name) => form.elements.namedItem(name).value;
    const payload = (form, includeTitle = false) => ({
      author: value(form, "author").trim(),
      ...(includeTitle ? { title: value(form, "title").trim() } : {}),
      body: value(form, "body").trim(),
      password: value(form, "password"),
    });
    const validText = (form, data) => {
      if (!form.reportValidity()) return false;
      if (!data.author || !data.body || ("title" in data && !data.title)) {
        formError(form, "공백만 입력할 수 없습니다.");
        return false;
      }
      return true;
    };
    const showView = (name) => {
      root.querySelectorAll("[data-discussion-view]").forEach((view) => {
        view.hidden = view.dataset.discussionView !== name;
      });
    };
    const readRoute = () => {
      const params = new URLSearchParams(location.hash.slice(1));
      const rawPage = Number(params.get("page") || 1);
      const id = params.get("post")?.toLowerCase() || null;
      return {
        q: (params.get("q") || "").slice(0, 150),
        page: Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1,
        id,
        mode: id ? (params.get("edit") === "1" ? "edit" : "detail")
          : params.get("write") === "1" ? "write" : "list",
      };
    };
    const hash = (next) => {
      const params = new URLSearchParams();
      if (next.id) params.set("post", next.id);
      if (next.mode === "edit") params.set("edit", "1");
      if (next.mode === "write") params.set("write", "1");
      if (next.q) params.set("q", next.q);
      if (next.page > 1) params.set("page", String(next.page));
      const text = params.toString();
      return text ? `#${text}` : "";
    };
    const navigate = (changes, replace = false) => {
      const next = { q: route.q, page: route.page, id: null, mode: "list", ...changes };
      const nextHash = hash(next);
      if (replace) {
        history.replaceState(null, "", `${location.pathname}${location.search}${nextHash}`);
        loadRoute(true);
      } else if (location.hash === nextHash) loadRoute(true);
      else location.hash = nextHash;
    };
    const tableMessage = (message) => {
      const row = element("tr");
      const cell = element("td", "resource-board__empty", message);
      cell.colSpan = 4;
      row.append(cell);
      rows.replaceChildren(row);
    };
    const paginationButton = (label, page, current = false) => {
      const button = element("button", "", label);
      button.type = "button";
      button.setAttribute("aria-label", typeof label === "number" ? `${page} 페이지` : `${label} 페이지`);
      if (current) button.setAttribute("aria-current", "page");
      button.addEventListener("click", () => navigate({ page }));
      return button;
    };
    const renderPagination = (total, page, pageSize) => {
      pagination.replaceChildren();
      const count = Math.ceil(total / pageSize);
      if (!count) return;
      const end = Math.min(count, Math.max(5, page + 2));
      const start = Math.max(1, end - 4);
      if (page > 1) pagination.append(paginationButton("이전", page - 1));
      if (start > 1) {
        pagination.append(paginationButton(1, 1));
        if (start > 2) pagination.append(element("span", "", "…"));
      }
      for (let n = start; n <= end; n++) pagination.append(paginationButton(n, n, n === page));
      if (end < count) {
        if (end < count - 1) pagination.append(element("span", "", "…"));
        pagination.append(paginationButton(count, count));
      }
      if (page < count) pagination.append(paginationButton("다음", page + 1));
    };
    const renderList = (data) => {
      if (!Array.isArray(data.posts) || !Number.isSafeInteger(data.total) || data.total < 0) throw new ApiError("목록을 확인하지 못했습니다. 다시 시도해 주세요.");
      const page = Number.isSafeInteger(data.page) && data.page > 0 ? data.page : route.page;
      const pageSize = Number.isSafeInteger(data.pageSize) && data.pageSize > 0 ? data.pageSize : 15;
      select("[data-discussion-total]").textContent = number(data.total);
      if (data.total > 0 && page > Math.ceil(data.total / pageSize)) {
        navigate({ page: Math.ceil(data.total / pageSize) }, true);
        return;
      }
      const fragment = document.createDocumentFragment();
      for (const [index, post] of data.posts.entries()) {
        if (!uuidPattern.test(post.id) || typeof post.title !== "string" || typeof post.author !== "string") throw new ApiError("목록을 확인하지 못했습니다. 다시 시도해 주세요.");
        const row = element("tr");
        row.append(element("td", "resource-board__number", number(data.total - (page - 1) * pageSize - index)));
        const titleCell = element("td", "resource-board__title");
        const link = element("a", "", post.title);
        link.href = hash({ q: route.q, page, id: post.id });
        titleCell.append(link);
        const comments = Number.isSafeInteger(post.commentCount) && post.commentCount > 0 ? ` · 댓글 ${number(post.commentCount)}` : "";
        titleCell.append(element("span", "discussion-row-author", `${post.author}${comments}`));
        row.append(titleCell);
        const dateCell = element("td", "resource-board__date");
        dateCell.append(timeElement(post.createdAt));
        row.append(dateCell, element("td", "resource-board__views", number(post.views)));
        fragment.append(row);
      }
      rows.replaceChildren(fragment);
      if (!data.posts.length) tableMessage(route.q ? "검색 결과가 없습니다." : "게시글이 없습니다.");
      renderPagination(data.total, page, pageSize);
    };

    const renderComments = () => {
      const comments = Array.isArray(currentPost.comments) ? currentPost.comments : [];
      const fragment = document.createDocumentFragment();
      for (const comment of comments) {
        if (!uuidPattern.test(comment.id) || typeof comment.author !== "string" || typeof comment.body !== "string") continue;
        const item = element("li", "discussion-comment");
        const meta = element("div", "discussion-comment-meta");
        meta.append(element("strong", "", comment.author), timeElement(comment.createdAt));
        const actions = element("div", "discussion-comment-actions");
        const remove = element("button", "board-button", "삭제");
        remove.type = "button";
        remove.setAttribute("aria-label", `${comment.author} 댓글 삭제`);
        remove.addEventListener("click", () => openDelete("comment", comment.id, remove));
        actions.append(remove);
        item.append(meta, element("p", "discussion-comment-body", comment.body), actions);
        fragment.append(item);
      }
      select("[data-discussion-comments]").replaceChildren(fragment);
      select("[data-discussion-comment-total]").textContent = number(comments.length);
      select("[data-discussion-comments-empty]").hidden = comments.length > 0;
    };
    const renderDetail = (post) => {
      select("[data-discussion-post-title]").textContent = post.title;
      select("[data-discussion-post-author]").textContent = post.author;
      const date = select("[data-discussion-post-date]");
      date.textContent = dateText(post.createdAt);
      date.dateTime = post.createdAt;
      select("[data-discussion-post-views]").textContent = number(post.views);
      select("[data-discussion-post-body]").textContent = post.body;
      renderComments();
    };
    const openEditor = (post) => {
      editorForm.reset();
      formError(editorForm);
      busy(editorForm, false);
      select("[data-discussion-editor-title]").textContent = post ? "글 수정" : "글쓰기";
      select("[data-discussion-editor-submit]").textContent = post ? "수정" : "등록";
      editorForm.elements.namedItem("password").autocomplete = post ? "current-password" : "new-password";
      for (const name of ["author", "title", "body"]) editorForm.elements.namedItem(name).value = post?.[name] || "";
      showView("editor");
    };
    const updateViews = async (id, version) => {
      if (preview) return;
      try {
        const data = await api(`/${encodeURIComponent(id)}/view`, { method: "POST", body: { visitId: visitId() } });
        if (version === routeVersion && currentPost?.id === id && Number.isSafeInteger(data.views) && data.views >= 0) {
          currentPost.views = data.views;
          select("[data-discussion-post-views]").textContent = number(data.views);
        }
      } catch {
        // The detail GET already supplied a valid count; keep it if the update is unavailable.
      }
    };

    const loadRoute = async (focus = false) => {
      const version = ++routeVersion;
      readController?.abort();
      readController = new AbortController();
      const signal = readController.signal;
      route = readRoute();
      currentPost = null;
      if (deleteDialog.open) deleteDialog.close();
      notice();
      editorForm.elements.namedItem("password").value = "";
      commentForm.reset();
      formError(commentForm);
      busy(commentForm, false);
      if (route.mode === "write") {
        openEditor();
        if (focus) select("[data-discussion-editor-title]").focus();
        return;
      }
      if (route.id && !uuidPattern.test(route.id)) {
        showView("");
        notice("게시글 주소가 올바르지 않습니다.", { back: true, error: true });
        return;
      }
      if (route.mode === "list") {
        showView("list");
        searchForm.elements.namedItem("q").value = route.q;
        busy(searchForm, true);
        tableMessage("불러오는 중...");
        pagination.replaceChildren();
        try {
          const query = new URLSearchParams({ q: route.q, page: String(route.page), limit: "15" });
          const data = await api(`?${query}`, { signal });
          if (version !== routeVersion) return;
          renderList(data);
          if (focus) (rows.querySelector("a") || select("[data-discussion-write]")).focus();
        } catch (error) {
          if (version !== routeVersion || signal.aborted) return;
          tableMessage("목록을 불러오지 못했습니다.");
          notice(error.message, { retry: true, error: true });
        } finally {
          if (version === routeVersion) busy(searchForm, false);
        }
        return;
      }
      showView("");
      notice("불러오는 중...", { back: true });
      try {
        const data = await api(`/${encodeURIComponent(route.id)}`, { signal });
        if (version !== routeVersion) return;
        const post = data.post;
        if (!post || post.id !== route.id || typeof post.title !== "string" || typeof post.author !== "string" || typeof post.body !== "string") throw new ApiError("게시글을 확인하지 못했습니다. 다시 시도해 주세요.");
        currentPost = post;
        notice();
        if (route.mode === "edit") {
          openEditor(post);
          if (focus) select("[data-discussion-editor-title]").focus();
        } else {
          renderDetail(post);
          showView("detail");
          if (focus) select("[data-discussion-post-title]").focus();
          updateViews(post.id, version);
        }
      } catch (error) {
        if (version !== routeVersion || signal.aborted) return;
        notice(error.message, { retry: error.status !== 404, back: true, error: true });
      }
    };

    const openDelete = (type, id, trigger) => {
      if (!currentPost) return;
      deleteTarget = { type, id, postId: currentPost.id };
      deleteReturnFocus = trigger;
      deleteForm.reset();
      formError(deleteForm);
      busy(deleteForm, false);
      select("[data-discussion-delete-title]").textContent = type === "post" ? "글 삭제" : "댓글 삭제";
      select("[data-discussion-delete-message]").textContent = type === "post"
        ? "게시글과 댓글을 삭제하시겠습니까?" : "댓글을 삭제하시겠습니까?";
      deleteDialog.showModal();
      deleteForm.elements.namedItem("password").focus();
    };

    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (searchForm.dataset.busy === "true") return;
      navigate({ q: value(searchForm, "q").trim(), page: 1 });
    });
    searchForm.elements.namedItem("q").addEventListener("search", () => {
      if (!value(searchForm, "q") && searchForm.dataset.busy !== "true") navigate({ q: "", page: 1 });
    });
    select("[data-discussion-write]").addEventListener("click", () => navigate({ mode: "write" }));
    select("[data-discussion-back]").addEventListener("click", () => navigate({}));
    statusBack.addEventListener("click", () => navigate({}));
    retryButton.addEventListener("click", () => loadRoute(true));
    select("[data-discussion-edit]").addEventListener("click", () => {
      if (currentPost) navigate({ id: currentPost.id, mode: "edit" });
    });
    select("[data-discussion-delete-post]").addEventListener("click", (event) => {
      if (currentPost) openDelete("post", currentPost.id, event.currentTarget);
    });
    select("[data-discussion-editor-cancel]").addEventListener("click", () => {
      navigate(route.mode === "edit" ? { id: route.id, mode: "detail" } : {});
    });

    editorForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (editorForm.dataset.busy === "true") return;
      formError(editorForm);
      const data = payload(editorForm, true);
      if (!validText(editorForm, data)) return;
      const version = routeVersion;
      const editing = route.mode === "edit";
      const path = editing ? `/${encodeURIComponent(route.id)}` : "";
      if (!editing) {
        data.website = value(editorForm, "website");
        data.requestId = requestId(editorForm, data);
      }
      busy(editorForm, true);
      try {
        const result = await api(path, { method: editing ? "PATCH" : "POST", body: data });
        if (!result.post || !uuidPattern.test(result.post.id)) throw new ApiError("저장 결과를 확인하지 못했습니다. 다시 시도해 주세요.");
        if (version === routeVersion) {
          if (!editing) clearRequestId(editorForm, data.requestId);
          editorForm.reset();
          navigate({ id: result.post.id, mode: "detail" });
        }
      } catch (error) {
        if (version === routeVersion) formError(editorForm, error.message);
      } finally {
        if (version === routeVersion) busy(editorForm, false);
      }
    });

    commentForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!currentPost || commentForm.dataset.busy === "true") return;
      formError(commentForm);
      const data = payload(commentForm);
      if (!validText(commentForm, data)) return;
      data.website = value(commentForm, "website");
      data.requestId = requestId(commentForm, { post: currentPost.id, ...data });
      const postId = currentPost.id;
      const version = routeVersion;
      busy(commentForm, true);
      try {
        const result = await api(`/${encodeURIComponent(postId)}/comments`, { method: "POST", body: data });
        const comment = result.comment;
        if (!comment || !uuidPattern.test(comment.id) || typeof comment.body !== "string" || typeof comment.author !== "string") throw new ApiError("등록 결과를 확인하지 못했습니다. 다시 시도해 주세요.");
        if (version === routeVersion && currentPost?.id === postId) {
          clearRequestId(commentForm, data.requestId);
          currentPost.comments = (currentPost.comments || []).filter((item) => item.id !== comment.id);
          currentPost.comments.push(comment);
          renderComments();
          commentForm.reset();
          notice("댓글을 등록했습니다.");
        }
      } catch (error) {
        if (version === routeVersion) formError(commentForm, error.message);
      } finally {
        if (version === routeVersion) busy(commentForm, false);
      }
    });

    select("[data-discussion-delete-cancel]").addEventListener("click", () => deleteDialog.close());
    deleteDialog.addEventListener("cancel", (event) => {
      if (deleteForm.dataset.busy === "true") event.preventDefault();
    });
    deleteDialog.addEventListener("close", () => {
      deleteForm.reset();
      deleteTarget = null;
      if (deleteReturnFocus?.isConnected) deleteReturnFocus.focus();
    });
    deleteForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!deleteTarget || deleteForm.dataset.busy === "true" || !deleteForm.reportValidity()) return;
      formError(deleteForm);
      const target = { ...deleteTarget };
      const version = routeVersion;
      const path = target.type === "post" ? `/${encodeURIComponent(target.id)}`
        : `/${encodeURIComponent(target.postId)}/comments/${encodeURIComponent(target.id)}`;
      const data = { password: value(deleteForm, "password") };
      busy(deleteForm, true);
      try {
        try { await api(path, { method: "DELETE", body: data }); } catch (error) { if (error.status !== 404) throw error; }
        if (version !== routeVersion) return;
        deleteDialog.close();
        if (target.type === "post") navigate({});
        else if (currentPost?.id === target.postId) {
          currentPost.comments = (currentPost.comments || []).filter((comment) => comment.id !== target.id);
          renderComments();
          notice("댓글을 삭제했습니다.");
          const heading = select("[data-discussion-comment-total]").parentElement;
          heading.tabIndex = -1;
          heading.focus();
        }
      } catch (error) {
        if (version === routeVersion) formError(deleteForm, error.message);
      } finally {
        if (version === routeVersion) busy(deleteForm, false);
      }
    });

    window.addEventListener("hashchange", () => loadRoute(true));
    window.addEventListener("pageshow", (event) => {
      if (event.persisted && route.mode === "list") loadRoute(false);
    });
    loadRoute(false);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
