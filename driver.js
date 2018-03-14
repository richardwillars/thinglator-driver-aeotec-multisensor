const driverId = "thinglator-driver-aeotec-multisensor";
let nodeIdCache = {};

const initDevices = async (devices, commsInterface) => {
  nodeIdCache = {};
  devices.forEach(device => {
    commsInterface.claimNode(driverId, device.originalId);
    nodeIdCache[device.originalId] = device.deviceId;
  });
};

const discover = async (commsInterface, events) => {
  const unclaimedNodes = await commsInterface.getUnclaimedNodes();
  await unclaimedNodes.forEach(async node => {
    if (
      node.manufacturer === "Aeotec" &&
      node.product === "ZW100 MultiSensor 6"
    ) {
      commsInterface.claimNode(driverId, node.nodeId);
      // Group 1 Reports
      await commsInterface.setValue(node.nodeId, 112, 1, 101, 241);

      // Group 1 Interval (every half an hour)
      await commsInterface.setValue(node.nodeId, 112, 1, 111, 1800);

      // battery or usb
      // await commsInterface.setValue(node.nodeId, 112, 1, 101, 240);

      // selected reporting (no)
      await commsInterface.setValue(node.nodeId, 112, 1, 40, 0);

      // motion reset (1 min)
      await commsInterface.setValue(node.nodeId, 112, 1, 3, 60);

      // motion sensor report (basic)
      await commsInterface.setValue(node.nodeId, 112, 1, 5, 1);

      // Enable Motion Sensor
      await commsInterface.setValue(node.nodeId, 112, 1, 4, 1);
    }
  });

  const claimedNodes = await commsInterface.getNodesClaimedByDriver(driverId);
  const devices = [];
  claimedNodes.forEach(node => {
    devices.push({
      originalId: node.nodeId,
      name: node.product,
      commands: {},
      events: {
        [events.MOTION]: true,
        [events.TEMPERATURE]: true,
        [events.HUMIDITY]: true,
        [events.LIGHT]: true,
        [events.UV]: true,
        [events.BATTERY_LEVEL]: true
      }
    });
  });
  return devices;
};

const processIncomingEvent = (info, createEvent, events) => {
  const value = parseFloat(info.value.value);
  if (info.comClass === 49 && info.index === 1) {
    createEvent(events.TEMPERATURE, nodeIdCache[info.nodeId], {
      level: value
    });
  } else if (info.comClass === 49 && info.index === 5) {
    createEvent(events.HUMIDITY, nodeIdCache[info.nodeId], {
      level: value
    });
  } else if (info.comClass === 128 && info.index === 0) {
    createEvent(events.BATTERY_LEVEL, nodeIdCache[info.nodeId], {
      level: value
    });
  } else if (info.comClass === 49 && info.index === 3) {
    createEvent(events.LIGHT, nodeIdCache[info.nodeId], {
      level: value
    });
  } else if (info.comClass === 49 && info.index === 27) {
    createEvent(events.UV, nodeIdCache[info.nodeId], {
      level: value
    });
  } else if (info.comClass === 113 && info.index === 10) {
    if (value === 8) {
      createEvent(events.MOTION, nodeIdCache[info.nodeId], {
        detected: true
      });
    } else if (value === 0) {
      createEvent(events.MOTION, nodeIdCache[info.nodeId], {
        detected: false
      });
    }
  }
};

module.exports = async (
  getSettings,
  updateSettings,
  commsInterface,
  events,
  createEvent,
  eventEmitter
) => {
  eventEmitter.on(driverId, e => processIncomingEvent(e, createEvent, events));

  return {
    initDevices: async devices => initDevices(devices, commsInterface),
    authentication_getSteps: () => [],
    discover: async () => discover(commsInterface, events)
  };
};
