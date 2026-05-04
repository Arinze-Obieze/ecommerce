"use client";
import Modal from "./Modal";
import Button from "./Button";

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      {message && (
        <p className="mb-5 text-sm text-(--zova-text-body)">{message}</p>
      )}
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>{cancelLabel}</Button>
        <Button variant={danger ? "danger" : "primary"} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}
