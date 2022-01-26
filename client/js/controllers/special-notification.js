angular
    .module('app')
    .controller('specialNotificationCtl', ['$scope', '$state', '$http', 'Business', '$rootScope', 'socket', 'loader', 'Notification',
        function ($scope, $state, $http, Business, $rootScope, socket, loader, Notification) {

            toastMsg = (isVaild, msg) => {
                if (isVaild)
                    toastr.success(msg);
                else
                    toastr.error(msg);
                toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
            }

            $scope.specialDatas = [];
            $scope.getData = () => {
                loader.visible();
                Notification.find().$promise.then((res) => {
                    $scope.specialDatas = res;
                    setTimeout(function () {
                        loader.hidden();
                    }, 300)
                });
            }
            $scope.getData();


            $scope.createModalOpen = () => {
                $('#createNewPopup').modal({
                    backdrop: 'static',
                    keyboard: false
                })
            }

            $scope.submitNotification = () => {
                let isTrue = true;
                $("#c-h-error,#c-body-error,#c-footer-error").css({ 'display': 'none' });
                if (!$("#c-header").val()) {
                    isTrue = false;
                    $("#c-h-error").css({ 'display': 'block' });
                }
                if (!$("#c-Body").val()) {
                    isTrue = false;
                    $("#c-body-error").css({ 'display': 'block' });
                }
                if (!$("#c-Footer").val()) {
                    isTrue = false;
                    $("#c-footer-error").css({ 'display': 'block' });
                }
                if (isTrue) {
                    let header = $("#c-header").val();
                    let body = $("#c-Body").val();
                    let footer = $("#c-Footer").val();
                    loader.visible();
                    Notification.create({ S_Message: { header, body, footer }, category: "Special", status: "Open" }).$promise.then((res) => {
                        $scope.getData();
                        setTimeout(function () {
                            toastMsg(true, "Successfully updated!");
                            loader.hidden();
                            $('#createNewPopup').modal('hide');
                        }, 300)
                    }, () => {
                        $scope.getData();
                        setTimeout(function () {
                            toastMsg(false, "Please try again!");
                            loader.hidden();
                            $('#createNewPopup').modal('hide');
                        }, 300)
                    });
                }
            }

            $scope.showTheMiddle = (event, i) => {
                $(`.middle_${i}`).css({ 'display': 'block', 'position': 'absolute', 'right': '2%' });
            }
            $scope.hiddenTheMiddle = (i) => {
                $(`.middle_${i}`).css({ 'display': 'none' })
            }

            $scope.delete = (id) => {
                if (id) {
                    localStorage.removeItem('s_n_mess_de_id');
                    localStorage.setItem('s_n_mess_de_id', JSON.stringify({ id }));
                    $("#deleteConfirmPopup").modal({ backdrop: 'static', keyboard: false });
                } else toastMsg(false, 'Please try again!');
            }

            $scope.confirmDelete = () => {
                let ids = '';
                ids = JSON.parse(localStorage.getItem('s_n_mess_de_id'));
                if (ids) {
                    loader.visible();
                    $("#deleteConfirmPopup").modal('hide');
                    Notification.removeNotification({ params: { id: ids.id } }).$promise.then((res) => {
                        setTimeout(function () {
                            $scope.getData();
                            toastMsg(true, 'Successfully deleted!');
                        }, 200);

                    }, () => { loader.hidden(); });
                } else toastMsg(false, 'Please try again!');
            }

            $scope.updateStaus = (id) => {
                loader.visible();
                Notification.find({ filter: { where: { id } } }).$promise.then((res_1) => {
                    if (res_1 && res_1.length) {
                        let { status } = res_1[0];
                        if (status == 'Open') status = "Closed";
                        else status = "Open";
                        Notification.upsertWithWhere({ where: { id } }, { status }).$promise.then((res) => {
                            $scope.getData();
                            setTimeout(function () {
                                toastMsg(true, "Successfully updated!");
                                loader.hidden();
                            }, 300)
                        }, () => {
                            $scope.getData();
                            setTimeout(function () {
                                toastMsg(false, "Please try again!");
                                loader.hidden();
                            }, 300)
                        });
                    } else {
                        $scope.getData();
                        setTimeout(function () {
                            toastMsg(false, "Please try again!");
                            loader.hidden();
                        }, 300)
                    }
                }, () => {
                    $scope.getData();
                    setTimeout(function () {
                        toastMsg(false, "Please try again!");
                        loader.hidden();
                    }, 300)
                })

            }

            $scope.editNotification = (id) => {
                loader.visible();
                Notification.find({ filter: { where: { id } } }).$promise.then((res_1) => {
                    if (res_1 && res_1.length) {
                        $scope.editNoti = res_1[0];
                        setTimeout(function () {
                            $("#editNewPopup").modal({ backdrop: 'static', keyboard: false });
                            loader.hidden();
                        }, 300);
                    } else {
                        setTimeout(function () {
                            toastMsg(false, "Please try again!");
                            loader.hidden();
                        }, 100)
                    }
                }, () => {
                    setTimeout(function () {
                        toastMsg(false, "Please try again!");
                        loader.hidden();
                    }, 100)
                })
            }

            //viewNotification
            $scope.viewNotification = (id) => {
                loader.visible();
                Notification.find({ filter: { where: { id } } }).$promise.then((res_1) => {
                    if (res_1 && res_1.length) {
                        $scope.viewNoti = res_1[0];
                        setTimeout(function () {
                            $("#ViewNewPopup").modal({ backdrop: 'static', keyboard: false });
                            loader.hidden();
                        }, 300);
                    } else {
                        setTimeout(function () {
                            toastMsg(false, "Please try again!");
                            loader.hidden();
                        }, 100)
                    }
                }, () => {
                    setTimeout(function () {
                        toastMsg(false, "Please try again!");
                        loader.hidden();
                    }, 100)
                })
            }

            $scope.updateNotification = ({ id }) => {
                loader.visible();
                let header = $("#c-header-up-s").val();
                let body = $("#c-Body-up-s").val();
                let footer = $("#c-Footer_up_s").val();
                if (id) {
                    Notification.upsertWithWhere({ where: { id } }, { S_Message: { body, header, footer } }).$promise.then((res) => {
                        $scope.getData();
                        setTimeout(function () {
                            toastMsg(true, "Successfully updated!");
                            $("#editNewPopup").modal('hide');
                            loader.hidden();
                        }, 300)
                    }, () => {
                        $scope.getData();
                        setTimeout(function () {
                            toastMsg(false, "Please try again!");
                            loader.hidden();
                        }, 300)
                    });
                } else {
                    setTimeout(function () {
                        toastMsg(false, "Please try again!");
                        loader.hidden();
                    }, 300)
                }
            }
        }])