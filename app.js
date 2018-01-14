
"use strict";

var isEnvironment_BluemixDev = true;


// Bluemix Test
var APP_API_CONTEXT_PATH = "https://eapim-dev.w3ibm.mybluemix.net/bp/test/DEETDS/";
var APP_API_CLIENT_IDS = 'client_id=57ebed6b-816e-4185-9a2c-9eb0cdc54ad1&client_secret=aR4oP3pU7yQ4vV0mA4tL2vI1pS5qP0cU8hG3wA3dI0jP4bL7uW';
var Client_Id_Key = 'X-IBM-Client-Id', Client_Secret_Key = 'X-IBM-Client-Secret'; 
var Client_Id_Value = '57ebed6b-816e-4185-9a2c-9eb0cdc54ad1'; 
var Client_Secret_Value = 'aR4oP3pU7yQ4vV0mA4tL2vI1pS5qP0cU8hG3wA3dI0jP4bL7uW';

// Bluemix Dev
if (isEnvironment_BluemixDev) {
	APP_API_CONTEXT_PATH = "https://eapim-dev.w3ibm.mybluemix.net/bp/development/DEETDS/";
	APP_API_CLIENT_IDS = 'client_id=f3cd4bb0-a1ee-43e4-b271-b27480d700f3&client_secret=jT2lO6sS0rJ5bL7wT0fW6yK5lD0cJ5sP1tA6eS0gO1aH8dB2lH';
	Client_Id_Value = 'f3cd4bb0-a1ee-43e4-b271-b27480d700f3';
	Client_Secret_Value = 'jT2lO6sS0rJ5bL7wT0fW6yK5lD0cJ5sP1tA6eS0gO1aH8dB2lH';
}

var APP_USERINFO_KEY = "myUserInfo";
var appUserInfo = null;
var appColors = ['#00A6A0','#66c9c6','#F19027','#F04E37','#AB1A86','#cc75b6','#04648F','#00B2EF','#6F7076',
                 '#00A6A0','#66c9c6','#F19027','#F04E37','#AB1A86','#cc75b6','#04648F','#00B2EF','#6F7076'];

//==================================================================================================

function appGetParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function appGotoPage(toPage) {
	window.location.href=toPage;
}

function appGetSessionInfo() {
	var obj = sessionStorage.getItem(APP_USERINFO_KEY);
	if (!(obj === null || obj === undefined)) {
		obj = JSON.parse(obj);
	}
	return obj;
}

function appSetSessionInfo(data) {
	sessionStorage.setItem(APP_USERINFO_KEY, JSON.stringify(data));
}

function appIsSessionStorageEmpty() {
	var ssValue = appGetSessionInfo();
	return (ssValue === null || ssValue === undefined);
}

function appGetSession(callbackFn) {
	var sCurrentUser = null;
	var isStorageEmpty = appIsSessionStorageEmpty();
	if (isStorageEmpty) {
		$.getJSON("GetUserInfo")
			.done(function(result) {
				sCurrentUser = result.CurrentUserName;
				var sUrl = APP_API_CONTEXT_PATH + 'User?userName=' + sCurrentUser;				
				$.ajax({ method : 'GET', url : sUrl,
					beforeSend: function (xhr) {
					    xhr.setRequestHeader(Client_Id_Key, Client_Id_Value);
					    xhr.setRequestHeader(Client_Secret_Key, Client_Secret_Value);
					}
				}).done(function(data) {
					var userRoleId = data.userRoleId || 0;
					if (0===userRoleId) {
						ajaxErrorHandler("msgUnauthorized.html", sCurrentUser);
					} else {
						appUserInfo = data;
						appSetSessionInfo(appUserInfo);
						if ("function" === typeof callbackFn) {
							callbackFn();
						}
					}
				}).fail(function(jqXHR, textStatus, errorThrown) {
					ajaxErrorHandler('msgAjaxCallFailed.html', jqXHR);
				})
			}).fail(function(jqXHR, textStatus, errorThrown) {
				ajaxErrorHandler('msgAjaxCallFailed.html', jqXHR);
			}).always(function() { });
	} else {
		appUserInfo = appGetSessionInfo();
		if ("function" === typeof callbackFn) {
			callbackFn();
		}
	}
}

function appDisplayUserName() {	
	var sUser = appUserInfo.contact.firstName + ' ' + appUserInfo.contact.lastName; 
	if (sUser == null || sUser == undefined) { sUser = ''; };
	$('#userName').text(sUser);	
}

function appFormatCurrency (number, places, symbol, thousand, decimal) {		
	number = number || 0;
	places = !isNaN(places = Math.abs(places)) ? places : 2;
	symbol = symbol !== undefined ? symbol : "$";
	symbol = symbol == '&' ? '' : symbol;
	thousand = thousand || ",";
	decimal = decimal || ".";
	
	var negative = number < 0 ? "-" : "", i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10)
			+ "", j = (j = i.length) > 3 ? j % 3 : 0;
			
	return symbol
			+ negative
			+ (j ? i.substr(0, j) + thousand : "")
			+ i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand)
			+ (places ? decimal + Math.abs(number - i).toFixed(places).slice(2)	: "");
};

function appFormatDate(jsDate) {
	if (jsDate == null || jsDate == undefined) { return ''; }	
	var flData = jsDate;
	if ("object"!==jsDate) {
		flData = new Date(jsDate);
		var tOffset = flData.getTimezoneOffset();
		//flData.setTime(flData.getTime() + (4*60*60*1000));		
		flData.setTime(flData.getTime() + ((tOffset*60*1000)+1));
	}
	return jQuery.datepicker.formatDate('yy/mm/dd', flData);
}

