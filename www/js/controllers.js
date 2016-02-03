angular.module('app.controllers', [])

.controller('MapController', function($scope, $ionicLoading, $ionicPopup, $rootScope) {
 
    google.maps.event.addDomListener(window, 'load', function() {
        var myLatlng = new google.maps.LatLng(-15.780, -47.929);
 
        var mapOptions = {
            center: myLatlng,
            zoom: 10,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
 
        var map = new google.maps.Map(document.getElementById("map"), mapOptions);

        navigator.geolocation.getCurrentPosition(function(pos) {
            $rootScope.pos = {lat: pos.coords.latitude, lng: pos.coords.longitude}
            map.setCenter($rootScope.pos);
            $scope.map.setZoom(10);
            var marker = new google.maps.Marker({
                position: $rootScope.pos,
                map: map,
                title: 'Minha Posição',
                icon: 'img/home.png'
            });
        }, function(error){
            $ionicPopup.alert({
                title: 'Erro!',
                template: 'Não foi possivel encontrar sua localização!'
            });
        });
 
        $scope.map = map;
    }); 


    $rootScope.makeMarkers = function(pontos, tipo) {
        
        if(typeof $rootScope.markers != "undefined" && $rootScope.markers.length > 0) {
            for (var i = 0; i < $rootScope.markers.length; i++) {
                $rootScope.markers[i].setMap(null);
            }
        }        
        $rootScope.markers = [];

        angular.forEach(pontos, function (i, item) {
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(i.latitude, i.longitude),
                map: $scope.map,
                title: i.idEndereco
            });
            $rootScope.markers.push(marker);

            var infowindow = new google.maps.InfoWindow({
                content: 'Info<br/><button ng-click="openShow">Abrir</button>',
            });

            marker.addListener('click', function() {
                $rootScope.getPidInfo(i.id);
                $rootScope.openModal(2);
            });
        });
        if(tipo != 0) {
            if(typeof $rootScope.markerCluster === "object") {
                $rootScope.markerCluster.clearMarkers();
            }
            $rootScope.markerCluster = new MarkerClusterer($scope.map, $rootScope.markers, {minimumClusterSize: 10});
            $scope.map.setZoom(4);
            var geocoder =  new google.maps.Geocoder();
            geocoder.geocode({ 'address': 'DF, Brasil'}, function(results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                   $scope.map.setCenter(results[0].geometry.location);
                }
            });
        }
        else {
            navigator.geolocation.getCurrentPosition(function(pos) {
            $scope.map.setCenter($rootScope.pos);
            $scope.map.setZoom(10);
        });
        }
    }
})

.controller('ModalController', ['$scope', '$ionicModal', '$rootScope', function($scope, $ionicModal, $rootScope) {

        $ionicModal.fromTemplateUrl('modal.html', {
            id: 1,
            scope: $scope,
            animation: 'slide-in-up'

        }).then(function(modal) {
            $scope.modal1 = modal;
        });

        $ionicModal.fromTemplateUrl('show.html', {
            id: 2,
            scope: $scope,
            animation: 'slide-in-up'

        }).then(function(modal) {
            $scope.modal2 = modal;
        });

        $rootScope.openModal = function(index) {
            if(index == 1)
                $scope.modal1.show();
            else
                $scope.modal2.show();
        };

        $rootScope.closeModal = function(index) {
            if(index == 1)
                $scope.modal1.hide();
            else
                $scope.modal2.hide();
        };
        
        //Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function() {
            $scope.modal1.remove();
            $scope.modal2.remove();
        });

        // Execute action on hide modal
        $scope.$on('modal.hidden', function() {
            // Execute action
        });

        // Execute action on remove modal
        $scope.$on('modal.removed', function() {
            // Execute action
        });
    }
])

.controller('PesquisaController', function($scope, $http, $ionicLoading, $ionicPopup, $rootScope) {
    $scope.ufs = [];

    // Setup the loader
    $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: false,
        maxWidth: 200,
        showDelay: 0
    });
    $http.get('http://localhost:8000/api/uf').then(
    function(response) {
        $scope.ufs = response.data;
        $ionicLoading.hide();
    },    
    function(){
        $ionicLoading.hide();
        $ionicPopup.alert({
            title: 'Erro!',
            template: 'Ocorreu algum erro ao tentar buscar os dados! Verifique sua conexão!'
        });
    }
    );

    $scope.uf = 0;
    $scope.distancia = 10.0;

    $scope.ufChange = function() {
        // Setup the loader
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: false,
            maxWidth: 200,
            showDelay: 0
        });
        $scope.cidades = [];
        $http.get('http://localhost:8000/api/uf/'+$scope.uf+'/cidades').then(
            function(response) {
              $scope.cidades = response.data;
              $ionicLoading.hide();
            },    
            function(){
                $ionicLoading.hide();
                $ionicPopup.alert({
                    title: 'Erro!',
                    template: 'Ocorreu algum erro ao tentar buscar os dados! Verifique sua conexão!'
                });
            }
        );
    }

    $scope.pesquisar = function() {
        var data = {
            nome: $scope.nome   ,
            uf: $scope.uf,
            cidade: $scope.cidade,
            distancia: $scope.distancia,
            latitude: $rootScope.pos.lat,
            longitude: $rootScope.pos.lng
        };

        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: false,
            maxWidth: 200,
            showDelay: 0
        });
        $http.post('http://localhost:8000/api/app/mapa', data).then(
            function(response){
                $rootScope.makeMarkers(response.data, $scope.uf);
                $rootScope.closeModal(1);
                $ionicLoading.hide();
            },
            function(response){
                $ionicLoading.hide();
                $ionicPopup.alert({
                    title: 'Erro!',
                    template: 'Ocorreu algum erro ao tentar buscar os dados! Verifique sua conexão!'
                });
            }
        );
    }
})

.controller('InfoModal', function($scope, $http, $ionicLoading, $ionicPopup, $rootScope, $ionicSlideBoxDelegate) {
    $rootScope.getPidInfo = function(id) {
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: false,
            maxWidth: 200,
            showDelay: 0
        });
        $scope.info = [];
        $http.get('http://localhost:8000/api/pid/'+id+'/show').then(
        function(response) {
            $scope.info = response.data;
            $ionicLoading.hide();
            //console.log(JSON.stringify($scope.info));
        },    
        function(){
            $ionicLoading.hide();
            $ionicPopup.alert({
                title: 'Erro!',
                template: 'Ocorreu algum erro ao tentar buscar os dados! Verifique sua conexão!'
            });
        }
        );
    }
    $ionicSlideBoxDelegate.slide(0);

});