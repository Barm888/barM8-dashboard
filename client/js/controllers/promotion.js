angular
    .module('app')
    .controller('promotionCreateCtl', ['$scope', 'Business', '$http', 'AuthService', '$state', '$rootScope', 'Promotion', 'loader', 'SponsorDetails', function ($scope, Business, $http, AuthService, $state, $rootScope, Promotion, loader, SponsorDetails) {

        var toastMsg = (isVaild, msg) => {
            if (isVaild)
                toastr.success(msg);
            else
                toastr.error(msg);
            toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
        }

        $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

        if (!$scope.userDetails.isAdmin) $("#businessSubmit").css({ display: 'none' });

        $scope.createPromotion = () => {
            let isTrue = true, sponsorName, title, desc, startDate, sDate, endDate, sponsorDetailsId, eDate, startTime, endTime, videoThumbnail = [], primaryImg = [], secondaryImg = [], video = [], isImage = false;

            var uploadImg = () => {
                return new Promise((resolve, reject) => {

                    var fd = new FormData();
                    var extension = '';
                    function openFile(file) {
                        extension = file.substr((file.lastIndexOf('.') + 1));
                    };
                    var uid = uuidv4();
                    openFile($('#pPrimaryImgCnt')[0].files[0].name);
                    fd.append(`whatsonImg_1`, $('#pPrimaryImgCnt')[0].files[0], `${uid}.${extension}`);

                    loader.visible();
                    $http.post('/whatsonImg', fd, { headers: { 'Content-Type': undefined } })
                        .then((res) => {
                            if (res && res.data && res.data.isSuccess) {
                                primaryImg = [];
                                res.data.result.forEach(val => {
                                    if (val.path.includes('https://')) primaryImg.push({ fileName: val.fileName, path: `${val.path}`, image: true })
                                    else primaryImg.push({ fileName: val.fileName, path: `https://${val.path}`, image: true })
                                });
                                resolve({ isSuccess: true });
                            } else loader.hidden();
                        }, () => loader.hidden());
                })
            }

            var uploadVideoThumImg = () => {
                return new Promise((resolve, reject) => {

                    var fd = new FormData();
                    var extension = '';
                    function openFile(file) {
                        extension = file.substr((file.lastIndexOf('.') + 1));
                    };
                    var uid = uuidv4();
                    openFile($('#video-thumbnail')[0].files[0].name);
                    fd.append(`whatsonImg_1`, $('#video-thumbnail')[0].files[0], `${uid}.${extension}`);

                    loader.visible();
                    $http.post('/whatsonImg', fd, { headers: { 'Content-Type': undefined } })
                        .then((res) => {
                            if (res && res.data && res.data.isSuccess) {
                                videoThumbnail = [];
                                res.data.result.forEach(val => {
                                    if (val.path.includes('https://')) videoThumbnail.push({ fileName: val.fileName, path: `${val.path}`, image: true })
                                    else videoThumbnail.push({ fileName: val.fileName, path: `https://${val.path}`, image: true })
                                });
                                resolve({ isSuccess: true });
                            } else loader.hidden();
                        }, () => loader.hidden());
                })
            }

            var uploadSeondaryImg = () => {
                return new Promise((resolve, reject) => {

                    var fd = new FormData();

                    var totalfiles = document.getElementById('pSecondaryCnt').files.length;
                    for (var index = 0; index < totalfiles; index++) {
                        var extension = '';
                        function openFile(file) {
                            extension = file.substr((file.lastIndexOf('.') + 1));
                        };
                        var uid = uuidv4();
                        openFile(document.getElementById('pSecondaryCnt').files[index].name);
                        fd.append(`whatsonImg_${index}`, document.getElementById('pSecondaryCnt').files[index], `${uid}.${extension}`);
                    }

                    loader.visible();
                    $http.post('/whatsonImg', fd, { headers: { 'Content-Type': undefined } })
                        .then((res) => {
                            if (res && res.data && res.data.isSuccess) {
                                secondaryImg = [];
                                res.data.result.forEach(val => {
                                    if (val.path.includes('https://')) secondaryImg.push({ fileName: val.fileName, path: `${val.path}`, image: true })
                                    else secondaryImg.push({ fileName: val.fileName, path: `https://${val.path}`, image: true })
                                });
                                resolve({ isSuccess: true });
                            } else loader.hidden();
                        }, () => loader.hidden());
                })
            }

            var uploadVideo = () => {
                return new Promise((resolve, reject) => {

                    var fd = new FormData();
                    var files = $('#video').prop('files');
                    var extension = '';
                    function openFile(file) {
                        extension = file.substr((file.lastIndexOf('.') + 1));
                    };
                    var uid = uuidv4();
                    openFile(files[0].name);
                    fd.append(`whatson_0`, files[0], `${uid}.${extension}`);
                    loader.visible()

                    $http.post('/whatsonImg', fd, { headers: { 'Content-Type': undefined } })
                        .then((res) => {
                            if (res && res.data && res.data.isSuccess) {
                                video = [];
                                res.data.result.forEach(val => {
                                    if (val.path.includes('https://')) video.push({ fileName: val.fileName, path: `${val.path}`, image: false })
                                    else video.push({ fileName: val.fileName, path: `https://${val.path}`, image: false })
                                });
                                resolve({ isSuccess: true });
                            } else loader.hidden();
                        }, () => loader.hidden());
                })
            }


            if (!$("#promotion-title").val()) {
                isTrue = false;
                $("#promotion-title-err").text('Title is required!');
            }
            if (!$("#promotion-desc").val()) {
                isTrue = false;
                $("#promotion-description-err").text('Description is required!');
            }
            if (!$("#promotion-start-date").val()) {
                isTrue = false;
                $("#promotion-start-date-err").text('Start date is required!');
            }
            if (!$("#promotion-start-time").val()) {
                isTrue = false;
                $("#promotion-start-time-err").text('Start time is required!');
            }
            if (!$("#promotion-end-date").val()) {
                isTrue = false;
                $("#promotion-end-date-err").text('End date is required!');
            }
            if (!$("#promotion-end-time").val()) {
                isTrue = false;
                $("#promotion-end-time-err").text('End time is required!');
            }

            let pCreate = () => {
                sponsorDetailsId = $("#select-sponsor").val();
                Promotion.create({ sponsorName, title, startDate, endDate, startTime, endTime, sDate, eDate, desc, primaryImg, videoThumbnail, secondaryImg, video, isImage, sponsorDetailsId }).$promise.then((sResIm) => {
                    $(`#sponsor-name,#promotion-title,#promotion-desc,#promotion-start-date,#promotion-end-date,
                    #promotion-start-time,#promotion-end-time,#video,#pPrimaryImgCnt,#pSecondaryCnt,#video-thumbnail`).val('');
                    setTimeout(function () {
                        loader.hidden();
                        toastMsg(true, "Successfully created!");
                        $state.go('promotion');
                    })
                });
            }

            if (isTrue) {
                let startDateFormat = new Date($("#promotion-start-date").val()), endDateFormat = new Date($("#promotion-end-date").val());
                let date;
                date = `${startDateFormat.getDate()} - ${(startDateFormat.getMonth() + 1)}-${startDateFormat.getFullYear()} `;
                sDate = { dayNo: startDateFormat.getDate(), month: (startDateFormat.getMonth() + 1), year: startDateFormat.getFullYear(), date };
                date = `${endDateFormat.getDate()} -${(endDateFormat.getMonth() + 1)} -${endDateFormat.getFullYear()} `;
                eDate = { dayNo: endDateFormat.getDate(), month: (endDateFormat.getMonth() + 1), year: endDateFormat.getFullYear(), date };
                loader.visible();
                sponsorName = $("#sponsor-name").val();
                title = $("#promotion-title").val();
                desc = $("#promotion-desc").val();
                startDate = $("#promotion-start-date").val();
                endDate = $("#promotion-end-date").val();
                startTime = $("#promotion-start-time").val();
                endTime = $("#promotion-end-time").val();
                if ($("#pPrimaryImgCnt").val()) {
                    isImage = true;
                    var totalfiles = document.getElementById('pSecondaryCnt').files.length;
                    if ($("#pPrimaryImgCnt").val() && totalfiles) {
                        uploadImg().then(() => {
                            uploadSeondaryImg().then(() => {
                                pCreate();
                            })
                        });
                    } else {
                        uploadImg().then(() => {
                            pCreate();
                        });
                    }

                } else if ($('#video').prop('files').length) {
                    isImage = false;
                    uploadVideoThumImg().then(() => {
                        uploadVideo().then(() => {
                            pCreate();
                        })
                    })
                } else pCreate();
            }
        }

        $scope.sponsorList = [];
        $scope.getSponsorData = () => {
            SponsorDetails.find().$promise.then((res) => {
                $scope.sponsorList = [];
                $scope.sponsorList = res;
            })
        }
        $scope.getSponsorData();


        $scope.sponsorConDelete = (id) => {
            $("#deleteConfirm").modal({
                backdrop: 'static',
                keyboard: false
            });
            localStorage.removeItem("p_con_sp_delete_id");
            localStorage.setItem("p_con_sp_delete_id", JSON.stringify({ id }));
        }

        $scope.deleteSpConConfirm = () => {
            let ids = JSON.parse(localStorage.getItem("p_con_sp_delete_id"));
            if (ids && ids.id) {
                loader.visible();
                $("#deleteConfirm").modal('hide');
                SponsorDetails.findOne({ filter: { where: { id: ids.id } } }).$promise.then((res_1) => {
                    if (res_1) {
                        let { sponsorLogo } = res_1;
                        if (sponsorLogo) {
                            $http.post('/spaceFileDelete', { fileName: sponsorLogo.fileName });
                        }

                        SponsorDetails.deleteById({ id: ids.id }).$promise.then((res) => {
                            $scope.getSponsorData();
                            toastMsg(true, "Successfully deleted!");
                            setTimeout(function () { loader.hidden(); }, 500);
                        }, () => {
                            setTimeout(function () { loader.hidden(); }, 500);
                        });
                    }
                });

            }
        }


        $scope.createSponsorLogo = () => {
            let sponsorName, sponsorLogo, isTrue = true;
            sponsorName = $("#sponsorNameTxt").val();
            if (!$("#sponsorNameTxt").val()) {
                isTrue = false
            }
            if (!$("#text_promotion_logo").val()) {
                isTrue = false
            }

            if (isTrue) {

                var fd = new FormData();
                var extension = '';
                function openFile(file) {
                    extension = file.substr((file.lastIndexOf('.') + 1));
                };
                var uid = uuidv4();
                openFile($('#text_promotion_logo')[0].files[0].name);
                fd.append(`whatsonImg_1`, $('#text_promotion_logo')[0].files[0], `${uid}.${extension}`);

                loader.visible();
                $http.post('/whatsonImg', fd, { headers: { 'Content-Type': undefined } })
                    .then((res) => {
                        if (res && res.data && res.data.isSuccess) {
                            sponsorLogo = {};
                            res.data.result.forEach(val => {
                                if (val.path.includes('https://')) sponsorLogo = { fileName: val.fileName, path: `${val.path}` }
                                else sponsorLogo = { fileName: val.fileName, path: `https://${val.path}`, image: true }
                            });
                            SponsorDetails.find({ filter: { where: { sponsorName } } }).$promise.then((sResIm) => {
                                if (sResIm && sResIm.length && sResIm[0].sponsorName == sponsorName) toastMsg(false, "Sponsor name already exists. Please try again!")
                                else {
                                    SponsorDetails.create({ sponsorLogo, sponsorName }).$promise.then((resSP2) => {
                                        $scope.getSponsorData();
                                        setTimeout(function () {
                                            toastMsg(true, "Successfully created!")
                                            loader.hidden();
                                            $("#text_promotion_logo,#sponsorNameTxt").val('');
                                        }, 300);
                                    }, (err_1) => {
                                        console.log(JSON.stringify(err_1));
                                        toastMsg(false, "Please try again!")
                                        loader.hidden();
                                    });
                                }
                            }, (err) => {
                                console.log(JSON.stringify(err));
                                toastMsg(false, "Please try again!")
                                loader.hidden();
                            });

                        } else loader.hidden();
                    }, () => loader.hidden());
            } else {
                toastMsg(false, "Please try again!")
            }
        }

    }])
    .controller('managePromotionCtl', ['$scope', 'Business', '$http', 'AuthService', '$state', '$rootScope', 'Promotion', 'loader', function ($scope, Business, $http, AuthService, $state, $rootScope, Promotion, loader) {

        var toastMsg = (isVaild, msg) => {
            if (isVaild)
                toastr.success(msg);
            else
                toastr.error(msg);
            toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
        }

        $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

        if (!$scope.userDetails.isAdmin) $("#businessSubmit").css({ display: 'none' });

        $scope.showTheMiddle = (event, i) => {
            $(`.middle_${i} `).css({ 'display': 'block', 'position': 'absolute', 'right': '2%' });
        }
        $scope.hiddenTheMiddle = (i) => {
            $(`.middle_${i} `).css({ 'display': 'none' })
        }

        $scope.promotionList = [];
        $scope.getPromotionData = () => {
            $scope.promotionList = [];
            loader.visible();
            Promotion.find({ filter: { include: [{ relation: "sponsorDetails" }] } }).$promise.then((res) => {
                $scope.promotionList = res;
                setTimeout(function () { loader.hidden() }, 500);
            })
        }
        $scope.getPromotionData();

        $scope.deletePromotion = (id) => {
            $("#deleteConfirm").modal({
                backdrop: 'static',
                keyboard: false
            });
            localStorage.removeItem("p_mo_delete_id");
            localStorage.setItem("p_mo_delete_id", JSON.stringify({ id }));
        }

        $scope.deleteConfirm = () => {
            let ids = JSON.parse(localStorage.getItem("p_mo_delete_id"));
            if (ids && ids.id) {
                loader.visible();
                $("#deleteConfirm").modal('hide');
                Promotion.findOne({ filter: { where: { id: ids.id } } }).$promise.then((res_1) => {
                    if (res_1) {
                        let { primaryImg, secondaryImg, videoThumbnail } = res_1;
                        if (primaryImg && primaryImg.length) {
                            $http.post('/spaceFileDelete', { fileName: primaryImg[0].fileName });
                        }
                        if (secondaryImg && secondaryImg.length) {
                            for (let name of secondaryImg) {
                                $http.post('/spaceFileDelete', { fileName: name.fileName });
                            }
                        }
                        if (videoThumbnail && videoThumbnail.length) {
                            for (let name of videoThumbnail) {
                                $http.post('/spaceFileDelete', { fileName: name.fileName });
                            }
                        }


                        Promotion.deleteById({ id: ids.id }).$promise.then((res) => {
                            $scope.getPromotionData();
                            toastMsg(true, "Successfully deleted!");
                            setTimeout(function () { loader.hidden(); }, 500);
                        }, () => {
                            setTimeout(function () { loader.hidden(); }, 500);
                        });
                    }
                });

            }
        }

        $scope.viewPromotion = (id) => {
            if (id) {
                $scope.viewPromotionList = $scope.promotionList.find(m => m.id == id);
                $("#viwePromotionModal").modal({
                    backdrop: 'static',
                    keyboard: false
                });
            } else toastMsg(false, "Please try again");
        }

        $scope.editPromotion = (id) => {
            if (id) {
                localStorage.removeItem("edit_pro_id");
                localStorage.setItem("edit_pro_id", JSON.stringify({ id }));
                $state.go("edit-promotion");
            } else toastMsg(false, "Please try again");
        }

        $scope.filterPromotion = () => {
            if ($("#sponsor_name_fil").val()) {
                let sponsorName;
                sponsorName = $("#sponsor_name_fil").val();
                loader.visible();
                Promotion.find({ filter: { where: { "sponsorName": { "like": `${sponsorName}.* `, "options": "i" } } } }).$promise.then((res) => {
                    $scope.promotionList = [];
                    $scope.promotionList = res;
                    loader.hidden();
                }, (err) => {
                    loader.hidden();
                    toastMsg(false, "Please try again!");
                })
            } else {
                $scope.getPromotionData();
            }
        }


        $scope.updateStatus = (id) => {
            if (id) {
                loader.visible();
                Promotion.find({ filter: { where: { id } } })
                    .$promise.then((res) => {
                        let status = (res[0].status == 'Live' ? 'Pending' : 'Live');
                        Promotion.updateLive({ params: { id, status } }).$promise.then((res) => {
                            $scope.getPromotionData();
                            setTimeout(() => {
                                toastMsg(true, "Successfully updated!");
                            }, 400);
                        })
                    });
            } else toastMsg(false, "Please try again!");
        }


    }])
    .controller('promotionEditCtl', ['$scope', 'Business', '$http', 'AuthService', '$state', '$rootScope', 'Promotion', 'loader', 'SponsorDetails', function ($scope, Business, $http, AuthService, $state, $rootScope, Promotion, loader, SponsorDetails) {

        let toastMsg = (isVaild, msg) => {
            if (isVaild)
                toastr.success(msg);
            else
                toastr.error(msg);
            toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
        }

        $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

        if (!$scope.userDetails.isAdmin) $("#businessSubmit").css({ display: 'none' });

        $scope.getEditItem = () => {
            let ids = JSON.parse(localStorage.getItem("edit_pro_id"));
            loader.visible();
            $scope.editdataList = {};
            Promotion.find({ filter: { where: { id: ids.id }, include: [{ relation: "sponsorDetails" }] } }).$promise.then((res) => {
                setTimeout(function () { loader.hidden() }, 500);
                if (res && res.length) {
                    $scope.editdataList = res[0];
                    $scope.editdataList.startDate = new Date($scope.editdataList.startDate);
                    $scope.editdataList.endDate = new Date($scope.editdataList.endDate);
                }
            })
        }
        $scope.getEditItem();

        $scope.sponsorList = [];
        $scope.getSponsorData = () => {
            SponsorDetails.find().$promise.then((res) => {
                $scope.sponsorList = [];
                $scope.sponsorList = res;
            })
        }
        $scope.getSponsorData();

        $scope.updatePromotion = () => {
            let ids = JSON.parse(localStorage.getItem("edit_pro_id"));
            let sponsorName, title, desc, startDate, sDate, endDate, eDate, startTime, endTime, primaryImg = [], videoThumbnail = [], secondaryImg = [], video = [];

            let uploadPrimaryImg = () => {
                return new Promise((resolve, reject) => {

                    var fd = new FormData();
                    var extension = '';
                    function openFile(file) {
                        extension = file.substr((file.lastIndexOf('.') + 1));
                    };
                    var uid = uuidv4();
                    openFile($('#pPrimaryImgCnt')[0].files[0].name);
                    fd.append(`whatsonImg_1`, $('#pPrimaryImgCnt')[0].files[0], `${uid}.${extension}`);

                    loader.visible();
                    $http.post('/whatsonImg', fd, { headers: { 'Content-Type': undefined } })
                        .then((res) => {
                            if (res && res.data && res.data.isSuccess) {
                                primaryImg = [];
                                res.data.result.forEach(val => {
                                    if (val.path.includes('https://')) primaryImg.push({ fileName: val.fileName, path: `${val.path}`, image: true })
                                    else primaryImg.push({ fileName: val.fileName, path: `https://${val.path}`, image: true })
                                });
                                resolve({ isSuccess: true });
                            } else loader.hidden();
                        }, () => loader.hidden());
                })
            }

            var uploadVideoThumImg = () => {
                return new Promise((resolve, reject) => {

                    var fd = new FormData();
                    var extension = '';
                    function openFile(file) {
                        extension = file.substr((file.lastIndexOf('.') + 1));
                    };
                    var uid = uuidv4();
                    openFile($('#video-thumbnail')[0].files[0].name);
                    fd.append(`whatsonImg_1`, $('#video-thumbnail')[0].files[0], `${uid}.${extension}`);

                    loader.visible();
                    $http.post('/whatsonImg', fd, { headers: { 'Content-Type': undefined } })
                        .then((res) => {
                            if (res && res.data && res.data.isSuccess) {
                                videoThumbnail = [];
                                res.data.result.forEach(val => {
                                    if (val.path.includes('https://')) videoThumbnail.push({ fileName: val.fileName, path: `${val.path}`, image: true })
                                    else videoThumbnail.push({ fileName: val.fileName, path: `https://${val.path}`, image: true })
                                });
                                resolve({ isSuccess: true });
                            } else loader.hidden();
                        }, () => loader.hidden());
                })
            }

            let uploadSeondaryImg = () => {
                return new Promise((resolve, reject) => {

                    var fd = new FormData();

                    var totalfiles = document.getElementById('pSecondaryCnt').files.length;
                    for (var index = 0; index < totalfiles; index++) {
                        var extension = '';
                        function openFile(file) {
                            extension = file.substr((file.lastIndexOf('.') + 1));
                        };
                        var uid = uuidv4();
                        openFile(document.getElementById('pSecondaryCnt').files[index].name);
                        fd.append(`whatsonImg_${index}`, document.getElementById('pSecondaryCnt').files[index], `${uid}.${extension}`);
                    }

                    loader.visible();
                    $http.post('/whatsonImg', fd, { headers: { 'Content-Type': undefined } })
                        .then((res) => {
                            if (res && res.data && res.data.isSuccess) {
                                secondaryImg = [];
                                res.data.result.forEach(val => {
                                    if (val.path.includes('https://')) secondaryImg.push({ fileName: val.fileName, path: `${val.path}`, image: true })
                                    else secondaryImg.push({ fileName: val.fileName, path: `https://${val.path}`, image: true })
                                });
                                resolve({ isSuccess: true });
                            } else loader.hidden();
                        }, () => loader.hidden());
                })
            }

            let uploadVideo = () => {
                return new Promise((resolve, reject) => {
                    var fd = new FormData();
                    var files = $('#video').prop('files');
                    var extension = '';
                    function openFile(file) {
                        extension = file.substr((file.lastIndexOf('.') + 1));
                    };
                    var uid = uuidv4();
                    openFile(files[0].name);
                    fd.append(`whatson_0`, files[0], `${uid}.${extension}`);

                    loader.visible();
                    $http.post('/whatsonImg', fd, { headers: { 'Content-Type': undefined } })
                        .then((res) => {
                            if (res && res.data && res.data.isSuccess) {
                                video = [];
                                res.data.result.forEach(val => {
                                    if (val.path.includes('https://')) video.push({ fileName: val.fileName, path: `${val.path}`, image: true })
                                    else video.push({ fileName: val.fileName, path: `https://${val.path}`, image: true })
                                });
                                resolve({ isSuccess: true });
                            } else loader.hidden();
                        }, () => loader.hidden());
                })
            }


            let updateData = (arg = { sponsorName, title, desc, sDate, eDate, startDate, endDate, startTime, endTime }) => {
                loader.visible();
                Promotion.upsertWithWhere({ where: { id: ids.id } }, arg).$promise.then((res) => {
                    setTimeout(function () {
                        loader.hidden();
                    }, 500);
                    $scope.getEditItem();
                    toastMsg(true, "Successfully updated");
                }, (err) => {
                    toastMsg(false, "Please try again");
                });
            }

            sponsorName = $("#sponsor-name").val();
            title = $("#promotion-title").val();
            desc = $("#promotion-desc").val();
            startTime = $("#promotion-start-time").val();
            endTime = $("#promotion-end-time").val();
            startDate = $("#promotion-start-date").val();
            endDate = $("#promotion-end-date").val();
            let startDateFormat = new Date($("#promotion-start-date").val()), endDateFormat = new Date($("#promotion-end-date").val());
            let date;
            date = `${startDateFormat.getDate()}-${(startDateFormat.getMonth() + 1)}-${startDateFormat.getFullYear()}`;
            sDate = { dayNo: startDateFormat.getDate(), month: (startDateFormat.getMonth() + 1), year: startDateFormat.getFullYear(), date };
            date = `${endDateFormat.getDate()}-${(endDateFormat.getMonth() + 1)}-${endDateFormat.getFullYear()}`;
            eDate = { dayNo: endDateFormat.getDate(), month: (endDateFormat.getMonth() + 1), year: endDateFormat.getFullYear(), date };

            let seCnt = document.getElementById('pSecondaryCnt').files.length;

            let createObj = { sponsorName, title, desc, sDate, eDate, startDate, endDate, startTime, endTime };

            if ($("#pPrimaryImgCnt").val() && seCnt) {
                uploadPrimaryImg().then(() => {
                    createObj.primaryImg = [];
                    createObj.primaryImg = primaryImg;
                    $("#pPrimaryImgCnt").val('');
                    uploadSeondaryImg().then(() => {
                        createObj.secondaryImg = [];
                        Promotion.findOne({ filter: { where: { id: ids.id } } }).$promise.then((sResIm) => {
                            if (sResIm) {
                                $("#video").prop('disabled', false);
                                createObj.secondaryImg = sResIm.secondaryImg;
                                for (let v of secondaryImg) createObj.secondaryImg.push(v);
                                $("#pSecondaryCnt").val('');
                                updateData(createObj);
                            }
                        })
                    })
                });
            } else if ($("#pPrimaryImgCnt").val()) {
                uploadPrimaryImg().then(() => {
                    $("#video").prop('disabled', false);
                    createObj.primaryImg = [];
                    createObj.primaryImg = primaryImg;
                    $("#pPrimaryImgCnt").val('');
                    updateData(createObj);
                });
            } else if (seCnt) {
                uploadSeondaryImg().then(() => {
                    createObj.secondaryImg = [];
                    Promotion.findOne({ filter: { where: { id: ids.id } } }).$promise.then((sResIm) => {
                        if (sResIm) {
                            $("#video").prop('disabled', false);
                            createObj.secondaryImg = sResIm.secondaryImg;
                            for (let v of secondaryImg) createObj.secondaryImg.push(v);
                            $("#pSecondaryCnt").val('');
                            updateData(createObj);
                        }
                    })
                })
            } else if ($('#video').prop('files').length && $('#video-thumbnail').val()) {
                uploadVideo().then(() => {
                    uploadVideoThumImg().then(() => {
                        $("#video,#video-thumbnail").val('');
                        $("#pSecondaryCnt, #pPrimaryImgCnt").prop('disabled', false);
                        createObj.video = [];
                        createObj.video = video;
                        createObj.videoThumbnail = [];
                        createObj.videoThumbnail = videoThumbnail;
                        updateData(createObj);
                    })
                })
            } else if ($('#video').prop('files').length) {
                uploadVideo().then(() => {
                    $("#video").val('');
                    $("#pSecondaryCnt, #pPrimaryImgCnt").prop('disabled', false);
                    createObj.video = [];
                    createObj.video = video;
                    updateData(createObj);
                })
            } else if ($('#video-thumbnail').val()) {
                uploadVideoThumImg().then(() => {
                    $("#video-thumbnail").val('');
                    $("#pSecondaryCnt, #pPrimaryImgCnt").prop('disabled', false);
                    createObj.videoThumbnail = [];
                    createObj.videoThumbnail = videoThumbnail;
                    updateData(createObj);
                })
            } else updateData(createObj);

        }

        $scope.deletePrimaryImg = (id) => {
            if (id) {
                loader.visible();
                Promotion.findOne({ filter: { where: { id } } }).$promise.then((res) => {
                    if (res && res.primaryImg && res.primaryImg.length) {
                        $http.post('/spaceFileDelete', { fileName: res.primaryImg[0].fileName }).then((deleteImg) => {
                            Promotion.upsertWithWhere({ where: { id } }, { primaryImg: [] });
                            setTimeout(function () {
                                toastMsg(true, "Successfully deleted!");
                                $scope.getEditItem();
                                loader.hidden();
                            }, 1500)
                        }, () => {
                            loader.hidden();
                            toastMsg(false, "Please try again!");
                        });
                    } else {
                        loader.hidden();
                        toastMsg(false, "Please try again!");
                    }
                }, () => {
                    loader.hidden();
                    toastMsg(false, "Please try again!");
                });

            } else toastMsg(false, "Please try again!");
        };


        $scope.deleteSecondaryImg = (id, fileName) => {
            if (id) {
                loader.visible();
                Promotion.findOne({ filter: { where: { id } } }).$promise.then((res) => {
                    if (res && res.secondaryImg && res.secondaryImg.length) {

                        let index = res.secondaryImg.findIndex(a => a.fileName === fileName);

                        res.secondaryImg.splice(index, 1);

                        $http.post('/spaceFileDelete', { fileName: fileName }).then((deleteImg) => {
                            Promotion.upsertWithWhere({ where: { id } }, { secondaryImg: res.secondaryImg });
                            setTimeout(function () {
                                toastMsg(true, "Successfully deleted!");
                                $scope.getEditItem();
                                loader.hidden();
                            }, 1500)
                        }, () => {
                            loader.hidden();
                            toastMsg(false, "Please try again!");
                        });
                    } else {
                        loader.hidden();
                        toastMsg(false, "Please try again!");
                    }
                }, () => {
                    loader.hidden();
                    toastMsg(false, "Please try again!");
                });

            } else toastMsg(false, "Please try again!");
        };

        $scope.deleteVideo = (id) => {
            if (id) {
                loader.visible();
                Promotion.findOne({ filter: { where: { id } } }).$promise.then((res) => {
                    if (res && res.video && res.video.length) {
                        $http.post('/spaceFileDelete', { fileName: res.video[0].fileName }).then((deleteImg) => {
                            Promotion.upsertWithWhere({ where: { id } }, { video: [] });
                            setTimeout(function () {
                                toastMsg(true, "Successfully deleted!");
                                $scope.getEditItem();
                                loader.hidden();
                            }, 1500)
                        }, () => {
                            loader.hidden();
                            toastMsg(false, "Please try again!");
                        });
                    } else {
                        loader.hidden();
                        toastMsg(false, "Please try again!");
                    }
                }, () => {
                    loader.hidden();
                    toastMsg(false, "Please try again!");
                });

            } else toastMsg(false, "Please try again!");
        };

        $scope.deleteVideoThumbnail = (id) => {
            if (id) {
                loader.visible();
                Promotion.findOne({ filter: { where: { id } } }).$promise.then((res) => {
                    if (res && res.video && res.video.length) {
                        $http.post('/spaceFileDelete', { fileName: res.videoThumbnail[0].fileName }).then((deleteImg) => {
                            Promotion.upsertWithWhere({ where: { id } }, { videoThumbnail: [] });
                            setTimeout(function () {
                                toastMsg(true, "Successfully deleted!");
                                $scope.getEditItem();
                                loader.hidden();
                            }, 1500)
                        }, () => {
                            loader.hidden();
                            toastMsg(false, "Please try again!");
                        });
                    } else {
                        loader.hidden();
                        toastMsg(false, "Please try again!");
                    }
                }, () => {
                    loader.hidden();
                    toastMsg(false, "Please try again!");
                });

            } else toastMsg(false, "Please try again!");
        };
    }]);