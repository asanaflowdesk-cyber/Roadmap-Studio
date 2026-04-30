import React from 'react';

export function Avatar({ user, size = 'md' }) {
  if (!user) return <span className={`avatar avatar-${size}`}>?</span>;
  return <span className={`avatar avatar-${size}`} style={{ background: user.color }}>{user.initials}</span>;
}
