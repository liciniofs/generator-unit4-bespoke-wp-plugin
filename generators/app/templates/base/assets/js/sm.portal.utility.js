/// <reference path="jquery-1.9.1.js" />
/// <reference path="jquery-ui-1.9.2.js" />

(function() {
	var initializing = false,
		fnTest = /xyz/.test(function() {
			xyz;
		})
			? /\b_super\b/
			: /.*/;
	// The base Class implementation (does nothing)
	this.Class = function() {};
	// Create a new Class that inherits from this class
	Class.extend = function(prop) {
		var _super = this.prototype;
		// Instantiate a base class (but only create the instance,
		// don't run the init constructor)
		initializing = true;
		var prototype = new this();
		initializing = false;
		// Copy the properties over onto the new prototype
		for (var name in prop) {
			// Check if we're overwriting an existing function
			prototype[name] =
				typeof prop[name] == 'function' && typeof _super[name] == 'function' && fnTest.test(prop[name])
					? (function(name, fn) {
							return function() {
								var tmp = this._super;
								// Add a new ._super() method that is the same method
								// but on the super-class
								this._super = _super[name];
								// The method only need to be bound temporarily, so we
								// remove it when we're done executing
								var ret = fn.apply(this, arguments);
								this._super = tmp;
								return ret;
							};
						})(name, prop[name])
					: prop[name];
		}
		// The dummy class constructor
		function Class() {
			// All construction is actually done in the init method
			if (!initializing && this.init) this.init.apply(this, arguments);
		}
		// Populate our constructed prototype object
		Class.prototype = prototype;
		// Enforce the constructor to be what we expect
		Class.prototype.constructor = Class;
		// And make this class extendable
		Class.extend = arguments.callee;
		return Class;
	};
})();

