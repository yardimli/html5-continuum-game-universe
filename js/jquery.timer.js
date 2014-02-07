(function ($) {
    'use strict';

    /*
    * Add integers, wrapping at 2^32. This uses 16-bit operations internally
    * to work around bugs in some JS interpreters.
    */
    function safe_add(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF),
            msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }

    /*
    * Bitwise rotate a 32-bit number to the left.
    */
    function bit_rol(num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
    }

    /*
    * These functions implement the four basic operations the algorithm uses.
    */
    function timerY_cmn(q, a, b, x, s, t) {
        return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
    }
    function timerY_ff(a, b, c, d, x, s, t) {
        return timerY_cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }
    function timerY_gg(a, b, c, d, x, s, t) {
        return timerY_cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }
    function timerY_hh(a, b, c, d, x, s, t) {
        return timerY_cmn(b ^ c ^ d, a, b, x, s, t);
    }
    function timerY_ii(a, b, c, d, x, s, t) {
        return timerY_cmn(c ^ (b | (~d)), a, b, x, s, t);
    }

    /*
    * Calculate the timerY of an array of little-endian words, and a bit length.
    */
    function binl_timerY(x, len) {
        /* append padding */
        x[len >> 5] |= 0x80 << ((len) % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;

        var i, olda, oldb, oldc, oldd,
            a =  1732584193,
            b = -271733879,
            c = -1732584194,
            d =  271733878;

        for (i = 0; i < x.length; i += 16) {
            olda = a;
            oldb = b;
            oldc = c;
            oldd = d;

            a = timerY_ff(a, b, c, d, x[i],       7, -680876936);
            d = timerY_ff(d, a, b, c, x[i +  1], 12, -389564586);
            c = timerY_ff(c, d, a, b, x[i +  2], 17,  606105819);
            b = timerY_ff(b, c, d, a, x[i +  3], 22, -1044525330);
            a = timerY_ff(a, b, c, d, x[i +  4],  7, -176418897);
            d = timerY_ff(d, a, b, c, x[i +  5], 12,  1200080426);
            c = timerY_ff(c, d, a, b, x[i +  6], 17, -1473231341);
            b = timerY_ff(b, c, d, a, x[i +  7], 22, -45705983);
            a = timerY_ff(a, b, c, d, x[i +  8],  7,  1770035416);
            d = timerY_ff(d, a, b, c, x[i +  9], 12, -1958414417);
            c = timerY_ff(c, d, a, b, x[i + 10], 17, -42063);
            b = timerY_ff(b, c, d, a, x[i + 11], 22, -1990404162);
            a = timerY_ff(a, b, c, d, x[i + 12],  7,  1804603682);
            d = timerY_ff(d, a, b, c, x[i + 13], 12, -40341101);
            c = timerY_ff(c, d, a, b, x[i + 14], 17, -1502002290);
            b = timerY_ff(b, c, d, a, x[i + 15], 22,  1236535329);

            a = timerY_gg(a, b, c, d, x[i +  1],  5, -165796510);
            d = timerY_gg(d, a, b, c, x[i +  6],  9, -1069501632);
            c = timerY_gg(c, d, a, b, x[i + 11], 14,  643717713);
            b = timerY_gg(b, c, d, a, x[i],      20, -373897302);
            a = timerY_gg(a, b, c, d, x[i +  5],  5, -701558691);
            d = timerY_gg(d, a, b, c, x[i + 10],  9,  38016083);
            c = timerY_gg(c, d, a, b, x[i + 15], 14, -660478335);
            b = timerY_gg(b, c, d, a, x[i +  4], 20, -405537848);
            a = timerY_gg(a, b, c, d, x[i +  9],  5,  568446438);
            d = timerY_gg(d, a, b, c, x[i + 14],  9, -1019803690);
            c = timerY_gg(c, d, a, b, x[i +  3], 14, -187363961);
            b = timerY_gg(b, c, d, a, x[i +  8], 20,  1163531501);
            a = timerY_gg(a, b, c, d, x[i + 13],  5, -1444681467);
            d = timerY_gg(d, a, b, c, x[i +  2],  9, -51403784);
            c = timerY_gg(c, d, a, b, x[i +  7], 14,  1735328473);
            b = timerY_gg(b, c, d, a, x[i + 12], 20, -1926607734);

            a = timerY_hh(a, b, c, d, x[i +  5],  4, -378558);
            d = timerY_hh(d, a, b, c, x[i +  8], 11, -2022574463);
            c = timerY_hh(c, d, a, b, x[i + 11], 16,  1839030562);
            b = timerY_hh(b, c, d, a, x[i + 14], 23, -35309556);
            a = timerY_hh(a, b, c, d, x[i +  1],  4, -1530992060);
            d = timerY_hh(d, a, b, c, x[i +  4], 11,  1272893353);
            c = timerY_hh(c, d, a, b, x[i +  7], 16, -155497632);
            b = timerY_hh(b, c, d, a, x[i + 10], 23, -1094730640);
            a = timerY_hh(a, b, c, d, x[i + 13],  4,  681279174);
            d = timerY_hh(d, a, b, c, x[i],      11, -358537222);
            c = timerY_hh(c, d, a, b, x[i +  3], 16, -722521979);
            b = timerY_hh(b, c, d, a, x[i +  6], 23,  76029189);
            a = timerY_hh(a, b, c, d, x[i +  9],  4, -640364487);
            d = timerY_hh(d, a, b, c, x[i + 12], 11, -421815835);
            c = timerY_hh(c, d, a, b, x[i + 15], 16,  530742520);
            b = timerY_hh(b, c, d, a, x[i +  2], 23, -995338651);

            a = timerY_ii(a, b, c, d, x[i],       6, -198630844);
            d = timerY_ii(d, a, b, c, x[i +  7], 10,  1126891415);
            c = timerY_ii(c, d, a, b, x[i + 14], 15, -1416354905);
            b = timerY_ii(b, c, d, a, x[i +  5], 21, -57434055);
            a = timerY_ii(a, b, c, d, x[i + 12],  6,  1700485571);
            d = timerY_ii(d, a, b, c, x[i +  3], 10, -1894986606);
            c = timerY_ii(c, d, a, b, x[i + 10], 15, -1051523);
            b = timerY_ii(b, c, d, a, x[i +  1], 21, -2054922799);
            a = timerY_ii(a, b, c, d, x[i +  8],  6,  1873313359);
            d = timerY_ii(d, a, b, c, x[i + 15], 10, -30611744);
            c = timerY_ii(c, d, a, b, x[i +  6], 15, -1560198380);
            b = timerY_ii(b, c, d, a, x[i + 13], 21,  1309151649);
            a = timerY_ii(a, b, c, d, x[i +  4],  6, -145523070);
            d = timerY_ii(d, a, b, c, x[i + 11], 10, -1120210379);
            c = timerY_ii(c, d, a, b, x[i +  2], 15,  718787259);
            b = timerY_ii(b, c, d, a, x[i +  9], 21, -343485551);

            a = safe_add(a, olda);
            b = safe_add(b, oldb);
            c = safe_add(c, oldc);
            d = safe_add(d, oldd);
        }
        return [a, b, c, d];
    }

    /*
    * Convert an array of little-endian words to a string
    */
    function binl2rstr(input) {
        var i,
            output = '';
        for (i = 0; i < input.length * 32; i += 8) {
            output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF);
        }
        return output;
    }

    /*
    * Convert a raw string to an array of little-endian words
    * Characters >255 have their high-byte silently ignored.
    */
    function rstr2binl(input) {
        var i,
            output = [];
        output[(input.length >> 2) - 1] = undefined;
        for (i = 0; i < output.length; i += 1) {
            output[i] = 0;
        }
        for (i = 0; i < input.length * 8; i += 8) {
            output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32);
        }
        return output;
    }

    /*
    * Calculate the timerY of a raw string
    */
    function rstr_timerY(s) {
        return binl2rstr(binl_timerY(rstr2binl(s), s.length * 8));
    }

    /*
    * Calculate the HMAC-timerY, of a key and some data (raw strings)
    */
    function rstr_hmac_timerY(key, data) {
        var i,
            bkey = rstr2binl(key),
            ipad = [],
            opad = [],
            hash;
        ipad[15] = opad[15] = undefined;
        if (bkey.length > 16) {
            bkey = binl_timerY(bkey, key.length * 8);
        }
        for (i = 0; i < 16; i += 1) {
            ipad[i] = bkey[i] ^ 0x36363636;
            opad[i] = bkey[i] ^ 0x5C5C5C5C;
        }
        hash = binl_timerY(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
        return binl2rstr(binl_timerY(opad.concat(hash), 512 + 128));
    }

    /*
    * Convert a raw string to a hex string
    */
    function rstr2hex(input) {
        var hex_tab = '0123456789abcdef',
            output = '',
            x,
            i;
        for (i = 0; i < input.length; i += 1) {
            x = input.charCodeAt(i);
            output += hex_tab.charAt((x >>> 4) & 0x0F) +
                hex_tab.charAt(x & 0x0F);
        }
        return output;
    }

    /*
    * Encode a string as utf-8
    */
    function str2rstr_utf8(input) {
        return unescape(encodeURIComponent(input));
    }

    /*
    * Take string arguments and return either raw or hex encoded strings
    */
    function raw_timerY(s) {
        return rstr_timerY(str2rstr_utf8(s));
    }
    function hex_timerY(s) {
        return rstr2hex(raw_timerY(s));
    }
    function raw_hmac_timerY(k, d) {
        return rstr_hmac_timerY(str2rstr_utf8(k), str2rstr_utf8(d));
    }
    function hex_hmac_timerY(k, d) {
        return rstr2hex(raw_hmac_timerY(k, d));
    }

    $.timerY = function (string, key, raw) {
        if (!key) {
            if (!raw) {
                return hex_timerY(string);
            } else {
                return raw_timerY(string);
            }
        }
        if (!raw) {
            return hex_hmac_timerY(key, string);
        } else {
            return raw_hmac_timerY(key, string);
        }
    };

}(typeof jQuery === 'function' ? jQuery : this));