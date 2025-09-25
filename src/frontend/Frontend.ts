import FrontendService from './FrontendService';

// Global or injected variable declarations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Module: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const moment: any;

Module.register('MMM-Fuel-NSW', {
  defaults: {
    fuelType: 'P95',
    brands: [],
    radius: 3,
    sortBy: 'price',
    updateIntervalInSeconds: 600,
    maxWidth: '100%',
    showDistance: true,
    showAddress: true,
    showLogo: true,
    showOpenStatus: true,
    showFuelType: true,
    borderStyle: 'all',
    showLastUpdate: true,
    displayMode: 'list',
    alignment: 'center',
    lat: -33.8688, // Sydney coordinates as example
    long: 151.2093,
    limit: 3,
  },

  getScripts() {
    return ['moment.js'];
  },

  getStyles() {
    return ['MMM-Fuel-NSW.css'];
  },

  getTranslations() {
    return {
      en: 'translations/en.json',
    };
  },

  getTemplate() {
    return 'templates/MMM-Fuel-NSW.njk';
  },

  getTemplateData() {
    return {
      config: this.config,
      stations: this.state?.stations || [],
      lastUpdate: moment(this.state?.lastUpdate).format('HH:mm'),
      utils: FrontendService,
    };
  },

  start() {
    this.loadData();
    this.scheduleUpdate();
    this.updateDom();
  },

  scheduleUpdate() {
    this.config.updateIntervalInSeconds =
      this.config.updateIntervalInSeconds < 120 ? 120 : this.config.updateIntervalInSeconds;
    setInterval(() => {
      this.loadData();
    }, this.config.updateIntervalInSeconds * 1000);
  },

  loadData() {
    this.sendSocketNotification(`FUEL_REQUEST-${this.identifier}`, this.config);
  },

  socketNotificationReceived(notificationIdentifier: string, payload: unknown) {
    if (notificationIdentifier === `FUEL_RESPONSE-${this.identifier}`) {
      this.state = payload;
      this.updateDom();
    }
  },
});
