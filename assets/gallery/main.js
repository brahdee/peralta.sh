function openTab(tabId) {
  const previousTab = document.querySelector(".active");
  const previousTabContent = document.querySelector(".shown");

  previousTab?.classList.remove("active");

  if (previousTabContent) {
    previousTabContent.classList.remove("shown");
    previousTabContent.classList.add("hidden");
  }

  const tabPressed = document.getElementById(tabId + "-btn");
  const contentToShow = document.getElementById(tabId);

  tabPressed?.classList.add("active");

  if (contentToShow) {
    contentToShow.classList.remove("hidden");
    contentToShow.classList.add("shown");
  }
}

// Fade main text as the user scrolls
$(window).scroll(function() {
  const scrollTop = $(window).scrollTop();

  $("#main-text").each(function() {
    $(this).css("opacity", 1 - scrollTop / 300);
    $(this).css(
      "transform",
      `translate(-50%, -${50 + scrollTop / 100}%)`
    );
  });
});

// Lightbox functionality
function openPhoto(image) {
  const viewer = document.getElementById("photo-viewer");
  const viewerImage = document.getElementById("viewer-image");
  const photoName = document.getElementById("photo-name");
  const photoYear = document.getElementById("photo-year");

  const url = new URL(image.src);
  const filename = decodeURIComponent(url.pathname.split("/").pop());

  viewerImage.src = image.src;
  photoName.textContent = "pic " + filename.replace(/\.webp$/i, "");
  photoYear.textContent = image.dataset.year;

  viewer.classList.add("visible");
  document.body.style.overflow = "hidden";
}

function closePhoto() {
  const viewer = document.getElementById("photo-viewer");
  const viewerImage = document.getElementById("viewer-image");

  if (!viewer.classList.contains("visible")) {
    return;
  }

  viewer.classList.remove("visible");
  document.body.style.overflow = "";

  // Clear the image after the fade-out finishes
  setTimeout(() => {
    if (!viewer.classList.contains("visible")) {
      viewerImage.src = "";
    }
  }, 300);
}

document.addEventListener("DOMContentLoaded", () => {
  // Animate elements as they enter the viewport
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("now-visible");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll(".temp-hidden").forEach(el => {
    observer.observe(el);
  });

  // Lightbox click handling
  const viewer = document.getElementById("photo-viewer");
  const viewerImage = document.getElementById("viewer-image");

  viewer.addEventListener("click", (event) => {
    if (event.target === viewer || event.target === viewerImage) {
      closePhoto();
    }
  });

  // Close lightbox with Escape
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closePhoto();
    }
  });
});
