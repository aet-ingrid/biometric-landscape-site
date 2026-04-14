/* ============================================================
   Biometric Landscape Site — main.js
   Accordion, scroll-spy, disclosure toggles
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  // --- Accordion ---
  document.querySelectorAll('.accordion-trigger').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var expanded = this.getAttribute('aria-expanded') === 'true';
      var bodyId = this.getAttribute('aria-controls');
      var body = document.getElementById(bodyId);

      this.setAttribute('aria-expanded', !expanded);
      if (body) {
        body.classList.toggle('is-open', !expanded);
      }
    });
  });

  // --- Disclosure toggles ---
  document.querySelectorAll('.disclosure-trigger').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var expanded = this.getAttribute('aria-expanded') === 'true';
      var bodyId = this.getAttribute('aria-controls');
      var body = document.getElementById(bodyId);

      this.setAttribute('aria-expanded', !expanded);
      if (body) {
        body.classList.toggle('is-open', !expanded);
        // Update button text
        var openText = this.dataset.openText;
        var closedText = this.dataset.closedText;
        if (openText && closedText) {
          var textNode = this.querySelector('.disclosure-trigger__text');
          if (textNode) {
            textNode.textContent = !expanded ? openText : closedText;
          }
        }
      }
    });
  });

  // --- Scroll-spy for section nav ---
  var sectionNav = document.querySelector('.section-nav');
  var mobileSectionNav = document.querySelector('.mobile-section-nav');

  if (sectionNav || mobileSectionNav) {
    var navLinks = Array.from(document.querySelectorAll('.section-nav a, .mobile-section-nav a'));
    var sectionIds = navLinks
      .map(function (a) { return a.getAttribute('href'); })
      .filter(function (href) { return href && href.startsWith('#'); })
      .map(function (href) { return href.slice(1); });

    // Deduplicate
    var uniqueIds = sectionIds.filter(function (id, i) { return sectionIds.indexOf(id) === i; });

    var sections = uniqueIds
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);

    function onScroll() {
      var scrollY = window.scrollY + 100;
      var current = '';

      sections.forEach(function (section) {
        if (section.offsetTop <= scrollY) {
          current = section.id;
        }
      });

      navLinks.forEach(function (link) {
        var href = link.getAttribute('href');
        if (href === '#' + current) {
          link.classList.add('is-active');
        } else {
          link.classList.remove('is-active');
        }
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // --- Page-level tabs ---
  document.querySelectorAll('.page-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      var targetId = this.getAttribute('aria-controls');
      // Deactivate all tabs and panes in this tab group
      var tabBar = this.closest('.page-tabs');
      if (tabBar) {
        tabBar.querySelectorAll('.page-tab').forEach(function (t) {
          t.classList.remove('is-active');
          t.setAttribute('aria-selected', 'false');
        });
      }
      document.querySelectorAll('.tab-pane').forEach(function (pane) {
        pane.classList.remove('is-active');
      });
      // Activate selected tab and pane
      this.classList.add('is-active');
      this.setAttribute('aria-selected', 'true');
      var target = document.getElementById(targetId);
      if (target) {
        target.classList.add('is-active');
        // Render any unprocessed Mermaid diagrams now that the pane is visible
        if (window.mermaid) {
          var unprocessed = target.querySelectorAll('.mermaid:not([data-processed])');
          if (unprocessed.length > 0) {
            mermaid.run({ nodes: Array.from(unprocessed) });
          }
        }
      }
    });
  });

  // --- Product families accordion (pf-trigger) ---
  document.querySelectorAll('.pf-trigger').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var expanded = this.getAttribute('aria-expanded') === 'true';
      var bodyId = this.getAttribute('aria-controls');
      var body = document.getElementById(bodyId);
      this.setAttribute('aria-expanded', !expanded);
      if (body) body.classList.toggle('is-open', !expanded);
    });
  });

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href').slice(1);
      var target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        var offset = 70;
        var top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

});
