import { useEffect, useMemo, useState } from 'react';

const priorities = { low: 'Rendah', medium: 'Sederhana', high: 'Tinggi', critical: 'Kritikal' };
const statuses = { new: 'Baru', progress: 'Dalam Proses', done: 'Selesai' };
const categories = ['Umum', 'Kerja', 'Projek', 'Mesyuarat', 'Peribadi'];

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Umum');
  const [priority, setPriority] = useState('medium');
  const [due, setDue] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [view, setView] = useState('list');
  const [dark, setDark] = useState(false);

  useEffect(() => { try { const saved = localStorage.getItem('tugas-pintar'); if (saved) setTasks(JSON.parse(saved)); } catch {} }, []);
  useEffect(() => { localStorage.setItem('tugas-pintar', JSON.stringify(tasks)); }, [tasks]);

  function addTask(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setTasks([{ id: Date.now(), title: title.trim(), category, priority, due, status: 'new', created: new Date().toISOString() }, ...tasks]);
    setTitle(''); setDue('');
  }
  function updateTask(id, patch) { setTasks(tasks.map(t => t.id === id ? { ...t, ...patch } : t)); }
  function remove(id) { setTasks(tasks.filter(t => t.id !== id)); }

  const today = new Date().toISOString().slice(0,10);
  const stats = { total: tasks.length, active: tasks.filter(t => t.status !== 'done').length, done: tasks.filter(t => t.status === 'done').length, overdue: tasks.filter(t => t.due && t.due < today && t.status !== 'done').length };
  const visible = useMemo(() => tasks.filter(t => {
    const matchesFilter = filter === 'all' || (filter === 'done' ? t.status === 'done' : filter === 'overdue' ? t.due && t.due < today && t.status !== 'done' : t.status === filter);
    const q = search.toLowerCase();
    return matchesFilter && (!q || `${t.title} ${t.category} ${priorities[t.priority]}`.toLowerCase().includes(q));
  }), [tasks, filter, search]);

  const exportData = () => { const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'tugas-pintar-backup.json'; a.click(); };

  return <main className={dark ? 'wrap dark' : 'wrap'}>
    <section className="card">
      <header className="header"><div><p className="eyebrow">TUGAS PINTAR • CORPORATE</p><h1>Pengurusan Tugasan</h1><p className="sub">Dashboard kerja untuk mengurus tugasan dengan lebih teratur.</p></div><div className="actions"><button onClick={() => setDark(!dark)}>{dark ? '☀ Light' : '◐ Dark'}</button><button onClick={exportData}>Export</button></div></header>

      <div className="stats"><div><b>{stats.total}</b><span>Semua Tugasan</span></div><div><b>{stats.active}</b><span>Belum Selesai</span></div><div><b>{stats.done}</b><span>Selesai</span></div><div className={stats.overdue ? 'danger' : ''}><b>{stats.overdue}</b><span>Lewat</span></div></div>

      <form onSubmit={addTask} className="form"><input value={title} onChange={e => setTitle(e.target.value)} placeholder="Nama tugasan baharu..."/><select value={category} onChange={e => setCategory(e.target.value)}>{categories.map(c => <option key={c}>{c}</option>)}</select><select value={priority} onChange={e => setPriority(e.target.value)}>{Object.entries(priorities).map(([k,v]) => <option key={k} value={k}>{v}</option>)}</select><input type="date" value={due} onChange={e => setDue(e.target.value)}/><button className="primary">+ Tambah</button></form>

      <div className="toolbar"><input className="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari tugasan, kategori atau keutamaan..."/><div className="filters">{[['all','Semua'],['new','Baru'],['progress','Dalam Proses'],['done','Selesai'],['overdue','Lewat']].map(([k,v]) => <button key={k} className={filter===k?'active':''} onClick={() => setFilter(k)}>{v}</button>)}</div><div className="views"><button className={view==='list'?'active':''} onClick={() => setView('list')}>☷ Senarai</button><button className={view==='board'?'active':''} onClick={() => setView('board')}>▦ Papan</button></div></div>

      {view === 'board' ? <div className="board">{Object.entries(statuses).map(([status,label]) => <div className="column" key={status}><h3>{label} <small>{tasks.filter(t=>t.status===status).length}</small></h3>{visible.filter(t=>t.status===status).map(t => <Task key={t.id} t={t} update={updateTask} remove={remove}/>)}</div>)}</div> : <div className="list">{visible.length === 0 ? <div className="empty">Tiada tugasan ditemui.</div> : visible.map(t => <Task key={t.id} t={t} update={updateTask} remove={remove}/>)}</div>}
    </section><footer>Tugas Pintar V2 • Data disimpan secara automatik dalam browser.</footer>
  </main>;
}

function Task({ t, update, remove }) { return <div className={'task '+t.status}><button className="check" onClick={() => update(t.id,{status:t.status==='done'?'new':'done'})}>{t.status==='done'?'✓':''}</button><div className="taskbody"><strong>{t.title}</strong><div className="meta"><span>{t.category}</span><span className={'priority '+t.priority}>{priorities[t.priority]}</span>{t.due && <span>Deadline: {t.due}</span>}</div></div><select value={t.status} onChange={e => update(t.id,{status:e.target.value})}>{Object.entries(statuses).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select><button className="delete" onClick={() => remove(t.id)}>×</button></div>; }
