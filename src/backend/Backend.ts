import * as NodeHelper from 'node_helper';
import * as Log from 'logger';
import { State, Config } from '../Types';
import { BackendService } from './Service/BackendService';
import { BackendRepository } from './Service/Repository/BackendRepository';
import { BackendMapper } from './Service/Repository/Mapper/BackendMapper';
import { FuelApiConnector } from './Service/Repository/Connector/FuelApiConnector';

module.exports = NodeHelper.create({
  backendService: null as BackendService | null,

  async start() {
    Log.log(`${this.name} helper method started...`);

    const fuelApiConnector = new FuelApiConnector();
    const backendMapper = new BackendMapper();
    const backendRepository = new BackendRepository(backendMapper, fuelApiConnector);
    this.backendService = new BackendService(backendRepository);
  },

  async socketNotificationReceived(notification: string, payload: Config) {
    if (notification.includes('FUEL_REQUEST')) {
      const identifier = notification.substring('FUEL_REQUEST'.length + 1);

      try {
        if (!this.backendService) {
          throw new Error('Backend service not initialized');
        }

        const stations = await this.backendService.getFuelStations(payload);
        const response: State = {
          lastUpdate: Date.now(),
          stations,
        };
        this.sendSocketNotification(`FUEL_RESPONSE-${identifier}`, response);
      } catch (error) {
        Log.error('Error fetching fuel prices:', error);
        const response: State = {
          lastUpdate: Date.now(),
          stations: [],
        };
        this.sendSocketNotification(`FUEL_RESPONSE-${identifier}`, response);
      }
    } else {
      Log.warn(`${notification} is invalid notification`);
    }
  },
});
