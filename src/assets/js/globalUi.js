import "babel-polyfill";

export default class GlobalUi {
    constructor() {
        this.bindEvents();
        this.addSpamCheck();
    }

    bindEvents() {
        $(window).on('resize', () => this.toggleResponsiveMenu());
        $('.header__nav__item a').on('click touch', (e) => this.scrollToNavItem(e));
        $(document).on('scroll', () => this.updateHeader());
        $(document).on('scroll', () => this.updateNavHighlight()).trigger('scroll');
        $('#contact-form').on('submit', (e) => this.validateForm(e));
        $('.header__nav__button').on('click touch', () => this.toggleMenu());
        $('.header__logo').on('click touch', () => this.scrollToTop());
    }

    getDistanceToTop() {
        return window.pageYOffset;
    }

    toggleResponsiveMenu() {
        if($(window).innerWidth() > 1024) {
            $('.header__nav').show();
        }
    }

    toggleMenu() {
        $('.header__nav').slideToggle();
    }

    scrollToTop() {
        $('html').animate({
            scrollTop: 0
        }, 500);
    }

    scrollToNavItem(e) {
        let target = $(e.target);
        let targetSectionName = target.attr('data-targetsection');

        let targetSection = $('main').find(`[data-sectionName='${targetSectionName}']`);
        let targetFromTop = $(targetSection).offset().top - 120;

        if(this.isMobile()) {
            this.toggleMenu();
        }
        
        $('body, html').animate({
            scrollTop: targetFromTop
        }, 500);
    }

    isMobile() {
        return window.innerWidth <= 1024;
    }

    updateNavHighlight() {
        let dist = 9999999999;
        let navItems = $('.header__nav__item');
        let scrollPosition = this.getDistanceToTop();
        let sections = $('main > section');
        let activeSection = null;

        navItems.removeClass('header__nav__item--active');

        for(let section of sections) {
            let sectionToTop = section.offsetTop;
            let dif = Math.abs(sectionToTop - scrollPosition);

            if(dif < dist) {
                dist = dif;
                activeSection = section;
            }
        }

        let sectionName = $(activeSection).attr('data-sectionName');
        $('header').find(`[data-targetSection='${sectionName}']`).closest('li').addClass('header__nav__item--active');
    }

    updateHeader() {
        let scrollSwitchPoint = 400;
        let distToTop = this.getDistanceToTop();
        let percentage = Math.floor(100 / scrollSwitchPoint * distToTop);

        if(percentage > 100) {
            percentage = 100;
        }

        percentage = percentage / 100;

        let adjustedPercentage = 1 / percentage;

        let headerNavTop = adjustedPercentage * 40;
        if(headerNavTop > 100) {
            headerNavTop = 100;
        }

        if(distToTop <= 0 && headerNavTop < 100) {
            headerNavTop = 100;
        }

        let headerHeight = adjustedPercentage * 100;
        if(headerHeight > 150) {
            headerHeight = 150;
        }
        
        $('header').css('background-color', `rgba(255,255,255, ${percentage}) `);
        $('.header__nav').css('top', headerNavTop);
        $('header').css('height', headerHeight);

        if(percentage >= .9) {
            $('header').addClass('scroll');
        }
        else {
            $('header').removeClass('scroll');
        }
    }

    validateForm(e) {
        e.preventDefault();
        let isValid = true;
        let form = $(e.target);
        let data = form.serializeArray();
        let spamCheckVal = form.find('input[name="spamCheck"]').val();

        $('#contact-form input').removeClass('error');

        for(let input of form.find('[data-required]')) {
            if($(input).val() == '') {
                isValid = false;
                $(input).addClass('error');
            }
        }

        if(!this.verifySpamCheck(spamCheckVal)) {
            $('#contact-form input[name="spamCheck"]').addClass('error');
            isValid = false;
        }

        if(!isValid) {
            return false;
        }

        let organisation = data[0].value;
        let name = data[1].value;
        let email = data[2].value;
        let question = data[5].value;

        $.ajax({
            method: "POST",
            url: '/form.php',
            data: {organisation, name, email, question},
            success: (result) => {
                if(result == 'true') {
                    $('#contact-form').slideUp(200);
                    $('.contact__section').append(`<h4>Thank you for your contact request.</h4>`)
                }
            }
        });
    }

    addSpamCheck () {
        let randomOne = Math.floor(Math.random() * 9);
        let randomTwo = Math.floor(Math.random() * 9);

        $('#contact-form').data('one', randomOne);
        $('#contact-form').data('two', randomTwo);

        $('#contact-form input[name="result"]').val(randomOne + randomTwo);
        // $('#contact-form input[name="spamCheck"]').val(randomOne + randomTwo);
        $('#contact-form input[name="spamCheck"]').attr('placeholder', `Spam check: ${randomOne} + ${randomTwo}`);
    }

    verifySpamCheck(userValue) {
        return $('#contact-form input[name="result"]').val() == userValue;
    }
}