# Changelog

All notable changes to this project will be documented in this file.

The file is maintained by [Release Please](https://github.com/googleapis/release-please) based on [Conventional Commits](https://www.conventionalcommits.org) specification,
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.29](https://github.com/waku-org/js-waku/compare/interfaces-v0.0.28...interfaces-v0.0.29) (2025-02-05)


### Features

* Improve peer manager and re-integrate to light push  ([#2191](https://github.com/waku-org/js-waku/issues/2191)) ([62f93dc](https://github.com/waku-org/js-waku/commit/62f93dc8428132161dba8881c6adc162040ae758))
* **store:** Allow specifying node to use ([#2192](https://github.com/waku-org/js-waku/issues/2192)) ([4153396](https://github.com/waku-org/js-waku/commit/415339601476925874904b19be43f6e055a45004))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @waku/proto bumped from ^0.0.8 to ^0.0.9

## [0.0.28](https://github.com/waku-org/js-waku/compare/interfaces-v0.0.27...interfaces-v0.0.28) (2024-10-16)


### ⚠ BREAKING CHANGES

* lighten retry logic for LightPush ([#2182](https://github.com/waku-org/js-waku/issues/2182))

### Features

* **filter:** Enhancing protocol peer management with mutex locks  ([#2137](https://github.com/waku-org/js-waku/issues/2137)) ([b2efce5](https://github.com/waku-org/js-waku/commit/b2efce5ec27807325685cc32f9333805e6321ac7))
* **filter:** Reliability monitor as a separate class to handle reliability logic ([#2117](https://github.com/waku-org/js-waku/issues/2117)) ([7ad1d32](https://github.com/waku-org/js-waku/commit/7ad1d321ca7f17bfeb54618d03580c4223f1b485))
* Lighten retry logic for LightPush ([#2182](https://github.com/waku-org/js-waku/issues/2182)) ([4049123](https://github.com/waku-org/js-waku/commit/4049123f147f24dfca35c584bd925d9892d4b518))
* **lightPush:** Improve peer usage and improve readability ([#2155](https://github.com/waku-org/js-waku/issues/2155)) ([1d68526](https://github.com/waku-org/js-waku/commit/1d68526e724155f76bb786239f475a774115ee97))
* Replace `waitForRemotePeers()` with `waku.waitForPeer()` method ([#2161](https://github.com/waku-org/js-waku/issues/2161)) ([75fcca4](https://github.com/waku-org/js-waku/commit/75fcca4cd99d6aabcbb14afab9332c98ddc6b74f))


### Bug Fixes

* Attempt to fix some of the Filter issues  ([#2183](https://github.com/waku-org/js-waku/issues/2183)) ([ded994f](https://github.com/waku-org/js-waku/commit/ded994f8ecd4ebec05cb9760f7eb3da273e5e02b))

## [0.0.27](https://github.com/waku-org/js-waku/compare/interfaces-v0.0.26...interfaces-v0.0.27) (2024-09-05)


### Bug Fixes

* Improve node bootstrapping ([#2121](https://github.com/waku-org/js-waku/issues/2121)) ([0263cb8](https://github.com/waku-org/js-waku/commit/0263cb80c5d2bc61984b5357761236ba4f759036))

## [0.0.26](https://github.com/waku-org/js-waku/compare/interfaces-v0.0.25...interfaces-v0.0.26) (2024-08-29)


### ⚠ BREAKING CHANGES

* **lightpush:** return new error messages ([#2115](https://github.com/waku-org/js-waku/issues/2115))
* deprecate named pubsub topics and use static/auto sharding  ([#2097](https://github.com/waku-org/js-waku/issues/2097))
* store v3 ([#2036](https://github.com/waku-org/js-waku/issues/2036))
* **filter:** new simpler filter API  ([#2092](https://github.com/waku-org/js-waku/issues/2092))

### Features

* Deprecate named pubsub topics and use static/auto sharding  ([#2097](https://github.com/waku-org/js-waku/issues/2097)) ([5ce36c8](https://github.com/waku-org/js-waku/commit/5ce36c8f187f218df8af66e0643ab277e909b227))
* **filter:** New simpler filter API  ([#2092](https://github.com/waku-org/js-waku/issues/2092)) ([fdd9dc4](https://github.com/waku-org/js-waku/commit/fdd9dc44a44c6680024fb51e9bbb5fe17190dcbd))
* **lightpush:** Return new error messages ([#2115](https://github.com/waku-org/js-waku/issues/2115)) ([a022433](https://github.com/waku-org/js-waku/commit/a022433851e6e187679b8c40bb465b431854809b))
* Node and protocols health ([#2080](https://github.com/waku-org/js-waku/issues/2080)) ([d464af3](https://github.com/waku-org/js-waku/commit/d464af3645d769034d6c6293607de5b00e904ae4))
* Store v3 ([#2036](https://github.com/waku-org/js-waku/issues/2036)) ([86f730f](https://github.com/waku-org/js-waku/commit/86f730f9587e3688b79c8e846e5c005bb4d5fae4))
* Validate messages for individual filter nodes & perform renewals ([#2057](https://github.com/waku-org/js-waku/issues/2057)) ([9b0f1e8](https://github.com/waku-org/js-waku/commit/9b0f1e855aa3a1f7b9aec3a4c726568d37595c28))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @waku/proto bumped from ^0.0.7 to ^0.0.8

## [0.0.25](https://github.com/waku-org/js-waku/compare/interfaces-v0.0.24...interfaces-v0.0.25) (2024-07-10)


### ⚠ BREAKING CHANGES

* **filter:** return error codes instead of throwing errors ([#1971](https://github.com/waku-org/js-waku/issues/1971))

### Features

* **filter:** Peer/subscription renewal with recurring Filter pings ([#2052](https://github.com/waku-org/js-waku/issues/2052)) ([318667e](https://github.com/waku-org/js-waku/commit/318667e44267c40c883eafc24a56261294d820dc))
* **filter:** Return error codes instead of throwing errors ([#1971](https://github.com/waku-org/js-waku/issues/1971)) ([4eb06c6](https://github.com/waku-org/js-waku/commit/4eb06c64eb05c015e2f51e3f45a9d7143a934385))
* **filter:** Use protocol peer management ([#2047](https://github.com/waku-org/js-waku/issues/2047)) ([4db508b](https://github.com/waku-org/js-waku/commit/4db508b962736426f4897995a2b525c82fe0ba37))
* **lightpush:** Peer management for protocols ([#2003](https://github.com/waku-org/js-waku/issues/2003)) ([93e78c3](https://github.com/waku-org/js-waku/commit/93e78c3b876e084ab70e07c64c9b721693b659f8))

## [0.0.24](https://github.com/waku-org/js-waku/compare/interfaces-v0.0.23...interfaces-v0.0.24) (2024-04-30)


### ⚠ BREAKING CHANGES

* use ShardingParams on subscriptions, make Decoder/Encoder auto sharding friendly by default ([#1958](https://github.com/waku-org/js-waku/issues/1958))
* **lightpush:** move protocol implementation to `@waku/sdk` (1/n) ([#1964](https://github.com/waku-org/js-waku/issues/1964))

### Features

* Add keep alive to Filter ([#1970](https://github.com/waku-org/js-waku/issues/1970)) ([1a6bc4f](https://github.com/waku-org/js-waku/commit/1a6bc4f8ce5d3409b3e82b8b0685beb80f48269a))
* Add libp2p option for max ping connections ([fa523b7](https://github.com/waku-org/js-waku/commit/fa523b78afa8e87d705c98d1be92f8e6ae1f4ed2))
* Lift contentTopics and make shardInfo mandatory for createLight… ([#1959](https://github.com/waku-org/js-waku/issues/1959)) ([5b03709](https://github.com/waku-org/js-waku/commit/5b03709dfe683b1cb001fe67c5bd013e664b4d89))
* Use ShardingParams on subscriptions, make Decoder/Encoder auto sharding friendly by default ([#1958](https://github.com/waku-org/js-waku/issues/1958)) ([f3627c4](https://github.com/waku-org/js-waku/commit/f3627c46a4c231013c5ffa4aa6f1ecbe3c06c5e3))


### Bug Fixes

* Use correct shard index when creating encoder ([9514653](https://github.com/waku-org/js-waku/commit/95146534288f842ff1cf180fc62850d539937a05))


### Miscellaneous Chores

* **lightpush:** Move protocol implementation to `@waku/sdk` (1/n) ([#1964](https://github.com/waku-org/js-waku/issues/1964)) ([5fb1006](https://github.com/waku-org/js-waku/commit/5fb100602b347ad13718c85c52d22a932c15aa18))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @waku/proto bumped from ^0.0.6 to ^0.0.7

## [0.0.23](https://github.com/waku-org/js-waku/compare/interfaces-v0.0.22...interfaces-v0.0.23) (2024-04-09)


### ⚠ BREAKING CHANGES

* **store:** move protocol implementation opinions to `@waku/sdk` ([#1913](https://github.com/waku-org/js-waku/issues/1913))
* **lightpush:** move protocol implementation opinions to `@waku/sdk` ([#1887](https://github.com/waku-org/js-waku/issues/1887))

### Features

* **metadata:** Use error codes ([#1904](https://github.com/waku-org/js-waku/issues/1904)) ([1882023](https://github.com/waku-org/js-waku/commit/1882023c58c830fc31921fe786bce734536ac1da))
* Peer-exchange uses error codes ([#1907](https://github.com/waku-org/js-waku/issues/1907)) ([877fe1d](https://github.com/waku-org/js-waku/commit/877fe1dc1daf6826b60ac5011af2915c47864d90))


### Miscellaneous Chores

* **lightpush:** Move protocol implementation opinions to `@waku/sdk` ([#1887](https://github.com/waku-org/js-waku/issues/1887)) ([8deab11](https://github.com/waku-org/js-waku/commit/8deab11890160b40a22e7d11926a2307afb93af4))
* **store:** Move protocol implementation opinions to `@waku/sdk` ([#1913](https://github.com/waku-org/js-waku/issues/1913)) ([bf42c8f](https://github.com/waku-org/js-waku/commit/bf42c8f53a291172d6af64cbf72c4092146899df))

## [0.0.22](https://github.com/waku-org/js-waku/compare/interfaces-v0.0.21...interfaces-v0.0.22) (2024-03-04)


### ⚠ BREAKING CHANGES

* rename local-discovery to local-peer-cache-discovery ([#1867](https://github.com/waku-org/js-waku/issues/1867))
* protocols filter peers as per configured shard ([#1756](https://github.com/waku-org/js-waku/issues/1756))

### Features

* Add bootstrapPeers option and refactor sdk ([#1871](https://github.com/waku-org/js-waku/issues/1871)) ([9f198dd](https://github.com/waku-org/js-waku/commit/9f198dd149ef299e3edce69b93cc2942c6f24846))
* Create node and subscription by content topic ([ee2d417](https://github.com/waku-org/js-waku/commit/ee2d4176f8cca45a51b7dac0009f0eb01952f540))
* Decouple sharding params out of core ([e138b4f](https://github.com/waku-org/js-waku/commit/e138b4f5c49a35a37830e31e8be87d824f53249f))
* Lightpush & filter send requests to multiple peers ([#1779](https://github.com/waku-org/js-waku/issues/1779)) ([7affbe2](https://github.com/waku-org/js-waku/commit/7affbe222dd30ccb6619839f4bc5eb86433a80f7))
* Local discovery ([#1811](https://github.com/waku-org/js-waku/issues/1811)) ([199f6ab](https://github.com/waku-org/js-waku/commit/199f6ab2ff83694b93e94e935e2925537e01e281))
* Make ShardingParams optional in sdk, required internally ([68d3229](https://github.com/waku-org/js-waku/commit/68d3229644f395bd84b2e2a7067c7b51e9da3dd0))
* Protocols filter peers as per configured shard ([#1756](https://github.com/waku-org/js-waku/issues/1756)) ([477c2a5](https://github.com/waku-org/js-waku/commit/477c2a5918f2f75cd2c14bc6ed75e1687c5a09b4))


### Miscellaneous Chores

* Rename local-discovery to local-peer-cache-discovery ([#1867](https://github.com/waku-org/js-waku/issues/1867)) ([f3cb10d](https://github.com/waku-org/js-waku/commit/f3cb10d484bac134377b8cfd77e077ffc33bd319))

## [0.0.21](https://github.com/waku-org/js-waku/compare/interfaces-v0.0.20...interfaces-v0.0.21) (2024-01-10)


### ⚠ BREAKING CHANGES

* add support for sharded pubsub topics & remove support for named pubsub topics ([#1697](https://github.com/waku-org/js-waku/issues/1697))
* change all instances of `PubSubTopic` to `PubsubTopic` ([#1703](https://github.com/waku-org/js-waku/issues/1703))

### Features

* Add support for autosharded pubsub topics ([2bc3735](https://github.com/waku-org/js-waku/commit/2bc3735e4dcf85f06b3dee542024d7f20a40fac2))
* Add support for sharded pubsub topics & remove support for named pubsub topics ([#1697](https://github.com/waku-org/js-waku/issues/1697)) ([4cf2ffe](https://github.com/waku-org/js-waku/commit/4cf2ffefa75e0571805036b71644d2cdd4fe3192))
* Metadata protocol ([#1732](https://github.com/waku-org/js-waku/issues/1732)) ([9ac2a3f](https://github.com/waku-org/js-waku/commit/9ac2a3f36352523b79fcd8f8a94bd6e0e109fc30))
* Track node connection state ([#1719](https://github.com/waku-org/js-waku/issues/1719)) ([1d0e2ac](https://github.com/waku-org/js-waku/commit/1d0e2ace7fa5b44ab192505c7ebce01a7ce343e0))


### Miscellaneous Chores

* Change all instances of `PubSubTopic` to `PubsubTopic` ([#1703](https://github.com/waku-org/js-waku/issues/1703)) ([3166a51](https://github.com/waku-org/js-waku/commit/3166a5135e77583da4fa722ee2aa47c785854a38))

## [0.0.20](https://github.com/waku-org/js-waku/compare/interfaces-v0.0.19...interfaces-v0.0.20) (2023-11-01)


### Features

* Fail early when trying to send empty payload ([#1642](https://github.com/waku-org/js-waku/issues/1642)) ([6bad4ea](https://github.com/waku-org/js-waku/commit/6bad4ea7d1dee79c296c550390da57ffa824e2cf))

## [0.0.19](https://github.com/waku-org/js-waku/compare/interfaces-v0.0.18...interfaces-v0.0.19) (2023-10-16)


### ⚠ BREAKING CHANGES

* **static-sharding:** allow multiple pubSubTopics ([#1586](https://github.com/waku-org/js-waku/issues/1586))
* return `REMOTE_PEER_REJECTED` if remote peer rejected the message

### Features

* Return `REMOTE_PEER_REJECTED` if remote peer rejected the message ([053b654](https://github.com/waku-org/js-waku/commit/053b6545ad0c2450af5687495eb7b6049c0f21ad))
* **static-sharding:** Allow multiple pubSubTopics ([#1586](https://github.com/waku-org/js-waku/issues/1586)) ([a3c45b6](https://github.com/waku-org/js-waku/commit/a3c45b6e1a9beae488cae3c71c48949fa47bcaf6))
* **static-sharding:** Filter peer connections per shards ([#1626](https://github.com/waku-org/js-waku/issues/1626)) ([124a29e](https://github.com/waku-org/js-waku/commit/124a29ebba59c05fbbf199d969e6ba3f9e57d45b))


### Bug Fixes

* Catch stream creation promise rejection for `lightPush.send` ([b696a89](https://github.com/waku-org/js-waku/commit/b696a8957211bf20577f419a207a23ceca03d23f))

## [0.0.18](https://github.com/waku-org/js-waku/compare/interfaces-v0.0.17...interfaces-v0.0.18) (2023-09-11)


### ⚠ BREAKING CHANGES

* set peer-exchange with default bootstrap ([#1469](https://github.com/waku-org/js-waku/issues/1469))
* refactor store protocol for readability ([#1456](https://github.com/waku-org/js-waku/issues/1456))
* remove filter v1 ([#1433](https://github.com/waku-org/js-waku/issues/1433))
* upgrade to libp2p@0.45 ([#1400](https://github.com/waku-org/js-waku/issues/1400))
* filter v2 ([#1332](https://github.com/waku-org/js-waku/issues/1332))
* add and implement IReceiver ([#1219](https://github.com/waku-org/js-waku/issues/1219))

### Features

* Add 1MB restriction to LightPush and Relay ([#1351](https://github.com/waku-org/js-waku/issues/1351)) ([72f97d4](https://github.com/waku-org/js-waku/commit/72f97d4545512f92936b1a9b50fa0b53f8603f9d))
* Add and implement IReceiver ([#1219](https://github.com/waku-org/js-waku/issues/1219)) ([e11e5b4](https://github.com/waku-org/js-waku/commit/e11e5b4870aede7813b3ee4b60f5e625f6eac5a2))
* Allow passing of multiple ENR URLs to DNS Discovery & dial multiple peers in parallel ([#1379](https://github.com/waku-org/js-waku/issues/1379)) ([f32d7d9](https://github.com/waku-org/js-waku/commit/f32d7d9fe0b930b4fa9c46b8644e6d21be45d5c1))
* ConnectionManager extends EventEmitter & exposed on the Waku interface (& minor improvements) ([#1447](https://github.com/waku-org/js-waku/issues/1447)) ([0b8936f](https://github.com/waku-org/js-waku/commit/0b8936f1f1ad33f6cb90eb88d027a19e787ae7a2))
* **dns-discovery:** Set default for `NodeRequirements` ([#1466](https://github.com/waku-org/js-waku/issues/1466)) ([aab9c08](https://github.com/waku-org/js-waku/commit/aab9c08caefb9f72460261ec0c38df88ae0f02ce))
* Enable event emission for peer discovery/connection in ConnectionManager ([#1438](https://github.com/waku-org/js-waku/issues/1438)) ([6ce898d](https://github.com/waku-org/js-waku/commit/6ce898d77132f30b5d8f33b48c7f6276992a486e))
* Expose `meta` on `IDecodedMessage` ([5724bb2](https://github.com/waku-org/js-waku/commit/5724bb2b21367e4e397acbc5530b3a2bf315194e))
* Filter v2 ([#1332](https://github.com/waku-org/js-waku/issues/1332)) ([8d0e647](https://github.com/waku-org/js-waku/commit/8d0e64796695fbafad0a033552eb4412bdff3d78))
* Set peer-exchange with default bootstrap ([#1469](https://github.com/waku-org/js-waku/issues/1469)) ([81a52a8](https://github.com/waku-org/js-waku/commit/81a52a8097ba948783c9d798ba362af0f27e1c10))
* ToSubscriptionIterator impl for IReceiver ([#1307](https://github.com/waku-org/js-waku/issues/1307)) ([7daa9d0](https://github.com/waku-org/js-waku/commit/7daa9d05bf44b33296b56df214f5d5901887a129))
* Upgrade to libp2p@0.45 ([#1400](https://github.com/waku-org/js-waku/issues/1400)) ([420e6c6](https://github.com/waku-org/js-waku/commit/420e6c698dd8f44d40d34e47d876da5d2e1ce85e))


### Miscellaneous Chores

* Refactor store protocol for readability ([#1456](https://github.com/waku-org/js-waku/issues/1456)) ([2389977](https://github.com/waku-org/js-waku/commit/2389977a9840281dff4008c015fe76451c0f0df5))
* Remove filter v1 ([#1433](https://github.com/waku-org/js-waku/issues/1433)) ([d483644](https://github.com/waku-org/js-waku/commit/d483644a4bb4350df380719b9bcfbdd0b1439482))

## [0.0.17](https://github.com/waku-org/js-waku/compare/interfaces-v0.0.16...interfaces-v0.0.17) (2023-08-02)


### Features

* ConnectionManager extends EventEmitter & exposed on the Waku interface (& minor improvements) ([#1447](https://github.com/waku-org/js-waku/issues/1447)) ([0b8936f](https://github.com/waku-org/js-waku/commit/0b8936f1f1ad33f6cb90eb88d027a19e787ae7a2))

## [0.0.16](https://github.com/waku-org/js-waku/compare/interfaces-v0.0.15...interfaces-v0.0.16) (2023-07-26)


### ⚠ BREAKING CHANGES

* remove filter v1 ([#1433](https://github.com/waku-org/js-waku/issues/1433))
* upgrade to libp2p@0.45 ([#1400](https://github.com/waku-org/js-waku/issues/1400))

### Features

* Enable event emission for peer discovery/connection in ConnectionManager ([#1438](https://github.com/waku-org/js-waku/issues/1438)) ([6ce898d](https://github.com/waku-org/js-waku/commit/6ce898d77132f30b5d8f33b48c7f6276992a486e))
* Upgrade to libp2p@0.45 ([#1400](https://github.com/waku-org/js-waku/issues/1400)) ([420e6c6](https://github.com/waku-org/js-waku/commit/420e6c698dd8f44d40d34e47d876da5d2e1ce85e))


### Miscellaneous Chores

* Remove filter v1 ([#1433](https://github.com/waku-org/js-waku/issues/1433)) ([d483644](https://github.com/waku-org/js-waku/commit/d483644a4bb4350df380719b9bcfbdd0b1439482))

## [0.0.15](https://github.com/waku-org/js-waku/compare/interfaces-v0.0.14...interfaces-v0.0.15) (2023-06-08)


### Features

* Allow passing of multiple ENR URLs to DNS Discovery & dial multiple peers in parallel ([#1379](https://github.com/waku-org/js-waku/issues/1379)) ([f32d7d9](https://github.com/waku-org/js-waku/commit/f32d7d9fe0b930b4fa9c46b8644e6d21be45d5c1))

## [0.0.14](https://github.com/waku-org/js-waku/compare/interfaces-v0.0.13...interfaces-v0.0.14) (2023-05-26)


### ⚠ BREAKING CHANGES

* filter v2 ([#1332](https://github.com/waku-org/js-waku/issues/1332))

### Features

* Filter v2 ([#1332](https://github.com/waku-org/js-waku/issues/1332)) ([8d0e647](https://github.com/waku-org/js-waku/commit/8d0e64796695fbafad0a033552eb4412bdff3d78))

## [0.0.13](https://github.com/waku-org/js-waku/compare/interfaces-v0.0.12...interfaces-v0.0.13) (2023-05-18)


### Features

* Add 1MB restriction to LightPush and Relay ([#1351](https://github.com/waku-org/js-waku/issues/1351)) ([72f97d4](https://github.com/waku-org/js-waku/commit/72f97d4545512f92936b1a9b50fa0b53f8603f9d))
* Expose `meta` on `IDecodedMessage` ([5724bb2](https://github.com/waku-org/js-waku/commit/5724bb2b21367e4e397acbc5530b3a2bf315194e))

## [0.0.12](https://github.com/waku-org/js-waku/compare/interfaces-v0.0.11...interfaces-v0.0.12) (2023-05-09)


### Features

* ToSubscriptionIterator impl for IReceiver ([#1307](https://github.com/waku-org/js-waku/issues/1307)) ([7daa9d0](https://github.com/waku-org/js-waku/commit/7daa9d05bf44b33296b56df214f5d5901887a129))

## [0.0.11](https://github.com/waku-org/js-waku/compare/interfaces-v0.0.10...interfaces-v0.0.11) (2023-04-03)


### ⚠ BREAKING CHANGES

* add and implement IReceiver ([#1219](https://github.com/waku-org/js-waku/issues/1219))

### Features

* Add and implement IReceiver ([#1219](https://github.com/waku-org/js-waku/issues/1219)) ([e11e5b4](https://github.com/waku-org/js-waku/commit/e11e5b4870aede7813b3ee4b60f5e625f6eac5a2))

## [0.0.10](https://github.com/waku-org/js-waku/compare/interfaces-v0.0.9...interfaces-v0.0.10) (2023-03-24)


### Bug Fixes

* **utils:** Include all ts files ([#1267](https://github.com/waku-org/js-waku/issues/1267)) ([c284159](https://github.com/waku-org/js-waku/commit/c284159ac8eab5bed2313fa5bc7fbea0e83d390f))

## [0.0.9](https://github.com/waku-org/js-waku/compare/interfaces-v0.0.8...interfaces-v0.0.9) (2023-03-23)


### ⚠ BREAKING CHANGES

* use ISender and deprecate Light Push .push ([#1217](https://github.com/waku-org/js-waku/issues/1217))

### Features

* Add getActiveSubscriptions method ([#1249](https://github.com/waku-org/js-waku/issues/1249)) ([45284db](https://github.com/waku-org/js-waku/commit/45284db963d6d4c90a014391551604c236906b88))
* Use ISender and deprecate Light Push .push ([#1217](https://github.com/waku-org/js-waku/issues/1217)) ([0f6a594](https://github.com/waku-org/js-waku/commit/0f6a59464426b94dd14841de075ff10a4ad52e33))

## [0.0.8](https://github.com/waku-org/js-waku/compare/interfaces-v0.0.7...interfaces-v0.0.8) (2023-03-16)


### ⚠ BREAKING CHANGES

* add custom events to Relay and make observers private ([#1213](https://github.com/waku-org/js-waku/issues/1213))
* enable encoding of `meta` field
* expose pubsub topic in `IDecodedMessage`
* directly convert from ENR to `PeerInfo`, remove unneeded utility
* extract encoder code
* update store.proto
* update message.proto: payload and content topic are always defined
* ConnectionManager and KeepAliveManager ([#1135](https://github.com/waku-org/js-waku/issues/1135))
* bump typescript
* bump libp2p dependencies

### Features

* Add custom events to Relay and make observers private ([#1213](https://github.com/waku-org/js-waku/issues/1213)) ([275b166](https://github.com/waku-org/js-waku/commit/275b16641e620956a5f8ebbb3a8c4156149d489e))
* Codec as a property of the protocol implementations ([a5ff788](https://github.com/waku-org/js-waku/commit/a5ff788eed419556e11319f22ca9e3109c81df92))
* ConnectionManager and KeepAliveManager ([#1135](https://github.com/waku-org/js-waku/issues/1135)) ([24c24cc](https://github.com/waku-org/js-waku/commit/24c24cc27d83ec12de45ef3cf3d00f6eb817e4ca))
* Enable encoding of `meta` field ([bd983ea](https://github.com/waku-org/js-waku/commit/bd983ea48ee73fda5a7137d5ef681965aeabb4a5))
* Expose pubsub topic in `IDecodedMessage` ([628ac50](https://github.com/waku-org/js-waku/commit/628ac50d7104ec3c1dff44db58077a85db6b6aa1)), closes [#1208](https://github.com/waku-org/js-waku/issues/1208)


### Bug Fixes

* Prettier and cspell ignore CHANGELOG ([#1235](https://github.com/waku-org/js-waku/issues/1235)) ([4d7b3e3](https://github.com/waku-org/js-waku/commit/4d7b3e39e6761afaf5d05a13cc4b3c23e15f9bd5))
* Remove initialising peer-exchange while creating a node ([#1158](https://github.com/waku-org/js-waku/issues/1158)) ([1b41569](https://github.com/waku-org/js-waku/commit/1b4156902387ea35b24b3d6f5d22e4635ea8cf18))


### Miscellaneous Chores

* Bump libp2p dependencies ([803ae7b](https://github.com/waku-org/js-waku/commit/803ae7bd8ed3de665026446c23cde90e7eba9d36))
* Bump typescript ([12d86e6](https://github.com/waku-org/js-waku/commit/12d86e6abcc68e27c39ca86b4f0dc2b68cdd6000))
* Directly convert from ENR to `PeerInfo`, remove unneeded utility ([6dbcde0](https://github.com/waku-org/js-waku/commit/6dbcde041ab8fa8c2df75cc25319a0eccf6b0454))
* Extract encoder code ([22ffcf5](https://github.com/waku-org/js-waku/commit/22ffcf571aa3998267f0f3b59576abc38f3f4281))
* Update message.proto: payload and content topic are always defined ([5cf8ed2](https://github.com/waku-org/js-waku/commit/5cf8ed2030c9efbc4c4b66aa801827482c1e4249))
* Update store.proto ([967e6ff](https://github.com/waku-org/js-waku/commit/967e6ffc7ec6f780094e29599c47b723fa222dcc))

## [Unreleased]

### Added

- `multicodec` property on protocol interfaces.

## [0.0.7] - 2023-01-18

### Added

- `IPeerExchange` interface.
- `IEnr` interface.

## [0.0.6] - 2022-12-15

### Changed

- Add `I` prefix to protocol and messages interfaces.
- Renamed node interfaces to include `Node`.
- Renamed `WakuPrivacy` to `RelayNode`.

## [0.0.5] - 2022-11-18

### Added

- Alpha version of `@waku/interfaces`.

[unreleased]: https://github.com/waku-org/js-waku/compare/@waku/interfaces@0.0.7...HEAD
[0.0.7]: https://github.com/waku-org/js-waku/compare/@waku/interfaces@0.0.6...@waku/interfaces@0.0.7
[0.0.6]: https://github.com/waku-org/js-waku/compare/@waku/interfaces@0.0.5...@waku/interfaces@0.0.6
[0.0.5]: https://github.com/waku-org/js-waku/compare/@waku/interfaces@0.0.4...@waku/interfaces@0.0.5
[0.0.4]: https://github.com/waku-org/js-waku/compare/@waku/interfaces@0.0.3...@waku/interfaces@0.0.4
[0.0.3]: https://github.com/waku-org/js-waku/compare/@waku/interfaces@0.0.2...%40waku/create@0.0.3
[0.0.2]: https://github.com/waku-org/js-waku/compare/@waku/interfaces@0.0.1...%40waku/create@0.0.2
[0.0.1]: https://github.com/status-im/js-waku/compare/a20b7809d61ff9a9732aba82b99bbe99f229b935...%40waku/create%400.0.2
