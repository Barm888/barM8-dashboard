angular
    .module('app')
    .controller('drinksctl', ['$scope', '$state', '$rootScope', 'Business', 'DrinksConfig', '$http', 'DrinksCategory', 'DrinksType', 'loader',
        function ($scope, $state, $rootScope, Business, DrinksConfig, $http, DrinksCategory, DrinksType, loader) {

            toastMsg = (isVaild, msg) => {
                toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
                if (isVaild) toastr.success(msg);
                else toastr.error(msg);
            }

            $scope.mixers = [{ name: "Coca Cola", value: "Cocacola" }, { name: "Coca cola zero", value: "cocaColaZero" },
            { name: "Lemonade", value: "lemonade" }, { name: "Lift", value: "lift" }, { name: "Dry Ginger", value: "dryGinger" }, { name: "Soda", value: "soda" },
            { name: "Tonic", value: "tonic" }, { name: "Raspberry lemonade", value: "raspberryLemonade" }, { name: "Lemon lime bitters", value: "lemonLimeBitters" },
            { name: "Soda lime bitters", value: "SodaLimeBitters" }, { name: "Orange juice", value: "orangeJuice" }, { name: "Cranberry juice", value: "Cranberry juice" }, { name: "No mixers", value: "noMixers" }];

            $scope.extras = [{ name: "Add Lime", value: "addLime" }, { name: "Add Lemon", value: "addLemon" }, { name: "Add Cucumber", value: "addCucumber" },
            { name: "Add Orange", value: "addOrange" }, { name: "Add Ice", value: "addIce" }, { name: "No Ice", value: "noIce" }];

            $scope.spiritDispense = [{ name: "Single", _name: "single" }, { name: "Double", _name: "double" }, { name: "Shot", _name: "shot" }]

            $scope.isBusinessSelect = false;

            if (!$scope.userId) {
                $scope.userId = $rootScope.currentUser.id;
            }

            $scope.spiritTypes = $scope.wineTypes = [];
            $scope.getDrinksTypes = () => {
                DrinksType.find({ filter: { order: "type desc" } }).$promise.then((res) => {
                    if (res && res.length) {
                        $scope.beerTypes = $scope.spiritTypes = $scope.wineTypes = [];
                        $scope.beerTypes = res.filter((m) => m.category == "Beer" && m._type != "addNew");
                        $scope.spiritTypes = res.filter((m) => m.category == "Spirit");
                        $scope.wineTypes = res.filter((m) => m.category == "Wine");
                        $scope.cocktailTypes = res.find((m) => m.category == "Cocktail");
                        $scope.nonAlcoholicTypes = res.filter((m) => m.category == "Non-Alcoholic");
                    }
                });
            }

            $scope.useremail = $rootScope.currentUser.email;
            $scope.userId = "";
            if ($rootScope && $rootScope.currentUser && $rootScope.currentUser.isAdmin) {
                $scope.isBusinessSelect = true;
                Business.find({ filter: { where: { status: "active" }, "fields": ["businessName", "id", "email"] } }).$promise.then((res) => {
                    $scope.businessDelection = res;
                    $scope.userId = $rootScope.currentUser.id;
                    if ($rootScope.selectedVenue && $rootScope.selectedVenue.venueId && $rootScope.selectedVenue.venueName) {
                        $scope.userId = $rootScope.selectedVenue.venueId;
                        $("#autocompleteBusiness").val($rootScope.selectedVenue.venueName);
                        $("#autocompleteBusiness").data('id', $scope.userId);
                        $scope.getDrinksTypes();
                        $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
                    }
                });
            }
            else {
                $scope.isBusinessSelect = true;
                $scope.userId = $rootScope.currentUser.id;
            }

            $scope.getBusinessName = () => {
                return $scope.businessDelection;
            };


            $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

            if (!$scope.userDetails.isAdmin) $("#businessSubmit").css({ display: 'none' });

            if ($scope.userDetails.isAdmin == false) {
                $scope.getDrinksTypes();
                $scope.isBusinessSelect = true;
                $("#autocompleteBusiness").val($scope.userDetails.businessName);
                localStorage.removeItem("selectedVenue");
                $("#autocompleteBusiness").attr('disabled', true);
                localStorage.setItem("selectedVenue", JSON.stringify({ ownerId: $scope.userDetails.id, venueName: $scope.userDetails.businessName }));
                $("#businessSubmit").addClass('businessReset');
            }

            $scope.BusinessSelected = (arg) => {
                $("#businessErr").text('');
                if ($("#autocompleteBusiness").data('id')) {
                    arg = $("#autocompleteBusiness").data('id');
                    if ($("#businessSubmit").hasClass('businessSubmit')) {
                        $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
                    }
                    if (arg != "select") {
                        $scope.isBusinessSelect = true;
                        $scope.userId = arg;
                        $rootScope.selectedVenue = { venueId: $scope.userId, venueName: $("#autocompleteBusiness").val() }
                        $scope.getDrinksTypes();
                    }
                } else {
                    $("#businessErr").text('Please select the Business name');
                }
            }

            String.prototype.toCamelCase = function () {
                return this.replace(/^([A-Z])|\s(\w)/g, function (match, p1, p2, offset) {
                    if (p2) return p2.toUpperCase();
                    return p1.toLowerCase();
                });
            };

            $scope.happyhours = []
            $scope.getDrinksMenu = () =>
                DrinksConfig.find({ filter: { include: [{ relation: "drinksDispenses" }], order: "order asc" } }).$promise.then((res) => {
                    $scope.happyhours = res;
                });
            $scope.getDrinksMenu();

            $scope.drinksCreate = (happyHour) => {

                if ($("#businessSubmit").hasClass('businessReset')) {

                    let isVaild = true, category = happyHour.name;
                    let drinks = {
                        ownerId: $scope.userId, type: null, category: happyHour.displayTxt, _category: happyHour._name, shortName: happyHour._name,
                        brand: null, desc: null, price: 0, drinksTypeId: null, brandTxt: null, dispense: []
                    }

                    $(`#_${category}_brand_err,#_${category}_desc_err,#_${category}_price_err,#_${category}_dispense_err,#_${category}_type_err`).css({ display: "none" })

                    if (!$(`#_${category}_brand`).val()) { isVaild = false; $(`#_${category}_brand_err`).css({ display: "block" }) }
                    else { drinks.brand = $(`#_${category}_brand`).val() }
                    if (!$(`#_${category}_desc`).val()) { isVaild = false; $(`#_${category}_desc_err`).css({ display: "block" }) }
                    else { drinks.desc = $(`#_${category}_desc`).val() }
                    $(`input[name="_despense_${category}"]:checked`).each(function () {
                        let dispenseType = _dispenseType = null;
                        if (happyHour._name == '_beer_cider') {
                            if ($(this).data('cname') == 'bottle' || $(this).data('cname') == 'can') {
                                dispenseType = 'Bottle & Can'; _dispenseType = 'bottleAndCan';
                            }
                            else { dispenseType = 'On Tap'; _dispenseType = 'onTap'; }
                        }
                        drinks.dispense.push({
                            dispense: $(this).data('cname'), dispenseTxt: $(this).val(),
                            price: parseFloat($(`#_${category}_${$(this).data('cname')}_price`).val()),
                            order: $(this).data('order'), dispenseType, _dispenseType
                        })
                    });
                    if (drinks.dispense && drinks.dispense.length == 0) { $(`#_${category}_dispense_err`).css({ display: "block" }) }

                    if (happyHour.name == 'Cocktail') drinks.type = $(`#_${happyHour.name}_brand`).val();
                    if (happyHour.name == 'Beer') drinks.type = $(`#_${happyHour.name}_type`).val();
                    if (happyHour.name == "_wine_bubbles" || happyHour.name == "Beer") {
                        if (happyHour.name == "_wine_bubbles") drinks.type = $(`#${happyHour.name}_type`).val();
                        if (!$scope.drinksTypeId) { isVaild = false; $(`#_${category}_type_err`).css({ display: "block" }); }
                        else drinks.drinksTypeId = $scope.drinksTypeId;
                    }

                    if (isVaild) {
                        $(`#drinks_save_${category}`).html('<i class="fas fa-spinner fa-spin"></i> Save').prop('disabled', true);
                        $('#drinksmenu').css({ "opacity": "0.1" });
                        drinks.brand = $(`#_${category}_brand`).val(), drinks.brandTxt = ($(`#_${category}_brand`).val()).toCamelCase(),
                            drinks.price = $(`#_${category}_price`).val(); drinks.desc = $(`#_${category}_desc`).val();
                        drinks.groupId = [...Array(32)].map(i => (~~(Math.random() * 36)).toString(36)).join('');
                        DrinksCategory.createAndUpdate({ params: drinks }).$promise.then((res) => {
                            toastMsg(true, "Successfully created!.");
                            $(`#_${category}_brand,#_${category}_desc,#_${category}_type`).val('');
                            $(`input[name="_despense_${category}"]:checked`).each(function () {
                                $(`#_${category}_${$(this).data('cname')}_price`).val(null);
                                $(this).prop('checked', false);
                            });
                            setTimeout(function () { $("#drinksmenu").css({ "opacity": "" }) }, 100);
                            $(`#drinks_save_${category}`).html('<i class="fas fa-save"></i> Save').prop('disabled', false);
                        });
                    }
                } else toastMsg(false, "Please select the Business");
            };

            $scope.wineDrinksCreate = (happyHour) => {
                if ($("#businessSubmit").hasClass('businessReset')) {

                    let isVaild = true, category = happyHour.name;
                    let drinks = {
                        ownerId: $scope.userId, type: null, category: happyHour.displayTxt, _category: happyHour._name, shortName: happyHour._name,
                        brand: null, desc: null, drinksTypeId: null, brandTxt: null, dispense: []
                    }
                    $(`#_${category}_brand_err,#_${category}_desc_err,
                    #_${category}_price_err,#_${category}_dispense_err,
                    #_${category}_type_err`).css({ display: "none" })
                    if (!$(`#_${category}_brand`).val()) { isVaild = false; $(`#_${category}_brand_err`).css({ display: "block" }) }
                    else { drinks.brand = $(`#_${category}_brand`).val() }
                    if (!$(`#_${category}_desc`).val()) { isVaild = false; $(`#_${category}_desc_err`).css({ display: "block" }) }
                    else { drinks.desc = $(`#_${category}_desc`).val() }
                    if (!$(`#_${category}_type`).val()) { isVaild = false; $(`#_${category}_type_err`).css({ display: "block" }) }
                    else { drinks.type = $(`#_${category}_type`).val() }
                    if (!$scope.drinksTypeId) { isVaild = false; $(`#_${category}_type_err`).css({ display: "block" }); }
                    else drinks.drinksTypeId = $scope.drinksTypeId;
                    $(`input[name="_despense_${category}"]:checked`).each(function () {
                        drinks.dispense.push({
                            dispense: $(this).data('cname'), dispenseTxt: $(this).val(),
                            price: parseFloat($(`#${$(this).data('pricename')}`).val()),
                            order: $(this).data('order'), dispenseType: "Wine_Bubbles", _dispenseType: "Wine_Bubbles"
                        })
                    });
                    drinks.brandTxt = ($(`#_${category}_brand`).val()).toCamelCase();
                    drinks.groupId = [...Array(32)].map(i => (~~(Math.random() * 36)).toString(36)).join('');
                    if (isVaild) {
                        DrinksCategory.createAndUpdate({ params: drinks }).$promise.then((res) => {
                            toastMsg(true, "Successfully created!.");
                            $(`#_${category}_brand,#_${category}_desc,#_${category}_type`).val('');
                            $(".price-txt").each(function () { $(this).val(''); })
                            $(`input[name="_despense_${category}"]:checked`).each(function () {
                                $(`#_${category}_${$(this).data('cname')}_price`).val(null);
                                $(this).prop('checked', false);
                            });
                            setTimeout(function () { $("#drinksmenu").css({ "opacity": "" }) }, 100);
                            $(`#drinks_save_${category}`).html('<i class="fas fa-save"></i> Save').prop('disabled', false);
                        });
                    }
                }
            }

            $scope.createCocktail = (happyHour) => {
                if ($("#businessSubmit").hasClass('businessReset')) {

                    let isVaild = true, category = happyHour.name;
                    let drinks = {
                        ownerId: $scope.userId, type: null, category: happyHour.displayTxt, _category: happyHour._name, shortName: happyHour._name, desc: null, drinksTypeId: null, dispense: []
                    }

                    drinks.drinksTypeId = $scope.cocktailTypes.id;

                    $(`#_${category}_dispense_err,
                    #_${category}_type_err`).css({ display: "none" })
                    if (!$(`#_${category}_desc`).val()) { isVaild = false; $(`#_${category}_desc_err`).css({ display: "block" }) }
                    else { drinks.desc = $(`#_${category}_desc`).val() }
                    if (!$(`#_${category}_type`).val()) { isVaild = false; $(`#_${category}_type_err`).css({ display: "block" }) }
                    else { drinks.type = $(`#_${category}_type`).val() }

                    $(`input[name="_despense_${category}"]:checked`).each(function () {
                        drinks.dispense.push({
                            dispense: $(this).data('cname'), dispenseTxt: $(this).val(),
                            price: parseFloat($(`#_${category}_${$(this).data('cname')}_price`).val()),
                            order: $(this).data('order'), dispenseType: "Cider", _dispenseType: "Cider"
                        })
                    });

                    drinks.groupId = [...Array(32)].map(i => (~~(Math.random() * 36)).toString(36)).join('');

                    if (isVaild) {
                        loader.visible();
                        DrinksCategory.createAndUpdate({ params: drinks }).$promise.then((res) => {
                            toastMsg(true, "Successfully created!.");
                            $(`#_${category}_desc,#_${category}_type`).val('');
                            $(`input[name="_despense_${category}"]:checked`).each(function () {
                                $(`#_${category}_${$(this).data('cname')}_price`).val(null);
                                $(this).prop('checked', false);
                            });
                            setTimeout(function () { $("#drinksmenu").css({ "opacity": "" }); loader.hidden(); }, 100);
                        }, () => {
                            loader.hidden();
                        });
                    }
                } else toastMsg(false, "Please select the venue!");
            }

            $scope.spiritCreate = (happyHour) => {

                if ($("#businessSubmit").hasClass('businessReset')) {

                    let isVaild = true, category = happyHour.name;
                    $(`#_${category}_type_err,#_${category}_brand_err,#_${category}_classification_err`).css({ display: 'none' });
                    let drinks = {
                        ownerId: $scope.userId, category: happyHour.displayTxt, _category: happyHour._name, shortName: happyHour._name, brand: null, desc: null, brandTxt: null, extra: [], mixer: [], type: '', dispense: []
                    }
                    if (!$(`#_${category}_brand`).val()) { isVaild = false; $(`#_${category}_brand_err`).css({ display: "block" }) }
                    else { drinks.brand = $(`#_${category}_brand`).val() }
                    if (!$scope.drinksTypeId) { isVaild = false; $(`#_${category}_classification_err`).css({ display: "block" }); }
                    else drinks.drinksTypeId = $scope.drinksTypeId;

                    if (!$(`#_${category}_type`).val()) { isVaild = false; $(`#_${category}_type_err`).css({ display: "block" }); }

                    $("input[name='_Spirit_dispense']:checked").each(function () {
                        drinks.dispense.push({ name: $(this).data('cname'), _name: $(this).val().toCamelCase(), price: $(`#_${category}_${$(this).data('cname')}_dispense_price`).val() })
                    });

                    if (isVaild) {

                        drinks.brand = $(`#_${category}_brand`).val();
                        drinks.brandTxt = ($(`#_${category}_brand`).val()).toCamelCase();
                        drinks.desc = $(`#_${category}_desc`).val();
                        drinks.type = $(`#_${category}_type`).val();
                        drinks.groupId = [...Array(32)].map(i => (~~(Math.random() * 36)).toString(36)).join('');
                        drinks.dispenseType = "Spirit";
                        drinks._dispenseType = "spirit";
                        $("input[name='_Spirit_extra']:checked").each(function () {
                            drinks.extra.push({ name: $(this).val(), _name: $(this).val().toCamelCase() })
                        });
                        $("input[name='_Spirit_mixer']:checked").each(function () {
                            drinks.mixer.push({ name: $(this).val(), _name: $(this).val().toCamelCase() })
                        });

                        $(`#spirit_save`).html('<i class="fas fa-spinner fa-spin"></i> Save').prop('disabled', true);
                        DrinksCategory.createAndUpdate({ params: drinks }).$promise.then((res) => {
                            toastMsg(true, "Successfully created!.");
                            $(`#_${category}_brand,#_${category}_desc,#_${category}_type`).val('');
                            $(`input[name='_Spirit_extra']:checked,input[name='_Spirit_mixer']:checked,input[name='_Spirit_dispense']:checked`).each(function () {
                                $(this).prop('checked', false);
                            });
                            $("#_Spirit_Single_dispense_price,#_Spirit_Double_dispense_price,#_Spirit_Shot_dispense_price").val('');
                            $(`#_${category}_type_err,#_${category}_brand_err`).css({ display: 'none' });
                            $(`#spirit_save`).html('<i class="fas fa-save"></i> Save').prop('disabled', false);
                        });
                    }
                } else toastMsg(false, "Please select the Business");
            };

            $scope.nonAlcoholicCReate = (happyHour) => {
                if ($("#businessSubmit").hasClass('businessReset')) {

                    let isVaild = true, category = happyHour.name;
                    let drinks = {
                        ownerId: $scope.userId, category: happyHour.displayTxt, _category: happyHour._name, shortName: happyHour._name, brand: null, desc: null, brandTxt: null, type: '', dispense: [], extra: []
                    }

                    if (!$scope.drinksTypeId) { isVaild = false; $(`#_${category}_type_err`).css({ display: "block" }); }
                    else drinks.drinksTypeId = $scope.drinksTypeId;

                    $(`#_${category}_brand_err,#_${category}_desc_err,
                    #_${category}_price_err,#_${category}_dispense_err,
                    #_${category}_type_err`).css({ display: "none" });

                    if (!$(`#_${category}_brand`).val()) { isVaild = false; $(`#_${category}_brand_err`).css({ display: "block" }) }
                    else { drinks.brand = $(`#_${category}_brand`).val() }
                    if (!$(`#_${category}_desc`).val()) { isVaild = false; $(`#_${category}_desc_err`).css({ display: "block" }) }
                    else { drinks.desc = $(`#_${category}_desc`).val() }
                    if (!$(`#_${category}_type`).val()) { isVaild = false; $(`#_${category}_type_err`).css({ display: "block" }) }
                    else { drinks.type = $(`#_${category}_type`).val() }
                    if (!$scope.drinksTypeId) { isVaild = false; $(`#_${category}_type_err`).css({ display: "block" }); }
                    else drinks.drinksTypeId = $scope.drinksTypeId;
                    $(`input[name="_dispense_Non_Alcoholic"]:checked`).each(function () {
                        drinks.dispense.push({
                            dispense: $(this).data('cname'), dispenseTxt: $(this).val(),
                            price: parseFloat($(`#_${category}_${$(this).data('cname')}_price`).val()),
                            order: $(this).data('order'), dispenseType: "Non-Alcoholic", _dispenseType: "Non-Alcoholic"
                        })
                    });
                    $("input[name='_Non_Alcoholic_extra']:checked").each(function () {
                        drinks.extra.push({ name: $(this).val(), _name: $(this).val().toCamelCase() })
                    });
                    drinks.brandTxt = ($(`#_${category}_brand`).val()).toCamelCase();
                    drinks.groupId = [...Array(32)].map(i => (~~(Math.random() * 36)).toString(36)).join('');

                    if (isVaild) {
                        loader.visible();
                        DrinksCategory.createAndUpdate({ params: drinks }).$promise.then((res) => {
                            toastMsg(true, "Successfully created!.");
                            $(`#_${category}_brand,#_${category}_desc,#_${category}_type`).val('');
                            $(".price-txt").each(function () { $(this).val(''); })
                            $(`input[name="_Non_Alcoholic_extra"]:checked`).each(function () {
                                $(this).prop('checked', false);
                            });
                            $(`input[name="_dispense_Non_Alcoholic"]:checked`).each(function () {
                                $(this).prop('checked', false);
                                $(`#_Non_Alcoholic_${$(this).data('cname')}_price`).val('');
                            });
                            loader.hidden();
                            setTimeout(function () { $("#drinksmenu").css({ "opacity": "" }) }, 100);
                        });
                    }
                }
            }

            $scope.drinksTypeId = "";
            $scope.drinksTypeChg = (arg) => {
                $scope.drinksTypeId = arg.id;
                $(".error").each(function () { $(this).css({ display: "none" }) });
                if (arg && arg.drinksConfigId && arg._type == 'addNew') {
                    $("#_addTypeFooter").html(null)
                    $("#_addTypeFooter").html(`<button data-type="${arg.category}" data-idtxt="${arg.drinksConfigId}" id="${arg.drinksConfigId}" onclick="addNewDrinksType(this)" style="background-color:#4caf50 !important;border-radius: 2px;" class="btn btn-primary"><i class="fas fa-check"></i> &nbsp; Add</button>`);
                    $('#addTypes').modal({ backdrop: 'static', keyboard: false });
                }
            };

            $scope.addNewDrinksTypes = (arg) => {
                let type = $("#drinksTypeVal").val(), _type = $("#drinksTypeVal").val().toCamelCase(), drinksConfigId = $(arg).data('idtxt'),
                    category = $(arg).data('type');
                $(`#${$(arg).attr('id')}`).html('<i class="fas fa-spinner fa-spin"></i>&nbsp; Add').prop('disabled', true);
                DrinksType.create({ type, _type, drinksConfigId, category }).$promise.then((res) => {
                    $scope.getDrinksTypes();
                    toastMsg(true, "Successfully created.");
                    $('#addTypes').modal('hide');
                    $(`#${$(arg).attr('id')}`).html('<i class="fas fa-check"></i>&nbsp; Add').prop('disabled', true);
                });
            }

        }])
    .controller('drinksManagerctl', ['$scope', '$state', '$rootScope', 'Business', '$http', 'DrinksCategory', 'DrinksSpecial', 'DrinksSpecialCategory', 'DrinksDashLine', 'DrinksDashSubLine', 'DrinksType', 'DrinksExtras', 'DrinksMixer', 'DrinksSpecialDashLine', 'DrinksSpecialDashSubLine', 'loader',
        function ($scope, $state, $rootScope, Business, $http, DrinksCategory, DrinksSpecial, DrinksSpecialCategory, DrinksDashLine, DrinksDashSubLine, DrinksType, DrinksExtras, DrinksMixer, DrinksSpecialDashLine, DrinksSpecialDashSubLine, loader) {

            $scope.pad = (str, max) => {
                str = str.toString();
                return str.length < max ? pad("0" + str, max) : str;
            }

            toastMsg = (isVaild, msg) => {
                toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
                if (isVaild) toastr.success(msg);
                else toastr.error(msg);
            }

            $scope.happyhours = [];
            $scope.getdata = () => {
                $("#drinksManger").css({ "opacity": "0.1" });
                DrinksCategory.find({
                    filter: {
                        where: { ownerId: $scope.userId }, include: [{ relation: "drinksDashLines", scope: { include: [{ relation: "drinksDashSubLines", scope: { order: "order asc" } }, { relation: "drinksExtras" }, { relation: "drinksMixers" }, { relation: "drinksType" }] } },
                        { relation: "drinksSpecialCategories", scope: { include: [{ relation: "drinksSpecialDashLines", scope: { include: [{ relation: "drinksSpecialDashSubLines" }, { relation: "drinksType" }] } }, { relation: "drinksSpecial" }, { relation: "drinksCategory" }] } }], order: "order asc"
                    }
                }).$promise.then((res) => {
                    $scope.happyhours = [];
                    $scope.happyhours = res;
                    console.log(JSON.stringify(res));
                    $("#businessSubmit").html('<i class="fa fa-check"></i> Reset').prop('disabled', false);
                    setTimeout(function () {
                        $("#drinksManger").css({ "opacity": "" });
                    }, 1000);
                });
            };

            String.prototype.toCamelCase = function () {
                return this.replace(/^([A-Z])|\s(\w)/g, function (match, p1, p2, offset) {
                    if (p2) return p2.toUpperCase();
                    return p1.toLowerCase();
                });
            };

            $scope.isBusinessSelect = false;

            if (!$scope.userId) {
                $scope.userId = $rootScope.currentUser.id;
            }

            $scope.beerTypes = $scope.spiritTypes = $scope.wineTypes = [];
            $scope.getDrinksTypes = () => {
                DrinksType.find({ filter: { order: "type desc" } }).$promise.then((res) => {
                    if (res && res.length) {
                        $scope.beerTypes = $scope.spiritTypes = $scope.wineTypes = [];
                        $scope.beerTypes = res.filter((m) => m.category == "Beer" && m._type != "addNew");
                        $scope.spiritTypes = res.filter((m) => m.category == "Spirit");
                        $scope.wineTypes = res.filter((m) => m.category == "Wine");
                        $scope.cocktailTypes = res.filter((m) => m.category == "Cocktail");
                    }
                });
            }

            $scope.getSpecialType = () => {
                DrinksSpecial.find({ filter: { where: { ownerId: $scope.userId }, order: "type desc" } }).$promise.then((res) => {
                    $scope.specials = (res && res.length ? res : []);
                });
            };

            $scope.useremail = $rootScope.currentUser.email;
            $scope.userId = "";
            if ($rootScope && $rootScope.currentUser && $rootScope.currentUser.isAdmin) {
                $scope.isBusinessSelect = true;
                Business.find({ filter: { where: { status: "active" }, "fields": ["businessName", "id", "email"] } }).$promise.then((res) => {
                    $scope.businessDelection = res;
                    $scope.userId = $rootScope.currentUser.id;
                    if ($rootScope.selectedVenue && $rootScope.selectedVenue.venueId) {
                        $scope.userId = $rootScope.selectedVenue.venueId;
                        $("#autocompleteBusiness").val($rootScope.selectedVenue.venueName);
                        $("#autocompleteBusiness").data('id', $scope.userId);
                        $scope.getdata();
                        $scope.getSpecialType();
                        $scope.getDrinksTypes();
                        $scope.isBusinessSelect = $scope.isSelected = true;
                        $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
                    }
                });
            }
            else {
                $scope.isBusinessSelect = true;
                $scope.userId = $rootScope.currentUser.id;
            }

            $scope.getBusinessName = () => {
                return $scope.businessDelection;
            };

            $scope.specialChange = (val) => {
                if (val) $scope.drinksSpecialObj = val;
                $("#drinksSpecialVal").val(null);
                if (val && val._type == "addNew") {
                    $("#_addSpecialFooter").html(null)
                    $("#_addSpecialFooter").html(`<button data-type="${val._type}" data-idtxt="${val.id}" id="addSpecialBtn" onclick="addNewDrinksSpecial(this)" style="background-color:#4caf50 !important;border-radius: 2px;" class="btn btn-primary"><i class="fas fa-check"></i> &nbsp; Add</button>`);
                    $('#addSpecial').modal({ backdrop: 'static', keyboard: false });
                }
            };

            $scope.addDrinksSepcial = (arg) => {
                $("#special_err").css({ display: "none" });
                let type = $("#drinksSpecialVal").val();
                if (type) {
                    $(`#addSpecialBtn`).html('<i class="fas fa-spinner fa-spin"></i>&nbsp; Add').prop('disabled', true);
                    let _type = ($("#drinksSpecialVal").val()).toCamelCase();
                    DrinksSpecial.upsertWithWhere({ where: { _type, ownerId: $scope.userId } }, { _type, type, ownerId: $scope.userId }, () => {
                        $scope.getSpecialType();
                        $('#addSpecial').modal('hide');
                        $(`#addSpecialBtn`).html('<i class="fas fa-check"></i>&nbsp; Add').prop('disabled', true);
                        toastMsg(true, "Successfully created");
                    }, (err) => {
                        $scope.getSpecialType();
                        $('#addSpecial').modal('hide');
                        $(`#addSpecialBtn`).html('<i class="fas fa-check"></i>&nbsp; Add').prop('disabled', true);
                        toastMsg(false, "Please try again!");
                    });
                } else $("#special_err").css({ display: "block" })
            };

            $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

            if (!$scope.userDetails.isAdmin) $("#businessSubmit").css({ display: 'none' });


            $scope.isSelected = false;
            $scope.BusinessSelected = (arg) => {
                $("#businessErr").text('');
                if (arg) {
                    if ($("#autocompleteBusiness").data('id')) {
                        arg = $("#autocompleteBusiness").data('id');
                        if ($("#businessSubmit").hasClass('businessSubmit')) {
                            $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
                        }
                        if (arg != "select") {
                            $scope.isBusinessSelect = $scope.isSelected = true;
                            $scope.userId = arg;
                            $scope.getdata();
                            $scope.getSpecialType();
                            $scope.getDrinksTypes();
                            $scope.isBusinessSelect = true;
                            $rootScope.selectedVenue = { venueId: $scope.userId, venueName: $("#autocompleteBusiness").val() }
                            $("#businessSubmit").html('<i class="fas fa-spinner fa-spin"></i> Reset').prop('disabled', true);
                        }
                    } else {
                        $("#businessErr").text('Please select the Business name');
                    }
                }
            }

            $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

            if (!$scope.userDetails.isAdmin) $("#businessSubmit").css({ display: 'none' });

            if ($scope.userDetails.isAdmin == false) {
                $scope.isSelected = true;
                $scope.getdata();
                $scope.getSpecialType();
                $scope.getDrinksTypes();
                $scope.isBusinessSelect = true;
                $("#autocompleteBusiness").val($scope.userDetails.businessName);
                localStorage.removeItem("selectedVenue");
                $("#autocompleteBusiness").attr('disabled', true);
                $("#businessSubmit").addClass('businessReset');
                localStorage.setItem("selectedVenue", JSON.stringify({ ownerId: $scope.userDetails.id, venueName: $scope.userDetails.businessName }));
            }

            convertTime12to24 = (time12h) => {
                const [time, modifier] = time12h.split(' ');
                let [hours, minutes] = time.split(':');
                if (hours === '12') hours = '00';
                if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
                return `${hours}:${minutes}`;
            }

            $scope.addSpecial = (arg) => {
                if (arg) {
                    if ($scope.drinksSpecialObj) {
                        let startTime, _24startTime, endTime, _24endTime, isVaild = true, category = arg.name,
                            daysObj = {
                                value: false, startTime: null, startHour: 0, startMin: 0, _24startTime: null,
                                endTime: null, _24endTime: null, endHour: 0, endMin: 0
                            },
                            sunday = monday = tuesday = wednesday = thursday = friday = saturday = daysObj;
                        $(`#${category}_startTime_err,#${category}_endTime_err`).css({ display: "none" });
                        if (!$(`#startTime_${category}`).val()) {
                            isVaild = false;
                            $(`#${category}_startTime_err`).css({ display: "block" });
                        } else { startTime = $(`#startTime_${category}`).val(), _24startTime = convertTime12to24(startTime) }
                        if (!$(`#endTime_${category}`).val()) {
                            isVaild = false;
                            $(`#${category}_endTime_err`).css({ display: "block" });
                        } else { endTime = $(`#endTime_${category}`).val(), _24endTime = convertTime12to24(endTime) }

                        if (isVaild) {
                            $(".btnAfterMenu").each(function () {
                                if ($(this).data('dayname') == "sunday") sunday = {
                                    value: true, startTime, _24startTime,
                                    startHour: _24startTime.split(':')[0], startMin: _24startTime.split(':')[1],
                                    endTime, _24endTime, endHour: _24endTime.split(':')[0], endMin: _24endTime.split(':')[1]
                                };
                                if ($(this).data('dayname') == "monday") monday = {
                                    value: true, startTime, _24startTime,
                                    startHour: _24startTime.split(':')[0], startMin: _24startTime.split(':')[1],
                                    endTime, _24endTime, endHour: _24endTime.split(':')[0], endMin: _24endTime.split(':')[1]
                                };
                                if ($(this).data('dayname') == "tuesday") tuesday = {
                                    value: true, startTime, _24startTime,
                                    startHour: _24startTime.split(':')[0], startMin: _24startTime.split(':')[1],
                                    endTime, _24endTime, endHour: _24endTime.split(':')[0], endMin: _24endTime.split(':')[1]
                                };
                                if ($(this).data('dayname') == "wednesday") wednesday = {
                                    value: true, startTime, _24startTime,
                                    startHour: _24startTime.split(':')[0], startMin: _24startTime.split(':')[1],
                                    endTime, _24endTime, endHour: _24endTime.split(':')[0], endMin: _24endTime.split(':')[1]
                                };
                                if ($(this).data('dayname') == "thursday") thursday = {
                                    value: true, startTime, _24startTime,
                                    startHour: _24startTime.split(':')[0], startMin: _24startTime.split(':')[1],
                                    endTime, _24endTime, endHour: _24endTime.split(':')[0], endMin: _24endTime.split(':')[1]
                                };
                                if ($(this).data('dayname') == "friday") friday = {
                                    value: true, startTime, _24startTime,
                                    startHour: _24startTime.split(':')[0], startMin: _24startTime.split(':')[1],
                                    endTime, _24endTime, endHour: _24endTime.split(':')[0], endMin: _24endTime.split(':')[1]
                                };
                                if ($(this).data('dayname') == "saturday") saturday = {
                                    value: true, startTime, _24startTime,
                                    startHour: _24startTime.split(':')[0], startMin: _24startTime.split(':')[1],
                                    endTime, _24endTime, endHour: _24endTime.split(':')[0], endMin: _24endTime.split(':')[1]
                                };
                            });
                            $(`#_special_${category}`).html('<i class="fas fa-spinner fa-spin"></i> Save').prop('disabled', true);
                            loader.visible();
                            DrinksSpecialCategory.createAndUpdate({
                                params: {
                                    category, _category: ($.trim(arg.name)).toCamelCase(), ownerId: $scope.userId,
                                    drinksSpecialId: $scope.drinksSpecialObj.id, sunday, monday, tuesday,
                                    wednesday, thursday, friday, saturday, drinksCategoryId: arg.id
                                }
                            }).$promise.then((res) => {
                                if (res.data.isSuccess) {
                                    $(`#startTime_${category},#endTime_${category}`).val(null);
                                    $(`#startTime_${category}`).val('05:00 pm');
                                    $(`#endTime_${category}`).val('07:00 pm');
                                    toastMsg(true, "Successfully created!");
                                    $(".daysBtn").each(function () {
                                        $(this).attr('data-selected', false).addClass('btnBeforemenu').removeClass('btnAfterMenu').css({ 'background-color': '#757575' })
                                        if ($(this).attr('data-dayname') == "sunday") $(this).html('Sun');
                                        if ($(this).attr('data-dayname') == "monday") $(this).html('Mon');
                                        if ($(this).attr('data-dayname') == "tuesday") $(this).html('Tue');
                                        if ($(this).attr('data-dayname') == "wednesday") $(this).html('Wed');
                                        if ($(this).attr('data-dayname') == "thursday") $(this).html('Thu');
                                        if ($(this).attr('data-dayname') == "friday") $(this).html('Fri');
                                        if ($(this).attr('data-dayname') == "saturday") $(this).html('Sat');
                                    });
                                    $scope.getdata();
                                    setTimeout(function () { loader.hidden(); }, 500)
                                    $(`#_special_${category}`).html('<i class="fa fa-check"></i> Save').prop('disabled', false);
                                } else {
                                    loader.hidden();
                                    toastMsg(false, "Please try again!");
                                }
                            });
                        } else {
                            loader.hidden();
                            toastMsg(false, "Please try again!");
                        }

                    } else {
                        loader.hidden();
                        toastMsg(false, "Please select the Special");
                    }
                } else {
                    loader.hidden();
                    toastMsg(false, "Please try again!");
                }
            };

            $scope.drinksSpiritInAppSpecial = (category, menu, event, itemId) => {
                console.log(itemId);
                let _name = category._name, drinksSpecialCategoryId, categoryId, categoryName, order, inAppSpecial;
                if ($(`.${_name}_engaged.checked`).length == 1) {
                    $(`.${_name}_engaged`).each(function () {
                        if ($(this).attr('data-special-category-id')) {
                            if ($(this).hasClass('checked')) DrinksSpecialCategory.upsertWithWhere({ where: { id: $(this).attr('data-special-category-id') } }, { engaged: true });
                            else DrinksSpecialCategory.upsertWithWhere({ where: { id: $(this).attr('data-special-category-id') } }, { engaged: false });
                        }
                    });
                    $(`.${_name}_engaged.checked`).each(function () {
                        drinksSpecialCategoryId = $(this).attr('data-special-category-id')
                    });
                    categoryId = menu.id; categoryName = category.name; order = category.order;
                    inAppSpecial = $(event.target).parents('div').hasClass('checked');
                    let groupId = menu.groupId;
                    if (groupId) {
                        loader.visible();
                        DrinksSpecialCategory.createSpiritSpecial({ params: { drinksSpecialCategoryId, _name, groupId, itemId, categoryId, categoryName, order, inAppSpecial } }).$promise.then((res) => {
                            setTimeout(function () {
                                $scope.getdata();
                                loader.hidden();
                            }, 1000);
                        }, (err) => {
                            loader.hidden();
                        });
                    }

                } else toastMsg(false, "Please select the Special category!");
            };

            $scope.drinksInAppSpecial = (category, itemId, categoryId, event, order, _name, groupId) => {
                if ($(`.${_name}_engaged.checked`).length == 1) {
                    $("#drinksManger").css({ "opacity": "0.1" });
                    let drinksSpecialCategoryId;
                    $(`.${_name}_engaged.checked`).each(function () {
                        drinksSpecialCategoryId = $(this).attr('data-special-category-id')
                    });
                    $(`.${_name}_engaged`).each(function () {
                        if ($(this).attr('data-special-category-id')) {
                            if ($(this).hasClass('checked')) DrinksSpecialCategory.upsertWithWhere({ where: { id: $(this).attr('data-special-category-id') } }, { engaged: true });
                            else DrinksSpecialCategory.upsertWithWhere({ where: { id: $(this).attr('data-special-category-id') } }, { engaged: false });
                        }
                    });
                    let inAppSpecial = $(event.target).parents('div').hasClass('checked');
                    console.log({ params: { drinksSpecialCategoryId, itemId, categoryId, category, order, inAppSpecial, groupId } });
                    DrinksSpecialCategory.createSpecial({ params: { drinksSpecialCategoryId, itemId, categoryId, category, order, inAppSpecial, groupId } }).$promise.then((res) => {
                        setTimeout(function () { $scope.getdata(); }, 1000);
                    });
                } else toastMsg(false, "Please select the Special category!");
            };

            $scope.weekday = [{ name: 'Sun', txt: 'Sunday', val: 'sunday' }, { name: 'Mon', txt: 'Monday', val: 'monday' }, { name: 'Tue', txt: 'Tuesday', val: 'tuesday' },
            { name: 'Wed', txt: 'Wednesday', val: 'wednesday' }, { name: 'Thu', txt: 'Thursday', val: 'thursday' }, { name: 'Fri', txt: 'Friday', val: 'friday' },
            { name: 'Sat', txt: 'Saturday', val: 'saturday' }];

            $scope.daysSelected = (arg, day, sday, category) => {
                if ($(`#${arg}${category}_${day}`).attr('data-selected') == "true")
                    $(`#${arg}${category}_${day}`).attr('data-selected', false).addClass('btnBeforemenu').removeClass('btnAfterMenu').css({ 'background-color': '#757575' }).html(`${sday}`);
                else
                    $(`#${arg}${category}_${day}`).attr('data-selected', true).css({ 'background-color': '#4caf50' }).removeClass('btnBeforemenu').addClass('btnAfterMenu').html(`<i class="fas fa-check"></i> ${sday}`);
            }

            $scope.drinksSpecialEdit = (isSpecial, menu) => {
                $scope.editDataForBeer = menu;
                $scope.editDataForBeer.isSpecial = isSpecial;
                if (menu.drinksType.category == 'Beer') {
                    $("#beerEditAndUpdate").modal({ backdrop: 'static', keyboard: false });
                }
            };

            $scope.drinksSpecialUpdate = (category, menu) => {
                $(`#_${category.name}_${menu.id}_special_edit`).css({ display: "block" });
                $(`#_${category.name}_${menu.id}_special_update`).css({ display: "none" });
                let brand = $(`#_edit_${menu.id}_${category.id}_special_brand`).val(),
                    desc = $(`#_edit_${menu.id}_${category.id}_special_desc`).val(),
                    brandTxt = (brand).toCamelCase();
                DrinksSpecialDashLine.upsertWithWhere({ where: { id: menu.id } }, { brand, desc, brandTxt });
                $(`#_${menu.id}_${category.id}_special_brand`).html(`${brand}`);
                $(`#_${menu.id}_${category.id}_special_desc`).html(`${desc}`);
                for (let dispense of menu.drinksSpecialDashSubLines) {
                    $(`#_${menu.id}_${dispense.id}_special_dispense,#_${menu.id}_${dispense.id}_special_price`).attr('disabled', true);
                    if ($(`#_${menu.id}_${dispense.id}_special_dispense`).is(':checked')) {
                        DrinksSpecialDashSubLine.upsertWithWhere({ where: { id: dispense.id } }, { price: parseFloat($(`#_${menu.id}_${dispense.id}_special_price`).val()) })
                    } else DrinksSpecialDashSubLine.destroyById({ id: dispense.id });
                }
            }

            $scope.drinksEdit = (category, menu) => {
                $(`#_${category.name}_${menu.id}_edit`).css({ display: "none" });
                $(`#_${category.name}_${menu.id}_update`).css({ display: "block" });
                $(`#_${menu.id}_${category.id}_brand`).html(`<input type="text" id="_edit_${menu.id}_${category.id}_brand" style="padding: 1px 6px;margin-bottom: 5px;height: 25px;" class="form-control" value="${$.trim($(`#_${menu.id}_${category.id}_brand`).html())}" >`);
                $(`#_${menu.id}_${category.id}_desc`).html(`<input type="text" id="_edit_${menu.id}_${category.id}_desc" style="padding: 1px 6px;margin-bottom: 5px;height: 25px;" class="form-control" value="${$.trim($(`#_${menu.id}_${category.id}_desc`).html())}" >`);

                if (category.name == "Spirit") {
                    let wineTypes = '';
                    for (let type of $scope.spiritTypes) {
                        let selected = `selected="selected"`;
                        if (type.type == $.trim($(`#_${menu.id}_${category.id}_type`).html())) {
                            wineTypes += `<option ${selected} value="${type.id}">${type.type}</option>`;
                        } else wineTypes += `<option  value="${type.id}">${type.type}</option>`;
                    }
                    for (let mixer of menu.drinksMixers) $(`#_${menu.id}_${mixer.id}_mixer`).removeAttr('disabled');
                    for (let extra of menu.drinksExtras) $(`#_${menu.id}_${extra.id}_extra`).removeAttr('disabled');
                    $(`#_${menu.id}_${category.id}_type`).html(`<select id="_edit_${menu.id}_${category.id}_type" style="height: 25px;padding: 2px 2px;" class="form-control"
                    ng-model="drinksType">${wineTypes}</select>`);
                }
                if (category._name == "_beer_cider") {
                    $(`#_${menu.id}_${category.id}_type`).html(`<input type="text" id="_edit_${menu.id}_${category.id}_type" style="padding: 1px 6px;margin-bottom: 5px;height: 25px;" class="form-control" value="${$.trim($(`#_${menu.id}_${category.id}_type`).html())}" >`);
                }

                // if (category._name == "_beer_cider" || category._name == '_wine_bubbles') {
                //     let selected = `selected="selected"` , _classification;
                //     for (let type of (category._name == '_beer_cider' ? $scope.beerTypes : $scope.wineTypes)) {
                //         if (type.type == $.trim($(`#_${menu.id}_${category.id}_classification`).html())) {
                //             _classification += `<option ${selected} value="${type.id}">${type.type}</option>`;
                //         } else _classification += `<option value="${type.id}">${type.type}</option>`;
                //     }
                //     $(`#_${menu.id}_${category.id}_classification`).html(`<select id="_edit_${menu.id}_${category.id}_classification" style="height: 25px;padding: 2px 2px;" class="form-control"
                //     ng-model="drinksType">${_classification}</select>`);
                // }
                if (category.name == "Spirit") {
                    $(`#_${menu.id}_${category.id}_singlePrice`).html(`<input type="number" id="_edit_${menu.id}_${category.id}_singlePrice" style="padding: 1px 6px;margin-bottom: 5px;height: 25px;" class="form-control" value="${$.trim($(`#_${menu.id}_${category.id}_singlePrice`).html())}" >`);
                    $(`#_${menu.id}_${category.id}_doublePrice`).html(`<input type="number" id="_edit_${menu.id}_${category.id}_doublePrice" style="padding: 1px 6px;margin-bottom: 5px;height: 25px;" class="form-control" value="${$.trim($(`#_${menu.id}_${category.id}_doublePrice`).html())}" >`);
                }
                for (let dispense of menu.drinksDashSubLines) {
                    $(`#_${menu.id}_${dispense.id}_dispense,#_${menu.id}_${dispense.id}_price`).removeAttr('disabled');
                }
            };

            $scope.drinksUpdate = (category, menu) => {
                let brand = $(`#_edit_${menu.id}_${category.id}_brand`).val(),
                    desc = $(`#_edit_${menu.id}_${category.id}_desc`).val(),
                    brandTxt = (brand).toCamelCase(), type = null, drinksTypeId = null,
                    singlePrice = 0, doublePrice = 0;
                if (category.name == "Spirit") {
                    type = $(`#_edit_${menu.id}_${category.id}_type option:selected`).text(),
                        drinksTypeId = $(`#_edit_${menu.id}_${category.id}_type`).val();
                }
                if (category._name == "_beer_cider") {
                    type = $(`#_edit_${menu.id}_${category.id}_type`).val();
                    //  drinksTypeId = $(`#_edit_${menu.id}_${category.id}_classification`).val();
                }
                if (category.name == "Spirit") {
                    singlePrice = $(`#_edit_${menu.id}_${category.id}_singlePrice`).val();
                    doublePrice = $(`#_edit_${menu.id}_${category.id}_doublePrice`).val();
                    $(`#_${menu.id}_${category.id}_singlePrice`).html(`${singlePrice}`);
                    $(`#_${menu.id}_${category.id}_doublePrice`).html(`${doublePrice}`);
                    DrinksDashLine.upsertWithWhere({ where: { id: menu.id } }, { brand, desc, brandTxt, drinksTypeId });
                    DrinksDashSubLine.upsertWithWhere({ where: { drinksDashLineId: menu.id } }, { singlePrice, doublePrice });
                    for (let mixer of menu.drinksMixers) {
                        if (!$(`#_${menu.id}_${mixer.id}_mixer`).is(':checked')) DrinksMixer.destroyById({ id: mixer.id })
                    }
                    for (let extra of menu.drinksExtras) {
                        if (!$(`#_${menu.id}_${extra.id}_extra`).is(':checked')) DrinksExtras.destroyById({ id: extra.id })
                    }
                } else {
                    DrinksDashLine.upsertWithWhere({ where: { id: menu.id } }, { brand, desc, brandTxt, type });
                    for (let dispense of menu.drinksDashSubLines) {
                        $(`#_${menu.id}_${dispense.id}_dispense,#_${menu.id}_${dispense.id}_price`).attr('disabled', true);
                        if ($(`#_${menu.id}_${dispense.id}_dispense`).is(':checked')) {
                            DrinksDashSubLine.upsertWithWhere({ where: { id: dispense.id } }, { price: parseFloat($(`#_${menu.id}_${dispense.id}_price`).val()) })
                        } else DrinksDashSubLine.destroyById({ id: dispense.id });
                    }
                }

                $(`#_${category.name}_${menu.id}_update`).html('<i class="fas fa-spinner fa-spin"></i> Update').prop('disabled', true);
                setTimeout(function () {
                    $scope.getdata();
                    $(`#_${category.name}_${menu.id}_edit`).css({ display: "block" });
                    if (category.name != "Spirit") $(`#_${category.name}_${menu.id}_update`).css({ display: "none" }).html('<i class="far fa-save"></i> Update').prop('disabled', false);
                    else $(`#_${category.name}_${menu.id}_update`).css({ display: "none" }).html('<i class="far fa-save"></i>').prop('disabled', false);
                }, 100);
                $(`#_${menu.id}_${category.id}_brand`).html(`${brand}`);
                $(`#_${menu.id}_${category.id}_desc`).html(`${desc}`);
                if (category._name == "_beer_cider" || category._name == '_wine_bubbles') $(`#_${menu.id}_${category.id}_classification`).html(`${type}`);
                $(`#_${menu.id}_${category.id}_type`).html(`${type}`);
                toastMsg(true, "Successfully updated.");
            };

            $scope.drinksEditAndUpdate = (editDataForBeer) => {
                let type, brand, desc, brandTxt;
                if (editDataForBeer.isSpecial) {
                    type = $(`#${editDataForBeer.id}_type`).val();
                    brand = $(`#${editDataForBeer.id}_brand`).val();
                    if ($(`#${editDataForBeer.id}_brand`).val()) brandTxt = $(`#${editDataForBeer.id}_brand`).val().toLowerCase();
                    desc = $(`#${editDataForBeer.id}_description`).val();
                    $('#beerEditAndUpdate').modal('hide');
                    loader.visible();
                    for (let dashSubLine of editDataForBeer.drinksSpecialDashSubLines) {
                        DrinksSpecialDashSubLine.upsertWithWhere({ where: { id: dashSubLine.id } }, {
                            price: $(`#${dashSubLine.id}_dispense_price`).val()
                        });
                    }
                    DrinksSpecialDashLine.upsertWithWhere({ where: { id: editDataForBeer.id } }, { type, brand, brandTxt, desc }, () => {
                        toastMsg(true, "Successfully updated.");
                        setTimeout(function () {
                            $scope.getdata();
                            loader.hidden();
                        }, 500);
                    });
                }
            }

            $scope.drinksSpecialDelete = (groupId) => {
                if (groupId) {
                    loader.visible();
                    DrinksSpecialCategory.deleteDashAndSubLine({ params: { groupId } }).$promise.then((res) => {
                        setTimeout(function () {
                            $scope.getdata();
                            toastMsg(true, "Successfully deleted.");
                            loader.hidden();
                        }, 1000);
                    }, () => {
                        loader.hidden();
                        $scope.getdata();
                        toastMsg(false, "Please try agaian!");
                    });
                } else toastMsg(false, "Please try again!");
            };

            $scope.specialHeaderDelete = (e, category) => {
                if (e) {
                    loader.visible();
                    let dashLineIds = dashSubLineIds = [];
                    for (let val of e.drinksSpecialDashLines) {
                        dashLineIds.push({ id: val.id });
                        for (let Dashval of val.drinksSpecialDashSubLines) {
                            dashSubLineIds.push({ id: Dashval.id });
                        }
                    }
                    $(`#_${e.id}_${category.id}_header_delete`).html('<i class="fas fa-spinner fa-spin"></i> Delete').prop('disabled', true);
                    DrinksSpecial.headerDelete({ params: { id: e.id, drinksSpecialId: e.drinksSpecial.id, dashLineIds, dashSubLineIds } }).$promise.then((res) => {
                        toastMsg(true, "Successfully deleted.");
                        setTimeout(function () {
                            $(`#_${e.id}_${category.id}_header_delete`).html('<i class="far fa-trash-alt"></i> Delete').prop('disabled', false);
                            $scope.getdata();
                            loader.hidden();
                        }, 5000);
                    }, () => {
                        toastMsg(false, "Please try again!");
                        setTimeout(function () {
                            $(`#_${e.id}_${category.id}_header_delete`).html('<i class="far fa-trash-alt"></i> Delete').prop('disabled', false);
                            $scope.getdata();
                            loader.hidden();
                        }, 5000);
                    });
                } else toastMsg(false, "Please try again!");
            };

            $scope.drinksNormalDelete = (groupId) => {
                if (groupId) {
                    loader.visible();
                    DrinksCategory.deleteDashAndSubLine({ params: { groupId } }).$promise.then((res) => {
                        toastMsg(true, "Successfully deleted.");
                        setTimeout(function () {
                            $scope.getdata();
                            loader.hidden();
                        }, 500);

                    });
                } else {
                    toastMsg(false, "Please try again!");
                    setTimeout(function () {
                        $scope.getdata();
                        loader.hidden();
                    }, 500);

                }
            };

            $scope.isEngaged = (categoryId, id, _name, name) => {
                //  console.log(_name);
                //  $(`.${_name}_body.in`).each(function () { $(this).removeClass('in') })
                $(`.${_name}_engaged.checked`).each(function () { $(this).removeClass('checked') });
                // console.log(`#_${categoryId}_${id}_engaged`);
                if ($(`#_${categoryId}_${id}_engaged`).hasClass('checked')) $(`#_${categoryId}_${id}_engaged`).removeClass('checked');
                else $(`#_${categoryId}_${id}_engaged`).addClass('checked');
            };

        }]);