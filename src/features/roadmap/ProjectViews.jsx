import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../../app/AppContext.jsx';
import { Badge } from '../../shared/ui/Badge.jsx';
import { fmt, daysBetween } from '../../shared/utils/date.js';
import { Avatar } from '../../shared/ui/Avatar.jsx';
import { Button } from '../../shared/ui/Button.jsx';

const statuses = [['new', 'Не начато'], ['progress', 'В работе'], ['approval', 'Согласование'], ['risk', 'Риски'], ['done', 'Готово']];
const DAY = 86400000;

function toISO(date) {
  return date.toISOString().slice(0, 10);
}

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

function openItem(setRoute, item) {
  setRoute(prev => ({ ...prev, itemId: item.id, phaseId: item.phaseId }));
}

export function KanbanView({ items, phases }) {
  const { setRoute, route } = useApp();
  const phaseName = Object.fromEntries(phases.map(phase => [phase.id, phase.title]));
  return (
    <div className="status-board">
      {statuses.map(([status, label]) => {
        const list = items.filter(item => item.status === status);
        return <div className="status-col" key={status}><div className="status-head"><span>{label}</span><span className="badge badge-task">{list.length}</span></div>{list.map(item => <div key={item.id} className={`kanban-card compact-card ${route.itemId === item.id ? 'active' : ''}`} onClick={() => openItem(setRoute, item)}><div className="strong small">{item.title}</div><div className="small muted">{phaseName[item.phaseId]}</div><Badge value={item.type} /></div>)}</div>;
      })}
    </div>
  );
}

