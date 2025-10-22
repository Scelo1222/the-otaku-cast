(function(){
  const qs = (s, el=document) => el.querySelector(s);
  const qsa = (s, el=document) => Array.from(el.querySelectorAll(s));
  const $ = {
    loginForm: qs('#login-form'),
    username: qs('#username'),
    role: qs('#role'),
    userInfo: qs('#user-info'),
    welcome: qs('#welcome'),
    logout: qs('#logout'),
    nav: qs('#nav'),
    adminTabs: qsa('.admin-only'),
    tabs: qsa('.tab'),
    sections: {
      foundation: qs('#section-foundation'),
      rules: qs('#section-rules'),
      events: qs('#section-events'),
      members: qs('#section-members'),
      missions: qs('#section-missions'),
      suggestions: qs('#section-suggestions'),
      admin: qs('#section-admin'),
    },
    suggestionForm: qs('#suggestion-form'),
    suggestionsList: qs('#suggestions-list')
  };

  const store = {
    get user(){ try { return JSON.parse(localStorage.getItem('toc_user')||'null'); } catch { return null }},
    set user(u){ localStorage.setItem('toc_user', JSON.stringify(u)); },
    clearUser(){ localStorage.removeItem('toc_user'); },
    get suggestions(){ try { return JSON.parse(localStorage.getItem('toc_suggestions')||'[]'); } catch { return [] }},
    set suggestions(list){ localStorage.setItem('toc_suggestions', JSON.stringify(list)); },
  };

  function setLoggedIn(user){
    if(user){
      $.loginForm.classList.add('hidden');
      $.userInfo.classList.remove('hidden');
      $.nav.classList.remove('hidden');
      $.welcome.textContent = `Welcome, ${user.name} (${user.role})`;
      $.adminTabs.forEach(el => el.classList.toggle('hidden', user.role !== 'admin'));
      activateTab('foundation');
    } else {
      $.loginForm.classList.remove('hidden');
      $.userInfo.classList.add('hidden');
      $.nav.classList.add('hidden');
    }
  }

  function activateTab(key){
    $.tabs.forEach(t => t.classList.toggle('active', t.dataset.section === key));
    Object.entries($.sections).forEach(([k, el]) => el.classList.toggle('hidden', k !== key));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderSuggestions(){
    const list = store.suggestions;
    $.suggestionsList.innerHTML = '';
    if(list.length === 0){
      $.suggestionsList.innerHTML = '<p class="meta">No suggestions yet. Be the first to submit!</p>';
      return;
    }
    for(const s of list){
      const card = document.createElement('div');
      card.className = `suggestion ${s.missionRank}`;
      card.innerHTML = `
        <h4>${escapeHtml(s.animeName)} <small class="meta">(${escapeHtml(s.genre)})</small></h4>
        <p><strong>Synopsis:</strong> ${escapeHtml(s.synopsis)}</p>
        <p><strong>Why:</strong> ${escapeHtml(s.reason)}</p>
        <div class="meta">
          <span>By <strong>${escapeHtml(s.submittedBy)}</strong></span>
          <span>${escapeHtml(s.date)}</span>
          <span class="meta">${escapeHtml(s.missionRank)} rank</span>
        </div>
      `;
      $.suggestionsList.appendChild(card);
    }
  }

  function escapeHtml(str){
    return String(str)
      .replaceAll('&','&amp;')
      .replaceAll('<','&lt;')
      .replaceAll('>','&gt;')
      .replaceAll('"','&quot;')
      .replaceAll("'",'&#039;');
  }

  // Events
  $.loginForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = $.username.value.trim();
    const role = $.role.value;
    if(!name) return;
    store.user = { name, role };
    setLoggedIn(store.user);
  });

  $.logout.addEventListener('click', ()=>{
    store.clearUser();
    setLoggedIn(null);
  });

  $.tabs.forEach(tab => tab.addEventListener('click', ()=>{
    const k = tab.dataset.section;
    if(k === 'admin' && (!store.user || store.user.role !== 'admin')) return;
    activateTab(k);
  }));

  $.suggestionForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    if(!store.user) return alert('Please login first.');
    const now = new Date();
    const row = {
      id: String(now.getTime()),
      animeName: qs('#animeName').value.trim(),
      genre: qs('#genre').value,
      synopsis: qs('#synopsis').value.trim(),
      reason: qs('#reason').value.trim(),
      missionRank: qs('#missionRank').value,
      submittedBy: store.user.name,
      date: now.toISOString().split('T')[0],
    };
    const list = store.suggestions;
    list.unshift(row);
    store.suggestions = list;
    e.target.reset();
    renderSuggestions();
    alert('Suggestion submitted successfully!');
  });

  // Init
  const existing = store.user;
  if(existing){
    setLoggedIn(existing);
  }
  renderSuggestions();
})();
