document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var isOpen = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen);
    });
  }

  document.querySelectorAll(".subproject-nav").forEach(function (nav) {
    var tabs = Array.prototype.slice.call(nav.querySelectorAll("[role=tab]"));
    var panels = tabs.map(function (tab) {
      return document.getElementById(tab.getAttribute("aria-controls"));
    });
    var heroSection = nav.closest(".project-hero");
    var covers = heroSection ? Array.prototype.slice.call(heroSection.querySelectorAll(".hero-cover")) : [];
    var mediaBox = heroSection ? heroSection.querySelector(".project-hero-media") : null;
    var coverFor = tabs.map(function (tab) {
      var id = tab.getAttribute("aria-controls");
      return covers.filter(function (cover) { return cover.getAttribute("data-cover") === id; })[0] || null;
    });

    function activate(index, moveFocus) {
      tabs.forEach(function (tab, i) {
        var selected = i === index;
        tab.classList.toggle("active", selected);
        tab.setAttribute("aria-selected", selected ? "true" : "false");
        tab.tabIndex = selected ? 0 : -1;
        if (panels[i]) panels[i].classList.toggle("active", selected);
        if (coverFor[i]) coverFor[i].classList.toggle("active", selected);
        if (selected && moveFocus) tab.focus();
      });
      var activeCover = coverFor[index];
      if (activeCover && mediaBox) {
        mediaBox.classList.toggle("no-frame", activeCover.getAttribute("data-frame") === "none");
      }
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { activate(i, false); });
      tab.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") { activate((i + 1) % tabs.length, true); e.preventDefault(); }
        if (e.key === "ArrowLeft") { activate((i - 1 + tabs.length) % tabs.length, true); e.preventDefault(); }
      });
    });

    if (location.hash) {
      var targetIndex = tabs.findIndex(function (tab) {
        return "#" + tab.getAttribute("aria-controls") === location.hash;
      });
      if (targetIndex > -1) activate(targetIndex, false);
    }
  });

  document.querySelectorAll(".finding-carousel").forEach(function (carousel) {
    var track = carousel.querySelector(".finding-track");
    var cards = Array.prototype.slice.call(track.children);
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".finding-dots .dot"));
    var prevBtn = carousel.querySelector(".finding-prev");
    var nextBtn = carousel.querySelector(".finding-next");

    function setActive(index) {
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
        dot.setAttribute("aria-pressed", i === index ? "true" : "false");
      });
    }

    function scrollToCard(index) {
      index = Math.max(0, Math.min(cards.length - 1, index));
      if (!cards[index]) return;
      track.scrollTo({ left: cards[index].offsetLeft - track.offsetLeft, behavior: "smooth" });
    }

    function activeIndex() {
      var i = dots.findIndex(function (dot) { return dot.classList.contains("active"); });
      return i > -1 ? i : 0;
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () { scrollToCard(i); });
    });

    if (prevBtn) prevBtn.addEventListener("click", function () { scrollToCard(activeIndex() - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { scrollToCard(activeIndex() + 1); });

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) setActive(cards.indexOf(entry.target));
          });
        },
        { root: track, threshold: 0.6 }
      );
      cards.forEach(function (card) { observer.observe(card); });
    }
  });

  document.querySelectorAll(".compare-slider-frame").forEach(function (frame) {
    var afterWrap = frame.querySelector(".compare-slider-after-wrap");
    var handle = frame.querySelector(".compare-slider-handle");
    var dragging = false;

    function setPosition(percent) {
      percent = Math.max(0, Math.min(100, percent));
      afterWrap.style.clipPath = "inset(0 0 0 " + percent + "%)";
      handle.style.left = percent + "%";
      handle.setAttribute("aria-valuenow", Math.round(percent));
    }

    function positionFromClientX(clientX) {
      var rect = frame.getBoundingClientRect();
      setPosition(((clientX - rect.left) / rect.width) * 100);
    }

    frame.addEventListener("pointerdown", function (e) {
      dragging = true;
      frame.setPointerCapture(e.pointerId);
      positionFromClientX(e.clientX);
    });
    frame.addEventListener("pointermove", function (e) {
      if (dragging) positionFromClientX(e.clientX);
    });
    frame.addEventListener("pointerup", function () { dragging = false; });
    frame.addEventListener("pointercancel", function () { dragging = false; });

    handle.addEventListener("keydown", function (e) {
      var current = parseFloat(handle.style.left) || 50;
      if (e.key === "ArrowLeft") { setPosition(current - 5); e.preventDefault(); }
      if (e.key === "ArrowRight") { setPosition(current + 5); e.preventDefault(); }
      if (e.key === "Home") { setPosition(0); e.preventDefault(); }
      if (e.key === "End") { setPosition(100); e.preventDefault(); }
    });
  });
});
