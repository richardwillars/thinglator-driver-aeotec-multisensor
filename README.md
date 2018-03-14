#thinglator-driver-aeotec-multisensor

An driver that allows Thinglator to talk to Aeotec multisensors (gen 6)

## Requirements

* node.js 8.9+
* Thinglator - https://github.com/richardwillars/thinglator
* Thinglator zwave interface

## Installation for usage

Navigate to the root of your Thinglator installation and run:

> yarn add thinglator-driver-aeotec-multisensor

> yarn dev

# Installation for development

Navigate to the root of the thinglator-driver-aeotec-multisensor project and run:

> yarn install

> yarn link

Navigate to the root of your Thinglator installation and run:

> yarn add thinglator-driver-aeotec-multisensor

Go to the thinglator project and run:

> yarn link thinglator-driver-aeotec-multisensor

This will point thinglator/node_modules/thinglator-driver-aeotec-multisensor to the directory where you just installed thinglator-driver-aeotec-multisensor. This makes it easier for development and testing of the module.

> yarn dev

## Test

> yarn test
> or
> yarn test:watch
