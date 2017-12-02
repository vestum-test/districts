class Area {
  constructor(districtId, polygon) {
    this._id = this._getNextId();
    this._districtId = districtId;
    this._polygon = polygon;
  }

  _getNextId() {
    return Area._nextId++;
  }

  get id() {
    return this._id;
  }

  get districtId() {
    return this._districtId;
  }

  get polygon() {
    return this._polygon;
  }

  get coordinates() {
    return _.cloneDeep(this._polygon.geometry.getCoordinates()[0]);
  }
}

Area._nextId = 1;

module.exports = Area;
