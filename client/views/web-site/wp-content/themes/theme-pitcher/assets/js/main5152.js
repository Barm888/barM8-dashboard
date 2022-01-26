var Homepage = Barba.BaseView.extend({
    namespace: 'home',
    onEnter: function () {
        $('body')
            .addClass('home');
        var h = window.innerHeight;
        $('.section')
            .height(h)
    },
    onEnterCompleted: function () {
        PHome.carousel();
    },
    onLeave: function () {
        $('body')
            .removeClass('home');
    }
});

var Work = Barba.BaseView.extend({
    namespace: 'work',
    onEnter: function () {
        $('body')
            .addClass('work');
        var h = window.innerHeight;
        $('.section')
            .height(h)
    },
    onEnterCompleted: function () {
        PWork.carousel();
    },
    onLeave: function () {
        $('body')
            .removeClass('work');
    }
});
var WorkDetail = Barba.BaseView.extend({
    namespace: 'work-detail',
    onLeave: function () {
        $('body')
            .removeClass('work-detail');
    }
});

// Don't forget to init the view!
Homepage.init();
Work.init();
WorkDetail.init();
var FadeTransition = Barba.BaseTransition.extend({
        start: function () {
            Promise.all([this.newContainerLoading, this.fadeOut()])
                .then(this.fadeIn.bind(this))
        },
        fadeOut: function () {
            return $(this.oldContainer)
                .animate({
                    opacity: 0
                }, function () {
                    Barba.Dispatcher.trigger("updatePage")
                })
                .promise()
        },
        fadeIn: function () {
            var e = this,
                i = $(this.newContainer);
            $(this.oldContainer)
                .hide(), i.css({
                    visibility: "visible",
                    opacity: 0
                }), i.animate({
                    opacity: 1
                }, 400, function () {
                    e.done()
                })
        }
    }),
    ptchrTransition = Barba.BaseTransition.extend({
        start: function () {
            Promise
                .all([this.newContainerLoading, this.hideOld()])
                .then(this.showNew.bind(this));
        },
        hideOld: function () {
            var check = this
        },
        showNew: function () {
            var _this = this,
                $el = $(this.newContainer),
                $elOld = $(this.oldContainer),
                $navLoader = $('.nav_left .loader'),
                $navIcon = $('.nav_left .nav-icon span'),
                $navigationItems = $('nav.main ul.pages li'),
                $navigationItemsContact = $('nav.main ul.contact li ul'),
                contentVisible = false,
                currentCaseAnimationDone = false,
                newPageLoaded = false;

            $el.addClass("new-container");
            $('body')
                .addClass('overflow');

            function checkStatus() {
                if (currentCaseAnimationDone === true && newPageLoaded === true) {
                    if (!contentVisible) {
                        contentVisible = true;
                        continueCaseAnimation();
                    }

                } else {
                    setTimeout(function () {
                        checkStatus();
                    }, 500);
                }
            }
            Pace.on('done', function () {
                newPageLoaded = true;
                checkStatus()
            });

            var currentCaseAnimation = new TimelineMax({
                force3D: true,
                onStart: function () {
                    $('body')
                        .scrollTop(0);
                },
                onComplete: function () {
                    var i = Barba.HistoryManager.prevStatus();
                    if ("home" == i.namespace || "work" == i.namespace) {
                        $.fn.fullpage.destroy('all');
                    }
                    currentCaseAnimationDone = true;
                    checkStatus();
                }
            });
            currentCaseAnimation
                .to($navIcon, .1, {
                    ease: Power3.easeInOut,
                    autoAlpha: 0
                })
                .to($navLoader, .2, {
                    ease: Power3.easeIn,
                    autoAlpha: 1
                }, '-=.1')
                .staggerTo($navigationItems, .5, {
                    y: 50,
                    autoAlpha: 0,
                    ease: Sine.easeInOut
                }, .1)
                .staggerTo($navigationItemsContact, .5, {
                    y: 50,
                    autoAlpha: 0,
                    ease: Sine.easeInOut
                }, '-=.5', 0.1)
                .to($(".background-bg"), .3, {
                    autoAlpha: 0
                })
                .to($(".bg-wrap"), .3, {
                    autoAlpha: 0
                }, '-=.3')
                .to($elOld, 0, {
                    position: 'absolute',
                    autoAlpha: 0
                })
                .to($el, 0, {
                    autoAlpha: 1,
                    zIndex: 2,
                    ease: Sine.easeInOut,
                    onComplete: function () {
                        $('.nav-icon')
                            .removeClass('open');
                    }
                });

            function continueCaseAnimation() {
                var continueCaseAnimation = new TimelineMax({
                    force3D: true,
                    onComplete: function () {
                        contentVisible = false,
                            currentCaseAnimationDone = false,
                            newPageLoaded = false;
                        $el.removeClass("new-container");
                        $('body')
                            .removeClass('overflow');
                        animations.init();
                        $("body")
                            .removeClass("navigation-is-open");
                        _this.done()
                        resetTweens();
                    }
                });
                continueCaseAnimation
                    .to($("nav.main"), .5, {
                        yPercent: -100,
                        ease: Power3.easeOut
                    }, '+=.2')
                    .to($navLoader, .3, {
                        ease: Power3.easeIn,
                        autoAlpha: 0
                    }, '-=.3')
                    .to($navIcon, .3, {
                        ease: Power3.easeInOut,
                        autoAlpha: 1
                    }, '-=.3')
            }

            function resetTweens() {
                TweenMax.set($("nav.main"), {
                    clearProps: "all"
                });
                TweenMax.set($navigationItems, {
                    clearProps: "all"
                });
                TweenMax.set($navigationItemsContact, {
                    clearProps: "all"
                });
                TweenMax.set($(".bg-wrap"), {
                    clearProps: "all"
                });
                TweenMax.set($("nav.main .circle-bg"), {
                    clearProps: "all"
                });

            }
        }
    }),

    defaultTransition = Barba.BaseTransition.extend({
        start: function () {
            Promise
                .all([this.newContainerLoading, this.hideOld()])
                .then(this.showNew.bind(this));
        },
        hideOld: function () {
            var check = this
        },
        showNew: function () {
            var _this = this,
                $el = $(this.newContainer),
                $elOld = $(this.oldContainer),
                $navLoader = $('.nav_left .loader'),
                $navIcon = $('.nav_left .nav-icon span'),
                $navigationItems = $('nav.main ul.pages li'),
                $navigationItemsContact = $('nav.main ul.contact li ul'),
                contentVisible = false,
                animationDone = false,
                newPageLoaded = false;

            $el.addClass("new-container");
            $('body')
                .addClass('overflow');

            function checkStatus() {
                if (animationDone === true && newPageLoaded === true) {
                    if (!contentVisible) {
                        contentVisible = true;
                        showContent();
                    }
                } else {
                    setTimeout(function () {
                        checkStatus();
                    }, 500);
                }
            }
            Pace.on('done', function () {
                newPageLoaded = true;
                checkStatus()
            });


            var introTimeline = new TimelineMax({
                    onComplete: function () {
                        animationDone = true;
                        checkStatus();
                        var i = Barba.HistoryManager.prevStatus();
                        if ("home" == i.namespace || "work" == i.namespace) {
                            $.fn.fullpage.destroy('all');
                        }
                    }
                })
                .to('.sub-loader', .7, {
                    y: 0,
                    ease: Sine.easeOut

                })
                .set($elOld, {
                    position: 'absolute',
                    autoAlpha: 0
                })
                .to('.sub-loader .inner', .7, {
                    y: 0,
                    ease: Sine.easeIn
                }, '-=.1')

            function showContent() {
                window.scrollTo(0, 0);
                var continueDefaultAnimation = new TimelineMax({
                    force3D: true,
                    onComplete: function () {
                        resetTweens();
                        $el.removeClass("new-container");
                        $('body')
                            .removeClass('overflow');
                        $("body")
                            .removeClass("navigation-is-open");
                        _this.done();
                        animations.init();
                    }

                });
                continueDefaultAnimation
                    .to('.sub-loader', .5, {
                        yPercent: -100,
                        ease: Sine.easeOut
                    })
                    .to($el, 0.2, {
                        autoAlpha: 1,
                    }, '-=.5')
            }


            function resetTweens() {
                TweenMax.set($(".sub-loader"), {
                    clearProps: "all"
                });
                TweenMax.set($(".sub-loader .inner"), {
                    clearProps: "all"
                });

            }




        }
    }),

    HomeCaseToCase = Barba.BaseTransition.extend({
        start: function () {
            Promise
                .all([this.newContainerLoading, this.hideOld()])
                .then(this.showNew.bind(this));
        },
        hideOld: function () {
            var check = this
        },

        showNew: function () {
            var _this = this,
                caseHeight = null,
                h = window.innerHeight,
                $el = $(this.newContainer),
                $elOld = $(this.oldContainer),
                $elOldCaseHeight = $elOld.find('.section.active')
                .height(),
                $elHeader = $el.find('header'),
                $elOldContent = $elOld.find('.work_info'),
                $buttonWrapper = $elOld.find('.button-wrapper'),
                $button = $elOld.find('.button-wrapper a'),
                $loader = $elOld.find('.loader'),
                $loaderText = $elOld.find('.loader-text'),
                currentCaseAnimationDone = false,
                newPageLoaded = false;

            $el.addClass("new-container");
            $('body').addClass('overflow');

            function checkStatus() {
                if (currentCaseAnimationDone === true && newPageLoaded === true) {
                    continueCaseAnimation();
                } else {
                    return checkStatus;
                }
            }
            Pace.on('done', function () {
                newPageLoaded = true;
                checkStatus()
            });

            var startCaseAnimation = new TimelineMax({
                force3D: true,
                onStart: function () {
                    var i = Barba.HistoryManager.prevStatus();
                    var projectNavWidth = $('.project-nav')
                        .width();
                    if ("work" == i.namespace) {
                        TweenMax.to($('.project-nav'), .5, {
                            ease: Power3.easeOut,
                            force3D: true,
                            x: -projectNavWidth

                        });
                        TweenMax.to($('#cases_slider'), .3, {
                            ease: Power3.easeOut,
                            marginLeft: 0,
                            force3D: true,
                            width: '100%',

                            onComplete: function () {
                                currentCaseAnimation()
                            }
                        })
                    } else {
                        currentCaseAnimation()
                    }
                }
            });

            function currentCaseAnimation() {
                var currentCaseAnimation = new TimelineMax({
                        force3D: true,
                        onComplete: function () {
                            currentCaseAnimationDone = true;
                            checkStatus();
                        }
                    })
                    .to($loader, 0.3, {
                        ease: Sine.easeInOut,
                        autoAlpha: 1
                    })
                    .to($('.bg-parallax'), 0.3, {
                        autoAlpha: 0
                    })
                    .to($("#fp-nav"), 0.3, {
                        ease: Sine.easeInOut,
                        x: 100
                    }, .3)

            }

            function continueCaseAnimation() {
                var continueCaseAnimation = new TimelineMax({
                    force3D: true,
                    onComplete: function () {
                        currentCaseAnimationDone = false,
                            newPageLoaded = false;
                        $('body')
                            .removeClass('go-to-case');
                        $.fn.fullpage.destroy('all');
                        $el.removeClass("new-container");
                        $('body')
                            .removeClass('overflow');
                        animations.init();
                        //$el.removeAttr('style');
                    }
                });
                continueCaseAnimation

                    .set($elHeader, {
                        height: h
                    })
                    .to($loaderText, 0.3, {
                        ease: Sine.easeOut,
                        autoAlpha: 0,
                        x: -50
                    })
                    .to($elOldContent, 0.3, {
                        ease: Sine.easeOut,
                        autoAlpha: 0,
                        y: 50,
                    })
                    .set($el, {
                        autoAlpha: 1,
                        zIndex: 2,
                        delay: .5,
                        onCompleted: function () {
                            _this.done();
                        }
                    })
                    .fromTo($el.find('.bg-parallax'), 0.3, {
                        autoAlpha: 0
                    }, {
                        autoAlpha: 1,
                        ease: Sine.easeIn
                    })
                    .staggerFromTo($el.find('.work_info > *'), 0.3, {
                        autoAlpha: 0,
                        y: 50,
                        ease: Sine.easeOut,
                    }, {
                        autoAlpha: 1,
                        y: 0,
                        ease: Sine.easeInOut
                    }, .15)
                    .to($("header"), .7, {
                        ease: Sine.easeIn,
                        height: h / 100 * 70,

                    }, '-=.7')
                    .from($el.find('.back-to-overview'), 0.3, {
                        x: -50,
                        autoAlpha: 0,
                        ease: Sine.easeOut,
                    })
                    .fromTo($el.find('.scrollto.scroll-down'), 0.3, {
                        y: 50,
                        autoAlpha: 0,
                        ease: Sine.easeIn
                    }, {
                        y: 0,
                        autoAlpha: 1,
                        ease: Sine.easeIn
                    }, '-=.3')
            }
        }
    }),
    /* CASE TO CASE TRANSITION */
    CaseToCase = Barba.BaseTransition.extend({
        start: function () {
            Promise
                .all([this.newContainerLoading, this.hideOld()])
                .then(this.showNew.bind(this));
        },
        hideOld: function () {
            var check = this
        },

        showNew: function () {
            var _this = this,
                h = window.innerHeight,
                $el = $(this.newContainer),
                $elHeader = $el.find('header'),
                $elOld = $(this.oldContainer),
                $elOldContainer = $(this.oldContainer)
                .find('#next-case'),
                $elOldContainerContent = $(this.oldContainer)
                .find('#next-case .header-content'),
                $button = $elOldContainer.find('a'),
                $buttonText = $button.find('span'),
                $loader = $elOld.find('.loader'),
                $loaderText = $elOld.find('.loader-text'),
                currentCaseAnimationDone = false,
                newPageLoaded = false,
                contentVisible = false;

            $el.addClass("new-container");
            $('body')
                .addClass('overflow');

            function checkStatus() {
                if (currentCaseAnimationDone === true && newPageLoaded === true) {
                    if (!contentVisible) {
                        contentVisible = true;
                        continueCaseAnimation();
                    }
                } else {
                    return checkStatus;
                }
            }
            Pace.on('done', function () {
                newPageLoaded = true;
                checkStatus()
            });


            var currentCaseToCase = new TimelineMax({
                force3D: true,
                onComplete: function () {
                    currentCaseAnimationDone = true;
                    checkStatus();
                }
            });
            currentCaseToCase
                .to($elOldContainer, 0.7, {
                    ease: Sine.easeInOut,
                    height: h,
                })
                .to(window, 0.7, {
                    ease: Sine.easeInOut,
                    scrollTo: '#next-case'
                })
                .set($el, {
                    position: 'fixed',
                    top: 0,
                    //  height: '100%',
                    width: '100%',
                    left: 0,
                    autoAlpha: 0,
                    zIndex: 9999
                })
                .set($elHeader, {
                    height: h
                })
                .to($buttonText, 0.3, {
                    autoAlpha: 0,
                    ease: Sine.easeIn,
                })
                .to($button, 0.3, {
                    ease: Sine.easeIn,
                    width: 50,
                    height: 50
                })
                .to($loader, 0.3, {
                    autoAlpha: 1,
                    ease: Sine.easeIn,
                })

                .to($elOldContainerContent, 0.3, {
                    ease: Sine.easeInOut,
                    autoAlpha: 0

                }, '+=.3')

                .to($('.bg-parallax'), 0.3, {
                    ease: Sine.easeOut,
                    autoAlpha: 0
                })
                .to($loader, 0.3, {
                    autoAlpha: 0,
                    ease: Sine.easeOut
                })
                .set($el, {
                    autoAlpha: 1,
                    positiion: 'relative'

                })


            function continueCaseAnimation() {
                var continueCaseAnimation = new TimelineMax({
                    force3D: true,
                    onComplete: function () {
                        var currentCaseAnimationDone = false,
                            newPageLoaded = false,
                            contentVisible = false;
                        $el.removeAttr('style');
                        $el.removeClass("new-container");
                        $('body')
                            .removeClass('overflow');
                        animations.init();
                        _this.done();
                    }
                });
                continueCaseAnimation

                    .set($elOld, {
                        position: 'fixed',
                        autoAlpha: 0
                    }, '+=.3')


                    .fromTo($el.find('.bg-parallax'), 0.3, {
                        autoAlpha: 0,
                        ease: Sine.easeIn
                    }, {
                        autoAlpha: 1,
                        ease: Sine.easeIn
                    })
                    .staggerFromTo($el.find('.work_info > *'), 0.3, {
                        autoAlpha: 0,
                        y: 50,
                        ease: Sine.easeOut,
                    }, {
                        autoAlpha: 1,
                        y: 0,
                        ease: Sine.easeInOut
                    }, .15, '+.2')
                    .to($("header"), .7, {
                        ease: Sine.easeInOut,
                        marginTop: 0,
                        height: h / 100 * 70,
                        onStart: function () {
                            if ($(window)
                                .width() < 768) {
                                TweenLite.to($('header'), .7, {
                                    marginTop: 70,
                                    ease: Sine.easeInOut
                                })
                            }
                        }
                    }, '-=.3')
                    .from($el.find('.back-to-overview'), 0.3, {
                        x: -50,
                        autoAlpha: 0,
                        ease: Sine.easeOut,
                    })
                    .fromTo($el.find('.scrollto.scroll-down'), 0.3, {
                        y: 50,
                        autoAlpha: 0,
                        ease: Sine.easeIn
                    }, {
                        y: 0,
                        autoAlpha: 1,
                        ease: Sine.easeIn
                    }, '-=.3')


            }

        }
    });



