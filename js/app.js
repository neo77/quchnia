
var quchniaApp = angular.module('quchniaApp', [ 'ui.bootstrap', 'ja.qr' ] );

quchniaApp.factory('dbFactory', [ '$http', function($http) {
    var factory = {
    };

    factory.getItems = function(callback) {
        //if (!factory.items) {
            $http.get('data/db.json')
                .then(function(res) {
                    factory.items = res.data;
                    console.log(factory.items);
                    callback( factory.items );
                });
        //} else {
        //    return factory.items;
        //}
    };

    factory.addItem = function(item) {
        item.timestamp = new Date();
        item.hash = 'http://www.onet.pl'; // tmp;
        item.images = [ 'img/items/pomidor-1.jpg' ]; //tmp
        item.state = 'waiting';
        item.stars = 0;
        item.about = item.about || '';
        item.about_me = item.about_me || '';
        factory.items.push(item);
    };

    factory.getItem = function(hash, callback) {
        for (var index in factory.items)  {
            if (factory.items[index].hash == hash) { 
                callback( factory.items[index] ); 
                return;
            }
        }
        callback({});
    };

    factory.updateItem = function(item) {
        factory.getItem(item.hash, function(dbItem) {
            angular.forEach(item, function(value,key) {
                dbItem[key] = value;
            });
        });
    };
    return factory;
}]);


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

quchniaApp.controller('mainCtrl', [ '$scope', '$modal', 'dbFactory', function($scope, $modal, dbFactory) {
    $scope.search = { };
    $scope.open = function (hash) {
        var modalInstance;

        dbFactory.getItem(hash, function(result) {
            $scope.item = result;
            if (result.hash) {
                $scope.edit = true;
            } else {
                $scope.edit = false;
            }
            modalInstance = $modal.open( {
                'templateUrl': 'add_modal.html',
                'controller': 'modalCtrl',
                'size': 'lg',
                'scope': $scope
            });
        });
 
        modalInstance.result.then(function (response) {
            if ($scope.edit) {
                $scope.addAlert('success', 'Edycja udana');
            } else {     
                dbFactory.addItem(response);        

                $scope.addAlert('success', 'Przedmiot został dodany. Niebawem pojawi się na stronie. Dzięki :)');
            }
            
        }, function () {
            if ($scope.edit) {
                $scope.addAlert('warning', 'Nie to nie :P');
            } else {
                dbFactory.updateItem(response);        
                $scope.addAlert('warning', 'A może jednak chcesz dodać nowy przedmiot?');
            }
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

quchniaApp.controller('itemsCtrl', [ '$scope', '$http', 'dbFactory',  function ($scope, $http, dbFactory, filterByState) {
    // $scope.search.state = 'accepted';  # uncomment or add to getItems
    dbFactory.getItems(function(items) {
        $scope.items = items;
    });

}]);



quchniaApp.controller('editCtrl', [ '$scope', 'dbFactory', function ($scope, dbFactory) {
    $scope.search.state = '';
    $scope.reverse = 1;
    $scope.predicate = 'state';

    $scope.rejectItem = function(item) {
        dbFactory.updateItem({ "hash": item.hash, "state": "rejected"});
    };
    $scope.acceptItem = function(item) {
        dbFactory.updateItem({ "hash": item.hash, "state": "accepted"});
    };
}]);

quchniaApp.filter('firstParagraph', function() {
  return function(input, limit) {
        if (!limit) {
            limit = 300;
        }
        return input.length > limit ? input.substr(0,limit-1)+'...' : input;

    };
});




quchniaApp.controller('itemCtrl', [ '$scope', '$http', 'dbFactory', function ($scope, $http, dbFactory) {
    dbFactory.getItems(function(items) {
        $scope.item = items[0];
    });
    $scope.item = { 'hash': 'QR Code' };
}]);

