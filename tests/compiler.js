module.exports = process.env.NODENES_COVERAGE ? require('../lib-cov/compiler') : require('../lib/compiler');
