(function(global){
  const DB_NAME = 'auroraGalacticaReplayDb';
  const DB_VERSION = 1;
  const STORE_NAME = 'replays';
  const MAX_REPLAYS = 5;

  function supported(){
    return typeof indexedDB !== 'undefined';
  }

  function openDb(){
    return new Promise((resolve, reject) => {
      if(!supported()){
        reject(new Error('IndexedDB unavailable'));
        return;
      }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if(!db.objectStoreNames.contains(STORE_NAME)){
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error('Could not open replay database'));
    });
  }

  function transactionDone(tx){
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error('Replay database transaction failed'));
      tx.onabort = () => reject(tx.error || new Error('Replay database transaction aborted'));
    });
  }

  async function getAllRecords(){
    const db = await openDb();
    try{
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const records = await new Promise((resolve, reject) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error || new Error('Could not load replays'));
      });
      await transactionDone(tx);
      return records.sort((a,b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    } finally {
      db.close();
    }
  }

  async function pruneExcess(limit=MAX_REPLAYS){
    const records = await getAllRecords();
    const doomed = records.slice(limit);
    if(!doomed.length) return;
    const db = await openDb();
    try{
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      for(const record of doomed){
        store.delete(record.id);
      }
      await transactionDone(tx);
    } finally {
      db.close();
    }
  }

  async function saveReplay(record){
    if(!record?.id || !record?.blob) throw new Error('Replay record needs id and blob');
    const db = await openDb();
    try{
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(record);
      await transactionDone(tx);
    } finally {
      db.close();
    }
    await pruneExcess();
    return record.id;
  }

  async function listReplays(limit=MAX_REPLAYS){
    const records = await getAllRecords();
    return records.slice(0, limit).map(record => ({
      id: record.id,
      createdAt: record.createdAt,
      duration: record.duration || 0,
      score: record.score || 0,
      stage: record.stage || 0,
      challenge: !!record.challenge,
      build: record.build || '',
      stats: record.stats || { shots: 0, hits: 0 },
      source: record.source || 'local',
      pilotUserId: record.pilotUserId || '',
      pilotEmail: record.pilotEmail || '',
      pilotInitials: record.pilotInitials || ''
    }));
  }

  async function loadReplay(id){
    const db = await openDb();
    try{
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const record = await new Promise((resolve, reject) => {
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error || new Error('Could not load replay'));
      });
      await transactionDone(tx);
      return record;
    } finally {
      db.close();
    }
  }

  async function deleteReplay(id){
    const db = await openDb();
    try{
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(id);
      await transactionDone(tx);
    } finally {
      db.close();
    }
  }

  global.AuroraReplayStore = {
    supported,
    saveReplay,
    listReplays,
    loadReplay,
    deleteReplay,
    MAX_REPLAYS
  };
})(window);
