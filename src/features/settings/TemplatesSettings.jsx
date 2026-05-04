import React, { useMemo, useState } from 'react';
import { useApp } from '../../app/AppContext.jsx';
import { Button } from '../../shared/ui/Button.jsx';

export function TemplatesSettings() {
  const { db, createTemplate, updateTemplate, archiveTemplate, createTemplatePhase, updateTemplatePhase, createTemplateItem, updateTemplateItem, hasPermission } = useApp();
  const templates = (db.projectTemplates || []).filter(t => !t.isArchived);
  const [selectedId, setSelectedId] = useState(templates[0]?.id || null);
  const [newTemplateTitle, setNewTemplateTitle] = useState('');
  const template = templates.find(t => t.id === selectedId) || templates[0];
  const canCreate = hasPermission('template.create');
  const canUpdate = template ? hasPermission('template.update', { teamId: template.teamId }) : false;
  const phases = useMemo(() => template ? (db.templatePhases || []).filter(p => p.templateId === template.id).sort((a, b) => a.sort - b.sort) : [], [db, template?.id]);
  const items = useMemo(() => template ? (db.templateItems || []).filter(i => i.templateId === template.id).sort((a, b) => a.sort - b.sort) : [], [db, template?.id]);

  function addTemplate() {
    if (!newTemplateTitle.trim()) return;
    const created = createTemplate({ title: newTemplateTitle, desc: 'Новый шаблон проекта', category: 'General' });
    if (created) {
      setNewTemplateTitle('');
      setSelectedId(created.id);
    }
  }

  function addPhase() {
    if (!template) return;
    const title = prompt('Название фазы шаблона');
    if (title) createTemplatePhase(template.id, { title, durationDays: 5 });
  }

  function addItem(phaseId) {
    if (!template) return;
    const title = prompt('Название задачи/вехи в шаблоне');
    if (title) createTemplateItem(template.id, { templatePhaseId: phaseId, title, result: '', relativeStartDay: 0, relativeDueDay: 3 });
  }

  return <div className="split templates-settings">
    <aside className="side-list">
      <div className="card card-pad template-create-card">
        <div className="section-title">Новый шаблон</div>
        {canCreate ? <div className="template-create-inline"><input className="input" placeholder="Название шаблона" value={newTemplateTitle} onChange={e => setNewTemplateTitle(e.target.value)} /><Button size="sm" variant="primary" onClick={addTemplate}>Создать</Button></div> : null}
      </div>
      {templates.map(t => <button key={t.id} className={`side-item ${template?.id === t.id ? 'active' : ''}`} onClick={() => setSelectedId(t.id)}>
        {t.title}<div className="small muted">v{t.version} · {t.category}</div>
      </button>)}
    </aside>
    <main className="grid">
      {!template ? <div className="empty card"><div><strong>Шаблонов пока нет</strong><span>Создавать и редактировать их могут суперадмин, админ и руководитель команды.</span></div></div> : <>
        <div className="card card-pad">
          <div className="page-head" style={{ marginBottom: 10 }}>
            <div><div className="eyebrow">Template Engine</div><h2 className="h1" style={{ fontSize: 26 }}>{template.title}</h2><div className="subtitle">Изменения шаблона сохраняются как новая версия. Уже созданные проекты не ломаются.</div></div>
            {hasPermission('template.archive', { teamId: template.teamId }) ? <Button variant="danger" onClick={() => archiveTemplate(template.id)}>Архивировать</Button> : null}
          </div>
          <div className="form-grid">
            <label className="field"><span className="label">Название</span><input disabled={!canUpdate} className="input" value={template.title} onChange={e => updateTemplate(template.id, { title: e.target.value }, 'Название шаблона изменено')} /></label>
            <label className="field"><span className="label">Категория</span><input disabled={!canUpdate} className="input" value={template.category || ''} onChange={e => updateTemplate(template.id, { category: e.target.value }, 'Категория шаблона изменена')} /></label>
          </div>
          <label className="field"><span className="label">Описание</span><textarea disabled={!canUpdate} className="textarea" value={template.desc || ''} onChange={e => updateTemplate(template.id, { desc: e.target.value }, 'Описание шаблона изменено')} /></label>
        </div>

        <div className="card card-pad">
          <div className="flex-line"><div><div className="section-title">Фазы и типовые задачи</div><div className="small muted">Сроки хранятся относительно даты старта проекта.</div></div>{canUpdate ? <Button size="sm" onClick={addPhase}>+ Фаза шаблона</Button> : null}</div>
          {phases.map(phase => <div key={phase.id} className="template-phase">
            <div className="template-phase-head">
              <input disabled={!canUpdate} className="input" value={phase.title} onChange={e => updateTemplatePhase(phase.id, { title: e.target.value })} />
              <input disabled={!canUpdate} className="input" type="number" value={phase.durationDays} onChange={e => updateTemplatePhase(phase.id, { durationDays: Number(e.target.value) })} />
              {canUpdate ? <Button size="sm" onClick={() => addItem(phase.id)}>+ Задача</Button> : null}
            </div>
            <div className="table-card">
              <div className="table-head" style={{ gridTemplateColumns: '120px minmax(0,1fr) 1fr 90px 90px' }}><div>Тип</div><div>Задача</div><div>Deliverable</div><div>Старт +</div><div>Срок +</div></div>
              {items.filter(item => item.templatePhaseId === phase.id).map(item => <div key={item.id} className="table-row" style={{ gridTemplateColumns: '120px minmax(0,1fr) 1fr 90px 90px' }}>
                <select disabled={!canUpdate} className="select" value={item.type} onChange={e => updateTemplateItem(item.id, { type: e.target.value })}><option value="task">Задача</option><option value="milestone">Веха</option><option value="risk">Риск</option></select>
                <input disabled={!canUpdate} className="input" value={item.title} onChange={e => updateTemplateItem(item.id, { title: e.target.value })} />
                <input disabled={!canUpdate} className="input" value={item.result || ''} onChange={e => updateTemplateItem(item.id, { result: e.target.value })} />
                <input disabled={!canUpdate} className="input" type="number" value={item.relativeStartDay} onChange={e => updateTemplateItem(item.id, { relativeStartDay: Number(e.target.value) })} />
                <input disabled={!canUpdate} className="input" type="number" value={item.relativeDueDay} onChange={e => updateTemplateItem(item.id, { relativeDueDay: Number(e.target.value) })} />
              </div>)}
            </div>
          </div>)}
        </div>

        <div className="card card-pad"><div className="section-title">Версии</div>
          <div className="table-card">
            <div className="table-head" style={{ gridTemplateColumns: '90px 140px 180px minmax(0,1fr)' }}><div>Версия</div><div>Дата</div><div>Кто</div><div>Комментарий</div></div>
            {(db.templateVersions || []).filter(v => v.templateId === template.id).slice().reverse().map(v => <div key={v.id} className="table-row" style={{ gridTemplateColumns: '90px 140px 180px minmax(0,1fr)' }}><div>v{v.version}</div><div>{v.date}</div><div>{db.users.find(u => u.id === v.changedBy)?.name || v.changedBy}</div><div>{v.changeComment}</div></div>)}
          </div>
        </div>
      </>}
    </main>
  </div>;
}
