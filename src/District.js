const { generateColor } = require('./helpers');

class District {
  constructor() {
    this._id = this._getNextId();
    this._name = '';
    this._areasFillColor = generateColor();
    this._areas = [];
  }

  _getNextId() {
    return District._nextId++;
  }

  addArea(area) {
    this._areas.push(area);
  }

  removeArea(areaId) {
    this._areas = this._areas.filter((area) => area.id !== areaId);
  }

  get id() {
    return this._id;
  }

  get areasFillColor() {
    return this._areasFillColor;
  }

  get areas() {
    return this._areas;
  }

  get name() {
    return this._name;
  }

  set name(name) {
    this._name = name;
  }
}

District._nextId = 1;

module.exports = District;
