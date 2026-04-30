import React from 'react';
import { useApp } from '../../app/AppContext.jsx';
import { Button } from '../../shared/ui/Button.jsx';

export function ArchiveSettings() {
  const { db, restoreArchive, hasPermission } = useApp();
  const canRestore = hasPermission('system.archive.restore');
  const items = db.archive || [];
  return <div className="table-card">
    <div className="table-head" style={{ gridTemplateColumns: '120px minmax(0,1fr) 140px 120px' }}><div>Тип</div><div>Название</div><div>Дата</div><div></div></div>
    {!items.length ? <div className="empty-mini">Архив пока пуст.</div> : items.map(item => <div key={item.id} className="table-row" style={{ gridTemplateColumns: '120px minmax(0,1fr) 140px 120px' }}>
      <div>{item.entityType}</div><div className="strong">{item.title}</div><div>{item.archivedAt}</div><div>{canRestore ? <Button size="sm" onClick={() => restoreArchive(item.id)}>Восстановить</Button> : null}</div>
    </div>)}
  </div>;
}