export function GanttView({ project, items, phases }) {
  const { setRoute } = useApp();
  const gridRef = useRef(null);
  const [collapsed, setCollapsed] = useState({});
  const todayIso = toISO(new Date());
  const todayTime = toTime(todayIso);
  const validTimes = items.flatMap(item => [toTime(item.start), toTime(item.due)]).filter(Number.isFinite);
  const min = Math.min(...(validTimes.length ? validTimes : [todayTime]), todayTime);
  const max = Math.max(...(validTimes.length ? validTimes : [todayTime + 14 * DAY]), todayTime + 14 * DAY);
  const range = Math.max(1, Math.round((max - min) / DAY) + 1);
  const todayIndex = Math.max(1, Math.round((todayTime - min) / DAY) + 1);
  const days = useMemo(() => Array.from({ length: range }, (_, index) => addDays(min, index)), [min, range]);
  const months = [];
  days.forEach((date, index) => {
    const label = monthLabel(date);
    const last = months[months.length - 1];
    if (last?.label === label) last.span += 1;
    else months.push({ label, start: index + 1, span: 1 });
  });

  useEffect(() => {
    requestAnimationFrame(() => {
      const el = gridRef.current;
      if (!el) return;
      const target = Math.max(0, (todayIndex - 12) * 30);
      el.scrollLeft = target;
    });
  }, [todayIndex, range, project?.id]);

  function position(item) {
    const start = toTime(item.start) ?? min;
    const due = toTime(item.due) ?? start;
    const left = Math.max(1, Math.round((start - min) / DAY) + 1);
    const span = Math.max(1, Math.round((due - start) / DAY) + 1);
    return { gridColumn: `${left} / span ${span}` };
  }

  return (
    <div className="gantt-page">
      <div className="gantt-card">
        <div className="gantt-titlebar">
          <div>
            <h1>{project?.title || 'Гант'}</h1>
            <p>{project?.desc || 'План-график задач по фазам проекта'}</p>
          </div>
          <span className="badge badge-task">сегодня · {fmt(todayIso)}</span>
        </div>
        <div className="gantt-grid" ref={gridRef} style={{ '--day-count': range, '--today-column': todayIndex }}>
          <div className="gantt-left gantt-corner">Задачи</div>
          <div className="gantt-months">{months.map(month => <div key={`${month.label}-${month.start}`} style={{ gridColumn: `${month.start} / span ${month.span}` }}>{month.label}</div>)}</div>
          <div className="gantt-left gantt-days-label" />
          <div className="gantt-days">{days.map(day => {
            const iso = toISO(day);
            return <div key={iso} className={iso === todayIso ? 'gantt-today-day' : ''}><span>{day.getDate()}</span></div>;
          })}</div>

          {phases.map((phase, phaseIndex) => {
            const phaseItems = items.filter(item => item.phaseId === phase.id);
            const isCollapsed = collapsed[phase.id];
            const done = phaseItems.filter(item => item.status === 'done').length;
            return (
              <React.Fragment key={phase.id}>
                <button className="gantt-left gantt-phase" onClick={() => setCollapsed(prev => ({ ...prev, [phase.id]: !prev[phase.id] }))}>
                  <span>{isCollapsed ? '›' : '⌄'}</span>
                  <strong>Фаза {phaseIndex + 1} · {phase.title}</strong>
                  <em>{phaseItems.length} задач · {phaseItems.length ? Math.round(done / phaseItems.length * 100) : 0}%</em>
                </button>
                <div className="gantt-phase-line"><div className="gantt-today-line" style={{ gridColumn: `${todayIndex} / span 1` }} /></div>
                {!isCollapsed && phaseItems.map(item => (
                  <React.Fragment key={item.id}>
                    <button className="gantt-left gantt-task-title" onClick={() => openItem(setRoute, item)}><span className={`dot ${item.type === 'risk' ? 'dot-risk' : item.type === 'milestone' ? 'dot-milestone' : item.status === 'done' ? 'dot-done' : ''}`} /><span>{item.title}</span></button>
                    <div className="gantt-track"><div className="gantt-today-line" style={{ gridColumn: `${todayIndex} / span 1` }} /><div className={`gantt-task-bar gantt-task-${item.type} ${item.status === 'done' ? 'done' : ''}`} style={position(item)} title={`${item.title}: ${fmt(item.start)} → ${fmt(item.due)}`}><span>{daysBetween(item.start, item.due)} дн.</span></div></div>
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
  return <div className="page"><div className="grid">{phases.map(phase => <section className="card card-pad compact-card" key={phase.id}><div className="eyebrow">Фаза {phase.sort}</div><h2 className="h1" style={{ fontSize: 24 }}>{phase.title}</h2><div className="grid" style={{ marginTop: 12 }}>{items.filter(item => item.phaseId === phase.id).map(item => <button type="button" className={`card card-pad task-click-card compact-card ${route.itemId === item.id ? 'active' : ''}`} key={item.id} onClick={() => openItem(setRoute, item)}><Badge value={item.status} /><div className="strong" style={{ marginTop: 6 }}>{item.title}</div><div className="small muted">{item.result || '—'} · {fmt(item.start)} → {fmt(item.due)}</div></button>)}</div></section>)}</div></div>;
}

export function CalendarView({ items }) {
  const { setRoute, route } = useApp();
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const today = new Date();
  const todayIso = toISO(today);
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const start = new Date(monthStart);
  start.setDate(monthStart.getDate() - ((monthStart.getDay() + 6) % 7));
  const end = new Date(monthEnd);
  end.setDate(monthEnd.getDate() + (6 - ((monthEnd.getDay() + 6) % 7)));
  const days = [];
  for (let d = new Date(start); d <= end; d = addDays(d, 1)) days.push(new Date(d));

  const byDate = items.reduce((acc, item) => {
    const startTime = toTime(item.start || item.due);
    const dueTime = toTime(item.due || item.start);
    if (!Number.isFinite(startTime) || !Number.isFinite(dueTime)) return acc;
    const a = Math.min(startTime, dueTime);
    const b = Math.max(startTime, dueTime);
    for (let t = a; t <= b; t += DAY) {
      const key = toISO(new Date(t));
      (acc[key] ||= []).push(item);
    }
    return acc;
  }, {});

  const visibleCount = days.reduce((sum, day) => sum + (byDate[toISO(day)] || []).length, 0);

  return <div className="page calendar-page"><div className="calendar-card card compact-card"><div className="calendar-head"><Button size="sm" variant="ghost" onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}>‹</Button><div><div className="calendar-head-title">{monthLabel(monthStart)}</div><div className="small muted">Сегодня: {fmt(todayIso)} · задач в видимом месяце: {visibleCount}</div></div><div className="calendar-head-actions"><Button size="sm" variant="ghost" onClick={() => setCurrentMonth(new Date())}>Сегодня</Button><Button size="sm" variant="ghost" onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}>›</Button></div></div><div className="calendar-weekdays">{['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(day => <div key={day}>{day}</div>)}</div><div className="calendar-grid">{days.map(day => {
    const key = toISO(day);
    const dayItems = byDate[key] || [];
    const isToday = key === todayIso;
    const inMonth = day.getMonth() === currentMonth.getMonth();
    return <div key={key} className={`calendar-cell ${isToday ? 'today' : ''} ${inMonth ? '' : 'muted-month'}`}><div className="calendar-date">{day.getDate()}</div><div className="calendar-list">{dayItems.slice(0,4).map(item => <button type="button" key={`${key}-${item.id}`} className={`calendar-item status-${item.status} ${route.itemId === item.id ? 'active' : ''}`} onClick={() => openItem(setRoute, item)}>{item.title}</button>)}{dayItems.length > 4 ? <div className="calendar-more">+{dayItems.length - 4} ещё</div> : null}</div></div>;
  })}</div>{visibleCount === 0 && items.length > 0 ? <div className="calendar-empty-note">В этом месяце задач нет. Используйте стрелки месяца или кнопку “Сегодня”.</div> : null}</div></div>;
}

export function AnalyticsView({ project, items, db }) {
  const { setRoute, route } = useApp();
  const total = items.length || 1;
  const done = items.filter(item => item.status === 'done').length;
  const risks = items.filter(item => item.status === 'risk' || item.type === 'risk').length;
  const assigned = [...new Set(items.flatMap(item => [item.ownerId, ...(item.people || [])]))].map(id => db.users.find(user => user.id === id && user.platformRole === 'user')).filter(Boolean);
  return <div className="page"><div className="page-narrow"><div className="page-head"><div><div className="eyebrow">Аналитика</div><h1 className="h1">{project.title}</h1></div></div><div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))' }}><div className="card card-pad compact-card"><div className="eyebrow">Всего задач</div><div className="h1">{items.length}</div></div><div className="card card-pad compact-card"><div className="eyebrow">Выполнено</div><div className="h1">{Math.round(done / total * 100)}%</div></div><div className="card card-pad compact-card"><div className="eyebrow">Риски</div><div className="h1">{risks}</div></div><div className="card card-pad compact-card"><div className="eyebrow">Участники</div><div style={{ display: 'flex', marginTop: 10 }}>{assigned.map(user => <Avatar key={user.id} user={user} />)}</div></div></div><section className="card card-pad compact-card" style={{ marginTop: 14 }}><div className="section-title">Задачи проекта</div><div className="grid compact-grid" style={{ marginTop: 8 }}>{items.map(item => <button type="button" key={item.id} className={`task-click-card compact-card ${route.itemId === item.id ? 'active' : ''}`} onClick={() => openItem(setRoute, item)}><Badge value={item.status} /><span className="strong">{item.title}</span><small>{fmt(item.start)} → {fmt(item.due)}</small></button>)}</div></section></div></div>;
}
