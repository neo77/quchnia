
var quchniaApp = angular.module('quchniaApp', [ 'ui.bootstrap', 'ja.qr' ] );

quchniaApp.controller('alertsCtrl', [ '$scope', '$timeout', function($scope, $timeout) {
    $scope.alerts = [  ];
    

    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };

    $scope.addAlert = function(type, msg) {
        $scope.alerts.push({'msg': msg, 'type': type });
        $timeout(
            function () { 
                $scope.closeAlert(0); 
            }, 
            5000 
        );
    };

}]);

quchniaApp.controller('mainCtrl', [ '$scope', '$modal',  function($scope, $modal) {
    $scope.search = '';
    $scope.open = function (modalName) {
        var modalInstance = $modal.open( {
            'templateUrl': 'add_modal.html',
            'controller': 'modalCtrl',
            'size': 'lg'
        });
        modalInstance.result.then(function (response) {
            $scope.selected = response;
            $scope.addAlert('success', 'Przedmiot został dodany. Niebawem pojawi się na stronie. Dzięki :)');

            
        }, function () {
            console.log('Modal dismissed at: ' + new Date());
            $scope.addAlert('warning', 'A może jednak chcesz dodać nowy przedmiot?');
        });
    };
}]);


quchniaApp.controller('modalCtrl', [ '$scope', '$modalInstance', function modalController($scope, $modalInstance) {
    $scope.ok = function () {
        $modalInstance.close($scope.item);

    };
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);

quchniaApp.controller('carouselCtrl', [ '$scope', '$http', function ($scope, $http) {
    $scope.slides = {};
    $http.get('data/slides.json')
        .then(function(res) {
            $scope.banner = res.data;
        });
}]);

quchniaApp.controller('itemsCtrl', [ '$scope', '$http', function ($scope, $http) {
    $scope.items = [];
    $http.get('data/db.json')
        .then(function(res) {
            $scope.items = res.data;
        });
}]);

quchniaApp.controller('editCtrl', [ '$scope', function ($scope) {
    $scope.reverse = 1;
    $scope.predicate = 'state';
}]);

quchniaApp.filter('firstParagraph', function() {
  return function(input, limit) {
        if (!limit) {
            limit = 300;
        }
        return input.length > limit ? input.substr(0,limit-1)+'...' : input;

    };
});

quchniaApp.filter('filterByTitle', function($scope) {
  return function(input) {
        if ($scope.search === '') {
            return input;
        }
        if (input.title.match($scope.search)) {
            return input;
        } else {
            return '';
        }


    };
});

quchniaApp.controller('itemCtrl', [ '$scope', '$http', function ($scope, $http) {
    $scope.items = [];
    $scope.item = { 'hash': 'QR Code' };
    $http.get('data/db.json')
        .then(function(res) {
            $scope.items = res.data;
            $scope.item = $scope.items[0];
        });
}]);
