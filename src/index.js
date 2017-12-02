const DistrictsMap = require('./DistrictsMap');
const mapConfig = require('./config').map;

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
