// ປ່ຽນເລກເວີຊັນ (v1 -> v2) ທຸກຄັ້ງທີ່ແກ້ໄຂໄຟລ໌ ເພື່ອໃຫ້ມືຖືອັບເດດ
const V = 'money-v1';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  // ໜ້າຫຼັກ: ລອງເອົາຈາກເນັດກ່ອນ (ໄດ້ເວີຊັນໃໝ່), ຖ້າອອບໄລນ໌ໃຊ້ທີ່ເກັບໄວ້
  if (r.mode === 'navigate') {
    e.respondWith(
      fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put('./index.html', cp)); return res; })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }
  // ໄຟລ໌ອື່ນ ແລະ ຟອນຕ໌: ໃຊ້ທີ່ເກັບໄວ້ກ່ອນ ແລ້ວອັບເດດຢູ່ພື້ນຫຼັງ
  if (u.origin === location.origin || u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com') {
    e.respondWith(
      caches.match(r).then(hit => {
        const net = fetch(r).then(res => {
          if (res.ok || res.type === 'opaque') { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); }
          return res;
        }).catch(() => hit);
        return hit || net;
      })
    );
  }
});
