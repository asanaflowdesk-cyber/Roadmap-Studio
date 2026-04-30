import React from 'react';

const labels = {
  new: 'Не начато',
  progress: 'В работе',
  approval: 'Согласование',
  risk: 'Риск',
  done: 'Готово',
  task: 'Задача',
  milestone: 'Веха',
  guest: 'Гость',
  member: 'Участник',
  projectManager: 'Менеджер',
  teamLead: 'Руководитель',
  admin: 'Админ',
  superadmin: 'Суперадмин'
};

export function Badge({ value, children }) {
  return <span className={`badge badge-${value}`}>{children || labels[value] || value}</span>;
}
