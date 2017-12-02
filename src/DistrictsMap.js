const District = require('./District');
const Area = require('./Area');
const areasConfig = require('./config').areas;

class DistrictsMap {
  constructor(ymaps, mapElemId, mapConfig) {
    this._ymaps = ymaps;
    this._map = new this._ymaps.Map(mapElemId, mapConfig);
    this._districts = [];
    this._areas = [];

    this._currentCreatingDistrict = null;
    this._currentAddingArea = null;
    this._currentEditingArea = null;

    this.isNewDistrictCreating = false;
  }

  _getDistrictById(districtId) {
    for (let district of this._districts) {
      if (district.id === districtId) {
        return district;
      }
    }
    return null;
  }

  _getAreaById(areaId) {
    for (let area of this._areas) {
      if (area.id === areaId) {
        return area;
      }
    }
    return null;
  }

  _preventAreasBalloonShowing() {
    for (let area of this._areas) {
      area.polygon.options.set('openBalloonOnClick', false);
    }
  }

  _allowAreasBalloonShowing() {
    for (let area of this._areas) {
      area.polygon.options.set('openBalloonOnClick', true);
    }
  }

  startCreatingNewDistrict() {
    this.isNewDistrictCreating = true;
    const newDistrict = new District();
    this._currentCreatingDistrict = newDistrict;
    this._districts.push(newDistrict);
    this.startAddingNewArea(newDistrict.id);
  }

  finishCreatingNewDistrict(districtName) {
    this._currentCreatingDistrict.name = districtName;
    try {
      this.finishAddingNewArea();
    } catch(e) {
      alert(e.message);
      return;
    }
    this._currentCreatingDistrict = null;
    this.isNewDistrictCreating = false;
  }

  cancelCreatingNewDistrict() {
    this._map.geoObjects.remove(this._currentAddingArea.polygon);
    this._districts = this._districts.filter((district) => district.id !== this._currentCreatingDistrict.id);
    this._areas = this._areas.filter((area) => area.id !== this._currentAddingArea.id);
    this._currentCreatingDistrict = null;
    this._currentAddingArea = null;
    this.isNewDistrictCreating = false;
  }

  startAddingNewArea(districtId) {
    const district = this._getDistrictById(districtId);
    const districtColor = district.areasFillColor;
    const newArea = new Area(districtId, new this._ymaps.Polygon([], {}, {
      editorDrawingCursor: 'crosshair',
      fillColor: districtColor,
      fillOpacity: areasConfig.fillOpacity,
      strokeColor: districtColor,
      strokeOpacity: areasConfig.strokeOpacity,
    }));
    this._map.geoObjects.add(newArea.polygon);
    for (let area of district.areas) {
      area.polygon.balloon.close();
    }
    this._areas.push(newArea);
    district.addArea(newArea);
    newArea.polygon.editor.startDrawing();
    if (!this.isNewDistrictCreating) {
      newArea.polygon.editor.options.set('menuManager',
        (menuItems) => {
          menuItems.push({
            id: 'stopAdding',
            title: 'Готово',
            onClick: () => {
              try {
                this.finishAddingNewArea();
              } catch(e) {
                alert(e.message);
              }
            },
          });
          return menuItems;
      });
    }
    this._currentAddingArea = newArea;
    this._preventAreasBalloonShowing();
  }

  finishAddingNewArea() {
    if (this._currentAddingArea.coordinates.length < 4) {
      throw new Error('Добавьте область как минимум с тремя вершинами');
    }
    this._currentAddingArea.polygon.editor.stopDrawing();
    this._currentAddingArea.polygon.editor.stopEditing();
    const districtName = this._getDistrictById(this._currentAddingArea.districtId).name;
    this._currentAddingArea.polygon.properties.set('balloonContentHeader', _.escape(districtName));
    this._currentAddingArea.polygon.properties.set('balloonContentBody', `
      <button type="button"
              class="edit-area-btn area-btn btn btn-primary"
              data-area-id="${this._currentAddingArea.id}">
        Редактировать область
      </button>
      <button type="button"
              class="add-district-area-btn area-btn btn btn-success"
              data-district-id="${this._currentAddingArea.districtId}">
        Добавить область района
      </button>
      <button type="button"
              class="remove-area-btn area-btn btn btn-danger"
              data-area-id="${this._currentAddingArea.id}">
        Удалить область
      </button>
    `);
    this._currentAddingArea = null;
    this._allowAreasBalloonShowing();
  }

  startEditingArea(areaId) {
    this._currentEditingArea = this._getAreaById(areaId);
    this._currentEditingArea.polygon.balloon.close();
    this._currentEditingArea.polygon.editor.startEditing();
    this._currentEditingArea.polygon.editor.options.set('menuManager',
      (menuItems) => {
        menuItems.push({
          id: 'stopEditing',
          title: 'Закончить редактирование',
          onClick: this.finishEditingArea.bind(this),
        });
        return menuItems;
    });
    this._preventAreasBalloonShowing();
  }

  finishEditingArea() {
    if (this._currentEditingArea.coordinates.length < 4) {
      alert('Область должна содержать как минимум три вершины');
      return;
    }
    this._currentEditingArea.polygon.editor.stopEditing();
    this._currentEditingArea = null;
    this._allowAreasBalloonShowing();
  }

  removeArea(areaId) {
    const area = this._getAreaById(areaId);
    this._areas = this._areas.filter((area) => area.id !== areaId);
    this._getDistrictById(area.districtId).removeArea(areaId);
    this._map.geoObjects.remove(area.polygon);
    this._districts = this._districts.filter((district) => district.areas.length > 0);
  }

  serialize() {
    return this._districts.map((district) => ({
      name: district.name,
      areas: district.areas.map((area) => area.coordinates),
    }));
  }
}

module.exports = DistrictsMap;
