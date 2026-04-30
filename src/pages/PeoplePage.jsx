import React from 'react';
import { useApp } from '../app/AppContext.jsx';
import { Avatar } from '../shared/ui/Avatar.jsx';
import { Badge } from '../shared/ui/Badge.jsx';

export function PeoplePage() {
  const { db, visibleTeams } = useApp();
  const teams = visibleTeams();

  return (
    <div className="page">
      <div className="page-narrow">
        <div className="page-head"><div><div className="eyebrow">Люди</div><h1 className="h1">Команды и участники</h1><div className="subtitle">Показываются команды, доступные вашей роли.</div></div></div>
        <div className="grid">
          {teams.map(team => <section className="table-card" key={team.id}>
            <div className="table-head" style={{ gridTemplateColumns: '1.6fr 1fr 1fr' }}><div>{team.name}</div><div>Проектов</div><div>Роль</div></div>
            {team.members.map(member => {
              const user = db.users.find(item => item.id === member.userId);
              const count = db.projects.filter(project => project.teamId === team.id && project.access.some(entry => entry.userId === member.userId)).length;
              return <div className="table-row" style={{ gridTemplateColumns: '1.6fr 1fr 1fr' }} key={member.userId}><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Avatar user={user} /><div><div className="strong">{user?.name}</div><div className="small muted">{user?.email}</div></div></div><div>{count}</div><div><Badge value={member.role} /></div></div>;
            })}
          </section>)}
        </div>
      </div>
    </div>
  );
}
