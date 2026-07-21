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

    function activate(index, moveFocus) {
      tabs.forEach(function (tab, i) {
        var selected = i === index;
        tab.classList.toggle("active", selected);
        tab.setAttribute("aria-selected", selected ? "true" : "false");
        tab.tabIndex = selected ? 0 : -1;
        if (panels[i]) panels[i].classList.toggle("active", selected);
        if (selected && moveFocus) tab.focus();
      });
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
});
