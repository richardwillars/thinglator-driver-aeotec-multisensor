class AeotecMultisensor {
    constructor() {
        this.driverSettings = {};
        this.nodeIdCache = {};
        this.commsInterface = null;
        this.processIncomingEvent = this.processIncomingEvent.bind(this);
    }
    init(driverSettingsObj, commsInterface, eventEmitter) {
        this.driverSettingsObj = driverSettingsObj;

        this.eventEmitter = eventEmitter;
        this.commsInterface = commsInterface;

        return this.driverSettingsObj.get().then((settings) => {
            this.driverSettings = settings;
            this.commsInterface.getValueChangedEventEmitter().on('aeotec-multisensor', this.processIncomingEvent);
        });
    }

    getName() {
        return 'aeotec-multisensor';
    }

    getType() {
        return 'sensor';
    }

    getInterface() {
        return 'zwave';
    }

    getEventEmitter() {
        return this.eventEmitter;
    }

    initDevices(devices) {
        return Promise.resolve().then(() => {
            this.nodeIdCache = {};
            devices.forEach((device) => {
                this.commsInterface.claimNode('aeotec-multisensor', device.specs.deviceId);
                this.nodeIdCache[device.specs.deviceId] = device._id;
            });
        });
    }

    getAuthenticationProcess() {
        return [];
    }

    discover() {
        return this.commsInterface.getUnclaimedNodes().then((nodes) => {
            nodes.forEach((node) => {
                if ((node.manufacturer === 'Aeotec') && (node.product === 'ZW100 MultiSensor 6')) {
                    this.commsInterface.claimNode('aeotec-multisensor', node.nodeid);
                }
            });

            return this.commsInterface.getNodesClaimedByDriver('aeotec-multisensor');
        }).then((nodes) => {
            const devices = [];
            nodes.forEach((node) => {
                devices.push({
                    deviceId: node.nodeid,
                    name: node.product,
                    commands: {
                        motion: true,
                        temperature: true,
                        humidity: true,
                        light: true,
                        uv: true,
                        batteryLevel: true
                    },
                    events: {
                        motion: true,
                        temperature: true,
                        humidity: true,
                        light: true,
                        uv: true,
                        batteryLevel: true
                    }
                });
            });
            return devices;
        });
    }

    processIncomingEvent(event) {
        const value = parseFloat(event.value);
        if (event.comclass === 49 && event.index === 1) {
            this.eventEmitter.emit('temperature', 'aeotec-multisensor', this.nodeIdCache[event.nodeId], {
                level: value
            });
        } else if (event.comclass === 49 && event.index === 5) {
            this.eventEmitter.emit('humidity', 'aeotec-multisensor', this.nodeIdCache[event.nodeId], {
                level: value
            });
        } else if (event.comclass === 128 && event.index === 0) {
            this.eventEmitter.emit('batteryLevel', 'aeotec-multisensor', this.nodeIdCache[event.nodeId], {
                level: value
            });
        } else if (event.comclass === 49 && event.index === 3) {
            this.eventEmitter.emit('light', 'aeotec-multisensor', this.nodeIdCache[event.nodeId], {
                level: value
            });
        } else if (event.comclass === 49 && event.index === 27) {
            this.eventEmitter.emit('uv', 'aeotec-multisensor', this.nodeIdCache[event.nodeId], {
                level: value
            });
        } else if (event.comclass === 113 && event.index === 10) {
            if (value === 8) {
                this.eventEmitter.emit('motion', 'aeotec-multisensor', this.nodeIdCache[event.nodeId], {
                    detected: true
                });
            } else if (value === 0) {
                this.eventEmitter.emit('motion', 'aeotec-multisensor', this.nodeIdCache[event.nodeId], {
                    detected: false
                });
            }
        }
    }

}

module.exports = AeotecMultisensor;
