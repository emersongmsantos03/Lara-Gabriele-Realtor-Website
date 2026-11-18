/*
 * Blog widget for SantaFeHillsSD.com and LomasVerdesEstates.com.
 * Pulls posts written in pacificfriendlyrealty.com/admin into the static sites.
 *
 *   <script src="https://www.pacificfriendlyrealty.com/embed/blog.js" data-site="santafe" defer></script>
 *
 * - <div data-pfr-posts data-prefix="blog/" data-limit="3"> gets post cards (added
 *   in front of any cards already in the page). With data-empty="hide" the
 *   surrounding <section> stays hidden when there are no posts; with
 *   data-empty-text="..." that message is shown instead.
 * - <main id="pfr-post"> on blog/post.html renders the post named by ?slug=.
 */
(function () {
  var script = document.currentScript;
  if (!script) return;
  var site = script.getAttribute("data-site");
  var api = script.getAttribute("data-api") || new URL(script.src).origin;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fmt(iso) {
    try {
      return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/Los_Angeles" });
    } catch (e) {
      return "";
    }
  }
  function cssUrl(u) {
    return "url(\"" + String(u).replace(/["\\\n]/g, "") + "\")";
  }
  function track(e, slug, label) {
    try {
      var b = JSON.stringify({ s: site, u: location.href, e: e, p: slug, l: label || "" });
      var u = api + "/api/track";
      if (!(navigator.sendBeacon && navigator.sendBeacon(u, new Blob([b], { type: "text/plain" }))))
        fetch(u, { method: "POST", body: b, keepalive: true, mode: "no-cors" });
    } catch (err) {}
  }

  function get(params) {
    return fetch(api + "/api/blog?site=" + encodeURIComponent(site) + params).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    });
  }

  function card(p, prefix) {
    var img = p.coverImage
      ? '<div class="pimg" style="background-image:' + esc(cssUrl(p.coverImage)) + '" role="img" aria-label="' + esc(p.coverAlt) + '"></div>'
      : '<div class="pimg pimg-empty"></div>';
    return (
      '<a class="post-card" href="' + esc(prefix + "post.html?slug=" + encodeURIComponent(p.slug)) + '">' +
      img +
      '<div class="pb"><div class="meta">' + esc(fmt(p.publishAt)) + "</div><h3>" + esc(p.title) + "</h3><p>" + esc(p.excerpt) +
      '</p><div class="more-link">Read article &rarr;</div></div></a>'
    );
  }

  // ---------- Lists (home page + blog index) ----------
  var lists = document.querySelectorAll("[data-pfr-posts]");
  var listReq = null;
  if (lists.length) {
    listReq = get("").then(function (data) {
      var posts = data.posts || [];
      lists.forEach(function (el) {
        var prefix = el.getAttribute("data-prefix") || "";
        var limit = parseInt(el.getAttribute("data-limit") || "0", 10);
        var html = posts.map(function (p) { return card(p, prefix); }).join("");
        el.insertAdjacentHTML("afterbegin", html);
        var cards = el.querySelectorAll(".post-card");
        if (limit) for (var i = limit; i < cards.length; i++) cards[i].remove();
        if (el.querySelectorAll(".post-card").length >= 3) el.classList.add("three");
        showEmpty(el);
      });
      return posts;
    });
    listReq.catch(function () {
      lists.forEach(showEmpty);
    });
  }

  function showEmpty(el) {
    if (el.querySelector(".post-card")) return;
    var sec = el.closest("section");
    if (el.getAttribute("data-empty") === "hide" && sec) sec.style.display = "none";
    var text = el.getAttribute("data-empty-text");
    if (text && !el.querySelector(".pfr-empty")) {
      el.insertAdjacentHTML("afterend", '<p class="pfr-empty" style="color:var(--muted)">' + esc(text) + "</p>");
    }
  }

  // ---------- Single post ----------
  var root = document.getElementById("pfr-post");
  if (!root) return;
  var slug = new URLSearchParams(location.search).get("slug");
  var $ = function (id) { return document.getElementById(id); };

  function notFound() {
    $("pfr-title").textContent = "Article not found";
    $("pfr-date").textContent = "";
    $("pfr-body").innerHTML = '<p>This article may have moved. <a href="index.html">See all articles &rarr;</a></p>';
    document.title = "Article not found";
    var robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex";
    document.head.appendChild(robots);
  }
  function setMeta(sel, attr, value) {
    var m = document.head.querySelector(sel);
    if (m) m.setAttribute(attr, value);
  }

  if (!slug) return notFound();
  get("&slug=" + encodeURIComponent(slug))
    .then(function (data) {
      var p = data.post;
      var siteName = root.getAttribute("data-site-name") || "";
      var seoTitle = p.seoTitle || p.title;
      var seoDesc = p.seoDescription || p.excerpt;
      document.title = seoTitle + (siteName ? " | " + siteName : "");
      setMeta('meta[name="description"]', "content", seoDesc);
      setMeta('meta[property="og:title"]', "content", seoTitle);
      setMeta('meta[property="og:description"]', "content", seoDesc);
      setMeta('link[rel="canonical"]', "href", p.canonical);
      setMeta('meta[property="og:url"]', "content", p.canonical);
      if (p.coverImage) {
        $("pfr-hero").style.backgroundImage = cssUrl(p.coverImage);
        var og = document.createElement("meta");
        og.setAttribute("property", "og:image");
        og.content = p.coverImage;
        document.head.appendChild(og);
      }
      $("pfr-title").textContent = p.title;
      $("pfr-date").textContent = fmt(p.publishAt) + " · " + p.readingMinutes + " min read";
      // Post HTML is sanitized by the server when it is saved.
      var body = $("pfr-body");
      body.innerHTML = p.contentHtml;

      // Topics under the title
      if (p.tags && p.tags.length) {
        var tags = document.createElement("div");
        tags.className = "pfr-tags";
        tags.innerHTML = p.tags.map(function (t) { return "<span>" + esc(t) + "</span>"; }).join("");
        $("pfr-title").insertAdjacentElement("afterend", tags);
      }

      // Share buttons after the article
      var url = location.href.split("#")[0];
      var u = encodeURIComponent(url), t = encodeURIComponent(p.title);
      var share = document.createElement("div");
      share.className = "pfr-share";
      share.innerHTML =
        "<b>Share</b>" +
        '<a data-net="Facebook" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=' + u + '">Facebook</a>' +
        '<a data-net="X" target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?url=' + u + "&text=" + t + '">X</a>' +
        '<a data-net="LinkedIn" target="_blank" rel="noopener" href="https://www.linkedin.com/sharing/share-offsite/?url=' + u + '">LinkedIn</a>' +
        '<a data-net="Email" href="mailto:?subject=' + t + "&body=" + u + '">Email</a>' +
        '<button type="button" data-net="Copy link">Copy link</button>';
      body.insertAdjacentElement("afterend", share);
      share.addEventListener("click", function (e) {
        var el = e.target.closest("[data-net]");
        if (!el) return;
        track("share", p.slug, el.getAttribute("data-net"));
        if (el.tagName === "BUTTON") {
          try { navigator.clipboard.writeText(url); el.textContent = "Copied!"; } catch (err) {}
        }
      });

      // Reading progress bar + "read halfway / to the end"
      var bar = document.createElement("div");
      bar.className = "pfr-progress";
      bar.innerHTML = "<span></span>";
      document.body.appendChild(bar);
      var sent = {};
      function onScroll() {
        var r = body.getBoundingClientRect();
        var total = r.height - innerHeight * 0.6;
        var pr = Math.min(1, Math.max(0, (innerHeight * 0.4 - r.top) / Math.max(1, total)));
        bar.firstChild.style.transform = "scaleX(" + pr + ")";
        if (pr >= 0.5 && !sent.h) { sent.h = 1; track("read50", p.slug); }
        if (pr >= 0.95 && !sent.f) { sent.f = 1; track("read100", p.slug); }
      }
      addEventListener("scroll", onScroll, { passive: true });
      onScroll();

      // Clicks on buttons and links inside the article
      body.addEventListener("click", function (e) {
        var a = e.target.closest("a");
        if (!a) return;
        var isBtn = !!a.closest('[data-type="button"]');
        var label = (a.textContent || "").trim().slice(0, 50);
        if (!isBtn) {
          var dest = /^tel:/.test(a.href) ? "phone" : /^mailto:/.test(a.href) ? "email" : a.hostname.replace(/^www\./, "");
          label = (label || "Link") + " \u2192 " + dest;
        }
        track("click", p.slug, (isBtn ? "Button: " : "") + label);
      });

      var ld = document.createElement("script");
      ld.type = "application/ld+json";
      ld.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: p.title,
        description: p.excerpt,
        datePublished: p.publishAt,
        image: p.coverImage || undefined,
        author: { "@type": "Person", name: "Lara Gabriele" },
        publisher: { "@type": "Organization", name: "Pacific Friendly Realty" },
        mainEntityOfPage: p.canonical,
      }).replace(/</g, "\\u003c");
      document.head.appendChild(ld);

      return get("").then(function (list) {
        var others = (list.posts || []).filter(function (q) { return q.slug !== p.slug; }).slice(0, 2);
        var more = $("pfr-more");
        if (more && !others.length && !more.querySelector(".post-card")) more.style.display = "none";
        if (more && others.length) {
          more.style.display = "";
          more.querySelector(".posts").insertAdjacentHTML("afterbegin", others.map(function (q) { return card(q, ""); }).join(""));
          var cards = more.querySelectorAll(".post-card");
          for (var i = 2; i < cards.length; i++) cards[i].remove();
        }
      });
    })
    .catch(notFound);
})();
