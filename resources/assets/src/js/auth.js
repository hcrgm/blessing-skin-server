/*
 * @Author: printempw
 * @Date:   2016-07-17 10:54:22
 * @Last Modified by:   printempw
 * @Last Modified time: 2016-09-15 10:09:52
 */

'use strict';

$(document).ready(function() {
    $('input').iCheck({
        checkboxClass: 'icheckbox_square-blue'
    });
});

function freshCaptcha() {
    $('.captcha').attr('src', './captcha?' + new Date().getTime());
    $('#captcha').val('');
}

var login_fails = 0;

$('#login-button').click(function() {
    var data           = new Object();
    var email_or_uname = $('#email_or_username').val();

    if (/\S+@\S+\.\S+/.test($('#email_or_username').val())) {
        data.email    = email_or_uname;
    } else {
        data.username = email_or_uname;
    }

    data.password = $('#password').val();
    data.keep     = $('#keep').prop('checked') ? true : false;

    if (email_or_uname == "") {
        showMsg(trans('auth.emptyIdentification'));
        $('#email_or_username').focus();
    // check valid email address
    } else if (data.password == "") {
        showMsg(trans('auth.emptyPassword'));
        $('#password').focus();
    } else {
        // if captcha form is shown
        if ($('#captcha-form').css('display') == "block") {
            data.captcha = $("#captcha").val();
            if (data.captcha == "") {
                showMsg(trans('auth.emptyCaptcha'));
                $('#captcha').focus();
                return false;
            }
        }

        $.ajax({
            type: "POST",
            url: "./login",
            dataType: "json",
            data: data,
            beforeSend: function() {
                $('#login-button').html('<i class="fa fa-spinner fa-spin"></i> '+trans('auth.loggingIn')).prop('disabled', 'disabled');
            },
            success: function(json) {
                if (json.errno == 0) {
                    swal({
                        type: 'success',
                        html: json.msg
                    });
                    window.setTimeout('window.location = "../user"', 1000);

                } else {
                    if (json.login_fails > 3) {
                        if ($('#captcha-form').css('display') == "none") {
                            swal({
                                type: 'error',
                                html: trans('auth.tooManyFails')
                            });
                        }

                        $('#captcha-form').show();
                    }

                    freshCaptcha();

                    showMsg(json.msg, 'warning');
                    $('#login-button').html(trans('auth.login')).prop('disabled', '');
                }
            },
            error: function(json) {
                showAjaxError(json);
                $('#login-button').html(trans('auth.login')).prop('disabled', '');
            }
        });
    }
    return false;
});

$('.captcha').click(freshCaptcha);

$('#register-button').click(function() {

    var email    = $('#email').val();
    var password = $('#password').val();
    var nickname = $('#nickname').val();
    var captcha  = $('#captcha').val();

    // check valid email address
    if (email == "") {
        showMsg(trans('auth.emptyEmail'));
        $('#email').focus();
    } else if (!/\S+@\S+\.\S+/.test(email)) {
        showMsg(trans('auth.invalidEmail'), 'warning');
    } else if (password == "") {
        showMsg(trans('auth.emptyPassword'));
        $('#password').focus();
    } else if (password.length < 8 || password.length > 16) {
        showMsg(trans('auth.invalidPassword'), 'warning');
        $('#password').focus();
    } else if ($('#confirm-pwd').val() == "") {
        showMsg(trans('auth.emptyConfirmPwd'));
        $('#confirm-pwd').focus();
    } else if (password != $('#confirm-pwd').val()) {
        showMsg(trans('auth.invalidConfirmPwd'), 'warning');
        $('#confirm-pwd').focus();
    } else if (nickname == "") {
        showMsg(trans('auth.emptyNickname'));
        $('#nickname').focus();
    } else if (captcha == "") {
        showMsg(trans('auth.emptyCaptcha'));
        $('#captcha').focus();
    } else {

        $.ajax({
            type: "POST",
            url: "./register",
            dataType: "json",
            data: { 'email': email, 'password': password, 'nickname': nickname, 'captcha': captcha },
            beforeSend: function() {
                $('#register-button').html('<i class="fa fa-spinner fa-spin"></i> '+trans('auth.registering')).prop('disabled', 'disabled');
            },
            success: function(json) {
                if (json.errno == 0) {
                    swal({
                        type: 'success',
                        html: json.msg
                    });
                    window.setTimeout('window.location = "../user"', 1000);
                } else {
                    showMsg(json.msg, 'warning');
                    freshCaptcha();
                    $('#register-button').html(trans('auth.register')).prop('disabled', '');
                }
            },
            error: function(json) {
                showAjaxError(json);
                $('#register-button').html(trans('auth.register')).prop('disabled', '');
            }
        });
    }
    return false;

});

$('#forgot-button').click(function() {

    var email    = $('#email').val();
    var captcha  = $('#captcha').val();

    // check valid email address
    if (email == "") {
        showMsg(trans('auth.emptyEmail'));
        $('#email').focus();
    } else if (!/\S+@\S+\.\S+/.test(email)) {
        showMsg(trans('auth.invalidEmail'), 'warning');
    } else if (captcha == "") {
        showMsg(trans('auth.emptyCaptcha'));
        $('#captcha').focus();
    } else {

        $.ajax({
            type: "POST",
            url: "./forgot",
            dataType: "json",
            data: { 'email': email, 'captcha': captcha },
            beforeSend: function() {
                $('#forgot-button').html('<i class="fa fa-spinner fa-spin"></i> '+trans('auth.sending')).prop('disabled', 'disabled');
            },
            success: function(json) {
                if (json.errno == 0) {
                    showMsg(json.msg, 'success');
                    $('#forgot-button').html(trans('auth.send')).prop('disabled', 'disabled');
                } else {
                    showMsg(json.msg, 'warning');
                    freshCaptcha();
                    $('#forgot-button').html(trans('auth.send')).prop('disabled', '');
                }
            },
            error: function(json) {
                showAjaxError(json);
                $('#forgot-button').html(trans('auth.send')).prop('disabled', '');
            }
        });
    }
    return false;

});

$('#reset-button').click(function() {
    var uid = $('#uid').val();
    var password = $('#password').val();

    if (password == "") {
        showMsg(trans('auth.emptyPassword'));
        $('#password').focus();
    } else if (password.length < 8 || password.length > 16) {
        showMsg(trans('auth.invalidPassword'), 'warning');
        $('#password').focus();
    } else if ($('#confirm-pwd').val() == "") {
        showMsg(trans('auth.emptyConfirmPwd'));
        $('#confirm-pwd').focus();
    } else if (password != $('#confirm-pwd').val()) {
        showMsg(trans('auth.invalidConfirmPwd'), 'warning');
        $('#confirm-pwd').focus();
    } else {

        $.ajax({
            type: "POST",
            url: "./reset",
            dataType: "json",
            data: { 'uid': uid, 'password': password },
            beforeSend: function() {
                $('#reset-button').html('<i class="fa fa-spinner fa-spin"></i> '+trans('auth.resetting')).prop('disabled', 'disabled');
            },
            success: function(json) {
                if (json.errno == 0) {
                    swal({
                        type: 'success',
                        html: json.msg
                    }).then(function() {
                        window.location = "./login";
                    });
                } else {
                    showMsg(json.msg, 'warning');
                    $('#reset-button').html(trans('auth.reset')).prop('disabled', '');
                }
            },
            error: function(json) {
                showAjaxError(json);
                $('#reset-button').html(trans('auth.reset')).prop('disabled', '');
            }
        });
    }
    return false;
});