(function(jQuery, undefined) {
	var sm = (window.sm = window.sm || {});
	var windowProxy;
	var actionQueue = [];

	if (typeof sm.portal === 'undefined') {
		jQuery.extend(sm, { portal: {} });
	}
	if (typeof sm.portal.utility === 'undefined') {
		jQuery.extend(sm.portal, { utility: {} });
	}

	// ** Main Localization Fucntion
	function getResourceValue(key, func) {
		// This is here so that we can always overrights the local version of getting resources

		//1. Look in the Customer/Custom Location
		//2. Try and get data from the Portal Resources
		//3. Evaluate the function passed in
		//4. Return Key

		// Try Custom/Overwritten Location
		var item = key;

		try {
			if (!sm.portal.utility.isNullOrEmpty(key)) {
				item = sm.custom.resources.portalResource.getValue(key);
			}
		} catch (c) {
			// ERRROR OCCURED! - CUSTOM PATH
		}

		// Keep checking, value is the same
		if (item.toLowerCase() == key.toLowerCase()) {
			try {
				if (!sm.portal.utility.isNullOrEmpty(key)) {
					item = sm.resources.portalResource.getValue(key);
				}
			} catch (t) {
				// ERRROR OCCURED! - Portal Resource
			}
		}

		// Keep checking, value is the same
		if (item.toLowerCase() == key.toLowerCase() && !sm.portal.utility.isNullOrEmpty(func)) {
			try {
				item = eval(func);
			} catch (x) {
				// ERRROR OCCURED! - Straight Evaluation
				item = key;
			}
		}

		return item;
	}
	function isANonZeroNumber(value) {
		if (!isNullEmptyOrNothing(value) && isNumeric(value) && value !== '0' && value > 0) {
			return true;
		}
		return false;
	}

	function formatString() {
		var i = arguments.length;
		if (i == 0) return;
		if (i == 1) {
			return arguments[0];
		}
		var str = arguments[0];
		while (i-- && i > 0) {
			str = str.replace(new RegExp('\\{' + (i - 1) + '\\}', 'gm'), arguments[i]);
		}

		return str;
	}

	function isNullOrEmpty(value) {
		if (value == null || value == undefined || value.toString() == '') return true;
		return false;
	}

	// previous function is nearly identical, but this one also checks for lack of object too
	function isNullEmptyOrNothing(value) {
		if (
			value == null ||
			value == undefined ||
			value.toString() == '' ||
			(Array.isArray(value) && value.length == 0)
		)
			return true;
		return false;
	}

	function formatDate(dateToFormat, showDate, showTime, showDayName, showLongDayName) {
		// will return any combination of date, time or dayName(long or abbreviated)
		// TODO: Take into account of other country formats for the date

		if (dateToFormat == '' || dateToFormat == null) {
			return;
		}

		var longDayNames = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];
		var abrvDaysNames = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat' ];

		var date = new Date(dateToFormat); // date is adjusted for GMT
		// reformat to local
		var now_utc = new Date(
			date.getUTCFullYear(),
			date.getUTCMonth(),
			date.getUTCDate(),
			date.getUTCHours(),
			date.getUTCMinutes(),
			date.getUTCSeconds()
		);

		// get individual pieces, then reformat
		var month = now_utc.getUTCMonth() + 1 > 9 ? now_utc.getUTCMonth() + 1 : '0' + (now_utc.getUTCMonth() + 1);
		var day = now_utc.getUTCDate() > 9 ? now_utc.getUTCDate() : '0' + now_utc.getUTCDate();
		var hours = now_utc.getHours() > 12 ? now_utc.getHours() - 12 : '0' + now_utc.getHours();
		var minutes = now_utc.getUTCMinutes() > 9 ? now_utc.getUTCMinutes() : '0' + now_utc.getUTCMinutes();
		var seconds = now_utc.getUTCSeconds() > 9 ? now_utc.getUTCSeconds() : '0' + now_utc.getUTCSeconds();
		var ampm;
		var dayName = '';

		if (now_utc.getHours() <= 12) {
			ampm = 'AM';
		} else {
			ampm = 'PM';
		}

		var d = showDate ? month + '/' + day + '/' + now_utc.getFullYear() : '';
		var t = showTime ? hours + ':' + minutes + ' ' + ampm : '';

		if (showDayName) {
			// get day of week, determine to use long name or abbreviated name
			dayName = showLongDayName ? longDayNames[now_utc.getDay()] : abrvDaysNames[now_utc.getDay()];
		}

		// take inaccount of spacing or dash
		return (
			(d != '' ? d + ' ' : '') +
			(t != '' ? ' ' + t : '') +
			(dayName != '' ? (d != '' || t != '' ? ' - ' + dayName : dayName) : '')
		);
	}

	function todaysDate() {
		var today = new Date();
		var dd = today.getDate();
		var mm = today.getMonth() + 1; //January is 0!

		var yyyy = today.getFullYear();
		if (dd < 10) {
			dd = '0' + dd;
		}
		if (mm < 10) {
			mm = '0' + mm;
		}
		var today = mm + '/' + dd + '/' + yyyy;
		return today;
	}

	function loadTemplates(file, target, success, loadOriginal) {
		var uri = '';
		var pathToFile = _uploadPath;

		if (!loadOriginal) {
			pathToFile = aultman_site_url.site_plugin_url + 'u4sm-aultman/assets';
		}

		if (file.indexOf('.html') == -1) {
			uri = pathToFile + '/templates/' + file + '.html';
		} else {
			uri = _customerUploadPath + file;
		}

		if (!sm.portal.utility.isNullOrEmpty(file)) {
			jQuery.get(uri, function(template) {
				jQuery('#' + target).append(template);
				if (!sm.portal.utility.isNullOrEmpty(success)) {
					success();
				}
			});
		}
	}

	function getParameterByName(name) {
		name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
		var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
			results = regex.exec(location.search);
		return results == null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
	}

	function addFormValidation(form) {
		try {
			if (jQuery(form).attr('data-validate') != 'false') {
				// add js validator events
				jQuery.validator.unobtrusive.parse(jQuery(form));
				jQuery.validator.addClassRules('requiredInput', {
					required: true
				});

				// force eager validation
				var settngs = jQuery.data(jQuery(form)[0], 'validator').settings;
				settngs.onfocusout = function(element) {
					hideValidationSummary();
					if (!jQuery(element).hasClass('ignore')) {
						jQuery(element).valid();
					}
				};
				settngs.ignore = ':input:hidden,input[type="hidden"],.ignore,.wizard-ignore,#adv_search *';
			} else {
				jQuery.removeData(jQuery(form), 'validator');
				jQuery(form).find('input, select, textarea').each(function() {
					jQuery(this).rules('remove');
				});
			}
		} catch (e) {}
	}

	function newGuid() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = (Math.random() * 16) | 0,
				v = c == 'x' ? r : (r & 0x3) | 0x8;
			return v.toString(16);
		});
	}

	function replaceDataFromAjax(data) {
		if (typeof data != 'string') {
			throw 'can only parse html as strings';
		}

		var edit = jQueryObjectFromAjax(data);
		edit.replaceWith(data);
		sm.portal.public.readyPage(true);
		if (edit[0] && edit[0].form) {
			sm.portal.utility.addFormValidation(edit[0].form);
		}
		if (edit[0] && edit[0].id) {
			return edit[0].id;
		}
	}

	function getParamsRaw(that1) {
		var that = that1;
		var processOuter = false;
		if (jQuery(that1).data('editordiv')) {
			that = jQuery('#' + jQuery(that1).data('editordiv'));
			processOuter = true;
		}
		var formData = undefined;
		var html5 = false;
		if (typeof window.FormData != 'undefined') {
			formData = new FormData();
			html5 = true;
		}
		var o = {};
		var url = jQuery(that).attr('data-save');
		var dsattr = jQuery(that).attr('data-datasourceattr');
		if (!dsattr) {
			dsattr = 'data-source';
		}
		sm.portal.utility.fillAjaxHelperWithDataSource(o, formData, that, dsattr);
		if (processOuter) {
			sm.portal.utility.fillAjaxHelperWithDataSource(o, formData, that1, dsattr);
		}
		return new trs.portal.AjaxHelper(o, formData, url);
	}

	function fillAjaxHelperWithDataSource(o, formData, that, dsattr) {
		if (typeof dsattr == 'undefined' || !dsattr) {
			dsattr = 'data-source';
		}
		var a = jQuery('*[' + dsattr + '="' + that[0].id + '"]').not('[data-target-source]');
		var html5 = false;
		if (typeof window.FormData != 'undefined') {
			html5 = true;
		}

		var path = false;
		if (jQuery(that).data('usenamebinding')) {
			path = that.data('path');
			if (typeof path == 'string') {
				path += '.';
			}
		}

		// round up normal input
		jQuery.each(a, function() {
			var binding;
			if (typeof path == 'string') {
				binding = this.getAttribute('name');
				if (binding) {
					binding = binding.replace(path, '');
					var dbinding = this.getAttribute('data-binding');
					if (dbinding.match(/JS$/) && !binding.match(/JS$/)) {
						binding = binding + 'JS';
					}
				} else {
					binding = this.getAttribute('data-binding');
				}
			} else {
				binding = this.getAttribute('data-binding');
			}
			var this1 = jQuery(this);
			var single = this1.data('bindingsingle');
			var filtergroup = this1.data('filtergroup');
			var filtergid = this1.data('filtergid');
			var filterid = this1.data('filterid');
			var index = this1.data('index');
			if (filtergroup) {
				var parentTOC = jQuery(this1.parents('[data-lookupgrouping]')[0]);
				processParentTOCforDS(o, parentTOC);
				if (filterid > 0) {
					maintainFilterItem(o, filtergroup, filterid, filtergid, index);
				}
			}
			if (o[binding] !== undefined && !single) {
				if (!o[binding].push) {
					o[binding] = [ o[binding] ];
				}
				if (this.type === 'checkbox') {
					o[binding].push(this.checked.toString());
				} else {
					o[binding].push(this.value || '');
				}
			} else if (this.tagName == 'DIV') {
				o[binding] = this.textContent || '';
			} else if (this.type == 'file') {
				if (typeof this.files != 'undefined' && this.files.length > 0) {
					if (html5) {
						if (this.multiple) {
							for (var i in this.files) {
								formData.append(binding + '[' + i + ']', this.files[i]);
							}
						} else {
							formData.append(binding, this.files[0]);
						}
					} else {
						o[binding] = this.files[0];
					}
				} else {
				}
			} else {
				//o[binding] = jQuery(this).val() || '';
				if (this.type === 'checkbox') {
					o[binding] = this.checked.toString();
				} else if (
					this.getAttribute('data-html-content') == 'true' &&
					!this.getAttribute('data-contenteditable')
				) {
					var myCode = this1.val();
					myCode = jQuery('<div></div>')
						.append(myCode)
						.find('[contenteditable]')
						.removeAttr('contenteditable')
						.end()
						.html();
					console.log(myCode);
					o[binding] = Base64.encode(myCode);
				} else if (this.getAttribute('data-html-content') == 'true') {
					var myCode = this1.val();
					o[binding] = Base64.encode(myCode);
				} else if (single && o[binding] !== undefined && o[binding] != '') {
				} else {
					o[binding] = this1.val() || '';
				}
			}
		});

		// round up virtual input
		jQuery('*[' + dsattr + '="' + that[0].id + '"][data-target-source]').each(function() {
			var that = jQuery(this);
			var target = jQuery(
				'[' +
					dsattr +
					'="' +
					that.attr('data-target-source') +
					'"][data-binding="' +
					that.attr('data-target-binding') +
					'"]'
			);
			o[that.attr('data-binding')] = target.val();
		});

		// data path
		var attr = that[0].getAttribute('data-path');
		if (attr != null) {
			o.path = attr;
		}

		// dates
		var b = a.find('.date.hasDatepicker');
		jQuery.each(b, function() {
			if (this.name.substring(0, 6) != 'Model.') {
				o[this.name] = jQuery(this).val() || '';
			}
		});
	}

	function isValidJson(value) {
		if (typeof value == 'object') {
			return true;
		} else if (typeof value == 'string') {
			var isJson = true;
			try {
				json = jQuery.parseJSON(value);
			} catch (e) {
				isJson = false;
			}
			return isJson;
		}
		return false;
	}

	function isEmail(email) {
		var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
		return regex.test(email);
	}

	function isNumeric(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	}

	function defaultComparison(a, b) {
		if (sm.portal.utility.isNumeric(a) && sm.portal.utility.isNumeric(b)) return a - b;

		a = a.toString();
		b = b.toString();

		return a == b ? 0 : a < b ? -1 : 1;
	}

	function addTitleToElement(element, val, alwaysAdd) {
		var attr = jQuery(element).attr('title');
		if (typeof attr === typeof undefined || attr === false) {
			var att = document.createAttribute('title');
			att.value = val;
			element.setAttributeNode(att);
		} else {
			// Even if it exists, replace value
			if (alwaysAdd) {
				jQuery(element).attr('title', val);
			}
		}
	}

	function whichTransitionEvent() {
		var t;
		var el = document.createElement('fakeelement');

		var transitions = {
			transition: 'transitionend',
			OTransition: 'oTransitionEnd',
			MozTransition: 'transitionend',
			WebkitTransition: 'webkitTransitionEnd'
		};

		for (t in transitions) {
			if (el.style[t] !== undefined) {
				return transitions[t];
			}
		}
	}

	function logFocus(el) {
		var that = jQuery(el);
		if (!sm.portal.utility.isNullEmptyOrNothing(that)) {
			that.each(function() {
				jQuery(this).on('focus', function() {
					console.log('Focused Element: ', this);
				});
			});
		}
	}

	// Extracts a name from the list by ID
	function extractNameFromListById(list, id) {
		var result = '';
		for (var i = 0; i < list.length; i++) {
			if (list[i].ID() == id) {
				result = list[i].Text();
				break;
			}
		}
		return result;
	}

	// Checks if the varaible is a function
	function isFunction(x) {
		return Object.prototype.toString.call(x) == '[object Function]';
	}

	function flagMobile() {
		jQuery('body').not('[data-platform-flag]').each(function() {
			var that = jQuery(this);

			if (navigator.platform == 'Win32') {
				jQuery('body').attr('data-platform-flag', 'pc');
			} else if (navigator.platform == 'MacIntel') {
				jQuery('body').attr('data-platform-flag', 'mac');
			}
		});
	}

	// Generic funciton to shuffle our array of fake data (or anything array for that matter)
	function shuffle(array) {
		var currentIndex = array.length,
			temporaryValue,
			randomIndex;
		// While there remain elements to shuffle...
		while (0 !== currentIndex) {
			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;
			// And swap it with the current element.
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}
		return array;
	}

	var SearchHandler = Class.extend({
		init: function(that, resultDiv, options, manual, deferBinding) {
			var _that = this;
			_that.Method = jQuery.attr(that, 'data-search-method');
			_that.Action = jQuery.attr(that, 'data-search-action');
			_that.ResultDiv = resultDiv;
			_that.Config = {};
			_that.SearchCrit = {};
			_that.deferBinding = false;
			_that.SearchOptions = options;
			_that.ReturnTo = jQuery.attr(that, 'data-search-return');

			if (deferBinding) {
				_that.deferBinding = deferBinding;
			}

			var config = _that.Config;

			config['WildCard'] = 'contains';
			config['PageSize'] = 30;

			if (!manual) {
				jQuery(that).find('[data-config]').each(function() {
					var jQuerythat = jQuery(this);
					var attr = jQuerythat.attr('data-config');
					config[attr] = jQuerythat.val();
				});
			}

			if (!manual) {
				jQuery(that).find('[data-search]').each(function() {
					_that.AddControl(this);
				});
			}
		},
		copy: function(handler) {
			var _that = this;
			_that.Method = handler.Method;
			_that.Action = handler.Action;
			_that.ResultDiv = handler.ResultDiv;
			_that.Config = handler.Config;
			_that.SearchCrit = handler.SearchCrit;
			_that.deferBinding = handler.deferBinding;
			_that.SearchOptions = handler.SearchOptions;
			_that.ColumnWidths = handler.ColumnWidths;
			_that.ReturnTo = handler.ReturnTo;
		},
		Execute: function(that, pushState) {
			this.ExecuteForPopup(that, '');
		},
		ExecuteForPopup: function(that, path) {
			var convertedObject = this.ConvertToPortalObject(path);
			console.log('sm.portal.js --> Inside ExecuteForPopup');
			console.log('sm.portal.js --> Path: ' + path);
			console.log('sm.portal.js --> Converted Object: %o', convertedObject);

			sm.portal.public.performPortalAjaxCall(convertedObject, function(newData, originalData) {
				console.log('sm.portal.js --> Inside Callback function for ExecuteForPopup');
				var el = that;
				var pt = path;
				jQuery('#' + originalData.resultDiv).html('');
				jQuery('#' + originalData.resultDiv).html(newData.response);
				sm.portal.ui.readyPage();
				sm.portal.public.hideSearchArea();
			});
		},
		AddControl: function(control) {
			var $control = jQuery(control);

			var searchID = $control.attr('data-searchid');
			var searchField = $control.attr('data-search');
			var dataType = $control.attr('data-type');
			var nullable = $control.attr('data-nullable');
			var nullasnull = $control.attr('data-nullasnull');
			var searchOp = $control.attr('data-searchop');
			var id = $control[0].id;

			if (!dataType) {
				dataType = 'String';
			}
			if (!nullable) {
				nullable = true;
			}
			if (!searchOp) {
				searchOp = 'Wildcard';
			}

			var value = '';

			if ($control.is(':checkbox')) {
				value = control.checked.toString();
			} else if (dataType == 'intlist') {
				value = JSON.stringify($control.val());
				if (value == 'null') value = '';
			} else {
				value = $control.val();
			}

			var crit = {
				SearchField: searchField,
				StrValue: value,
				DataType: dataType,
				SearchOp: searchOp,
				Nullable: nullable,
				NullAsNull: nullasnull,
				clientID: id
			};

			if (searchID != undefined) {
				this.SearchCrit[searchID] = crit;
			} else {
				this.SearchCrit[searchField] = crit;
			}

			return this;
		},
		Add: function(searchField, type, nullable, searchOp, value) {
			var crit = {
				StrValue: value,
				DataType: type,
				SearchOp: searchOp,
				Nullable: nullable
			};

			this.SearchCrit[searchField] = crit;

			return this;
		},
		SetConfig: function(parm, value) {
			this.Config[parm] = value;

			return this;
		},
		ConfigJSON: function() {
			return JSON.stringify(this.Config);
		},
		SearchJSON: function() {
			return JSON.stringify({ Info: this.SearchCrit });
		},
		OptionsJSON: function() {
			return JSON.stringify(this.SearchOptions);
		},
		SetAction: function(action) {
			var _that = this;
			_that.Action = action;
			return this;
		},
		ConvertToPortalObject: function(path) {
			return {
				config: this.ConfigJSON(),
				criteria: this.SearchJSON(),
				path: path,
				url: this.Action,
				type: this.Method,
				resultDiv: this.ResultDiv
			};
		}
	});

	jQuery.extend(true, sm.portal.utility, {
		isNullOrEmpty: isNullOrEmpty,
		isNullEmptyOrNothing: isNullEmptyOrNothing,
		formatString: formatString,
		isANonZeroNumber: isANonZeroNumber,
		formatDate: formatDate,
		todaysDate: todaysDate,
		getResourceValue: getResourceValue,
		loadTemplates: loadTemplates,
		getParameterByName: getParameterByName,
		addFormValidation: addFormValidation,
		newGuid: newGuid,
		replaceDataFromAjax: replaceDataFromAjax,
		getParamsRaw: getParamsRaw,
		fillAjaxHelperWithDataSource: fillAjaxHelperWithDataSource,
		isValidJson: isValidJson,
		isEmail: isEmail,
		isNumeric: isNumeric,
		defaultComparison: defaultComparison,
		addTitleToElement: addTitleToElement,
		extractNameFromListById: extractNameFromListById,
		logFocus: logFocus,
		isFunction: isFunction,
		whichTransitionEvent: whichTransitionEvent,
		flagMobile: flagMobile,
		shuffle: shuffle,
		SearchHandler: SearchHandler
	});
})(jQuery);

//Diplicate Function foudn in UI
//function formatDate(value) {
//    var convDateValue = new Date(value);
//    if (!/Invalid|NaN/.test(convDateValue)) {
//        return jQuery.datepicker.formatDate('mm/dd/yy', convDateValue);
//    }
//    return value;
//}
