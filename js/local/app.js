var app = angular.module('app', ['ui.router']);

app.constant('config', {
    token: 'IQTJ22YJ5ROS2LCOO4UH',
    key: 'AIzaSyBlvkNGtYaR1VDf3Gy2c33bbEV58uxoicg'
});

app.factory('MainSvc', function($http, $q, config) {
    return {
        search: function(q, location) {
            var url = 'https://www.eventbriteapi.com/v3/events/search/?token=' + config.token;
            var sort = '&sort_by=date';
            var q = '&q=' + q;
            var dt = "&start_date.keyword=this_week";
            var popular = '&popular=on'
            url += q;
            url += sort;
            url += dt;
            // url += popular;
            if (location != null) {
                var location = '&location.latitude=' + location.latitude + '&location.longitude=' + location.longitude;
                var within = '&location.within=100mi';
                url += location;
                url += within;
            }
            return $http.get(url);
        },
        detail: function(id) {
            var d = $q.defer();
            var url = 'https://www.eventbriteapi.com/v3/events/' + id + '/?token=' + config.token
            return $http.get(url);
        },
        venue: function(id) {
            var url = 'https://www.eventbriteapi.com/v3/venues/' + id + '/?token=' + config.token;
            return $http.get(url);
        },
        location: function(location) {
            var url = 'https://maps.googleapis.com/maps/api/geocode/json?key=' + config.key;
            var loc = '&latlng=' + location.latitude + ',' + location.longitude;
            url += loc;
            return $http.get(url);
        }
    }
});

app.controller('MainCtrl', function($scope, $state) {
    $scope.search = function() {
        $state.go('search');
    }
});

app.controller('EventsCtrl', function($scope, MainSvc) {
    $scope.q = '';

    $scope.getImage = function(e) {
        var a = e.logo === null ? "/img/eventz.jpg" : e.logo.url;
        return a;
    }
    $scope.search = function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                MainSvc.location(position.coords).then(function(res) {
                    var city = "";
                    var country = "";
                    var x = res.data.results[0].address_components;
                    for (var i in x) {
                        if (x[i].types[0] === 'administrative_area_level_1')
                            city = x[i].long_name;
                        if (x[i].types[0] === 'country')
                            country = x[i].long_name;
                    }
                    $scope.location = city + ', ' + country;
                });
                MainSvc.search($scope.q, position.coords).then(function(res) {
                    $scope.events = res.data.events;
                })
            });
        } else {
            MainSvc.search($scope.q, null).then(function(res) {
                $scope.events = res.data.events;
            })
        }
    }
    $scope.search();
})

app.controller('DetailCtrl', function($scope, $stateParams, MainSvc) {
    var id = $stateParams.id;
    MainSvc.detail(id).then(function(res) {
        $scope.o = res.data;
        // MainSvc.venue(res.data.venue_id).then(function (resx){
        // 	var o = res.data;
        // 	o.venue = resx.data;
        // 	$scope.o = o;
        // 	console.log(o)
        // })
    })
})



app.config(function($stateProvider, $urlRouterProvider, $httpProvider) {
    $stateProvider

        .state('home', {
        url: '/',
        templateUrl: 'tpl/home.html',
    })

    .state('events', {
        url: '/events',
        templateUrl: 'tpl/events.html',
        controller: 'EventsCtrl'
    })

    .state('detail', {
        url: '/detail/:id',
        templateUrl: 'tpl/detail.html',
        controller: 'DetailCtrl'
    })

    ;

    $urlRouterProvider.otherwise('/');
});
