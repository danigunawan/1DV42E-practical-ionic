/**
 * Created by Johanna Larsson on 2016-04-28.
 */
'use strict';

angular.module( 'BookingSystem.mealPropertiesServices',

  [
    'ngResource',
    'BookingSystem.mealsServices'
  ]
  )

  .factory( 'MealProperty', ['$resource', 'API_URL', ( $resource, API_URL ) => {

    return $resource(
      API_URL + 'MealProperty/:mealPropertyId',
      {mealPropertyId: '@mealPropertyId'}
    );
  }]
  )

  .factory( 'MealHasProperty', ['$resource', 'API_URL', ( $resource, API_URL ) => {

    return $resource(
      API_URL + 'MealHasProperty/:mealPropertyId/:mealId',
      {mealPropertyId: '@mealPropertyId'},
      {
        remove: {
          url: API_URL + 'MealHasProperty/:mealPropertyId/:mealId',
          id: '@id',
          method: 'DELETE',
          isArray: false,
          params: {
            mealPropertyId: '@mealPropertyId',
            mealId: '@mealId'
          }
        },

        removeForMeal: {
          url: API_URL + 'MealHasProperty/:mealId',
          id: '@id',
          method: 'DELETE',
          isArray: false,
          params: {
            mealId: '@mealId'
          }
        },

        queryForMeal: {
          url: API_URL + 'MealHasProperty/meal/:mealId',
          id: '@id',
          method: 'GET',
          isArray: true,
          params: {
            mealPropertyId: '@mealId'
          }
        },

        saveForMeal: {
          url: API_URL + 'MealHasProperty/meal',
          id: '@id',
          method: 'POST',
          isArray: true
        }
      }
    );
  }]
  );