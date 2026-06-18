const { createRepository } = require('../db/repository');
const { Shipment, now } = require('../models');

const repo = createRepository('shipments');

async function createShipment(orderId, { carrier, tracking_number }) {
  const shipment = Shipment({
    order_id: orderId,
    carrier: carrier || 'Swiss Post',
    tracking_number: tracking_number || `TL${Date.now().toString().slice(-9)}`,
    status: 'label_created',
    events: [{ status: 'label_created', at: now(), note: 'Versandlabel erstellt' }],
  });
  await repo.insert(shipment);
  return shipment;
}

async function addTrackingEvent(shipmentId, { status, note }) {
  const shipment = await repo.find(shipmentId);
  if (!shipment) return null;
  const events = [...shipment.events, { status, at: now(), note: note || '' }];
  return repo.update(shipmentId, { status, events });
}

async function getShipment(id) {
  return repo.find(id);
}

/** Admin-Übersicht: alle Lieferungen. */
async function listAll() {
  return repo.all();
}

module.exports = { createShipment, addTrackingEvent, getShipment, listAll };
