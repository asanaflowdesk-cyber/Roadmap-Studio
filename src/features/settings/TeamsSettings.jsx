import React, { useState } from 'react';
import { useApp } from '../../app/AppContext.jsx';
import { Button } from '../../shared/ui/Button.jsx';
import { Avatar } from '../../shared/ui/Avatar.jsx';
import { Badge } from '../../shared/ui/Badge.jsx';

export function TeamsSettings() {
  const { db, createTeam, updateTeam, deleteTeam, setTeamMember, removeTeamMember, hasPermission } = useApp();
  const [name, setName] = useState('');
  const [activeTeamId, setActiveTeamId] = useState(db.teams[0]?.id || null);
  const activeTeam = db.teams.find(team => team.id === activeTeamId);
  const canCreate = hasPermission('team.create');
  const canDelete = activeTeam && hasPermission('team.delete', { teamId: activeTeam.id });
  const canMembers = activeTeam && hasPermission('team.member.add', { teamId: activeTeam.id });
  const canRename = activeTeam && hasPermission('team.settings.rename', { teamId: activeTeam.id });

  function addTeam() {
    if (!name.trim()) return;
    const team = createTeam({ name });
    if (team) {
      setActiveTeamId(team.id);
      setName('');
    }
  }

  return (
    <div className="split templates-settings">
      <aside className="side-list">
        {canCreate ? <div className="card card-pad template-create-card team-create-card"><div className="section-title">Новая команда</div><div className="template-create-inline"><input className="input" placeholder="Название команды" value={name} onChange={e => setName(e.target.value)} /><Button variant="primary" size="sm" onClick={addTeam}>Создать</Button></div></div> : null}
        {db.teams.filter(team => !team.isArchived).map(team => <button key={team.id} className={`side-item ${team.id === activeTeamId ? 'active' : ''}`} onClick={() => setActiveTeamId(team.id)}>{team.name}<div className="small muted">{team.members.filter(member => db.users.find(user => user.id === member.userId)?.platformRole === 'user').length} участников</div></button>)}
      </aside>
      {activeTeam ? <main className="grid compact-grid">
        <section className="card card-pad compact-card">
          <div className="section-title">Команда</div>
          <label className="field"><span className="label">Название</span><input className="input" disabled={!canRename} value={activeTeam.name} onChange={e => updateTeam(activeTeam.id, { name: e.target.value })} /></label>
          {canDelete ? <Button variant="danger" onClick={() => { deleteTeam(activeTeam.id); setActiveTeamId(db.teams.find(team => team.id !== activeTeam.id && !team.isArchived)?.id || null); }}>Архивировать</Button> : null}
        </section>
        <section className="table-card compact-table-card">
          <div className="table-head" style={{ gridTemplateColumns: '1.5fr 1fr 140px' }}><div>Участник</div><div>Роль</div><div>Действия</div></div>
          {activeTeam.members.filter(member => db.users.find(user => user.id === member.userId)?.platformRole === 'user').map(member => {
            const user = db.users.find(item => item.id === member.userId);
            return <div className="table-row" style={{ gridTemplateColumns: '1.5fr 1fr 140px' }} key={member.userId}><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Avatar user={user} /><div><div className="strong">{user?.name}</div><div className="small muted">{user?.email}</div></div></div><div><select className="select" disabled={!hasPermission('team.member.changeRole', { teamId: activeTeam.id })} value={member.role} onChange={e => setTeamMember(activeTeam.id, member.userId, e.target.value)}><option value="member">Участник команды</option><option value="teamLead">Руководитель команды</option></select></div><div>{hasPermission('team.member.remove', { teamId: activeTeam.id }) ? <Button size="sm" variant="danger" onClick={() => removeTeamMember(activeTeam.id, member.userId)}>Убрать</Button> : null}</div></div>;
          })}
        </section>
        {canMembers ? <section className="card card-pad compact-card">
          <div className="section-title">Добавить участника</div>
          <div className="grid compact-pick-grid">
            {db.users.filter(user => user.status !== 'blocked' && user.platformRole === 'user' && !activeTeam.members.some(member => member.userId === user.id)).map(user => <button key={user.id} className="side-item compact-side-item" onClick={() => setTeamMember(activeTeam.id, user.id, 'member')}><Avatar user={user} size="sm" /> <span>{user.name}</span> <Badge value={user.platformRole} /></button>)}
          </div>
        </section> : null}
      </main> : <div className="empty card"><div><strong>Выберите команду</strong></div></div>}
    </div>
  );
}
