(function( $ ) {
    $.fn.dahk = function (command) {
        var ret = this;
        var settings = $.extend({
            // These are the defaults.
            source: null,
            command: null
        }, command);
        //facilitate dimension tracking
        if (!$.dahk_cache) {
            $.dahk_cache = {};
            $.dahk_cache.trackDim = function () {
                $.each ($.dahk_cache, function(key, value) {

                    if ( !(value instanceof Function) && value && value.self ) {
                        var w = value.self.outerWidth();
                        var h = value.self.outerHeight();
                        if ( value.origW != w || value.origH != h ) {
                            var boats = value.self.dahk({ source: null, command: 'clear' });
                            $.each(boats, function (inx, value2) {
                                var source = value2.source;
                                var command = value2.command;
                                value.self.dahk({ source: source, command: command });
                            });
                            value.origH = h;
                            value.origW = w;
                        }
                    }
                    });
                setTimeout(function () {
                    $.dahk_cache.trackDim();
                }, 100);
            };
            $.dahk_cache.trackDim();
        }
        if (!settings.source && settings.command && settings.command === 'clear') {
            ret = dahk_cache.clear(this);
        }
        else if (settings.source && settings.command) {
            dahk_cache.put({ dock: this, source: settings.source, command: settings.command });
        }
        return ret;
    };

    var dahk_cache = {
        init: function(d) { //d -> dock, expected a jQuery object
            if (d) {
                var id = d.attr('id');
                $.dahk_cache = ( !$.dahk_cache ) ? {} : $.dahk_cache;
                 var cache = $.dahk_cache;
                if ( !cache[ id ] ) {
                    cache[ id ] = {};
                    var cash = cache[ id ];
                    cash.self = d;
                    var h = d.height();
                    var w = d.width();
                    cash.N = cash.S = [ 0, w ];
                    cash.W = cash.E = [ 0, h ];
                    cash.P = d.offset();
                    cash.flags = { n: false, s: false, w: false, e: false, nx: false, sx: false, wx: false, ex: false };
                    cash.origH = h;
                    cash.origW = w;
                    cash.boats = [];
                    d.css('padding', 0);
                    d.css('margin', 0);
                }
                return cache[ id ];
            }
        },

    put: function(request) {
            var d = request.dock;
            var cache = this.init(d);
            var s = request.source;
            var v = request.command.toUpperCase();
            var flOk = true;
            //any expansion call can only be done once
            var flExp = cache.flags.nx || cache.flags.sx || cache.flags.wx || cache.flags.ex;
            switch (v) {
                case 'N':
                    flOk = !cache.flags.n && !flExp;
                    break;
                case 'S':
                    flOk = !cache.flags.s && !flExp;
                    break;
                case 'W':
                    flOk = !cache.flags.w && !flExp;
                    break;
                case 'E':
                    flOk = !cache.flags.e && !flExp;
                    break;
                case 'NX':
                    flOk = !cache.flags.n && !flExp;
                    break;
                case 'SX':
                    flOk = !cache.flags.s && !flExp;
                    break;
                case 'EX':
                    flOk = !cache.flags.e && !flExp;
                    break;
                case 'WX':
                    flOk = !cache.flags.w && !flExp;
                    break;
                default :
                    flOk = false;
            }
            if ( flOk ) {
                var sW = s.attr('data-dahk-w') ? s.attr('data-dahk-w') : s.width();
                var sH = s.attr('data-dahk-h') ? s.attr('data-dahk-h') : s.height();
                s.attr('data-dahk-w', sW);
                s.attr('data-dahk-h', sH);
                sW = parseInt(sW);
                sH = parseInt(sH);
                var sOff;
                cache.boats.push({ source: s, command: v });
                s.detach();
                s.addClass('dahk_boat');
                d.append(s);
                    s.css('margin', 0).css('position', 'absolute');
                    switch (v) {
                        case 'N':
                            sOff = { left: cache.P.left + cache.N[0], top: cache.P.top };
                            s.offset(sOff);
                            s.width(cache.N[1] - cache.N[0]);
                            cache.W[0] += sH;
                            cache.flags.n = true;
                            break;
                        case 'NX':
                            sOff = { left: cache.P.left + cache.N[0], top: cache.P.top };
                            s.offset(sOff);
                            s.width(cache.N[1] - cache.N[0]);
                            s.height(cache.W[1] - cache.W[0]);
                            cache.flags.nx = true;
                            break;
                        case 'S':
                            sOff = { left: cache.P.left + cache.N[0], top: cache.P.top + cache.W[1] - sH };
                            s.offset(sOff);
                            s.width(cache.N[1] - cache.N[0]);
                            cache.W[1] -= sH;
                            cache.flags.s = true;
                            break;
                        case 'SX':
                            sOff = { left: cache.P.left + cache.N[0], top: cache.P.top + cache.W[0] };
                            s.offset(sOff);
                            s.width(cache.N[1] - cache.N[0]);
                            s.height(cache.W[1] - cache.W[0]);
                            cache.flags.sx = true;
                            break;
                        case 'W':
                            sOff = { left: cache.P.left, top: cache.W[0] + cache.P.top };
                            s.offset(sOff);
                            s.height(cache.W[1] - cache.W[0]);
                            cache.N[0] += sW;
                            cache.flags.w = true;
                            break;
                        case 'WX':
                            sOff = { left: cache.P.left, top: cache.W[0] + cache.P.top };
                            s.offset(sOff);
                            s.height(cache.W[1] - cache.W[0]);
                            s.width(cache.N[1] - cache.N[0]);
                            cache.flags.wx = true;
                            break;
                        case 'E':
                            sOff = { left: cache.P.left + cache.N[1] - sW, top: cache.W[0] + cache.P.top };
                            s.offset(sOff);
                            s.height(cache.W[1] - cache.W[0]);
                            cache.N[1] -= sW;
                            cache.flags.e = true;
                            break;
                        case 'EX':
                            sOff = { left: cache.P.left + cache.N[0], top: cache.W[0] + cache.P.top };
                            s.offset(sOff);
                            s.height(cache.W[1] - cache.W[0]);
                            s.width(cache.N[1] - cache.N[0]);
                            cache.flags.ex = true;
                            break;
                    }
            }
            return flOk;
        },
        clear: function( d ) {
            var ret = null;
            if ($.dahk_cache) {
                var cache = $.dahk_cache;
                var id = d.attr('id');
                if (cache[ id ]) {
                    ret = cache[ id ].boats;
                    var kids = d.children('.dahk_boat');
                    cache[ id ] = undefined;
                    kids.detach();
                }
            }
            return ret;
        }
    }

}( jQuery ));