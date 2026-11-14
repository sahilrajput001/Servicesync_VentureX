/* =========================================================
   1. REALISTIC SCROLL-DRIVEN HALF-PIZZA COOKING ENGINE
   ========================================================= */
(function initHalfPizzaScrollCooker() {
  const canvas = document.getElementById("pizzaCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const W = canvas.width;
  const H = canvas.height;
  const CX = W / 2;
  const CY = H / 2;
  const R = 335;

  function mulberry32(seed) {
    return function () {
      let t = (seed += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const rand = mulberry32(202611);

  const blisters = Array.from({ length: 42 }, () => {
    const angle = rand() * Math.PI * 2;
    const dist = R * (0.87 + rand() * 0.09);
    return {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      rx: 8 + rand() * 14,
      ry: 5 + rand() * 9,
      rot: angle + (rand() - 0.5) * 0.6,
      threshold: 0.32 + rand() * 0.5
    };
  });

  const cheesePatches = Array.from({ length: 58 }, () => {
    const angle = rand() * Math.PI * 2;
    const dist = Math.sqrt(rand()) * (R * 0.78);
    return {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      baseR: 18 + rand() * 24,
      rot: rand() * Math.PI,
      hasGoldenBubble: rand() > 0.35,
      bubbleOffset: { x: (rand() - 0.5) * 10, y: (rand() - 0.5) * 10 }
    };
  });

  const pepperoniSlices = Array.from({ length: 18 }, (_, idx) => {
    const ring = idx < 6 ? 0.34 : 0.65;
    const angle = (idx / (idx < 6 ? 6 : 12)) * Math.PI * 2 + rand() * 0.35;
    const dist = R * (ring + (rand() - 0.5) * 0.08);
    return {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      r: 24 + rand() * 6
    };
  });

  const basilLeaves = Array.from({ length: 14 }, () => {
    const angle = rand() * Math.PI * 2;
    const dist = Math.sqrt(rand()) * (R * 0.72);
    return {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      rot: rand() * Math.PI * 2,
      scale: 0.85 + rand() * 0.4
    };
  });

  const flourSpecks = Array.from({ length: 140 }, () => {
    const angle = rand() * Math.PI * 2;
    const dist = R * (0.83 + rand() * 0.14);
    return {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      r: 1 + rand() * 2.5
    };
  });

  function lerpColor(c1, c2, t) {
    const r = Math.round(c1[0] + (c2[0] - c1[0]) * t);
    const g = Math.round(c1[1] + (c2[1] - c1[1]) * t);
    const b = Math.round(c1[2] + (c2[2] - c1[2]) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }

  function drawPizza(cookProgress, spinRadians) {
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.translate(CX, CY);
    ctx.rotate(spinRadians);

    const crustOuter = lerpColor([238, 219, 172], [198, 114, 24], cookProgress);
    const crustMid = lerpColor([248, 234, 196], [235, 165, 52], cookProgress);
    const crustInner = lerpColor([228, 204, 152], [175, 92, 18], cookProgress);

    const crustGrad = ctx.createRadialGradient(0, 0, R * 0.76, 0, 0, R);
    crustGrad.addColorStop(0, crustInner);
    crustGrad.addColorStop(0.55, crustMid);
    crustGrad.addColorStop(1, crustOuter);

    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.fillStyle = crustGrad;
    ctx.fill();

    if (cookProgress < 0.85) {
      ctx.fillStyle = `rgba(255, 252, 240, ${(1 - cookProgress) * 0.45})`;
      flourSpecks.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    blisters.forEach(b => {
      if (cookProgress > b.threshold) {
        const intensity = Math.min(1, (cookProgress - b.threshold) * 2.8);
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, b.rx, b.ry, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(42, 18, 6, ${intensity * 0.78})`;
        ctx.fill();
        ctx.restore();
      }
    });

    const sauceColor = lerpColor([220, 48, 38], [156, 26, 18], cookProgress);
    ctx.beginPath();
    ctx.arc(0, 0, R * 0.83, 0, Math.PI * 2);
    ctx.fillStyle = sauceColor;
    ctx.fill();

    const cheeseBase = lerpColor([255, 252, 240], [251, 191, 36], cookProgress * 0.82);
    const cheeseEdge = lerpColor([245, 240, 220], [217, 119, 6], cookProgress);

    cheesePatches.forEach(p => {
      const meltScale = 1 + cookProgress * 0.42;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);

      const g = ctx.createRadialGradient(0, 0, 2, 0, 0, p.baseR * meltScale);
      g.addColorStop(0, cheeseBase);
      g.addColorStop(0.85, cheeseBase);
      g.addColorStop(1, cheeseEdge);

      ctx.beginPath();
      ctx.ellipse(0, 0, p.baseR * meltScale, p.baseR * 0.82 * meltScale, 0, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();

      if (p.hasGoldenBubble && cookProgress > 0.45) {
        const bAlpha = Math.min(0.85, (cookProgress - 0.45) * 1.7);
        ctx.beginPath();
        ctx.arc(p.bubbleOffset.x, p.bubbleOffset.y, 4.5 + cookProgress * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(146, 64, 14, ${bAlpha})`;
        ctx.fill();
      }
      ctx.restore();
    });

    pepperoniSlices.forEach(pep => {
      const pepFill = lerpColor([214, 72, 62], [148, 32, 22], cookProgress);
      const pepRim = lerpColor([240, 140, 130], [69, 14, 10], cookProgress);

      ctx.save();
      ctx.translate(pep.x, pep.y);
      ctx.beginPath();
      ctx.arc(0, 0, pep.r * (1 - cookProgress * 0.06), 0, Math.PI * 2);
      ctx.fillStyle = pepFill;
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = pepRim;
      ctx.stroke();

      if (cookProgress > 0.4) {
        ctx.beginPath();
        ctx.arc(-pep.r * 0.28, -pep.r * 0.28, pep.r * 0.22, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(253, 224, 71, ${(cookProgress - 0.4) * 0.55})`;
        ctx.fill();
      }
      ctx.restore();
    });

    basilLeaves.forEach(leaf => {
      const leafColor = lerpColor([34, 197, 94], [22, 101, 52], cookProgress);
      ctx.save();
      ctx.translate(leaf.x, leaf.y);
      ctx.rotate(leaf.rot);
      ctx.scale(leaf.scale, leaf.scale);
      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.quadraticCurveTo(13, 0, 0, 14);
      ctx.quadraticCurveTo(-13, 0, 0, -14);
      ctx.fillStyle = leafColor;
      ctx.fill();
      ctx.restore();
    });

    ctx.restore();
  }

  let targetProgress = 0;
  let currentProgress = 0;

  function computeScrollFraction() {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return 0;
    return Math.min(1, Math.max(0, window.scrollY / docHeight));
  }

  window.addEventListener("scroll", () => {
    targetProgress = computeScrollFraction();
  }, { passive: true });

  const hudText = document.getElementById("bakeStatusText");
  const bakeDot = document.getElementById("bakeDot");
  const ovenGlow = document.getElementById("ovenGlow");

  function animateLoop() {
    currentProgress += (targetProgress - currentProgress) * 0.085;
    const spinRadians = currentProgress * Math.PI * 3;
    drawPizza(currentProgress, spinRadians);

    const pct = Math.round(currentProgress * 100);
    if (hudText) {
      if (pct < 20) {
        hudText.textContent = `RAW DOUGH • ${pct}% BAKED`;
        bakeDot.style.background = "#fef3c7";
      } else if (pct < 75) {
        hudText.textContent = `WOOD-FIRING • ${pct}% BAKED`;
        bakeDot.style.background = "#f59e0b";
      } else {
        hudText.textContent = `GOLDEN & CRISPY • ${pct}%`;
        bakeDot.style.background = "#fde047";
      }
    }

    if (ovenGlow) {
      ovenGlow.style.opacity = String(0.35 + currentProgress * 0.65);
      ovenGlow.style.transform = `scale(${0.92 + currentProgress * 0.22})`;
    }

    requestAnimationFrame(animateLoop);
  }

  targetProgress = computeScrollFraction();
  animateLoop();
})();

/* =========================================================
   2. SCROLL REVEAL OBSERVER
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    },
    { threshold: 0.06 }
  );
  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
});

/* =========================================================
   3. MULTI-PAGE WEBSITE CUSTOMIZER & ORDER ENGINE
   ========================================================= */
const STORAGE_KEY = "servicesync_gold_storefront_v1";
const SUPABASE_URL = "https://feuvoasosfzmqtdgejlj.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_-_-CynztbX5qys_cWh0W9w_XRdJX74N";
const urlParams = new URLSearchParams(window.location.search);

const db = (SUPABASE_URL.startsWith("http") && window.supabase)
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

const defaultState = {
  profile: {
    name: "The Golden Oven Café",
    bio: "Wood-fired artisan pizzas, campus wraps & thick cold brews.",
    story: "Started five years ago in our college neighbourhood, we craft fresh, honest food from scratch every morning—now available with zero counter wait.",
    location: "Gate 2 Market, Near Campus",
    hours: "9:00 AM – 11:00 PM",
    instagram: "@goldenovencafe",
    whatsapp: "+91 98765 43210",
    heroBanner: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
    color: "#f5b82e"
  },
  design: {
    surfaceTheme: "obsidian", // 'obsidian', 'cream', 'midnight'
    fontStyle: "serif",       // 'serif', 'sans', 'mono'
    menuLayout: "grid",       // 'grid', 'list'
    showHero: true,
    showStory: true,
    showPerks: true,
    showFooter: true
  },
  items: [
    {
      id: 1,
      name: "Margherita Wood-Fired Pizza",
      category: "Signatures",
      price: 149,
      prepMins: 8,
      available: true,
      image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 2,
      name: "Golden Cold Brew Coffee",
      category: "Beverages",
      price: 75,
      prepMins: 4,
      available: true,
      image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 3,
      name: "Peri-Peri Paneer Wrap",
      category: "Quick Bites",
      price: 99,
      prepMins: 6,
      available: true,
      image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 4,
      name: "Truffle Alfredo Pasta",
      category: "Signatures",
      price: 169,
      prepMins: 12,
      available: false,
      image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=600&q=80"
    }
  ]
};

let state = loadState();
let pendingUploadedImageDataUrl = "";
let activeWebsitePage = "all"; // 'all', 'menu', 'story', 'contact'
let orderNowOnlyAvailable = false;
let selectedOrderMode = "student";
let customerCart = {};
let simulatedScanTimer = null;

function getCurrentSlug() {
  return state.profile.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "default_cafe";
}

function getLiveCustomerUrl() {
  return "https://servicesync.netlify.app/store.html";
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return defaultState;
    return {
      profile: { ...defaultState.profile, ...(saved.profile || {}) },
      design: { ...defaultState.design, ...(saved.design || {}) },
      items: saved.items || defaultState.items
    };
  } catch {
    return defaultState;
  }
}

async function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (db) {
    const slug = getCurrentSlug();
    await db.from("storefronts").upsert({
      id: slug,
      state,
      updated_at: new Date().toISOString()
    });
    await db.from("storefronts").upsert({
      id: "default_cafe",
      state,
      updated_at: new Date().toISOString()
    });
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const requestedCafe = urlParams.get("cafe");
  if (db) {
    const lookupId = requestedCafe || "default_cafe";
    const { data: cloudStore } = await db
      .from("storefronts")
      .select("state")
      .eq("id", lookupId)
      .single();

    if (cloudStore?.state) {
      state = {
        profile: { ...defaultState.profile, ...(cloudStore.state.profile || {}) },
        design: { ...defaultState.design, ...(cloudStore.state.design || {}) },
        items: cloudStore.state.items || []
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }

  // Hydrate inputs
  document.getElementById("inputCafeName").value = state.profile.name;
  document.getElementById("inputCafeBio").value = state.profile.bio;
  document.getElementById("inputCafeStory").value = state.profile.story;
  document.getElementById("inputCafeLocation").value = state.profile.location;
  document.getElementById("inputCafeHours").value = state.profile.hours;
  document.getElementById("inputInstagram").value = state.profile.instagram;
  document.getElementById("inputWhatsapp").value = state.profile.whatsapp;
  document.getElementById("customColorPicker").value = state.profile.color;

  document.getElementById("selectSiteTheme").value = state.design.surfaceTheme;
  document.getElementById("selectSiteFont").value = state.design.fontStyle;
  document.getElementById("selectMenuLayout").value = state.design.menuLayout;
  document.getElementById("toggleHero").checked = state.design.showHero;
  document.getElementById("toggleStory").checked = state.design.showStory;
  document.getElementById("togglePerks").checked = state.design.showPerks;
  document.getElementById("toggleFooter").checked = state.design.showFooter;

  applyGeneratedWebsiteTheme();
  renderAll();

  if (urlParams.get("view") === "site") {
    switchView("storefront");
    document.querySelector(".saas-navbar")?.classList.add("hidden");
    document.querySelector(".platform-hero")?.classList.add("hidden");
    document.querySelector(".pizza-stage")?.classList.add("hidden");
    document.querySelector(".customer-banner-strip")?.classList.add("hidden");
    document.querySelector(".footer")?.classList.add("hidden");
    const container = document.getElementById("fullStorefrontMount");
    if (container) {
      container.style.margin = "0 auto";
      container.style.borderRadius = "0";
      container.style.border = "none";
      container.style.maxWidth = "100%";
    }
  }
});

// Update Design System Variables for the Owner's Generated Website
function updateDesignSettings() {
  state.design.surfaceTheme = document.getElementById("selectSiteTheme").value;
  state.design.fontStyle = document.getElementById("selectSiteFont").value;
  state.design.menuLayout = document.getElementById("selectMenuLayout").value;
  state.design.showHero = document.getElementById("toggleHero").checked;
  state.design.showStory = document.getElementById("toggleStory").checked;
  state.design.showPerks = document.getElementById("togglePerks").checked;
  state.design.showFooter = document.getElementById("toggleFooter").checked;

  applyGeneratedWebsiteTheme();
  saveState();
  renderAll();
}

function setGoldAccent(hex, swatchEl) {
  state.profile.color = hex;
  document.querySelectorAll(".swatch").forEach(s => s.classList.remove("active"));
  if (swatchEl) swatchEl.classList.add("active");
  document.getElementById("customColorPicker").value = hex;
  applyGeneratedWebsiteTheme();
  saveState();
  renderAll();
}

function applyGeneratedWebsiteTheme() {
  const root = document.documentElement;
  root.style.setProperty("--site-accent", state.profile.color);

  if (state.design.surfaceTheme === "cream") {
    root.style.setProperty("--site-bg", "#faf6f0");
    root.style.setProperty("--site-surface", "#ffffff");
    root.style.setProperty("--site-text", "#1c1917");
    root.style.setProperty("--site-muted", "#57534e");
    root.style.setProperty("--site-border", "rgba(28, 25, 23, 0.14)");
  } else if (state.design.surfaceTheme === "midnight") {
    root.style.setProperty("--site-bg", "#0f172a");
    root.style.setProperty("--site-surface", "#1e293b");
    root.style.setProperty("--site-text", "#f8fafc");
    root.style.setProperty("--site-muted", "#94a3b8");
    root.style.setProperty("--site-border", "rgba(148, 163, 184, 0.22)");
  } else {
    root.style.setProperty("--site-bg", "#0b0b0f");
    root.style.setProperty("--site-surface", "#14141b");
    root.style.setProperty("--site-text", "#fafaf9");
    root.style.setProperty("--site-muted", "#a8a29e");
    root.style.setProperty("--site-border", "rgba(245, 184, 46, 0.25)");
  }

  if (state.design.fontStyle === "sans") {
    root.style.setProperty("--site-font-heading", "'Plus Jakarta Sans', sans-serif");
    root.style.setProperty("--site-font-body", "'Plus Jakarta Sans', sans-serif");
  } else if (state.design.fontStyle === "mono") {
    root.style.setProperty("--site-font-heading", "'Space Mono', monospace");
    root.style.setProperty("--site-font-body", "'Space Mono', monospace");
  } else {
    root.style.setProperty("--site-font-heading", "'Playfair Display', Georgia, serif");
    root.style.setProperty("--site-font-body", "'Plus Jakarta Sans', sans-serif");
  }
}

function updateCafeProfile() {
  state.profile.name = document.getElementById("inputCafeName").value.trim() || "My Restaurant";
  state.profile.bio = document.getElementById("inputCafeBio").value.trim();
  state.profile.story = document.getElementById("inputCafeStory").value.trim();
  state.profile.location = document.getElementById("inputCafeLocation").value.trim();
  state.profile.hours = document.getElementById("inputCafeHours").value.trim();
  state.profile.instagram = document.getElementById("inputInstagram").value.trim();
  state.profile.whatsapp = document.getElementById("inputWhatsapp").value.trim();
  saveState();
  renderAll();
}

function handleHeroBannerUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    state.profile.heroBanner = e.target.result;
    saveState();
    renderAll();
    showToast("✦ Updated Website Hero Cover Photo!");
  };
  reader.readAsDataURL(file);
}

function previewUploadedImage(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    pendingUploadedImageDataUrl = e.target.result;
    document.getElementById("uploadPreviewImg").src = pendingUploadedImageDataUrl;
    document.getElementById("uploadPreviewWrap").classList.remove("hidden");
  };
  reader.readAsDataURL(file);
}

function handleAddMenuItem(event) {
  event.preventDefault();
  const name = document.getElementById("itemName").value.trim();
  const category = document.getElementById("itemCategory").value;
  const price = Number(document.getElementById("itemPrice").value);
  const prepMins = Number(document.getElementById("itemPrepMins").value);
  const available = document.getElementById("itemAvailable").checked;

  const fallbackImg = `https://placehold.co/600x400/18181f/f5b82e?text=${encodeURIComponent(name)}`;

  state.items.unshift({
    id: Date.now(),
    name,
    category,
    price,
    prepMins,
    available,
    image: pendingUploadedImageDataUrl || fallbackImg
  });

  document.getElementById("addItemForm").reset();
  document.getElementById("itemAvailable").checked = true;
  pendingUploadedImageDataUrl = "";
  document.getElementById("uploadPreviewWrap").classList.add("hidden");

  saveState();
  renderAll();
  showToast(`✦ Published "${name}" to your website!`);
}

function toggleItemAvailability(id) {
  const item = state.items.find(i => i.id === id);
  if (!item) return;
  item.available = !item.available;
  if (!item.available) delete customerCart[id];
  saveState();
  renderAll();
  showToast(`${item.name} marked ${item.available ? "Available" : "Sold Out"}`);
}

function deleteMenuItem(id) {
  state.items = state.items.filter(i => i.id !== id);
  delete customerCart[id];
  saveState();
  renderAll();
}

function clearAllItems() {
  state.items = [];
  customerCart = {};
  saveState();
  renderAll();
}

function setPreviewDevice(mode, btnEl) {
  document.querySelectorAll(".vp-btn").forEach(b => b.classList.remove("active"));
  if (btnEl) btnEl.classList.add("active");
  const frame = document.getElementById("deviceFrameWrapper");
  if (mode === "mobile") {
    frame.classList.add("mobile-view");
  } else {
    frame.classList.remove("mobile-view");
  }
}

function navigateWebsitePage(page) {
  activeWebsitePage = page;
  renderAll();
}

function renderAll() {
  const liveUrl = getLiveCustomerUrl();
  document.getElementById("generatedUrlDisplay").textContent = liveUrl;
  document.getElementById("ownerItemCount").textContent = state.items.length;

  const openTabBtn = document.getElementById("openOwnerSiteTab");
  const heroBtn = document.getElementById("heroViewSiteBtn");
  const qrDirectBtn = document.getElementById("studioQrDirectLink");
  const qrBox = document.getElementById("studioQrImage");

  if (openTabBtn) openTabBtn.href = liveUrl;
  if (heroBtn) heroBtn.href = liveUrl;
  if (qrDirectBtn) qrDirectBtn.href = liveUrl;

  if (qrBox && window.QRCode && qrBox.dataset.url !== liveUrl) {
    qrBox.dataset.url = liveUrl;
    qrBox.innerHTML = "";
    new QRCode(qrBox, {
      text: liveUrl,
      width: 56,
      height: 56,
      colorDark: "#000000",
      colorLight: "#ffffff"
    });
  }

  renderOwnerSidebarList();
  const websiteHTML = buildGeneratedWebsiteHTML();
  document.getElementById("previewMount").innerHTML = websiteHTML;
  document.getElementById("fullStorefrontMount").innerHTML = websiteHTML;
}

function renderOwnerSidebarList() {
  const listEl = document.getElementById("ownerMenuList");
  if (state.items.length === 0) {
    listEl.innerHTML = `<p style="font-size:0.8rem;color:#a8a29e;">No dishes yet. Add your first dish above!</p>`;
    return;
  }

  listEl.innerHTML = state.items
    .map(
      item => `
      <div class="owner-item-row">
        <div class="owner-item-left">
          <img src="${item.image}" alt="${escapeHtml(item.name)}" />
          <div class="owner-item-meta">
            <strong>${escapeHtml(item.name)}</strong>
            <small>₹${item.price} • ⏱ ${item.prepMins}m • ${escapeHtml(item.category || "Menu")}</small>
          </div>
        </div>
        <div class="owner-item-controls">
          <button class="avail-pill-btn ${item.available ? "in" : "out"}" onclick="toggleItemAvailability(${item.id})">
            ${item.available ? "Available" : "Sold Out"}
          </button>
          <button class="text-btn danger" onclick="deleteMenuItem(${item.id})">✕</button>
        </div>
      </div>`
    )
    .join("");
}

function buildGeneratedWebsiteHTML() {
  const visibleItems = orderNowOnlyAvailable
    ? state.items.filter(item => item.available)
    : state.items;

  const cartSummary = getCustomerCartSummary();
  const d = state.design;
  const p = state.profile;

  const showHeroSection = d.showHero && (activeWebsitePage === "all" || activeWebsitePage === "home");
  const showPerksSection = d.showPerks && (activeWebsitePage === "all" || activeWebsitePage === "home");
  const showMenuSection = activeWebsitePage === "all" || activeWebsitePage === "menu" || activeWebsitePage === "home";
  const showStorySection = d.showStory && (activeWebsitePage === "all" || activeWebsitePage === "story");
  const showFooterSection = d.showFooter && (activeWebsitePage === "all" || activeWebsitePage === "contact");

  const menuContainerClass = d.menuLayout === "list" ? "menu-list-layout" : "menu-grid";

  return `
    <!-- Generated Website Navigation Bar -->
    <nav class="site-nav">
      <div class="site-brand-name" onclick="navigateWebsitePage('all')">
        ✦ ${escapeHtml(p.name)}
      </div>
      <div class="site-nav-links">
        <button class="site-nav-link ${activeWebsitePage === "all" ? "active" : ""}" onclick="navigateWebsitePage('all')">Home</button>
        <button class="site-nav-link ${activeWebsitePage === "menu" ? "active" : ""}" onclick="navigateWebsitePage('menu')">Menu &amp; Order</button>
        ${d.showStory ? `<button class="site-nav-link ${activeWebsitePage === "story" ? "active" : ""}" onclick="navigateWebsitePage('story')">Our Story</button>` : ""}
        ${d.showFooter ? `<button class="site-nav-link ${activeWebsitePage === "contact" ? "active" : ""}" onclick="navigateWebsitePage('contact')">Visit &amp; Socials</button>` : ""}
      </div>
      <button class="btn-site-accent" onclick="triggerOrderNowMode()">🛒 Order Now</button>
    </nav>

    <!-- 1. Customizable Hero Cover Section -->
    ${
      showHeroSection
        ? `<header class="site-hero" style="background-image: linear-gradient(135deg, rgba(8,8,12,0.88) 0%, rgba(18,14,8,0.78) 100%), url('${p.heroBanner}');">
            <div class="site-hero-inner">
              <span class="site-badge">✦ OFFICIAL RESTAURANT WEBSITE • DIRECT ONLINE ORDERING</span>
              <h1>${escapeHtml(p.name)}</h1>
              <p>${escapeHtml(p.bio)}</p>
              <div class="site-meta-strip">
                <span>📍 ${escapeHtml(p.location)}</span>
                <span>🕒 ${escapeHtml(p.hours)}</span>
                <span>📸 ${escapeHtml(p.instagram)}</span>
              </div>
              <div class="site-cta-row">
                <button class="btn-site-accent" onclick="triggerOrderNowMode()">
                  🛒 Order Now (Available Dishes Only)
                </button>
                <button class="btn-site-secondary" onclick="triggerFullMenuMode()">
                  📋 Browse Full Menu (${state.items.length})
                </button>
              </div>
            </div>
          </header>`
        : ""
    }

    <!-- 2. Customizable Perks Strip -->
    ${
      showPerksSection
        ? `<div class="site-perks-strip">
            <div class="perk-box">⚡ <strong>Zero Counter Queue</strong> — Order directly from your phone</div>
            <div class="perk-box">🎓 <strong>Student Express</strong> — Dedicated fast pickup shelf</div>
            <div class="perk-box">⏱️ <strong>Live Prep Times</strong> — Transparent serving estimates</div>
          </div>`
        : ""
    }

    <!-- 3. Customizable Menu & Ordering Section -->
    ${
      showMenuSection
        ? `<section class="site-section">
            <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:14px;flex-wrap:wrap;gap:10px;">
              <div>
                <h2 class="site-section-title">${orderNowOnlyAvailable ? "✦ Available Dishes Ready to Order" : "Our Menu"}</h2>
                <small style="color:var(--site-muted);">
                  ${orderNowOnlyAvailable ? "Showing only in-stock dishes with photo, cost, and serving time." : "Click 'Order Now' to filter strictly to available items."}
                </small>
              </div>
            </div>

            <div class="mode-bar">
              <strong style="font-size:0.84rem;">Select Service Mode:</strong>
              <div class="mode-buttons">
                <button class="mode-btn ${selectedOrderMode === "student" ? "active" : ""}" onclick="setCustomerMode('student')">🎓 Student Express</button>
                <button class="mode-btn ${selectedOrderMode === "dinein" ? "active" : ""}" onclick="setCustomerMode('dinein')">🍽️ Dine-In</button>
                <button class="mode-btn ${selectedOrderMode === "takeaway" ? "active" : ""}" onclick="setCustomerMode('takeaway')">🛍️ Takeaway</button>
              </div>
            </div>

            ${
              visibleItems.length === 0
                ? `<p style="padding:28px;text-align:center;color:var(--site-muted);">No available dishes right now. Check back soon!</p>`
                : `<div class="${menuContainerClass}">
                    ${visibleItems
                      .map(item => {
                        const qty = customerCart[item.id] || 0;
                        return `
                          <div class="food-card ${item.available ? "" : "unavailable"}">
                            <div class="food-img-box">
                              <img src="${item.image}" alt="${escapeHtml(item.name)}" />
                              <span class="time-chip">⏱ ${item.prepMins} mins</span>
                              <span class="status-chip ${item.available ? "in" : "out"}">
                                ${item.available ? "● Available" : "Sold Out"}
                              </span>
                            </div>
                            <div class="food-details">
                              <div>
                                <div class="food-cat-tag">${escapeHtml(item.category || "Signatures")}</div>
                                <h3>${escapeHtml(item.name)}</h3>
                              </div>
                              <div class="food-bottom">
                                <span class="food-price">₹${item.price}</span>
                                ${
                                  !item.available
                                    ? `<button class="btn-add-item" disabled>Sold Out</button>`
                                    : `<button class="btn-add-item" onclick="addToCustomerCart(${item.id})">
                                         ${qty > 0 ? `+ Add (${qty})` : "+ Order"}
                                       </button>`
                                }
                              </div>
                            </div>
                          </div>`;
                      })
                      .join("")}
                  </div>`
            }

            ${
              cartSummary.count > 0
                ? `<div class="cart-bar">
                     <div>
                       <strong style="color:var(--site-accent);">${cartSummary.count} Dish(es) Selected • ₹${cartSummary.total}</strong>
                       <small style="display:block;color:#d6d3d1;">Estimated Serving Time: ${cartSummary.maxPrep} mins</small>
                     </div>
                     <button class="btn-site-accent" onclick="openConfirmModal()">Review &amp; Confirm Order →</button>
                   </div>`
                : ""
            }
          </section>`
        : ""
    }

    <!-- 4. Customizable "Our Story / About Us" Section -->
    ${
      showStorySection
        ? `<section class="site-section">
            <h2 class="site-section-title">Our Story</h2>
            <div class="site-story-box">
              <p>${escapeHtml(p.story)}</p>
            </div>
          </section>`
        : ""
    }

    <!-- 5. Customizable Socials, Location & Hours Footer -->
    ${
      showFooterSection
        ? `<footer class="site-footer">
            <div>
              <strong style="color:var(--site-accent);font-size:1rem;">${escapeHtml(p.name)}</strong>
              <p style="color:var(--site-muted);margin-top:4px;">📍 ${escapeHtml(p.location)} • 🕒 ${escapeHtml(p.hours)}</p>
            </div>
            <div class="social-pills">
              <span class="social-pill">📸 ${escapeHtml(p.instagram)}</span>
              <span class="social-pill">💬 ${escapeHtml(p.whatsapp)}</span>
            </div>
          </footer>`
        : ""
    }
  `;
}

function triggerOrderNowMode() {
  orderNowOnlyAvailable = true;
  activeWebsitePage = "menu";
  renderAll();
  showToast("✦ Showing available dishes with photo, cost & serving time!");
}

function triggerFullMenuMode() {
  orderNowOnlyAvailable = false;
  activeWebsitePage = "all";
  renderAll();
}

function setCustomerMode(mode) {
  selectedOrderMode = mode;
  renderAll();
}

function addToCustomerCart(id) {
  customerCart[id] = (customerCart[id] || 0) + 1;
  renderAll();
}

function getCustomerCartSummary() {
  let count = 0;
  let total = 0;
  let maxPrep = 0;
  const list = [];

  for (const [idStr, qty] of Object.entries(customerCart)) {
    const item = state.items.find(i => i.id === Number(idStr));
    if (!item || !item.available) continue;
    count += qty;
    total += item.price * qty;
    if (item.prepMins > maxPrep) maxPrep = item.prepMins;
    list.push({ ...item, qty });
  }
  return { count, total, maxPrep, list };
}

function openConfirmModal() {
  const summary = getCustomerCartSummary();
  const modeText =
    selectedOrderMode === "student"
      ? "🎓 Student Express (Zero Counter Queue)"
      : selectedOrderMode === "dinein"
      ? "🍽️ Dine-In Service"
      : "🛍️ Takeaway Pre-Order";

  const paymentPayload = `SERVICESYNC_PAY|STORE:${state.profile.name}|AMOUNT:INR_${summary.total}|REF:${Date.now()}`;
  const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=6&data=${encodeURIComponent(paymentPayload)}`;

  const summaryBox = document.getElementById("confirmSummaryBox");
  summaryBox.style.maxHeight = "70vh";
  summaryBox.style.overflowY = "auto";

  summaryBox.innerHTML = `
    <strong>Website:</strong> ${escapeHtml(state.profile.name)}<br>
    <strong>Service Mode:</strong> ${modeText}<br>
    <strong>Est. Serving Time:</strong> ${summary.maxPrep} mins<br><br>
    ${summary.list.map(i => `• ${escapeHtml(i.name)} × ${i.qty} — ₹${i.price * i.qty}`).join("<br>")}<br><br>
    <strong style="color:var(--gold-primary);font-size:1.08rem;">Total Payable: ₹${summary.total}</strong>

    <div style="margin-top:14px;padding:12px;background:#14141b;border:1px solid rgba(245,184,46,0.45);border-radius:10px;text-align:center;">
      <div style="font-size:0.8rem;color:#fde047;font-weight:800;margin-bottom:8px;">
        📲 Scan QR to Pay ₹${summary.total}
      </div>
      <div onclick="triggerSimulatedScanSuccess(${summary.total})" title="Tap to simulate scan" style="display:inline-block;background:#ffffff;padding:8px;border-radius:8px;line-height:0;cursor:pointer;">
        <img src="${qrImgUrl}" alt="Payment QR" width="150" height="150" style="display:block;border-radius:4px;" />
      </div>
      <div id="scanDetectStatus" style="margin-top:8px;font-size:0.76rem;font-weight:700;color:#38bdf8;">
        ⏳ Waiting for QR scan... (Auto-detects in 5s or tap QR)
      </div>
    </div>
  `;

  document.getElementById("confirmModal").classList.remove("hidden");

  clearTimeout(simulatedScanTimer);
  simulatedScanTimer = setTimeout(() => {
    triggerSimulatedScanSuccess(summary.total);
  }, 5000);
}

function triggerSimulatedScanSuccess(amount) {
  clearTimeout(simulatedScanTimer);
  const statusEl = document.getElementById("scanDetectStatus");
  if (statusEl) {
    statusEl.style.color = "#4ade80";
    statusEl.textContent = `✓ QR Scan Detected! ₹${amount} Verified — Placing Order...`;
  }
  setTimeout(() => {
    finalizeCustomerOrder();
  }, 900);
}

function closeConfirmModal() {
  clearTimeout(simulatedScanTimer);
  document.getElementById("confirmModal").classList.add("hidden");
}

async function finalizeCustomerOrder() {
  clearTimeout(simulatedScanTimer);
  const summary = getCustomerCartSummary();
  const prefix = selectedOrderMode === "student" ? "S" : selectedOrderMode === "dinein" ? "G" : "T";
  const token = `${prefix}-${Math.floor(100 + Math.random() * 900)}`;

  const newOrder = {
    id: Date.now(),
    token,
    mode: selectedOrderMode === "dinein" ? "general" : selectedOrderMode,
    detail:
      selectedOrderMode === "student"
        ? "Student Express Shelf"
        : selectedOrderMode === "dinein"
        ? "Dine-In Table"
        : "Scheduled Takeaway",
    is_priority: false,
    eta: summary.maxPrep,
    total: summary.total,
    status: "new",
    items: summary.list.map(i => ({ name: i.name, qty: i.qty }))
  };

  const existingOrders = JSON.parse(localStorage.getItem("servicesync_live_orders_v1") || "[]");
  existingOrders.push(newOrder);
  localStorage.setItem("servicesync_live_orders_v1", JSON.stringify(existingOrders));

  if (db) {
    await db.from("orders").insert([newOrder]);
  }

  document.getElementById("tokenCodeDisplay").textContent = token;
  document.getElementById("tokenModeText").textContent =
    selectedOrderMode === "student"
      ? "Student Express • Collect from Student Shelf!"
      : selectedOrderMode === "dinein"
      ? "Dine-In Order • Sent directly to kitchen!"
      : "Takeaway Order • Ready for scheduled pickup!";
  document.getElementById("tokenEtaText").textContent = `${summary.maxPrep} mins`;

  customerCart = {};
  closeConfirmModal();
  renderAll();
  document.getElementById("tokenModal").classList.remove("hidden");
}

function closeTokenModal() {
  document.getElementById("tokenModal").classList.add("hidden");
}

function switchView(target) {
  const builderEl = document.getElementById("builderWorkspace");
  const fullEl = document.getElementById("fullStorefrontWorkspace");
  const bBtn = document.getElementById("builderTabBtn");

  if (target === "builder") {
    builderEl.classList.remove("hidden");
    fullEl.classList.add("hidden");
    if (bBtn) bBtn.classList.add("active");
  } else {
    builderEl.classList.add("hidden");
    fullEl.classList.remove("hidden");
    if (bBtn) bBtn.classList.remove("active");
  }
}

function downloadStandaloneHTML() {
  const slug = getCurrentSlug();
  const websiteContent = buildGeneratedWebsiteHTML();

  const exportedHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(state.profile.name)} | Official Website</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
  :root {
    --site-bg: ${getComputedStyle(document.documentElement).getPropertyValue("--site-bg")};
    --site-surface: ${getComputedStyle(document.documentElement).getPropertyValue("--site-surface")};
    --site-text: ${getComputedStyle(document.documentElement).getPropertyValue("--site-text")};
    --site-muted: ${getComputedStyle(document.documentElement).getPropertyValue("--site-muted")};
    --site-accent: ${state.profile.color};
    --site-border: ${getComputedStyle(document.documentElement).getPropertyValue("--site-border")};
    --site-font-heading: 'Playfair Display', serif;
    --site-font-body: 'Plus Jakarta Sans', sans-serif;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--site-bg); color: var(--site-text); font-family: var(--site-font-body); }
  ${document.querySelector("style")?.innerHTML || ""}
</style>
<link rel="stylesheet" href="style.css">
</head>
<body class="generated-website-root">
  ${websiteContent}
</body></html>`;

  const blob = new Blob([exportedHTML], { type: "text/html" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${slug}-website.html`;
  a.click();
  showToast(`✦ Exported full website (${slug}-website.html)!`);
}

function copyShareLink() {
  const url = getLiveCustomerUrl();
  navigator.clipboard?.writeText(url);
  showToast("✦ Live customer website URL copied!");
}

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  setTimeout(() => t.classList.add("hidden"), 3000);
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}