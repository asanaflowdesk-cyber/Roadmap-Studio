import React from 'react';

export function Modal({ title, open, onClose, children, footer }) {
  if (!open) return null;
  return (
    <div className="modal-bg" onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}>
      <section className="modal" onMouseDown={(event) => event.stopPropagation()}>
        <header className="modal-header">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose}>×</button>
        </header>
        <div className="modal-body">{children}</div>
        {footer ? <footer className="modal-footer">{footer}</footer> : null}
      </section>
    </div>
  );
}
