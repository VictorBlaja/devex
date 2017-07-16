(function () {
  'use strict';

  // Setting up route
  angular
    .module('users.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    // Users state routing
    $stateProvider
      .state('settings', {
        abstract: true,
        url: '/{lang:(?:fr|en)}/settings',
        templateUrl: '/modules/users/client/views/settings/settings.client.view.html',
        controller: 'SettingsController',
        controllerAs: 'vm',
        data: {
          roles: ['user', 'admin', 'gov-request', 'gov']
        },
        params: {
          lang: 'en'
        }
      })
      .state('settings.profile', {
        url: '/profile',
        templateUrl: '/modules/users/client/views/settings/edit-profile.client.view.html',
        controller: 'EditProfileController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Settings'
        }
      })
      .state('settings.password', {
        url: '/password',
        templateUrl: '/modules/users/client/views/settings/change-password.client.view.html',
        controller: 'ChangePasswordController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Settings password'
        }
      })
      // .state('settings.accounts', {
      //   url: '/accounts',
      //   templateUrl: '/modules/users/client/views/settings/manage-social-accounts.client.view.html',
      //   controller: 'SocialAccountsController',
      //   controllerAs: 'vm',
      //   data: {
      //     pageTitle: 'Settings accounts'
      //   }
      // })
      .state('settings.picture', {
        url: '/picture',
        templateUrl: '/modules/users/client/views/settings/change-profile-picture.client.view.html',
        controller: 'ChangeProfilePictureController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Settings picture'
        }
      })
      .state('authentication', {
        abstract: true,
        url: '/{lang:(?:fr|en)}/authentication',
        templateUrl: '/modules/users/client/views/authentication/authentication.client.view.html',
        controller: 'AuthenticationController',
        controllerAs: 'vm',
        resolve: {
          usercount: function (UsersService) {
            return UsersService.countUsers ().then (function (o) {return o.count});
          }
        },
        ncyBreadcrumb: {
          label: 'Authentication'
        },
        params: {
          lang: 'en'
        }
      })
      .state('authentication.gov', {
        url: '/government',
        templateUrl: '/modules/users/client/views/authentication/gov.client.view.html',
        controller: 'AuthenticationController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Government'
        },
        ncyBreadcrumb: {
          label: 'Government'
        }
      })
      .state('authentication.signinadmin', {
        url: '/signinadmin?err',
        templateUrl: '/modules/users/client/views/authentication/signin.admin.client.view.html',
        controller: 'AuthenticationController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Signin'
        },
        ncyBreadcrumb: {
          label: 'Signin'
        }
      })
     .state('signup', {
        url: '/signup',
        templateUrl: '/modules/users/client/views/authentication/signup.client.view.html',
        controller: 'AuthenticationController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Signup'
        },
        ncyBreadcrumb: {
          label: 'Signup'
        }
      })
      .state('authentication.signin', {
        url: '/signin?err',
        templateUrl: '/modules/users/client/views/authentication/signin.client.view.html',
        controller: 'AuthenticationController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Signin'
        },
        ncyBreadcrumb: {
          label: 'Signin'
        }
      })
      .state('password', {
        abstract: true,
        url: '/{lang:(?:fr|en)}/password',
        template: '<ui-view autoscroll="true"/>',
        params: {
          lang: 'en'
        }
      })
      .state('password.forgot', {
        url: '/forgot',
        templateUrl: '/modules/users/client/views/password/forgot-password.client.view.html',
        controller: 'PasswordController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Password forgot'
        }
      })
      .state('password.reset', {
        abstract: true,
        url: '/{lang:(?:fr|en)}/reset',
        template: '<ui-view autoscroll="true"/>',
        params: {
          lang: 'en'
        }
      })
      .state('password.reset.invalid', {
        url: '/invalid',
        templateUrl: '/modules/users/client/views/password/reset-password-invalid.client.view.html',
        data: {
          pageTitle: 'Password reset invalid'
        }
      })
      .state('password.reset.success', {
        url: '/success',
        templateUrl: '/modules/users/client/views/password/reset-password-success.client.view.html',
        data: {
          pageTitle: 'Password reset success'
        }
      })
      .state('password.reset.form', {
        url: '/:token',
        templateUrl: '/modules/users/client/views/password/reset-password.client.view.html',
        controller: 'PasswordController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Password reset form'
        }
      });
  }
}());
