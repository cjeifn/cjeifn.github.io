/* Open gallery photos as centered cards. */
window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-gallery-open]").forEach((trigger) => {
    const dialog = document.getElementById(trigger.dataset.galleryOpen);
    if (!(dialog instanceof HTMLDialogElement)) return;
    trigger.addEventListener("click", () => dialog.showModal());
  });

  document.querySelectorAll(".event-gallery-dialog").forEach((dialog) => {
    dialog.querySelector("[data-gallery-close]").addEventListener("click", () => {
      dialog.close();
    });
    dialog.addEventListener("click", (event) => {
      const bounds = dialog.getBoundingClientRect();
      if (
        event.target === dialog &&
        (event.clientX < bounds.left || event.clientX > bounds.right ||
          event.clientY < bounds.top || event.clientY > bounds.bottom)
      ) {
        dialog.close();
      }
    });
  });
});