/*** MAIN ***/
$(function () {
    Navigation.init();
    var e,
        popping = false,
        lastElementClicked;

    Barba.Pjax.Dom.wrapperId = "transition-wrapper",
        Barba.Pjax.Dom.containerClass = "transition-container",
        Barba.Pjax.init(),
        Barba.Prefetch.init(),
        Barba.Dispatcher.on("linkClicked", function (i, el) {
            e = i
            lastElementClicked = el;
            popping = false;
        }),
        Barba.Dispatcher.trigger("updatePage")
});

/* PREVENT CLICK SAME LINK */
var links = document.querySelectorAll('a[href]');
var cbk = function (e) {
    if (e.currentTarget.href === window.location.href) {
        e.preventDefault();
        e.stopPropagation();
    }
};

for (var i = 0; i < links.length; i++) {
    links[i].addEventListener('click', cbk);
}

Barba.Dispatcher.on("newPageReady", function (e, i, t) {
        history.scrollRestoration = 'manual';
        $("body")
            .removeClass("navigation-is-open");
        mouseParallax();
        //      TweenLite.to(window, 1, {scrollTo:{y:0, x:0}});

    }),
    Barba.Dispatcher.on("updatePage", function () {
        var e = Barba.HistoryManager.currentStatus(),
            i = Barba.HistoryManager.prevStatus(),
            t = $("body");
        isset(i)
        introAnimation.init();

    }),
    Barba.Dispatcher.on("transitionCompleted", function (e, i) {
        "home" == e.namespace && PHome.init(),
            "work" == e.namespace && PWork.init(),
            "work-detail" == e.namespace && initCase(),
            "about" == e.namespace && initAbout(),
            "diensten" == e.namespace && PDiensten.init(),
            "diensten-detail" == e.namespace && PDienstenDetail.init(),
            "contact" == e.namespace && PContact.init()
    }),
    window.addEventListener('popstate', function () {
        popping = true;
        Barba.Pjax.getTransition = function () {
            return defaultTransition;
        }
        Pace.restart()
        newPageLoaded = true;
        pageLoaded = true;
        contentVisible = true;
        currentCaseAnimationDone = true;
    }),
    
    Barba.Dispatcher.on('linkClicked', function (anchor) {
        if (($(anchor).hasClass('go-to-case')) && (popping === false)) {
            Barba.Pjax.getTransition = function () {
                if ($('body').hasClass('fp-viewing-lastPage')) {
                    $.fn.fullpage.moveSectionUp();
                }
                $('body').addClass('go-to-case');
                return HomeCaseToCase;
            }
        } else if (($(anchor).hasClass('case-link')) && (popping === false)) {
            Barba.Pjax.getTransition = function () {
                return CaseToCase;
            }
        } else if (($(anchor).hasClass('menu-link')) && (popping === false)) {
            Barba.Pjax.getTransition = function () {
                return ptchrTransition;
            }
        } else if (popping === false) {
            Barba.Pjax.getTransition = function () {
                return defaultTransition;
            }
        }
    }),
    Barba.Dispatcher.on('initStateChange', function () {
        popping = false;
    });



