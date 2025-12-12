setInterval(onTick, 1000);

document.addEventListener("DOMContentLoaded", onInit);
document.addEventListener('visibilitychange', onVisibilityChange)

function onTick() {
    updateTime();
    updateMusicPlayerUI();
    checkShouldBePlaying();
}

function onInit() {
    const playTunes = localStorage.getItem('playTunes');
    if (playTunes == null) {
        localStorage.setItem('playTunes', 'true');
    }

    initDraggableWindows();
    initResizeHandler();
    initMusicPlayer();
}

function updateTime() {
    let date = new Date();
    document.querySelector('.time').innerText = date.toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    });
}

function initDraggableWindows() {
    const windows = document.querySelectorAll('.window.draggable');
    const desktop = document.getElementById('desktop');

    windows.forEach(win => {
        const titleBar = win.querySelector('.title-bar');
        let isDragging = false;
        let offsetX, offsetY;

        function startDrag(e) {
            isDragging = true;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            offsetX = clientX - win.offsetLeft;
            offsetY = clientY - win.offsetTop;
            win.style.position = 'absolute';
        }

        function doDrag(e) {
            if (!isDragging) return;

            // Prevent scrolling while dragging
            if (e.touches) e.preventDefault();

            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const desktopRect = desktop.getBoundingClientRect();

            let newX = clientX - offsetX;
            let newY = clientY - offsetY;

            newX = Math.max(0, Math.min(newX, desktopRect.width - win.offsetWidth));
            newY = Math.max(0, Math.min(newY, desktopRect.height - win.offsetHeight));

            win.style.left = newX + 'px';
            win.style.top = newY + 'px';
            win.style.bottom = 'auto';
            win.style.right = 'auto';
        }

        function endDrag() {
            isDragging = false;
        }

        // Mouse events
        titleBar.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', doDrag);
        document.addEventListener('mouseup', endDrag);

        // Touch events
        titleBar.addEventListener('touchstart', startDrag, {passive: false});
        document.addEventListener('touchmove', doDrag, {passive: false});
        document.addEventListener('touchend', endDrag);
    });
}

function initResizeHandler() {
    window.addEventListener('resize', () => {
        const desktop = document.getElementById('desktop');
        const desktopRect = desktop.getBoundingClientRect();
        const windows = document.querySelectorAll('.window.draggable');

        windows.forEach(win => {
            let newX = win.offsetLeft;
            let newY = win.offsetTop;

            // Push window back if it's outside bounds
            if (newX + win.offsetWidth > desktopRect.width) {
                newX = Math.max(0, desktopRect.width - win.offsetWidth);
            }
            if (newY + win.offsetHeight > desktopRect.height) {
                newY = Math.max(0, desktopRect.height - win.offsetHeight);
            }

            win.style.left = newX + 'px';
            win.style.top = newY + 'px';
            win.style.bottom = 'auto';
            win.style.right = 'auto';
        });
    });
}

function onVisibilityChange() {
    const player = getPlayer();
    if (document.hidden) {
        player.pause();
    } else {
        const playTunes = localStorage.getItem('playTunes');
        if (playTunes === 'true') {
            player.play();
        }
    }
}

function checkShouldBePlaying() {
    const playTunes = localStorage.getItem('playTunes');
    if (playTunes !== 'true' || document.hidden) {
        onStopClicked();
        return;
    }
    onPlayClicked();
}

function initMusicPlayer() {

}

function updateMusicPlayerUI() {
    const player = getPlayer();

    player.getDuration((duration) => {
        player.getPosition((position) => {
            const progressBar = document.getElementById('music-player-progress');
            if (duration > 0) {
                const progressPercent = (position / duration) * 100;
                progressBar.style.width = progressPercent + '%';
            } else {
                progressBar.style.width = '0%';
            }

            updateSongDurationDisplay(position, duration);
        });
    });
}

function updateSongDurationDisplay(position, duration) {
    const positionSeconds = Math.floor(position / 1000);
    const durationSeconds = Math.floor(duration / 1000);

    const posMinutes = Math.floor(positionSeconds / 60);
    const posSecs = positionSeconds % 60;
    const durMinutes = Math.floor(durationSeconds / 60);
    const durSecs = durationSeconds % 60;

    const positionStr = posMinutes + ':' + (posSecs < 10 ? '0' : '') + posSecs;
    const durationStr = durMinutes + ':' + (durSecs < 10 ? '0' : '') + durSecs;

    document.getElementById('music-player-song-position').textContent = positionStr;
    document.getElementById('music-player-song-duration').textContent = durationStr;
}


function onPlayClicked() {
    const btn = document.getElementById('music-player-play-pause-button');
    btn.textContent = "❚❚";
    btn.onclick = onStopClicked;

    localStorage.setItem('playTunes', 'true');
    getPlayer().play();
}

