const { createRepository } = require('../db/repository');
const { Report } = require('../models');

const repo = createRepository('reports');

async function create(data) {
  const report = Report(data);
  await repo.insert(report);
  return report;
}

async function list(filter = {}) {
  return repo.all(filter);
}

async function resolve(id) {
  return repo.update(id, { resolved: true });
}

module.exports = { create, list, resolve };
