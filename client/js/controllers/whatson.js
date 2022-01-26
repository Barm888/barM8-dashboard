angular
    .module('app')
    .controller('whatsonCtl', ['$scope', '$state', '$rootScope', 'Business', '$http', 'WhatsonCategory', 'WhatsOn', 'loader','WhatsOnSubCategory',
        function ($scope, $state, $rootScope, Business, $http, WhatsonCategory, WhatsOn , loader , WhatsOnSubCategory) {

            toastMsg = (isVaild, msg) => {
                if (isVaild)
                    toastr.success(msg);
                else
                    toastr.error(msg);
                toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
            }

            $scope.foodSubCategory = [] ;
            $scope.drinksSubCategory = [] ;
            $scope.getSubCategory = () =>{
                $scope.foodSubCategory = [];  $scope.drinksSubCategory = [];
                WhatsOnSubCategory.find().$promise.then((res) => {
                    $scope.foodSubCategory = res.filter(val => val.parent == 'Food');
                    $scope.drinksSubCategory = res.filter(val => val.parent == 'Drinks');
                });
            }
            $scope.getSubCategory();

            $scope.whatsonEat = $scope.whatsonDrinks =  $scope.whatsonHappiness = $scope.whatsonFoodMenu = $scope.whatsonDrinksMenu  = [];
            $scope.getWhatsOn = () => {
                loader.visible();
                WhatsonCategory.find({
                    filter: {
                        where: { ownerId: $scope.userId }, include: [{ relation: "whatsOns", 
                        scope: { order: "isCreate desc", include: [{ relation: "whatsOnSubCategory" , scope : { fields : ["name", "parent"] } }] } }]
                    }
                }).$promise.then((res) => {
                    if (res && res.length) {
                        $scope.whatsonEat = res.find((m) => m._category == "eat"); $scope.whatsonEat = ($scope.whatsonEat ? ($scope.whatsonEat).whatsOns : []);
                        $scope.whatsonDrinks = res.find((m) => m._category == "drinks"); $scope.whatsonDrinks = ($scope.whatsonDrinks ? ($scope.whatsonDrinks).whatsOns : []);
                        $scope.whatsonHappiness = res.find((m) => m._category == "happiness"); $scope.whatsonHappiness = ($scope.whatsonHappiness ? ($scope.whatsonHappiness).whatsOns : []);
                        $scope.whatsonFoodMenu = res.find((m) => m._category == "foodMenu"); $scope.whatsonFoodMenu = ($scope.whatsonFoodMenu ? ($scope.whatsonFoodMenu).whatsOns : []);
                        $scope.whatsonDrinksMenu = res.find((m) => m._category == "drinksMenu"); $scope.whatsonDrinksMenu = ($scope.whatsonDrinksMenu ? ($scope.whatsonDrinksMenu).whatsOns : []);
                        setTimeout(()=>{   loader.hidden(); }, 100)
                    } else setTimeout(()=>{   loader.hidden(); }, 100)
                }, (err)=>{
                    setTimeout(()=>{   loader.hidden(); }, 100)
                });
            };

            $scope.isBusinessSelect = false;

            if (!$scope.userId)  $scope.userId = $rootScope.currentUser.id;
         
            $scope.userId = "";
            if ($rootScope && $rootScope.currentUser && $rootScope.currentUser.isAdmin) {
                $scope.isBusinessSelect = true;
                $scope.useremail = $rootScope.currentUser.email;
                Business.find({ filter: { where: { status: "active" }, "fields": ["businessName", "id", "email"] } }).$promise.then((res) => {
                    $scope.businessDelection = res;
                    $scope.userId = $rootScope.currentUser.id;
                }, (err) => {
                    console.log(JSON.stringify());
                });

                if ($rootScope.selectedVenue && $rootScope.selectedVenue.venueId) {
                    $("#autocompleteBusiness").val($rootScope.selectedVenue.venueName);
                    $scope.userId = $rootScope.selectedVenue.venueId;
                    $("#autocompleteBusiness").data('id', $rootScope.selectedVenue.venueId)
                    if ($("#businessSubmit").hasClass('businessSubmit')) {
                        $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
                    }
                    $scope.isBusinessSelect = true;
                    $rootScope.selectedVenue = { venueId: $scope.userId, venueName: $("#autocompleteBusiness").val() }
                    $scope.getWhatsOn();
                }
            }
            else {
                $scope.isBusinessSelect = true;
                $scope.userId = $rootScope.currentUser.id;
            }

            $scope.getBusinessName = () => {
                return $scope.businessDelection;
            };

           


            $scope.BusinessSelected = (arg) => {
                $("#businessErr").text('');
                if (arg) {
                    if ($("#autocompleteBusiness").data('id')) {
                        arg = $("#autocompleteBusiness").data('id');
                        if ($("#businessSubmit").hasClass('businessSubmit')) {
                            $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
                        }
                        if (arg != "select") {
                            $scope.isBusinessSelect = true;
                            $scope.userId = arg;
                            $rootScope.selectedVenue = { venueId: $scope.userId, venueName: $("#autocompleteBusiness").val() }
                            $scope.getWhatsOn();
                        }
                    } else {
                        $("#businessErr").text('Please select the Business name');
                    }
                }
            }

            $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

            if(!$scope.userDetails.isAdmin) $("#businessSubmit").css({ display : 'none' });

            if ($scope.userDetails.isAdmin == false) {
                $scope.getWhatsOn();
                $("#businessSubmit").addClass('businessReset');
                $("#autocompleteBusiness").val($scope.userDetails.businessName);
                localStorage.removeItem("selectedVenue");
                $("#autocompleteBusiness").attr('disabled' , true);
                localStorage.setItem("selectedVenue", JSON.stringify({ ownerId: $scope.userDetails.id, venueName: $scope.userDetails.businessName }));
            }

            String.prototype.toCamelCase = function () {
                return this.replace(/^([A-Z])|\s(\w)/g, function (match, p1, p2, offset) {
                    if (p2) return p2.toUpperCase();
                    return p1.toLowerCase();
                });
            };


            $scope.uploadImage = (files) => {
                if ($("#businessSubmit").hasClass('businessReset')) {
                    let category = _category = null, whatsOnSubCategoryId ;

                    $(".whatson-tab-header.active").each(function () {
                        category = $(this).data('category');
                        _category = ($.trim(category)).toCamelCase();
                    });

                    if (_category == "foodMenu") whatsOnSubCategoryId = $( "#foodcategory option:selected" ).val();
                    if (_category == "drinksMenu") whatsOnSubCategoryId = $( "#drinkscategory option:selected" ).val();

                    var fd = new FormData();
                    for (let index in files) fd.append(`whatson_${index}`, files[index]);
                    $("#whatsImageSave").html('<i class="fas fa-spinner fa-spin"></i> Upload').prop('disabled', true);
                    $("#whatsonCtl").css({ "opacity": "0.1" });
                    $http.post('/whatsonImg', fd, { headers: { 'Content-Type': undefined } }).then((res) => {
                        if (res.data.isSuccess && res.data.result) {
                            WhatsonCategory.createAndUpdate({ params: { ownerId: $scope.userId, category, _category, files: res.data.result , whatsOnSubCategoryId } }).$promise.then((res) => {
                                $("#whatsImageSave").html('<i class="fas fa-cloud-upload-alt"></i> Upload').prop('disabled', false);
                                setTimeout(function () { $("#whatsonCtl").css({ "opacity": "" }) }, 2500);
                                toastMsg(true, "Successfully updated");
                                setTimeout(function () {
                                    $scope.getWhatsOn();
                                }, 2000)
                            });
                        }
                    }, (err)=>{
                         console.log(err);
                    });
                } else toastMsg(false, "Please select the Business!");
            };

            $scope.uploadVideo = () =>{
                function bytesToSize(bytes) {
                    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
                    if (bytes == 0) return '0 Byte';
                    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
                    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
                }
                var files = $('.fileuploader').prop('files');
                var fd = new FormData();
                for (let i = 0; i < files.length; i++) { 
                    if(files[i] && files[i].size) {
                        let sizes = bytesToSize(files[i].size);
                        if (sizes) {
                            sizes = sizes.split(' ');
                            if (sizes[0] < 12) fd.append(`whatson_${i}`, files[i]);
                        }
                    }
                }

                $(".whatson-tab-header.active").each(function () {
                    category = $(this).data('category');
                    _category = ($.trim(category)).toCamelCase();
                })

                loader.visible();
                $http.post('/whatsonImg', fd, { headers: { 'Content-Type': undefined } }).then((res) => { 
                    if (res.data.isSuccess && res.data.result) {
                        let files = [];
                        res.data.result.forEach(val => { 
                            if(val.path.includes('https://'))  files.push({ fileName: val.fileName, path: `${val.path}` })
                            else files.push({ fileName: val.fileName, path: `https://${val.path}` })
                         });
                        WhatsonCategory.createAndUpdate({ params: { ownerId: $scope.userId, category, _category, files } }).$promise.then((res) => {
                            $("#video_H_btn").html('<i class="fas fa-cloud-upload-alt"></i> Upload').prop('disabled', false);
                            toastMsg(true, "Successfully updated");
                            $(".upload-happenings").css({ display : 'none' });
                            setTimeout(function () {
                                $scope.getWhatsOn();
                                loader.hidden();
                            }, 2000);
                            $("#happenings_video_tag").empty();
                        });
                    }
                })
            }

            $scope.delete = (id) => {
                $(`#delete_${id}`).html('<i class="fas fa-spinner fa-spin"></i>').prop('disabled', true);
                if (id) {
                    WhatsOn.findOne({ filter: { where: { id } } }).$promise.then((res) => {
                        if (res && res.fileName) {
                            $http.post('/spaceFileDelete', { fileName: res.fileName }).then((deleteImg) => {
                                WhatsOn.destroyById({ id: res.id }).$promise.then(() => {
                                    $scope.getWhatsOn();
                                });
                                toastMsg(true, "Successfully deleted!");
                                setTimeout(function () {
                                    $(`#delete_${id}`).html('<i class="far fa-trash-alt"></i>').prop('disabled', false);
                                }, 1500)
                            });
                        } else {
                            toastMsg(false, "Please try again!");
                            $(`#delete_${id}`).html('<i class="far fa-trash-alt"></i>').prop('disabled', false);
                        }
                    });

                } else toastMsg(false, "Please try again!");
            };
        }]);