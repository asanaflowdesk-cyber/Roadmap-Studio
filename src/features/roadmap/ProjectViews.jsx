import React, { useMemo, useState } from 'react';
import { useApp } from '../../app/AppContext.jsx';
import { Badge } from '../../shared/ui/Badge.jsx';
import { fmt, daysBetween } from '../../shared/utils/date.js';
import { Avatar } from '../../shared/ui/Avatar.jsx';

const statuses = [['new', 'Не начато'], ['progress', 'В работе'], ['approval', 'Согласование'], ['risk', 'Риски'], ['done', 'Готово']];
const DAY = 86400000;

function toTime(value) {
  const time = new Date(`${value}T00:00:00`).getTime();
  return Number.isFinite(time) ? time : null;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function monthLabel(date) {
  return date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
}

export function KanbanView({ items, phases }) {
  const { setRoute, route } = useApp();
  const phaseName = Object.fromEntries(phases.map(phase => [phase.id, phase.title]));
  return (
    <div className="status-board">
      {statuses.map(([status, label]) => {
        const list = items.filter(item => item.status === status);
        return <div className="status-col" key={status}><div className="status-head"><span>{label}</span><span className="badge badge-task">{list.length}</span></div>{list.map(item => <div key={item.id} className="kanban-card" onClick={() => setRoute(prev => prev.projectId === item.projectId ? ({ ...prev, itemId: item.id, phaseId: item.phaseId }) : ({ ...prev, view: 'project', projectId: item.projectId, tab: 'kanban', itemId: item.id, phaseId: item.phaseId }))}><div className="strong small">{item.title}</div><div className="small muted">{phaseName[item.phaseId]}</div><Badge value={item.type} /></div>)}</div>;
      })}
    </div>
  );
}

export function GanttView({ project, items, phases }) {
  const { setRoute } = useApp();
  const [collapsed, setCollapsed] = useState({});
  const validTimes = items.flatMap(item => [toTime(item.start), toTime(item.due)]).filter(Number.isFinite);
  const min = validTimes.length ? Math.min(...validTimes) : toTime(new Date().toISOString().slice(0, 10));
  const max = validTimes.length ? Math.max(...validTimes) : min + 14 * DAY;
  const range = Math.max(1, Math.round((max - min) / DAY) + 1);
  const days = useMemo(() => Array.from({ length: range }, (_, index) => addDays(min, index)), [min, range]);
  const months = [];
  days.forEach((date, index) => {
    const label = monthLabel(date);
    const last = months[months.length - 1];
    if (last?.label === label) last.span += 1;
    else months.push({ label, start: index + 1, span: 1 });
  });

  function position(item) {
    const start = toTime(item.start) ?? min;
    const due = toTime(item.due) ?? start;
    const left = Math.max(1, Math.round((start - min) / DAY) + 1);
    const span = Math.max(1, Math.round((due - start) / DAY) + 1);
    return { gridColumn: `${left} / span ${span}` };
  }

  function toggle(phaseId) {
    setCollapsed(prev => ({ ...prev, [phaseId]: !prev[phaseId] }));
  }

  return (
    <div className="gantt-page">
      <div className="gantt-card">
        <div className="gantt-titlebar">
          <div>
            <h1>{project?.title || 'Гант'}</h1>
            <p>{project?.desc || 'План-график задач по фазам проекта'}</p>
          </div>
          <span className="badge badge-task">{items.length} задач</span>
        </div>
        <div className="gantt-grid" style={{ '--day-count': range }}>
          <div className="gantt-left gantt-corner">Задачи</div>
          <div className="gantt-months">
            {months.map(month => <div key={`${month.label}-${month.start}`} style={{ gridColumn: `${month.start} / span ${month.span}` }}>{month.label}</div>)}
          </div>
          <div className="gantt-left gantt-days-label" />
          <div className="gantt-days">{days.map(day => <div key={day.toISOString()}>{day.getDate()}</div>)}</div>

          {phases.map((phase, phaseIndex) => {
            const phaseItems = items.filter(item => item.phaseId === phase.id);
            const isCollapsed = collapsed[phase.id];
            const done = phaseItems.filter(item => item.status === 'done').length;
            return (
              <React.Fragment key={phase.id}>
                <button className="gantt-left gantt-phase" onClick={() => toggle(phase.id)}>
                  <span>{isCollapsed ? '›' : '⌄'}</span>
                  <strong>Фаза {phaseIndex + 1} · {phase.title}</strong>
                  <em>{phaseItems.length} задач · {phaseItems.length ? Math.round(done / phaseItems.length * 100) : 0}%</em>
                </button>
                <div className="gantt-phase-line" />
                {!isCollapsed && phaseItems.map(item => (
                  <React.Fragment key={item.id}>
                    <button className={`gantt-left gantt-task-title ${item.id === undefined ? '' : ''}`} onClick={() => setRoute(prev => ({ ...prev, itemId: item.id, phaseId: item.phaseId }))}><span className={`dot ${item.type === 'risk' ? 'dot-risk' : item.type === 'milestone' ? 'dot-milestone' : item.status === 'done' ? 'dot-done' : ''}`} /><span>{item.title}</span></button>
                    <div className="gantt-track">
                      <div className={`gantt-task-bar gantt-task-${item.type} ${item.status === 'done' ? 'done' : ''}`} style={position(item)} title={`${item.title}: ${fmt(item.start)} → ${fmt(item.due)}`}>
                        <span>{daysBetween(item.start, item.due)} дн.</span>
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function RoadmapView({ phases, items }) {
  const { setRoute, route } = useApp();
  return <div className="page"><div className="grid">{phases.map(phase => <section className="card card-pad" key={phase.id}><div className="eyebrow">Фаза {phase.sort}</div><h2 className="h1" style={{ fontSize: 26 }}>{phase.title}</h2><div className="grid" style={{ marginTop: 14 }}>{items.filter(item => item.phaseId === phase.id).map(item => <button type="button" className={`card card-pad task-click-card ${route.itemId === item.id ? 'active' : ''}`} key={item.id} onClick={() => setRoute(prev => ({ ...prev, itemId: item.id, phaseId: item.phaseId }))}><Badge value={item.status} /><div className="strong" style={{ marginTop: 8 }}>{item.title}</div><div className="small muted">{item.result || '—'} · {fmt(item.start)} → {fmt(item.due)}</div></button>)}</div></section>)}</div></div>;
}

export function CalendarView({ items }) {
  const { setRoute, route } = useApp();
  const byDate = items.reduce((acc, item) => {
    const key = item.due || 'Без даты';
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {});
  return <div className="page"><div className="page-narrow"><div className="grid">{Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b)).map(([date, list]) => <section className="card card-pad" key={date}><div className="strong">{date === 'Без даты' ? date : fmt(date)}</div><div className="grid" style={{ marginTop: 10 }}>{list.map(item => <button type="button" key={item.id} className={`card card-pad task-click-card ${route.itemId === item.id ? 'active' : ''}`} onClick={() => setRoute(prev => ({ ...prev, itemId: item.id, phaseId: item.phaseId }))}><Badge value={item.status} /><span className="strong" style={{ marginLeft: 8 }}>{item.title}</span></button>)}</div></section>)}</div></div></div>;
}

export function AnalyticsView({ project, items, db }) {
  const { setRoute, route } = useApp();
  const total = items.length || 1;
  const done = items.filter(item => item.status === 'done').length;
  const risks = items.filter(item => item.status === 'risk' || item.type === 'risk').length;
  const assigned = [...new Set(items.flatMap(item => [item.ownerId, ...(item.people || [])]))].map(id => db.users.find(user => user.id === id && user.platformRole === 'user')).filter(Boolean);
  return <div className="page"><div className="page-narrow"><div className="page-head"><div><div className="eyebrow">Аналитика</div><h1 className="h1">{project.title}</h1></div></div><div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}><div className="card card-pad"><div className="eyebrow">Всего задач</div><div className="h1">{items.length}</div></div><div className="card card-pad"><div className="eyebrow">Выполнено</div><div className="h1">{Math.round(done / total * 100)}%</div></div><div className="card card-pad"><div className="eyebrow">Риски</div><div className="h1">{risks}</div></div><div className="card card-pad"><div className="eyebrow">Участники</div><div style={{ display: 'flex', marginTop: 14 }}>{assigned.map(user => <Avatar key={user.id} user={user} />)}</div></div></div><section className="card card-pad" style={{ marginTop: 16 }}><div className="section-title">Задачи проекта</div><div className="grid" style={{ marginTop: 10 }}>{items.map(item => <button type="button" key={item.id} className={`task-click-card ${route.itemId === item.id ? 'active' : ''}`} onClick={() => setRoute(prev => ({ ...prev, itemId: item.id, phaseId: item.phaseId }))}><Badge value={item.status} /><span className="strong">{item.title}</span><small>{fmt(item.start)} → {fmt(item.due)}</small></button>)}</div></section></div></div>;
}
