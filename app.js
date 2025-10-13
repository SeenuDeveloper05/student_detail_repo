// Shared JS for login and pages
const LS_USER = 'studentapp_user';
const LS_STUD = 'studentapp_students';

// --- Authentication (client-side demo) ---
if(document.getElementById('loginForm')){
  const loginForm = document.getElementById('loginForm');
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    if(!user || !pass){ alert('Please fill both fields.'); return; }
    // demo check: accept demo/demo or anything non-empty
    if(user === 'demo' && pass === 'demo'){
      localStorage.setItem(LS_USER, JSON.stringify({username: 'demo', email: 'demo@example.com'}));
      alert('Demo login successful!');
      window.location = 'dashboard.html';
    } else {
      // allow any non-empty credentials but show alert
      localStorage.setItem(LS_USER, JSON.stringify({username: user, email: user + '@example.com'}));
      alert('Login successful!');
      window.location = 'dashboard.html';
    }
  });

  document.getElementById('demo').addEventListener('click', () => {
    document.getElementById('username').value = 'demo';
    document.getElementById('password').value = 'demo';
  });
}

// Redirect to login if not signed in (for protected pages)
function requireAuth(){
  const user = localStorage.getItem(LS_USER);
  if(!user){
    alert('Please sign in first.');
    window.location = 'login.html';
    return null;
  }
  return JSON.parse(user);
}

if(document.querySelector('.topbar')){
  const user = requireAuth();
  if(user){
    const w = document.getElementById('userWelcome');
    if(w) w.textContent = user.username || 'User';
    // attach logout buttons
    ['logoutTop','logoutTop2','logoutTop3'].forEach(id => {
      const el = document.getElementById(id);
      if(el) el.addEventListener('click', () => {
        localStorage.removeItem(LS_USER);
        alert('Logged out.');
        window.location = 'login.html';
      });
    });
  }
}

// --- Student management (on students.html) ---
if(document.getElementById('studentForm')){
  const LS_KEY = LS_STUD;
  const tbody = document.querySelector('#studentsTable tbody');
  const form = document.getElementById('studentForm');
  const searchInput = document.getElementById('search');
  const exportBtn = document.getElementById('exportBtn');
  const loadSample = document.getElementById('loadSample');
  const saveBtn = form.querySelector('button[type="submit"]');
  let students = [];

  function uid(){ return 's-' + Math.random().toString(36).slice(2,9); }

  function load(){
    const raw = localStorage.getItem(LS_KEY);
    students = raw ? JSON.parse(raw) : [];
    render();
  }

  function saveToStorage(){ localStorage.setItem(LS_KEY, JSON.stringify(students)); }

  function render(filter=''){
    tbody.innerHTML = '';
    const q = (filter||'').trim().toLowerCase();
    const list = students.filter(s => !q || (s.name + ' ' + s.roll + ' ' + s.className).toLowerCase().includes(q));
    list.forEach((s,i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${i+1}</td><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.roll)}</td><td>${escapeHtml(s.className)}</td><td>${escapeHtml(s.email||'')}</td>
        <td class="actions-btns"><button onclick="editStudent('${s.id}')" class="btn small">Edit</button><button onclick="deleteStudent('${s.id}')" class="btn small ghost">Delete</button></td>`;
      tbody.appendChild(tr);
    });
  }

  function escapeHtml(t=''){ return t.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]); }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const id = document.getElementById('studentId').value || uid();
    const name = document.getElementById('name').value.trim();
    const roll = document.getElementById('roll').value.trim();
    const className = document.getElementById('className').value.trim();
    const email = document.getElementById('email').value.trim();
    if(!name || !roll || !className){ alert('Fill name, roll and class'); return; }
    const existing = students.findIndex(x => x.id === id);
    const obj = {id,name,roll,className,email};
    if(existing >= 0){ students[existing] = obj; alert('Student updated!'); } else { students.push(obj); alert('Student added!'); }
    saveToStorage(); render(searchInput.value); form.reset(); document.getElementById('studentId').value = '';
  });

  window.editStudent = function(id){
    const s = students.find(x=>x.id===id); if(!s) return;
    document.getElementById('studentId').value = s.id;
    document.getElementById('name').value = s.name;
    document.getElementById('roll').value = s.roll;
    document.getElementById('className').value = s.className;
    document.getElementById('email').value = s.email || '';
    window.scrollTo({top:0,behavior:'smooth'});
  }

  window.deleteStudent = function(id){
    if(!confirm('Delete this student?')) return;
    students = students.filter(x=>x.id!==id);
    saveToStorage(); render(searchInput.value);
    alert('Student deleted.');
  }

  searchInput.addEventListener('input', e => render(e.target.value));

  exportBtn.addEventListener('click', () => {
    if(students.length===0){ alert('No students to export'); return; }
    const rows = [['Name','Roll','Class','Email'], ...students.map(s=>[s.name,s.roll,s.className,s.email||''])];
    const csv = rows.map(r => r.map(v => '"'+(''+v).replace(/"/g,'""')+'"').join(',')).join('\n');
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'students.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  });

  loadSample.addEventListener('click', () => {
    const sample = [{id:uid(),name:'Asha',roll:'01',className:'10A',email:'asha@example.com'},{id:uid(),name:'Rahul',roll:'02',className:'10A'},{id:uid(),name:'Sneha',roll:'03',className:'9B'}];
    students = students.concat(sample); saveToStorage(); render(searchInput.value); alert('Sample data loaded!');
  });

  load();
}

// --- Profile update on profile.html ---
if(document.getElementById('profileForm')){
  const pForm = document.getElementById('profileForm');
  const user = requireAuth();
  if(user){
    document.getElementById('pUsername').value = user.username || '';
    document.getElementById('pEmail').value = user.email || '';
  }
  pForm.addEventListener('submit', e => {
    e.preventDefault();
    const u = document.getElementById('pUsername').value.trim();
    const em = document.getElementById('pEmail').value.trim();
    if(!u){ alert('Username required'); return; }
    localStorage.setItem(LS_USER, JSON.stringify({username:u, email: em}));
    alert('Profile updated!');
  });
}
