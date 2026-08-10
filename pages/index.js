import { useEffect, useMemo, useState } from 'react';

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [text, setText] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => { const saved = localStorage.getItem('tugas-pintar'); if (saved) setTasks(JSON.parse(saved)); }, []);
  useEffect(() => { localStorage.setItem('tugas-pintar', JSON.stringify(tasks)); }, [tasks]);

  function addTask(e) { e.preventDefault(); if (!text.trim()) return; setTasks([{ id: Date.now(), text: text.trim(), done: false }, ...tasks]); setText(''); }
  function toggle(id) { setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t)); }
  function remove(id) { setTasks(tasks.filter(t => t.id !== id)); }
  const visible = useMemo(() => tasks.filter(t => filter === 'all' || (filter === 'done' ? t.done : !t.done)), [tasks, filter]);
  const remaining = tasks.filter(t => !t.done).length;

  return <main className="wrap">
    <section className="card">
      <div className="header"><div><p className="eyebrow">TUGAS PINTAR</p><h1>Senarai Tugas</h1><p className="sub">Susun kerja anda. Satu tugas pada satu masa.</p></div><div className="count">{remaining}<span> belum selesai</span></div></div>
      <form onSubmit={addTask} className="form"><input value={text} onChange={e => setText(e.target.value)} placeholder="Tambah tugas baharu..."/><button>+ Tambah</button></form>
      <div className="filters">{[['all','Semua'],['active','Belum selesai'],['done','Selesai']].map(([key,label]) => <button key={key} className={filter===key?'active':''} onClick={() => setFilter(key)}>{label}</button>)}</div>
      <div className="list">{visible.length === 0 ? <div className="empty">Tiada tugas di sini ✨</div> : visible.map(t => <div className={'task '+(t.done?'done':'')} key={t.id}><button className="check" onClick={() => toggle(t.id)}>{t.done?'✓':''}</button><span>{t.text}</span><button className="delete" onClick={() => remove(t.id)}>×</button></div>)}</div>
      {tasks.length > 0 && <button className="clear" onClick={() => setTasks(tasks.filter(t => !t.done))}>Padam tugas selesai</button>}
    </section>
    <footer>Tersimpan automatik dalam browser anda.</footer>
  </main>;
}
