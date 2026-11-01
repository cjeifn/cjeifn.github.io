(() => {
  const init = () => {
    const root = document.querySelector("[data-discussion-board]");
    if (!root) return;

    const select = (selector) => root.querySelector(selector);
    const endpoint = root.dataset.discussionEndpoint.replace(/\/$/, "");
    const endpointUrl = new URL(endpoint, location.href);
    const imageTypes = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);
    const maximumFiles = 5;
    const maximumFileSize = 10 * 1024 * 1024;
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const preview = location.pathname.startsWith("/preview/");
    const searchForm = select("[data-discussion-search]");
    const editorForm = select("[data-discussion-editor]");
    const fileInput = select("[data-discussion-files]");
    const photoInput = select("[data-discussion-photo-input]");
    const composer = select("[data-discussion-composer]");
    const bodyValue = select("[data-discussion-body-value]");
    const savedPostLink = select("[data-discussion-saved-post]");
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
    let editorDraft;
    let deleteTarget;
    let deleteReturnFocus;
    let memoryVisitId;
    let editorSelection;

    const imageMarkerPattern = /\[\[ifn-image:([0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})\]\]/gi;
    const imageMarker = (id) => `[[ifn-image:${id.toLowerCase()}]]`;
    const bodyParts = (body) => {
      const parts = [];
      let offset = 0;
      for (const match of body.matchAll(imageMarkerPattern)) {
        parts.push({ text: body.slice(offset, match.index) }, { id: match[1].toLowerCase() });
        offset = match.index + match[0].length;
      }
      parts.push({ text: body.slice(offset) });
      return parts;
    };

    const element = (tag, className, text) => {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (text !== undefined) node.textContent = String(text);
      return node;
    };
    const number = (value) => Number.isSafeInteger(value) && value >= 0
      ? value.toLocaleString("ko-KR") : "—";
    const categoryLabel = (category) => category === "case" ? "사례 공유" : "질문";
    const displayTitle = (post) => `[${categoryLabel(post.category)}] ${post.title}`;
    const fileSize = (size) => size >= 1024 * 1024
      ? `${(size / (1024 * 1024)).toFixed(1)}MB` : `${Math.max(1, Math.ceil(size / 1024))}KB`;
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
    const api = async (path, { method = "GET", body, signal, timeout = 20000 } = {}) => {
      const controller = new AbortController();
      const multipart = body instanceof FormData;
      let timedOut = false;
      const cancel = () => controller.abort();
      if (signal?.aborted) cancel();
      else signal?.addEventListener("abort", cancel, { once: true });
      const timer = setTimeout(() => { timedOut = true; cancel(); }, timeout);
      try {
        const response = await fetch(`${endpoint}${path}`, {
          method,
          headers: { Accept: "application/json", ...(body && !multipart ? { "Content-Type": "application/json" } : {}) },
          ...(body ? { body: multipart ? body : JSON.stringify(body) } : {}),
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
      if (form === editorForm) {
        composer.contentEditable = String(!value);
        composer.setAttribute("aria-disabled", String(value));
      }
    };
    const value = (form, name) => form.elements.namedItem(name).value;
    const payload = (form, includeTitle = false) => ({
      author: value(form, "author").trim(),
      ...(includeTitle ? { title: value(form, "title").trim(), category: value(form, "category") } : {}),
      body: value(form, "body").trim(),
      password: value(form, "password"),
    });
    const validText = (form, data) => {
      if (!form.reportValidity()) return false;
      if (!data.author || !data.body || ("title" in data && !data.title)) {
        formError(form, "공백만 입력할 수 없습니다.");
        if (form === editorForm && !data.body) composer.focus();
        return false;
      }
      if (form === editorForm && Array.from(data.body.normalize("NFC")).length > 20000) {
        formError(form, "내용은 사진 위치를 포함해 20,000자까지 입력할 수 있습니다.");
        composer.setAttribute("aria-invalid", "true");
        composer.focus();
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
        const link = element("a", "", displayTitle(post));
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

    const attachmentUrl = (raw) => {
      if (typeof raw !== "string" || !raw) return null;
      try {
        const url = new URL(raw, endpointUrl);
        const local = (host) => ["localhost", "127.0.0.1", "[::1]"].includes(host);
        const localPreview = local(location.hostname) && local(url.hostname);
        const allowedOrigin = url.origin === endpointUrl.origin || url.origin === location.origin || localPreview;
        if (!allowedOrigin || url.username || url.password) return null;
        if (url.protocol !== "https:" && !(url.protocol === "http:" && localPreview)) return null;
        return url.href;
      } catch { return null; }
    };
    const validAttachment = (attachment) => attachment && uuidPattern.test(attachment.id)
      && typeof attachment.name === "string" && Number.isSafeInteger(attachment.size) && attachment.size >= 0;
    const attachmentImage = (attachment) => attachment.isImage === true
      && imageTypes.has(String(attachment.mimeType).toLowerCase()) ? attachmentUrl(attachment.url) : null;
    const makeImage = (src, name, className = "") => {
      const image = element("img", className);
      image.src = src;
      image.alt = name;
      image.loading = "lazy";
      image.decoding = "async";
      image.addEventListener("error", () => { image.hidden = true; });
      return image;
    };
    const editorImage = (id) => {
      const draft = editorDraft;
      if (!draft) return null;
      const attachment = draft.attachments.find((item) => item.id.toLowerCase() === id);
      if (attachment) {
        const src = attachmentImage(attachment);
        return src ? { src, name: attachment.name } : null;
      }
      const entry = draft.files.find((item) => item.requestId === id);
      return entry?.previewUrl ? { src: entry.previewUrl, name: entry.file.name } : null;
    };
    const blockNode = (node) => node.nodeType === Node.ELEMENT_NODE
      && ["DIV", "P", "FIGURE", "LI", "UL", "OL", "BLOCKQUOTE"].includes(node.tagName);
    const serializeChildren = (parent, includeRemoved = false) => {
      let text = "";
      let previousBlock = false;
      const nodes = Array.from(parent.childNodes).filter((node) => includeRemoved || node.dataset?.bodyRemoved !== "true");
      nodes.forEach((node, index) => {
        let part = "";
        if (node.nodeType === Node.TEXT_NODE) part = node.nodeValue;
        else if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.dataset.bodyImage && uuidPattern.test(node.dataset.bodyImage)) part = imageMarker(node.dataset.bodyImage);
          else if (node.tagName === "BR") part = parent.childNodes.length === 1 ? "" : "\n";
          else if (!["BUTTON", "IMG", "SCRIPT", "STYLE"].includes(node.tagName)) part = serializeChildren(node, includeRemoved);
        }
        const block = blockNode(node);
        if (index > 0 && (block || previousBlock)) text += "\n";
        text += part;
        previousBlock = block;
      });
      return text;
    };
    const syncBody = () => {
      const body = serializeChildren(composer).replace(/\r\n?/g, "\n").normalize("NFC");
      bodyValue.value = body;
      composer.setAttribute("aria-invalid", String(Array.from(body.trim()).length > 20000));
      return body.trim();
    };
    const editorLine = (text = "") => {
      const line = element("div", "discussion-editor-line");
      if (text) line.append(document.createTextNode(text));
      else line.append(document.createElement("br"));
      return line;
    };
    const insideComposer = (node) => node && (node === composer || composer.contains(node));
    const validEditorRange = (range) => range && insideComposer(range.startContainer) && insideComposer(range.endContainer);
    const rememberSelection = () => {
      const selection = window.getSelection();
      if (selection?.rangeCount && validEditorRange(selection.getRangeAt(0))) editorSelection = selection.getRangeAt(0).cloneRange();
    };
    const focusRange = (range) => {
      composer.focus();
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      editorSelection = range.cloneRange();
    };
    const focusLine = (node) => {
      const range = document.createRange();
      range.selectNodeContents(node);
      range.collapse(true);
      focusRange(range);
    };
    const currentEditorRange = () => {
      rememberSelection();
      const range = validEditorRange(editorSelection) ? editorSelection.cloneRange() : document.createRange();
      if (!validEditorRange(range)) {
        range.selectNodeContents(composer);
        range.collapse(false);
      }
      // A selected image's own controls must never become an insertion target.
      const owner = range.startContainer.nodeType === Node.ELEMENT_NODE ? range.startContainer : range.startContainer.parentElement;
      const figure = owner?.closest("[data-body-image]");
      if (figure && composer.contains(figure)) {
        range.setStartAfter(figure);
        range.collapse(true);
      }
      return range;
    };
    const editorFigure = (id) => {
      const figure = element("figure", "discussion-inline-photo");
      figure.dataset.bodyImage = id;
      figure.contentEditable = "false";
      if (editorDraft?.removals.has(id)) {
        figure.hidden = true;
        figure.dataset.bodyRemoved = "true";
      }
      const photo = editorImage(id);
      if (photo) figure.append(makeImage(photo.src, photo.name));
      else figure.append(element("span", "discussion-missing-photo", "사진을 불러올 수 없습니다."));
      const remove = element("button", "board-button discussion-inline-photo-remove", "사진 제거");
      remove.type = "button";
      remove.setAttribute("aria-label", `${photo?.name || "사진"} 본문에서 제거`);
      remove.addEventListener("click", () => {
        if (editorForm.dataset.busy === "true") return;
        let next = figure.nextElementSibling;
        if (!next || next.dataset.bodyImage) {
          next = editorLine();
          figure.after(next);
        }
        figure.remove();
        syncBody();
        focusLine(next);
      });
      figure.append(remove);
      return figure;
    };
    const renderEditorBody = (body) => {
      const parts = bodyParts(body);
      const fragment = document.createDocumentFragment();
      for (const [index, part] of parts.entries()) {
        if (part.id) fragment.append(editorFigure(part.id));
        else {
          let text = part.text.replace(/\r\n?/g, "\n");
          if (parts[index - 1]?.id && text.startsWith("\n")) text = text.slice(1);
          if (parts[index + 1]?.id && text.endsWith("\n")) text = text.slice(0, -1);
          if (text || (!parts[index - 1]?.id && !parts[index + 1]?.id)) {
            text.split("\n").forEach((line) => fragment.append(editorLine(line)));
          }
        }
      }
      if (!fragment.childNodes.length || fragment.lastElementChild?.dataset.bodyImage) fragment.append(editorLine());
      composer.replaceChildren(fragment);
      editorSelection = null;
      syncBody();
    };
    const insertEditorContent = ({ text, id }) => {
      if (!editorDraft || editorForm.dataset.busy === "true") return;
      const range = currentEditorRange();
      range.deleteContents();
      const beforeRange = document.createRange();
      beforeRange.selectNodeContents(composer);
      beforeRange.setEnd(range.startContainer, range.startOffset);
      const afterRange = document.createRange();
      afterRange.selectNodeContents(composer);
      afterRange.setStart(range.endContainer, range.endOffset);
      if (!id) {
        const node = document.createTextNode(text.replace(/\r\n?/g, "\n"));
        range.insertNode(node);
        range.setStartAfter(node);
        range.collapse(true);
        focusRange(range);
        syncBody();
        return;
      }
      const before = serializeChildren(beforeRange.cloneContents(), true);
      const after = serializeChildren(afterRange.cloneContents(), true);
      const figureIndex = bodyParts(before).filter((part) => part.id).length;
      renderEditorBody(`${before}\n${imageMarker(id)}\n${after}`);
      const inserted = composer.querySelectorAll("[data-body-image]")[figureIndex];
      let next = inserted.nextElementSibling;
      if (!next || next.dataset.bodyImage) {
        next = editorLine();
        inserted.after(next);
      }
      focusLine(next);
    };
    const removeBodyImages = (id) => {
      composer.querySelectorAll("[data-body-image]").forEach((figure) => {
        if (figure.dataset.bodyImage === id.toLowerCase()) figure.remove();
      });
      if (!composer.childNodes.length) composer.append(editorLine());
      editorSelection = null;
      syncBody();
    };
    const markBodyImagesRemoved = (id, removed) => {
      composer.querySelectorAll("[data-body-image]").forEach((figure) => {
        if (figure.dataset.bodyImage !== id.toLowerCase()) return;
        figure.hidden = removed;
        if (removed) figure.dataset.bodyRemoved = "true";
        else delete figure.dataset.bodyRemoved;
      });
      editorSelection = null;
      syncBody();
    };
    const resolveBodyImage = (pendingId, attachment) => {
      let changed = false;
      composer.querySelectorAll("[data-body-image]").forEach((figure) => {
        if (figure.dataset.bodyImage !== pendingId) return;
        figure.replaceWith(editorFigure(attachment.id.toLowerCase()));
        changed = true;
      });
      if (changed) {
        editorSelection = null;
        syncBody();
      }
      return changed;
    };
    const renderPostBody = (post) => {
      const attachments = new Map((Array.isArray(post.attachments) ? post.attachments : [])
        .filter(validAttachment).map((attachment) => [attachment.id.toLowerCase(), attachment]));
      const usedImages = new Set();
      const fragment = document.createDocumentFragment();
      for (const part of bodyParts(post.body)) {
        if (!part.id) fragment.append(document.createTextNode(part.text));
        else {
          const attachment = attachments.get(part.id);
          const src = attachment && attachmentImage(attachment);
          if (src) {
            const figure = element("figure", "discussion-inline-photo");
            figure.append(makeImage(src, attachment.name));
            fragment.append(figure);
            usedImages.add(part.id);
          } else fragment.append(element("span", "discussion-missing-photo", "사진을 불러올 수 없습니다."));
        }
      }
      select("[data-discussion-post-body]").replaceChildren(fragment);
      return usedImages;
    };
    const renderPostAttachments = (post, usedImages = new Set()) => {
      const attachments = Array.isArray(post.attachments) ? post.attachments.filter(validAttachment) : [];
      const fragment = document.createDocumentFragment();
      for (const attachment of attachments) {
        const item = element("li");
        const src = attachmentImage(attachment);
        if (src && !usedImages.has(attachment.id.toLowerCase())) {
          const imageWrap = element("div", "discussion-attachment-image-wrap");
          imageWrap.append(makeImage(src, attachment.name, "discussion-attachment-image"));
          item.append(imageWrap);
        }
        const url = attachmentUrl(attachment.downloadUrl);
        const link = element(url ? "a" : "div", "board-attachment");
        if (url) {
          link.href = url;
          link.download = attachment.name;
        }
        const name = element("span", "board-attachment__name", attachment.name);
        name.append(element("span", "discussion-attachment-size", fileSize(attachment.size)));
        link.append(name);
        if (url) link.append(element("span", "board-attachment__download", "다운로드"));
        item.append(link);
        fragment.append(item);
      }
      select("[data-discussion-post-attachment-list]").replaceChildren(fragment);
      select("[data-discussion-post-attachments]").hidden = attachments.length === 0;
    };
    const releasePreview = (entry) => {
      if (entry.previewUrl) {
        URL.revokeObjectURL(entry.previewUrl);
        entry.previewUrl = "";
      }
    };
    const discardDraft = () => {
      if (editorDraft) editorDraft.files.forEach(releasePreview);
      editorDraft = null;
      editorSelection = null;
    };
    const uploadStatus = (message = "") => {
      const status = select("[data-discussion-upload-status]");
      status.textContent = message;
      status.hidden = !message;
    };
    const retainedFileCount = (draft) => draft.attachments.filter((attachment) => !draft.removals.has(attachment.id)).length + draft.files.length;
    const insertImageButton = (id, disabled) => {
      const button = element("button", "board-button", "본문에 넣기");
      button.type = "button";
      button.disabled = disabled;
      button.addEventListener("pointerdown", rememberSelection);
      button.addEventListener("click", () => insertEditorContent({ id }));
      return button;
    };
    const renderEditorAttachments = () => {
      const draft = editorDraft;
      const fragment = document.createDocumentFragment();
      if (!draft) return;
      const inFlight = editorForm.dataset.busy === "true";
      for (const attachment of draft.attachments) {
        const item = element("li", "discussion-editor-attachment");
        item.classList.toggle("is-removed", draft.removals.has(attachment.id));
        const src = attachmentImage(attachment);
        if (src) item.append(makeImage(src, attachment.name));
        const info = element("span", "discussion-editor-attachment-info", attachment.name);
        info.append(element("span", "discussion-attachment-size", fileSize(attachment.size)));
        const label = element("label", "discussion-attachment-remove");
        const checkbox = element("input");
        checkbox.type = "checkbox";
        checkbox.checked = draft.removals.has(attachment.id);
        checkbox.disabled = inFlight;
        checkbox.setAttribute("aria-label", `${attachment.name} 삭제`);
        checkbox.addEventListener("change", () => {
          if (editorDraft !== draft || editorForm.dataset.busy === "true") return;
          if (checkbox.checked) {
            draft.removals.add(attachment.id);
          }
          else draft.removals.delete(attachment.id);
          markBodyImagesRemoved(attachment.id, checkbox.checked);
          renderEditorAttachments();
        });
        label.append(checkbox, element("span", "", "삭제"));
        const actions = element("div", "discussion-attachment-actions");
        if (src) actions.append(insertImageButton(attachment.id.toLowerCase(), inFlight || checkbox.checked));
        actions.append(label);
        item.append(info, actions);
        fragment.append(item);
      }
      for (const entry of draft.files) {
        const item = element("li", "discussion-editor-attachment");
        if (entry.previewUrl) item.append(makeImage(entry.previewUrl, entry.file.name));
        const info = element("span", "discussion-editor-attachment-info", entry.file.name);
        info.append(element("span", "discussion-attachment-size", fileSize(entry.file.size)));
        if (entry.uncertain) info.append(element("span", "discussion-attachment-size", "업로드 확인 대기"));
        const remove = element("button", "board-button", "제거");
        remove.type = "button";
        remove.disabled = inFlight || entry.uncertain;
        remove.setAttribute("aria-label", `${entry.file.name} 제거`);
        if (entry.uncertain) remove.title = "재시도로 업로드 결과를 확인한 후 제거할 수 있습니다.";
        remove.addEventListener("click", () => {
          if (editorDraft !== draft || editorForm.dataset.busy === "true" || entry.uncertain) return;
          draft.files = draft.files.filter((file) => file !== entry);
          removeBodyImages(entry.requestId);
          releasePreview(entry);
          renderEditorAttachments();
          fileInput.focus();
        });
        const actions = element("div", "discussion-attachment-actions");
        if (entry.previewUrl) actions.append(insertImageButton(entry.requestId, inFlight));
        actions.append(remove);
        item.append(info, actions);
        fragment.append(item);
      }
      select("[data-discussion-editor-attachments]").replaceChildren(fragment);
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
      select("[data-discussion-post-title]").textContent = displayTitle(post);
      select("[data-discussion-post-author]").textContent = post.author;
      const date = select("[data-discussion-post-date]");
      date.textContent = dateText(post.createdAt);
      date.dateTime = post.createdAt;
      select("[data-discussion-post-views]").textContent = number(post.views);
      const usedImages = renderPostBody(post);
      renderPostAttachments(post, usedImages);
      renderComments();
    };
    const openEditor = (post) => {
      discardDraft();
      editorDraft = {
        postId: post?.id || null,
        attachments: Array.isArray(post?.attachments) ? post.attachments.filter(validAttachment) : [],
        removals: new Set(), files: [], saved: false, savedFields: null, createRequest: null,
      };
      editorForm.reset();
      formError(editorForm);
      busy(editorForm, false);
      uploadStatus();
      savedPostLink.hidden = true;
      savedPostLink.removeAttribute("href");
      select("[data-discussion-editor-title]").textContent = post ? "글 수정" : "글쓰기";
      select("[data-discussion-editor-submit]").textContent = post ? "수정" : "등록";
      editorForm.elements.namedItem("password").autocomplete = post ? "current-password" : "new-password";
      for (const name of ["author", "title", "body"]) editorForm.elements.namedItem(name).value = post?.[name] || "";
      editorForm.elements.namedItem("category").value = post?.category === "case" ? "case" : "question";
      renderEditorBody(post?.body || "");
      renderEditorAttachments();
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
      discardDraft();
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
    const queueFiles = (files, inline = false) => {
      if (!editorDraft || editorForm.dataset.busy === "true" || !files.length) return;
      formError(editorForm);
      if (inline && files.some((file) => !imageTypes.has(file.type.toLowerCase()))) {
        formError(editorForm, "JPG, PNG, GIF, WebP 사진을 선택해 주세요.");
        return;
      }
      if (retainedFileCount(editorDraft) + files.length > maximumFiles) {
        formError(editorForm, "첨부파일은 최대 5개까지 등록할 수 있습니다.");
        return;
      }
      const oversized = files.find((file) => file.size > maximumFileSize);
      if (oversized) {
        formError(editorForm, `${oversized.name}: 파일당 10MB까지 등록할 수 있습니다.`);
        return;
      }
      for (const file of files) {
        let previewUrl = "";
        if (imageTypes.has(file.type.toLowerCase())) {
          try { previewUrl = URL.createObjectURL(file); } catch { /* Preview is optional. */ }
        }
        const entry = { file, previewUrl, requestId: uuid(), uncertain: false };
        editorDraft.files.push(entry);
        if (inline) insertEditorContent({ id: entry.requestId });
      }
      renderEditorAttachments();
    };
    fileInput.addEventListener("change", () => {
      const files = Array.from(fileInput.files || []);
      fileInput.value = "";
      queueFiles(files);
    });
    photoInput.addEventListener("change", () => {
      const files = Array.from(photoInput.files || []);
      photoInput.value = "";
      queueFiles(files, true);
    });
    const photoButton = select("[data-discussion-insert-photo]");
    photoButton.addEventListener("pointerdown", rememberSelection);
    photoButton.addEventListener("click", () => {
      rememberSelection();
      if (editorForm.dataset.busy !== "true") photoInput.click();
    });
    document.addEventListener("selectionchange", rememberSelection);
    composer.addEventListener("input", () => { syncBody(); rememberSelection(); });
    composer.addEventListener("paste", (event) => {
      event.preventDefault();
      if (editorForm.dataset.busy !== "true") insertEditorContent({ text: event.clipboardData?.getData("text/plain") || "" });
    });
    composer.addEventListener("dragover", (event) => event.preventDefault());
    composer.addEventListener("drop", (event) => {
      event.preventDefault();
      if (editorForm.dataset.busy !== "true") insertEditorContent({ text: event.dataTransfer?.getData("text/plain") || "" });
    });
    composer.addEventListener("beforeinput", (event) => {
      if (["insertFromPaste", "insertFromDrop", "insertFromYank"].includes(event.inputType)) event.preventDefault();
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
      navigate(editorDraft?.postId ? { id: editorDraft.postId, mode: "detail" } : {});
    });

    editorForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!editorDraft || editorForm.dataset.busy === "true") return;
      formError(editorForm);
      syncBody();
      const data = payload(editorForm, true);
      if (!validText(editorForm, data)) return;
      const draft = editorDraft;
      if (retainedFileCount(draft) > maximumFiles) {
        formError(editorForm, "첨부파일은 최대 5개까지 등록할 수 있습니다.");
        return;
      }
      const version = routeVersion;
      const isCurrent = () => version === routeVersion && editorDraft === draft;
      const signature = JSON.stringify(data);
      let stage = "save";
      busy(editorForm, true);
      savedPostLink.hidden = true;
      uploadStatus("저장 중...");
      try {
        if (!draft.postId) {
          if (!draft.createRequest) {
            draft.createRequest = {
              fields: { ...data },
              body: { ...data, website: value(editorForm, "website"), requestId: uuid() },
            };
          }
          let result;
          try { result = await api("", { method: "POST", body: draft.createRequest.body }); }
          catch (error) {
            if ([400, 413, 415, 422, 429].includes(error.status)) draft.createRequest = null;
            throw error;
          }
          if (!result.post || !uuidPattern.test(result.post.id)) throw new ApiError("저장 결과를 확인하지 못했습니다. 다시 시도해 주세요.");
          draft.postId = result.post.id;
          draft.saved = true;
          draft.savedFields = JSON.stringify(draft.createRequest.fields);
          if (!isCurrent()) return;
        }
        if (draft.savedFields !== signature) {
          const result = await api(`/${encodeURIComponent(draft.postId)}`, { method: "PATCH", body: data });
          if (!result.post || result.post.id !== draft.postId) throw new ApiError("저장 결과를 확인하지 못했습니다. 다시 시도해 주세요.");
          draft.saved = true;
          draft.savedFields = signature;
          if (!isCurrent()) return;
        }
        stage = "attachments";
        for (const id of Array.from(draft.removals)) {
          uploadStatus("첨부파일 삭제 중...");
          try {
            await api(`/${encodeURIComponent(draft.postId)}/attachments/${encodeURIComponent(id)}`, {
              method: "DELETE", body: { password: data.password },
            });
          } catch (error) { if (error.status !== 404) throw error; }
          draft.attachments = draft.attachments.filter((attachment) => attachment.id !== id);
          draft.removals.delete(id);
          if (!isCurrent()) return;
          removeBodyImages(id);
          renderEditorAttachments();
        }
        const uploads = draft.files.slice();
        for (const [index, entry] of uploads.entries()) {
          uploadStatus(`첨부파일 ${index + 1}/${uploads.length} 업로드 중...`);
          const multipart = new FormData();
          multipart.append("password", data.password);
          multipart.append("requestId", entry.requestId);
          multipart.append("file", entry.file, entry.file.name);
          let attachment;
          try {
            const result = await api(`/${encodeURIComponent(draft.postId)}/attachments`, {
              method: "POST", body: multipart, timeout: 60000,
            });
            if (!validAttachment(result.attachment)) throw new ApiError("첨부 결과를 확인하지 못했습니다. 다시 시도해 주세요.");
            attachment = result.attachment;
          } catch (error) {
            entry.uncertain = !error.status || error.status >= 500;
            throw error;
          }
          draft.attachments = draft.attachments.filter((existing) => existing.id !== attachment.id);
          draft.attachments.push(attachment);
          draft.files = draft.files.filter((file) => file !== entry);
          if (!isCurrent()) return;
          const bodyChanged = resolveBodyImage(entry.requestId, attachment);
          releasePreview(entry);
          renderEditorAttachments();
          if (bodyChanged) {
            stage = "body";
            data.body = syncBody();
            uploadStatus("본문 사진 저장 중...");
            const result = await api(`/${encodeURIComponent(draft.postId)}`, { method: "PATCH", body: data });
            if (!result.post || result.post.id !== draft.postId) throw new ApiError("본문 저장 결과를 확인하지 못했습니다. 다시 시도해 주세요.");
            draft.savedFields = JSON.stringify(data);
            if (!isCurrent()) return;
            stage = "attachments";
          }
        }
        data.body = syncBody();
        if (draft.savedFields !== JSON.stringify(data)) {
          stage = "body";
          uploadStatus("본문 저장 중...");
          const result = await api(`/${encodeURIComponent(draft.postId)}`, { method: "PATCH", body: data });
          if (!result.post || result.post.id !== draft.postId) throw new ApiError("본문 저장 결과를 확인하지 못했습니다. 다시 시도해 주세요.");
          draft.savedFields = JSON.stringify(data);
          if (!isCurrent()) return;
        }
        if (isCurrent()) {
          editorForm.reset();
          uploadStatus();
          navigate({ id: draft.postId, mode: "detail" });
        }
      } catch (error) {
        if (isCurrent()) {
          if (draft.saved) {
            const incomplete = stage === "attachments" ? "첨부파일을 처리하지 못했습니다."
              : stage === "body" ? "본문 사진 위치를 저장하지 못했습니다." : "변경 사항을 저장하지 못했습니다.";
            formError(editorForm, `글은 저장되었지만 ${incomplete} ${error.message}`);
            savedPostLink.href = hash({ q: route.q, page: route.page, id: draft.postId });
            savedPostLink.hidden = false;
            select("[data-discussion-editor-submit]").textContent = "다시 저장";
          } else formError(editorForm, error.message);
          uploadStatus();
        }
      } finally {
        if (isCurrent()) {
          busy(editorForm, false);
          renderEditorAttachments();
        }
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
