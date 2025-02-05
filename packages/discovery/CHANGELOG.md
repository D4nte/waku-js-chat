# Changelog

## [0.0.7](https://github.com/waku-org/js-waku/compare/discovery-v0.0.6...discovery-v0.0.7) (2025-02-05)


### Features

* Improve peer manager and re-integrate to light push  ([#2191](https://github.com/waku-org/js-waku/issues/2191)) ([62f93dc](https://github.com/waku-org/js-waku/commit/62f93dc8428132161dba8881c6adc162040ae758))
* Move Peer to PeerId ([#2246](https://github.com/waku-org/js-waku/issues/2246)) ([fc93fae](https://github.com/waku-org/js-waku/commit/fc93fae873ad032cc4f18c41ab98959eef785279))


### Bug Fixes

* Remove peer deps ([#2200](https://github.com/waku-org/js-waku/issues/2200)) ([f34fc4b](https://github.com/waku-org/js-waku/commit/f34fc4b2442f1cec326c8ebd45596445232fa65b))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @waku/interfaces bumped from 0.0.28 to 0.0.29
    * @waku/proto bumped from ^0.0.8 to ^0.0.9
    * @waku/enr bumped from 0.0.27 to 0.0.28
    * @waku/core bumped from 0.0.33 to 0.0.34
    * @waku/utils bumped from 0.0.21 to 0.0.22

## [0.0.6](https://github.com/waku-org/js-waku/compare/discovery-v0.0.5...discovery-v0.0.6) (2024-10-16)


### Features

* **filter:** Enhancing protocol peer management with mutex locks  ([#2137](https://github.com/waku-org/js-waku/issues/2137)) ([b2efce5](https://github.com/waku-org/js-waku/commit/b2efce5ec27807325685cc32f9333805e6321ac7))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @waku/interfaces bumped from 0.0.27 to 0.0.28
    * @waku/enr bumped from 0.0.26 to 0.0.27
    * @waku/core bumped from 0.0.32 to 0.0.33
    * @waku/utils bumped from 0.0.20 to 0.0.21

## [0.0.5](https://github.com/waku-org/js-waku/compare/discovery-v0.0.4...discovery-v0.0.5) (2024-09-05)


### Bug Fixes

* Improve node bootstrapping ([#2121](https://github.com/waku-org/js-waku/issues/2121)) ([0263cb8](https://github.com/waku-org/js-waku/commit/0263cb80c5d2bc61984b5357761236ba4f759036))
* Temporarily remove peer cross dependencies ([#2123](https://github.com/waku-org/js-waku/issues/2123)) ([f4b6bb0](https://github.com/waku-org/js-waku/commit/f4b6bb04b38842745c946b427bb3518680df09dc))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @waku/interfaces bumped from 0.0.26 to 0.0.27
    * @waku/enr bumped from 0.0.25 to 0.0.26
    * @waku/core bumped from 0.0.31 to 0.0.32
    * @waku/utils bumped from 0.0.19 to 0.0.20

## [0.0.4](https://github.com/waku-org/js-waku/compare/discovery-v0.0.3...discovery-v0.0.4) (2024-08-29)


### Features

* **peer-exchange:** Support continuous peer information updates ([#2088](https://github.com/waku-org/js-waku/issues/2088)) ([defe41b](https://github.com/waku-org/js-waku/commit/defe41bb9a826ab6d06f9aace283c0e90b7af56c))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @waku/interfaces bumped from 0.0.25 to 0.0.26
    * @waku/proto bumped from ^0.0.7 to ^0.0.8
    * @waku/enr bumped from 0.0.24 to 0.0.25
    * @waku/core bumped from 0.0.30 to 0.0.31
    * @waku/utils bumped from 0.0.18 to 0.0.19

## [0.0.3](https://github.com/waku-org/js-waku/compare/discovery-v0.0.2...discovery-v0.0.3) (2024-07-10)


### ⚠ BREAKING CHANGES

* **filter:** return error codes instead of throwing errors ([#1971](https://github.com/waku-org/js-waku/issues/1971))

### Features

* **filter:** Return error codes instead of throwing errors ([#1971](https://github.com/waku-org/js-waku/issues/1971)) ([4eb06c6](https://github.com/waku-org/js-waku/commit/4eb06c64eb05c015e2f51e3f45a9d7143a934385))


### Bug Fixes

* Bootstrapping with default pubsub topic ([#2031](https://github.com/waku-org/js-waku/issues/2031)) ([16e9116](https://github.com/waku-org/js-waku/commit/16e9116c7cf6be876e174fe9259921c8d5397a88))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @waku/interfaces bumped from 0.0.24 to 0.0.25
    * @waku/enr bumped from 0.0.23 to 0.0.24
    * @waku/core bumped from 0.0.29 to 0.0.30
    * @waku/utils bumped from 0.0.17 to 0.0.18

## [0.0.2](https://github.com/waku-org/js-waku/compare/discovery-v0.0.1...discovery-v0.0.2) (2024-04-30)


### Bug Fixes

* Add try catch to local store ([#1956](https://github.com/waku-org/js-waku/issues/1956)) ([e5e8cd5](https://github.com/waku-org/js-waku/commit/e5e8cd5e170defc1c50ec785568b92764e904dd5))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @waku/interfaces bumped from 0.0.23 to 0.0.24
    * @waku/proto bumped from ^0.0.6 to ^0.0.7
    * @waku/enr bumped from 0.0.22 to 0.0.23
    * @waku/core bumped from 0.0.28 to 0.0.29
    * @waku/utils bumped from 0.0.16 to 0.0.17

## 0.0.1 (2024-04-09)


### ⚠ BREAKING CHANGES

* @waku/discovery ([#1876](https://github.com/waku-org/js-waku/issues/1876))

### Features

* @waku/discovery ([#1876](https://github.com/waku-org/js-waku/issues/1876)) ([1e86c3d](https://github.com/waku-org/js-waku/commit/1e86c3d63e6532dabbe10e01376d42dc6bcb0b85))
* Peer-exchange uses error codes ([#1907](https://github.com/waku-org/js-waku/issues/1907)) ([877fe1d](https://github.com/waku-org/js-waku/commit/877fe1dc1daf6826b60ac5011af2915c47864d90))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @waku/interfaces bumped from 0.0.22 to 0.0.23
    * @waku/enr bumped from 0.0.21 to 0.0.22
    * @waku/core bumped from 0.0.27 to 0.0.28
    * @waku/utils bumped from 0.0.15 to 0.0.16