var isset = function (e) {
        return "undefined" != typeof e && null !== e
    },
    Navigation = {
        init: function () {
            var e = this,
                navigationItems = $('nav.main ul.pages li'),
                navigationItemsContact = $('nav.main ul.contact li ul'),
                navigationItemsLink = $('nav.main ul li a')

            $('.nav-icon')
                .bind("click", function () {
                    e.toggle();
                });
            $(navigationItemsLink)
                .bind("click", function () {
                    $(navigationItemsLink)
                        .removeClass('active');
                    $(this)
                        .addClass('active');
                });
            $("#close-navigation")
                .bind("click", e.close);

            $(navigationItemsLink)
                .hover(function () {
                    $('body')
                        .removeClass('active-bg');
                    var divClass = $(this)
                        .attr('class')
                    $('nav.main')
                        .addClass('hover-' + divClass);

                    TweenLite.to($(".background-bg"), .3, {
                        autoAlpha: 1,
                        ease: Power3.easeOut
                    })

                }, function () {
                    var divClass = $(this)
                        .attr('class')
                    $('nav.main')
                        .removeClass('hover-' + divClass);

                    TweenLite.to($(".background-bg"), .3, {
                        autoAlpha: 0,
                        ease: Power3.easeOut
                    })
                    $('body')
                        .addClass('active-bg');
                });
        },
        toggle: function () {
            var e = this;
            $('.nav-icon')
                .toggleClass('open');
            $("body.navigation-is-open")
                .length ? e.close() : e.open()
        },
        open: function () {
            $("body")
                .addClass("navigation-is-open");
            var navigationItems = $('nav.main ul.pages li'),
                navigationItemsContact = $('nav.main ul.contact li ul'),
                w = window.innerWidth,
                h = window.innerHeight,
                largestSide = 0;
            if (w > h) {
                largestSide = w * 3;
            } else {
                largestSide = h * 3;
            }

            var tl = new TimelineMax();
            tl.to($("nav.main"), 0, {
                    autoAlpha: 1,
                    zIndex: 9999,
                    ease: Power3.easeOut
                })
                .to($("nav.main .circle-bg"), 1, {
                    width: largestSide,
                    height: largestSide,
                    ease: Power3.easeInOut
                })
                .to($(".bg-wrap"), .3, {
                    autoAlpha: 1
                })
                .staggerFromTo(navigationItems, .3, {
                    y: 50,
                    autoAlpha: 0,
                    ease: Power2.easeIn
                }, {
                    y: 0,
                    autoAlpha: 1,
                    ease: Power3.easeInOut
                }, '.1', .5)
                .staggerFromTo(navigationItemsContact, .3, {
                    y: 50,
                    autoAlpha: 0,
                    ease: Power2.easeIn
                }, {
                    y: 0,
                    autoAlpha: 1,
                    ease: Power3.easeInOut
                }, '.1', 1)
        },
        close: function () {
            $("body")
                .removeClass("navigation-is-open");
            var tl = new TimelineMax(),
                navigationItems = $('nav.main ul.pages li'),
                navigationItemsContact = $('nav.main ul.contact li ul');
            tl.to($(".background-bg"), 0, {
                    opacity: '0 !important',
                    visibility: 'hidden !important',
                    ease: Power3.easeOut
                })
                .staggerTo(navigationItems, .3, {
                    y: '50px',
                    autoAlpha: 0,
                    ease: Power3.easeInOut
                }, '.1', 0)
                .staggerTo(navigationItemsContact, .3, {
                    y: '50px',
                    autoAlpha: 0,
                    ease: Power3.easeInOut
                }, '.1', 0)
                .to($(".bg-wrap"), .3, {
                    autoAlpha: 0
                })
                .to($("nav.main .circle-bg"), 1, {
                    width: "0%",
                    height: "0%",
                    ease: Power3.easeInOut
                }, '-=.5')

                .to($("nav.main"), 0, {
                    autoAlpha: 0,
                    zIndex: -1,
                    ease: Power3.easeOut
                })
        }
    }