function onStopClicked() {
    const btn = document.getElementById('music-player-play-pause-button');
    btn.textContent = "▶";
    btn.onclick = onPlayClicked;

    localStorage.setItem('playTunes', 'false');
    getPlayer().pause();
}

function getPlayer() {
    return SC.Widget(document.getElementById('music-player-iframe'));
}

function onWindowClose(windowId) {
    const win = document.getElementById(windowId);
    if (win) {
        win.style.display = 'none';
    }
}

function closePlayer() {
    onStopClicked();
    onWindowClose('music-player-window');
}


// Souncloud Widget API:
var SC = "object" == typeof SC ? SC : {};
SC.Widget = function (e) {
    var t = {};

    function n(r) {
        if (t[r]) return t[r].exports;
        var o = t[r] = {i: r, l: !1, exports: {}};
        return e[r].call(o.exports, o, o.exports, n), o.l = !0, o.exports
    }

    return n.m = e, n.c = t, n.d = function (e, t, r) {
        n.o(e, t) || Object.defineProperty(e, t, {enumerable: !0, get: r})
    }, n.r = function (e) {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {value: "Module"}), Object.defineProperty(e, "__esModule", {value: !0})
    }, n.t = function (e, t) {
        if (1 & t && (e = n(e)), 8 & t) return e;
        if (4 & t && "object" == typeof e && e && e.__esModule) return e;
        var r = Object.create(null);
        if (n.r(r), Object.defineProperty(r, "default", {
            enumerable: !0,
            value: e
        }), 2 & t && "string" != typeof e) for (var o in e) n.d(r, o, function (t) {
            return e[t]
        }.bind(null, o));
        return r
    }, n.n = function (e) {
        var t = e && e.__esModule ? function () {
            return e.default
        } : function () {
            return e
        };
        return n.d(t, "a", t), t
    }, n.o = function (e, t) {
        return Object.prototype.hasOwnProperty.call(e, t)
    }, n.p = "", n(n.s = 0)
}([function (e, t, n) {
    var r, o, i, u = n(1), a = n(2), c = n(3), s = u.api, l = u.bridge, d = [], f = [], p = /^http(?:s?)/;

    function E(e) {
        var t, n;
        for (t = 0, n = f.length; t < n && !1 !== e(f[t]); t++) ;
    }

    function v(e) {
        return e.contentWindow ? e.contentWindow : e.contentDocument && "parentWindow" in e.contentDocument ? e.contentDocument.parentWindow : null
    }

    function _(e) {
        var t, n = [];
        for (t in e) e.hasOwnProperty(t) && n.push(e[t]);
        return n
    }

    function S(e, t, n) {
        n.callbacks[e] = n.callbacks[e] || [], n.callbacks[e].push(t)
    }

    function h(e, t) {
        var n = !0;
        return t.callbacks[e] = [], E((function (t) {
            if ((t.callbacks[e] || []).length) return n = !1, !1
        })), n
    }

    function y(e, t, n) {
        var r, o, i = v(n);
        if (!i.postMessage) return !1;
        r = n.getAttribute("src").split("?")[0], o = JSON.stringify({
            method: e,
            value: t
        }), "//" === r.substr(0, 2) && (r = window.location.protocol + r), r = r.replace(/http:\/\/(w|wt).soundcloud.com/, "https://$1.soundcloud.com"), i.postMessage(o, r)
    }

    function b(e) {
        var t;
        return E((function (n) {
            if (n.instance === e) return t = n, !1
        })), t
    }

    function g(e) {
        var t;
        return E((function (n) {
            if (v(n.element) === e) return t = n, !1
        })), t
    }

    function m(e, t) {
        return function (n) {
            var r, o = !!((r = n) && r.constructor && r.call && r.apply), i = b(this), u = !o && t ? n : null,
                a = o && !t ? n : null;
            return a && S(e, a, i), y(e, u, i.element), this
        }
    }

    function R(e, t, n) {
        var r, o, i;
        for (r = 0, o = t.length; r < o; r++) e[i = t[r]] = m(i, n)
    }

    function O(e, t, n) {
        return e + "?url=" + t + "&" + function (e) {
            var t, n, r = [];
            for (t in e) e.hasOwnProperty(t) && (n = e[t], r.push(t + "=" + ("start_track" === t ? parseInt(n, 10) : n ? "true" : "false")));
            return r.join("&")
        }(n)
    }

    function w(e, t, n) {
        var r, o, i = e.callbacks[t] || [];
        for (r = 0, o = i.length; r < o; r++) i[r].apply(e.instance, n);
        (function (e) {
            var t, n = !1;
            for (t in a) if (a.hasOwnProperty(t) && a[t] === e) {
                n = !0;
                break
            }
            return n
        }(t) || t === s.READY) && (e.callbacks[t] = [])
    }

    function A(e) {
        var t, n, r, o, i;
        try {
            n = JSON.parse(e.data)
        } catch (e) {
            return !1
        }
        return t = g(e.source), r = n.method, o = n.value, (!t || P(e.origin) === P(t.domain)) && (t ? (r === s.READY && (t.isReady = !0, w(t, "__LATE_BINDING__"), h("__LATE_BINDING__", t)), r !== s.PLAY || t.playEventFired || (t.playEventFired = !0), r !== s.PLAY_PROGRESS || t.playEventFired || (t.playEventFired = !0, w(t, s.PLAY, [o])), i = [], void 0 !== o && i.push(o), void w(t, r, i)) : (r === s.READY && d.push(e.source), !1))
    }

    function P(e) {
        return e.replace(p, "")
    }

    window.addEventListener ? window.addEventListener("message", A, !1) : window.attachEvent("onmessage", A), e.exports = i = function (e, t, n) {
        var i;
        if (("" === (i = e) || i && i.charCodeAt && i.substr) && (e = document.getElementById(e)), !function (e) {
            return !(!e || 1 !== e.nodeType || "IFRAME" !== e.nodeName.toUpperCase())
        }(e)) throw new Error("SC.Widget function should be given either iframe element or a string specifying id attribute of iframe element.");
        t && (n = n || {}, e.src = O("https://wt.soundcloud.test:9200/", t, n));
        var u, a, c = g(v(e));
        return c && c.instance ? c.instance : (u = d.indexOf(v(e)) > -1, a = new r(e), f.push(new o(a, e, u)), a)
    }, i.Events = s, window.SC = window.SC || {}, window.SC.Widget = i, o = function (e, t, n) {
        this.instance = e, this.element = t, this.domain = function (e) {
            var t, n, r, o = "";
            "//" === e.substr(0, 2) && (e = window.location.protocol + e);
            for (r = e.split("/"), t = 0, n = r.length; t < n && t < 3; t++) o += r[t], t < 2 && (o += "/");
            return o
        }(t.getAttribute("src")), this.isReady = !!n, this.callbacks = {}
    }, (r = function () {
    }).prototype = {
        constructor: r, load: function (e, t) {
            if (e) {
                t = t || {};
                var n = this, r = b(this), o = r.element, i = o.src, u = i.substr(0, i.indexOf("?"));
                r.isReady = !1, r.playEventFired = !1, o.onload = function () {
                    n.bind(s.READY, (function () {
                        var e, n = r.callbacks;
                        for (e in n) n.hasOwnProperty(e) && e !== s.READY && y(l.ADD_LISTENER, e, r.element);
                        t.callback && t.callback()
                    }))
                }, o.src = O(u, e, t)
            }
        }, bind: function (e, t) {
            var n = this, r = b(this);
            return r && r.element && (e === s.READY && r.isReady ? setTimeout(t, 1) : r.isReady ? (S(e, t, r), y(l.ADD_LISTENER, e, r.element)) : S("__LATE_BINDING__", (function () {
                n.bind(e, t)
            }), r)), this
        }, unbind: function (e) {
            var t, n = b(this);
            n && n.element && (t = h(e, n), e !== s.READY && t && y(l.REMOVE_LISTENER, e, n.element))
        }
    }, R(r.prototype, _(a)), R(r.prototype, _(c), !0)
}, function (e, t) {
    t.api = {
        LOAD_PROGRESS: "loadProgress",
        PLAY_PROGRESS: "playProgress",
        PLAY: "play",
        PAUSE: "pause",
        FINISH: "finish",
        SEEK: "seek",
        READY: "ready",
        OPEN_SHARE_PANEL: "sharePanelOpened",
        CLICK_DOWNLOAD: "downloadClicked",
        CLICK_BUY: "buyClicked",
        ERROR: "error"
    }, t.bridge = {REMOVE_LISTENER: "removeEventListener", ADD_LISTENER: "addEventListener"}
}, function (e, t) {
    e.exports = {
        GET_VOLUME: "getVolume",
        GET_DURATION: "getDuration",
        GET_POSITION: "getPosition",
        GET_SOUNDS: "getSounds",
        GET_CURRENT_SOUND: "getCurrentSound",
        GET_CURRENT_SOUND_INDEX: "getCurrentSoundIndex",
        IS_PAUSED: "isPaused"
    }
}, function (e, t) {
    e.exports = {
        PLAY: "play",
        PAUSE: "pause",
        TOGGLE: "toggle",
        SEEK_TO: "seekTo",
        SET_VOLUME: "setVolume",
        NEXT: "next",
        PREV: "prev",
        SKIP: "skip"
    }
}]);
