'use client';

import { useState } from 'react';
import Modal from './Modal';

interface ConfirmDeleteModalProps {
  title: string;
  itemName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function ConfirmDeleteModal({
  title,
  itemName,
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  async function handleConfirm() {
    setError('');
    setIsDeleting(true);
    try {
      await onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <p>
        Are you sure you want to delete <strong>{itemName}</strong>? This action cannot be
        undone.
      </p>

      {error && <p style={{ color: 'var(--color-danger)', marginTop: 12 }}>{error}</p>}

      <div className="modal-actions">
        <button className="btn-danger" onClick={handleConfirm} disabled={isDeleting}>
          {isDeleting ? 'Deleting...' : 'Yes, delete'}
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
}