if ($('#map')
    .length > 0) {

    // When the window has finished loading create our google map below
    google.maps.event.addDomListener(window, 'load', init);

    function init() {
        // Basic options for a simple Google Map
        // For more options see: https://developers.google.com/maps/documentation/javascript/reference#MapOptions
        var mapOptions = {
            // How zoomed in you want the map to start at (always required)
            zoom: 14,

            // The latitude and longitude to center the map (always required)
            center: new google.maps.LatLng(51.6972344, 5.302367000000004), // New York

            // How you would like to style the map. 
            // This is where you would paste any style found on Snazzy Maps.
            styles: [{
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [{
                    "color": "#e9e9e9"
                }, {
                    "lightness": 17
                }]
            }, {
                "featureType": "landscape",
                "elementType": "geometry",
                "stylers": [{
                    "color": "#f5f5f5"
                }, {
                    "lightness": 20
                }]
            }, {
                "featureType": "road.highway",
                "elementType": "geometry.fill",
                "stylers": [{
                    "color": "#ffffff"
                }, {
                    "lightness": 17
                }]
            }, {
                "featureType": "road.highway",
                "elementType": "geometry.stroke",
                "stylers": [{
                    "color": "#ffffff"
                }, {
                    "lightness": 29
                }, {
                    "weight": 0.2
                }]
            }, {
                "featureType": "road.arterial",
                "elementType": "geometry",
                "stylers": [{
                    "color": "#ffffff"
                }, {
                    "lightness": 18
                }]
            }, {
                "featureType": "road.local",
                "elementType": "geometry",
                "stylers": [{
                    "color": "#ffffff"
                }, {
                    "lightness": 16
                }]
            }, {
                "featureType": "poi",
                "elementType": "geometry",
                "stylers": [{
                    "color": "#f5f5f5"
                }, {
                    "lightness": 21
                }]
            }, {
                "featureType": "poi.park",
                "elementType": "geometry",
                "stylers": [{
                    "color": "#dedede"
                }, {
                    "lightness": 21
                }]
            }, {
                "elementType": "labels.text.stroke",
                "stylers": [{
                    "visibility": "on"
                }, {
                    "color": "#ffffff"
                }, {
                    "lightness": 16
                }]
            }, {
                "elementType": "labels.text.fill",
                "stylers": [{
                    "saturation": 36
                }, {
                    "color": "#333333"
                }, {
                    "lightness": 40
                }]
            }, {
                "elementType": "labels.icon",
                "stylers": [{
                    "visibility": "off"
                }]
            }, {
                "featureType": "transit",
                "elementType": "geometry",
                "stylers": [{
                    "color": "#f2f2f2"
                }, {
                    "lightness": 19
                }]
            }, {
                "featureType": "administrative",
                "elementType": "geometry.fill",
                "stylers": [{
                    "color": "#fefefe"
                }, {
                    "lightness": 20
                }]
            }, {
                "featureType": "administrative",
                "elementType": "geometry.stroke",
                "stylers": [{
                    "color": "#fefefe"
                }, {
                    "lightness": 17
                }, {
                    "weight": 1.2
                }]
            }]
        };

        // Get the HTML DOM element that will contain your map 
        // We are using a div with id="map" seen below in the <body>
        var mapElement = document.getElementById('map');

        // Create the Google Map using our element and options defined above
        var map = new google.maps.Map(mapElement, mapOptions);

        // Let's also add a marker while we're at it
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(51.6972344, 5.302367000000004),
            map: map,
            title: 'Snazzy!'
        });
    }

}

