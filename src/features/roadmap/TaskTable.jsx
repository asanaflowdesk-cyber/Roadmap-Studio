import React from 'react';
import { useApp } from '../../app/AppContext.jsx';
import { Badge } from '../../shared/ui/Badge.jsx';
import { Avatar } from '../../shared/ui/Avatar.jsx';
import { fmt, daysBetween } from '../../shared/utils/date.js';

function typeDot(item) {
  if (item.status === 'done') return 'dot-done';
  if (item.type === 'risk') return 'dot-risk';
  if (item.type === 'milestone') return 'dot-milestone';
  return '';
}

function phaseStats(items) {
  const total = items.length;
  const done = items.filter(item => item.status === 'done').length;
  const risks = items.filter(item => item.type === 'risk' || item.status === 'risk').length;
  const milestones = items.filter(item => item.type === 'milestone').length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  return { total, done, risks, milestones, pct };
}

export function TaskTable({ project, phases, items }) {
  const { db, route, setRoute } = useApp();
  const activePhaseId = route.phaseId || phases[0]?.id || null;
  const phaseView = route.phaseView || 'selected';
  const visiblePhases = phaseView === 'all' ? phases : phases.filter(phase => phase.id === activePhaseId);
  const search = String(route.search || '').toLowerCase();
  const collapsed = route.collapsedPhases || {};

  function setPhase(phaseId) {
    setRoute(prev => ({ ...prev, phaseId, phaseView: 'selected' }));
  }

  function togglePhase(phaseId) {
    setRoute(prev => ({
      ...prev,
      collapsedPhases: { ...(prev.collapsedPhases || {}), [phaseId]: !prev.collapsedPhases?.[phaseId] }
    }));
  }

  return (
    <div className="project-main">
      <aside className="phase-rail">
        <div className="eyebrow" style={{ marginBottom: 8 }}>Фазы проекта</div>
        <div className="toggle">
          <button className={phaseView === 'selected' ? 'active' : ''} onClick={() => setRoute(prev => ({ ...prev, phaseView: 'selected' }))}>Одна</button>
          <button className={phaseView === 'all' ? 'active' : ''} onClick={() => setRoute(prev => ({ ...prev, phaseView: 'all' }))}>Все</button>
        </div>
        {phases.map((phase, index) => {
          const phaseItems = items.filter(item => item.phaseId === phase.id);
          const stats = phaseStats(phaseItems);
          return (
            <button key={phase.id} className={`phase-card ${activePhaseId === phase.id ? 'active' : ''}`} onClick={() => setPhase(phase.id)}>
              <div className="phase-card-title">Фаза {index + 1} · {phase.title}</div>
              <div className="small muted">{stats.total} задач · {stats.pct}% готово</div>
            </button>
          );
        })}
      </aside>
      <section className="task-area">
        <div className="task-head">
          <div>Ключевые задачи и вехи</div>
          <div>Результат (Deliverable)</div>
          <div>Длительность</div>
          <div>Участники</div>
          <div>Статус</div>
        </div>
        {visiblePhases.map((phase) => {
          const index = phases.findIndex(entry => entry.id === phase.id);
          const allPhaseItems = items.filter(item => item.phaseId === phase.id);
          const phaseItems = allPhaseItems.filter(item => !search || `${item.title} ${item.result} ${item.desc}`.toLowerCase().includes(search));
          const stats = phaseStats(allPhaseItems);
          const isCollapsed = Boolean(collapsed[phase.id]);
          return (
            <div className="phase-section" key={phase.id}>
              <button className="phase-accordion-head" onClick={() => togglePhase(phase.id)}>
                <span className="phase-chevron">{isCollapsed ? '›' : '⌄'}</span>
                <span className="phase-title">Фаза {index + 1} · {phase.title}</span>
                <span className="phase-meta">{stats.total} задач · {stats.milestones} вех · {stats.risks} рисков · {stats.pct}%</span>
              </button>
              {!isCollapsed ? (
                <>
                  {phaseItems.map(item => {
                    const owner = db.users.find(user => user.id === item.ownerId && user.platformRole === 'user');
                    const people = [owner, ...(item.people || []).map(id => db.users.find(user => user.id === id && user.platformRole === 'user'))].filter(Boolean);
                    return (
                      <div key={item.id} className={`task-row ${route.itemId === item.id ? 'active' : ''}`} onClick={() => setRoute(prev => ({ ...prev, itemId: item.id }))}>
                        <div className="task-name"><span className={`dot ${typeDot(item)}`} /><div><div className="strong truncate">{item.title}</div><div className="small muted truncate">{item.type === 'milestone' ? 'Веха' : item.type === 'risk' ? 'Риск' : 'Задача'} · {fmt(item.start)} → {fmt(item.due)}</div></div></div>
                        <div className="small muted">{item.result || '—'}</div>
                        <div className="small strong">{daysBetween(item.start, item.due)} дн.</div>
                        <div style={{ display: 'flex' }}>{people.slice(0, 3).map(user => <Avatar key={user.id} user={user} size="sm" />)}</div>
                        <div><Badge value={item.status} /></div>
                      </div>
                    );
                  })}
                  {!phaseItems.length ? <div className="empty" style={{ minHeight: 90 }}><div><strong>Нет задач</strong><span>В этой фазе пока пусто.</span></div></div> : null}
                </>
              ) : null}
            </div>
          );
        })}
      </section>
    </div>
  );
}
