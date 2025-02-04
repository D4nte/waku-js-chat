const config = {
  extension: ['ts'],
  spec: 'src/**/*.spec.ts',
  require: ['ts-node/register', 'isomorphic-fetch'],
  loader: 'ts-node/esm',
  'node-option': [
    'experimental-specifier-resolution=node',
    'loader=ts-node/esm'
  ],
  exit: true,
  retries: 4
};

if (process.env.CI) {
  console.log("Running tests in parallel");
  config.parallel = true;
  config.jobs = 6;
  console.log("Activating allure reporting");
  config.reporter = 'mocha-multi-reporters';
  config.reporterOptions = {
    configFile: '.mocha.reporters.json'
  };
} else {
  console.log("Running tests serially. To enable parallel execution update mocha config");
}

module.exports = config;