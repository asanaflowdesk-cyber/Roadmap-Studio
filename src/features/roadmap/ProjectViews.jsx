import React, { useMemo, useState } from 'react';
import { useApp } from '../../app/AppContext.jsx';
import { Badge } from '../../shared/ui/Badge.jsx';
import { fmt, daysBetween } from '../../shared/utils/date.js';
import { Avatar } from '../../shared/ui/Avatar.jsx';
import { Button } from '../../shared/ui/Button.jsx';

const statuses = [['new', 'Не начато'], ['progress', 'В работе'], ['approval', 'Согласование'], ['risk', 'Риски'], ['done', 'Готово']];
const DAY = 86400000;
const SCALE_OPTIONS = [
  ['day', 'День'],
  ['week', 'Неделя'],
  ['decade', 'Декада'],
  ['month', 'Месяц'],
  ['quarter', 'Квартал'],
  ['year', 'Год']
];
const SCALE_DAYS = { day: 1, week: 7, decade: 10, month: 30, quarter: 91, year: 365 };
const SCALE_WIDTH = { day: 18, week: 34, decade: 42, month: 54, quarter: 66, year: 74 };

function toISO(date) {
  return date.toISOString().slice(0, 10);
}

function toTime(value) {
  if (!value) return null;
  const time = new Date(`${value}T00:00:00`).getTime();
  return Number.isFinite(time) ? time : null;
}

