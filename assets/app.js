const BASE = document.body.dataset.base || "";
const LF = {
    users() { try {
        return JSON.parse(localStorage.getItem("lf_users")) || {};
    }
    catch (e) {
        return {};
    } },
    put(u) { localStorage.setItem("lf_users", JSON.stringify(u)); },
    hash(s) { let h = 5381; for (const c of s)
        h = (h * 33 ^ c.charCodeAt(0)) >>> 0; return h.toString(36); },
    me() { return localStorage.getItem("lf_session"); },
    user() { const n = this.me(); return n ? this.users()[n] || null : null; },
    need() { const u = this.user(); if (!u)
        location.href = BASE + "login/index.html"; return u; },
    save(fn) { const us = this.users(), n = this.me(); if (!us[n])
        return; fn(us[n]); this.put(us); },
    register(name, p, p2) {
        const k = name.trim().toLowerCase(), us = this.users();
        if (!/^[a-z0-9_]{3,20}$/.test(k))
            return "Nama pengguna 3–20 karakter: huruf, angka, atau _.";
        if (p.length < 6)
            return "Kata sandi minimal 6 karakter.";
        if (p !== p2)
            return "Konfirmasi kata sandi tidak sama.";
        if (us[k])
            return "Nama pengguna sudah dipakai.";
        us[k] = { name: name.trim(), pass: this.hash(p), joined: Date.now(), save: { day: 1, coins: 0, up: { store: 0, speed: 0 }, hist: [] } };
        this.put(us);
        localStorage.setItem("lf_session", k);
        return "";
    },
    login(name, p) {
        const k = name.trim().toLowerCase(), u = this.users()[k];
        if (!u || u.pass !== this.hash(p))
            return "Nama pengguna atau kata sandi salah.";
        localStorage.setItem("lf_session", k);
        return "";
    },
    logout() { localStorage.removeItem("lf_session"); location.href = BASE + "index.html"; },
    cfg() { let c = {}; try {
        c = JSON.parse(localStorage.getItem("lf_settings")) || {};
    }
    catch (e) { } return Object.assign({ theme: "auto", music: true, sfx: true, mv: .5, sv: .6 }, c); },
    setCfg(p) { localStorage.setItem("lf_settings", JSON.stringify(Object.assign(this.cfg(), p))); this.theme(); this.bgmSync(); },
    theme() { document.documentElement.dataset.theme = this.cfg().theme; },
    sfx(t) {
        const c = this.cfg();
        if (!c.sfx)
            return;
        try {
            const A = this._a = this._a || new (window.AudioContext || window.webkitAudioContext)(), o = A.createOscillator(), g = A.createGain(), n = A.currentTime, f = { click: [500, .05], ok: [700, .25], bad: [180, .25], found: [900, .3] }[t] || [500, .05];
            o.type = t === "bad" ? "sawtooth" : "triangle";
            o.frequency.setValueAtTime(f[0], n);
            if (t === "ok" || t === "found")
                o.frequency.setValueAtTime(f[0] * 1.5, n + .1);
            g.gain.setValueAtTime(.2 * c.sv, n);
            g.gain.linearRampToValueAtTime(.001, n + f[1]);
            o.connect(g);
            g.connect(A.destination);
            o.start(n);
            o.stop(n + f[1]);
        }
        catch (e) { }
    },
    bgm() { if (!this._b) {
        const a = this._b = new Audio(BASE + "assets/audio/bgm.mp3");
        a.loop = true;
        addEventListener("pointerdown", () => { if (this.cfg().music)
            a.play().catch(() => { }); }, { once: true });
    } this.bgmSync(); },
    bgmSync() { const a = this._b; if (!a)
        return; const c = this.cfg(); a.volume = c.mv; if (c.music)
        a.play().catch(() => { });
    else
        a.pause(); }
};
LF.theme();
(function () {
    const nav = document.getElementById("nav");
    if (!nav)
        return;
    const l = (h, t) => `<a href="${BASE}${h}">${t}</a>`;
    nav.innerHTML = `<b>🎒 Lost &amp; Found Sekolah</b>` + l("index.html", "Beranda") +
        (LF.user() ? l("dashboard/index.html", "Dashboard") + l("game/index.html", "Main") + l("shop/index.html", "Toko") + l("settings/index.html", "Pengaturan") + `<a href="#" onclick="LF.logout();return false">Keluar</a>`
            : l("login/index.html", "Masuk") + l("register/index.html", "Daftar") + l("settings/index.html", "Pengaturan")) + l("contact/index.html", "Kontak");
})();
