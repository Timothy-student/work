module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,           // Ganache default port
      network_id: "*",      // Match any network ID
    },
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/build/',
  compilers: {
    solc: {
      version: "0.8.0",     // Match your new Election.sol pragma
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },
};

