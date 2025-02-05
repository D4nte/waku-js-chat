# Changelog

All notable changes to this project will be documented in this file.

The file is maintained by [Release Please](https://github.com/googleapis/release-please) based on [Conventional Commits](https://www.conventionalcommits.org) specification,
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @waku/dns-discovery bumped from 0.0.8 to 0.0.9

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @waku/core bumped from 0.0.14 to 0.0.15

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @waku/core bumped from 0.0.16 to 0.0.17
    * @waku/dns-discovery bumped from 0.0.10 to 0.0.11
  * devDependencies
    * @waku/interfaces bumped from 0.0.11 to 0.0.12

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @waku/utils bumped from 0.0.9 to 0.0.10
    * @waku/relay bumped from 0.0.4 to 0.0.5
    * @waku/core bumped from 0.0.21 to 0.0.22
    * @waku/interfaces bumped from 0.0.16 to 0.0.17
    * @waku/dns-discovery bumped from 0.0.15 to 0.0.16

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @waku/utils bumped from 0.0.12 to 0.0.13
    * @waku/relay bumped from 0.0.7 to 0.0.8
    * @waku/core bumped from 0.0.24 to 0.0.25
    * @waku/dns-discovery bumped from 0.0.18 to 0.0.19
    * @waku/interfaces bumped from 0.0.19 to 0.0.20
    * @waku/peer-exchange bumped from ^0.0.17 to ^0.0.18

## [0.0.30](https://github.com/waku-org/js-waku/compare/sdk-v0.0.29...sdk-v0.0.30) (2025-02-05)


### Features

* Improve peer manager and re-integrate to light push  ([#2191](https://github.com/waku-org/js-waku/issues/2191)) ([62f93dc](https://github.com/waku-org/js-waku/commit/62f93dc8428132161dba8881c6adc162040ae758))
* Move Peer to PeerId ([#2246](https://github.com/waku-org/js-waku/issues/2246)) ([fc93fae](https://github.com/waku-org/js-waku/commit/fc93fae873ad032cc4f18c41ab98959eef785279))
* **store:** Allow specifying node to use ([#2192](https://github.com/waku-org/js-waku/issues/2192)) ([4153396](https://github.com/waku-org/js-waku/commit/415339601476925874904b19be43f6e055a45004))


### Bug Fixes

* Remove peer deps ([#2200](https://github.com/waku-org/js-waku/issues/2200)) ([f34fc4b](https://github.com/waku-org/js-waku/commit/f34fc4b2442f1cec326c8ebd45596445232fa65b))
* Remove window reference and improve waitForRemotePeer ([#2194](https://github.com/waku-org/js-waku/issues/2194)) ([88e33a9](https://github.com/waku-org/js-waku/commit/88e33a90fd2a4de93d4ce0cb99dbd77ff454ef34))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @waku/core bumped from 0.0.33 to 0.0.34
    * @waku/discovery bumped from 0.0.6 to 0.0.7
    * @waku/interfaces bumped from 0.0.28 to 0.0.29
    * @waku/proto bumped from ^0.0.8 to ^0.0.9
    * @waku/utils bumped from 0.0.21 to 0.0.22
    * @waku/message-hash bumped from 0.1.17 to 0.1.18

## [0.0.29](https://github.com/waku-org/js-waku/compare/sdk-v0.0.28...sdk-v0.0.29) (2024-10-16)


### ⚠ BREAKING CHANGES

* lighten retry logic for LightPush ([#2182](https://github.com/waku-org/js-waku/issues/2182))

### Features

* Confirm metadata and protocols needed in waitForRemotePeer ([#2160](https://github.com/waku-org/js-waku/issues/2160)) ([d37e024](https://github.com/waku-org/js-waku/commit/d37e0245cf265697d89319b5efb1e5535af30cd5))
* **filter:** Enhancing protocol peer management with mutex locks  ([#2137](https://github.com/waku-org/js-waku/issues/2137)) ([b2efce5](https://github.com/waku-org/js-waku/commit/b2efce5ec27807325685cc32f9333805e6321ac7))
* **filter:** Reliability monitor as a separate class to handle reliability logic ([#2117](https://github.com/waku-org/js-waku/issues/2117)) ([7ad1d32](https://github.com/waku-org/js-waku/commit/7ad1d321ca7f17bfeb54618d03580c4223f1b485))
* Lighten retry logic for LightPush ([#2182](https://github.com/waku-org/js-waku/issues/2182)) ([4049123](https://github.com/waku-org/js-waku/commit/4049123f147f24dfca35c584bd925d9892d4b518))
* **lightPush:** Improve peer usage and improve readability ([#2155](https://github.com/waku-org/js-waku/issues/2155)) ([1d68526](https://github.com/waku-org/js-waku/commit/1d68526e724155f76bb786239f475a774115ee97))
* **lightpush:** Introduce ReliabilityMonitor and allow `send` retries ([#2130](https://github.com/waku-org/js-waku/issues/2130)) ([7a6247c](https://github.com/waku-org/js-waku/commit/7a6247cb7081e8b9b1d48c24040aae63144457aa))
* Replace `waitForRemotePeers()` with `waku.waitForPeer()` method ([#2161](https://github.com/waku-org/js-waku/issues/2161)) ([75fcca4](https://github.com/waku-org/js-waku/commit/75fcca4cd99d6aabcbb14afab9332c98ddc6b74f))


### Bug Fixes

* Attempt to fix some of the Filter issues  ([#2183](https://github.com/waku-org/js-waku/issues/2183)) ([ded994f](https://github.com/waku-org/js-waku/commit/ded994f8ecd4ebec05cb9760f7eb3da273e5e02b))
* Peer renewal connection drop & stream management ([#2145](https://github.com/waku-org/js-waku/issues/2145)) ([b93134a](https://github.com/waku-org/js-waku/commit/b93134a517006d3850ef13c1290194767ce40c21))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @waku/core bumped from 0.0.32 to 0.0.33
    * @waku/discovery bumped from 0.0.5 to 0.0.6
    * @waku/interfaces bumped from 0.0.27 to 0.0.28
    * @waku/utils bumped from 0.0.20 to 0.0.21
    * @waku/message-hash bumped from 0.1.16 to 0.1.17

## [0.0.28](https://github.com/waku-org/js-waku/compare/sdk-v0.0.27...sdk-v0.0.28) (2024-09-05)


### Bug Fixes

* Filter missing messages ([#2119](https://github.com/waku-org/js-waku/issues/2119)) ([5d3cc5f](https://github.com/waku-org/js-waku/commit/5d3cc5fd45ea4e2f89a2e7580111f53370adfb1a))
* Improve node bootstrapping ([#2121](https://github.com/waku-org/js-waku/issues/2121)) ([0263cb8](https://github.com/waku-org/js-waku/commit/0263cb80c5d2bc61984b5357761236ba4f759036))
* Temporarily remove peer cross dependencies ([#2123](https://github.com/waku-org/js-waku/issues/2123)) ([f4b6bb0](https://github.com/waku-org/js-waku/commit/f4b6bb04b38842745c946b427bb3518680df09dc))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @waku/core bumped from 0.0.31 to 0.0.32
    * @waku/discovery bumped from 0.0.4 to 0.0.5
    * @waku/interfaces bumped from 0.0.26 to 0.0.27
    * @waku/utils bumped from 0.0.19 to 0.0.20
    * @waku/message-hash bumped from 0.1.15 to 0.1.16

## [0.0.27](https://github.com/waku-org/js-waku/compare/sdk-v0.0.26...sdk-v0.0.27) (2024-08-29)


### ⚠ BREAKING CHANGES

* **lightpush:** return new error messages ([#2115](https://github.com/waku-org/js-waku/issues/2115))
* deprecate named pubsub topics and use static/auto sharding  ([#2097](https://github.com/waku-org/js-waku/issues/2097))
* store v3 ([#2036](https://github.com/waku-org/js-waku/issues/2036))
* **filter:** new simpler filter API  ([#2092](https://github.com/waku-org/js-waku/issues/2092))

### Features

* Deprecate named pubsub topics and use static/auto sharding  ([#2097](https://github.com/waku-org/js-waku/issues/2097)) ([5ce36c8](https://github.com/waku-org/js-waku/commit/5ce36c8f187f218df8af66e0643ab277e909b227))
* **filter:** New simpler filter API  ([#2092](https://github.com/waku-org/js-waku/issues/2092)) ([fdd9dc4](https://github.com/waku-org/js-waku/commit/fdd9dc44a44c6680024fb51e9bbb5fe17190dcbd))
* Fix peer renewal, change Filter keep alive ([#2065](https://github.com/waku-org/js-waku/issues/2065)) ([00635b7](https://github.com/waku-org/js-waku/commit/00635b7afe60c2ed739f2ccd1f07b2a6cc04f797))
* **lightpush:** Return new error messages ([#2115](https://github.com/waku-org/js-waku/issues/2115)) ([a022433](https://github.com/waku-org/js-waku/commit/a022433851e6e187679b8c40bb465b431854809b))
* Node and protocols health ([#2080](https://github.com/waku-org/js-waku/issues/2080)) ([d464af3](https://github.com/waku-org/js-waku/commit/d464af3645d769034d6c6293607de5b00e904ae4))
* Offline state recovery for Filter subscription ([#2049](https://github.com/waku-org/js-waku/issues/2049)) ([eadb85a](https://github.com/waku-org/js-waku/commit/eadb85ab8367c0e0d8fa9f9fd012eebc71200b6c))
* Store v3 ([#2036](https://github.com/waku-org/js-waku/issues/2036)) ([86f730f](https://github.com/waku-org/js-waku/commit/86f730f9587e3688b79c8e846e5c005bb4d5fae4))
* Validate messages for individual filter nodes & perform renewals ([#2057](https://github.com/waku-org/js-waku/issues/2057)) ([9b0f1e8](https://github.com/waku-org/js-waku/commit/9b0f1e855aa3a1f7b9aec3a4c726568d37595c28))


### Bug Fixes

* Import of base_protocol and networkConfig type guard ([#2109](https://github.com/waku-org/js-waku/issues/2109)) ([8f56d90](https://github.com/waku-org/js-waku/commit/8f56d90cf127852e3dfe25127a5a578fa20524cb))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @waku/core bumped from 0.0.30 to 0.0.31
    * @waku/discovery bumped from 0.0.3 to 0.0.4
    * @waku/interfaces bumped from 0.0.25 to 0.0.26
    * @waku/proto bumped from ^0.0.7 to ^0.0.8
    * @waku/relay bumped from 0.0.13 to 0.0.14
    * @waku/utils bumped from 0.0.18 to 0.0.19

## [0.0.26](https://github.com/waku-org/js-waku/compare/sdk-v0.0.25...sdk-v0.0.26) (2024-07-10)


### ⚠ BREAKING CHANGES

* **filter:** return error codes instead of throwing errors ([#1971](https://github.com/waku-org/js-waku/issues/1971))

### Features

* **filter:** Peer/subscription renewal with recurring Filter pings ([#2052](https://github.com/waku-org/js-waku/issues/2052)) ([318667e](https://github.com/waku-org/js-waku/commit/318667e44267c40c883eafc24a56261294d820dc))
* **filter:** Return error codes instead of throwing errors ([#1971](https://github.com/waku-org/js-waku/issues/1971)) ([4eb06c6](https://github.com/waku-org/js-waku/commit/4eb06c64eb05c015e2f51e3f45a9d7143a934385))
* **filter:** Use protocol peer management ([#2047](https://github.com/waku-org/js-waku/issues/2047)) ([4db508b](https://github.com/waku-org/js-waku/commit/4db508b962736426f4897995a2b525c82fe0ba37))
* **lightpush:** Peer management for protocols ([#2003](https://github.com/waku-org/js-waku/issues/2003)) ([93e78c3](https://github.com/waku-org/js-waku/commit/93e78c3b876e084ab70e07c64c9b721693b659f8))


### Bug Fixes

* Add .js to base protocol import in filter sdk ([#2009](https://github.com/waku-org/js-waku/issues/2009)) ([6f188ef](https://github.com/waku-org/js-waku/commit/6f188ef37978c93432774a5b3cac02e0b40fd184))
* Bootstrapping with default pubsub topic ([#2031](https://github.com/waku-org/js-waku/issues/2031)) ([16e9116](https://github.com/waku-org/js-waku/commit/16e9116c7cf6be876e174fe9259921c8d5397a88))
* Filter for wss in libp2p websocket transport ([682cc66](https://github.com/waku-org/js-waku/commit/682cc66232fe21b290c20ce145432cdd829158f9))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @waku/core bumped from 0.0.29 to 0.0.30
    * @waku/discovery bumped from 0.0.2 to 0.0.3
    * @waku/interfaces bumped from 0.0.24 to 0.0.25
    * @waku/relay bumped from 0.0.12 to 0.0.13
    * @waku/utils bumped from 0.0.17 to 0.0.18

## [0.0.25](https://github.com/waku-org/js-waku/compare/sdk-v0.0.24...sdk-v0.0.25) (2024-04-30)


### ⚠ BREAKING CHANGES

* use ShardingParams on subscriptions, make Decoder/Encoder auto sharding friendly by default ([#1958](https://github.com/waku-org/js-waku/issues/1958))
* **lightpush:** move protocol implementation to `@waku/sdk` (1/n) ([#1964](https://github.com/waku-org/js-waku/issues/1964))

### Features

* Add keep alive to Filter ([#1970](https://github.com/waku-org/js-waku/issues/1970)) ([1a6bc4f](https://github.com/waku-org/js-waku/commit/1a6bc4f8ce5d3409b3e82b8b0685beb80f48269a))
* Add libp2p option for max ping connections ([fa523b7](https://github.com/waku-org/js-waku/commit/fa523b78afa8e87d705c98d1be92f8e6ae1f4ed2))
* Lift contentTopics and make shardInfo mandatory for createLight… ([#1959](https://github.com/waku-org/js-waku/issues/1959)) ([5b03709](https://github.com/waku-org/js-waku/commit/5b03709dfe683b1cb001fe67c5bd013e664b4d89))
* Use ShardingParams on subscriptions, make Decoder/Encoder auto sharding friendly by default ([#1958](https://github.com/waku-org/js-waku/issues/1958)) ([f3627c4](https://github.com/waku-org/js-waku/commit/f3627c46a4c231013c5ffa4aa6f1ecbe3c06c5e3))


### Miscellaneous Chores

* **lightpush:** Move protocol implementation to `@waku/sdk` (1/n) ([#1964](https://github.com/waku-org/js-waku/issues/1964)) ([5fb1006](https://github.com/waku-org/js-waku/commit/5fb100602b347ad13718c85c52d22a932c15aa18))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @waku/core bumped from 0.0.28 to 0.0.29
    * @waku/discovery bumped from 0.0.1 to 0.0.2
    * @waku/interfaces bumped from 0.0.23 to 0.0.24
    * @waku/proto bumped from ^0.0.6 to ^0.0.7
    * @waku/relay bumped from 0.0.11 to 0.0.12
    * @waku/utils bumped from 0.0.16 to 0.0.17

## [0.0.24](https://github.com/waku-org/js-waku/compare/sdk-v0.0.23...sdk-v0.0.24) (2024-04-09)


### ⚠ BREAKING CHANGES

* **store:** move protocol implementation opinions to `@waku/sdk` ([#1913](https://github.com/waku-org/js-waku/issues/1913))
* @waku/discovery ([#1876](https://github.com/waku-org/js-waku/issues/1876))
* **lightpush:** move protocol implementation opinions to `@waku/sdk` ([#1887](https://github.com/waku-org/js-waku/issues/1887))

### Features

* @waku/discovery ([#1876](https://github.com/waku-org/js-waku/issues/1876)) ([1e86c3d](https://github.com/waku-org/js-waku/commit/1e86c3d63e6532dabbe10e01376d42dc6bcb0b85))
* Add cross peer dependency for [@waku](https://github.com/waku) packages ([#1889](https://github.com/waku-org/js-waku/issues/1889)) ([8f86740](https://github.com/waku-org/js-waku/commit/8f867404e3e950b6e491c8831068962c6968ed4e))
* **metadata:** Use error codes ([#1904](https://github.com/waku-org/js-waku/issues/1904)) ([1882023](https://github.com/waku-org/js-waku/commit/1882023c58c830fc31921fe786bce734536ac1da))


### Bug Fixes

* Make rollup replace env var ([#1951](https://github.com/waku-org/js-waku/issues/1951)) ([8763173](https://github.com/waku-org/js-waku/commit/8763173d2e370cb69a991cdbfa5cdd79f288b0be))


### Miscellaneous Chores

* **lightpush:** Move protocol implementation opinions to `@waku/sdk` ([#1887](https://github.com/waku-org/js-waku/issues/1887)) ([8deab11](https://github.com/waku-org/js-waku/commit/8deab11890160b40a22e7d11926a2307afb93af4))
* **store:** Move protocol implementation opinions to `@waku/sdk` ([#1913](https://github.com/waku-org/js-waku/issues/1913)) ([bf42c8f](https://github.com/waku-org/js-waku/commit/bf42c8f53a291172d6af64cbf72c4092146899df))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @waku/core bumped from 0.0.27 to 0.0.28
    * @waku/interfaces bumped from 0.0.22 to 0.0.23
    * @waku/relay bumped from 0.0.10 to 0.0.11
    * @waku/utils bumped from 0.0.15 to 0.0.16

## [0.0.23](https://github.com/waku-org/js-waku/compare/sdk-v0.0.22...sdk-v0.0.23) (2024-03-04)


### ⚠ BREAKING CHANGES

* rename local-discovery to local-peer-cache-discovery ([#1867](https://github.com/waku-org/js-waku/issues/1867))
* discourage the use of relay in browsers ([#1778](https://github.com/waku-org/js-waku/issues/1778))

### Features

* Add bootstrapPeers option and refactor sdk ([#1871](https://github.com/waku-org/js-waku/issues/1871)) ([9f198dd](https://github.com/waku-org/js-waku/commit/9f198dd149ef299e3edce69b93cc2942c6f24846))
* Create node and subscription by content topic ([ee2d417](https://github.com/waku-org/js-waku/commit/ee2d4176f8cca45a51b7dac0009f0eb01952f540))
* Decouple sharding params out of core ([e138b4f](https://github.com/waku-org/js-waku/commit/e138b4f5c49a35a37830e31e8be87d824f53249f))
* Local discovery ([#1811](https://github.com/waku-org/js-waku/issues/1811)) ([199f6ab](https://github.com/waku-org/js-waku/commit/199f6ab2ff83694b93e94e935e2925537e01e281))
* Make ShardingParams optional in sdk, required internally ([68d3229](https://github.com/waku-org/js-waku/commit/68d3229644f395bd84b2e2a7067c7b51e9da3dd0))


### Miscellaneous Chores

* Discourage the use of relay in browsers ([#1778](https://github.com/waku-org/js-waku/issues/1778)) ([906c933](https://github.com/waku-org/js-waku/commit/906c93329e4094c79e3f7f5c56e1b78afd778e1a))
* Rename local-discovery to local-peer-cache-discovery ([#1867](https://github.com/waku-org/js-waku/issues/1867)) ([f3cb10d](https://github.com/waku-org/js-waku/commit/f3cb10d484bac134377b8cfd77e077ffc33bd319))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @waku/core bumped from 0.0.26 to 0.0.27
    * @waku/dns-discovery bumped from 0.0.20 to 0.0.21
    * @waku/interfaces bumped from 0.0.21 to 0.0.22
    * @waku/local-peer-cache-discovery bumped from ^0.0.1 to ^1.0.0
    * @waku/peer-exchange bumped from ^0.0.19 to ^0.0.20
    * @waku/relay bumped from 0.0.9 to 0.0.10
    * @waku/utils bumped from 0.0.14 to 0.0.15

## [0.0.22](https://github.com/waku-org/js-waku/compare/sdk-v0.0.21...sdk-v0.0.22) (2024-01-10)


### ⚠ BREAKING CHANGES

* add support for sharded pubsub topics & remove support for named pubsub topics ([#1697](https://github.com/waku-org/js-waku/issues/1697))
* change all instances of `PubSubTopic` to `PubsubTopic` ([#1703](https://github.com/waku-org/js-waku/issues/1703))

### Features

* Add support for autosharded pubsub topics ([2bc3735](https://github.com/waku-org/js-waku/commit/2bc3735e4dcf85f06b3dee542024d7f20a40fac2))
* Add support for sharded pubsub topics & remove support for named pubsub topics ([#1697](https://github.com/waku-org/js-waku/issues/1697)) ([4cf2ffe](https://github.com/waku-org/js-waku/commit/4cf2ffefa75e0571805036b71644d2cdd4fe3192))
* Metadata protocol ([#1732](https://github.com/waku-org/js-waku/issues/1732)) ([9ac2a3f](https://github.com/waku-org/js-waku/commit/9ac2a3f36352523b79fcd8f8a94bd6e0e109fc30))


### Miscellaneous Chores

* Change all instances of `PubSubTopic` to `PubsubTopic` ([#1703](https://github.com/waku-org/js-waku/issues/1703)) ([3166a51](https://github.com/waku-org/js-waku/commit/3166a5135e77583da4fa722ee2aa47c785854a38))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @waku/utils bumped from 0.0.13 to 0.0.14
    * @waku/relay bumped from 0.0.8 to 0.0.9
    * @waku/core bumped from 0.0.25 to 0.0.26
    * @waku/dns-discovery bumped from 0.0.19 to 0.0.20
    * @waku/interfaces bumped from 0.0.20 to 0.0.21
    * @waku/peer-exchange bumped from ^0.0.18 to ^0.0.19

## [0.0.20](https://github.com/waku-org/js-waku/compare/sdk-v0.0.19...sdk-v0.0.20) (2023-10-16)


### Features

* **static-sharding:** Filter peer connections per shards ([#1626](https://github.com/waku-org/js-waku/issues/1626)) ([124a29e](https://github.com/waku-org/js-waku/commit/124a29ebba59c05fbbf199d969e6ba3f9e57d45b))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @waku/utils bumped from 0.0.11 to 0.0.12
    * @waku/relay bumped from 0.0.6 to 0.0.7
    * @waku/core bumped from 0.0.23 to 0.0.24
    * @waku/dns-discovery bumped from 0.0.17 to 0.0.18
    * @waku/interfaces bumped from 0.0.18 to 0.0.19
    * @waku/peer-exchange bumped from ^0.0.16 to ^0.0.17

## [0.0.19](https://github.com/waku-org/js-waku/compare/sdk-v0.0.18...sdk-v0.0.19) (2023-09-11)


### ⚠ BREAKING CHANGES

* set peer-exchange with default bootstrap ([#1469](https://github.com/waku-org/js-waku/issues/1469))

### Features

* Set peer-exchange with default bootstrap ([#1469](https://github.com/waku-org/js-waku/issues/1469)) ([81a52a8](https://github.com/waku-org/js-waku/commit/81a52a8097ba948783c9d798ba362af0f27e1c10))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @waku/utils bumped from 0.0.10 to 0.0.11
    * @waku/relay bumped from 0.0.5 to 0.0.6
    * @waku/core bumped from 0.0.22 to 0.0.23
    * @waku/dns-discovery bumped from 0.0.16 to 0.0.17
    * @waku/interfaces bumped from 0.0.17 to 0.0.18
    * @waku/peer-exchange bumped from ^0.0.15 to ^0.0.16

## [0.0.17](https://github.com/waku-org/js-waku/compare/sdk-v0.0.16...sdk-v0.0.17) (2023-07-26)


### ⚠ BREAKING CHANGES

* remove filter v1 ([#1433](https://github.com/waku-org/js-waku/issues/1433))
* upgrade to libp2p@0.45 ([#1400](https://github.com/waku-org/js-waku/issues/1400))

### Features

* Export interfaces and relay from sdk ([#1409](https://github.com/waku-org/js-waku/issues/1409)) ([0d9265a](https://github.com/waku-org/js-waku/commit/0d9265aaf15260be5974c551e84ca6290273dbf0))
* Upgrade to libp2p@0.45 ([#1400](https://github.com/waku-org/js-waku/issues/1400)) ([420e6c6](https://github.com/waku-org/js-waku/commit/420e6c698dd8f44d40d34e47d876da5d2e1ce85e))


### Miscellaneous Chores

* Remove filter v1 ([#1433](https://github.com/waku-org/js-waku/issues/1433)) ([d483644](https://github.com/waku-org/js-waku/commit/d483644a4bb4350df380719b9bcfbdd0b1439482))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @waku/utils bumped from 0.0.8 to 0.0.9
    * @waku/relay bumped from 0.0.3 to 0.0.4
    * @waku/core bumped from 0.0.20 to 0.0.21
    * @waku/interfaces bumped from 0.0.15 to 0.0.16
    * @waku/dns-discovery bumped from 0.0.14 to 0.0.15

## 0.0.16 (2023-06-08)


### ⚠ BREAKING CHANGES

* rename package from @waku/create to @waku/sdk ([#1386](https://github.com/waku-org/js-waku/issues/1386))

### Features

* Allow passing of multiple ENR URLs to DNS Discovery & dial multiple peers in parallel ([#1379](https://github.com/waku-org/js-waku/issues/1379)) ([f32d7d9](https://github.com/waku-org/js-waku/commit/f32d7d9fe0b930b4fa9c46b8644e6d21be45d5c1))
* Rename package from @waku/create to @waku/sdk ([#1386](https://github.com/waku-org/js-waku/issues/1386)) ([951ebda](https://github.com/waku-org/js-waku/commit/951ebdac9d5b594583acf5e4a21f6471fa81ff74))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @waku/utils bumped from * to 0.0.8
    * @waku/relay bumped from 0.0.2 to 0.0.3
    * @waku/core bumped from 0.0.19 to 0.0.20
    * @waku/dns-discovery bumped from 0.0.13 to 0.0.14
  * devDependencies
    * @waku/interfaces bumped from 0.0.14 to 0.0.15

## [0.0.15](https://github.com/waku-org/js-waku/compare/create-v0.0.14...create-v0.0.15) (2023-05-26)


### ⚠ BREAKING CHANGES

* filter v2 ([#1332](https://github.com/waku-org/js-waku/issues/1332))

### Features

* Filter v2 ([#1332](https://github.com/waku-org/js-waku/issues/1332)) ([8d0e647](https://github.com/waku-org/js-waku/commit/8d0e64796695fbafad0a033552eb4412bdff3d78))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @waku/relay bumped from 0.0.1 to 0.0.2
    * @waku/core bumped from 0.0.18 to 0.0.19
    * @waku/dns-discovery bumped from 0.0.12 to 0.0.13
  * devDependencies
    * @waku/interfaces bumped from 0.0.13 to 0.0.14

## [0.0.14](https://github.com/waku-org/js-waku/compare/create-v0.0.13...create-v0.0.14) (2023-05-18)


### ⚠ BREAKING CHANGES

* @waku/relay ([#1316](https://github.com/waku-org/js-waku/issues/1316))

### Features

* @waku/relay ([#1316](https://github.com/waku-org/js-waku/issues/1316)) ([50c2c25](https://github.com/waku-org/js-waku/commit/50c2c2540f3c5ff78d93f3fea646da0eee246e17))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @waku/relay bumped from * to 0.0.1
    * @waku/core bumped from * to 0.0.18
    * @waku/dns-discovery bumped from * to 0.0.12
  * devDependencies
    * @waku/interfaces bumped from * to 0.0.13

## [0.0.12](https://github.com/waku-org/js-waku/compare/create-v0.0.11...create-v0.0.12) (2023-04-03)


### ⚠ BREAKING CHANGES

* add and implement IReceiver ([#1219](https://github.com/waku-org/js-waku/issues/1219))

### Features

* Add and implement IReceiver ([#1219](https://github.com/waku-org/js-waku/issues/1219)) ([e11e5b4](https://github.com/waku-org/js-waku/commit/e11e5b4870aede7813b3ee4b60f5e625f6eac5a2))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @waku/core bumped from 0.0.15 to 0.0.16
    * @waku/dns-discovery bumped from 0.0.9 to 0.0.10
  * devDependencies
    * @waku/interfaces bumped from 0.0.10 to 0.0.11

## [0.0.9](https://github.com/waku-org/js-waku/compare/create-v0.0.8...create-v0.0.9) (2023-03-24)


### Bug Fixes

* **utils:** Include all ts files ([#1267](https://github.com/waku-org/js-waku/issues/1267)) ([c284159](https://github.com/waku-org/js-waku/commit/c284159ac8eab5bed2313fa5bc7fbea0e83d390f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @waku/core bumped from 0.0.12 to 0.0.13
    * @waku/dns-discovery bumped from 0.0.7 to 0.0.8
  * devDependencies
    * @waku/interfaces bumped from 0.0.9 to 0.0.10

## [0.0.8](https://github.com/waku-org/js-waku/compare/create-v0.0.7...create-v0.0.8) (2023-03-23)


### Bug Fixes

* @waku/create should not depend on @waku/peer-exchange ([f0ac886](https://github.com/waku-org/js-waku/commit/f0ac886593a96a7d63f75b481d0c2419c1084cda))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @waku/core bumped from 0.0.11 to 0.0.12
    * @waku/dns-discovery bumped from 0.0.6 to 0.0.7
  * devDependencies
    * @waku/interfaces bumped from 0.0.8 to 0.0.9

## [0.0.7](https://github.com/waku-org/js-waku/compare/create-v0.0.6...create-v0.0.7) (2023-03-16)


### ⚠ BREAKING CHANGES

* bump typescript
* bump libp2p dependencies

### Features

* DNS discovery as default bootstrap discovery ([#1114](https://github.com/waku-org/js-waku/issues/1114)) ([11819fc](https://github.com/waku-org/js-waku/commit/11819fc7b14e18385d421facaf2af0832cad1da8))


### Bug Fixes

* Prettier and cspell ignore CHANGELOG ([#1235](https://github.com/waku-org/js-waku/issues/1235)) ([4d7b3e3](https://github.com/waku-org/js-waku/commit/4d7b3e39e6761afaf5d05a13cc4b3c23e15f9bd5))
* Remove initialising peer-exchange while creating a node ([#1158](https://github.com/waku-org/js-waku/issues/1158)) ([1b41569](https://github.com/waku-org/js-waku/commit/1b4156902387ea35b24b3d6f5d22e4635ea8cf18))


### Miscellaneous Chores

* Bump libp2p dependencies ([803ae7b](https://github.com/waku-org/js-waku/commit/803ae7bd8ed3de665026446c23cde90e7eba9d36))
* Bump typescript ([12d86e6](https://github.com/waku-org/js-waku/commit/12d86e6abcc68e27c39ca86b4f0dc2b68cdd6000))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @waku/core bumped from * to 0.0.11
    * @waku/dns-discovery bumped from * to 0.0.6
    * @waku/peer-exchange bumped from * to 0.0.4
  * devDependencies
    * @waku/interfaces bumped from * to 0.0.8

## [Unreleased]

### Fixed

- Documentation links.

## [0.0.6] - 2022-12-19

### Fixed

- Missing dependency declarations.

## [0.0.5] - 2022-12-15

### Changed

- Renamed `createPrivacyNode` to `createRelayNode`.

## [0.0.4] - 2022-11-18

### Added

- Alpha version of `@waku/create`.

[unreleased]: https://github.com/waku-org/js-waku/compare/@waku/create@0.0.6...HEAD
[0.0.6]: https://github.com/waku-org/js-waku/compare/@waku/create@0.0.5...@waku/create@0.0.6
[0.0.5]: https://github.com/waku-org/js-waku/compare/@waku/create@0.0.4...@waku/create@0.0.5
[0.0.4]: https://github.com/waku-org/js-waku/compare/@waku/create@0.0.3...@waku/create@0.0.4
[0.0.3]: https://github.com/waku-org/js-waku/compare/@waku/create@0.0.2...%40waku/create@0.0.3
[0.0.2]: https://github.com/waku-org/js-waku/compare/@waku/create@0.0.1...%40waku/create@0.0.2
[0.0.1]: https://github.com/status-im/js-waku/compare/a20b7809d61ff9a9732aba82b99bbe99f229b935...%40waku/create%400.0.2
