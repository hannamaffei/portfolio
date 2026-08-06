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
    var currentIndex = 0;

    function setActive(index) {
      currentIndex = index;
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
        dot.setAttribute("aria-pressed", i === index ? "true" : "false");
      });
    }

    function scrollToCard(index) {
      index = Math.max(0, Math.min(cards.length - 1, index));
      if (!cards[index]) return;
      setActive(index);
      track.scrollTo({ left: cards[index].offsetLeft - track.offsetLeft, behavior: "smooth" });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () { scrollToCard(i); });
    });

    if (prevBtn) prevBtn.addEventListener("click", function () { scrollToCard(currentIndex - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { scrollToCard(currentIndex + 1); });

    setActive(0);

    if ("IntersectionObserver" in window) {
      var ratios = cards.map(function () { return 0; });
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            ratios[cards.indexOf(entry.target)] = entry.intersectionRatio;
          });
          var maxRatio = Math.max.apply(null, ratios);
          if (maxRatio > 0) setActive(ratios.indexOf(maxRatio));
        },
        { root: track, threshold: [0, 0.25, 0.5, 0.75, 1] }
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

  document.querySelectorAll(".proposal-carousel").forEach(function (carousel) {
    var stack = carousel.querySelector(".proposal-stack");
    var cards = Array.prototype.slice.call(stack.querySelectorAll(".proposal-card"));
    var panels = Array.prototype.slice.call(carousel.querySelectorAll(".proposal-panel"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".proposal-dots .dot"));
    var prevBtn = carousel.querySelector(".proposal-prev");
    var nextBtn = carousel.querySelector(".proposal-next");
    var count = cards.length;
    var current = 0;
    var dragging = false;
    var startX = 0;
    var deltaX = 0;

    function styleForOffset(offset) {
      var abs = Math.min(Math.abs(offset), 2);
      var t = Math.min(abs, 1);
      var sign = offset < 0 ? -1 : offset > 0 ? 1 : 0;
      var x = sign * t * 64;
      var y = t * 12;
      var scale = 1 - t * 0.1;
      var blur = t * 0.5;
      var opacity = 1 - t * 0.3;
      if (abs > 1) {
        var extra = abs - 1;
        opacity -= extra * 0.65;
        x += sign * extra * 26;
        scale -= extra * 0.05;
      }
      return { x: x, y: y, scale: scale, blur: blur, opacity: Math.max(0, opacity), z: 100 - Math.round(abs * 10) };
    }

    function render(effective, animate) {
      cards.forEach(function (card) {
        var index = parseInt(card.getAttribute("data-index"), 10);
        var s = styleForOffset(index - effective);
        card.style.transition = animate ? "" : "none";
        card.style.transform = "translate3d(" + s.x + "px," + s.y + "px,0) scale(" + s.scale + ")";
        card.style.filter = s.blur > 0.05 ? "blur(" + s.blur.toFixed(1) + "px)" : "none";
        card.style.opacity = s.opacity;
        card.style.zIndex = s.z;
        card.style.pointerEvents = index === Math.round(effective) ? "auto" : "none";
      });
    }

    function setActive(index) {
      index = Math.max(0, Math.min(count - 1, index));
      current = index;
      panels.forEach(function (panel) {
        panel.classList.toggle("active", parseInt(panel.getAttribute("data-index"), 10) === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
        dot.setAttribute("aria-pressed", i === index ? "true" : "false");
      });
      if (prevBtn) prevBtn.disabled = index === 0;
      if (nextBtn) nextBtn.disabled = index === count - 1;
      render(index, true);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () { setActive(i); });
    });
    if (prevBtn) prevBtn.addEventListener("click", function () { setActive(current - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { setActive(current + 1); });

    stack.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { setActive(current + 1); e.preventDefault(); }
      if (e.key === "ArrowLeft") { setActive(current - 1); e.preventDefault(); }
    });

    stack.addEventListener("pointerdown", function (e) {
      dragging = true;
      stack.setPointerCapture(e.pointerId);
      startX = e.clientX;
      deltaX = 0;
      stack.classList.add("dragging");
    });

    stack.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      deltaX = e.clientX - startX;
      var width = stack.getBoundingClientRect().width || 240;
      var progress = Math.max(-1, Math.min(1, deltaX / width));
      var effective = Math.max(0, Math.min(count - 1, current - progress));
      render(effective, false);
    });

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      stack.classList.remove("dragging");
      var width = stack.getBoundingClientRect().width || 240;
      var progress = Math.max(-1, Math.min(1, deltaX / width));
      var next = Math.round(Math.max(0, Math.min(count - 1, current - progress)));
      setActive(next);
    }

    stack.addEventListener("pointerup", endDrag);
    stack.addEventListener("pointercancel", endDrag);

    setActive(0);
  });
});
