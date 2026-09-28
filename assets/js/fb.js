/* ==========================================================================
   matildefacetdds.com — Firebase bridge (ES module)
   Loads the Firebase v10 modular SDK from the official CDN, initialises the
   app and exposes a small promise-based API on window.FB so the rest of the
   site (classic scripts) can use it without a build step.

   If the config is still the placeholder, the site stays fully functional in
   DEMO MODE: reads fall back to content.js and writes are not persisted.
   ========================================================================== */

const SDK = "https://www.gstatic.com/firebasejs/10.12.5";

const FB = {
  enabled: false,
  ready: false,
  error: null,
  app: null,
  db: null,
  auth: null,
  storage: null,
  doc: null, setDoc: null, getDoc: null,
  collection: null, addDoc: null, getDocs: null, updateDoc: null, deleteDoc: null,
  query: null, orderBy: null, limit: null, where: null, serverTimestamp: null, onSnapshot: null,
  signInWithEmailAndPassword: null, signOut: null, onAuthStateChanged: null,
  ref: null, uploadBytes: null, getDownloadURL: null, deleteObject: null,

  /* ---- Site content ---- */
  async getSiteConfig() {
    if (!this.enabled) return null;
    const snap = await this.getDoc(this.doc(this.db, "site", "config"));
    return snap.exists() ? snap.data() : null;
  },
  async saveSiteConfig(data) {
    if (!this.enabled) throw new Error("Firebase is not configured.");
    await this.setDoc(this.doc(this.db, "site", "config"), data, { merge: true });
    return true;
  },

  /* ---- Generic collection helpers ---- */
  async add(collectionName, data) {
    if (!this.enabled) throw new Error("Firebase is not configured.");
    return this.addDoc(this.collection(this.db, collectionName), {
      ...data,
      createdAt: this.serverTimestamp()
    });
  },
  async list(collectionName, orderField = "createdAt", dir = "desc", max = 500) {
    if (!this.enabled) throw new Error("Firebase is not configured.");
    const q = this.query(
      this.collection(this.db, collectionName),
      this.orderBy(orderField, dir),
      this.limit(max)
    );
    const snap = await this.getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  async update(collectionName, id, data) {
    if (!this.enabled) throw new Error("Firebase is not configured.");
    await this.updateDoc(this.doc(this.db, collectionName, id), data);
    return true;
  },
  async remove(collectionName, id) {
    if (!this.enabled) throw new Error("Firebase is not configured.");
    await this.deleteDoc(this.doc(this.db, collectionName, id));
    return true;
  },

  /* ---- Auth ---- */
  async login(email, password) {
    if (!this.enabled) throw new Error("Firebase is not configured.");
    return this.signInWithEmailAndPassword(this.auth, email, password);
  },
  async logout() {
    if (!this.enabled) return;
    return this.signOut(this.auth);
  },
  onAuth(cb) {
    if (!this.enabled) { cb(null); return () => {}; }
    return this.onAuthStateChanged(this.auth, cb);
  },

  /* ---- Storage ---- */
  async uploadImage(file, folder = "site") {
    if (!this.enabled) throw new Error("Firebase is not configured.");
    const path = `${folder}/${Date.now()}-${file.name.replace(/[^\w.\-]+/g, "_")}`;
    const r = this.ref(this.storage, path);
    await this.uploadBytes(r, file);
    return await this.getDownloadURL(r);
  }
};

window.FB = FB;

(async function boot() {
  const cfg = window.FIREBASE_CONFIG || {};
  const isPlaceholder =
    !cfg.apiKey || String(cfg.apiKey).indexOf("PASTE") === 0 || String(cfg.apiKey).indexOf("PASTE_") > -1 ||
    String(cfg.projectId || "").indexOf("PASTE") > -1;

  if (isPlaceholder) {
    FB.enabled = false;
    FB.ready = true;
    console.info("[matildefacetdds.com] Firebase not configured — running in DEMO MODE.");
    dispatchReady();
    return;
  }

  try {
    const [{ initializeApp },
           fs, authMod, storageMod] = await Promise.all([
      import(`${SDK}/firebase-app.js`),
      import(`${SDK}/firebase-firestore.js`),
      import(`${SDK}/firebase-auth.js`),
      import(`${SDK}/firebase-storage.js`)
    ]);

    FB.app = initializeApp(cfg);
    FB.db = fs.getFirestore(FB.app);
    FB.auth = authMod.getAuth(FB.app);
    FB.storage = storageMod.getStorage(FB.app);

    FB.doc = fs.doc; FB.setDoc = fs.setDoc; FB.getDoc = fs.getDoc;
    FB.collection = fs.collection; FB.addDoc = fs.addDoc; FB.getDocs = fs.getDocs;
    FB.updateDoc = fs.updateDoc; FB.deleteDoc = fs.deleteDoc;
    FB.query = fs.query; FB.orderBy = fs.orderBy; FB.limit = fs.limit;
    FB.where = fs.where; FB.serverTimestamp = fs.serverTimestamp; FB.onSnapshot = fs.onSnapshot;

    FB.signInWithEmailAndPassword = authMod.signInWithEmailAndPassword;
    FB.signOut = authMod.signOut;
    FB.onAuthStateChanged = authMod.onAuthStateChanged;

    FB.ref = storageMod.ref; FB.uploadBytes = storageMod.uploadBytes;
    FB.getDownloadURL = storageMod.getDownloadURL; FB.deleteObject = storageMod.deleteObject;

    FB.enabled = true;
    FB.ready = true;
    console.info("[matildefacetdds.com] Firebase connected →", cfg.projectId);
  } catch (err) {
    FB.enabled = false;
    FB.ready = true;
    FB.error = err;
    console.error("[matildefacetdds.com] Firebase failed to initialise:", err);
  }
  dispatchReady();
})();

function dispatchReady() {
  document.dispatchEvent(new CustomEvent("fb-ready", { detail: { enabled: FB.enabled } }));
}
