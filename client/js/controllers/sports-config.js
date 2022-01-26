angular
    .module('app')
    .controller('manageSportConfigCtl', ['$scope', '$state', 'Business', '$http', 'loader', 'SportsCategory', 'SportsTeamAndLogo', 'SponsorDetails',
        function ($scope, $state, Business, $http, loader, SportsCategory, SportsTeamAndLogo, SponsorDetails) {

            toastMsg = (isVaild, msg) => {
                if (isVaild)
                    toastr.success(msg);
                else
                    toastr.error(msg);
                toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
            }

            $scope.sportsData = [];
            $scope.sponsorData = [];
            $scope.getData = () => {
                loader.visible();
                SportsCategory.find().$promise.then((res) => {
                    $scope.sportsData = res;
                    setTimeout(function () {
                        loader.hidden();
                    }, 400)
                });
                SportsTeamAndLogo.find().$promise.then((res) => {
                    $scope.sportsTeamData = res;
                    setTimeout(function () {
                        loader.hidden();
                    }, 400)
                });
                SponsorDetails.find().$promise.then((res) => {
                    $scope.sponsorData = res;
                    setTimeout(function () {
                        loader.hidden();
                    }, 400)
                });
            }
            $scope.getData();


            $scope.showTheMiddle = (event, i) => {
                $(`.middle_${i}`).css({ 'display': 'block', 'position': 'absolute', 'right': '2%' });
            }
            $scope.hiddenTheMiddle = (i) => {
                $(`.middle_${i}`).css({ 'display': 'none' })
            }


            $scope.createSports = () => {
                $("#sport-c-err").html('');
                if ($("#text_sports").val()) {
                    let name = $("#text_sports").val(),
                        _name = name.replace(/\s/g, ''),
                        group = 'Sports';
                    loader.visible();

                    SportsCategory.find({ filter: { where: { _name, group, isSports: true } } }).$promise.then((res) => {
                        if (res && res.length && res[0].id) toastMsg(false, "This sport type exists. Please try again!")
                        else {
                            SportsCategory.create({ name, _name, group, isSports: true }).$promise.then((res) => {
                                toastMsg(true, "Successfully created!");
                                $scope.getData();
                                $("#text_sports").val('');
                            }, () => {
                                loader.hidden();
                                toastMsg(false, "Please try again!");
                            });
                        }
                    }, () => {
                        loader.hidden();
                        toastMsg(false, "Please try again!");
                    });
                } else {
                    $("#sport-c-err").html('Sport type is required!');
                }
            }


            $scope.view_Edit_Sports = (data, arg) => {
                if (data && data.id) {
                    loader.visible();
                    localStorage.removeItem('e_Sports_I_d');
                    localStorage.setItem('e_Sports_I_d', JSON.stringify({ id: data.id }));
                    SportsCategory.findOne({ filter: { where: { id: data.id, isSports: true } } }).$promise.then((res) => {
                        $scope.ed_vi_enable = arg;
                        $scope.view_edit_D = res;
                        setTimeout(function () {
                            loader.hidden();
                            $("#vi_ed_Popup").modal({ backdrop: 'static', keyboard: false });
                        }, 200);
                    }, () => {
                        toastMsg(false, "Please try again!");
                    });
                } else {
                    toastMsg(false, "Please try again!");
                }
            }

            $scope.up_ed_sports = () => {
                loader.visible();
                let ids = JSON.parse(localStorage.getItem('e_Sports_I_d'));
                if (ids && ids.id) {
                    let name = $("#sports_name_vi_edit").val();
                    let _name = $.trim(name);
                    SportsCategory.upsertWithWhere({ where: { id: ids.id } }, {
                        name, _name,
                        group: "Sports",
                        isSports: true
                    }, () => {
                        toastMsg(true, "Successfully updated!");
                        $scope.getData();
                        setTimeout(function () {
                            $("#vi_ed_Popup").modal('hide');
                        }, 200);
                    }, () => {
                        toastMsg(false, "Please try again!");
                    })
                } else toastMsg(false, "Please try again!");
            }


            $scope.createCompetition = () => {
                let sportId = $("#sportsId").val();
                let name = $("#competitionVal").val();
                $("#competition-c-err,#sport-c-err").html('');
                if (sportId && sportId != "Select an sport") {
                    if (name) {
                        let _name = name.replace(/\s/g, '');
                        let sData = $scope.sportsData.find(m => m.id == sportId);
                        if (sData && sData._name) {
                            let group = sData._name;
                            loader.visible();

                            SportsCategory.find({ filter: { where: { _name, group, isCompetition: true } } }).$promise.then((res) => {
                                if (res && res.length && res[0].id) toastMsg(false, "This sport type exists. Please try again!")
                                else {
                                    SportsCategory.create({ name, _name, group, isCompetition: true }).$promise.then((res) => {
                                        toastMsg(true, "Successfully created!");
                                        $scope.getData();
                                        $("#competitionVal,#sportsId").val('');
                                    }, () => {
                                        loader.hidden();
                                        toastMsg(false, "Please try again!");
                                    });
                                }
                            }, () => {
                                loader.hidden();
                                toastMsg(false, "Please try again!");
                            });
                        } else toastMsg(false, "Please try again!");

                    } else $("#competition-c-err").html('Competition is required!');
                } else $("#sport-c-err").html('Sport type is required!');
            }


            $scope.getCatgoryName = (val, data) => {
                if (data.sport) {
                    let fd = $scope.sportsData.find(m => m._name == val);
                    if (fd && fd.name) return fd.name;
                    return '';
                }
            }



            $scope.sportTeamType = (name) => {
                if (name) {
                    let data = ``;
                    let values = $scope.sportsData.filter(m => m.group == name);
                    $("#competitionTeamId").empty();
                    data = `<option value="Select an competition">Select an competition</option>`
                    values.forEach(v => {
                        data += `<option value="${v._name}">${v.name}</option>`
                    })
                    $("#competitionTeamId").append(data);
                }
            }


            $scope.createTeam = () => {
                let name = $("#text_team_competition").val();
                if (name) {
                    loader.visible();
                    let _name = name.replace(/\s/g, '');
                    let _sportGroup = '', _competitionGroup = '', img = {};
                    _sportGroup = $("#sportsComOnChange").val();
                    _competitionGroup = $("#competitionTeamId").val();
                    sportGroup = $.trim($("#sportsComOnChange option:selected").text());
                    competitionGroup = $.trim($("#competitionTeamId option:selected").text());
                    var fd = new FormData();
                    var extension = '';

                    function openFile(file) {
                        extension = file.substr((file.lastIndexOf('.') + 1));
                    };

                    openFile($('#text_team_image')[0].files[0].name);

                    var uid = uuidv4();
                    fd.append(`happenings_1`, $('#text_team_image')[0].files[0], `${uid}.${extension}`);

                    let create = () => {

                        SportsTeamAndLogo.find({ filter: { where: { _name, _competitionGroup, _sportGroup, sportGroup, competitionGroup } } }).$promise.then((res) => {
                            if (res && res.length && res[0].id) toastMsg(false, "This team name already exists. Please try again!")
                            else {
                                SportsTeamAndLogo.create({ name, _name, competitionGroup, sportGroup, _competitionGroup, _sportGroup, img }).$promise.then((res) => {
                                    toastMsg(true, "Successfully created!");
                                    $scope.getData();
                                    $("#text_team_image,#competitionTeamId,#sportsComOnChange,#text_team_competition").val('');
                                }, () => {
                                    loader.hidden();
                                    toastMsg(false, "Please try again!");
                                });
                            }
                        }, () => {
                            loader.hidden();
                            toastMsg(false, "Please try again!");
                        });
                    }

                    if ($("#competitionTeamId").val() && $("#competitionTeamId").val() != 'Select an competition') {
                        $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                            .then((res) => {
                                if (res && res.data && res.data.isSuccess && res.data.result && res.data.result[0]) {
                                    img = res.data.result[0];
                                    create();
                                } else {
                                    loader.hidden()
                                }
                            }, () => loader.hidden())
                    } else toastMsg(false, "Please select the competition!");
                } else toastMsg(false, "Team name is required. Please try again!");
            }

            $scope.isSCom = true;
            $scope.delete = (id) => {
                if (id) {
                    $scope.isSCom = true;
                    loader.visible();
                    localStorage.removeItem('dSportsCoFID');
                    localStorage.setItem('dSportsCoFID', JSON.stringify({ id }));
                    $("#deleteConfirmPopup").modal({ backdrop: 'static', keyboard: false });
                    setTimeout(function () { loader.hidden(); }, 200);
                } else toastMsg(false, "Please try again!");
            }

            $scope.confirmDelete = () => {
                loader.visible();
                $("#deleteConfirmPopup").modal('hide');
                if (localStorage.getItem('dSportsCoFID')) {
                    let ids = JSON.parse(localStorage.getItem('dSportsCoFID'));
                    if (ids.id) {
                        let { id } = ids;
                        SportsCategory.deleteById({ id }).$promise.then((res) => {
                            toastMsg(true, "Successfully deleted!");
                            $scope.getData();
                        }, () => {
                            loader.hidden();
                            toastMsg(false, "Please try again!");
                        });
                    } else {
                        loader.hidden();
                        toastMsg(false, "Please try again!");
                    }
                } else {
                    loader.hidden();
                    toastMsg(false, "Please try again!");
                }
            }

            $scope.deleteTeam = (id) => {
                if (id) {
                    $scope.isSCom = false;
                    loader.visible();
                    localStorage.removeItem('dSportsCoFIDTeM');
                    localStorage.setItem('dSportsCoFIDTeM', JSON.stringify({ id }));
                    $("#deleteConfirmPopup").modal({ backdrop: 'static', keyboard: false });
                    setTimeout(function () { loader.hidden(); }, 200);
                } else toastMsg(false, "Please try again!");
            }

            $scope.confirmTeamDelete = () => {
                loader.visible();
                $("#deleteConfirmPopup").modal('hide');
                if (localStorage.getItem('dSportsCoFIDTeM')) {
                    let ids = JSON.parse(localStorage.getItem('dSportsCoFIDTeM'));
                    if (ids.id) {
                        let { id } = ids;
                        SportsTeamAndLogo.deleteById({ id }).$promise.then((res) => {
                            toastMsg(true, "Successfully deleted!");
                            $scope.getData();
                        }, () => {
                            loader.hidden();
                            toastMsg(false, "Please try again!");
                        });
                    } else {
                        loader.hidden();
                        toastMsg(false, "Please try again!");
                    }
                } else {
                    loader.hidden();
                    toastMsg(false, "Please try again!");
                }
            }

            $scope.edit_team_logo = {};
            $scope.editTeamAndLogo = (id) => {
                loader.visible();
                if (id) {
                    localStorage.removeItem("e_logo_img_id");
                    localStorage.setItem("e_logo_img_id", JSON.stringify({ id }));
                    SportsTeamAndLogo.find({ filter: { where: { id } } }).
                        $promise.then((res) => {
                            if (res && res.length) {
                                $scope.edit_team_logo = res[0];
                                setTimeout(function () { loader.hidden(); }, 300);
                                $("#teamLogoEditAndUpdate").modal({ backdrop: 'static', keyboard: false });
                            } else {
                                toastMsg(false, "Please try again!");
                                setTimeout(function () { loader.hidden(); }, 300);
                            }
                        })
                } else {
                    loader.hidden();
                    toastMsg(false, "Please try again!");
                }
            }

            $scope.deleteLogoImage = (id) => {
                loader.visible();
                SportsTeamAndLogo.find({ filter: { where: { id } } }).
                    $promise.then((res) => {
                        if (res && res.length) {
                            let { img } = res[0];
                            $http.post('/spaceFileDelete', { fileName: img.fileName });
                            SportsTeamAndLogo.upsertWithWhere({ where: { id } }, { img: {} })
                                .$promise.then((del_res) => {
                                    $scope.editTeamAndLogo(id);
                                    toastMsg(true, "Successfully deleted");
                                    $scope.getData();
                                    setTimeout(function () { loader.hidden(); }, 300);
                                })
                        }
                    }, () => {
                        toastMsg(false, "Please try again!");
                        loader.hidden();
                    });
            }

            $scope.edit_UpLogoImage = () => {
                let ids = JSON.parse(localStorage.getItem("e_logo_img_id"));
                let img = {};

                let name = $("#team_group_e_v").val();
                let _name = name.replace(/\s/g, '');
                loader.visible();
                if ($("#e_u_logo_img").val()) {
                    var fd = new FormData();
                    var extension = '';
                    function openFile(file) {
                        extension = file.substr((file.lastIndexOf('.') + 1));
                    };
                    var uid = uuidv4();
                    openFile($('#e_u_logo_img')[0].files[0].name);
                    fd.append(`sports`, $('#e_u_logo_img')[0].files[0], `${uid}.${extension}`);

                    $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                        .then((res) => {
                            console.log(JSON.stringify(res));
                            if (res.data.result && res.data.result.length) {
                                img = res.data.result[0];
                                SportsTeamAndLogo.upsertWithWhere({ where: { id: ids.id } }, { img, _name, name })
                                    .$promise
                                    .then((res) => {
                                        toastMsg(true, "Successfully updated!");
                                        $scope.getData();
                                        setTimeout(function () { loader.hidden(); $("#teamLogoEditAndUpdate").modal('hide'); }, 300);
                                    }, () => {
                                        toastMsg(false, "Please try again!");
                                        loader.hidden()
                                    })
                            } else {
                                toastMsg(false, "Please try again!");
                                loader.hidden()
                            }
                        }, () => {
                            toastMsg(false, "Please try again!");
                            loader.hidden()
                        })
                } else if (name) {
                    SportsTeamAndLogo.upsertWithWhere({ where: { id: ids.id } }, { _name, name })
                        .$promise
                        .then((res) => {
                            toastMsg(true, "Successfully updated!");
                            $scope.getData();
                            setTimeout(function () { loader.hidden(); $("#teamLogoEditAndUpdate").modal('hide'); }, 300);
                        }, () => {
                            toastMsg(false, "Please try again!");
                            loader.hidden()
                        })
                }
            }

            $scope.viewTeamAndLogo = (id) => {
                loader.visible();
                if (id) {
                    SportsTeamAndLogo.find({ filter: { where: { id } } }).
                        $promise.then((res) => {
                            if (res && res.length) {
                                $scope.view_team_logo = res[0];
                                setTimeout(function () { loader.hidden(); }, 300);
                                $("#teamLogoModalView").modal({ backdrop: 'static', keyboard: false });
                            } else {
                                toastMsg(false, "Please try again!");
                                setTimeout(function () { loader.hidden(); }, 300);
                            }
                        })
                } else {
                    loader.hidden();
                    toastMsg(false, "Please try again!");
                }
            }

            $scope.viewCompetition = (id) => {
                loader.visible();
                if (id) {
                    SportsCategory.find({ filter: { where: { id } } }).
                        $promise.then((res) => {
                            if (res && res.length) {
                                let { group, name } = res[0];
                                SportsCategory.find({ filter: { where: { _name: group } } }).
                                    $promise.then((res_1) => {
                                        if (res_1 && res_1.length) {
                                            $scope.view_competion_data = { name, sportName: res_1[0].name }
                                            setTimeout(function () { loader.hidden(); }, 300);
                                            $("#competitionModalView").modal({ backdrop: 'static', keyboard: false });
                                        } else {
                                            toastMsg(false, "Please try again!");
                                            setTimeout(function () { loader.hidden(); }, 300);
                                        }
                                    });
                            } else {
                                toastMsg(false, "Please try again!");
                                setTimeout(function () { loader.hidden(); }, 300);
                            }
                        })
                } else {
                    loader.hidden();
                    toastMsg(false, "Please try again!");
                }
            }

            $scope.editCompetition_Data = (id) => {
                localStorage.removeItem("e_competition_id");
                localStorage.setItem("e_competition_id", JSON.stringify({ id }));
                loader.visible();
                if (id) {
                    SportsCategory.find({ filter: { where: { id } } }).
                        $promise.then((res) => {
                            if (res && res.length) {
                                let { group, name } = res[0];
                                SportsCategory.find({ filter: { where: { _name: group } } }).
                                    $promise.then((res_1) => {
                                        if (res_1 && res_1.length) {
                                            $scope.edit_competion_data = { name, sportName: res_1[0].name }
                                            setTimeout(function () { loader.hidden(); }, 300);
                                            $("#competitionModaledit").modal({ backdrop: 'static', keyboard: false });
                                        } else {
                                            toastMsg(false, "Please try again!");
                                            setTimeout(function () { loader.hidden(); }, 300);
                                        }
                                    });
                            } else {
                                toastMsg(false, "Please try again!");
                                setTimeout(function () { loader.hidden(); }, 300);
                            }
                        })
                } else {
                    loader.hidden();
                    toastMsg(false, "Please try again!");
                }
            }


            $scope.edit_Up_Competition = () => {
                let ids = JSON.parse(localStorage.getItem("e_competition_id"));

                let name = $("#Competition_group_2_e_v").val();
                let _name = name.replace(/\s/g, '');

                loader.visible();
                if (ids.id) {
                    SportsCategory.upsertWithWhere({ where: { id: ids.id } }, { name, _name }).
                        $promise.then((res) => {
                            setTimeout(function () {
                                $scope.getData()
                                $("#competitionModaledit").modal('hide');
                                toastMsg(true, "Successfully updated!");
                                loader.hidden();
                            }, 200)

                        }, () => {
                            setTimeout(function () {
                                $("#competitionModaledit").modal('hide');
                                toastMsg(false, "Please try again");
                                loader.hidden();
                            }, 200)
                        })
                } else {
                    setTimeout(function () {
                        $("#competitionModaledit").modal('hide');
                        toastMsg(false, "Please try again");
                        loader.hidden();
                    }, 200)
                }
            }

            $scope.viewSponsor = (id) => {
                loader.visible();
                if (id) {
                    SponsorDetails.find({ filter: { where: { id } } }).
                        $promise.then((res) => {
                            if (res && res.length) {
                                $scope.sponsorViewObj = res[0];
                                setTimeout(function () {
                                    $("#sponsorModalView").modal({ backdrop: 'static', keyboard: false });
                                    loader.hidden();
                                }, 200)
                            } else {
                                toastMsg(false, "Please try again!");
                                setTimeout(function () { loader.hidden(); }, 300);
                            }
                        })
                } else {
                    loader.hidden();
                    toastMsg(false, "Please try again!");
                }
            }

            $scope.DeleteSponsor = (id) => {
                loader.visible();
                if (id) {
                    localStorage.removeItem("e_delete_sponsor_id");
                    localStorage.setItem("e_delete_sponsor_id", JSON.stringify({ id }));
                    $("#SponsorConfirmPopup").modal({ backdrop: 'static', keyboard: false });
                    setTimeout(function () { loader.hidden(); }, 200)
                } else {
                    loader.hidden();
                    toastMsg(false, "Please try again!");
                }
            }

            $scope.confirmSponsorDelete = () => {
                loader.visible();
                $("#SponsorConfirmPopup").modal('hide');
                if (localStorage.getItem('e_delete_sponsor_id')) {
                    let ids = JSON.parse(localStorage.getItem('e_delete_sponsor_id'));
                    if (ids.id) {
                        let { id } = ids;
                        SponsorDetails.find({ filter: { where: { id } } }).
                            $promise.then((res_51) => {
                                if (res_51 && res_51.length) {
                                    let { sponsorLogo } = res_51[0];
                                    $http.post('/spaceFileDelete', { fileName: sponsorLogo.fileName });
                                    SponsorDetails.deleteById({ id }).$promise.then((res) => {
                                        toastMsg(true, "Successfully deleted!");
                                        $scope.getData();
                                    }, () => {
                                        loader.hidden();
                                        toastMsg(false, "Please try again!");
                                    });
                                }
                            })
                    } else {
                        loader.hidden();
                        toastMsg(false, "Please try again!");
                    }
                } else {
                    loader.hidden();
                    toastMsg(false, "Please try again!");
                }
            }

            $scope.edit_sposSor_Data = {};
            $scope.editSponsor_Data = (id) => {
                localStorage.removeItem("e_SponSor_eDI_id");
                localStorage.setItem("e_SponSor_eDI_id", JSON.stringify({ id }));
                loader.visible();
                if (id) {
                    SponsorDetails.find({ filter: { where: { id } } }).
                        $promise.then((res) => {
                            if (res && res.length) {
                                $scope.edit_sposSor_Data = res[0];
                                $("#sponsorModalEditU").modal({ backdrop: 'static', keyboard: false });
                                setTimeout(function () { loader.hidden(); }, 300);
                            } else {
                                toastMsg(false, "Please try again!");
                                setTimeout(function () { loader.hidden(); }, 300);
                            }
                        })
                } else {
                    loader.hidden();
                    toastMsg(false, "Please try again!");
                }
            }

            $scope.deleteSponsorImage = (id) => {
                loader.visible();
                SponsorDetails.find({ filter: { where: { id } } }).
                    $promise.then((res) => {
                        if (res && res.length) {
                            let { sponsorLogo } = res[0];
                            $http.post('/spaceFileDelete', { fileName: sponsorLogo.fileName });
                            SponsorDetails.upsertWithWhere({ where: { id } }, { sponsorLogo: {} })
                                .$promise.then((del_res) => {
                                    $scope.editSponsor_Data(id);
                                    toastMsg(true, "Successfully deleted");
                                    $scope.getData();
                                    setTimeout(function () { loader.hidden(); }, 300);
                                })
                        }
                    }, () => {
                        toastMsg(false, "Please try again!");
                        loader.hidden();
                    });
            }

            $scope.edit_Up_Sponsor = () => {
                let ids = JSON.parse(localStorage.getItem("e_SponSor_eDI_id"));
                let sponsorLogo = {};

                let sponsorName = $("#sponor_Name_e_v").val();
                loader.visible();
                if ($("#e_u_sponsor_img").val()) {
                    var fd = new FormData();
                    var extension = '';
                    function openFile(file) {
                        extension = file.substr((file.lastIndexOf('.') + 1));
                    };
                    var uid = uuidv4();
                    openFile($('#e_u_sponsor_img')[0].files[0].name);
                    fd.append(`sports`, $('#e_u_sponsor_img')[0].files[0], `${uid}.${extension}`);

                    $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                        .then((res) => {
                            console.log(JSON.stringify(res));
                            if (res.data.result && res.data.result.length) {
                                sponsorLogo = res.data.result[0];
                                SponsorDetails.upsertWithWhere({ where: { id: ids.id } }, { sponsorLogo, sponsorName })
                                    .$promise
                                    .then((res) => {
                                        $("#e_u_sponsor_img").val('');
                                        toastMsg(true, "Successfully updated!");
                                        $scope.getData();
                                        setTimeout(function () { loader.hidden(); $("#sponsorModalEditU").modal('hide'); }, 300);
                                    }, () => {
                                        toastMsg(false, "Please try again!");
                                        loader.hidden()
                                    })
                            } else {
                                toastMsg(false, "Please try again!");
                                loader.hidden()
                            }
                        }, () => {
                            toastMsg(false, "Please try again!");
                            loader.hidden()
                        })
                } else if (sponsorName) {
                    SponsorDetails.upsertWithWhere({ where: { id: ids.id } }, { sponsorName })
                        .$promise
                        .then((res) => {
                            toastMsg(true, "Successfully updated!");
                            $scope.getData();
                            setTimeout(function () { loader.hidden(); $("#sponsorModalEditU").modal('hide'); }, 300);
                        }, () => {
                            toastMsg(false, "Please try again!");
                            loader.hidden()
                        })
                }
            }

            $scope.createSponsor = () => {
                let sponsorName = $("#sponsor_name_txt").val();
                if (sponsorName) {
                    loader.visible();
                    let sponsorLogo = {};
                    var fd = new FormData();
                    var extension = '';

                    function openFile(file) {
                        extension = file.substr((file.lastIndexOf('.') + 1));
                    };

                    openFile($('#sponsor_img')[0].files[0].name);

                    var uid = uuidv4();
                    fd.append(`happenings_1`, $('#sponsor_img')[0].files[0], `${uid}.${extension}`);

                    let create = () => {

                        SponsorDetails.find({ filter: { where: { sponsorName } } }).$promise.then((res) => {
                            if (res && res.length && res[0].id) toastMsg(false, "This sponsor name already exists. Please try again!")
                            else {
                                SponsorDetails.create({ sponsorName, sponsorLogo }).$promise.then((res) => {
                                    $scope.getData();
                                    setTimeout(function () {
                                        toastMsg(true, "Successfully created!");
                                        $("#sponsor_img,#sponsor_name_txt").val('');
                                        loader.hidden();
                                    }, 300)
                                }, () => {
                                    loader.hidden();
                                    toastMsg(false, "Please try again!");
                                });
                            }
                        }, () => {
                            loader.hidden();
                            toastMsg(false, "Please try again!");
                        });
                    }

                    if ($("#sponsor_img").val() && $("#sponsor_name_txt").val()) {
                        $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                            .then((res) => {
                                if (res && res.data && res.data.isSuccess && res.data.result && res.data.result[0]) {
                                    sponsorLogo = res.data.result[0];
                                    create();
                                } else {
                                    loader.hidden()
                                }
                            }, () => loader.hidden())
                    } else toastMsg(false, "Image is required. Please try again!");
                } else toastMsg(false, "Sponsor name is required. Please try again!");
            }

        }]);