function appFormatNumricForDisplay(aNbr) {
	var nbr = aNbr || 0;
	return Number(Math.round(nbr+'e2')+'e-2').toFixed(2);
}

function appFormatPercentageForDisplay(aNbr) {
	var nbr = aNbr || 0;
	return '' + Number(Math.round(nbr+'e2')+'e-2').toFixed(2) + '%';
}

function appFormatDataForDisplay( vData, iDataType) {
	
	var data = vData || 0;
	var type = iDataType || 1;
			
	switch (type) {
    case 1: //String
    	data = data.toString();
        break;
    case 2: //Integer    	
    	data = appFormatCurrency (data, 0, '&')
        break;
    case 3: //Currency
    	data = appFormatCurrency(data);
        break;
    case 4: //Date
    	data = appFormatDate(data);
        break;
    case 5: //Percentage
    	data = appFormatPercentageForDisplay(data);
        break;
    case 6: //Float
    	data = appFormatNumricForDisplay(data);
        break;
    case 9: //Time in Days
    	data = appFormatNumricForDisplay(data) + ' Days';    	
        break;
    default: //Text
    	data = data.toString();
    	break;
	}	
	return data;
}

function appSearchClaimByClmNbr() {
	var clmNbr = $("#app-input-search-clmNbr").val();
	if ((clmNbr || "").trim().length > 0) {
		window.location.href = "ClaimItem.html?clmNbr=" + clmNbr;
	}
}

function appFindObjects(obj, key, val) {
    var objects = [];    
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(appFindObjects(obj[i], key, val));
        } else if (i == key && obj[key] == val) 
        	{ objects.push(obj);
        }
    }
    return objects;
}

function ajaxErrorHandler(toPage, errorObj){	
	if (undefined!==errorObj && null!==errorObj){		
		sessionStorage.setItem('errorObject', JSON.stringify(errorObj));
	}	
	window.location.href=toPage;
}

function ajaxErrorPrinter(){
	var obj = sessionStorage.getItem('errorObject');		
	if (!(obj === null || obj === undefined)) {		
		console.log( 'Ajax error -->' + '\n' + obj ); };
	sessionStorage.setItem('errorObject', '');
}

//Returns a function, that, as long as it continues to be invoked, will not
//be triggered. The function will be called after it stops being called for
//N milliseconds. If `immediate` is passed, trigger the function on the
//leading edge, instead of the trailing.
//@see https://davidwalsh.name/javascript-debounce-function
function appDebounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

var onScroll_StickyHeader = appDebounce(function() {
	if ($(window).scrollTop() > 151) {
		$(".header-menu-div").addClass("header-menu-div-fixed");
	} else {
		$(".header-menu-div").removeClass("header-menu-div-fixed");
	}
}, 5);

function doStickyHeader() {
	$(window).scroll(onScroll_StickyHeader);
}

function appPqDatePicker(ui) {
	var currentYear = new Date().getFullYear();
	var yearRng = '' + (2014 - currentYear) + ':+0';
    var $this = $(this);
    $this
        .css({ zIndex: 3, position: "relative" })
        .datepicker({
            yearRange: yearRng,	//"-10:+0", //10 years prior to present.
            changeYear: true,
            changeMonth: true,
            //showButtonPanel: true,
            onClose: function (evt, ui) {
                $(this).focus();
            }
        });
    //default From date
    $this.filter(".pq-from").datepicker("option", "defaultDate", new Date("" + currentYear + "/01/01"));
    $this.filter(".pq-from").datepicker( "option", "dateFormat", "yy/mm/dd" );
    
    //default To date
    $this.filter(".pq-to").datepicker("option", "defaultDate", new Date("" + currentYear + "/12/31"));
    $this.filter(".pq-to").datepicker( "option", "dateFormat", "yy/mm/dd" );
}

function appHandleHttpUnauthorizedException() {
	sessionStorage.removeItem(APP_USERINFO_KEY);
	appGotoPage('Dashboard.html');
}

var APP_roleManagerCode = 4;
var APP_roleReviewerCode = 6;
var APP_roleReaderCode = 7;
var APP_roleAdminCode = 8;

function appUserHasRole(aRole, person){
	var result = false;
	var user = person;
	if (user === null || user === undefined){
		var sess = appGetSessionInfo();
		if (!(sess === null || sess === undefined)) {
			user = sess.contact; 
		}
	}
	if (!(user === null || user === undefined)) {
		var roles = user.roles || [];
		if (0===roles.length){
			result = (aRole===user.roleId);
		} else {
			roles.some(function(elm){
				if (aRole===elm.roleId && 0!==elm.active){
					result = true;
				}
				return result;
			});
		}
	}
	return result;
}

function appShowMenuItem_Reports(){	
	if(appUserHasRole(APP_roleManagerCode) || appUserHasRole(APP_roleReaderCode)){
		$('#header-menu-reports').removeClass("app-must-hide");
	}
}

function appHeaderShowSettingsMenuItem(){
	if (appUserInfo.canEditSettings){
		$('#header-menu-settings').removeClass("app-must-hide");
	}
}

function appStopAllXhrRequests(aRequests){	
	for (var i = 0; i < aRequests.length ; i++) { 
		if (aRequests[i] != null)
			{ aRequests[i].abort(); } };	
}

function appTrimNull(value) {
	return value || '';
}

var appMod = appMod || (function() {
	function bindClmNumberSearchInput() {
		var kbEnter = 13;
		$("#app-input-search-clmNbr").on("keypress", function(e) {
			if (kbEnter === e.keyCode) {
				appSearchClaimByClmNbr();
				return false;
			}
		});
	}
	
	return {
		bindClmNumberSearchInput: bindClmNumberSearchInput
	}
}) ();