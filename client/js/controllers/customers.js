angular
    .module('app')
    .controller('customerDetailsCtl', ['$scope', '$state', '$rootScope', '$http', 'loader', 'Customer', function ($scope, $state, $rootScope, $http, loader, Customer) {
        let toastMsg = (isVaild, msg) => {
            if (isVaild)
                toastr.success(msg);
            else
                toastr.error(msg);
            toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
        }



        $scope.customersDs = [];
        $scope.getCustomers = () => {
            loader.visible();
            Customer.find({ filter: { order: "isCreate desc" } }).$promise.then((res) => {
                $scope.customersDs = res;
                setTimeout(function () { loader.hidden(); }, 300)
            })
        }

        $scope.getCustomers();

        $scope.showTheMiddle = (event, i) => {
            $(`.middle_${i}`).css({ 'display': 'block', 'position': 'absolute', 'right': '2%' });
        }
        $scope.hiddenTheMiddle = (i) => {
            $(`.middle_${i}`).css({ 'display': 'none' })
        }


        $scope.deleteRequest = (id) => {
            if (id) {
                $("#confirmCustomerDelete").modal('show');
                localStorage.removeItem('cus_d_id_aDm');
                localStorage.setItem('cus_d_id_aDm', id);
            } else toastMsg(false, "Please try again!")
        }

        $scope.deleteConfirm = () => {
            let id = localStorage.getItem('cus_d_id_aDm');
            if (id) {
                loader.visible();
                Customer.deleteById({ id }).$promise.then(() => {
                    $("#confirmCustomerDelete").modal('hide');
                    toastMsg(true, "Successfully deleted!")
                    setTimeout(function () { $scope.getCustomers() }, 200);
                })

            } else toastMsg(false, "Please try again!")
        }

    }]);