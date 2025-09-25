import * as NodeHelper from 'node_helper';
import * as Log from 'logger';
import { State } from '../types/State';
import { BackendService } from './BackendService';
import { Config } from '../types/Config';

module.exports = NodeHelper.create({
  /**
   * Backend service instance
   */
  backendService: null as BackendService | null,

  /**
   * Initialize the helper
   */
  start() {
    Log.log(`${this.name} helper method started...`);
    this.backendService = new BackendService();
  },

  /**
   * Handle incoming socket notifications
   * @param notification The notification type
   * @param payload The notification payload
   */
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
        // Send empty response or error state
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
