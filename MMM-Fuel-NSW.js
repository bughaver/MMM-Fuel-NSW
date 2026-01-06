/*! *****************************************************************************
  mmm-fuel-nsw
  Version 1.0.0

  A MagicMirror² module to display fuel prices from New South Wales, Australia.
  Please submit bugs at https://github.com/bughaver/MMM-Fuel-NSW/issues

  (c) [Author]
  Licence: MIT

  This file is auto-generated. Do not edit.
***************************************************************************** */
!function(){"use strict";class t{static getPriceStyle(){return{style:"currency",currency:"AUD",minimumFractionDigits:2,maximumFractionDigits:2}}static getDistanceStyle(){return{style:"decimal",minimumFractionDigits:1,maximumFractionDigits:1}}static getPrice(e){return e.price.toLocaleString("en-AU",t.getPriceStyle())}static getDistance(e){return`${e.distance.toLocaleString("en-AU",t.getDistanceStyle())}km`}static getStationName(t){return t.name}static getOpenStatus(t){return t.isClosingSoon?"Closing Soon":t.isOpenNow?"Open":"Closed"}static getFuelType(t){return t.fieldType}static getTankPrice(e){return void 0===e.tankPrice?"":e.tankPrice.toLocaleString("en-AU",t.getPriceStyle())}}Module.register("MMM-Fuel-NSW",{defaults:{fuelType:"P95",brands:[],radius:3,sortBy:"price",limit:3,distance:10,lat:-33.8688,long:151.2093,updateIntervalInSeconds:600,maxWidth:"100%",showDistance:!0,showAddress:!0,showLogo:!0,showOpenStatus:!0,showFuelType:!0,showClosedStations:!0,borderStyle:"all",showLastUpdate:!0,displayMode:"list",alignment:"center",showTankPrice:void 0},getScripts:()=>["moment.js"],getStyles:()=>["MMM-Fuel-NSW.css"],getTranslations:()=>({en:"translations/en.json"}),getTemplate:()=>"templates/MMM-Fuel-NSW.njk",getTemplateData(){return{config:this.config,stations:this.state?.stations||[],lastUpdate:moment(this.state?.lastUpdate).format("HH:mm"),utils:t}},start(){this.loadData(),this.scheduleUpdate(),this.updateDom()},scheduleUpdate(){this.config.updateIntervalInSeconds=this.config.updateIntervalInSeconds<120?120:this.config.updateIntervalInSeconds,setInterval(()=>{this.loadData()},1e3*this.config.updateIntervalInSeconds)},loadData(){this.sendSocketNotification(`FUEL_REQUEST-${this.identifier}`,this.config)},socketNotificationReceived(t,e){t===`FUEL_RESPONSE-${this.identifier}`&&(this.state=e,this.updateDom())}})}();
