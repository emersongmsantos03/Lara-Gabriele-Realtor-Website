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

  var ICONS = {
    fb: "M13.5 21v-7.5H16l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H8v3h2.4V21z",
    x: "M17.8 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8zm-1.1 16.2h1.7L7.4 4.7H5.6z",
    li: "M6.9 8.8H3.6V20h3.3zM5.2 3.5a1.9 1.9 0 100 3.8 1.9 1.9 0 000-3.8zM20.4 13.6c0-3-.6-5.1-4.1-5.1-1.7 0-2.8.9-3.2 1.8h-.1V8.8H9.8V20h3.3v-5.5c0-1.5.3-2.9 2.1-2.9s1.8 1.7 1.8 3V20h3.4z",
    mail: "M3 5h18a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1zm1 2.6V17h16V7.6l-8 5.3zM5.8 7l6.2 4.1L18.2 7z",
    link: "M8.8 15.2a1 1 0 010-1.4l5-5a1 1 0 111.4 1.4l-5 5a1 1 0 01-1.4 0zM7.8 20.2A4 4 0 015 13.3l2.5-2.5a1 1 0 011.4 1.4l-2.5 2.5a2 2 0 002.8 2.8l2.5-2.5a1 1 0 011.4 1.4l-2.5 2.5a4 4 0 01-2.8 1.3zM16 13.6a1 1 0 01-.7-1.7l2.5-2.5a2 2 0 00-2.8-2.8l-2.5 2.5a1 1 0 01-1.4-1.4l2.5-2.5a4 4 0 015.6 5.6l-2.5 2.5a1 1 0 01-.7.3z",
    check: "M9.5 16.2 5.3 12l-1.4 1.4 5.6 5.6 11-11-1.4-1.4z",
  };
  function svg(d) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + d + '"/></svg>';
  }
  function icon(tag, net, href, d) {
    var label = net === "Copy link" ? "Copy link" : "Share on " + net;
    if (net === "Email") label = "Share by email";
    return tag === "a"
      ? '<a data-net="' + net + '" href="' + href + '"' + (net === "Email" ? "" : ' target="_blank" rel="noopener"') + ' aria-label="' + label + '" title="' + label + '">' + svg(d) + "</a>"
      : '<button type="button" data-net="' + net + '" aria-label="' + label + '" title="' + label + '">' + svg(d) + "</button>";
  }

  // ---------- Single post ----------
  var root = document.getElementById("pfr-post");
  if (!root) return;
  var slug = new URLSearchParams(location.search).get("slug");
  var $ = function (id) { return document.getElementById(id); };

  function notFound() {
    $("pfr-title").textContent = "Article not found";
    $("pfr-date").textContent = "";
    if ($("pfr-cover")) $("pfr-cover").hidden = true;
    if ($("pfr-excerpt")) $("pfr-excerpt").hidden = true;
    if ($("pfr-share")) $("pfr-share").innerHTML = "";
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
        // Full cover photo under the title (never cropped behind text:
        // many covers have words baked into the image).
        var fig = $("pfr-cover");
        if (!fig) {
          fig = document.createElement("figure");
          fig.className = "pfr-cover";
          fig.appendChild(document.createElement("img"));
          $("pfr-hero").classList.add("has-cover");
          $("pfr-hero").insertAdjacentElement("afterend", fig);
        }
        var im = fig.querySelector("img");
        im.src = p.coverImage;
        im.alt = p.coverAlt || "";
        fig.hidden = false;
        var og = document.createElement("meta");
        og.setAttribute("property", "og:image");
        og.content = p.coverImage;
        document.head.appendChild(og);
      }
      $("pfr-title").textContent = p.title;
      var editorial = !!$("pfr-excerpt"); // newer post.html layout
      $("pfr-date").textContent = (editorial ? "Published " : "") + fmt(p.publishAt) + " · " + p.readingMinutes + " min read";

      // Post HTML is sanitized by the server when it is saved.
      var body = $("pfr-body");
      body.innerHTML = p.contentHtml;

      if (editorial) {
        // The page already shows the author, so drop a first line like "By Lara, eXp Realty".
        var first = body.firstElementChild;
        if (first && first.tagName === "P" && /^by\s/i.test(first.textContent.trim()) && first.textContent.length < 60) first.remove();
        // Subtitle: only a real summary, not the auto-made start of the article.
        var flat = function (s) { return String(s || "").toLowerCase().replace(/[^a-z0-9]/g, ""); };
        var sub = p.seoDescription || p.excerpt || "";
        var bodyText = flat(p.contentHtml.replace(/<[^>]+>/g, " "));
        var head = flat(sub.replace(/(\u2026|\.\.\.)\s*$/, ""));
        if (sub && head && bodyText.indexOf(head.slice(0, 80)) === -1) {
          $("pfr-excerpt").textContent = sub;
          $("pfr-excerpt").hidden = false;
        }
      }

      // Topics under the title
      if (p.tags && p.tags.length) {
        var tags = $("pfr-tags");
        if (!tags) {
          tags = document.createElement("div");
          tags.className = "pfr-tags";
          $("pfr-title").insertAdjacentElement("afterend", tags);
        }
        tags.innerHTML = p.tags.map(function (t) {
          t = String(t);
          return "<span>" + esc(editorial ? t.charAt(0).toUpperCase() + t.slice(1) : t) + "</span>";
        }).join("");
      }

      // Share buttons after the article
      var url = location.href.split("#")[0];
      var u = encodeURIComponent(url), t = encodeURIComponent(p.title);
      var share = $("pfr-share");
      if (share) {
        // Icon buttons next to the author
        share.innerHTML =
          icon("a", "Facebook", "https://www.facebook.com/sharer/sharer.php?u=" + u, ICONS.fb) +
          icon("a", "X", "https://twitter.com/intent/tweet?url=" + u + "&text=" + t, ICONS.x) +
          icon("a", "LinkedIn", "https://www.linkedin.com/sharing/share-offsite/?url=" + u, ICONS.li) +
          icon("a", "Email", "mailto:?subject=" + t + "&body=" + u, ICONS.mail) +
          icon("button", "Copy link", "", ICONS.link);
      } else {
        share = document.createElement("div");
        share.className = "pfr-share";
        share.innerHTML =
          "<b>Share</b>" +
          '<a data-net="Facebook" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=' + u + '">Facebook</a>' +
          '<a data-net="X" target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?url=' + u + "&text=" + t + '">X</a>' +
          '<a data-net="LinkedIn" target="_blank" rel="noopener" href="https://www.linkedin.com/sharing/share-offsite/?url=' + u + '">LinkedIn</a>' +
          '<a data-net="Email" href="mailto:?subject=' + t + "&body=" + u + '">Email</a>' +
          '<button type="button" data-net="Copy link">Copy link</button>';
        body.insertAdjacentElement("afterend", share);
      }
      share.addEventListener("click", function (e) {
        var el = e.target.closest("[data-net]");
        if (!el) return;
        track("share", p.slug, el.getAttribute("data-net"));
        if (el.tagName === "BUTTON") {
          try {
            navigator.clipboard.writeText(url);
            if (el.querySelector("svg")) {
              el.classList.add("ok");
              el.innerHTML = svg(ICONS.check);
              el.setAttribute("aria-label", "Link copied");
            } else el.textContent = "Copied!";
          } catch (err) {}
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
        var max = editorial ? 3 : 2;
        var others = (list.posts || []).filter(function (q) { return q.slug !== p.slug; }).slice(0, max);
        var more = $("pfr-more");
        if (more && !others.length && !more.querySelector(".post-card")) more.style.display = "none";
        if (more && others.length) {
          more.style.display = "";
          more.querySelector(".posts").insertAdjacentHTML("afterbegin", others.map(function (q) { return card(q, ""); }).join(""));
          var cards = more.querySelectorAll(".post-card");
          for (var i = max; i < cards.length; i++) cards[i].remove();
        }
      });
    })
    .catch(notFound);
})();
