# Changelog

### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @waku/interfaces bumped from 0.0.14 to 0.0.15

### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @waku/interfaces bumped from 0.0.16 to 0.0.17

## [0.0.22](https://github.com/waku-org/js-waku/compare/utils-v0.0.21...utils-v0.0.22) (2025-02-05)


### Features

* Improve peer manager and re-integrate to light push  ([#2191](https://github.com/waku-org/js-waku/issues/2191)) ([62f93dc](https://github.com/waku-org/js-waku/commit/62f93dc8428132161dba8881c6adc162040ae758))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @waku/interfaces bumped from 0.0.28 to 0.0.29

## [0.0.21](https://github.com/waku-org/js-waku/compare/utils-v0.0.20...utils-v0.0.21) (2024-10-16)


### Features

* **filter:** Enhancing protocol peer management with mutex locks  ([#2137](https://github.com/waku-org/js-waku/issues/2137)) ([b2efce5](https://github.com/waku-org/js-waku/commit/b2efce5ec27807325685cc32f9333805e6321ac7))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @waku/interfaces bumped from 0.0.27 to 0.0.28

## [0.0.20](https://github.com/waku-org/js-waku/compare/utils-v0.0.19...utils-v0.0.20) (2024-09-05)


### Bug Fixes

* Temporarily remove peer cross dependencies ([#2123](https://github.com/waku-org/js-waku/issues/2123)) ([f4b6bb0](https://github.com/waku-org/js-waku/commit/f4b6bb04b38842745c946b427bb3518680df09dc))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @waku/interfaces bumped from 0.0.26 to 0.0.27

## [0.0.19](https://github.com/waku-org/js-waku/compare/utils-v0.0.18...utils-v0.0.19) (2024-08-29)


### ⚠ BREAKING CHANGES

* deprecate named pubsub topics and use static/auto sharding  ([#2097](https://github.com/waku-org/js-waku/issues/2097))
* **filter:** new simpler filter API  ([#2092](https://github.com/waku-org/js-waku/issues/2092))

### Features

* Deprecate named pubsub topics and use static/auto sharding  ([#2097](https://github.com/waku-org/js-waku/issues/2097)) ([5ce36c8](https://github.com/waku-org/js-waku/commit/5ce36c8f187f218df8af66e0643ab277e909b227))
* **filter:** New simpler filter API  ([#2092](https://github.com/waku-org/js-waku/issues/2092)) ([fdd9dc4](https://github.com/waku-org/js-waku/commit/fdd9dc44a44c6680024fb51e9bbb5fe17190dcbd))
* Fix peer renewal, change Filter keep alive ([#2065](https://github.com/waku-org/js-waku/issues/2065)) ([00635b7](https://github.com/waku-org/js-waku/commit/00635b7afe60c2ed739f2ccd1f07b2a6cc04f797))


### Bug Fixes

* Import of base_protocol and networkConfig type guard ([#2109](https://github.com/waku-org/js-waku/issues/2109)) ([8f56d90](https://github.com/waku-org/js-waku/commit/8f56d90cf127852e3dfe25127a5a578fa20524cb))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @waku/interfaces bumped from 0.0.25 to 0.0.26

## [0.0.18](https://github.com/waku-org/js-waku/compare/utils-v0.0.17...utils-v0.0.18) (2024-07-10)


### Features

* **lightpush:** Peer management for protocols ([#2003](https://github.com/waku-org/js-waku/issues/2003)) ([93e78c3](https://github.com/waku-org/js-waku/commit/93e78c3b876e084ab70e07c64c9b721693b659f8))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @waku/interfaces bumped from 0.0.24 to 0.0.25

## [0.0.17](https://github.com/waku-org/js-waku/compare/utils-v0.0.16...utils-v0.0.17) (2024-04-30)


### ⚠ BREAKING CHANGES

* use ShardingParams on subscriptions, make Decoder/Encoder auto sharding friendly by default ([#1958](https://github.com/waku-org/js-waku/issues/1958))

### Features

* Use ShardingParams on subscriptions, make Decoder/Encoder auto sharding friendly by default ([#1958](https://github.com/waku-org/js-waku/issues/1958)) ([f3627c4](https://github.com/waku-org/js-waku/commit/f3627c46a4c231013c5ffa4aa6f1ecbe3c06c5e3))


### Bug Fixes

* **message-hash:** Account for `timestamp` ([#1986](https://github.com/waku-org/js-waku/issues/1986)) ([73d4f19](https://github.com/waku-org/js-waku/commit/73d4f197467fe3e58fc49e3264f73e00a79004f9))
* Use correct shard index when creating encoder ([9514653](https://github.com/waku-org/js-waku/commit/95146534288f842ff1cf180fc62850d539937a05))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @waku/interfaces bumped from 0.0.23 to 0.0.24

## [0.0.16](https://github.com/waku-org/js-waku/compare/utils-v0.0.15...utils-v0.0.16) (2024-04-09)


### ⚠ BREAKING CHANGES

* **lightpush:** move protocol implementation opinions to `@waku/sdk` ([#1887](https://github.com/waku-org/js-waku/issues/1887))

### Features

* Add cross peer dependency for [@waku](https://github.com/waku) packages ([#1889](https://github.com/waku-org/js-waku/issues/1889)) ([8f86740](https://github.com/waku-org/js-waku/commit/8f867404e3e950b6e491c8831068962c6968ed4e))
* **metadata:** Use error codes ([#1904](https://github.com/waku-org/js-waku/issues/1904)) ([1882023](https://github.com/waku-org/js-waku/commit/1882023c58c830fc31921fe786bce734536ac1da))


### Miscellaneous Chores

* **lightpush:** Move protocol implementation opinions to `@waku/sdk` ([#1887](https://github.com/waku-org/js-waku/issues/1887)) ([8deab11](https://github.com/waku-org/js-waku/commit/8deab11890160b40a22e7d11926a2307afb93af4))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @waku/interfaces bumped from 0.0.22 to 0.0.23

## [0.0.15](https://github.com/waku-org/js-waku/compare/utils-v0.0.14...utils-v0.0.15) (2024-03-04)


### ⚠ BREAKING CHANGES

* protocols filter peers as per configured shard ([#1756](https://github.com/waku-org/js-waku/issues/1756))

### Features

* Decouple sharding params out of core ([e138b4f](https://github.com/waku-org/js-waku/commit/e138b4f5c49a35a37830e31e8be87d824f53249f))
* Local discovery ([#1811](https://github.com/waku-org/js-waku/issues/1811)) ([199f6ab](https://github.com/waku-org/js-waku/commit/199f6ab2ff83694b93e94e935e2925537e01e281))
* Make ShardingParams optional in sdk, required internally ([68d3229](https://github.com/waku-org/js-waku/commit/68d3229644f395bd84b2e2a7067c7b51e9da3dd0))
* Protocols filter peers as per configured shard ([#1756](https://github.com/waku-org/js-waku/issues/1756)) ([477c2a5](https://github.com/waku-org/js-waku/commit/477c2a5918f2f75cd2c14bc6ed75e1687c5a09b4))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @waku/interfaces bumped from 0.0.21 to 0.0.22

## [0.0.14](https://github.com/waku-org/js-waku/compare/utils-v0.0.13...utils-v0.0.14) (2024-01-10)


### ⚠ BREAKING CHANGES

* add support for sharded pubsub topics & remove support for named pubsub topics ([#1697](https://github.com/waku-org/js-waku/issues/1697))
* change all instances of `PubSubTopic` to `PubsubTopic` ([#1703](https://github.com/waku-org/js-waku/issues/1703))

### Features

* Add function for determining shard index from content topic ([86da696](https://github.com/waku-org/js-waku/commit/86da6962bac91a8719de1f9cd60e9f7bc13e48f1))
* Add function to validate autoshard content topic ([1bc1eb5](https://github.com/waku-org/js-waku/commit/1bc1eb509166e6dfcb24c59a90eb05f5dc16de78))
* Add support for autosharded pubsub topics ([2bc3735](https://github.com/waku-org/js-waku/commit/2bc3735e4dcf85f06b3dee542024d7f20a40fac2))
* Add support for sharded pubsub topics & remove support for named pubsub topics ([#1697](https://github.com/waku-org/js-waku/issues/1697)) ([4cf2ffe](https://github.com/waku-org/js-waku/commit/4cf2ffefa75e0571805036b71644d2cdd4fe3192))


### Miscellaneous Chores

* Change all instances of `PubSubTopic` to `PubsubTopic` ([#1703](https://github.com/waku-org/js-waku/issues/1703)) ([3166a51](https://github.com/waku-org/js-waku/commit/3166a5135e77583da4fa722ee2aa47c785854a38))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @waku/interfaces bumped from 0.0.20 to 0.0.21

## [0.0.13](https://github.com/waku-org/js-waku/compare/utils-v0.0.12...utils-v0.0.13) (2023-11-01)


### Features

* Fail early when trying to send empty payload ([#1642](https://github.com/waku-org/js-waku/issues/1642)) ([6bad4ea](https://github.com/waku-org/js-waku/commit/6bad4ea7d1dee79c296c550390da57ffa824e2cf))
* Logger with log levels ([#1672](https://github.com/waku-org/js-waku/issues/1672)) ([0f7d63e](https://github.com/waku-org/js-waku/commit/0f7d63ef93716223dc8fea7e8cb09e12e267b386))


### Bug Fixes

* Measure total message size ([#1643](https://github.com/waku-org/js-waku/issues/1643)) ([b7dc3d7](https://github.com/waku-org/js-waku/commit/b7dc3d7576e9444a5acbb036812c05cfccb25815))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @waku/interfaces bumped from 0.0.19 to 0.0.20

## [0.0.12](https://github.com/waku-org/js-waku/compare/utils-v0.0.11...utils-v0.0.12) (2023-10-16)


### ⚠ BREAKING CHANGES

* **static-sharding:** allow multiple pubSubTopics ([#1586](https://github.com/waku-org/js-waku/issues/1586))

### Features

* **static-sharding:** Allow multiple pubSubTopics ([#1586](https://github.com/waku-org/js-waku/issues/1586)) ([a3c45b6](https://github.com/waku-org/js-waku/commit/a3c45b6e1a9beae488cae3c71c48949fa47bcaf6))
* **static-sharding:** Filter peer connections per shards ([#1626](https://github.com/waku-org/js-waku/issues/1626)) ([124a29e](https://github.com/waku-org/js-waku/commit/124a29ebba59c05fbbf199d969e6ba3f9e57d45b))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @waku/interfaces bumped from 0.0.18 to 0.0.19

## [0.0.11](https://github.com/waku-org/js-waku/compare/utils-v0.0.10...utils-v0.0.11) (2023-09-11)


### ⚠ BREAKING CHANGES

* set peer-exchange with default bootstrap ([#1469](https://github.com/waku-org/js-waku/issues/1469))
* upgrade to libp2p@0.45 ([#1400](https://github.com/waku-org/js-waku/issues/1400))
* filter v2 ([#1332](https://github.com/waku-org/js-waku/issues/1332))
* @waku/relay ([#1316](https://github.com/waku-org/js-waku/issues/1316))

### Features

* @waku/relay ([#1316](https://github.com/waku-org/js-waku/issues/1316)) ([50c2c25](https://github.com/waku-org/js-waku/commit/50c2c2540f3c5ff78d93f3fea646da0eee246e17))
* Add 1MB restriction to LightPush and Relay ([#1351](https://github.com/waku-org/js-waku/issues/1351)) ([72f97d4](https://github.com/waku-org/js-waku/commit/72f97d4545512f92936b1a9b50fa0b53f8603f9d))
* Filter v2 ([#1332](https://github.com/waku-org/js-waku/issues/1332)) ([8d0e647](https://github.com/waku-org/js-waku/commit/8d0e64796695fbafad0a033552eb4412bdff3d78))
* Set peer-exchange with default bootstrap ([#1469](https://github.com/waku-org/js-waku/issues/1469)) ([81a52a8](https://github.com/waku-org/js-waku/commit/81a52a8097ba948783c9d798ba362af0f27e1c10))
* ToSubscriptionIterator impl for IReceiver ([#1307](https://github.com/waku-org/js-waku/issues/1307)) ([7daa9d0](https://github.com/waku-org/js-waku/commit/7daa9d05bf44b33296b56df214f5d5901887a129))
* Upgrade to libp2p@0.45 ([#1400](https://github.com/waku-org/js-waku/issues/1400)) ([420e6c6](https://github.com/waku-org/js-waku/commit/420e6c698dd8f44d40d34e47d876da5d2e1ce85e))
* Use the lowest latency peer for protocols ([#1540](https://github.com/waku-org/js-waku/issues/1540)) ([6f09fbf](https://github.com/waku-org/js-waku/commit/6f09fbf4ed181cb2fe5a15643cf2bebdc889ec64))


### Bug Fixes

* **utils:** Typescript to able to find types ([03c9cac](https://github.com/waku-org/js-waku/commit/03c9cac3d0f0167dee3b99d3945d96648bdb8685))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @waku/interfaces bumped from ^0.0.17 to 0.0.18

## [0.0.9](https://github.com/waku-org/js-waku/compare/utils-v0.0.8...utils-v0.0.9) (2023-07-26)


### ⚠ BREAKING CHANGES

* upgrade to libp2p@0.45 ([#1400](https://github.com/waku-org/js-waku/issues/1400))

### Features

* Upgrade to libp2p@0.45 ([#1400](https://github.com/waku-org/js-waku/issues/1400)) ([420e6c6](https://github.com/waku-org/js-waku/commit/420e6c698dd8f44d40d34e47d876da5d2e1ce85e))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @waku/interfaces bumped from 0.0.15 to 0.0.16

## [0.0.7](https://github.com/waku-org/js-waku/compare/utils-v0.0.6...utils-v0.0.7) (2023-05-26)


### ⚠ BREAKING CHANGES

* filter v2 ([#1332](https://github.com/waku-org/js-waku/issues/1332))

### Features

* Filter v2 ([#1332](https://github.com/waku-org/js-waku/issues/1332)) ([8d0e647](https://github.com/waku-org/js-waku/commit/8d0e64796695fbafad0a033552eb4412bdff3d78))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @waku/interfaces bumped from 0.0.13 to 0.0.14

## [0.0.6](https://github.com/waku-org/js-waku/compare/utils-v0.0.5...utils-v0.0.6) (2023-05-18)


### ⚠ BREAKING CHANGES

* @waku/relay ([#1316](https://github.com/waku-org/js-waku/issues/1316))

### Features

* @waku/relay ([#1316](https://github.com/waku-org/js-waku/issues/1316)) ([50c2c25](https://github.com/waku-org/js-waku/commit/50c2c2540f3c5ff78d93f3fea646da0eee246e17))
* Add 1MB restriction to LightPush and Relay ([#1351](https://github.com/waku-org/js-waku/issues/1351)) ([72f97d4](https://github.com/waku-org/js-waku/commit/72f97d4545512f92936b1a9b50fa0b53f8603f9d))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @waku/interfaces bumped from * to 0.0.13

## [0.0.5](https://github.com/waku-org/js-waku/compare/utils-v0.0.4...utils-v0.0.5) (2023-05-09)


### Features

* ToSubscriptionIterator impl for IReceiver ([#1307](https://github.com/waku-org/js-waku/issues/1307)) ([7daa9d0](https://github.com/waku-org/js-waku/commit/7daa9d05bf44b33296b56df214f5d5901887a129))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @waku/interfaces bumped from * to 0.0.12

## [0.0.4](https://github.com/waku-org/js-waku/compare/utils-v0.0.3...utils-v0.0.4) (2023-04-03)


### Bug Fixes

* **utils:** Typescript to able to find types ([03c9cac](https://github.com/waku-org/js-waku/commit/03c9cac3d0f0167dee3b99d3945d96648bdb8685))

## [0.0.3](https://github.com/waku-org/js-waku/compare/utils-v0.0.2...utils-v0.0.3) (2023-03-24)


### Bug Fixes

* **utils:** Include all ts files ([#1267](https://github.com/waku-org/js-waku/issues/1267)) ([c284159](https://github.com/waku-org/js-waku/commit/c284159ac8eab5bed2313fa5bc7fbea0e83d390f))

## [0.0.2](https://github.com/waku-org/js-waku/compare/utils-v0.0.1...utils-v0.0.2) (2023-03-16)


### ⚠ BREAKING CHANGES

* add exports map to @waku/utils ([#1201](https://github.com/waku-org/js-waku/issues/1201))
* directly convert from ENR to `PeerInfo`, remove unneeded utility
* bump typescript
* bump libp2p dependencies

### Bug Fixes

* Prettier and cspell ignore CHANGELOG ([#1235](https://github.com/waku-org/js-waku/issues/1235)) ([4d7b3e3](https://github.com/waku-org/js-waku/commit/4d7b3e39e6761afaf5d05a13cc4b3c23e15f9bd5))


### Miscellaneous Chores

* Add exports map to @waku/utils ([#1201](https://github.com/waku-org/js-waku/issues/1201)) ([a30b2bd](https://github.com/waku-org/js-waku/commit/a30b2bd747dedeef69b46cfafb88898ba35d8f67))
* Bump libp2p dependencies ([803ae7b](https://github.com/waku-org/js-waku/commit/803ae7bd8ed3de665026446c23cde90e7eba9d36))
* Bump typescript ([12d86e6](https://github.com/waku-org/js-waku/commit/12d86e6abcc68e27c39ca86b4f0dc2b68cdd6000))
* Directly convert from ENR to `PeerInfo`, remove unneeded utility ([6dbcde0](https://github.com/waku-org/js-waku/commit/6dbcde041ab8fa8c2df75cc25319a0eccf6b0454))

## Changelog

All notable changes to this project will be documented in this file.

The file is maintained by [Release Please](https://github.com/googleapis/release-please) based on [Conventional Commits](https://www.conventionalcommits.org) specification,
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