var PHome = {
        init: function () {
            checkNavigationActive();
        },
        carousel: function () {
            $('#cases_slider')
                .fullpage({
                    anchors: ['section0', 'section1', 'section2', '4thpage', 'lastPage'],
                    normalScrollElements: '.project-nav, .nav_left',
                    lockAnchors: true,
                    navigation: true,
                    menu: true,
                    afterLoad: function (anchorLink, index) {
                        if ($('.section.active')
                            .hasClass('dark')) {
                            $('#fp-nav')
                                .addClass('dark');
                            $('.slide-nav-wrap')
                                .addClass('dark');
                        } else {
                            $('#fp-nav')
                                .removeClass('dark');
                            $('.slide-nav-wrap')
                                .removeClass('dark');
                        }
                    },
                    afterRender: function () {
                        $('.next-slide')
                            .click(function () {
                                $.fn.fullpage.moveSectionUp();
                            });
                        $('.prev-slide')
                            .click(function () {
                                $.fn.fullpage.moveSectionDown();
                            });
                    }
                });

        }
    },
    PWork = {
        init: function () {},
        carousel: function () {
            $('#cases_slider')
                .fullpage({
                    anchors: ['section0', 'section1', 'section2', '4thpage', 'lastPage'],
                    normalScrollElements: '.project-nav, .nav_left',
                    lockAnchors: true,
                    navigation: true,
                    menu: true,
                    afterLoad: function (anchorLink, index) {
                        if ($('.section.active')
                            .hasClass('dark')) {
                            $('#fp-nav')
                                .addClass('dark');
                            $('.slide-nav-wrap')
                                .addClass('dark');
                        } else {
                            $('#fp-nav')
                                .removeClass('dark');
                            $('.slide-nav-wrap')
                                .removeClass('dark');
                        }
                    },
                    onLeave: function (index, nextIndex, direction) {
                        activateNavItem($('#menu')
                            .find('li')
                            .eq(nextIndex - 1));
                        if (direction == 'down') {
                            var scrollableNav = $('.project-nav')
                            var scrollTo = $('.project-nav li.active');
                            scrollableNav.animate({
                                scrollTop: scrollTo.offset()
                                    .top - scrollableNav.offset()
                                    .top + scrollableNav.scrollTop()
                            });
                        } else if (direction == 'up') {
                            var scrollableNav = $('.project-nav')
                            var scrollTo = $('.project-nav li.active');
                            scrollableNav.animate({
                                scrollTop: scrollTo.offset()
                                    .top - scrollableNav.offset()
                                    .top + scrollableNav.scrollTop()
                            });
                        }
                        if (nextIndex == 1) {
                            $('.prev-slide')
                                .addClass('disable');
                        } else if (nextIndex == $('.section')
                            .length) {
                            $('.next-slide')
                                .addClass('disable');
                        } else {
                            $('.next-slide')
                                .removeClass('disable');
                            $('.prev-slide')
                                .removeClass('disable');
                        }
                    },
                    afterRender: function () {
                        $('.next-slide')
                            .click(function () {
                                $.fn.fullpage.moveSectionDown();
                            });
                        $('.prev-slide')
                            .click(function () {
                                $.fn.fullpage.moveSectionUp();

                            });


                        activateNavItem($('#menu')
                            .find('li')
                            .eq($('.section.active')
                                .index()));

                    }

                });


            $('#menu li')
                .click(function () {
                    var destination = $(this)
                        .closest('li');
                    $.fn.fullpage.moveTo(destination.index() + 1);
                });

            function activateNavItem(item) {
                item.addClass('active')
                    .siblings()
                    .removeClass('active');
            }
        }
    },
    PDiensten = {
        init: function () {
            PDiensten.grid();
        },
        grid: function () {
            $('.grid')
                .each(function () {
                    $('.grid')
                        .isotope({

                            itemSelector: '.grid-item',
                            layoutMode: 'fitRows'
                        });
                })
        }
    },
    PDienstenDetail = {
        init: function () {
            PDienstenDetail.contentCarousel();
            PDienstenDetail.cardCarousel();
            PDienstenDetail.simpleCarousel();
            $('select')
                .selectric();
        },
        contentCarousel: function () {
            var owl = $('.content-carousel');
            var dots_label = [];

            $.each($(owl)
                .find('.item'),
                function (i) {
                    dots_label.push($(this)
                        .attr('title'));
                });

            function customPager() {
                $.each($(owl)
                    .find('.owl-dot'),
                    function (i) {
                        var paginationLinks = $('.owl-dots .owl-dot span');
                        $(paginationLinks[i])
                            .append(dots_label[i]);
                    });

                $(owl)
                    .find('.owl-item.active')
                    .addClass('animate');
            }

            owl.owlCarousel({
                loop: false,
                dots: true,
                nav: false,
                mouseDrag: false,
                animateOut: 'fadeOut',
                items: 1,
                smartSpeed: 1500,
                fluidSpeed: 1500,

                onInitialized: customPager
            });
            $(owl)
                .find('.owl-dot')
                .click(function () {
                    $('.owl-item')
                        .removeClass('animate');

                    setTimeout(function () {
                        $('.owl-item.active')
                            .addClass('animate');
                    }, 100);


                });


        },
        cardCarousel: function () {
            $('.card-wrapper')
                .owlCarousel({
                    nav: true,
                    navText: ['<i class="icon icon-arrow-right center"><img src="../assets/img/icons/arrow_left_white.svg" alt=""></i>', '<i class="icon icon-arrow-right center"><img src="../assets/img/icons/arrow_right_white.svg" alt=""></i>'],
                    dots: true,
                    responsive: {
                        0: {
                            items: 1,
                            margin: 0
                        },
                        560: {
                            items: 2,
                            margin: 20
                        },
                        1200: {
                            items: 3,
                            nav: false,
                            dots: false,
                            mouseDrag: false,
                            margin: 30
                        }
                    }
                });


        },
        simpleCarousel: function () {
            var owl = $('.simple-carousel');

            owl.owlCarousel({
                loop: true,
                dots: false,
                navText: ['<i class="pt-icon pt-arrow_left"></i>', '<i class="pt-icon pt-arrow_right"></i>'],
                nav: true,
                margin: 30,
                items: 1,
                responsive: {
                    0: {
                        stagePadding: 50
                    },
                    768: {

                        stagePadding: 100
                    },
                    1200: {
                        stagePadding: 250
                    }
                }
            });


        },

    },
    PContact = {
        init: function () {
            $('select')
                .selectric();
        }
    }




