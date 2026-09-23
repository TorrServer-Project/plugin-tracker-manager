// ============================================================
// tracker-manager — service.js
// Global torrent tracker policy manager.
// ============================================================

const VALID_MODES = ['none', 'append', 'replace', 'remove'];
const MAX_TRACKERS = 1000;

const defaultTrackers = [
    "http://retracker.local/announce",
    "http://bt4.t-ru.org/ann?magnet",
    "http://retracker.mgts.by:80/announce",
    "http://tracker.city9x.com:2710/announce",
    "http://tracker.electro-torrent.pl:80/announce",
    "http://tracker.internetwarriors.net:1337/announce",
    "http://tracker2.itzmx.com:6961/announce",
    "udp://opentor.org:2710",
    "udp://public.popcorn-tracker.org:6969/announce",
    "udp://tracker.opentrackr.org:1337/announce",
    "http://bt.svao-ix.ru/announce",
    "udp://explodie.org:6969/announce",
    "wss://tracker.btorrent.xyz",
    "wss://tracker.openwebtorrent.com"
];

const defaultConfig = {
    mode: "append",
    trackers: defaultTrackers
};

// ─── Валидация ───────────────────────────────────────────────

function normalizeMode(raw) {
    const m = String(raw || '').trim().toLowerCase();
    return VALID_MODES.indexOf(m) !== -1 ? m : 'append';
}

function normalizeTrackers(raw) {
    let list = [];

    if (Array.isArray(raw)) {
        list = raw.map(function(t) { return String(t).trim(); });
    } else if (typeof raw === 'string') {
        list = raw.split('\n').map(function(t) { return t.trim(); });
    }

    list = list.filter(function(t) { return t.length > 0; });

    const seen = {};
    const result = [];
    for (let i = 0; i < list.length; i++) {
        if (!seen[list[i]]) {
            seen[list[i]] = true;
            result.push(list[i]);
        }
    }

    return result;
}

function validateConfig(raw) {
    if (!raw || typeof raw !== 'object') return null;
    if (typeof raw.mode !== 'string') return null;
    if (!Array.isArray(raw.trackers)) return null;
    if (VALID_MODES.indexOf(raw.mode) === -1) return null;

    const trackers = raw.trackers.filter(function(t) { return typeof t === 'string' && t.length > 0; });
    return { mode: raw.mode, trackers: trackers };
}

// ─── Загрузка конфигурации ───────────────────────────────────

let currentConfig;

function applyConfig(cfg) {
    currentConfig = cfg;
    ts.storage.set('config', JSON.stringify(cfg));
    ts.torrent.setTrackerPolicy(cfg);
}

(function loadConfig() {
    const savedStr = ts.storage.get('config');

    if (!savedStr) {
        applyConfig(defaultConfig);
        console.log("Initialized with default configuration");
        return;
    }

    try {
        const parsed = JSON.parse(savedStr);
        const validated = validateConfig(parsed);
        if (!validated) {
            throw new Error("invalid structure");
        }
        applyConfig(validated);
        console.log("Loaded saved configuration");
    } catch (e) {
        applyConfig(defaultConfig);
        console.log("Corrupted configuration detected, reset to default: " + e);
    }
})();

// ─── Static files ────────────────────────────────────────────

ts.web.staticFile('/', 'index.html');
ts.web.staticFile('/index.html', 'index.html');
ts.web.staticDir('/js', 'js');
ts.web.staticDir('/img', 'img');

// ─── API ─────────────────────────────────────────────────────

function requireOwner(req, res) {
    if (!req.user || req.user.rank < 100) {
        res.status(403).json({ error: "forbidden" });
        return false;
    }
    return true;
}

ts.web.get('/api/config', function(req, res) {
    if (!requireOwner(req, res)) return;
    return res.json(currentConfig);
});

ts.web.post('/api/save', function(req, res) {
    if (!requireOwner(req, res)) return;

    let body = req.body;
    if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) { body = {}; }
    }
    if (!body || typeof body !== 'object') body = {};

    const mode = normalizeMode(body.mode);
    const trackers = normalizeTrackers(body.trackers);

    if (trackers.length > MAX_TRACKERS) {
        return res.status(400).json({
            error: "too many trackers (max " + MAX_TRACKERS + ")"
        });
    }

    const cfg = { mode: mode, trackers: trackers };
    applyConfig(cfg);

    console.log("Configuration saved and applied to the torrent engine");
    return res.json({ status: "ok", config: cfg });
});

console.log("[Tracker Manager] Started");