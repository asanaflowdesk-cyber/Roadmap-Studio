import React from 'react';
import { useApp } from '../../app/AppContext.jsx';

export function DictionariesSettings() {
  const { db, updateDictionaryItem, hasPermission } = useApp();
  const canEdit = hasPermission('dictionary.manage');
  return <div className="grid">
    {(db.dictionaries || []).map(dictionary => {
      const items = (db.dictionaryItems || []).filter(item => item.dictionaryId === dictionary.id).sort((a, b) => a.sort - b.sort);
      return <div key={dictionary.id} className="card card-pad">
        <div className="section-title">{dictionary.title}</div>
        <div className="table-card">
          <div className="table-head" style={{ gridTemplateColumns: '120px minmax(0,1fr) 90px 90px' }}><div>Код</div><div>Название</div><div>Порядок</div><div>Активен</div></div>
          {items.map(item => <div key={item.id} className="table-row" style={{ gridTemplateColumns: '120px minmax(0,1fr) 90px 90px' }}>
            <div>{item.code}</div>
            <input disabled={!canEdit} className="input" value={item.title} onChange={e => updateDictionaryItem(item.id, { title: e.target.value })} />
            <input disabled={!canEdit} className="input" type="number" value={item.sort} onChange={e => updateDictionaryItem(item.id, { sort: Number(e.target.value) })} />
            <input disabled={!canEdit} type="checkbox" checked={Boolean(item.isActive)} onChange={e => updateDictionaryItem(item.id, { isActive: e.target.checked })} />
          </div>)}
        </div>
      </div>;
    })}
  </div>;
}
