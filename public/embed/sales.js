/*
 * "Recently sold" widget for SantaFeHillsSD.com and LomasVerdesEstates.com.
 * Shows the sales entered at pacificfriendlyrealty.com/admin → Recent sales.
 *
 *   <section id="sold" hidden> … <div data-pfr-sales></div> … </section>
 *   <script src="https://www.pacificfriendlyrealty.com/embed/sales.js" data-site="santafe" defer></script>
 *
 * The section stays hidden until there is at least one sale.
 */
(function () {
  var script = document.currentScript;
  if (!script) return;
  var site = script.getAttribute("data-site");
  var api = script.getAttribute("data-api") || new URL(script.src).origin;
  var boxes = document.querySelectorAll("[data-pfr-sales]");
  if (!boxes.length) return;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function money(n) {
    return "$" + Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
  }
  function when(d) {
    try {
      return new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
    } catch {
      return "";
    }
  }
  var ROLE = { seller: "Sold by Lara", buyer: "Lara's buyer", both: "Sold by Lara" };

  function card(s) {
    var facts = [
      s.beds != null ? s.beds + " bd" : "",
      s.baths != null ? s.baths + " ba" : "",
      s.sqft ? Number(s.sqft).toLocaleString("en-US") + " sq ft" : "",
    ].filter(Boolean);
    var img = s.photo
      ? '<img class="sold-img" src="' + esc(s.photo) + '" alt="' + esc(s.address) + '" loading="lazy">'
      : '<div class="sold-img sold-ph"><span></span></div>';
    var role = ROLE[s.represented];
    return (
      '<article class="sold-card">' +
      '<div class="sold-top">' + img +
      '<span class="sold-tag">Sold ' + esc(when(s.soldOn)) + "</span>" +
      (role ? '<span class="sold-lara">' + esc(role) + "</span>" : "") +
      "</div>" +
      '<div class="sold-body"><b class="sold-price">' + esc(money(s.price)) + "</b>" +
      '<p class="sold-addr">' + esc(s.address) + "</p>" +
      (facts.length ? '<p class="sold-facts">' + esc(facts.join(" · ")) + "</p>" : "") +
      (s.note ? '<p class="sold-note">' + esc(s.note) + "</p>" : "") +
      "</div></article>"
    );
  }

  fetch(api + "/api/sales?site=" + encodeURIComponent(site))
    .then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    })
    .then(function (data) {
      var sales = data.sales || [];
      if (!sales.length) return;
      var html = sales.map(card).join("");
      var others = sales.some(function (s) { return !ROLE[s.represented]; });
      boxes.forEach(function (el) {
        el.innerHTML = html;
        var sec = el.closest("section");
        if (sec) sec.hidden = false;
        var fine = sec && sec.querySelector("[data-pfr-sales-note]");
        if (fine && !others) fine.hidden = true;
      });
    })
    .catch(function () {});
})();
