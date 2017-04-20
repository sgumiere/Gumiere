/**
 * Created by bhacaz on 23/01/17.
 */
angular.module('apiServiceModule', [])
    .factory('apiService', function($http) {

        var cannerberApi = {};
        var domain = 'http://api.canneberge.io';
        var url = domain + '/api/';
        cannerberApi.apiKey = '';
        cannerberApi.headers = {headers : {'x-access-token' : ''}};

        cannerberApi.getFerme = function (fermeID) {
            return  $http.get(url + 'fermes/' + fermeID, cannerberApi.headers);
        };

        cannerberApi.putFerme = function (fermeID, fermeData) {
            return $http.put(url + 'fermes/' + fermeID, fermeData, cannerberApi.headers)
        };
        
        cannerberApi.getWeahter = function (fermeID) {
            return $http.get(url + 'fermes/' + fermeID + '/weather', cannerberApi.headers);
        };

        cannerberApi.putShapefileData = function (fermeID, shapefileID, features) {
            return $http.put(url + 'fermes/' + fermeID + '/shapefiles/' + shapefileID, {features : features}, cannerberApi.headers)
        };

        cannerberApi.getRasterImageUrl =function (pngPath) {
            return domain + pngPath + '?apiKey=' + cannerberApi.apiKey
        };

        return cannerberApi;

    });