function initCase() {
    $('body')
        .addClass('work-detail');

    $('nav.main ul li a')
        .removeClass('active');
    caseScroll.init();
    scrollToDestination();


    /* DEFAULT CASE CAROUSEL */
    $('.case-carousel')
        .owlCarousel({
            nav: true,
            navText: ['<i class="pt-icon pt-arrow_left"></i>', '<i class="pt-icon pt-arrow_right"></i><span class="nav-text">Bekijk meer voorbeelden</span>'],
            dots: false,
            loop: false,
            items: 1,
            nav: true,
            margin: 0,
            stagePadding: 300,
            responsive: {
                0: {
                    stagePadding: 0,
                    margin: 20
                },
                600: {
                    stagePadding: 100
                },
                768: {
                    stagePadding: 200
                },

                1200: {
                    stagePadding: 300
                }
            }
        });

    /* STEPS CAROUSEL IF EXISTS*/
    if ($('.amazing-oriental')
        .length > 0) {
        $('.steps')
            .owlCarousel({
                nav: true,
                navText: ['<span><i class="pt-icon pt-arrow_left"></i></span>', '<span><i class="pt-icon pt-arrow_right"></i></span>'],
                dots: false,
                loop: false,
                items: 1,
                nav: true,
                margin: 0,
                responsive: {
                    0: {
                        items: 2,
                        loop: true
                    },
                    991: {
                        items: 3,
                        loop: true
                    },

                    1200: {
                        items: 4
                    }
                }
            });
    };
}


