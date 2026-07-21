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
});
