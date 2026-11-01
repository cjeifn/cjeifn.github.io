(() => {
  const init = () => {
    const board = document.querySelector(".board-page[data-views-endpoint]");
    if (!board) return;

    const rows = Array.from(board.querySelectorAll("[data-board-row]"));
    const form = board.querySelector(".board-search");
    if (form) {
      const input = form.querySelector("input[name=q]");
      const total = board.querySelector("[data-board-total]");
      const empty = board.querySelector("[data-board-empty]");
      const pagination = board.querySelector("[data-board-pagination]");
      let matches = rows;
      const pageSize = 15;
      const render = (page = 1) => {
        rows.forEach((row) => { row.hidden = true; });
        matches.slice((page - 1) * pageSize, page * pageSize)
          .forEach((row) => { row.hidden = false; });
        total.textContent = String(matches.length);
        empty.hidden = matches.length > 0;
        pagination.replaceChildren();
        const pages = Math.ceil(matches.length / pageSize);
        for (let n = 1; n <= pages; n++) {
          const button = document.createElement("button");
          button.type = "button";
          button.textContent = String(n);
          button.setAttribute("aria-label", `${n} 페이지`);
          if (n === page) button.setAttribute("aria-current", "page");
          button.addEventListener("click", () => render(n));
          pagination.append(button);
        }
      };
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const query = input.value.trim().normalize("NFC").toLocaleLowerCase("ko");
        matches = rows.filter((row) => row.dataset.title.normalize("NFC")
          .toLocaleLowerCase("ko").includes(query));
        render();
      });
      input.addEventListener("search", () => {
        if (!input.value) { matches = rows; render(); }
      });
      render();
    }

    const endpoint = board.dataset.viewsEndpoint;
    const preview = window.location.pathname.startsWith("/preview/");
    const postKey = (id) => preview ? `preview-${id}` : id;
    const counters = Array.from(board.querySelectorAll("[data-view-count]"));
    let visitId;
    const getVisitId = () => {
      if (visitId) return visitId;
      try {
        visitId = sessionStorage.getItem("ifn-board-visit-v1");
        if (!visitId) {
          visitId = crypto.randomUUID();
          sessionStorage.setItem("ifn-board-visit-v1", visitId);
        }
      } catch {
        visitId = crypto.randomUUID();
      }
      return visitId;
    };
    const loadCount = async (id, increment) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      try {
        const post = postKey(id);
        const response = await fetch(increment ? endpoint : `${endpoint}?post=${encodeURIComponent(post)}`, {
          method: increment ? "POST" : "GET",
          ...(increment ? {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ post, visitId: getVisitId() }),
          } : {}),
          credentials: "omit",
          referrerPolicy: "no-referrer",
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("View count request failed");
        const data = await response.json();
        if (!Number.isSafeInteger(data.views) || data.views < 0) throw new Error("Invalid view count");
        counters.filter((counter) => counter.dataset.viewCount === id).forEach((counter) => {
          counter.textContent = data.views.toLocaleString("ko-KR");
          counter.removeAttribute("title");
        });
      } catch {
        counters.filter((counter) => counter.dataset.viewCount === id).forEach((counter) => {
          counter.textContent = "—";
          counter.title = "조회수를 불러오지 못했습니다";
        });
      } finally {
        clearTimeout(timer);
      }
    };
    const refresh = (increment) => {
      for (const id of new Set(counters.map((counter) => counter.dataset.viewCount))) {
        loadCount(id, increment && board.dataset.boardPost === id);
      }
    };
    refresh(true);
    window.addEventListener("pageshow", (event) => {
      if (event.persisted) refresh(false);
    });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