function safeDate(value = null) {
  const date = value ? new Date(`${value}T00:00:00`) : new Date();
  return Number.isFinite(date.getTime()) ? date : new Date();
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function startOfWeek(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

function endOfWeek(date) {
  const d = startOfWeek(date);
  d.setDate(d.getDate() + 6);
  return d;
}

function monthLabel(date) {
  return date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
}

function quarterLabel(date) {
  return `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`;
}

function periodLabel(date, scale) {
  if (scale === 'day') return String(date.getDate());
  if (scale === 'week') return `${date.getDate()}.${date.getMonth() + 1}`;
  if (scale === 'decade') return `${date.getDate()}.${date.getMonth() + 1}`;
  if (scale === 'month') return date.toLocaleDateString('ru-RU', { month: 'short' });
  if (scale === 'quarter') return quarterLabel(date);
  return String(date.getFullYear());
}

function periodGroupLabel(date, scale) {
  if (scale === 'day' || scale === 'week' || scale === 'decade') return monthLabel(date);
  if (scale === 'month') return String(date.getFullYear());
  if (scale === 'quarter') return String(date.getFullYear());
  return 'Годы';
}

function openItem(setRoute, item) {
  setRoute(prev => ({ ...prev, itemId: item.id, phaseId: item.phaseId }));
}

function datesForItem(item) {
  const start = toTime(item.start || item.due);
  const due = toTime(item.due || item.start);
  if (!Number.isFinite(start) || !Number.isFinite(due)) return [];
  const a = Math.min(start, due);
  const b = Math.max(start, due);
  const result = [];
  for (let t = a; t <= b; t += DAY) result.push(toISO(new Date(t)));
  return result;
}

function itemMatchesDate(item, iso) {
  return datesForItem(item).includes(iso);
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
  const [collapsed, setCollapsed] = useState({});
  const [scale, setScale] = useState('week');

  const projectTimes = [toTime(project?.start), toTime(project?.due)].filter(Number.isFinite);
  const itemTimes = items.flatMap(item => [toTime(item.start), toTime(item.due)]).filter(Number.isFinite);
  const rangeSource = projectTimes.length >= 2 ? projectTimes : itemTimes;
  const fallback = toTime(new Date().toISOString().slice(0, 10));
  const min = rangeSource.length ? Math.min(...rangeSource) : fallback;
  const max = rangeSource.length ? Math.max(...rangeSource) : fallback + 14 * DAY;
  const totalDays = Math.max(1, Math.round((max - min) / DAY) + 1);

  const requestedUnitDays = SCALE_DAYS[scale] || 7;
  const safeScale = scale === 'day' && totalDays > 1200 ? 'week' : scale;
  const unitDays = SCALE_DAYS[safeScale] || requestedUnitDays;
  const periodCount = Math.max(1, Math.ceil(totalDays / unitDays));
  const periodWidth = SCALE_WIDTH[safeScale] || 34;

  const periods = useMemo(() => Array.from({ length: periodCount }, (_, index) => {
    const date = addDays(new Date(min), index * unitDays);
    const iso = toISO(date);
    return { date, iso, label: periodLabel(date, safeScale), group: periodGroupLabel(date, safeScale) };
  }), [min, periodCount, safeScale, unitDays]);

  const groups = [];
  periods.forEach((period, index) => {
    const last = groups[groups.length - 1];
    if (last?.label === period.group) last.span += 1;
    else groups.push({ label: period.group, start: index + 1, span: 1 });
  });

  function periodIndex(value) {
    const time = toTime(value);
    if (!Number.isFinite(time)) return 1;
    const offset = Math.max(0, Math.round((time - min) / DAY));
    return Math.max(1, Math.min(periodCount, Math.floor(offset / unitDays) + 1));
  }

  function position(item) {
    const left = periodIndex(item.start || item.due);
    const right = periodIndex(item.due || item.start);
    const startCol = Math.min(left, right);
    const span = Math.max(1, Math.abs(right - left) + 1);
    return { gridColumn: `${startCol} / span ${span}` };
  }

  return (
    <div className="gantt-page">
      <div className="gantt-card gantt-compact-card">
        <div className="gantt-titlebar compact-card gantt-toolbar-titlebar">
          <div>
            <h1>{project?.title || 'Гант'}</h1>
            <p>Диапазон проекта: {fmt(toISO(new Date(min)))} → {fmt(toISO(new Date(max)))} · {totalDays} дн.</p>
          </div>
          <div className="view-scale-toolbar">
            <label className="field scale-field"><span className="label">Масштаб</span><select className="select" value={scale} onChange={event => setScale(event.target.value)}>{SCALE_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            {safeScale !== scale ? <span className="badge badge-risk">сжато до недель</span> : null}
          </div>
        </div>
        <div className="gantt-grid gantt-fine-grid" style={{ '--day-count': periodCount, '--gantt-unit-width': `${periodWidth}px` }}>
          <div className="gantt-left gantt-corner">Задачи</div>
          <div className="gantt-months">{groups.map(group => <div key={`${group.label}-${group.start}`} style={{ gridColumn: `${group.start} / span ${group.span}` }}>{group.label}</div>)}</div>
          <div className="gantt-left gantt-days-label" />
          <div className="gantt-days">{periods.map(period => <div key={period.iso}><span>{period.label}</span></div>)}</div>

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
                <div className="gantt-phase-line" />
                {!isCollapsed && phaseItems.map(item => (
                  <React.Fragment key={item.id}>
                    <button className="gantt-left gantt-task-title" onClick={() => openItem(setRoute, item)}><span className={`dot ${item.type === 'risk' ? 'dot-risk' : item.type === 'milestone' ? 'dot-milestone' : item.status === 'done' ? 'dot-done' : ''}`} /><span>{item.title}</span></button>
                    <div className="gantt-track"><div className={`gantt-task-bar gantt-task-${item.type} ${item.status === 'done' ? 'done' : ''}`} style={position(item)} title={`${item.title}: ${fmt(item.start)} → ${fmt(item.due)}`}><span>{safeScale === 'day' ? `${daysBetween(item.start, item.due)} дн.` : item.status === 'done' ? 'готово' : ''}</span></div></div>
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

function makeCalendarRange(anchorDate, scale) {
  const anchor = new Date(anchorDate);
  if (scale === 'day') return { start: anchor, end: anchor, columns: 1, title: anchor.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) };
  if (scale === 'week') {
    const start = startOfWeek(anchor);
    const end = endOfWeek(anchor);
    return { start, end, columns: 7, title: `${fmt(toISO(start))} — ${fmt(toISO(end))}` };
  }
  if (scale === 'decade') {
    const start = anchor;
    const end = addDays(anchor, 9);
    return { start, end, columns: 10, title: `${fmt(toISO(start))} — ${fmt(toISO(end))}` };
  }
  if (scale === 'quarter') {
    const qStartMonth = Math.floor(anchor.getMonth() / 3) * 3;
    const start = new Date(anchor.getFullYear(), qStartMonth, 1);
    const end = new Date(anchor.getFullYear(), qStartMonth + 3, 0);
    return { start: startOfWeek(start), end: endOfWeek(end), columns: 7, title: quarterLabel(anchor) };
  }
  if (scale === 'year') {
    const start = new Date(anchor.getFullYear(), 0, 1);
    const end = new Date(anchor.getFullYear(), 11, 31);
    return { start, end, columns: 12, title: String(anchor.getFullYear()) };
  }
  const monthStart = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const monthEnd = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
  return { start: startOfWeek(monthStart), end: endOfWeek(monthEnd), columns: 7, title: monthLabel(anchor) };
}

export function CalendarView({ items }) {
  const { setRoute, route } = useApp();
  const [scale, setScale] = useState('month');
  const [selectedDate, setSelectedDate] = useState(() => toISO(new Date()));
  const anchor = safeDate(selectedDate);
  const todayIso = toISO(new Date());
  const range = makeCalendarRange(anchor, scale);

  const byDate = items.reduce((acc, item) => {
    datesForItem(item).forEach(key => (acc[key] ||= []).push(item));
    return acc;
  }, {});

  const days = [];
  for (let d = new Date(range.start); d <= range.end; d = addDays(d, 1)) days.push(new Date(d));

  const visibleCount = scale === 'year'
    ? items.filter(item => datesForItem(item).some(iso => iso.slice(0, 4) === String(anchor.getFullYear()))).length
    : days.reduce((sum, day) => sum + (byDate[toISO(day)] || []).length, 0);

  function shift(step) {
    if (scale === 'day') setSelectedDate(toISO(addDays(anchor, step)));
    else if (scale === 'week') setSelectedDate(toISO(addDays(anchor, step * 7)));
    else if (scale === 'decade') setSelectedDate(toISO(addDays(anchor, step * 10)));
    else if (scale === 'quarter') setSelectedDate(toISO(addMonths(anchor, step * 3)));
    else if (scale === 'year') setSelectedDate(toISO(addMonths(anchor, step * 12)));
    else setSelectedDate(toISO(addMonths(anchor, step)));
  }

  function monthItems(monthIndex) {
    return items.filter(item => datesForItem(item).some(iso => {
      const date = safeDate(iso);
      return date.getFullYear() === anchor.getFullYear() && date.getMonth() === monthIndex;
    }));
  }

  return <div className="page calendar-page"><div className="calendar-card card compact-card"><div className="calendar-head"><Button size="sm" variant="ghost" onClick={() => shift(-1)}>‹</Button><div><div className="calendar-head-title">{range.title}</div><div className="small muted">Сегодня: {fmt(todayIso)} · задач в выбранном диапазоне: {visibleCount}</div></div><div className="calendar-head-actions view-scale-toolbar"><label className="field scale-field"><span className="label">Дата</span><input className="input" type="date" value={selectedDate} onChange={event => setSelectedDate(event.target.value)} /></label><label className="field scale-field"><span className="label">Масштаб</span><select className="select" value={scale} onChange={event => setScale(event.target.value)}>{SCALE_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><Button size="sm" variant="ghost" onClick={() => setSelectedDate(toISO(new Date()))}>Сегодня</Button><Button size="sm" variant="ghost" onClick={() => shift(1)}>›</Button></div></div>{scale === 'year' ? <div className="calendar-year-grid">{Array.from({ length: 12 }, (_, month) => {
    const list = monthItems(month);
    return <section className="calendar-month-card" key={month}><div className="calendar-month-title">{new Date(anchor.getFullYear(), month, 1).toLocaleDateString('ru-RU', { month: 'long' })}<span>{list.length}</span></div><div className="calendar-list">{list.slice(0, 5).map(item => <button type="button" key={`${month}-${item.id}`} className={`calendar-item status-${item.status} ${route.itemId === item.id ? 'active' : ''}`} onClick={() => openItem(setRoute, item)}>{item.title}</button>)}{list.length > 5 ? <div className="calendar-more">+{list.length - 5} ещё</div> : null}</div></section>;
  })}</div> : <><div className="calendar-weekdays" style={{ gridTemplateColumns: `repeat(${range.columns}, 1fr)` }}>{days.slice(0, range.columns).map(day => <div key={`head-${toISO(day)}`}>{range.columns === 7 ? ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'][((day.getDay() + 6) % 7)] : fmt(toISO(day))}</div>)}</div><div className="calendar-grid" style={{ gridTemplateColumns: `repeat(${range.columns}, 1fr)` }}>{days.map(day => {
    const key = toISO(day);
    const dayItems = byDate[key] || [];
    const isToday = key === todayIso;
    const inMainPeriod = scale === 'month' ? day.getMonth() === anchor.getMonth() : true;
    return <div key={key} className={`calendar-cell calendar-cell-${scale} ${isToday ? 'today' : ''} ${inMainPeriod ? '' : 'muted-month'}`}><div className="calendar-date">{day.getDate()}</div><div className="calendar-list">{dayItems.slice(0, scale === 'day' ? 12 : 4).map(item => <button type="button" key={`${key}-${item.id}`} className={`calendar-item status-${item.status} ${route.itemId === item.id ? 'active' : ''}`} onClick={() => openItem(setRoute, item)}>{item.title}</button>)}{dayItems.length > (scale === 'day' ? 12 : 4) ? <div className="calendar-more">+{dayItems.length - (scale === 'day' ? 12 : 4)} ещё</div> : null}</div></div>;
  })}</div></>}{visibleCount === 0 && items.length > 0 ? <div className="calendar-empty-note">В выбранном диапазоне задач нет. Выберите дату вручную или смените масштаб.</div> : null}</div></div>;
}

export function AnalyticsView({ project, items, db }) {
  const { setRoute, route } = useApp();
  const total = items.length || 1;
  const done = items.filter(item => item.status === 'done').length;
  const risks = items.filter(item => item.status === 'risk' || item.type === 'risk').length;
  const assigned = [...new Set(items.flatMap(item => [item.ownerId, ...(item.people || [])]))].map(id => db.users.find(user => user.id === id && user.platformRole === 'user')).filter(Boolean);
  return <div className="page"><div className="page-narrow"><div className="page-head"><div><div className="eyebrow">Аналитика</div><h1 className="h1">{project.title}</h1></div></div><div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))' }}><div className="card card-pad compact-card"><div className="eyebrow">Всего задач</div><div className="h1">{items.length}</div></div><div className="card card-pad compact-card"><div className="eyebrow">Выполнено</div><div className="h1">{Math.round(done / total * 100)}%</div></div><div className="card card-pad compact-card"><div className="eyebrow">Риски</div><div className="h1">{risks}</div></div><div className="card card-pad compact-card"><div className="eyebrow">Участники</div><div style={{ display: 'flex', marginTop: 10 }}>{assigned.map(user => <Avatar key={user.id} user={user} />)}</div></div></div><section className="card card-pad compact-card" style={{ marginTop: 14 }}><div className="section-title">Задачи проекта</div><div className="grid compact-grid" style={{ marginTop: 8 }}>{items.map(item => <button type="button" key={item.id} className={`task-click-card compact-card ${route.itemId === item.id ? 'active' : ''}`} onClick={() => openItem(setRoute, item)}><Badge value={item.status} /><span className="strong">{item.title}</span><small>{fmt(item.start)} → {fmt(item.due)}</small></button>)}</div></section></div></div>;
}
