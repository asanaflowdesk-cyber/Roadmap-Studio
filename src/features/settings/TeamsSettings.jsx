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
    <div className="split">
      <aside className="side-list">
        {canCreate ? <div className="card card-pad"><label className="field"><span className="label">Новая команда</span><input className="input" value={name} onChange={e => setName(e.target.value)} /></label><Button variant="primary" size="sm" onClick={addTeam}>Создать</Button></div> : null}
        {db.teams.map(team => <button key={team.id} className={`side-item ${team.id === activeTeamId ? 'active' : ''}`} onClick={() => setActiveTeamId(team.id)}>{team.name}</button>)}
      </aside>
      {activeTeam ? <main className="grid">
        <section className="card card-pad">
          <div className="section-title">Команда</div>
          <label className="field"><span className="label">Название</span><input className="input" disabled={!canRename} value={activeTeam.name} onChange={e => updateTeam(activeTeam.id, { name: e.target.value })} /></label>
          {canDelete ? <Button variant="danger" onClick={() => { deleteTeam(activeTeam.id); setActiveTeamId(db.teams.find(team => team.id !== activeTeam.id)?.id || null); }}>Удалить команду</Button> : null}
        </section>
        <section className="table-card">
          <div className="table-head" style={{ gridTemplateColumns: '1.5fr 1fr 160px' }}><div>Участник</div><div>Роль</div><div>Действия</div></div>
          {activeTeam.members.filter(member => db.users.find(user => user.id === member.userId)?.platformRole === 'user').map(member => {
            const user = db.users.find(item => item.id === member.userId);
            return <div className="table-row" style={{ gridTemplateColumns: '1.5fr 1fr 160px' }} key={member.userId}><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Avatar user={user} /><div><div className="strong">{user?.name}</div><div className="small muted">{user?.email}</div></div></div><div><select className="select" disabled={!hasPermission('team.member.changeRole', { teamId: activeTeam.id })} value={member.role} onChange={e => setTeamMember(activeTeam.id, member.userId, e.target.value)}><option value="member">Участник команды</option><option value="teamLead">Руководитель команды</option></select></div><div>{hasPermission('team.member.remove', { teamId: activeTeam.id }) ? <Button size="sm" variant="danger" onClick={() => removeTeamMember(activeTeam.id, member.userId)}>Удалить</Button> : null}</div></div>;
          })}
        </section>
        {canMembers ? <section className="card card-pad">
          <div className="section-title">Добавить участника</div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))' }}>
            {db.users.filter(user => user.status !== 'blocked' && user.platformRole === 'user' && !activeTeam.members.some(member => member.userId === user.id)).map(user => <button key={user.id} className="side-item" onClick={() => setTeamMember(activeTeam.id, user.id, 'member')}><Avatar user={user} size="sm" /> {user.name} <Badge value={user.platformRole} /></button>)}
          </div>
        </section> : null}
      </main> : <div className="empty card"><div><strong>Выберите команду</strong></div></div>}
    </div>
  );
}
