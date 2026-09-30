/*
 * GitHub-backed homeschool record sync.
 *
 * Student work is stored as exact, Rory-prefixed localStorage strings inside one
 * versioned JSON file. Reads are public. Writes require a fine-grained GitHub
 * token supplied by a parent. A parent may remember that token on a trusted
 * family workstation; it is never included in student snapshots, the IndexedDB
 * work mirror, the GitHub record, or an exported record.
 */
(() => {
  'use strict';

  const portal = window.PORTAL;
  if (!portal?.student || !portal?.recordKey) return;

  const student = portal.student;
  const studentSlug = student.toLowerCase();
  const studentPrefix = studentSlug;
  const config = Object.freeze({
    owner: 'muireadpabalis',
    repository: 'Homeschool-Records-2026-2027',
    branch: 'main',
    path: 'records/rory/latest.json',
    autosaveDelayMs: 30000
  });
  const apiUrl = `https://api.github.com/repos/${config.owner}/${config.repository}/contents/${config.path}`;
  const historyUrl = `https://github.com/${config.owner}/${config.repository}/commits/${config.branch}/${config.path}`;
  const tokenKey = 'homeschoolGithubWriteTokenSessionV1';
  const rememberedTokenKey = 'homeschoolGithubWriteTokenTrustedDeviceV1';
  const credentialSignalKey = 'homeschoolGithubCredentialSignalV1';
  const metaKey = `homeschoolGithubSyncMetaV1:${studentSlug}`;
  const revokeTokenUrl = 'https://github.com/settings/personal-access-tokens';
  const recoveryDatabaseName = 'homeschoolCloudRecovery2026V1';
  const recoveryStoreName = 'snapshots';
  const liveSite = location.hostname.toLowerCase() === `${config.owner.toLowerCase()}.github.io`;
  const active = liveSite || window.__HOMESCHOOL_GITHUB_SYNC_TEST__ === true;
  const nativeSetItem = Storage.prototype.setItem;
  const nativeRemoveItem = Storage.prototype.removeItem;
  const nativeClear = Storage.prototype.clear;
  const initialValues = captureValues();

  const sessionTokenAtStart = readSessionToken();
  const rememberedTokenAtStart = readRememberedToken();
  let token = sessionTokenAtStart || rememberedTokenAtStart;
  let tokenRemembered = Boolean(token && rememberedTokenAtStart && token === rememberedTokenAtStart);
  let credentialEpoch = 0;
  let credentialAbortController = new AbortController();
  let bootstrapping = true;
  let applyingRemote = false;
  let safeToWrite = false;
  let remote = {exists:false, sha:null, bundle:null};
  let dirty = false;
  let autosaveTimer = null;
  let saveInFlight = null;
  let lastSaveStartedAt = 0;
  let state = {
    phase: active ? 'checking' : 'preview',
    message: active ? 'Checking GitHub for Rory’s latest saved work…' : 'GitHub save starts on the published site. This preview keeps the device copy.',
    connected: Boolean(token),
    conflict: false,
    dirty: false,
    lastSavedAt: null,
    remoteSha: null,
    error: null
  };

  function isOwnKey(key) {
    if (typeof key !== 'string') return false;
    const normalized = key.toLowerCase();
    if (!normalized.startsWith(studentPrefix)) return false;
    // Parent gate credentials and runtime bookkeeping are not student work.
    // Keep parent-review evidence (for example, roryScienceParent2026), but
    // never publish a passphrase verifier or a future sync/session/config key.
    return !normalized.includes('parentaccess')
      && !normalized.includes('githubsync')
      && !normalized.includes('syncstatus')
      && !normalized.includes('sessiontoken')
      && !normalized.includes('portalconfig')
      && !normalized.includes('storagerecoverednotice')
      && !normalized.includes('recoverednotice');
  }

  function captureValues() {
    const entries = [];
    try {
      for (let index = 0; index < localStorage.length; index++) {
        const key = localStorage.key(index);
        if (isOwnKey(key)) entries.push([key, localStorage.getItem(key)]);
      }
    } catch (error) {
      return {};
    }
    entries.sort(([left], [right]) => left.localeCompare(right));
    return Object.fromEntries(entries.filter(([, raw]) => typeof raw === 'string'));
  }

  function valuesEqual(left, right) {
    const leftKeys = Object.keys(left || {}).sort();
    const rightKeys = Object.keys(right || {}).sort();
    return leftKeys.length === rightKeys.length && leftKeys.every((key, index) => key === rightKeys[index] && left[key] === right[key]);
  }

  function hasValues(values) {
    return Object.keys(values || {}).length > 0;
  }

  function readSessionToken() {
    try { return sessionStorage.getItem(tokenKey) || ''; }
    catch (error) { return ''; }
  }

  function readRememberedToken() {
    try { return localStorage.getItem(rememberedTokenKey) || ''; }
    catch (error) { return ''; }
  }

  function cancelCredentialActivity() {
    credentialEpoch += 1;
    credentialAbortController.abort();
    credentialAbortController = new AbortController();
    if (autosaveTimer !== null) clearTimeout(autosaveTimer);
    autosaveTimer = null;
  }

  function useSessionToken(value) {
    cancelCredentialActivity();
    token = value;
    tokenRemembered = Boolean(value && readRememberedToken() === value);
    safeToWrite = false;
    try {
      if (value) sessionStorage.setItem(tokenKey, value);
      else sessionStorage.removeItem(tokenKey);
    } catch (error) {}
  }

  function rememberCurrentToken(value) {
    if (!value || token !== value) return false;
    try {
      nativeSetItem.call(localStorage, rememberedTokenKey, value);
      tokenRemembered = readRememberedToken() === value;
    } catch (error) {
      tokenRemembered = false;
    }
    return tokenRemembered;
  }

  function forgetRememberedToken() {
    try { nativeRemoveItem.call(localStorage, rememberedTokenKey); } catch (error) {}
    tokenRemembered = false;
  }

  function broadcastCredentialDisconnect(reason) {
    try {
      nativeSetItem.call(localStorage, credentialSignalKey, JSON.stringify({
        action: 'disconnect',
        reason: reason || 'parent',
        sentAt: new Date().toISOString(),
        id: crypto.randomUUID()
      }));
    } catch (error) {}
  }

  function clearCredential(options = {}) {
    cancelCredentialActivity();
    token = '';
    tokenRemembered = false;
    safeToWrite = false;
    try { sessionStorage.removeItem(tokenKey); } catch (error) {}
    try { nativeRemoveItem.call(localStorage, rememberedTokenKey); } catch (error) {}
    if (options.broadcast) broadcastCredentialDisconnect(options.reason);
  }

  function isCredentialCancellation(error) {
    return error?.name === 'AbortError' || error?.code === 'credential-cancelled';
  }

  async function githubFetch(url, options) {
    const requestEpoch = credentialEpoch;
    const requestToken = token;
    const controller = credentialAbortController;
    try {
      const response = await fetch(url, {
        ...options,
        ...(requestToken ? {signal:controller.signal} : {})
      });
      if (requestToken && (requestEpoch !== credentialEpoch || requestToken !== token || controller.signal.aborted)) {
        throw Object.assign(Error('The GitHub credential changed while the request was running.'), {code:'credential-cancelled'});
      }
      return response;
    } catch (error) {
      if (requestToken && (requestEpoch !== credentialEpoch || controller.signal.aborted)) {
        throw Object.assign(Error('The GitHub credential request was cancelled.'), {code:'credential-cancelled'});
      }
      throw error;
    }
  }

  function readMeta() {
    try {
      const value = JSON.parse(localStorage.getItem(metaKey) || 'null');
      return value && value.studentSlug === studentSlug && typeof value.remoteSha === 'string' ? value : null;
    } catch (error) {
      return null;
    }
  }

  function writeMeta(sha, savedAt) {
    try {
      nativeSetItem.call(localStorage, metaKey, JSON.stringify({schemaVersion:1, studentSlug, remoteSha:sha, savedAt:savedAt || null}));
    } catch (error) {}
  }

  function clearMeta() {
    try { nativeRemoveItem.call(localStorage, metaKey); } catch (error) {}
  }

  function setState(patch) {
    state = {...state, ...patch};
    state.connected = Boolean(token);
    state.remembered = tokenRemembered;
    state.credentialSource = tokenRemembered ? 'remembered' : (token ? 'session' : 'none');
    state.dirty = dirty;
    renderState();
  }

  function markDirty() {
    if (applyingRemote) return;
    dirty = true;
    setState({
      phase: state.conflict ? 'conflict' : (token ? 'pending' : 'device'),
      message: state.conflict
        ? state.message
        : token
          ? 'Saved on this device. GitHub save is waiting…'
          : 'Saved on this device. A parent must connect GitHub to add it to the shared history.'
    });
    if (!bootstrapping && safeToWrite && token && !state.conflict) scheduleAutosave();
  }

  Storage.prototype.setItem = function(key, value) {
    const result = nativeSetItem.call(this, key, value);
    if (this === localStorage && isOwnKey(String(key))) markDirty();
    return result;
  };
  Storage.prototype.removeItem = function(key) {
    const owned = this === localStorage && isOwnKey(String(key));
    const result = nativeRemoveItem.call(this, key);
    if (owned) markDirty();
    return result;
  };
  Storage.prototype.clear = function() {
    const owned = this === localStorage && hasValues(captureValues());
    const result = nativeClear.call(this);
    if (owned) markDirty();
    return result;
  };

  function authHeaders(write = false) {
    const headers = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    if (write) headers['Content-Type'] = 'application/json';
    return headers;
  }

  function decodeBase64Utf8(value) {
    const binary = atob(String(value || '').replace(/\s/g, ''));
    const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  function encodeBase64Utf8(value) {
    const bytes = new TextEncoder().encode(value);
    let binary = '';
    const step = 0x8000;
    for (let index = 0; index < bytes.length; index += step) {
      binary += String.fromCharCode(...bytes.subarray(index, index + step));
    }
    return btoa(binary);
  }

  function validateBundle(candidate) {
    if (!candidate || candidate.schemaVersion !== 1 || candidate.student !== student || candidate.studentSlug !== studentSlug) {
      throw Error(`GitHub returned a record that does not belong to ${student}.`);
    }
    if (!candidate.values || typeof candidate.values !== 'object' || Array.isArray(candidate.values)) {
      throw Error('GitHub returned an invalid homeschool record.');
    }
    for (const [key, raw] of Object.entries(candidate.values)) {
      if (!isOwnKey(key) || typeof raw !== 'string') throw Error('GitHub returned an invalid or mixed-student record.');
    }
    return candidate;
  }

  async function readRemote() {
    const response = await githubFetch(`${apiUrl}?ref=${encodeURIComponent(config.branch)}&t=${Date.now()}`, {
      method: 'GET',
      headers: authHeaders(),
      cache: 'no-store'
    });
    if (response.status === 404) return {exists:false, sha:null, bundle:null};
    if (response.status === 401) throw Object.assign(Error('The GitHub token was not accepted. Disconnect it and enter a current token.'), {code:'auth'});
    if (response.status === 403) throw Object.assign(Error('GitHub did not allow this request. Check the token’s repository and Contents permission, or try again after the rate limit resets.'), {code:'permission'});
    if (!response.ok) throw Error(`GitHub could not be checked (${response.status}). Rory’s device copy is still saved.`);
    const payload = await response.json();
    if (payload.type !== 'file' || typeof payload.content !== 'string' || typeof payload.sha !== 'string') throw Error('GitHub returned an unexpected record response.');
    const bundle = validateBundle(JSON.parse(decodeBase64Utf8(payload.content)));
    return {exists:true, sha:payload.sha, bundle};
  }

  function createBundle(values) {
    const savedAt = new Date().toISOString();
    return {
      schemaVersion: 1,
      student,
      studentSlug,
      schoolYear: '2026–2027',
      savedAt,
      revisionId: crypto.randomUUID(),
      source: 'homeschool-portal',
      values
    };
  }

  async function openRecoveryDatabase() {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) return reject(Error('IndexedDB is unavailable.'));
      const request = indexedDB.open(recoveryDatabaseName, 1);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(recoveryStoreName)) database.createObjectStore(recoveryStoreName, {keyPath:'id'});
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || Error('The recovery archive could not open.'));
    });
  }

  async function archiveDeviceCopy(reason) {
    const values = captureValues();
    if (!hasValues(values)) return null;
    try {
      const database = await openRecoveryDatabase();
      const id = `${studentSlug}:${new Date().toISOString()}:${crypto.randomUUID()}`;
      await new Promise((resolve, reject) => {
        const transaction = database.transaction(recoveryStoreName, 'readwrite');
        transaction.objectStore(recoveryStoreName).put({id, student, studentSlug, archivedAt:new Date().toISOString(), reason, remoteSha:remote.sha, values});
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error || Error('The recovery archive could not be written.'));
        transaction.onabort = () => reject(transaction.error || Error('The recovery archive was cancelled.'));
      });
      database.close();
      return id;
    } catch (error) {
      return null;
    }
  }

  function replaceLocalValues(values) {
    applyingRemote = true;
    try {
      for (const key of Object.keys(captureValues())) nativeRemoveItem.call(localStorage, key);
      for (const [key, raw] of Object.entries(values)) nativeSetItem.call(localStorage, key, raw);
    } finally {
      applyingRemote = false;
    }
  }

  async function loadRemoteCopy(options = {}) {
    if (!active) return false;
    setState({phase:'checking', message:'Loading Rory’s latest GitHub record…', error:null});
    try {
      const latest = await readRemote();
      if (!latest.exists || !hasValues(latest.bundle.values)) {
        setState({phase:'device', message:'GitHub does not have saved Rory work yet. This device copy was left unchanged.'});
        return false;
      }
      const local = captureValues();
      if (hasValues(local) && !valuesEqual(local, latest.bundle.values) && !options.confirmed) {
        setConflict('This device and GitHub contain different work. Choose which copy should become current.');
        return false;
      }
      if (hasValues(local) && !valuesEqual(local, latest.bundle.values)) await archiveDeviceCopy('Before loading the GitHub copy');
      remote = latest;
      replaceLocalValues(latest.bundle.values);
      writeMeta(latest.sha, latest.bundle.savedAt);
      dirty = false;
      safeToWrite = true;
      setState({phase:'loading', conflict:false, remoteSha:latest.sha, lastSavedAt:latest.bundle.savedAt, message:'GitHub work loaded. Reopening Rory’s page…'});
      location.reload();
      return true;
    } catch (error) {
      handleError(error, 'GitHub could not be loaded. Rory’s device copy is still here.');
      return false;
    }
  }

  function setConflict(message) {
    safeToWrite = false;
    if (autosaveTimer !== null) clearTimeout(autosaveTimer);
    autosaveTimer = null;
    setState({phase:'conflict', conflict:true, message, error:null});
  }

  function handleError(error, fallback) {
    if (isCredentialCancellation(error)) return;
    if (error?.code === 'auth') {
      clearCredential({broadcast:true, reason:'rejected'});
      setState({phase:'auth-error', message:error.message, error:error.message});
      return;
    }
    const message = error?.message || fallback;
    setState({phase:'offline', message:`${message} Work remains saved on this device and will not replace GitHub until the connection is checked.`, error:message});
  }

  async function performSave(options = {}) {
    if (!active) {
      setState({phase:'preview', message:'GitHub save starts on the published site. This preview keeps the device copy.'});
      return false;
    }
    if (!token) {
      setState({phase:'needs-token', message:'Saved on this device. A parent must connect GitHub before this work can be added to the shared history.'});
      return false;
    }
    if (bootstrapping) await ready;
    const values = captureValues();
    if (!hasValues(values)) {
      if (remote.exists && hasValues(remote.bundle?.values)) setConflict('A blank device copy cannot replace Rory’s saved GitHub record. Load the GitHub copy.');
      else setState({phase:'device', message:'There is no Rory work to save yet.'});
      return false;
    }

    const saveToken = token;
    const saveCredentialEpoch = credentialEpoch;
    setState({phase:'saving', message:'Saving Rory’s work to GitHub…', error:null});
    try {
      const latest = await readRemote();
      if (!token || token !== saveToken || credentialEpoch !== saveCredentialEpoch) return false;
      if (latest.exists && valuesEqual(values, latest.bundle.values)) {
        remote = latest;
        safeToWrite = true;
        dirty = false;
        writeMeta(latest.sha, latest.bundle.savedAt);
        setState({phase:'saved', conflict:false, remoteSha:latest.sha, lastSavedAt:latest.bundle.savedAt, message:`GitHub already has this work${formatSavedTime(latest.bundle.savedAt)}.`});
        return true;
      }
      if (latest.exists && hasValues(latest.bundle.values) && !hasValues(values)) {
        setConflict('A blank device copy cannot replace Rory’s saved GitHub record. Load the GitHub copy.');
        return false;
      }
      const remoteChanged = latest.exists && remote.exists && latest.sha !== remote.sha;
      const appearedAfterCheck = latest.exists && !remote.exists && hasValues(latest.bundle.values);
      if (!options.force && (!safeToWrite || remoteChanged || appearedAfterCheck)) {
        remote = latest;
        setConflict('GitHub has a different version of Rory’s work. Nothing was overwritten. Choose the GitHub copy or ask a parent to keep this device copy as the newest version.');
        return false;
      }
      if (options.force) await archiveDeviceCopy('Before making this device copy the latest GitHub version');

      const bundle = createBundle(values);
      const body = {
        message: `Rory homeschool work · ${bundle.savedAt}`,
        content: encodeBase64Utf8(`${JSON.stringify(bundle, null, 2)}\n`),
        branch: config.branch
      };
      if (latest.exists) body.sha = latest.sha;
      lastSaveStartedAt = Date.now();
      const response = await githubFetch(apiUrl, {
        method: 'PUT',
        headers: authHeaders(true),
        body: JSON.stringify(body)
      });
      if (response.status === 409 || response.status === 422) {
        setConflict('GitHub changed while this page was saving. Nothing was overwritten. Load the GitHub copy or review both versions before trying again.');
        return false;
      }
      if (response.status === 401) throw Object.assign(Error('The GitHub token was not accepted. Disconnect it and enter a current token.'), {code:'auth'});
      if (response.status === 403) throw Object.assign(Error('GitHub did not allow the save. The token must be limited to the records repository with Contents read and write access.'), {code:'permission'});
      if (!response.ok) throw Error(`GitHub could not save the record (${response.status}).`);
      const payload = await response.json();
      const sha = payload?.content?.sha;
      if (typeof sha !== 'string') throw Error('GitHub saved the commit but did not return the new file version. Check the history before saving again.');
      remote = {exists:true, sha, bundle};
      safeToWrite = true;
      dirty = false;
      writeMeta(sha, bundle.savedAt);
      setState({phase:'saved', conflict:false, remoteSha:sha, lastSavedAt:bundle.savedAt, message:`Saved to GitHub${formatSavedTime(bundle.savedAt)}. The commit history keeps earlier versions.`});
      return true;
    } catch (error) {
      if (isCredentialCancellation(error)) return false;
      handleError(error, 'GitHub could not save this record.');
      return false;
    }
  }

  function saveNow(options = {}) {
    if (saveInFlight) return saveInFlight;
    if (autosaveTimer !== null) clearTimeout(autosaveTimer);
    autosaveTimer = null;
    saveInFlight = performSave(options).finally(() => { saveInFlight = null; });
    return saveInFlight;
  }

  function scheduleAutosave() {
    if (autosaveTimer !== null || !dirty || !token || !safeToWrite || state.conflict) return;
    const earliest = Math.max(Date.now() + config.autosaveDelayMs, lastSaveStartedAt + config.autosaveDelayMs);
    autosaveTimer = setTimeout(() => {
      autosaveTimer = null;
      saveNow({reason:'autosave'});
    }, Math.max(0, earliest - Date.now()));
  }

  function formatSavedTime(value) {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : ` at ${date.toLocaleString()}`;
  }

  async function connect(writeToken, options = {}) {
    const value = String(writeToken || '').trim();
    if (value.length < 20) {
      setState({phase:'auth-error', message:'Enter the fine-grained GitHub token created for the homeschool records repository.'});
      return false;
    }
    const shouldRemember = options.remember === true;
    useSessionToken(value);
    setState({connected:true, phase:'checking', message:'Checking the GitHub connection…', error:null});
    const connected = await refreshConnection();
    if (!connected || token !== value) return false;

    if (shouldRemember) {
      if (rememberCurrentToken(value)) {
        setState({message:`${state.message} Write access will remain connected in this browser profile after it closes.`});
      } else {
        setState({message:`${state.message} This browser could not remember write access, so it is connected for this session only.`});
      }
    } else {
      forgetRememberedToken();
      setState({});
    }
    return true;
  }

  function disconnect(options = {}) {
    clearCredential({broadcast:options.broadcast !== false, reason:options.reason || 'parent'});
    setState({connected:false, phase:dirty?'device':'read-only', message:dirty?'GitHub disconnected. New work is saved on this device only.':'GitHub write access disconnected. Public saved work can still load on a new computer.'});
  }

  async function refreshConnection() {
    try {
      const latest = await readRemote();
      const values = captureValues();
      remote = latest;
      if (latest.exists && valuesEqual(values, latest.bundle.values)) {
        safeToWrite = true;
        dirty = false;
        writeMeta(latest.sha, latest.bundle.savedAt);
        setState({phase:'saved', conflict:false, remoteSha:latest.sha, lastSavedAt:latest.bundle.savedAt, message:`GitHub connected. This work is current${formatSavedTime(latest.bundle.savedAt)}.`});
      } else if (!latest.exists || !hasValues(latest.bundle?.values)) {
        safeToWrite = true;
        dirty = hasValues(values);
        setState({phase:dirty?'pending':'connected', conflict:false, remoteSha:latest.sha, message:dirty?'GitHub connected. Choose Save now to create Rory’s shared record.':'GitHub connected. Rory’s shared record will be created after work is saved.'});
      } else {
        const meta = readMeta();
        if (meta?.remoteSha === latest.sha && hasValues(values)) {
          safeToWrite = true;
          dirty = true;
          setState({phase:'pending', conflict:false, remoteSha:latest.sha, message:'GitHub connected. This device has newer work waiting to save.'});
          scheduleAutosave();
        } else {
          setConflict('GitHub and this device contain different work. Nothing was overwritten. Choose which copy should become current.');
        }
      }
      return true;
    } catch (error) {
      safeToWrite = false;
      if (isCredentialCancellation(error)) return false;
      handleError(error, 'GitHub could not verify the connection.');
      return false;
    }
  }

  async function bootstrap() {
    renderSurfaces();
    if (!active) {
      bootstrapping = false;
      renderState();
      return state;
    }
    try {
      const deviceStatus = await Promise.resolve(window.StorageResilience?.ready);
      if (!hasValues(initialValues) && deviceStatus?.recovered?.length) return state;
      const latest = await readRemote();
      remote = latest;
      const local = captureValues();
      const initialWasBlank = !hasValues(initialValues);
      if (latest.exists && hasValues(latest.bundle.values) && initialWasBlank) {
        replaceLocalValues(latest.bundle.values);
        writeMeta(latest.sha, latest.bundle.savedAt);
        dirty = false;
        safeToWrite = true;
        setState({phase:'loading', conflict:false, remoteSha:latest.sha, lastSavedAt:latest.bundle.savedAt, message:'Rory’s latest GitHub work was found. Opening it now…'});
        location.reload();
        return state;
      }
      if (latest.exists && valuesEqual(local, latest.bundle.values)) {
        safeToWrite = true;
        dirty = false;
        writeMeta(latest.sha, latest.bundle.savedAt);
        setState({phase:'saved', conflict:false, remoteSha:latest.sha, lastSavedAt:latest.bundle.savedAt, message:`This device matches GitHub${formatSavedTime(latest.bundle.savedAt)}.`});
      } else if (!latest.exists || !hasValues(latest.bundle?.values)) {
        safeToWrite = true;
        dirty = hasValues(local);
        setState({phase:token && dirty?'pending':'device', conflict:false, remoteSha:latest.sha, message:latest.exists?'GitHub has an empty starter record. Rory’s device work is ready to save.':'No GitHub record exists yet. Rory’s work is safe on this device and ready for a parent to save.'});
      } else {
        const meta = readMeta();
        if (meta?.remoteSha === latest.sha && hasValues(local)) {
          safeToWrite = true;
          dirty = true;
          setState({phase:token?'pending':'device', conflict:false, remoteSha:latest.sha, message:token?'This device has newer work waiting to save to GitHub.':'This device has newer work. A parent must connect GitHub to add it to the shared history.'});
        } else {
          setConflict('GitHub and this device contain different Rory records. Nothing was overwritten. A parent must choose which copy becomes current.');
        }
      }
    } catch (error) {
      safeToWrite = false;
      handleError(error, 'GitHub could not be checked.');
    } finally {
      bootstrapping = false;
      if (token && dirty && safeToWrite && !state.conflict) scheduleAutosave();
      renderState();
    }
    return state;
  }

  function statusClass() {
    if (state.conflict || state.phase === 'auth-error') return 'needs-attention';
    if (state.phase === 'saved') return 'saved';
    if (['saving','checking','loading','pending'].includes(state.phase)) return 'working';
    return 'device';
  }

  function renderState() {
    for (const element of document.querySelectorAll('[data-github-sync-status]')) {
      element.textContent = state.message;
      element.dataset.state = statusClass();
    }
    for (const element of document.querySelectorAll('[data-github-sync-connected]')) {
      element.textContent = token ? (tokenRemembered ? 'Write access is remembered on this trusted workstation.' : 'Write access is connected for this browser session.') : 'Write access is not connected.';
    }
    for (const button of document.querySelectorAll('[data-github-sync-save]')) button.disabled = !token || state.phase === 'saving' || state.phase === 'checking';
    for (const button of document.querySelectorAll('[data-github-sync-disconnect]')) button.hidden = !token;
    for (const element of document.querySelectorAll('[data-github-sync-conflict-actions]')) element.hidden = !state.conflict;
  }

  function renderSurfaces() {
    const dashboard = document.getElementById('dashboard');
    if (dashboard && !document.getElementById('github-sync-dashboard')) {
      const strip = document.createElement('aside');
      strip.id = 'github-sync-dashboard';
      strip.className = 'github-sync-strip no-print';
      strip.innerHTML = '<span class="github-sync-dot" aria-hidden="true"></span><p><strong>Shared work history:</strong> <span data-github-sync-status aria-live="polite"></span></p><button type="button" class="link-button" data-github-sync-open>Parent setup</button>';
      const hero = dashboard.querySelector('.hero-card');
      hero?.insertAdjacentElement('afterend', strip);
      strip.querySelector('[data-github-sync-open]').addEventListener('click', () => {
        document.querySelectorAll('.view').forEach(view => view.classList.toggle('active', view.id === 'reports'));
        document.querySelectorAll('.tab').forEach(tab => tab.classList.toggle('active', tab.dataset.view === 'reports'));
        document.getElementById('github-sync-card')?.scrollIntoView({behavior:'smooth', block:'start'});
      });
      if (location.hash === '#reports') {
        document.querySelectorAll('.view').forEach(view => view.classList.toggle('active', view.id === 'reports'));
        document.querySelectorAll('.tab').forEach(tab => tab.classList.toggle('active', tab.dataset.view === 'reports'));
      }
    }

    const reports = document.querySelector('#reports .report-grid');
    if (reports && !document.getElementById('github-sync-card')) {
      const card = document.createElement('article');
      card.id = 'github-sync-card';
      card.className = 'panel github-sync-card no-print';
      card.innerHTML = `
        <h3>GitHub work history</h3>
        <p>Rory’s latest saved work can load on a new computer. Each successful save creates a GitHub commit, so earlier versions remain in the history.</p>
        <p class="github-sync-callout" data-github-sync-status role="status" aria-live="polite"></p>
        <p class="github-sync-connected" data-github-sync-connected></p>
        <div class="github-sync-token-row">
          <label>Parent write token
            <input type="password" data-github-sync-token autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="github_pat_…">
          </label>
          <button type="button" class="button" data-github-sync-connect>Connect GitHub</button>
        </div>
        <label class="github-sync-remember"><input type="checkbox" data-github-sync-remember> Remember on this trusted family workstation</label>
        <p class="privacy-note">Anyone using this browser profile can use a remembered token to write to the records repository. Leave this unchecked on public or shared computers. The token is never included in Rory’s student record, work backup, exports, or GitHub commits.</p>
        <div class="actions github-sync-actions">
          <button type="button" class="button" data-github-sync-save>Save now</button>
          <button type="button" class="button secondary" data-github-sync-load>Load latest from GitHub</button>
          <button type="button" class="button secondary" data-github-sync-disconnect>Disconnect &amp; forget on this browser</button>
          <a href="${historyUrl}" target="_blank" rel="noopener">Open version history</a>
        </div>
        <div class="github-sync-conflict" data-github-sync-conflict-actions hidden>
          <p><strong>Parent choice needed:</strong> Both copies are preserved. Loading GitHub archives this device copy first. Keeping this device creates a new GitHub version.</p>
          <div class="actions">
            <button type="button" class="button" data-github-sync-force-remote>Use GitHub copy</button>
            <button type="button" class="button secondary" data-github-sync-force-local>Keep this device as latest</button>
          </div>
        </div>
        <details>
          <summary>Parent setup details</summary>
          <ol>
            <li>Create a fine-grained GitHub token limited to <strong>${config.repository}</strong>.</li>
            <li>Give it repository <strong>Contents: Read and write</strong> permission.</li>
            <li>Paste it above. A trusted family workstation can remember it; other computers should connect for one session only.</li>
          </ol>
          <p>If a token is lost or a computer is no longer trusted, <a href="${revokeTokenUrl}" target="_blank" rel="noopener">revoke the token in GitHub settings</a>.</p>
          <p>Rory’s records are in a public GitHub repository and may be discovered even when the link is not shared.</p>
        </details>`;
      reports.append(card);
      bindControls(card);
    }

    if (!dashboard && !document.querySelector('.github-sync-page-status')) {
      const main = document.querySelector('main');
      if (main) {
        const bar = document.createElement('aside');
        bar.className = 'github-sync-page-status no-print';
        bar.innerHTML = '<span class="github-sync-dot" aria-hidden="true"></span><p><strong>Work save:</strong> <span data-github-sync-status aria-live="polite"></span></p><a href="index.html#reports">Parent GitHub setup</a>';
        main.prepend(bar);
      }
    }
    renderState();
  }

  function bindControls(card) {
    const input = card.querySelector('[data-github-sync-token]');
    const remember = card.querySelector('[data-github-sync-remember]');
    card.querySelector('[data-github-sync-connect]').addEventListener('click', async () => {
      const supplied = input.value;
      input.value = '';
      await connect(supplied, {remember:remember.checked});
    });
    input.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        card.querySelector('[data-github-sync-connect]').click();
      }
    });
    card.querySelector('[data-github-sync-save]').addEventListener('click', () => saveNow({reason:'parent'}));
    card.querySelector('[data-github-sync-load]').addEventListener('click', async () => {
      const local = captureValues();
      const different = remote.exists && !valuesEqual(local, remote.bundle?.values || {});
      if (different && !confirm('Load the latest GitHub copy? This device copy will be archived first, then Rory’s page will reopen.')) return;
      await loadRemoteCopy({confirmed:true});
    });
    card.querySelector('[data-github-sync-disconnect]').addEventListener('click', disconnect);
    card.querySelector('[data-github-sync-force-remote]').addEventListener('click', async () => {
      if (!confirm('Use the GitHub copy on this device? The current device copy will be archived first.')) return;
      await loadRemoteCopy({confirmed:true});
    });
    card.querySelector('[data-github-sync-force-local]').addEventListener('click', async () => {
      if (!token) {
        setState({phase:'needs-token', message:'A parent must connect GitHub before keeping this device copy as the newest version.'});
        return;
      }
      if (!confirm('Keep this device copy as the latest GitHub version? GitHub will retain the previous version in commit history.')) return;
      safeToWrite = true;
      await saveNow({reason:'conflict-resolution', force:true});
    });
  }

  function eventLooksLikeCheckpoint(event) {
    const control = event.target?.closest?.('button, input[type="submit"]');
    if (!control) return false;
    const description = `${control.id || ''} ${control.name || ''} ${control.dataset ? Object.keys(control.dataset).join(' ') : ''} ${control.textContent || ''}`.toLowerCase();
    return control.type === 'submit' || /save|submit|checkpoint|complete|review/.test(description);
  }

  document.addEventListener('submit', () => setTimeout(() => { if (dirty && token && safeToWrite && !state.conflict) saveNow({reason:'submit'}); }, 75));
  document.addEventListener('click', event => {
    if (eventLooksLikeCheckpoint(event)) setTimeout(() => { if (dirty && token && safeToWrite && !state.conflict) saveNow({reason:'checkpoint'}); }, 75);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && dirty && token && safeToWrite && !state.conflict) saveNow({reason:'visibility'});
  });
  window.addEventListener('storage', event => {
    if (event.key === credentialSignalKey && event.newValue) {
      try {
        if (JSON.parse(event.newValue)?.action !== 'disconnect') return;
      } catch (error) {
        return;
      }
      clearCredential({broadcast:false});
      setState({
        connected:false,
        phase:dirty?'device':'read-only',
        message:dirty
          ? 'GitHub was disconnected in another tab. New work is saved on this device only.'
          : 'GitHub write access was disconnected and forgotten in another tab.'
      });
      return;
    }
    if (isOwnKey(event.key)) markDirty();
  });

  const ready = bootstrap();
  window.GitHubSync = Object.freeze({
    ready,
    config,
    connect,
    disconnect,
    saveNow,
    loadLatest: options => loadRemoteCopy(options),
    status: () => ({...state}),
    snapshot: () => ({...captureValues()}),
    historyUrl
  });
})();
