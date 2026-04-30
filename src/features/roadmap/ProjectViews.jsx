import React from 'react';
import { useApp } from '../../app/AppContext.jsx';
import { Badge } from '../../shared/ui/Badge.jsx';
import { fmt, daysBetween } from '../../shared/utils/date.js';
import { Avatar } from '../../shared/ui/Avatar.jsx';

const statuses = [['new', 'Не начато'], ['progress', 'В работе'], ['approval', 'Согласование'], ['risk', 'Риски'], ['done', 'Готово']];

export function KanbanView({ items, phases }) {
  const { setRoute } = useApp();
  const phaseName = Object.fromEntries(phases.map(phase => [phase.id, phase.title]));
  return (
    <div className="status-board">
      {statuses.map(([status, label]) => {
        const list = items.filter(item => item.status === status);
        return <div className="status-col" key={status}><div className="status-head"><span>{label}</span><span className="badge badge-task">{list.length}</span></div>{list.map(item => <div key={item.id} className="kanban-card" onClick={() => setRoute(prev => ({ ...prev, tab: 'table', itemId: item.id, phaseId: item.phaseId }))}><div className="strong small">{item.title}</div><div className="small muted">{phaseName[item.phaseId]}</div><Badge value={item.type} /></div>)}</div>;
      })}
    </div>
  );
}

export function GanttView({ items }) {
  const min = Math.min(...items.map(item => new Date(`${item.start}T00:00:00`).getTime()).filter(Boolean));
  const max = Math.max(...items.map(item => new Date(`${item.due}T00:00:00`).getTime()).filter(Boolean));
  const range = Math.max(1, Math.round((max - min) / 86400000) + 1);
  return <div className="gantt">{items.map(item => {
    const startOffset = Math.max(0, Math.round((new Date(`${item.start}T00:00:00`).getTime() - min) / 86400000));
    const width = Math.max(4, daysBetween(item.start, item.due) / range * 100);
    const left = Math.min(96, startOffset / range * 100);
    return <div className="gantt-row" key={item.id}><div><div className="strong small truncate">{item.title}</div><div className="small muted">{fmt(item.start)} → {fmt(item.due)}</div></div><div className="gantt-line"><div className="gantt-bar" style={{ left: `${left}%`, width: `${width}%` }} /></div></div>;
  })}</div>;
}

export function RoadmapView({ phases, items }) {
  return <div className="page"><div className="grid">{phases.map(phase => <section className="card card-pad" key={phase.id}><div className="eyebrow">Фаза {phase.sort}</div><h2 className="h1" style={{ fontSize: 26 }}>{phase.title}</h2><div className="grid" style={{ marginTop: 14 }}>{items.filter(item => item.phaseId === phase.id).map(item => <div className="card card-pad" key={item.id}><Badge value={item.status} /><div className="strong" style={{ marginTop: 8 }}>{item.title}</div><div className="small muted">{item.result || '—'} · {fmt(item.start)} → {fmt(item.due)}</div></div>)}</div></section>)}</div></div>;
}

export function CalendarView({ items }) {
  const byDate = items.reduce((acc, item) => {
    const key = item.due || 'Без даты';
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {});
  return <div className="page"><div className="page-narrow"><div className="grid">{Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b)).map(([date, list]) => <section className="card card-pad" key={date}><div className="strong">{date === 'Без даты' ? date : fmt(date)}</div><div className="grid" style={{ marginTop: 10 }}>{list.map(item => <div key={item.id} className="card card-pad"><Badge value={item.status} /><span className="strong" style={{ marginLeft: 8 }}>{item.title}</span></div>)}</div></section>)}</div></div></div>;
}

export function AnalyticsView({ project, items, db }) {
  const total = items.length || 1;
  const done = items.filter(item => item.status === 'done').length;
  const risks = items.filter(item => item.status === 'risk' || item.type === 'risk').length;
  const assigned = [...new Set(items.flatMap(item => [item.ownerId, ...(item.people || [])]))].map(id => db.users.find(user => user.id === id)).filter(Boolean);
  return <div className="page"><div className="page-narrow"><div className="page-head"><div><div className="eyebrow">Аналитика</div><h1 className="h1">{project.title}</h1></div></div><div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}><div className="card card-pad"><div className="eyebrow">Всего задач</div><div className="h1">{items.length}</div></div><div className="card card-pad"><div className="eyebrow">Выполнено</div><div className="h1">{Math.round(done / total * 100)}%</div></div><div className="card card-pad"><div className="eyebrow">Риски</div><div className="h1">{risks}</div></div><div className="card card-pad"><div className="eyebrow">Участники</div><div style={{ display: 'flex', marginTop: 14 }}>{assigned.map(user => <Avatar key={user.id} user={user} />)}</div></div></div></div></div>;
}
