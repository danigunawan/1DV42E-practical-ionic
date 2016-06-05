/**
 * Created by Johanna Larsson on 2016-04-21.
 */
'use strict';

angular.module( 'BookingSystem.resourcesServices',

  // Dependencies
  [
    'ngResource'
  ]
  )
  .factory( 'Resource', [ '$resource', 'API_URL', ( $resource, API_URL ) => {

    return $resource(
      API_URL + 'Resource/:resourceId',
      {resourceId: '@resourceId'},
      {
        queryFreeForPeriod: {
          url: API_URL + 'Resource/free/:fromDate/:toDate',
          id: '@id',
          method: 'GET',
          isArray: true,
          params: {
            fromDate: '@fromDate',
            toDate: '@toDate'
          }
        }
      }
    );
  }]
  )

  .factory( 'ResourceImage', ['$http', 'API_URL', ( $http, API_URL ) => {

    return {
      upload : function( imageData, resourceId ) {

        return $http(
          {
            method: 'POST',
            url: API_URL + 'Resource/image/' + resourceId,
            data: imageData,
            headers: {'Content-Type': undefined}
          }
        );
      }
    };
  }]
  );
