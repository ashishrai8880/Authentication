
module.exports = Object.freeze({
  PLATFORM: { '1': 'web', '2': 'android', '3': 'android_tv', '4': 'fire_tv', '5': 'ios' },
  ROW:"ROW",
  get COUNTRY(){
     return ['IN', 'US', 'PK', 'BD', 'AE', 'AF', 'NP', 'SG', this.ROW]
  }
});
