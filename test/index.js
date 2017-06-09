/* eslint-disable new-cap, no-unused-expressions, no-undef, global-require */
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const driverTests = require('thinglator/utils/testDriver');

const expect = chai.expect; // eslint-disable-line no-unused-vars
chai.use(sinonChai);

const driverName = 'aeotec-multisensor';
const driverType = 'sensor';
const driverInterface = 'zwave';

const Driver = require('../index');

driverTests(driverName, Driver, driverType, driverInterface, expect);

describe('functionality', () => {
    let driver;
    let getUnclaimedNodesStub;
    let getNodesClaimedByDriverStub;
    let claimNodeStub;
    let setValueStub;
    let eventEmitterStub;

    beforeEach(() => {
        getUnclaimedNodesStub = sinon.stub().returns(Promise.resolve([
            {
                manufacturer: 'Aeotec',
                product: 'ZW100 MultiSensor 6',
                nodeid: 3
            },
            {
                manufacturer: 'Foo',
                product: 'Bar',
                nodeid: 4
            }
        ]));

        getNodesClaimedByDriverStub = sinon.stub().returns(Promise.resolve([]));
        claimNodeStub = sinon.stub();
        setValueStub = sinon.stub().returns(Promise.resolve());
        eventEmitterStub = sinon.stub();

        driver = new Driver();
        driver.init({
            get: () => Promise.resolve({})
        }, {
            getValueChangedEventEmitter: () => ({
                on: sinon.stub()
            }),
            getUnclaimedNodes: getUnclaimedNodesStub,
            getNodesClaimedByDriver: getNodesClaimedByDriverStub,
            claimNode: claimNodeStub,
            setValue: setValueStub
        }, {
            emit: eventEmitterStub
        });
    });

    describe('initDevices method', () => {
        it('should initialise existing devices', () => {
            const devices = [{
                _id: 'a',
                specs: {
                    deviceId: 5
                }
            },
            {
                _id: 'b',
                specs: {
                    deviceId: 6
                }
            }];
            return driver.initDevices(devices).then(() => {
                expect(claimNodeStub.firstCall).to.have.been.calledWith('aeotec-multisensor', 5);
                expect(claimNodeStub.secondCall).to.have.been.calledWith('aeotec-multisensor', 6);
            });
        });
    });

    describe('getAuthenticationProcess method', () => {
        it('should return the authentication process', () => {
            expect(driver.getAuthenticationProcess()).to.deep.equal([]);
        });
    });

    describe('discover method', () => {
        it('should look for unclaimed zwave devices and claim them', () => driver.discover().then(() => {
            expect(getUnclaimedNodesStub).to.have.been.calledOnce;
            expect(claimNodeStub).to.have.been.calledOnce;
            expect(claimNodeStub).to.have.been.calledWith('aeotec-multisensor', 3);
        }));
    });

    describe('processIncomingEvent method', () => {
        it('should process the incoming temperature event accordingly', () => {
            driver.nodeIdCache = {
                5: 'a',
                6: 'b'
            };
            driver.processIncomingEvent({
                comclass: 49, index: 1, nodeId: 6, value: 73
            });
            expect(eventEmitterStub).to.have.been.calledWith('temperature', 'aeotec-multisensor', 'b', {
                level: 73
            });
        });

        it('should process the incoming humidity event accordingly', () => {
            driver.nodeIdCache = {
                5: 'a',
                6: 'b'
            };
            driver.processIncomingEvent({
                comclass: 49, index: 5, nodeId: 6, value: 50
            });
            expect(eventEmitterStub).to.have.been.calledWith('humidity', 'aeotec-multisensor', 'b', {
                level: 50
            });
        });

        it('should process the incoming batteryLevel event accordingly', () => {
            driver.nodeIdCache = {
                5: 'a',
                6: 'b'
            };
            driver.processIncomingEvent({
                comclass: 128, index: 0, nodeId: 6, value: 70
            });
            expect(eventEmitterStub).to.have.been.calledWith('batteryLevel', 'aeotec-multisensor', 'b', {
                level: 70
            });
        });

        it('should process the incoming light event accordingly', () => {
            driver.nodeIdCache = {
                5: 'a',
                6: 'b'
            };
            driver.processIncomingEvent({
                comclass: 49, index: 3, nodeId: 6, value: 50
            });
            expect(eventEmitterStub).to.have.been.calledWith('light', 'aeotec-multisensor', 'b', {
                level: 50
            });
        });

        it('should process the incoming uv event accordingly', () => {
            driver.nodeIdCache = {
                5: 'a',
                6: 'b'
            };
            driver.processIncomingEvent({
                comclass: 49, index: 27, nodeId: 6, value: 40
            });
            expect(eventEmitterStub).to.have.been.calledWith('uv', 'aeotec-multisensor', 'b', {
                level: 40
            });
        });

        it('should process the incoming temperature event accordingly', () => {
            driver.nodeIdCache = {
                5: 'a',
                6: 'b'
            };
            driver.processIncomingEvent({
                comclass: 113, index: 10, nodeId: 6, value: 8
            });
            driver.processIncomingEvent({
                comclass: 113, index: 10, nodeId: 6, value: 0
            });
            expect(eventEmitterStub.firstCall).to.have.been.calledWith('motion', 'aeotec-multisensor', 'b', {
                detected: true
            });
            expect(eventEmitterStub.secondCall).to.have.been.calledWith('motion', 'aeotec-multisensor', 'b', {
                detected: false
            });
        });
    });
});
