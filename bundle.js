/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = {
  map: {
    centerLatitude: 43.583,
    centerLongitude: 39.725,
    zoom: 16,
  },
  areas: {
    fillOpacity: 0.5,
    strokeOpacity: 1,
  },
};


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

const District = __webpack_require__(3);
const Area = __webpack_require__(2);
const areasConfig = __webpack_require__(0).areas;

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


/***/ }),
/* 2 */
/***/ (function(module, exports) {

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


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

const { generateColor } = __webpack_require__(4);

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


/***/ }),
/* 4 */
/***/ (function(module, exports) {

function generateColor() {
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += Math.floor(Math.random() * 16).toString(16);
  }
  return color;
}

module.exports = {
  generateColor,
};


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

const DistrictsMap = __webpack_require__(1);
const mapConfig = __webpack_require__(0).map;

$(document).ready(function() {
  ymaps.ready(function() {
    const districtsMap = new DistrictsMap(ymaps, 'districts-map', {
      center: [mapConfig.centerLatitude, mapConfig.centerLongitude],
      zoom: mapConfig.zoom,
    });

    const $initDistrictAddingButton = $('#init-district-adding-btn');
    const $newDistrictName = $('#new-district-name');
    const $addNewDistrictBtn = $('#add-new-district-btn');
    const $cancelNewDistrictBtn = $('#cancel-new-district-btn');

    function render() {
      if (districtsMap.isNewDistrictCreating) {
        $initDistrictAddingButton.hide();
        $newDistrictName.show();
        $addNewDistrictBtn.show();
        $cancelNewDistrictBtn.show();
        return;
      }
      $initDistrictAddingButton.show();
      $newDistrictName.val('').hide();
      $addNewDistrictBtn.hide();
      $cancelNewDistrictBtn.hide();
    }

    $initDistrictAddingButton.click(function() {
      districtsMap.startCreatingNewDistrict();
      render();
    });

    $addNewDistrictBtn.click(function() {
      const districtName = $newDistrictName.val();
      if (!districtName) {
        alert('Введите название района');
        return;
      }
      districtsMap.finishCreatingNewDistrict(districtName);
      render();
    });

    $cancelNewDistrictBtn.click(function() {
      districtsMap.cancelCreatingNewDistrict();
      render();
    });

    $('#districts-map-container').on('click', '.remove-area-btn', function() {
      const isSure = confirm('Вы уверены?');
      if (isSure) {
        districtsMap.removeArea($(this).data('area-id'));
      }
    });

    $('#districts-map-container').on('click', '.edit-area-btn', function() {
      districtsMap.startEditingArea($(this).data('area-id'));
    });

    $('#districts-map-container').on('click', '.add-district-area-btn', function() {
      districtsMap.startAddingNewArea($(this).data('district-id'));
    });

    $('#log-districts').click(function() {
      console.log(districtsMap.serialize());
    });
  });
});


/***/ })
/******/ ]);