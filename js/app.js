
var quchniaApp = angular.module('quchniaApp', [ 'ngRoute', 'ui.bootstrap', 'ja.qr' ] );

quchniaApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/admin/accept', {
                templateUrl: 'routes/accept.html',
                controller: 'itemsCtrl'
            }).
            when('/item/:hash', {
                templateUrl: 'routes/item.html',
                controller: 'itemCtrl'
            }).
            when('/list', {
                templateUrl: 'routes/list.html',
                controller: 'itemsCtrl'
            }).
            when('/idea', {
                templateUrl: 'routes/idea.html',
            }).
            when('/projekt', {
                templateUrl: 'routes/project.html',
            }).
            otherwise({
                redirectTo: 'list'
            });
}]);

quchniaApp.factory('dbFactory', [ '$http', function($http) {
    var factory = {
    };

    factory.getItems = function(callback) {
            $http.get('backend/items')
                .then(function(res) {
                    factory.items = res.data;
                    callback( factory.items );
                });
    };

    factory.addItem = function(item) {
        console.log(item);
        $http.post('backend/item/add', item)
            .then(function(res) {
                factory.items.push(item);
                callback( factory.items );
            });
    };

    factory.getItem = function(hash, callback) {
        if (hash === undefined) { 
            callback({});
        }
        $http.get('backend/item/get/'+hash)
            .then(function(res) {
                factory.item = res.data;
                callback( res.data );
            });
    };

    factory.updateItem = function(item) {
        $http.put('backend/item/update/'+item.hash, item)
            .then(function(res) {
                factory.getItems( 
                    function (items) { 
                        callback(items); 
                    }
                );
            });

    };
    factory.acceptItem = function(item,callback) {
        $http.get('backend/item/accept/'+item.hash, item)
            .then(function(res) {
                factory.getItems( 
                    function (items) { 
                        callback(items); 
                    }
                );

            });

    };
    factory.rejectItem = function(item,callback) {
        $http.get('backend/item/reject/'+item.hash, item)
            .then(function(res) {
                factory.getItems( 
                    function (items) { 
                        callback(items); 
                    }
                );
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
                $scope.item = {};
            }
            console.log('opening modal');
            modalInstance = $modal.open( {
                'templateUrl': 'modals/add_modal.html',
                'controller': 'modalCtrl',
                'size': 'lg',
                'scope': $scope
            });

            modalInstance.result.then(function (response) {
                if ($scope.edit) {
                    dbFactory.updateItem(response);        
                    $scope.addAlert('success', 'Edycja udana');
                } else {     
                    dbFactory.addItem(response);        
                    $scope.addAlert('success', 'Przedmiot został dodany. Niebawem pojawi się na stronie. Dzięki :)');
                }
                
            }, function () {
                if ($scope.edit) {
                    $scope.addAlert('warning', 'Nie to nie :P');
                } else {
                    $scope.addAlert('warning', 'A może jednak chcesz dodać nowy przedmiot?');
                }
            });
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




quchniaApp.controller('editCtrl', [ '$scope', 'dbFactory', function ($scope, dbFactory) {
    $scope.search.state = '';
    $scope.reverse = 1;
    $scope.predicate = 'state';


    $scope.acceptItem = function(item) {
        dbFactory.acceptItem(item,  function(items) { $scope.items = items; });
    };
    $scope.rejectItem = function(item) {
        dbFactory.rejectItem(item, function(items) { $scope.items = items; });
    };
}]);

quchniaApp.controller('itemsCtrl', [ '$scope', '$http', 'dbFactory',  function ($scope, $http, dbFactory, filterByState) {
    // $scope.search.state = 'accepted';  # uncomment or add to getItems
    dbFactory.getItems(function(items) {
        $scope.items = items;
    });

}]);

quchniaApp.controller('itemCtrl', [ '$scope', '$http', '$routeParams', 'dbFactory', function ($scope, $http, $routeParams, dbFactory) {
    $scope.item = { 'hash': 'QR Code' };
    dbFactory.getItem($routeParams.hash, function(item) {
        $scope.item = item;
    });
}]);

quchniaApp.filter('firstParagraph', function() {
  return function(input, limit) {
        if (!limit) {
            limit = 300;
        }
        if (!input) { 
            return '';
        }
        return input.length > limit ? input.substr(0,limit-1)+'...' : input;

    };
});





