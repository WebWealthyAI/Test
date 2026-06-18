// Mapping von Order-/Treuhand-Status auf Label + Farbe für die UI.
export const ORDER_STATUS_META = {
  pending_payment: { label: 'Zahlung ausstehend', color: '#6B7280' },
  funds_held: { label: 'Geld im Treuhand blockiert', color: '#F59E0B' },
  processing: { label: 'In Bearbeitung', color: '#3B82F6' },
  shipped: { label: 'Versendet', color: '#6366F1' },
  delivered: { label: 'Geliefert', color: '#8B5CF6' },
  completed: { label: 'Abgeschlossen – Geld freigegeben', color: '#10B981' },
  disputed: { label: 'Streitfall', color: '#EF4444' },
  refunded: { label: 'Erstattet', color: '#EF4444' },
  cancelled: { label: 'Storniert', color: '#9CA3AF' },
};

export const OFFER_STATUS_META = {
  pending: { label: 'Offen', color: '#F59E0B' },
  countered: { label: 'Gegenvorschlag', color: '#6366F1' },
  accepted: { label: 'Akzeptiert', color: '#10B981' },
  rejected: { label: 'Abgelehnt', color: '#EF4444' },
  expired: { label: 'Abgelaufen', color: '#9CA3AF' },
};

export function chf(amount) {
  return `CHF ${Number(amount || 0).toFixed(2)}`;
}
