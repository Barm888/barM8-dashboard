angular
    .module('app')
    .controller('feedBackCtl', ['$scope', '$state', '$rootScope', 'Business', '$http', 'loader', 'FeedBack', function ($scope, $state, $rootScope, Business, $http, loader, FeedBack) {

        toastMsg = (isVaild, msg) => {
            if (isVaild)
                toastr.success(msg);
            else
                toastr.error(msg);
            toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
        }

        $scope.getData = () => {
            loader.visible();
            FeedBack.find({
                filter: {
                    include: [{ relation: "customer" }, { relation: "business" }, { relation: "exclusiveOffer" },
                    { relation: "dailySpecial" }, { relation: "happyHourDashDay" }], order: "isCreate desc"
                }
            }).$promise.then((res) => {
                $scope.feedbacks = res;
                console.log(JSON.stringify(res));
                // $scope.feedbacks.map(obj => ({ ...obj, cusDetails: '' }));
                $scope.feedbacks.forEach((e) => {

                    e.cusDetails = '';
                    if (e && e.customer) {
                        e.cusDetails = `<table class="table table-bordered"><tbody><tr><th>Name</th><td>${e.customer.firstName} &nbsp;${e.customer.lastName}</td></tr><tr><th>Age</th><td>${e.customer.age}</td></tr><tr><th>Gender</th><td>${e.customer.gender}</td></tr><tr><th>Mobile</th><td>${e.customer.mobile}</td></tr><tr><th>Email</th><td>${e.customer.email}</td></tr></tbody></table>`;
                    }
                })
                setTimeout(() => { loader.hidden(); }, 300)
            })
        }
        $scope.getData();

        $scope.showTheMiddle = (event, i) => {
            $(`.middle_${i}`).css({ 'display': 'block', 'position': 'absolute', 'right': '2%' });
        }
        $scope.hiddenTheMiddle = (i) => {
            $(`.middle_${i}`).css({ 'display': 'none' })
        }

        $scope.updateStaus = (id, status) => {
            localStorage.removeItem('fb_u_id_status')
            localStorage.setItem('fb_u_id_status', JSON.stringify({ id, status }))
            $('#statusConfirmPopup').modal({ show: true });
        }

        $scope.confirmStatus = () => {
            let { id, status } = JSON.parse(localStorage.getItem("fb_u_id_status"));
            if (id) {
                loader.visible();
                FeedBack.upsertWithWhere({ where: { id } }, { status }).$promise.then(() => {
                    $scope.getData();
                    $('#statusConfirmPopup').modal('hide');
                    toastMsg(true, "Successfully Updated");
                }, (err) => {
                    toastMsg(false, "Please try again!");
                    setTimeout(() => { loader.hidden(); }, 300)
                })
            }
        }
    }])