function initAbout() {
    $('select')
        .selectric();
}

var mouseParallax = function () {
        var scenes = [];
        var scenesSelector = document.querySelectorAll('.scene');
        for (i = 0; i < scenesSelector.length; i++) {
            scenes[i] = new Parallax(scenesSelector[i], {
                hoverOnly: true,
                relativeInput: true
            });
        }
    },
    caseScroll = {
        init: function () {
            caseScroll.timeline();
        },
        timeline: function () {
            var controller = new ScrollMagic.Controller();
            if ($('#case-scroll')
                .length > 0) {
                $('#case-scroll')
                    .each(function () {
                        var caseOnScroll = $('#case-scroll'),
                            caseHeight = caseOnScroll.height(),
                            caseWrapHeight = caseOnScroll.parent()
                            .height();


                        scrollTl = new TimelineMax()
                            .fromTo(caseOnScroll, 1, {
                                y: "0%",
                                ease: Linear.easeNone
                            }, {
                                y: -(caseHeight - caseWrapHeight),
                                ease: Linear.easeNone
                            })

                        var scrollScene = new ScrollMagic.Scene({
                                triggerElement: '#case-intro',
                                triggerHook: 0.7,
                                duration: '200%'
                            })
                            .setTween(scrollTl)

                            .addTo(controller);
                    });
            }
        }
    },
    scrollToDestination = function () {
        $(".scrollto")
            .click(function (event) {
                event.preventDefault();
                var defaultAnchorOffset = 60;
                var defaultMobileAnchorOffset = 60;
                var anchor = $(this)
                    .attr('data-attr-scroll');
                var anchorOffset = $('#' + anchor)
                    .attr('data-scroll-offset');

                var attr = $(this)
                    .attr('data-scroll-offset');
                if (typeof attr !== typeof undefined && attr !== false) {
                    if ($(window)
                        .width() < 768) {
                        anchorOffset = defaultMobileAnchorOffset;
                    } else {
                        anchorOffset = $(this)
                            .attr('data-scroll-offset');
                    }

                } else {
                    anchorOffset = defaultAnchorOffset;
                }

                $('html,body')
                    .animate({
                        scrollTop: $('#' + anchor)
                            .offset()
                            .top - anchorOffset
                    }, 500);
            });
    },

    introAnimation = {
        init: function () {
            if (!$('body')
                .hasClass('initialized')) {
                introAnimation.startAnimation();
            }
        },

        startAnimation: function () {
            var animationDone = false,
                pageLoaded = false,
                contentVisible = false;

            function checkStatus() {
                if (animationDone === true && pageLoaded === true) {
                    if (!contentVisible) {
                        contentVisible = true;
                        showContent();
                    }

                } else {
                    setTimeout(function () {
                        checkStatus();
                    }, 500);
                }
            }
            Pace.on('done', function () {
                pageLoaded = true;
                checkStatus();
            });


            var introTimeline = new TimelineMax({
                    onStart: function () {
                        if ($(window)
                            .width() < 768) {
                            TweenMax.set($('.nav_left'), {
                                y: -70
                            })
                        } else {
                            TweenMax.set($('.nav_left'), {
                                x: -100
                            })
                        }
                        //$('body, html').scrollTop(0)
                        $('body')
                            .addClass('overflow');
                    },
                    onComplete: function () {
                        animationDone = true;
                        checkStatus()
                    }
                })

                .staggerFromTo('.intro-loader  h1 span', .3, {
                    autoAlpha: 0,
                    y: 50
                }, {
                    autoAlpha: 1,
                    y: 0
                }, 0.1)
                .from('.intro-loader p', .3, {
                    autoAlpha: 0,
                    y: 0,
                    delay: 0.1
                })

            function showContent() {
                var continueCaseAnimation = new TimelineMax({
                    force3D: true,
                    onComplete: function () {
                        animationDone = false,
                            pageLoaded = false,
                            contentVisible = false;
                        $('body')
                            .removeClass('overflow')
                            .addClass('initialized');
                        animations.init();
                    }
                });
                continueCaseAnimation
                    .to('.intro-loader .loader', .5, {
                        autoAlpha: 0,
                        onComplete: function () {
                            introAnimationLoaded = true
                        }
                    })
                    .to('.nav_left', .3, {
                        onStart: function () {
                            if ($(window)
                                .width() < 768) {
                                TweenMax.to($('.nav_left'), .3, {
                                    y: 0
                                })
                            } else {
                                TweenMax.to($('.nav_left'), .3, {
                                    x: 0
                                })
                            }
                        }
                    }, '-=.2')
                    .to('.intro-loader', .3, {
                        yPercent: -100
                    });
            }
        }



    },

    animations = {
        init: function () {
            animations.getThemAll();
        },
        getThemAll: function () {
            var animationController = new ScrollMagic.Controller();

            /* FADE IN UP */
            if ($('[data-animation="fade-in-up"]')
                .length > 0) {
                $('[data-animation="fade-in-up"]')
                    .each(function () {
                        var fadeInUp = $(this);
                        var revealHook;
                        var attr = $(this)
                            .attr('data-hook');
                        var delay = $(this)
                            .attr('data-delay');

                        if (typeof attr !== typeof undefined && attr !== false) {
                            revealHook = $(this)
                                .attr('data-hook');
                        } else {
                            revealHook = .8
                        }
                        if (typeof delay !== typeof undefined && delay !== false) {
                            delay = $(this)
                                .attr('data-delay');
                        } else {
                            delay = 0
                        }
                        //Set tween
                        var fadeInUpTween = new TimelineMax({
                            delay: delay
                        });

                        fadeInUpTween.staggerFromTo(fadeInUp, .5, {
                            alpha: 0,
                            y: 50,
                            ease: Power1.easeInOut
                        }, {
                            alpha: 1,
                            y: 0,
                            ease: Power1.easeInOut
                        }, 0.25);

                        var scene = new ScrollMagic.Scene({
                                triggerElement: this,
                                triggerHook: revealHook

                            })
                            .reverse(false)
                            .setTween(fadeInUpTween)
                            .addTo(animationController)
                    });
            }
            /* REVEAL BLOCK [LEFT RIGHT]*/
            if ($('[data-animation="reveal"]')
                .length > 0) {
                $('[data-animation="reveal"]')
                    .each(function () {
                        var revealIn = $(this);
                        var revealHook;
                        var attr = $(this)
                            .attr('data-hook');


                        if (typeof attr !== typeof undefined && attr !== false) {
                            revealHook = $(this)
                                .attr('data-hook');
                        } else {
                            revealHook = .8
                        }

                        //Set tween
                        var fadeTween = new TimelineMax();
                        fadeTween.to(revealIn, 0, {
                            onComplete: function () {
                                $(revealIn)
                                    .addClass('active')
                            }
                        }, 0.25)
                        var scene = new ScrollMagic.Scene({
                                triggerElement: this,
                                triggerHook: revealHook
                            })
                            .reverse(false)
                            .setTween(fadeTween)
                            .addTo(animationController)
                    });
            }
            if ($('.windmill')
                .length > 0) {
                var homeHeader = new TimelineMax();
                var molen = $('#mailcampaigns .windmill')
                var infiniteRotate = new TimelineMax({
                    delay: 0,
                    repeat: -1
                });

                infiniteRotate
                    .to(molen, 4, {
                        rotation: 360,
                        ease: Linear.easeNone,
                        repeat: -1
                    }, {
                        timeScale: 0
                    });
            };

        }

    }

function checkNavigationActive() {
    var e = Barba.HistoryManager.currentStatus()
    var navigationItemsLink = $('nav.main ul li a')
    var navigationItemsLinkActive = $('nav.main ul li a')
    $(navigationItemsLink)
        .removeClass('active');
    if ("home" == e.namespace) {
        $('nav.main ul li a.home')
            .addClass('active');
    } else if ("work" == e.namespace) {
        $('nav.main ul li a.werk')
            .addClass('active');
    } else if ("diensten" == e.namespace) {
        $('nav.main ul li a.diensten')
            .addClass('active');
    } else if ("about" == e.namespace) {
        $('nav.main ul li a.about')
            .addClass('active');
    } else if ("contact" == e.namespace) {
        $('nav.main ul li a.contact')
            .addClass('active');
    }
}
