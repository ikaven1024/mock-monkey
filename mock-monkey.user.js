// ==UserScript==
// @name         mock-monkey
// @namespace    https://github.com/ikaven1024/
// @version      1.0.0
// @description  浏览器本地接口 Mock 的 Tampermonkey 脚本
// @description:en  A browser-native API mocking Tampermonkey script that requires no backend
// @author       ikaven1024
// @license      MIT
// @homepageURL  https://github.com/ikaven1024/mock-monkey
// @supportURL   https://github.com/ikaven1024/mock-monkey/issues
// @match        *://*/*
// @grant        none
// @run-at       document-end
// @icon         data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTEwMCIgaGVpZ2h0PSIxMTAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogPGc+CiAgPHRpdGxlPkxheWVyIDE8L3RpdGxlPgogIDxwYXRoIGQ9Im03MzQsNjNjLTUuMTU2LDguOTE5MiAtMTMuMjUsMTYuNDY5NCAtMjEsMjMuMTMwNGMtMjIuMTMzLDE5LjAyMTYgLTQ4LjYwNSwzMC45NTE2IC03NywzNy4wNzk2Yy00MC45NTksOC44MzkgLTgyLjUzNSw2LjA0IC0xMjQsOC44NzljLTMyLjk5NSwyLjI2IC02Ny4wMjEsOS45NzcgLTk4LDIxLjQ0MWMtODMuNTA0LDMwLjkgLTE1Mi4zNzEsOTYuMjg5IC0xOTAuMjE5LDE3Ni40N2MtOS4yMzEsMTkuNTU1IC0xNi4zMDQsNDAuOTQyIC0yMS4xMyw2MmMtMS41ODksNi45MzMgLTMuMDM5LDEzLjk4NSAtNC4yMTYsMjFjLTAuNTEyLDMuMDUgLTAuMzc1LDcuMDEyIC0yLjM3Myw5LjU2NmMtMy4zODMsNC4zMjIgLTEyLjI3LDIuMTQgLTE3LjA2MiwyLjYwNGMtMTMuNzQ1LDEuMzMgLTI4LjExLDUuNzQyIC00MSwxMC41MTFjLTM0LjIxNywxMi42NjIgLTY0LjQ5NTQsMzcuODI1IC04NS41NzI1LDY3LjMxOWMtNDAuOTQxNCw1Ny4yOSAtNDcuNTc4MzgsMTM3LjE1MyAtMTguMTE4MSwyMDFjMTQuMTkzMSwzMC43NiAzNy4xNjg3LDU3LjkwNCA2NC42OTA2LDc3LjU3M2MyMi4wNCwxNS43NSA0OC4zMDQsMjguOTcxIDc1LDM0LjQyM2MyMS44OTEsNC40NzEgNDMuNzg1LDQuMDA0IDY2LDQuMDA0Yy0yLjEzOSwtMTEuNTIgMCwtMjQuMjM2IDAsLTM2YzAsLTIzLjM2MSAtMC41ODcsLTQ2LjYyMyAtMC4wMTUsLTcwYzAuNjIsLTI1LjMgMC4wMTUsLTUwLjY5MiAwLjAxNSwtNzZjMCwtMTUuNjk4IC0wLjYzMywtMzEuNDk5IDIuMjYxLC00N2M2LjExLC0zMi43MzUgMjIuNzQ3LC02Mi4wMjEgNDYuNzM5LC04NC45NjFjNTAuMjQ1LC00OC4wNDEgMTMxLjQ3MywtNTYuNDUxIDE4OSwtMTYuMDAzYzIyLjUyMiwxNS44MzYgNDAuMzUzLDM4LjAwNyA1MS43NjksNjIuOTY0YzYuODg0LDE1LjA0OSAxMy41MTMsMzMuMzE5IDE0LjIzMSw1MGMyLjU1NywtNC44MDggMi40ODUsLTEwLjcyOSAzLjY2NSwtMTZjMS43MywtNy43MjUgNC4zMiwtMTUuNTY0IDcuMDMsLTIzYzguMTc1LC0yMi40MjYgMjIuODgsLTQzLjY3OSA0MC4zMDUsLTU5LjkxMWM0My4zMTgsLTQwLjM1MSAxMDkuOSwtNTEuNDA0IDE2NCwtMjYuOTk0YzIxLjgzNCw5Ljg1MSA0MC44NDYsMjUuMjQ5IDU1LjgsNDMuOTA1YzcuNDY2LDkuMzE0IDE0LjczLDE5LjE2NiAxOS44OCwzMWM4LjUxNSwxNy45MTQgMTQuMjYsMzcuMjIyIDE2LjE1LDU3YzEuOTA5LDE5Ljk3NCAwLjE3LDQwLjkzIDAuMTcsNjFsMCwxNTJjMTcuNDM0LDAgMzUuNzU0LDAuMzY3IDUzLC0yLjI5NmM0MS4yNTUsLTYuMzcyIDgyLjQyMSwtMjcuMzA0IDExMS45MSwtNTYuNzkzYzYwLjg4LC02MC44OCA3OS4xNCwtMTYxLjYyOCAzNS43NSwtMjM3LjkxMWMtMTguMTYsLTMxLjkzMyAtNDQuNzMsLTU4LjkxMiAtNzYuNjYsLTc3LjEyN2MtMjQuODI3LC0xNC4xNjUgLTUyLjU4NiwtMjEuODM4IC04MSwtMjMuNzg0Yy05LjQyMywtMC42NDUgLTE4LjY0NCwwLjcxOCAtMjgsMC45MTFjLTAuODg1LC0yMC4zMTYgLTcuNTg3LC00MS45MzcgLTE0LjMwOSwtNjFjLTE2LjkwMiwtNDcuOTMzIC00My42ODMsLTkwLjk5NCAtNzkuNjkxLC0xMjdjLTEwLjY1MiwtMTAuNjUxIC0yMS45NzMsLTIwLjQxNSAtMzQsLTI5LjQ3NWMtNy4wMTIsLTUuMjgxIC0xMy44NzksLTExLjAyMSAtMjIsLTE0LjUyNWMzLjkzMSwtMTIuMjkyIDUuNjc3LC0yNS4yOTIgNy43NTQsLTM4YzMuMzc1LC0yMC42NSA2LjI2LC00MS4yNCA4Ljk2NCwtNjJjMS4yNTUsLTkuNjI3MSAxLjAyMiwtMTkuNTMzNiAzLjI4MiwtMjlsLTIsMG0tMzUwLDUxMWMxLjY0NCw4Ljg1NSAxLDE4LjAyMyAxLDI3bDAsNDRsMCwxMzljMzEuNjgzLDAgNjQuNDc3LC0zLjk4NCA5NiwwbDAsLTIxMGwtOTcsMG0yMjUsMjEwbDcxLDBsMTcsMGMyLjIzNiwtMC4wMDUgNS41MDgsMC40NjggNy4zOTcsLTEuMDI4YzMuNDcsLTIuNzQ4IDAuOTQxLC0xMC4zNDEgMC42OTIsLTEzLjk3MmMtMC44MzcsLTEyLjIyNCAtMC4wODksLTI0Ljc0NiAtMC4wODksLTM3bDAsLTE1OGwtNzAsMGwtMTgsMGMtMi4yMTgsMC4wMDUgLTUuNTI4LC0wLjQ3OCAtNy4zOTMsMS4wMjhjLTIuODM4LDIuMjkxIC0wLjYyMyw5Ljc0OCAtMC42MDgsMTIuOTcyYzAuMDYxLDEyLjY2NiAwLjAwMSwyNS4zMzQgMC4wMDEsMzhsMCwxNTh6IiBmaWxsPSIjOEQ1NTI0IiBpZD0ic3ZnXzIiLz4KIDwvZz4KCjwvc3ZnPg==
// ==/UserScript==


          (function() {
            var _this = this;
            /*! mockjs 14-12-2015 16:19:19 */
/*! src/mock-prefix.js */
/*!
    Mock - 模拟请求 & 模拟数据
    https://github.com/nuysoft/Mock
    墨智 nuysoft@gmail.com
*/
(function(undefined) {
    var Mock = {
        version: "0.1.11",
        _mocked: {}
    };
    /*! src/util.js */
    var Util = function() {
        var Util = {};
        Util.extend = function extend() {
            var target = arguments[0] || {}, i = 1, length = arguments.length, options, name, src, copy, clone;
            if (length === 1) {
                target = this;
                i = 0;
            }
            for (;i < length; i++) {
                options = arguments[i];
                if (!options) continue;
                for (name in options) {
                    src = target[name];
                    copy = options[name];
                    if (target === copy) continue;
                    if (copy === undefined) continue;
                    if (Util.isArray(copy) || Util.isObject(copy)) {
                        if (Util.isArray(copy)) clone = src && Util.isArray(src) ? src : [];
                        if (Util.isObject(copy)) clone = src && Util.isObject(src) ? src : {};
                        target[name] = Util.extend(clone, copy);
                    } else {
                        target[name] = copy;
                    }
                }
            }
            return target;
        };
        Util.each = function each(obj, iterator, context) {
            var i, key;
            if (this.type(obj) === "number") {
                for (i = 0; i < obj; i++) {
                    iterator(i, i);
                }
            } else if (obj.length === +obj.length) {
                for (i = 0; i < obj.length; i++) {
                    if (iterator.call(context, obj[i], i, obj) === false) break;
                }
            } else {
                for (key in obj) {
                    if (iterator.call(context, obj[key], key, obj) === false) break;
                }
            }
        };
        Util.type = function type(obj) {
            return obj === null || obj === undefined ? String(obj) : Object.prototype.toString.call(obj).match(/\[object (\w+)\]/)[1].toLowerCase();
        };
        Util.each("String Object Array RegExp Function".split(" "), function(value) {
            Util["is" + value] = function(obj) {
                return Util.type(obj) === value.toLowerCase();
            };
        });
        Util.isObjectOrArray = function(value) {
            return Util.isObject(value) || Util.isArray(value);
        };
        Util.isNumeric = function(value) {
            return !isNaN(parseFloat(value)) && isFinite(value);
        };
        Util.keys = function(obj) {
            var keys = [];
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) keys.push(key);
            }
            return keys;
        };
        Util.values = function(obj) {
            var values = [];
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) values.push(obj[key]);
            }
            return values;
        };
        Util.heredoc = function heredoc(fn) {
            return fn.toString().replace(/^[^\/]+\/\*!?/, "").replace(/\*\/[^\/]+$/, "").replace(/^[\s\xA0]+/, "").replace(/[\s\xA0]+$/, "");
        };
        Util.noop = function() {};
        return Util;
    }();
    /*! src/random.js */
    var Random = function() {
        var Random = {
            extend: Util.extend
        };
        Random.extend({
            "boolean": function(min, max, cur) {
                if (cur !== undefined) {
                    min = typeof min !== "undefined" && !isNaN(min) ? parseInt(min, 10) : 1;
                    max = typeof max !== "undefined" && !isNaN(max) ? parseInt(max, 10) : 1;
                    return Math.random() > 1 / (min + max) * min ? !cur : cur;
                }
                return Math.random() >= .5;
            },
            bool: function(min, max, cur) {
                return this.boolean(min, max, cur);
            },
            natural: function(min, max) {
                min = typeof min !== "undefined" ? parseInt(min, 10) : 0;
                max = typeof max !== "undefined" ? parseInt(max, 10) : 9007199254740992;
                return Math.round(Math.random() * (max - min)) + min;
            },
            integer: function(min, max) {
                min = typeof min !== "undefined" ? parseInt(min, 10) : -9007199254740992;
                max = typeof max !== "undefined" ? parseInt(max, 10) : 9007199254740992;
                return Math.round(Math.random() * (max - min)) + min;
            },
            "int": function(min, max) {
                return this.integer(min, max);
            },
            "float": function(min, max, dmin, dmax) {
                dmin = dmin === undefined ? 0 : dmin;
                dmin = Math.max(Math.min(dmin, 17), 0);
                dmax = dmax === undefined ? 17 : dmax;
                dmax = Math.max(Math.min(dmax, 17), 0);
                var ret = this.integer(min, max) + ".";
                for (var i = 0, dcount = this.natural(dmin, dmax); i < dcount; i++) {
                    ret += this.character("number");
                }
                return parseFloat(ret, 10);
            },
            character: function(pool) {
                var pools = {
                    lower: "abcdefghijklmnopqrstuvwxyz",
                    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
                    number: "0123456789",
                    symbol: "!@#$%^&*()[]"
                };
                pools.alpha = pools.lower + pools.upper;
                pools["undefined"] = pools.lower + pools.upper + pools.number + pools.symbol;
                pool = pools[("" + pool).toLowerCase()] || pool;
                return pool.charAt(Random.natural(0, pool.length - 1));
            },
            "char": function(pool) {
                return this.character(pool);
            },
            string: function(pool, min, max) {
                var length;
                if (arguments.length === 3) {
                    length = Random.natural(min, max);
                }
                if (arguments.length === 2) {
                    if (typeof arguments[0] === "string") {
                        length = min;
                    } else {
                        length = Random.natural(pool, min);
                        pool = undefined;
                    }
                }
                if (arguments.length === 1) {
                    length = pool;
                    pool = undefined;
                }
                if (arguments.length === 0) {
                    length = Random.natural(3, 7);
                }
                var text = "";
                for (var i = 0; i < length; i++) {
                    text += Random.character(pool);
                }
                return text;
            },
            str: function(pool, min, max) {
                return this.string(pool, min, max);
            },
            range: function(start, stop, step) {
                if (arguments.length <= 1) {
                    stop = start || 0;
                    start = 0;
                }
                step = arguments[2] || 1;
                start = +start, stop = +stop, step = +step;
                var len = Math.max(Math.ceil((stop - start) / step), 0);
                var idx = 0;
                var range = new Array(len);
                while (idx < len) {
                    range[idx++] = start;
                    start += step;
                }
                return range;
            }
        });
        Random.extend({
            patternLetters: {
                yyyy: "getFullYear",
                yy: function(date) {
                    return ("" + date.getFullYear()).slice(2);
                },
                y: "yy",
                MM: function(date) {
                    var m = date.getMonth() + 1;
                    return m < 10 ? "0" + m : m;
                },
                M: function(date) {
                    return date.getMonth() + 1;
                },
                dd: function(date) {
                    var d = date.getDate();
                    return d < 10 ? "0" + d : d;
                },
                d: "getDate",
                HH: function(date) {
                    var h = date.getHours();
                    return h < 10 ? "0" + h : h;
                },
                H: "getHours",
                hh: function(date) {
                    var h = date.getHours() % 12;
                    return h < 10 ? "0" + h : h;
                },
                h: function(date) {
                    return date.getHours() % 12;
                },
                mm: function(date) {
                    var m = date.getMinutes();
                    return m < 10 ? "0" + m : m;
                },
                m: "getMinutes",
                ss: function(date) {
                    var s = date.getSeconds();
                    return s < 10 ? "0" + s : s;
                },
                s: "getSeconds",
                SS: function(date) {
                    var ms = date.getMilliseconds();
                    return ms < 10 && "00" + ms || ms < 100 && "0" + ms || ms;
                },
                S: "getMilliseconds",
                A: function(date) {
                    return date.getHours() < 12 ? "AM" : "PM";
                },
                a: function(date) {
                    return date.getHours() < 12 ? "am" : "pm";
                },
                T: "getTime"
            }
        });
        Random.extend({
            rformat: new RegExp(function() {
                var re = [];
                for (var i in Random.patternLetters) re.push(i);
                return "(" + re.join("|") + ")";
            }(), "g"),
            format: function(date, format) {
                var patternLetters = Random.patternLetters, rformat = Random.rformat;
                return format.replace(rformat, function($0, flag) {
                    return typeof patternLetters[flag] === "function" ? patternLetters[flag](date) : patternLetters[flag] in patternLetters ? arguments.callee($0, patternLetters[flag]) : date[patternLetters[flag]]();
                });
            },
            randomDate: function(min, max) {
                min = min === undefined ? new Date(0) : min;
                max = max === undefined ? new Date() : max;
                return new Date(Math.random() * (max.getTime() - min.getTime()));
            },
            date: function(format) {
                format = format || "yyyy-MM-dd";
                return this.format(this.randomDate(), format);
            },
            time: function(format) {
                format = format || "HH:mm:ss";
                return this.format(this.randomDate(), format);
            },
            datetime: function(format) {
                format = format || "yyyy-MM-dd HH:mm:ss";
                return this.format(this.randomDate(), format);
            },
            now: function(unit, format) {
                if (arguments.length === 1) {
                    if (!/year|month|week|day|hour|minute|second|week/.test(unit)) {
                        format = unit;
                        unit = "";
                    }
                }
                unit = (unit || "").toLowerCase();
                format = format || "yyyy-MM-dd HH:mm:ss";
                var date = new Date();
                switch (unit) {
                  case "year":
                    date.setMonth(0);

                  case "month":
                    date.setDate(1);

                  case "week":
                  case "day":
                    date.setHours(0);

                  case "hour":
                    date.setMinutes(0);

                  case "minute":
                    date.setSeconds(0);

                  case "second":
                    date.setMilliseconds(0);
                }
                switch (unit) {
                  case "week":
                    date.setDate(date.getDate() - date.getDay());
                }
                return this.format(date, format);
            }
        });
        Random.extend({
            ad_size: [ "300x250", "250x250", "240x400", "336x280", "180x150", "720x300", "468x60", "234x60", "88x31", "120x90", "120x60", "120x240", "125x125", "728x90", "160x600", "120x600", "300x600" ],
            screen_size: [ "320x200", "320x240", "640x480", "800x480", "800x480", "1024x600", "1024x768", "1280x800", "1440x900", "1920x1200", "2560x1600" ],
            video_size: [ "720x480", "768x576", "1280x720", "1920x1080" ],
            image: function(size, background, foreground, format, text) {
                if (arguments.length === 4) {
                    text = format;
                    format = undefined;
                }
                if (arguments.length === 3) {
                    text = foreground;
                    foreground = undefined;
                }
                if (!size) size = this.pick(this.ad_size);
                if (background && ~background.indexOf("#")) background = background.slice(1);
                if (foreground && ~foreground.indexOf("#")) foreground = foreground.slice(1);
                return "http://dummyimage.com/" + size + (background ? "/" + background : "") + (foreground ? "/" + foreground : "") + (format ? "." + format : "") + (text ? "&text=" + text : "");
            },
            img: function() {
                return this.image.apply(this, arguments);
            }
        });
        Random.extend({
            brandColors: {
                "4ormat": "#fb0a2a",
                "500px": "#02adea",
                "About.me (blue)": "#00405d",
                "About.me (yellow)": "#ffcc33",
                Addvocate: "#ff6138",
                Adobe: "#ff0000",
                Aim: "#fcd20b",
                Amazon: "#e47911",
                Android: "#a4c639",
                "Angie's List": "#7fbb00",
                AOL: "#0060a3",
                Atlassian: "#003366",
                Behance: "#053eff",
                "Big Cartel": "#97b538",
                bitly: "#ee6123",
                Blogger: "#fc4f08",
                Boeing: "#0039a6",
                "Booking.com": "#003580",
                Carbonmade: "#613854",
                Cheddar: "#ff7243",
                "Code School": "#3d4944",
                Delicious: "#205cc0",
                Dell: "#3287c1",
                Designmoo: "#e54a4f",
                Deviantart: "#4e6252",
                "Designer News": "#2d72da",
                Devour: "#fd0001",
                DEWALT: "#febd17",
                "Disqus (blue)": "#59a3fc",
                "Disqus (orange)": "#db7132",
                Dribbble: "#ea4c89",
                Dropbox: "#3d9ae8",
                Drupal: "#0c76ab",
                Dunked: "#2a323a",
                eBay: "#89c507",
                Ember: "#f05e1b",
                Engadget: "#00bdf6",
                Envato: "#528036",
                Etsy: "#eb6d20",
                Evernote: "#5ba525",
                "Fab.com": "#dd0017",
                Facebook: "#3b5998",
                Firefox: "#e66000",
                "Flickr (blue)": "#0063dc",
                "Flickr (pink)": "#ff0084",
                Forrst: "#5b9a68",
                Foursquare: "#25a0ca",
                Garmin: "#007cc3",
                GetGlue: "#2d75a2",
                Gimmebar: "#f70078",
                GitHub: "#171515",
                "Google Blue": "#0140ca",
                "Google Green": "#16a61e",
                "Google Red": "#dd1812",
                "Google Yellow": "#fcca03",
                "Google+": "#dd4b39",
                Grooveshark: "#f77f00",
                Groupon: "#82b548",
                "Hacker News": "#ff6600",
                HelloWallet: "#0085ca",
                "Heroku (light)": "#c7c5e6",
                "Heroku (dark)": "#6567a5",
                HootSuite: "#003366",
                Houzz: "#73ba37",
                HTML5: "#ec6231",
                IKEA: "#ffcc33",
                IMDb: "#f3ce13",
                Instagram: "#3f729b",
                Intel: "#0071c5",
                Intuit: "#365ebf",
                Kickstarter: "#76cc1e",
                kippt: "#e03500",
                Kodery: "#00af81",
                LastFM: "#c3000d",
                LinkedIn: "#0e76a8",
                Livestream: "#cf0005",
                Lumo: "#576396",
                Mixpanel: "#a086d3",
                Meetup: "#e51937",
                Nokia: "#183693",
                NVIDIA: "#76b900",
                Opera: "#cc0f16",
                Path: "#e41f11",
                "PayPal (dark)": "#1e477a",
                "PayPal (light)": "#3b7bbf",
                Pinboard: "#0000e6",
                Pinterest: "#c8232c",
                PlayStation: "#665cbe",
                Pocket: "#ee4056",
                Prezi: "#318bff",
                Pusha: "#0f71b4",
                Quora: "#a82400",
                "QUOTE.fm": "#66ceff",
                Rdio: "#008fd5",
                Readability: "#9c0000",
                "Red Hat": "#cc0000",
                Resource: "#7eb400",
                Rockpack: "#0ba6ab",
                Roon: "#62b0d9",
                RSS: "#ee802f",
                Salesforce: "#1798c1",
                Samsung: "#0c4da2",
                Shopify: "#96bf48",
                Skype: "#00aff0",
                Snagajob: "#f47a20",
                Softonic: "#008ace",
                SoundCloud: "#ff7700",
                "Space Box": "#f86960",
                Spotify: "#81b71a",
                Sprint: "#fee100",
                Squarespace: "#121212",
                StackOverflow: "#ef8236",
                Staples: "#cc0000",
                "Status Chart": "#d7584f",
                Stripe: "#008cdd",
                StudyBlue: "#00afe1",
                StumbleUpon: "#f74425",
                "T-Mobile": "#ea0a8e",
                Technorati: "#40a800",
                "The Next Web": "#ef4423",
                Treehouse: "#5cb868",
                Trulia: "#5eab1f",
                Tumblr: "#34526f",
                "Twitch.tv": "#6441a5",
                Twitter: "#00acee",
                TYPO3: "#ff8700",
                Ubuntu: "#dd4814",
                Ustream: "#3388ff",
                Verizon: "#ef1d1d",
                Vimeo: "#86c9ef",
                Vine: "#00a478",
                Virb: "#06afd8",
                "Virgin Media": "#cc0000",
                Wooga: "#5b009c",
                "WordPress (blue)": "#21759b",
                "WordPress (orange)": "#d54e21",
                "WordPress (grey)": "#464646",
                Wunderlist: "#2b88d9",
                XBOX: "#9bc848",
                XING: "#126567",
                "Yahoo!": "#720e9e",
                Yandex: "#ffcc00",
                Yelp: "#c41200",
                YouTube: "#c4302b",
                Zalongo: "#5498dc",
                Zendesk: "#78a300",
                Zerply: "#9dcc7a",
                Zootool: "#5e8b1d"
            },
            brands: function() {
                var brands = [];
                for (var b in this.brandColors) {
                    brands.push(b);
                }
                return brands;
            },
            dataImage: function(size, text) {
                var canvas = typeof document !== "undefined" && document.createElement("canvas"), ctx = canvas && canvas.getContext && canvas.getContext("2d");
                if (!canvas || !ctx) return "";
                if (!size) size = this.pick(this.ad_size);
                text = text !== undefined ? text : size;
                size = size.split("x");
                var width = parseInt(size[0], 10), height = parseInt(size[1], 10), background = this.brandColors[this.pick(this.brands())], foreground = "#FFF", text_height = 14, font = "sans-serif";
                canvas.width = width;
                canvas.height = height;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = background;
                ctx.fillRect(0, 0, width, height);
                ctx.fillStyle = foreground;
                ctx.font = "bold " + text_height + "px " + font;
                ctx.fillText(text, width / 2, height / 2, width);
                return canvas.toDataURL("image/png");
            }
        });
        Random.extend({
            color: function() {
                var colour = Math.floor(Math.random() * (16 * 16 * 16 * 16 * 16 * 16 - 1)).toString(16);
                colour = "#" + ("000000" + colour).slice(-6);
                return colour;
            }
        });
        Random.extend({
            capitalize: function(word) {
                return (word + "").charAt(0).toUpperCase() + (word + "").substr(1);
            },
            upper: function(str) {
                return (str + "").toUpperCase();
            },
            lower: function(str) {
                return (str + "").toLowerCase();
            },
            pick: function(arr) {
                arr = arr || [];
                return arr[this.natural(0, arr.length - 1)];
            },
            shuffle: function(arr) {
                arr = arr || [];
                var old = arr.slice(0), result = [], index = 0, length = old.length;
                for (var i = 0; i < length; i++) {
                    index = this.natural(0, old.length - 1);
                    result.push(old[index]);
                    old.splice(index, 1);
                }
                return result;
            }
        });
        Random.extend({
            paragraph: function(min, max) {
                var len;
                if (arguments.length === 0) len = Random.natural(3, 7);
                if (arguments.length === 1) len = max = min;
                if (arguments.length === 2) {
                    min = parseInt(min, 10);
                    max = parseInt(max, 10);
                    len = Random.natural(min, max);
                }
                var arr = [];
                for (var i = 0; i < len; i++) {
                    arr.push(Random.sentence());
                }
                return arr.join(" ");
            },
            sentence: function(min, max) {
                var len;
                if (arguments.length === 0) len = Random.natural(12, 18);
                if (arguments.length === 1) len = max = min;
                if (arguments.length === 2) {
                    min = parseInt(min, 10);
                    max = parseInt(max, 10);
                    len = Random.natural(min, max);
                }
                var arr = [];
                for (var i = 0; i < len; i++) {
                    arr.push(Random.word());
                }
                return Random.capitalize(arr.join(" ")) + ".";
            },
            word: function(min, max) {
                var len;
                if (arguments.length === 0) len = Random.natural(3, 10);
                if (arguments.length === 1) len = max = min;
                if (arguments.length === 2) {
                    min = parseInt(min, 10);
                    max = parseInt(max, 10);
                    len = Random.natural(min, max);
                }
                var result = "";
                for (var i = 0; i < len; i++) {
                    result += Random.character("lower");
                }
                return result;
            },
            title: function(min, max) {
                var len, result = [];
                if (arguments.length === 0) len = Random.natural(3, 7);
                if (arguments.length === 1) len = max = min;
                if (arguments.length === 2) {
                    min = parseInt(min, 10);
                    max = parseInt(max, 10);
                    len = Random.natural(min, max);
                }
                for (var i = 0; i < len; i++) {
                    result.push(this.capitalize(this.word()));
                }
                return result.join(" ");
            }
        });
        Random.extend({
            first: function() {
                var names = [ "James", "John", "Robert", "Michael", "William", "David", "Richard", "Charles", "Joseph", "Thomas", "Christopher", "Daniel", "Paul", "Mark", "Donald", "George", "Kenneth", "Steven", "Edward", "Brian", "Ronald", "Anthony", "Kevin", "Jason", "Matthew", "Gary", "Timothy", "Jose", "Larry", "Jeffrey", "Frank", "Scott", "Eric" ].concat([ "Mary", "Patricia", "Linda", "Barbara", "Elizabeth", "Jennifer", "Maria", "Susan", "Margaret", "Dorothy", "Lisa", "Nancy", "Karen", "Betty", "Helen", "Sandra", "Donna", "Carol", "Ruth", "Sharon", "Michelle", "Laura", "Sarah", "Kimberly", "Deborah", "Jessica", "Shirley", "Cynthia", "Angela", "Melissa", "Brenda", "Amy", "Anna" ]);
                return this.pick(names);
            },
            last: function() {
                var names = [ "Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Garcia", "Rodriguez", "Wilson", "Martinez", "Anderson", "Taylor", "Thomas", "Hernandez", "Moore", "Martin", "Jackson", "Thompson", "White", "Lopez", "Lee", "Gonzalez", "Harris", "Clark", "Lewis", "Robinson", "Walker", "Perez", "Hall", "Young", "Allen" ];
                return this.pick(names);
            },
            name: function(middle) {
                return this.first() + " " + (middle ? this.first() + " " : "") + this.last();
            },
            chineseName: function(count) {
                var surnames = "赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦尤许何吕施张孔曹严华金魏陶姜戚谢邹喻柏水窦章云苏潘葛奚范彭郎鲁韦昌马苗凤花方俞任袁柳酆鲍史唐".split("");
                var forenames = "贵福生龙元全国胜学祥才发武新利清飞彬富顺信子杰涛昌成康星光天达安岩中茂进林有坚和彪博绍功松善厚庆磊民友裕河哲江超浩亮政谦亨奇固之轮翰朗伯宏言若鸣朋斌梁栋维启克伦翔旭鹏月莺媛艳瑞凡佳嘉琼勤珍贞莉桂娣叶璧璐娅琦晶妍茜秋珊莎锦黛青倩婷姣婉娴瑾颖露瑶怡婵雁蓓".split("");
                if (typeof count !== "number") {
                    count = Math.random() > .66 ? 2 : 3;
                }
                var surname = this.pick(surnames);
                var forename = "";
                count = count - 1;
                for (var i = 0; i < count; i++) {
                    forename += this.pick(forenames);
                }
                return surname + forename;
            },
            cname: function(count) {
                return this.chineseName(count);
            }
        });
        Random.extend({
            url: function() {
                return "http://" + this.domain() + "/" + this.word();
            },
            domain: function(tld) {
                return this.word() + "." + (tld || this.tld());
            },
            email: function(domain) {
                return this.character("lower") + "." + this.last().toLowerCase() + "@" + this.last().toLowerCase() + "." + this.tld();
            },
            ip: function() {
                return this.natural(0, 255) + "." + this.natural(0, 255) + "." + this.natural(0, 255) + "." + this.natural(0, 255);
            },
            tlds: [ "com", "org", "edu", "gov", "co.uk", "net", "io" ],
            tld: function() {
                return this.pick(this.tlds);
            }
        });
        Random.extend({
            areas: [ "东北", "华北", "华东", "华中", "华南", "西南", "西北" ],
            area: function() {
                return this.pick(this.areas);
            },
            regions: [ "110000 北京市", "120000 天津市", "130000 河北省", "140000 山西省", "150000 内蒙古自治区", "210000 辽宁省", "220000 吉林省", "230000 黑龙江省", "310000 上海市", "320000 江苏省", "330000 浙江省", "340000 安徽省", "350000 福建省", "360000 江西省", "370000 山东省", "410000 河南省", "420000 湖北省", "430000 湖南省", "440000 广东省", "450000 广西壮族自治区", "460000 海南省", "500000 重庆市", "510000 四川省", "520000 贵州省", "530000 云南省", "540000 西藏自治区", "610000 陕西省", "620000 甘肃省", "630000 青海省", "640000 宁夏回族自治区", "650000 新疆维吾尔自治区", "650000 新疆维吾尔自治区", "710000 台湾省", "810000 香港特别行政区", "820000 澳门特别行政区" ],
            region: function() {
                return this.pick(this.regions).split(" ")[1];
            },
            address: function() {},
            city: function() {},
            phone: function() {},
            areacode: function() {},
            street: function() {},
            street_suffixes: function() {},
            street_suffix: function() {},
            states: function() {},
            state: function() {},
            zip: function(len) {
                var zip = "";
                for (var i = 0; i < (len || 6); i++) zip += this.natural(0, 9);
                return zip;
            }
        });
        Random.extend({
            todo: function() {
                return "todo";
            }
        });
        Random.extend({
            d4: function() {
                return this.natural(1, 4);
            },
            d6: function() {
                return this.natural(1, 6);
            },
            d8: function() {
                return this.natural(1, 8);
            },
            d12: function() {
                return this.natural(1, 12);
            },
            d20: function() {
                return this.natural(1, 20);
            },
            d100: function() {
                return this.natural(1, 100);
            },
            guid: function() {
                var pool = "ABCDEF1234567890", guid = this.string(pool, 8) + "-" + this.string(pool, 4) + "-" + this.string(pool, 4) + "-" + this.string(pool, 4) + "-" + this.string(pool, 12);
                return guid;
            },
            id: function() {
                var id, sum = 0, rank = [ "7", "9", "10", "5", "8", "4", "2", "1", "6", "3", "7", "9", "10", "5", "8", "4", "2" ], last = [ "1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2" ];
                id = this.pick(this.regions).split(" ")[0] + this.date("yyyyMMdd") + this.string("number", 3);
                for (var i = 0; i < id.length; i++) {
                    sum += id[i] * rank[i];
                }
                id += last[sum % 11];
                return id;
            },
            autoIncrementInteger: 0,
            increment: function(step) {
                return this.autoIncrementInteger += +step || 1;
            },
            inc: function(step) {
                return this.increment(step);
            }
        });
        return Random;
    }();
    /*! src/mock.js */
    var rkey = /(.+)\|(?:\+(\d+)|([\+\-]?\d+-?[\+\-]?\d*)?(?:\.(\d+-?\d*))?)/, rrange = /([\+\-]?\d+)-?([\+\-]?\d+)?/, rplaceholder = /\\*@([^@#%&()\?\s\/\.]+)(?:\((.*?)\))?/g;
    Mock.extend = Util.extend;
    Mock.mock = function(rurl, rtype, template) {
        if (arguments.length === 1) {
            return Handle.gen(rurl);
        }
        if (arguments.length === 2) {
            template = rtype;
            rtype = undefined;
        }
        Mock._mocked[rurl + (rtype || "")] = {
            rurl: rurl,
            rtype: rtype,
            template: template
        };
        return Mock;
    };
    var Handle = {
        extend: Util.extend
    };
    Handle.rule = function(name) {
        name = (name || "") + "";
        var parameters = (name || "").match(rkey), range = parameters && parameters[3] && parameters[3].match(rrange), min = range && parseInt(range[1], 10), max = range && parseInt(range[2], 10), count = range ? !range[2] && parseInt(range[1], 10) || Random.integer(min, max) : 1, decimal = parameters && parameters[4] && parameters[4].match(rrange), dmin = decimal && parseInt(decimal[1], 10), dmax = decimal && parseInt(decimal[2], 10), dcount = decimal ? !decimal[2] && parseInt(decimal[1], 10) || Random.integer(dmin, dmax) : 0, point = parameters && parameters[4];
        return {
            parameters: parameters,
            range: range,
            min: min,
            max: max,
            count: count,
            decimal: decimal,
            dmin: dmin,
            dmax: dmax,
            dcount: dcount,
            point: point
        };
    };
    Handle.gen = function(template, name, context) {
        name = name = (name || "") + "";
        context = context || {};
        context = {
            path: context.path || [],
            templatePath: context.templatePath || [],
            currentContext: context.currentContext,
            templateCurrentContext: context.templateCurrentContext || template,
            root: context.root,
            templateRoot: context.templateRoot
        };
        var rule = Handle.rule(name);
        var type = Util.type(template);
        if (Handle[type]) {
            return Handle[type]({
                type: type,
                template: template,
                name: name,
                parsedName: name ? name.replace(rkey, "$1") : name,
                rule: rule,
                context: context
            });
        }
        return template;
    };
    Handle.extend({
        array: function(options) {
            var result = [], i, j;
            if (!options.rule.parameters) {
                for (i = 0; i < options.template.length; i++) {
                    options.context.path.push(i);
                    result.push(Handle.gen(options.template[i], i, {
                        currentContext: result,
                        templateCurrentContext: options.template,
                        path: options.context.path
                    }));
                    options.context.path.pop();
                }
            } else {
                if (options.rule.count === 1 && options.template.length > 1) {
                    options.context.path.push(options.name);
                    result = Random.pick(Handle.gen(options.template, undefined, {
                        currentContext: result,
                        templateCurrentContext: options.template,
                        path: options.context.path
                    }));
                    options.context.path.pop();
                } else {
                    for (i = 0; i < options.rule.count; i++) {
                        j = 0;
                        do {
                            result.push(Handle.gen(options.template[j++]));
                        } while (j < options.template.length);
                    }
                }
            }
            return result;
        },
        object: function(options) {
            var result = {}, keys, fnKeys, key, parsedKey, inc, i;
            if (options.rule.min) {
                keys = Util.keys(options.template);
                keys = Random.shuffle(keys);
                keys = keys.slice(0, options.rule.count);
                for (i = 0; i < keys.length; i++) {
                    key = keys[i];
                    parsedKey = key.replace(rkey, "$1");
                    options.context.path.push(parsedKey);
                    result[parsedKey] = Handle.gen(options.template[key], key, {
                        currentContext: result,
                        templateCurrentContext: options.template,
                        path: options.context.path
                    });
                    options.context.path.pop();
                }
            } else {
                keys = [];
                fnKeys = [];
                for (key in options.template) {
                    (typeof options.template[key] === "function" ? fnKeys : keys).push(key);
                }
                keys = keys.concat(fnKeys);
                for (i = 0; i < keys.length; i++) {
                    key = keys[i];
                    parsedKey = key.replace(rkey, "$1");
                    options.context.path.push(parsedKey);
                    result[parsedKey] = Handle.gen(options.template[key], key, {
                        currentContext: result,
                        templateCurrentContext: options.template,
                        path: options.context.path
                    });
                    options.context.path.pop();
                    inc = key.match(rkey);
                    if (inc && inc[2] && Util.type(options.template[key]) === "number") {
                        options.template[key] += parseInt(inc[2], 10);
                    }
                }
            }
            return result;
        },
        number: function(options) {
            var result, parts, i;
            if (options.rule.point) {
                options.template += "";
                parts = options.template.split(".");
                parts[0] = options.rule.range ? options.rule.count : parts[0];
                parts[1] = (parts[1] || "").slice(0, options.rule.dcount);
                for (i = 0; parts[1].length < options.rule.dcount; i++) {
                    parts[1] += Random.character("number");
                }
                result = parseFloat(parts.join("."), 10);
            } else {
                result = options.rule.range && !options.rule.parameters[2] ? options.rule.count : options.template;
            }
            return result;
        },
        "boolean": function(options) {
            var result;
            result = options.rule.parameters ? Random.bool(options.rule.min, options.rule.max, options.template) : options.template;
            return result;
        },
        string: function(options) {
            var result = "", i, placeholders, ph, phed;
            if (options.template.length) {
                for (i = 0; i < options.rule.count; i++) {
                    result += options.template;
                }
                placeholders = result.match(rplaceholder) || [];
                for (i = 0; i < placeholders.length; i++) {
                    ph = placeholders[i];
                    if (/^\\/.test(ph)) {
                        placeholders.splice(i--, 1);
                        continue;
                    }
                    phed = Handle.placeholder(ph, options.context.currentContext, options.context.templateCurrentContext);
                    if (placeholders.length === 1 && ph === result && typeof phed !== typeof result) {
                        result = phed;
                        break;
                    }
                    result = result.replace(ph, phed);
                }
            } else {
                result = options.rule.range ? Random.string(options.rule.count) : options.template;
            }
            return result;
        },
        "function": function(options) {
            return options.template.call(options.context.currentContext);
        }
    });
    Handle.extend({
        _all: function() {
            var re = {};
            for (var key in Random) re[key.toLowerCase()] = key;
            return re;
        },
        placeholder: function(placeholder, obj, templateContext) {
            rplaceholder.exec("");
            var parts = rplaceholder.exec(placeholder), key = parts && parts[1], lkey = key && key.toLowerCase(), okey = this._all()[lkey], params = parts && parts[2] || "";
            try {
                params = eval("(function(){ return [].splice.call(arguments, 0 ) })(" + params + ")");
            } catch (error) {
                params = parts[2].split(/,\s*/);
            }
            if (obj && key in obj) return obj[key];
            if (templateContext && typeof templateContext === "object" && key in templateContext && placeholder !== templateContext[key]) {
                templateContext[key] = Handle.gen(templateContext[key], key, {
                    currentContext: obj,
                    templateCurrentContext: templateContext
                });
                return templateContext[key];
            }
            if (!(key in Random) && !(lkey in Random) && !(okey in Random)) return placeholder;
            for (var i = 0; i < params.length; i++) {
                rplaceholder.exec("");
                if (rplaceholder.test(params[i])) {
                    params[i] = Handle.placeholder(params[i], obj);
                }
            }
            var handle = Random[key] || Random[lkey] || Random[okey];
            switch (Util.type(handle)) {
              case "array":
                return Random.pick(handle);

              case "function":
                var re = handle.apply(Random, params);
                if (re === undefined) re = "";
                return re;
            }
        }
    });
    /*! src/mockjax.js */
    function find(options) {
        for (var sUrlType in Mock._mocked) {
            var item = Mock._mocked[sUrlType];
            if ((!item.rurl || match(item.rurl, options.url)) && (!item.rtype || match(item.rtype, options.type.toLowerCase()))) {
                return item;
            }
        }
        function match(expected, actual) {
            if (Util.type(expected) === "string") {
                return expected === actual;
            }
            if (Util.type(expected) === "regexp") {
                return expected.test(actual);
            }
        }
    }
    function convert(item, options) {
        return Util.isFunction(item.template) ? item.template(options) : Mock.mock(item.template);
    }
    Mock.mockjax = function mockjax(jQuery) {
        function mockxhr() {
            return {
                readyState: 4,
                status: 200,
                statusText: "",
                open: jQuery.noop,
                send: function() {
                    if (this.onload) this.onload();
                },
                setRequestHeader: jQuery.noop,
                getAllResponseHeaders: jQuery.noop,
                getResponseHeader: jQuery.noop,
                statusCode: jQuery.noop,
                abort: jQuery.noop
            };
        }
        function prefilter(options, originalOptions, jqXHR) {
            var item = find(options);
            if (item) {
                options.dataFilter = options.converters["text json"] = options.converters["text jsonp"] = options.converters["text script"] = options.converters["script json"] = function() {
                    return convert(item, options);
                };
                options.xhr = mockxhr;
                if (originalOptions.dataType !== "script") return "json";
            }
        }
        jQuery.ajaxPrefilter("json jsonp script", prefilter);
        return Mock;
    };
    if (typeof jQuery != "undefined") Mock.mockjax(jQuery);
    if (typeof Zepto != "undefined") {
        Mock.mockjax = function(Zepto) {
            var __original_ajax = Zepto.ajax;
            var xhr = {
                readyState: 4,
                responseText: "",
                responseXML: null,
                state: 2,
                status: 200,
                statusText: "success",
                timeoutTimer: null
            };
            Zepto.ajax = function(options) {
                var item = find(options);
                if (item) {
                    var data = convert(item, options);
                    if (options.success) options.success(data, xhr, options);
                    if (options.complete) options.complete(xhr.status, xhr, options);
                    return xhr;
                }
                return __original_ajax.call(Zepto, options);
            };
        };
        Mock.mockjax(Zepto);
    }
    if (typeof KISSY != "undefined" && KISSY.add) {
        Mock.mockjax = function mockjax(KISSY) {
            var _original_ajax = KISSY.io;
            var xhr = {
                readyState: 4,
                responseText: "",
                responseXML: null,
                state: 2,
                status: 200,
                statusText: "success",
                timeoutTimer: null
            };
            KISSY.io = function(options) {
                var item = find(options);
                if (item) {
                    var data = Mock.mock(item.template);
                    if (options.success) options.success(data, xhr, options);
                    if (options.complete) options.complete(xhr.status, xhr, options);
                    return xhr;
                }
                return _original_ajax.apply(this, arguments);
            };
            for (var name in _original_ajax) {
                KISSY.io[name] = _original_ajax[name];
            }
        };
    }
    /*! src/expose.js */
    Mock.Util = Util;
    Mock.Random = Random;
    Mock.heredoc = Util.heredoc;
    if (typeof module === "object" && module.exports) {
        module.exports = Mock;
    } else if (typeof define === "function" && define.amd) {
        define("mock", [], function() {
            return Mock;
        });
        define("mockjs", [], function() {
            return Mock;
        });
    } else if (typeof define === "function" && define.cmd) {
        define(function() {
            return Mock;
        });
    }
    this.Mock = Mock;
    this.Random = Random;
    if (typeof KISSY != "undefined") {
        Util.each([ "mock", "components/mock/", "mock/dist/mock", "gallery/Mock/0.1.9/" ], function register(name) {
            KISSY.add(name, function(S) {
                Mock.mockjax(S);
                return Mock;
            }, {
                requires: [ "ajax" ]
            });
        });
    }
    /*! src/mock4tpl.js */
    (function(undefined) {
        var Mock4Tpl = {
            version: "0.0.1"
        };
        if (!this.Mock) module.exports = Mock4Tpl;
        Mock.tpl = function(input, options, helpers, partials) {
            return Mock4Tpl.mock(input, options, helpers, partials);
        };
        Mock.parse = function(input) {
            return Handlebars.parse(input);
        };
        Mock4Tpl.mock = function(input, options, helpers, partials) {
            helpers = helpers ? Util.extend({}, helpers, Handlebars.helpers) : Handlebars.helpers;
            partials = partials ? Util.extend({}, partials, Handlebars.partials) : Handlebars.partials;
            return Handle.gen(input, null, options, helpers, partials);
        };
        var Handle = {
            debug: Mock4Tpl.debug || false,
            extend: Util.extend
        };
        Handle.gen = function(node, context, options, helpers, partials) {
            if (Util.isString(node)) {
                var ast = Handlebars.parse(node);
                options = Handle.parseOptions(node, options);
                var data = Handle.gen(ast, context, options, helpers, partials);
                return data;
            }
            context = context || [ {} ];
            options = options || {};
            if (this[node.type] === Util.noop) return;
            options.__path = options.__path || [];
            if (Mock4Tpl.debug || Handle.debug) {
                console.log();
                console.group("[" + node.type + "]", JSON.stringify(node));
                console.log("[options]", options.__path.length, JSON.stringify(options));
            }
            var preLength = options.__path.length;
            this[node.type](node, context, options, helpers, partials);
            options.__path.splice(preLength);
            if (Mock4Tpl.debug || Handle.debug) {
                console.groupEnd();
            }
            return context[context.length - 1];
        };
        Handle.parseOptions = function(input, options) {
            var rComment = /<!--\s*\n*Mock\s*\n*([\w\W]+?)\s*\n*-->/g;
            var comments = input.match(rComment), ret = {}, i, ma, option;
            for (i = 0; comments && i < comments.length; i++) {
                rComment.lastIndex = 0;
                ma = rComment.exec(comments[i]);
                if (ma) {
                    option = new Function("return " + ma[1]);
                    option = option();
                    Util.extend(ret, option);
                }
            }
            return Util.extend(ret, options);
        };
        Handle.val = function(name, options, context, def) {
            if (name !== options.__path[options.__path.length - 1]) throw new Error(name + "!==" + options.__path);
            if (Mock4Tpl.debug || Handle.debug) console.log("[options]", name, options.__path);
            if (def !== undefined) def = Mock.mock(def);
            if (options) {
                var mocked = Mock.mock(options);
                if (Util.isString(mocked)) return mocked;
                if (name in mocked) {
                    return mocked[name];
                }
            }
            if (Util.isArray(context[0])) return {};
            return def !== undefined ? def : name || Random.word();
        };
        Handle.program = function(node, context, options, helpers, partials) {
            for (var i = 0; i < node.statements.length; i++) {
                this.gen(node.statements[i], context, options, helpers, partials);
            }
        };
        Handle.mustache = function(node, context, options, helpers, partials) {
            var i, currentContext = context[0], contextLength = context.length;
            if (Util.type(currentContext) === "array") {
                currentContext.push({});
                currentContext = currentContext[currentContext.length - 1];
                context.unshift(currentContext);
            }
            if (node.isHelper || helpers && helpers[node.id.string]) {
                if (node.params.length === 0) {} else {
                    for (i = 0; i < node.params.length; i++) {
                        this.gen(node.params[i], context, options, helpers, partials);
                    }
                }
                if (node.hash) this.gen(node.hash, context, options, helpers, partials);
            } else {
                this.gen(node.id, context, options, helpers, partials);
            }
            if (context.length > contextLength) context.splice(0, context.length - contextLength);
        };
        Handle.block = function(node, context, options, helpers, partials) {
            var parts = node.mustache.id.parts, i, len, cur, val, type, currentContext = context[0], contextLength = context.length;
            if (node.inverse) {}
            if (node.mustache.isHelper || helpers && helpers[node.mustache.id.string]) {
                type = parts[0];
                val = (Helpers[type] || Helpers.custom).apply(this, arguments);
                currentContext = context[0];
            } else {
                for (i = 0; i < parts.length; i++) {
                    options.__path.push(parts[i]);
                    cur = parts[i];
                    val = this.val(cur, options, context, {});
                    currentContext[cur] = Util.isArray(val) && [] || val;
                    type = Util.type(currentContext[cur]);
                    if (type === "object" || type === "array") {
                        currentContext = currentContext[cur];
                        context.unshift(currentContext);
                    }
                }
            }
            if (node.program) {
                if (Util.type(currentContext) === "array") {
                    len = val.length || Random.integer(3, 7);
                    for (i = 0; i < len; i++) {
                        currentContext.push(typeof val[i] !== "undefined" ? val[i] : {});
                        options.__path.push("[]");
                        context.unshift(currentContext[currentContext.length - 1]);
                        this.gen(node.program, context, options, helpers, partials);
                        options.__path.pop();
                        context.shift();
                    }
                } else this.gen(node.program, context, options, helpers, partials);
            }
            if (context.length > contextLength) context.splice(0, context.length - contextLength);
        };
        Handle.hash = function(node, context, options, helpers, partials) {
            var pairs = node.pairs, pair, i, j;
            for (i = 0; i < pairs.length; i++) {
                pair = pairs[i];
                for (j = 1; j < pair.length; j++) {
                    this.gen(pair[j], context, options, helpers, partials);
                }
            }
        };
        Handle.ID = function(node, context, options) {
            var parts = node.parts, i, len, cur, prev, def, val, type, valType, preOptions, currentContext = context[node.depth], contextLength = context.length;
            if (Util.isArray(currentContext)) currentContext = context[node.depth + 1];
            if (!parts.length) {} else {
                for (i = 0, len = parts.length; i < len; i++) {
                    options.__path.push(parts[i]);
                    cur = parts[i];
                    prev = parts[i - 1];
                    preOptions = options[prev];
                    def = i === len - 1 ? currentContext[cur] : {};
                    val = this.val(cur, options, context, def);
                    type = Util.type(currentContext[cur]);
                    valType = Util.type(val);
                    if (type === "undefined") {
                        if (i < len - 1 && valType !== "object" && valType !== "array") {
                            currentContext[cur] = {};
                        } else {
                            currentContext[cur] = Util.isArray(val) && [] || val;
                        }
                    } else {
                        if (i < len - 1 && type !== "object" && type !== "array") {
                            currentContext[cur] = Util.isArray(val) && [] || {};
                        }
                    }
                    type = Util.type(currentContext[cur]);
                    if (type === "object" || type === "array") {
                        currentContext = currentContext[cur];
                        context.unshift(currentContext);
                    }
                }
            }
            if (context.length > contextLength) context.splice(0, context.length - contextLength);
        };
        Handle.partial = function(node, context, options, helpers, partials) {
            var name = node.partialName.name, partial = partials && partials[name], contextLength = context.length;
            if (partial) Handle.gen(partial, context, options, helpers, partials);
            if (context.length > contextLength) context.splice(0, context.length - contextLength);
        };
        Handle.content = Util.noop;
        Handle.PARTIAL_NAME = Util.noop;
        Handle.DATA = Util.noop;
        Handle.STRING = Util.noop;
        Handle.INTEGER = Util.noop;
        Handle.BOOLEAN = Util.noop;
        Handle.comment = Util.noop;
        var Helpers = {};
        Helpers.each = function(node, context, options) {
            var i, len, cur, val, parts, def, type, currentContext = context[0];
            parts = node.mustache.params[0].parts;
            for (i = 0, len = parts.length; i < len; i++) {
                options.__path.push(parts[i]);
                cur = parts[i];
                def = i === len - 1 ? [] : {};
                val = this.val(cur, options, context, def);
                currentContext[cur] = Util.isArray(val) && [] || val;
                type = Util.type(currentContext[cur]);
                if (type === "object" || type === "array") {
                    currentContext = currentContext[cur];
                    context.unshift(currentContext);
                }
            }
            return val;
        };
        Helpers["if"] = Helpers.unless = function(node, context, options) {
            var params = node.mustache.params, i, j, cur, val, parts, def, type, currentContext = context[0];
            for (i = 0; i < params.length; i++) {
                parts = params[i].parts;
                for (j = 0; j < parts.length; j++) {
                    if (i === 0) options.__path.push(parts[j]);
                    cur = parts[j];
                    def = j === parts.length - 1 ? "@BOOL(2,1,true)" : {};
                    val = this.val(cur, options, context, def);
                    if (j === parts.length - 1) {
                        val = val === "true" ? true : val === "false" ? false : val;
                    }
                    currentContext[cur] = Util.isArray(val) ? [] : val;
                    type = Util.type(currentContext[cur]);
                    if (type === "object" || type === "array") {
                        currentContext = currentContext[cur];
                        context.unshift(currentContext);
                    }
                }
            }
            return val;
        };
        Helpers["with"] = function(node, context, options) {
            var i, cur, val, parts, def, currentContext = context[0];
            parts = node.mustache.params[0].parts;
            for (i = 0; i < parts.length; i++) {
                options.__path.push(parts[i]);
                cur = parts[i];
                def = {};
                val = this.val(cur, options, context, def);
                currentContext = currentContext[cur] = val;
                context.unshift(currentContext);
            }
            return val;
        };
        Helpers.log = function() {};
        Helpers.custom = function(node, context, options) {
            var i, len, cur, val, parts, def, type, currentContext = context[0];
            if (node.mustache.params.length === 0) {
                return;
                options.__path.push(node.mustache.id.string);
                cur = node.mustache.id.string;
                def = "@BOOL(2,1,true)";
                val = this.val(cur, options, context, def);
                currentContext[cur] = Util.isArray(val) && [] || val;
                type = Util.type(currentContext[cur]);
                if (type === "object" || type === "array") {
                    currentContext = currentContext[cur];
                    context.unshift(currentContext);
                }
            } else {
                parts = node.mustache.params[0].parts;
                for (i = 0, len = parts.length; i < len; i++) {
                    options.__path.push(parts[i]);
                    cur = parts[i];
                    def = i === len - 1 ? [] : {};
                    val = this.val(cur, options, context, def);
                    currentContext[cur] = Util.isArray(val) && [] || val;
                    type = Util.type(currentContext[cur]);
                    if (type === "object" || type === "array") {
                        currentContext = currentContext[cur];
                        context.unshift(currentContext);
                    }
                }
            }
            return val;
        };
    }).call(this);
    /*! src/mock4xtpl.js */
    (function(undefined) {
        if (typeof KISSY === "undefined") return;
        var Mock4XTpl = {
            debug: false
        };
        var XTemplate;
        KISSY.use("xtemplate", function(S, T) {
            XTemplate = T;
        });
        if (!this.Mock) module.exports = Mock4XTpl;
        Mock.xtpl = function(input, options, helpers, partials) {
            return Mock4XTpl.mock(input, options, helpers, partials);
        };
        Mock.xparse = function(input) {
            return XTemplate.compiler.parse(input);
        };
        Mock4XTpl.mock = function(input, options, helpers, partials) {
            helpers = helpers ? Util.extend({}, helpers, XTemplate.RunTime.commands) : XTemplate.RunTime.commands;
            partials = partials ? Util.extend({}, partials, XTemplate.RunTime.subTpls) : XTemplate.RunTime.subTpls;
            return this.gen(input, null, options, helpers, partials, {});
        };
        Mock4XTpl.parse = function(input) {
            return XTemplate.compiler.parse(input);
        };
        Mock4XTpl.gen = function(node, context, options, helpers, partials, other) {
            if (typeof node === "string") {
                if (Mock4XTpl.debug) {
                    console.log("[tpl    ]\n", node);
                }
                var ast = this.parse(node);
                options = this.parseOptions(node, options);
                var data = this.gen(ast, context, options, helpers, partials, other);
                return data;
            }
            context = context || [ {} ];
            options = options || {};
            node.type = node.type;
            if (this[node.type] === Util.noop) return;
            options.__path = options.__path || [];
            if (Mock4XTpl.debug) {
                console.log();
                console.group("[" + node.type + "]", JSON.stringify(node));
                console.log("[context]", "[before]", context.length, JSON.stringify(context));
                console.log("[options]", "[before]", options.__path.length, JSON.stringify(options));
                console.log("[other  ]", "[before]", JSON.stringify(other));
            }
            var preLength = options.__path.length;
            this[node.type](node, context, options, helpers, partials, other);
            if (Mock4XTpl.debug) {
                console.log("[__path ]", "[after ]", options.__path);
            }
            if (!other.hold || typeof other.hold === "function" && !other.hold(node, options, context)) {
                options.__path.splice(preLength);
            }
            if (Mock4XTpl.debug) {
                console.log("[context]", "[after ]", context.length, JSON.stringify(context));
                console.groupEnd();
            }
            return context[context.length - 1];
        };
        Mock4XTpl.parseOptions = function(input, options) {
            var rComment = /<!--\s*\n*Mock\s*\n*([\w\W]+?)\s*\n*-->/g;
            var comments = input.match(rComment), ret = {}, i, ma, option;
            for (i = 0; comments && i < comments.length; i++) {
                rComment.lastIndex = 0;
                ma = rComment.exec(comments[i]);
                if (ma) {
                    option = new Function("return " + ma[1]);
                    option = option();
                    Util.extend(ret, option);
                }
            }
            return Util.extend(ret, options);
        };
        Mock4XTpl.parseVal = function(expr, object) {
            function queryArray(prop, context) {
                if (typeof context === "object" && prop in context) return [ context[prop] ];
                var ret = [];
                for (var i = 0; i < context.length; i++) {
                    ret.push.apply(ret, query(prop, [ context[i] ]));
                }
                return ret;
            }
            function queryObject(prop, context) {
                if (typeof context === "object" && prop in context) return [ context[prop] ];
                var ret = [];
                for (var key in context) {
                    ret.push.apply(ret, query(prop, [ context[key] ]));
                }
                return ret;
            }
            function query(prop, set) {
                var ret = [];
                for (var i = 0; i < set.length; i++) {
                    if (typeof set[i] !== "object") continue;
                    if (prop in set[i]) ret.push(set[i][prop]); else {
                        ret.push.apply(ret, Util.isArray(set[i]) ? queryArray(prop, set[i]) : queryObject(prop, set[i]));
                    }
                }
                return ret;
            }
            function parse(expr, context) {
                var parts = typeof expr === "string" ? expr.split(".") : expr.slice(0), set = [ context ];
                while (parts.length) {
                    set = query(parts.shift(), set);
                }
                return set;
            }
            return parse(expr, object);
        };
        Mock4XTpl.val = function(name, options, context, def) {
            if (name !== options.__path[options.__path.length - 1]) throw new Error(name + "!==" + options.__path);
            if (def !== undefined) def = Mock.mock(def);
            if (options) {
                var mocked = Mock.mock(options);
                if (Util.isString(mocked)) return mocked;
                var ret = Mock4XTpl.parseVal(options.__path, mocked);
                if (ret.length > 0) return ret[0];
                if (name in mocked) {
                    return mocked[name];
                }
            }
            if (Util.isArray(context[0])) return {};
            return def !== undefined ? def : name;
        };
        Mock4XTpl.program = function(node, context, options, helpers, partials, other) {
            for (var i = 0; i < node.statements.length; i++) {
                this.gen(node.statements[i], context, options, helpers, partials, other);
            }
            for (var j = 0; node.inverse && j < node.inverse.length; j++) {
                this.gen(node.inverse[j], context, options, helpers, partials, other);
            }
        };
        Mock4XTpl.block = function(node, context, options, helpers, partials, other) {
            var contextLength = context.length;
            this.gen(node.tpl, context, options, helpers, partials, Util.extend({}, other, {
                def: {},
                hold: true
            }));
            var currentContext = context[0], mocked, i, len;
            if (Util.type(currentContext) === "array") {
                mocked = this.val(options.__path[options.__path.length - 1], options, context);
                len = mocked && mocked.length || Random.integer(3, 7);
                for (i = 0; i < len; i++) {
                    currentContext.push(mocked && mocked[i] !== undefined ? mocked[i] : {});
                    options.__path.push(i);
                    context.unshift(currentContext[currentContext.length - 1]);
                    this.gen(node.program, context, options, helpers, partials, other);
                    options.__path.pop();
                    context.shift();
                }
            } else this.gen(node.program, context, options, helpers, partials, other);
            if (!other.hold || typeof other.hold === "function" && !other.hold(node, options, context)) {
                context.splice(0, context.length - contextLength);
            }
        };
        Mock4XTpl.tpl = function(node, context, options, helpers, partials, other) {
            if (node.params && node.params.length) {
                other = Util.extend({}, other, {
                    def: {
                        each: [],
                        "if": "@BOOL(2,1,true)",
                        unless: "@BOOL(2,1,false)",
                        "with": {}
                    }[node.path.string],
                    hold: {
                        each: true,
                        "if": function(_, __, ___, name, value) {
                            return typeof value === "object";
                        },
                        unless: function(_, __, ___, name, value) {
                            return typeof value === "object";
                        },
                        "with": true,
                        include: false
                    }[node.path.string]
                });
                for (var i = 0, input; i < node.params.length; i++) {
                    if (node.path.string === "include") {
                        input = partials && partials[node.params[i].value];
                    } else input = node.params[i];
                    if (input) this.gen(input, context, options, helpers, partials, other);
                }
                if (node.hash) {
                    this.gen(node.hash, context, options, helpers, partials, other);
                }
            } else {
                this.gen(node.path, context, options, helpers, partials, other);
            }
        };
        Mock4XTpl.tplExpression = function(node, context, options, helpers, partials, other) {
            this.gen(node.expression, context, options, helpers, partials, other);
        };
        Mock4XTpl.content = Util.noop;
        Mock4XTpl.unaryExpression = Util.noop;
        Mock4XTpl.multiplicativeExpression = Mock4XTpl.additiveExpression = function(node, context, options, helpers, partials, other) {
            this.gen(node.op1, context, options, helpers, partials, Util.extend({}, other, {
                def: function() {
                    return node.op2.type === "number" ? node.op2.value.indexOf(".") > -1 ? Random.float(-Math.pow(10, 10), Math.pow(10, 10), 1, Math.pow(10, 6)) : Random.integer() : undefined;
                }()
            }));
            this.gen(node.op2, context, options, helpers, partials, Util.extend({}, other, {
                def: function() {
                    return node.op1.type === "number" ? node.op1.value.indexOf(".") > -1 ? Random.float(-Math.pow(10, 10), Math.pow(10, 10), 1, Math.pow(10, 6)) : Random.integer() : undefined;
                }()
            }));
        };
        Mock4XTpl.relationalExpression = function(node, context, options, helpers, partials, other) {
            this.gen(node.op1, context, options, helpers, partials, other);
            this.gen(node.op2, context, options, helpers, partials, other);
        };
        Mock4XTpl.equalityExpression = Util.noop;
        Mock4XTpl.conditionalAndExpression = Util.noop;
        Mock4XTpl.conditionalOrExpression = Util.noop;
        Mock4XTpl.string = Util.noop;
        Mock4XTpl.number = Util.noop;
        Mock4XTpl.boolean = Util.noop;
        Mock4XTpl.hash = function(node, context, options, helpers, partials, other) {
            var pairs = node.value, key;
            for (key in pairs) {
                this.gen(pairs[key], context, options, helpers, partials, other);
            }
        };
        Mock4XTpl.id = function(node, context, options, helpers, partials, other) {
            var contextLength = context.length;
            var parts = node.parts, currentContext = context[node.depth], i, len, cur, def, val;
            function fix(currentContext, index, length, name, val) {
                var type = Util.type(currentContext[name]), valType = Util.type(val);
                val = val === "true" ? true : val === "false" ? false : val;
                if (type === "undefined") {
                    if (index < length - 1 && !Util.isObjectOrArray(val)) {
                        currentContext[name] = {};
                    } else {
                        currentContext[name] = Util.isArray(val) && [] || val;
                    }
                } else {
                    if (index < length - 1 && type !== "object" && type !== "array") {
                        currentContext[name] = Util.isArray(val) && [] || {};
                    } else {
                        if (type !== "object" && type !== "array" && valType !== "object" && valType !== "array") {
                            currentContext[name] = val;
                        }
                    }
                }
                return currentContext[name];
            }
            if (Util.isArray(currentContext)) currentContext = context[node.depth + 1];
            for (i = 0, len = parts.length; i < len; i++) {
                if (i === 0 && parts[i] === "this") continue;
                if (/^(xindex|xcount|xkey)$/.test(parts[i])) continue;
                if (i === 0 && len === 1 && parts[i] in helpers) continue;
                options.__path.push(parts[i]);
                cur = parts[i];
                def = i === len - 1 ? other.def !== undefined ? other.def : context[0][cur] : {};
                val = this.val(cur, options, context, def);
                if (Mock4XTpl.debug) {
                    console.log("[def    ]", JSON.stringify(def));
                    console.log("[val    ]", JSON.stringify(val));
                }
                val = fix(currentContext, i, len, cur, val);
                if (Util.isObjectOrArray(currentContext[cur])) {
                    context.unshift(currentContext = currentContext[cur]);
                }
            }
            if (!other.hold || typeof other.hold === "function" && !other.hold(node, options, context, cur, val)) {
                context.splice(0, context.length - contextLength);
            }
        };
    }).call(this);
}).call(this);
          }).call(window);
        
(function() {
  "use strict";
  class MockManager {
    constructor() {
      this.rules =  new Map();
      this.storageKey = "mock-monkey-rules";
      this.loadFromStorage();
    }
    /**
     * Add Mock rule
     */
    add(params) {
      const id = this.generateId();
      const rule = {
        id,
        pattern: params.pattern,
        response: params.response,
        options: params.options || {},
        enabled: true,
        createdAt: Date.now()
      };
      this.rules.set(id, rule);
      this.saveToStorage();
      console.log(`[MockMonkey] Rule added: ${this.patternToString(params.pattern)}`);
      return rule;
    }
    /**
     * Update Mock rule
     */
    update(id, updates) {
      const rule = this.rules.get(id);
      if (!rule) return false;
      const updated = { ...rule, ...updates };
      this.rules.set(id, updated);
      this.saveToStorage();
      return true;
    }
    /**
     * Remove Mock rule
     */
    remove(id) {
      const result = this.rules.delete(id);
      if (result) {
        this.saveToStorage();
      }
      return result;
    }
    /**
     * Remove rule by pattern
     */
    removeByPattern(pattern) {
      const patternStr = this.patternToString(pattern);
      for (const [id, rule] of this.rules) {
        if (this.patternToString(rule.pattern) === patternStr) {
          return this.remove(id);
        }
      }
      return false;
    }
    /**
     * Clear all rules
     */
    clear() {
      this.rules.clear();
      this.saveToStorage();
    }
    /**
     * Get all rules
     */
    getAll() {
      return Array.from(this.rules.values());
    }
    /**
     * Get single rule
     */
    get(id) {
      return this.rules.get(id);
    }
    /**
     * Find matching Mock rule
     */
    findMatch(url) {
      for (const rule of this.rules.values()) {
        if (!rule.enabled) continue;
        if (rule.pattern instanceof RegExp) {
          if (rule.pattern.test(url)) return rule;
        } else if (url.includes(rule.pattern)) {
          return rule;
        }
      }
      return null;
    }
    /**
     * Enable/disable rule
     */
    toggle(id) {
      const rule = this.rules.get(id);
      if (!rule) return false;
      rule.enabled = !rule.enabled;
      this.saveToStorage();
      return rule.enabled;
    }
    /**
     * Generate unique ID
     */
    generateId() {
      return `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Convert pattern to string
     */
    patternToString(pattern) {
      return pattern instanceof RegExp ? pattern.toString() : pattern;
    }
    /**
     * Save to localStorage
     */
    saveToStorage() {
      try {
        const data = Array.from(this.rules.entries());
        localStorage.setItem(this.storageKey, JSON.stringify(data));
      } catch (e) {
        console.warn("[MockMonkey] Failed to save rules:", e);
      }
    }
    /**
     * Load from localStorage
     */
    loadFromStorage() {
      try {
        const stored = localStorage.getItem(this.storageKey);
        if (!stored) return;
        const data = JSON.parse(stored);
        for (const [id, rule] of data) {
          if (typeof rule.pattern === "string" && rule.pattern.startsWith("/")) {
            try {
              const match = rule.pattern.match(/^\/(.+)\/([gimuy]*)$/);
              if (match) {
                rule.pattern = new RegExp(match[1], match[2]);
              }
            } catch (e) {
            }
          }
          this.rules.set(id, rule);
        }
        console.log(`[MockMonkey] Loaded ${this.rules.size} rules`);
      } catch (e) {
        console.warn("[MockMonkey] Failed to load rules:", e);
      }
    }
  }
  class RequestRecorder {
    constructor() {
      this.requests = [];
      this.maxRecords = 500;
      this.listeners =  new Set();
    }
    /**
     * Add request record
     */
    addRequest(request) {
      this.requests.unshift(request);
      if (this.requests.length > this.maxRecords) {
        this.requests = this.requests.slice(0, this.maxRecords);
      }
      this.notifyListeners();
    }
    /**
     * Update request record (for updating response info, etc.)
     */
    updateRequest(id, updates) {
      const index = this.requests.findIndex((r) => r.id === id);
      if (index !== -1) {
        this.requests[index] = { ...this.requests[index], ...updates };
        this.notifyListeners();
      }
    }
    /**
     * Get all request records
     */
    getRequests() {
      return [...this.requests];
    }
    /**
     * Clear all records
     */
    clear() {
      this.requests = [];
      this.notifyListeners();
    }
    /**
     * Subscribe to request changes
     */
    subscribe(listener) {
      this.listeners.add(listener);
      return () => {
        this.listeners.delete(listener);
      };
    }
    /**
     * Notify all listeners
     */
    notifyListeners() {
      this.listeners.forEach((listener) => listener([...this.requests]));
    }
    /**
     * Generate unique ID
     */
    static generateId() {
      return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }
  class Interceptor {
    constructor(manager, recorder) {
      this.manager = manager;
      this.recorder = recorder;
      this.xhrOpen = XMLHttpRequest.prototype.open;
      this.xhrSend = XMLHttpRequest.prototype.send;
      this.originalFetch = window.fetch.bind(window);
    }
    /**
     * Convert relative URL to full URL
     */
    normalizeUrl(url) {
      try {
        if (url.startsWith("http://") || url.startsWith("https://")) {
          return url;
        }
        return new URL(url, window.location.href).href;
      } catch {
        return url;
      }
    }
    /**
     * Start interception
     */
    start() {
      this.interceptXHR();
      this.interceptFetch();
      console.log("[MockMonkey] 拦截器已启动");
    }
    /**
     * Stop interception
     */
    stop() {
      XMLHttpRequest.prototype.open = this.xhrOpen;
      XMLHttpRequest.prototype.send = this.xhrSend;
      window.fetch = this.originalFetch;
      console.log("[MockMonkey] 拦截器已停止");
    }
    /**
     * Intercept XMLHttpRequest
     */
    interceptXHR() {
      const self = this;
      XMLHttpRequest.prototype.open = function(method, url, async, username, password) {
        this._mockMethod = method;
        this._mockUrl = url.toString();
        this._mockRequestId = RequestRecorder.generateId();
        this._mockRequestTime = Date.now();
        return self.xhrOpen.call(this, method, url, async ?? true, username, password);
      };
      XMLHttpRequest.prototype.send = function(body) {
        const xhr = this;
        const rawUrl = xhr._mockUrl;
        const method = xhr._mockMethod;
        const requestId = xhr._mockRequestId;
        const requestTime = xhr._mockRequestTime;
        const url = self.normalizeUrl(rawUrl);
        self.recorder.addRequest({
          id: requestId,
          method,
          url,
          body: body?.toString(),
          type: "XHR",
          mocked: false,
          timestamp: requestTime
        });
        const rule = self.manager.findMatch(url);
        if (rule) {
          console.log(`[MockMonkey] XHR 拦截: ${method} ${url}`);
          self.recorder.updateRequest(requestId, {
            mocked: true,
            ruleId: rule.id,
            status: rule.options.status || 200,
            response: rule.response,
            duration: rule.options.delay || 0
          });
          self.mockXHR(this, rule, requestId);
          return;
        }
        const originalOnReadyStateChange = xhr.onreadystatechange;
        xhr.onreadystatechange = function(ev) {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            const duration = Date.now() - requestTime;
            self.recorder.updateRequest(requestId, {
              status: xhr.status,
              duration
            });
          }
          if (originalOnReadyStateChange) {
            return originalOnReadyStateChange.call(this, ev);
          }
        };
        const originalOnLoad = xhr.onload;
        xhr.onload = function(ev) {
          const duration = Date.now() - requestTime;
          let response;
          try {
            response = JSON.parse(xhr.responseText);
          } catch {
            response = xhr.responseText;
          }
          self.recorder.updateRequest(requestId, {
            status: xhr.status,
            response,
            duration
          });
          if (originalOnLoad) {
            return originalOnLoad.call(this, ev);
          }
        };
        return self.xhrSend.call(this, body);
      };
    }
    /**
     * Intercept Fetch
     */
    interceptFetch() {
      const self = this;
      window.fetch = function(input, init) {
        const rawUrl = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
        const url = self.normalizeUrl(rawUrl);
        const requestId = RequestRecorder.generateId();
        const requestTime = Date.now();
        const method = init?.method || "GET";
        self.recorder.addRequest({
          id: requestId,
          method,
          url,
          body: init?.body?.toString(),
          type: "Fetch",
          mocked: false,
          timestamp: requestTime
        });
        const rule = self.manager.findMatch(url);
        if (rule) {
          console.log(`[MockMonkey] Fetch 拦截: ${method} ${url}`);
          self.recorder.updateRequest(requestId, {
            mocked: true,
            ruleId: rule.id,
            status: rule.options.status || 200,
            response: rule.response,
            duration: rule.options.delay || 0
          });
          return self.mockFetch(rule, requestId);
        }
        return self.originalFetch(input, init).then((response) => {
          const duration = Date.now() - requestTime;
          const clonedResponse = response.clone();
          clonedResponse.json().catch(() => clonedResponse.text()).then((data) => {
            self.recorder.updateRequest(requestId, {
              status: response.status,
              response: data,
              duration
            });
          }).catch(() => {
            self.recorder.updateRequest(requestId, {
              status: response.status,
              duration
            });
          });
          return response;
        });
      };
    }
    /**
     * Mock XHR response
     */
    mockXHR(xhr, rule, requestId) {
      const delay = rule.options.delay || 0;
      const requestTime = Date.now();
      setTimeout(() => {
        const duration = Date.now() - requestTime;
        let mockResponse = rule.response;
        if (typeof window !== "undefined" && window.Mock) {
          try {
            const originalResponse = JSON.stringify(rule.response);
            mockResponse = window.Mock.mock(rule.response);
            const mockResponseStr = JSON.stringify(mockResponse);
            if (originalResponse !== mockResponseStr) {
              console.log("[MockMonkey] Mock.js 已解析模板");
            }
          } catch (e) {
            console.warn("[MockMonkey] Mock.js 解析失败，使用原始响应:", e);
            mockResponse = rule.response;
          }
        } else {
          console.warn("[MockMonkey] Mock.js 未加载，占位符将不会被替换");
        }
        Object.defineProperty(xhr, "readyState", {
          value: 4,
          writable: false,
          configurable: true
        });
        Object.defineProperty(xhr, "status", {
          value: rule.options.status || 200,
          writable: false,
          configurable: true
        });
        const responseText = JSON.stringify(mockResponse);
        Object.defineProperty(xhr, "responseText", {
          value: responseText,
          writable: false,
          configurable: true
        });
        Object.defineProperty(xhr, "response", {
          value: responseText,
          writable: false,
          configurable: true
        });
        this.recorder.updateRequest(requestId, { duration, response: mockResponse });
        const isSuccess = (rule.options.status || 200) >= 200 && (rule.options.status || 200) < 300;
        const eventType = isSuccess ? "load" : "error";
        xhr.dispatchEvent(new Event(eventType));
        xhr.dispatchEvent(new Event("loadend"));
        if (xhr.onreadystatechange) {
          xhr.onreadystatechange(new Event("readystatechange"));
        }
      }, delay);
    }
    /**
     * Mock Fetch response
     */
    mockFetch(rule, requestId) {
      return new Promise((resolve) => {
        const delay = rule.options.delay || 0;
        const requestTime = Date.now();
        setTimeout(() => {
          const duration = Date.now() - requestTime;
          const headers = rule.options.headers || { "Content-Type": "application/json" };
          let mockResponse = rule.response;
          if (typeof window !== "undefined" && window.Mock) {
            try {
              const originalResponse = JSON.stringify(rule.response);
              mockResponse = window.Mock.mock(rule.response);
              const mockResponseStr = JSON.stringify(mockResponse);
              if (originalResponse !== mockResponseStr) {
                console.log("[MockMonkey] Mock.js 已解析模板");
              }
            } catch (e) {
              console.warn("[MockMonkey] Mock.js 解析失败，使用原始响应:", e);
              mockResponse = rule.response;
            }
          } else {
            console.warn("[MockMonkey] Mock.js 未加载，占位符将不会被替换");
          }
          this.recorder.updateRequest(requestId, { duration, response: mockResponse });
          resolve(
            new Response(JSON.stringify(mockResponse), {
              status: rule.options.status || 200,
              headers
            })
          );
        }, delay);
      });
    }
  }
  const translations = {
    zh: {
      common: {
        add: "添加",
        edit: "编辑",
        delete: "删除",
        enable: "启用",
        disable: "禁用",
        cancel: "取消",
        save: "保存",
        details: "详情",
        confirmDelete: "确定要删除这条规则吗？"
      },
      tabs: {
        rules: "规则",
        add: "添加",
        network: "网络"
      },
      rules: {
        count: "条规则",
        export: "导出",
        import: "导入",
        empty: "暂无 Mock 规则",
        startConfig: '点击<span class="mm-link" data-action="go-to-add">"添加规则"</span>开始配置',
        status: "状态",
        delay: "延迟"
      },
      form: {
        urlPattern: "URL 模式 *",
        urlPatternHint: "支持字符串或正则表达式（格式：/pattern/flags）",
        responseData: "响应数据 (JSON) *",
        responseDataPlaceholder: '{"code": 200, "data": {}}',
        delay: "延迟 (ms)",
        status: "状态码",
        addRule: "添加规则",
        saveRule: "保存规则",
        cancelEdit: "取消",
        importError: "导入文件格式错误：必须是数组",
        jsonError: "响应数据 JSON 格式错误",
        regexError: "正则表达式格式错误"
      },
      network: {
        count: "条请求",
        clear: "清空",
        empty: "暂无网络请求",
        emptyHint: "发起请求后会在此显示",
        createMock: "创建 Mock 规则",
        responseData: "响应数据"
      }
    },
    en: {
      common: {
        add: "Add",
        edit: "Edit",
        delete: "Delete",
        enable: "Enable",
        disable: "Disable",
        cancel: "Cancel",
        save: "Save",
        details: "Details",
        confirmDelete: "Are you sure you want to delete this rule?"
      },
      tabs: {
        rules: "Rules",
        add: "Add",
        network: "Network"
      },
      rules: {
        count: "rules",
        export: "Export",
        import: "Import",
        empty: "No Mock rules yet",
        startConfig: 'Click <span class="mm-link" data-action="go-to-add">"Add Rule"</span> to start',
        status: "Status",
        delay: "Delay"
      },
      form: {
        urlPattern: "URL Pattern *",
        urlPatternHint: "Support string or regex (format: /pattern/flags)",
        responseData: "Response Data (JSON) *",
        responseDataPlaceholder: '{"code": 200, "data": {}}',
        delay: "Delay (ms)",
        status: "Status Code",
        addRule: "Add Rule",
        saveRule: "Save Rule",
        cancelEdit: "Cancel",
        importError: "Import file format error: must be an array",
        jsonError: "Response data JSON format error",
        regexError: "Regex format error"
      },
      network: {
        count: "requests",
        clear: "Clear",
        empty: "No network requests yet",
        emptyHint: "Requests will appear here",
        createMock: "Create Mock",
        responseData: "Response Data"
      }
    }
  };
  class I18n {
    constructor() {
      this.STORAGE_KEY = "mock-monkey-language";
      this._language = this.loadLanguage();
    }
    /**
     * Get singleton instance
     */
    static getInstance() {
      if (!I18n.instance) {
        I18n.instance = new I18n();
      }
      return I18n.instance;
    }
    /**
     * Get current language
     */
    getLanguage() {
      return this._language;
    }
    /**
     * Set language and save to localStorage
     */
    setLanguage(lang) {
      this._language = lang;
      this.saveLanguage(lang);
    }
    /**
     * Toggle language between zh and en
     */
    toggleLanguage() {
      this._language = this._language === "zh" ? "en" : "zh";
      this.saveLanguage(this._language);
    }
    /**
     * Get translation text by key path
     * Supports nested key path like 'common.add', 'tabs.rules'
     */
    t(key) {
      const keys = key.split(".");
      let value = translations[this._language];
      for (const k of keys) {
        if (value && typeof value === "object" && k in value) {
          value = value[k];
        } else {
          console.warn(`[MockMonkey i18n] Translation key not found: ${key}`);
          return key;
        }
      }
      return typeof value === "string" ? value : key;
    }
    /**
     * Load language from localStorage
     */
    loadLanguage() {
      try {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved === "zh" || saved === "en") {
          return saved;
        }
      } catch (e) {
        console.warn("[MockMonkey i18n] Failed to load language from localStorage:", e);
      }
      return "zh";
    }
    /**
     * Save language to localStorage
     */
    saveLanguage(lang) {
      try {
        localStorage.setItem(this.STORAGE_KEY, lang);
      } catch (e) {
        console.warn("[MockMonkey i18n] Failed to save language to localStorage:", e);
      }
    }
  }
  class Panel {
    // i18n instance
    constructor(onAddRule, onUpdateRule, onCreateFromRequest) {
      this.onAddRule = onAddRule;
      this.onUpdateRule = onUpdateRule;
      this.onCreateFromRequest = onCreateFromRequest;
      this.container = null;
      this.shadowRoot = null;
      this.isVisible = false;
      this.networkRequests = [];
      this.toggleButton = null;
      this.isDragging = false;
      this.hasMoved = false;
      this.dragStartTime = 0;
      this.dragOffset = { x: 0, y: 0 };
      this.buttonPosition = { x: 20, y: 20 };
      this.currentRules = [];
      this.panelElement = null;
      this.isPanelDragging = false;
      this.panelHasMoved = false;
      this.panelDragStartTime = 0;
      this.panelDragOffset = { x: 0, y: 0 };
      this.panelPosition = null;
      this.editingRuleId = null;
      this.handleMouseMove = (e) => {
        if (!this.toggleButton) return;
        const btn = this.toggleButton;
        const rect = btn.getBoundingClientRect();
        let newX = e.clientX - this.dragOffset.x;
        let newY = e.clientY - this.dragOffset.y;
        const currentRight = window.innerWidth - rect.left - rect.width;
        const currentBottom = window.innerHeight - rect.top - rect.height;
        const newRight = window.innerWidth - newX - rect.width;
        const newBottom = window.innerHeight - newY - rect.height;
        if (Math.abs(newRight - currentRight) > 3 || Math.abs(newBottom - currentBottom) > 3) {
          this.hasMoved = true;
          this.isDragging = true;
        }
        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height;
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));
        btn.style.left = `${newX}px`;
        btn.style.top = `${newY}px`;
        btn.style.right = "auto";
        btn.style.bottom = "auto";
      };
      this.handleMouseUp = () => {
        if (!this.toggleButton) return;
        const btn = this.toggleButton;
        btn.style.transition = "all 0.2s";
        document.removeEventListener("mousemove", this.handleMouseMove);
        document.removeEventListener("mouseup", this.handleMouseUp);
        setTimeout(() => {
          this.isDragging = false;
        }, 100);
        this.saveButtonPosition();
      };
      this.handlePanelMouseMove = (e) => {
        if (!this.panelElement) return;
        const panel = this.panelElement;
        let newX = e.clientX - this.panelDragOffset.x;
        let newY = e.clientY - this.panelDragOffset.y;
        const rect = panel.getBoundingClientRect();
        if (Math.abs(newX - rect.left) > 3 || Math.abs(newY - rect.top) > 3) {
          this.panelHasMoved = true;
          this.isPanelDragging = true;
        }
        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height;
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));
        panel.style.left = `${newX}px`;
        panel.style.top = `${newY}px`;
        panel.style.transform = "none";
        this.panelPosition = { left: newX, top: newY };
      };
      this.handlePanelMouseUp = () => {
        if (!this.panelElement) return;
        const panel = this.panelElement;
        panel.style.transition = "";
        document.removeEventListener("mousemove", this.handlePanelMouseMove);
        document.removeEventListener("mouseup", this.handlePanelMouseUp);
        setTimeout(() => {
          this.isPanelDragging = false;
        }, 100);
        this.savePanelPosition();
      };
      this.i18n = I18n.getInstance();
      this.loadButtonPosition();
    }
    /**
     * Initialize panel
     */
    init() {
      this.container = document.createElement("div");
      this.container.id = "mock-monkey-container";
      this.shadowRoot = this.container.attachShadow({ mode: "open" });
      this.attachStyles();
      this.createContent();
      this.bindEvents();
      this.ensureBody().then(() => {
        if (document.body && this.container) {
          document.body.appendChild(this.container);
          console.log("[MockMonkey] 面板容器已添加到页面");
        } else {
          console.error("[MockMonkey] document.body 仍然不存在");
        }
        this.createToggleButton();
      });
    }
    /**
     * Create container
     */
    createContainer() {
    }
    /**
     * Attach styles
     */
    attachStyles() {
      if (!this.shadowRoot) return;
      const style = document.createElement("style");
      style.textContent = this.getStyles();
      this.shadowRoot.appendChild(style);
    }
    /**
     * Create panel content
     */
    createContent() {
      if (!this.shadowRoot) return;
      const panel = document.createElement("div");
      panel.className = "mm-panel";
      this.loadPanelPosition();
      if (this.panelPosition) {
        panel.style.left = `${this.panelPosition.left}px`;
        panel.style.top = `${this.panelPosition.top}px`;
        panel.style.transform = "none";
      }
      this.panelElement = panel;
      panel.innerHTML = `
      <div class="mm-header" data-drag-handle="panel">
        <h2 class="mm-title">MockMonkey</h2>
        <div class="mm-header-actions">
          <button class="mm-lang-btn" data-action="toggle-lang" title="${this.i18n.getLanguage() === "zh" ? "Switch to English" : "切换中文"}">${this.i18n.getLanguage() === "zh" ? "EN" : "中"}</button>
          <button class="mm-close-btn" data-action="close">×</button>
        </div>
      </div>

      <div class="mm-tabs">
        <button class="mm-tab mm-tab--active" data-tab="rules">${this.i18n.t("tabs.rules")}</button>
        <button class="mm-tab" data-tab="add" data-tab-label>${this.i18n.t("tabs.add")}</button>
        <button class="mm-tab" data-tab="requests">${this.i18n.t("tabs.network")}</button>
      </div>

      <div class="mm-content">
        <div class="mm-tab-content mm-tab-content--active" data-content="rules">
          <div class="mm-rules-header">
            <span class="mm-rules-count">0 ${this.i18n.t("rules.count")}</span>
            <button class="mm-btn mm-btn--small" data-action="export">${this.i18n.t("rules.export")}</button>
            <button class="mm-btn mm-btn--small" data-action="import">${this.i18n.t("rules.import")}</button>
          </div>
          <div class="mm-rules-list" data-rules-list></div>
        </div>

        <div class="mm-tab-content" data-content="add">
          <form class="mm-form" data-action="add-rule">
            <input type="hidden" name="editing-id" value="">
            <div class="mm-form-group">
              <label class="mm-label">${this.i18n.t("form.urlPattern")}</label>
              <input class="mm-input" name="pattern" placeholder="/api/user" required>
              <span class="mm-hint">${this.i18n.t("form.urlPatternHint")}</span>
            </div>

            <div class="mm-form-group">
              <label class="mm-label">${this.i18n.t("form.responseData")}</label>
              <textarea class="mm-textarea" name="response" rows="6" placeholder='${this.i18n.t("form.responseDataPlaceholder")}' required></textarea>
            </div>

            <div class="mm-form-row">
              <div class="mm-form-group">
                <label class="mm-label">${this.i18n.t("form.delay")}</label>
                <input class="mm-input" type="number" name="delay" value="0" min="0">
              </div>
              <div class="mm-form-group">
                <label class="mm-label">${this.i18n.t("form.status")}</label>
                <input class="mm-input" type="number" name="status" value="200" min="100" max="599">
              </div>
            </div>

            <div class="mm-form-actions">
              <button type="button" class="mm-btn" data-action="cancel-edit" style="display: none;">${this.i18n.t("form.cancelEdit")}</button>
              <button type="submit" class="mm-btn mm-btn--primary" data-submit-btn>${this.i18n.t("form.addRule")}</button>
            </div>
          </form>
        </div>

        <div class="mm-tab-content" data-content="requests">
          <div class="mm-rules-header">
            <span class="mm-rules-count">0 ${this.i18n.t("network.count")}</span>
            <button class="mm-btn mm-btn--small" data-action="clear-requests">${this.i18n.t("network.clear")}</button>
          </div>
          <div class="mm-requests-list" data-requests-list></div>
        </div>
      </div>

      <input type="file" class="mm-hidden" data-action="import-file" accept=".json">
    `;
      this.shadowRoot.appendChild(panel);
    }
    /**
     * Create toggle button
     */
    createToggleButton() {
      this.ensureBody().then(() => {
        const btn = document.createElement("button");
        btn.className = "mm-toggle-btn";
        btn.innerHTML = `<svg width="32" height="32" viewBox="0 0 1100 1100" xmlns="http://www.w3.org/2000/svg"><path d="m734,63c-5.156,8.9192 -13.25,16.4694 -21,23.1304c-22.133,19.0216 -48.605,30.9516 -77,37.0796c-40.959,8.839 -82.535,6.04 -124,8.879c-32.995,2.26 -67.021,9.977 -98,21.441c-83.504,30.9 -152.371,96.289 -190.219,176.47c-9.231,19.555 -16.304,40.942 -21.13,62c-1.589,6.933 -3.039,13.985 -4.216,21c-0.512,3.05 -0.375,7.012 -2.373,9.566c-3.383,4.322 -12.27,2.14 -17.062,2.604c-13.745,1.33 -28.11,5.742 -41,10.511c-34.217,12.662 -64.4954,37.825 -85.5725,67.319c-40.9414,57.29 -47.57838,137.153 -18.1181,201c14.1931,30.76 37.1687,57.904 64.6906,77.573c22.04,15.75 48.304,28.971 75,34.423c21.891,4.471 43.785,4.004 66,4.004c-2.139,-11.52 0,-24.236 0,-36c0,-23.361 -0.587,-46.623 -0.015,-70c0.62,-25.3 0.015,-50.692 0.015,-76c0,-15.698 -0.633,-31.499 2.261,-47c6.11,-32.735 22.747,-62.021 46.739,-84.961c50.245,-48.041 131.473,-56.451 189,-16.003c22.522,15.836 40.353,38.007 51.769,62.964c6.884,15.049 13.513,33.319 14.231,50c2.557,-4.808 2.485,-10.729 3.665,-16c1.73,-7.725 4.32,-15.564 7.03,-23c8.175,-22.426 22.88,-43.679 40.305,-59.911c43.318,-40.351 109.9,-51.404 164,-26.994c21.834,9.851 40.846,25.249 55.8,43.905c7.466,9.314 14.73,19.166 19.88,30c8.515,17.914 14.26,37.222 16.15,57c1.909,19.974 0.17,40.93 0.17,61l0,152c17.434,0 35.754,0.367 53,-2.296c41.255,-6.372 82.421,-27.304 111.91,-56.793c60.88,-60.88 79.14,-161.628 35.75,-237.911c-18.16,-31.933 -44.73,-58.912 -76.66,-77.127c-24.827,-14.165 -52.586,-21.838 -81,-23.784c-9.423,-0.645 -18.644,0.718 -28,0.911c-0.885,-20.316 -7.587,-41.937 -14.309,-61c-16.902,-47.933 -43.683,-90.994 -79.691,-127c-10.652,-10.651 -21.973,-20.415 -34,-29.475c-7.012,-5.281 -13.879,-11.021 -22,-14.525c3.931,-12.292 5.677,-25.292 7.754,-38c3.375,-20.65 6.26,-41.24 8.964,-62c1.255,-9.6271 1.022,-19.5336 3.282,-29l-2,0m-350,511c1.644,8.855 1,18.023 1,27l0,44l0,139c31.683,0 64.477,-3.984 96,0l0,-210l-97,0m225,210l71,0l17,0c2.236,-0.005 5.508,0.468 7.397,-1.028c3.47,-2.748 0.941,-10.341 0.692,-13.972c-0.837,-12.224 -0.089,-24.746 -0.089,-37l0,-158l-70,0l-18,0c-2.218,0.005 -5.528,-0.478 -7.393,1.028c-2.838,2.291 -0.623,9.748 -0.608,12.972c0.061,12.666 0.001,25.334 0.001,38l0,158z" fill="#8D5524"/></svg>`;
        btn.title = "MockMonkey";
        btn.style.cssText = `position: fixed; bottom: ${this.buttonPosition.y}px; right: ${this.buttonPosition.x}px; width: 50px; height: 50px; border-radius: 50%; background: #f5f5f5; border: none; cursor: move; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); z-index: 999998; display: flex; align-items: center; justify-content: center; padding: 9px; user-select: none;`;
        this.toggleButton = btn;
        btn.addEventListener("click", (e) => {
          if (this.isDragging) return;
          e.preventDefault();
          e.stopPropagation();
          console.log("[MockMonkey] 按钮被点击");
          this.toggle();
        });
        this.bindDragEvents(btn);
        document.body.appendChild(btn);
        console.log("[MockMonkey] 切换按钮已添加到页面");
      });
    }
    /**
     * Ensure body element exists
     */
    ensureBody() {
      return new Promise((resolve) => {
        if (document.body) {
          resolve();
        } else {
          const checkBody = () => {
            if (document.body) {
              resolve();
            } else {
              setTimeout(checkBody, 10);
            }
          };
          checkBody();
        }
      });
    }
    /**
     * Bind drag events
     */
    bindDragEvents(btn) {
      btn.addEventListener("mousedown", (e) => {
        if (e.button !== 0) return;
        this.dragStartTime = Date.now();
        this.hasMoved = false;
        this.isDragging = false;
        const rect = btn.getBoundingClientRect();
        this.dragOffset.x = e.clientX - rect.left;
        this.dragOffset.y = e.clientY - rect.top;
        document.addEventListener("mousemove", this.handleMouseMove);
        document.addEventListener("mouseup", this.handleMouseUp);
        btn.style.transition = "none";
      });
    }
    /**
     * Save button position to localStorage
     */
    saveButtonPosition() {
      if (!this.toggleButton) return;
      const rect = this.toggleButton.getBoundingClientRect();
      const right = window.innerWidth - rect.left - rect.width;
      const bottom = window.innerHeight - rect.top - rect.height;
      this.buttonPosition = { x: Math.round(right), y: Math.round(bottom) };
      try {
        localStorage.setItem("mock-monkey-button-position", JSON.stringify(this.buttonPosition));
        console.log("[MockMonkey] 按钮位置已保存:", this.buttonPosition);
      } catch (e) {
        console.warn("[MockMonkey] 保存按钮位置失败:", e);
      }
    }
    /**
     * Load button position from localStorage
     */
    loadButtonPosition() {
      try {
        const saved = localStorage.getItem("mock-monkey-button-position");
        if (saved) {
          const position = JSON.parse(saved);
          if (typeof position.x === "number" && typeof position.y === "number" && position.x >= 0 && position.y >= 0) {
            this.buttonPosition = position;
            console.log("[MockMonkey] 按钮位置已加载:", this.buttonPosition);
          }
        }
      } catch (e) {
        console.warn("[MockMonkey] 加载按钮位置失败:", e);
      }
    }
    /**
     * Bind panel drag events
     */
    bindPanelDragEvents() {
      if (!this.shadowRoot) return;
      const dragHandle = this.shadowRoot.querySelector('[data-drag-handle="panel"]');
      if (!dragHandle) return;
      dragHandle.addEventListener("mousedown", (e) => {
        const mouseEvent = e;
        if (mouseEvent.button !== 0) return;
        if (mouseEvent.target.closest('[data-action="close"]')) return;
        this.panelDragStartTime = Date.now();
        this.panelHasMoved = false;
        this.isPanelDragging = false;
        const panel = this.panelElement;
        if (!panel) return;
        const rect = panel.getBoundingClientRect();
        this.panelDragOffset.x = mouseEvent.clientX - rect.left;
        this.panelDragOffset.y = mouseEvent.clientY - rect.top;
        document.addEventListener("mousemove", this.handlePanelMouseMove);
        document.addEventListener("mouseup", this.handlePanelMouseUp);
        panel.style.transition = "none";
        e.preventDefault();
      });
    }
    /**
     * Save panel position to localStorage
     */
    savePanelPosition() {
      if (!this.panelPosition) return;
      try {
        localStorage.setItem("mock-monkey-panel-position", JSON.stringify(this.panelPosition));
        console.log("[MockMonkey] 面板位置已保存:", this.panelPosition);
      } catch (e) {
        console.warn("[MockMonkey] 保存面板位置失败:", e);
      }
    }
    /**
     * Load panel position from localStorage
     */
    loadPanelPosition() {
      try {
        const saved = localStorage.getItem("mock-monkey-panel-position");
        if (saved) {
          const position = JSON.parse(saved);
          if (typeof position.left === "number" && typeof position.top === "number" && position.left >= 0 && position.top >= 0) {
            this.panelPosition = position;
            console.log("[MockMonkey] 面板位置已加载:", this.panelPosition);
          }
        }
      } catch (e) {
        console.warn("[MockMonkey] 加载面板位置失败:", e);
      }
    }
    /**
     * Export rules
     */
    exportRules() {
      try {
        const exportData = this.currentRules.map((rule) => ({
          pattern: rule.patternStr,
          response: rule.response,
          enabled: rule.enabled,
          delay: rule.delay,
          status: rule.status
        }));
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: "application/json"
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `mock-monkey-rules-${( new Date()).toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log("[MockMonkey] 规则导出成功:", exportData.length, "条");
      } catch (e) {
        console.error("[MockMonkey] 导出规则失败:", e);
      }
    }
    /**
     * Import rules
     */
    importRules() {
      const fileInput = this.shadowRoot?.querySelector('[data-action="import-file"]');
      if (fileInput) {
        fileInput.value = "";
        fileInput.click();
      }
    }
    /**
     * Handle import file
     */
    handleImportFile(e) {
      const input = e.currentTarget;
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result;
          const importedRules = JSON.parse(content);
          if (!Array.isArray(importedRules)) {
            throw new Error(this.i18n.t("form.importError"));
          }
          let successCount = 0;
          importedRules.forEach((ruleData) => {
            let parsedPattern = ruleData.pattern;
            if (ruleData.pattern.startsWith("/")) {
              try {
                const match = ruleData.pattern.match(/^\/(.+)\/([gimuy]*)$/);
                if (match) {
                  parsedPattern = new RegExp(match[1], match[2]);
                }
              } catch (err) {
                console.warn("[MockMonkey] 跳过无效规则:", ruleData.pattern);
                return;
              }
            }
            this.onAddRule({
              pattern: parsedPattern,
              response: ruleData.response,
              options: {
                delay: ruleData.delay ?? 0,
                status: ruleData.status ?? 200
              }
            });
            successCount++;
          });
          console.log(`[MockMonkey] 成功导入 ${successCount} 条规则`);
          input.value = "";
        } catch (e2) {
          console.error("[MockMonkey] 导入规则失败:", e2);
          alert("导入失败：" + e2.message);
        }
      };
      reader.readAsText(file);
    }
    /**
     * Bind events
     */
    bindEvents() {
      if (!this.shadowRoot) return;
      this.shadowRoot.querySelector('[data-action="close"]')?.addEventListener("click", () => this.hide());
      this.shadowRoot.querySelector('[data-action="toggle-lang"]')?.addEventListener("click", () => {
        this.toggleLanguage();
      });
      this.shadowRoot.querySelectorAll(".mm-tab").forEach((tab) => {
        tab.addEventListener("click", (e) => {
          const target = e.currentTarget;
          const tabName = target.dataset.tab;
          if (tabName) this.switchTab(tabName);
        });
      });
      this.shadowRoot.querySelector('[data-action="clear-requests"]')?.addEventListener("click", () => {
        this.updateNetworkRequests([]);
      });
      this.shadowRoot.querySelector('[data-action="export"]')?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.exportRules();
        e.currentTarget.blur();
      });
      this.shadowRoot.querySelector('[data-action="import"]')?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.importRules();
        e.currentTarget.blur();
      });
      this.shadowRoot.querySelector('[data-action="import-file"]')?.addEventListener("change", (e) => {
        this.handleImportFile(e);
      });
      this.shadowRoot.querySelector('[data-action="add-rule"]')?.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleAddRule(e);
      });
      this.shadowRoot.querySelector('[data-action="cancel-edit"]')?.addEventListener("click", () => {
        this.cancelEdit();
      });
      const panel = this.shadowRoot.querySelector(".mm-panel");
      if (panel) {
        panel.addEventListener("wheel", (e) => {
          e.stopPropagation();
        }, { capture: true, passive: true });
      }
      this.bindPanelDragEvents();
    }
    /**
     * Switch tab
     */
    switchTab(tabName) {
      if (!this.shadowRoot) return;
      this.shadowRoot.querySelectorAll(".mm-tab").forEach((tab) => {
        const isActive = tab.dataset.tab === tabName;
        tab.classList.toggle("mm-tab--active", isActive);
      });
      this.shadowRoot.querySelectorAll(".mm-tab-content").forEach((content) => {
        const isActive = content.dataset.content === tabName;
        content.classList.toggle("mm-tab-content--active", isActive);
      });
    }
    /**
     * Toggle language and update UI
     */
    toggleLanguage() {
      this.i18n.toggleLanguage();
      this.updateLanguage();
    }
    /**
     * Update all UI text with current language
     */
    updateLanguage() {
      if (!this.shadowRoot) return;
      const langBtn = this.shadowRoot.querySelector('[data-action="toggle-lang"]');
      if (langBtn) {
        const lang = this.i18n.getLanguage();
        langBtn.textContent = lang === "zh" ? "EN" : "中";
        langBtn.title = lang === "zh" ? "Switch to English" : "切换中文";
      }
      this.shadowRoot.querySelectorAll(".mm-tab").forEach((tab) => {
        const tabName = tab.dataset.tab;
        if (tabName === "rules") {
          tab.textContent = this.i18n.t("tabs.rules");
        } else if (tabName === "add") {
          const isEditing = this.editingRuleId !== null;
          tab.textContent = isEditing ? this.i18n.t("common.edit") : this.i18n.t("tabs.add");
        } else if (tabName === "requests") {
          tab.textContent = this.i18n.t("tabs.network");
        }
      });
      const urlPatternLabel = this.shadowRoot.querySelector(".mm-form-group:first-child .mm-label");
      if (urlPatternLabel) urlPatternLabel.textContent = this.i18n.t("form.urlPattern");
      const urlPatternHint = this.shadowRoot.querySelector(".mm-form-group:first-child .mm-hint");
      if (urlPatternHint) urlPatternHint.textContent = this.i18n.t("form.urlPatternHint");
      const responseLabel = this.shadowRoot.querySelector(".mm-form-group:nth-child(2) .mm-label");
      if (responseLabel) responseLabel.textContent = this.i18n.t("form.responseData");
      const delayLabel = this.shadowRoot.querySelector(".mm-form-row .mm-form-group:first-child .mm-label");
      if (delayLabel) delayLabel.textContent = this.i18n.t("form.delay");
      const statusLabel = this.shadowRoot.querySelector(".mm-form-row .mm-form-group:last-child .mm-label");
      if (statusLabel) statusLabel.textContent = this.i18n.t("form.status");
      const cancelBtn = this.shadowRoot.querySelector('[data-action="cancel-edit"]');
      if (cancelBtn) cancelBtn.textContent = this.i18n.t("form.cancelEdit");
      const submitBtn = this.shadowRoot.querySelector("[data-submit-btn]");
      if (submitBtn) {
        submitBtn.textContent = this.editingRuleId ? this.i18n.t("form.saveRule") : this.i18n.t("form.addRule");
      }
      const exportBtn = this.shadowRoot.querySelector('[data-action="export"]');
      if (exportBtn) exportBtn.textContent = this.i18n.t("rules.export");
      const importBtn = this.shadowRoot.querySelector('[data-action="import"]');
      if (importBtn) importBtn.textContent = this.i18n.t("rules.import");
      const clearRequestsBtn = this.shadowRoot.querySelector('[data-action="clear-requests"]');
      if (clearRequestsBtn) clearRequestsBtn.textContent = this.i18n.t("network.clear");
      this.updateRules(this.currentRules);
      this.updateNetworkRequests(this.networkRequests);
    }
    /**
     * Handle add rule
     */
    handleAddRule(e) {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const pattern = formData.get("pattern");
      const responseStr = formData.get("response");
      const delay = parseInt(formData.get("delay")) || 0;
      const status = parseInt(formData.get("status")) || 200;
      const editingId = formData.get("editing-id");
      let parsedPattern = pattern;
      if (pattern.startsWith("/")) {
        try {
          const match = pattern.match(/^\/(.+)\/([gimuy]*)$/);
          if (match) {
            parsedPattern = new RegExp(match[1], match[2]);
          }
        } catch (err) {
          alert(this.i18n.t("form.regexError"));
          return;
        }
      }
      let response;
      try {
        response = JSON.parse(responseStr);
      } catch (err) {
        alert(this.i18n.t("form.jsonError"));
        return;
      }
      const ruleData = {
        pattern: parsedPattern,
        response,
        options: { delay, status }
      };
      if (editingId) {
        this.onUpdateRule?.(editingId, ruleData);
      } else {
        this.onAddRule(ruleData);
      }
      this.cancelEdit();
      form.reset();
      this.switchTab("rules");
    }
    /**
     * Cancel edit mode
     */
    cancelEdit() {
      this.editingRuleId = null;
      if (!this.shadowRoot) return;
      const form = this.shadowRoot.querySelector('[data-action="add-rule"]');
      const submitBtn = this.shadowRoot.querySelector("[data-submit-btn]");
      const cancelBtn = this.shadowRoot.querySelector('[data-action="cancel-edit"]');
      const tabLabel = this.shadowRoot.querySelector("[data-tab-label]");
      const editingIdInput = this.shadowRoot.querySelector('[name="editing-id"]');
      if (form) form.reset();
      if (submitBtn) submitBtn.textContent = this.i18n.t("form.addRule");
      if (cancelBtn) cancelBtn.style.display = "none";
      if (tabLabel) tabLabel.textContent = this.i18n.t("tabs.add");
      if (editingIdInput) editingIdInput.value = "";
    }
    /**
     * Enter edit mode
     */
    enterEditMode(rule) {
      this.editingRuleId = rule.id;
      if (!this.shadowRoot) return;
      const form = this.shadowRoot.querySelector('[data-action="add-rule"]');
      const submitBtn = this.shadowRoot.querySelector("[data-submit-btn]");
      const cancelBtn = this.shadowRoot.querySelector('[data-action="cancel-edit"]');
      const tabLabel = this.shadowRoot.querySelector("[data-tab-label]");
      const editingIdInput = this.shadowRoot.querySelector('[name="editing-id"]');
      const patternInput = this.shadowRoot.querySelector('[name="pattern"]');
      const responseInput = this.shadowRoot.querySelector('[name="response"]');
      const delayInput = this.shadowRoot.querySelector('[name="delay"]');
      const statusInput = this.shadowRoot.querySelector('[name="status"]');
      if (patternInput) patternInput.value = rule.patternStr;
      if (responseInput) responseInput.value = JSON.stringify(rule.response, null, 2);
      if (delayInput) delayInput.value = rule.delay.toString();
      if (statusInput) statusInput.value = rule.status.toString();
      if (editingIdInput) editingIdInput.value = rule.id;
      if (submitBtn) submitBtn.textContent = this.i18n.t("form.saveRule");
      if (cancelBtn) cancelBtn.style.display = "";
      if (tabLabel) tabLabel.textContent = this.i18n.t("common.edit");
      this.switchTab("add");
    }
    /**
     * Update rules list
     */
    updateRules(rules) {
      this.currentRules = rules;
      if (!this.shadowRoot) return;
      const listContainer = this.shadowRoot.querySelector("[data-rules-list]");
      const countEl = this.shadowRoot.querySelector(".mm-rules-count");
      if (!listContainer) return;
      if (countEl) {
        countEl.textContent = `${rules.length} ${this.i18n.t("rules.count")}`;
      }
      if (rules.length === 0) {
        listContainer.innerHTML = `
        <div class="mm-empty">
          <p>${this.i18n.t("rules.empty")}</p>
          <p class="mm-hint">${this.i18n.t("rules.startConfig")}</p>
        </div>
      `;
        listContainer.querySelector('[data-action="go-to-add"]')?.addEventListener("click", () => {
          this.switchTab("add");
        });
        return;
      }
      listContainer.innerHTML = rules.map(
        (rule) => `
      <div class="mm-rule-item ${rule.enabled ? "" : "mm-rule-item--disabled"}">
        <div class="mm-rule-header">
          <span class="mm-rule-pattern" title="${this.escapeHtmlAttr(rule.patternStr)}">${this.escapeHtml(rule.patternStr)}</span>
          <div class="mm-rule-actions">
            <button class="mm-btn-icon" data-action="toggle" data-id="${rule.id}" title="${rule.enabled ? this.i18n.t("common.disable") : this.i18n.t("common.enable")}">
              ${rule.enabled ? "🟢" : "⚫"}
            </button>
            <button class="mm-btn-icon" data-action="edit" data-id="${rule.id}" title="${this.i18n.t("common.edit")}">✏️</button>
            <button class="mm-btn-icon" data-action="delete" data-id="${rule.id}" title="${this.i18n.t("common.delete")}">🗑️</button>
          </div>
        </div>
        <details class="mm-rule-details">
          <summary class="mm-rule-summary">${this.i18n.t("common.details")}</summary>
          <div class="mm-rule-meta">
            <span>${this.i18n.t("rules.status")}: ${rule.status}</span>
            <span>${this.i18n.t("rules.delay")}: ${rule.delay}ms</span>
          </div>
          <pre class="mm-rule-response">${this.escapeHtml(JSON.stringify(rule.response, null, 2))}</pre>
        </details>
      </div>
    `
      ).join("");
      listContainer.querySelectorAll('[data-action="toggle"]').forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const id = e.currentTarget.dataset.id;
          if (id) this.onToggleRule(id);
        });
      });
      listContainer.querySelectorAll('[data-action="edit"]').forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const id = e.currentTarget.dataset.id;
          if (id) {
            const rule = rules.find((r) => r.id === id);
            if (rule) this.enterEditMode(rule);
          }
        });
      });
      listContainer.querySelectorAll('[data-action="delete"]').forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const id = e.currentTarget.dataset.id;
          if (id) this.onDeleteRule(id);
        });
      });
    }
    /**
     * Update network request list
     */
    updateNetworkRequests(requests) {
      this.networkRequests = requests;
      this.requestsById = new Map(requests.map((r) => [r.id, r]));
      if (!this.shadowRoot) return;
      const listContainer = this.shadowRoot.querySelector("[data-requests-list]");
      const countEl = this.shadowRoot.querySelector('[data-content="requests"] .mm-rules-count');
      if (!listContainer) return;
      if (countEl) {
        countEl.textContent = `${requests.length} ${this.i18n.t("network.count")}`;
      }
      if (requests.length === 0) {
        listContainer.innerHTML = `
        <div class="mm-empty">
          <p>${this.i18n.t("network.empty")}</p>
          <p class="mm-hint">${this.i18n.t("network.emptyHint")}</p>
        </div>
      `;
        return;
      }
      listContainer.innerHTML = requests.map(
        (req) => `
      <div class="mm-request-item ${req.mocked ? "mm-request-item--mocked" : ""}" data-request-id="${req.id}">
        <div class="mm-request-header">
          <span class="mm-request-method" data-method="${req.method}">${req.method}</span>
          <span class="mm-request-url" title="${this.escapeHtmlAttr(req.url)}">${this.escapeHtml(this.truncateUrl(req.url))}</span>
          <span class="mm-request-type">${req.type}</span>
          ${req.mocked ? '<span class="mm-badge mm-badge--mocked">MOCK</span>' : ""}
        </div>
        <div class="mm-request-meta">
          <span class="mm-request-status" data-status="${req.status ? Math.floor(req.status / 100).toString() : ""}">${req.status ?? "PENDING"}</span>
          <span class="mm-request-duration">${req.duration ? `${req.duration}ms` : "-"}</span>
          <span class="mm-request-time">${new Date(req.timestamp).toLocaleTimeString()}</span>
          <button class="mm-btn mm-btn--small mm-btn-create-mock" data-action="create-mock" data-request-id="${req.id}" title="${this.i18n.t("network.createMock")}">
            + Mock
          </button>
        </div>
        ${req.response !== void 0 ? `
          <details class="mm-request-details">
            <summary class="mm-request-summary">${this.i18n.t("network.responseData")}</summary>
            <pre class="mm-request-response">${this.escapeHtml(JSON.stringify(req.response, null, 2))}</pre>
          </details>
        ` : ""}
      </div>
    `
      ).join("");
      listContainer.querySelectorAll('[data-action="create-mock"]').forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const id = e.currentTarget.dataset.requestId;
          if (id) this.handleCreateFromRequest(id);
        });
      });
    }
    /**
     * 显示面板
     */
    show() {
      console.log("[MockMonkey] show() 被调用", { container: !!this.container, shadowRoot: !!this.shadowRoot });
      if (this.container) {
        this.isVisible = true;
        this.container.classList.add("mm-panel--visible");
        console.log("[MockMonkey] 已添加 mm-panel--visible 类");
        const panel = this.shadowRoot?.querySelector(".mm-panel");
        if (panel) {
          panel.style.display = "flex";
          panel.style.opacity = "1";
          panel.style.pointerEvents = "auto";
          console.log("[MockMonkey] 面板样式已应用");
        } else {
          console.error("[MockMonkey] 找不到 .mm-panel 元素");
        }
      }
    }
    /**
     * 隐藏面板
     */
    hide() {
      console.log("[MockMonkey] hide() 被调用");
      if (this.container) {
        this.isVisible = false;
        this.container.classList.remove("mm-panel--visible");
        const panel = this.shadowRoot?.querySelector(".mm-panel");
        if (panel) {
          panel.style.opacity = "0";
          panel.style.pointerEvents = "none";
        }
      }
    }
    /**
     * 切换显示状态
     */
    toggle() {
      console.log("[MockMonkey] toggle() 被调用", { isVisible: this.isVisible });
      if (this.isVisible) {
        this.hide();
      } else {
        this.show();
      }
    }
    /**
     * Create Mock rule from network request
     */
    handleCreateFromRequest(requestId) {
      const requestsById = this.requestsById;
      const request = requestsById?.get(requestId);
      if (!request) return;
      if (this.onCreateFromRequest) {
        this.onCreateFromRequest(request);
      }
      if (!this.shadowRoot) return;
      const patternInput = this.shadowRoot.querySelector('[name="pattern"]');
      const responseInput = this.shadowRoot.querySelector('[name="response"]');
      const statusInput = this.shadowRoot.querySelector('[name="status"]');
      if (patternInput) {
        patternInput.value = request.url;
      }
      if (responseInput && request.response !== void 0) {
        responseInput.value = JSON.stringify(request.response, null, 2);
      }
      if (statusInput && request.status) {
        statusInput.value = request.status.toString();
      }
      this.switchTab("add");
    }
    /**
     * HTML escape
     */
    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }
    /**
     * HTML attribute escape (escape double quotes)
     */
    escapeHtmlAttr(text) {
      return this.escapeHtml(text).replace(/"/g, "&quot;");
    }
    /**
     * Truncate URL, display domain + path + partial query params
     */
    truncateUrl(url, maxLength = 100) {
      try {
        const urlObj = new URL(url);
        const baseUrl = `${urlObj.origin}${urlObj.pathname}`;
        if (urlObj.search) {
          const searchParams = new URLSearchParams(urlObj.search);
          const params = [];
          let currentLength = baseUrl.length + 1;
          for (const [key, value] of searchParams.entries()) {
            const paramStr = `${key}=${value}`;
            if (currentLength + paramStr.length + 1 > maxLength) {
              break;
            }
            params.push(paramStr);
            currentLength += paramStr.length + 1;
          }
          const queryString = params.length > 0 ? "?" + params.join("&") : "?";
          if (params.length < Array.from(searchParams.entries()).length) {
            return baseUrl + queryString + "...";
          }
          return baseUrl + queryString;
        }
        return baseUrl;
      } catch {
        if (url.length > maxLength) {
          return url.substring(0, maxLength - 3) + "...";
        }
        return url;
      }
    }
    /**
     * Get styles
     */
    getStyles() {
      return `
      :host {
        all: initial;
      }

      .mm-panel {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 600px;
        max-width: 90vw;
        max-height: 80vh;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        color: #333;
        z-index: 999999;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s;
      }

      .mm-panel--visible {
        opacity: 1;
        pointer-events: auto;
      }

      .mm-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid #e0e0e0;
        cursor: move;
        user-select: none;
      }

      .mm-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }

      .mm-close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .mm-close-btn:hover {
        background: #f5f5f5;
      }

      .mm-header-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .mm-lang-btn {
        background: #f5f5f5;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        padding: 6px 12px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        min-width: 45px;
        text-align: center;
      }

      .mm-lang-btn:hover {
        background: #e5e7eb;
        border-color: #9ca3af;
      }

      .mm-tabs {
        display: flex;
        border-bottom: 1px solid #e0e0e0;
      }

      .mm-tab {
        flex: 1;
        padding: 12px;
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        color: #666;
        transition: all 0.2s;
      }

      .mm-tab:hover {
        color: #333;
        background: #fafafa;
      }

      .mm-tab--active {
        color: #4f46e5;
        border-bottom-color: #4f46e5;
      }

      .mm-content {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .mm-tab-content {
        display: none;
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        overscroll-behavior: contain;
      }

      .mm-tab-content--active {
        display: block;
      }

      .mm-rules-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .mm-rules-count {
        font-weight: 500;
        color: #666;
      }

      .mm-rules-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .mm-empty {
        text-align: center;
        padding: 40px 20px;
        color: #999;
      }

      .mm-rule-item {
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 12px;
        transition: all 0.2s;
      }

      .mm-rule-item:hover {
        border-color: #d1d5db;
      }

      .mm-rule-item--disabled {
        opacity: 0.6;
      }

      .mm-rule-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }

      .mm-rule-pattern {
        flex: 1;
        min-width: 0;
        font-weight: 500;
        color: #4f46e5;
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 13px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .mm-rule-actions {
        display: flex;
        gap: 4px;
      }

      .mm-rule-details {
        margin-top: 8px;
      }

      .mm-rule-summary {
        cursor: pointer;
        font-size: 12px;
        color: #6b7280;
        user-select: none;
        padding: 4px 0;
        list-style: none;
      }

      .mm-rule-summary::-webkit-details-marker {
        display: none;
      }

      .mm-rule-summary::before {
        content: '▶';
        display: inline-block;
        margin-right: 6px;
        transition: transform 0.2s;
        font-size: 10px;
      }

      details[open] > .mm-rule-summary::before {
        transform: rotate(90deg);
      }

      .mm-rule-meta {
        display: flex;
        gap: 12px;
        font-size: 12px;
        color: #6b7280;
        margin-bottom: 8px;
        margin-top: 8px;
      }

      .mm-rule-response {
        margin: 0;
        padding: 8px 12px;
        background: #fff;
        border-radius: 4px;
        font-size: 12px;
        font-family: 'Monaco', 'Menlo', monospace;
        color: #374151;
        overflow-x: auto;
        max-height: 150px;
        overflow-y: auto;
      }

      .mm-form-group {
        margin-bottom: 16px;
      }

      .mm-label {
        display: block;
        margin-bottom: 6px;
        font-weight: 500;
        color: #374151;
      }

      .mm-input,
      .mm-textarea {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 14px;
        font-family: inherit;
        box-sizing: border-box;
        transition: border-color 0.2s;
      }

      .mm-input:focus,
      .mm-textarea:focus {
        outline: none;
        border-color: #4f46e5;
        box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
      }

      .mm-textarea {
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 13px;
        resize: vertical;
      }

      .mm-hint {
        display: block;
        margin-top: 4px;
        font-size: 12px;
        color: #6b7280;
      }

      .mm-link {
        color: #4f46e5;
        cursor: pointer;
        text-decoration: underline;
      }

      .mm-link:hover {
        color: #4338ca;
      }

      .mm-form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }

      .mm-form-actions {
        display: flex;
        justify-content: flex-end;
        padding-top: 8px;
      }

      .mm-btn {
        padding: 10px 16px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        background: #fff;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }

      .mm-btn:hover {
        background: #f9fafb;
        border-color: #9ca3af;
      }

      .mm-btn--primary {
        background: #4f46e5;
        color: #fff;
        border-color: #4f46e5;
      }

      .mm-btn--primary:hover {
        background: #4338ca;
        border-color: #4338ca;
      }

      .mm-btn--small {
        padding: 6px 12px;
        font-size: 12px;
      }

      .mm-btn-create-mock {
        margin-left: auto;
        padding: 4px 10px;
        font-size: 11px;
        background: #4f46e5;
        color: #fff;
        border-color: #4f46e5;
        white-space: nowrap;
      }

      .mm-btn-create-mock:hover {
        background: #4338ca;
        border-color: #4338ca;
      }

      .mm-btn-icon {
        background: none;
        border: none;
        font-size: 16px;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        opacity: 0.7;
        transition: opacity 0.2s;
      }

      .mm-btn-icon:hover {
        opacity: 1;
        background: rgba(0, 0, 0, 0.05);
      }

      .mm-toggle-btn {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #4f46e5;
        border: none;
        font-size: 24px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
        z-index: 999998;
        transition: transform 0.2s, box-shadow 0.2s;
      }

      .mm-toggle-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }

      .mm-requests-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .mm-request-item {
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 12px;
        font-size: 13px;
        transition: all 0.2s;
      }

      .mm-request-item:hover {
        border-color: #d1d5db;
      }

      .mm-request-item--mocked {
        background: #f0fdf4;
        border-color: #86efac;
      }

      .mm-request-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;
        flex-wrap: wrap;
      }

      .mm-request-method {
        font-weight: 600;
        font-size: 11px;
        padding: 2px 6px;
        border-radius: 4px;
        background: #e5e7eb;
        color: #374151;
        min-width: 45px;
        text-align: center;
      }

      .mm-request-method[data-method="GET"] {
        background: #dbeafe;
        color: #1d4ed8;
      }

      .mm-request-method[data-method="POST"] {
        background: #dcfce7;
        color: #16a34a;
      }

      .mm-request-method[data-method="PUT"] {
        background: #fef3c7;
        color: #d97706;
      }

      .mm-request-method[data-method="DELETE"] {
        background: #fee2e2;
        color: #dc2626;
      }

      .mm-request-url {
        flex: 1;
        min-width: 0;
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 12px;
        color: #374151;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .mm-request-type {
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 4px;
        background: #e5e7eb;
        color: #6b7280;
        font-weight: 500;
      }

      .mm-badge {
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 500;
      }

      .mm-badge--mocked {
        background: #22c55e;
        color: #fff;
      }

      .mm-request-meta {
        display: flex;
        gap: 12px;
        font-size: 11px;
        color: #6b7280;
      }

      .mm-request-status {
        font-weight: 500;
      }

      .mm-request-status[data-status="2"] {
        color: #16a34a;
      }

      .mm-request-status[data-status="3"] {
        color: #d97706;
      }

      .mm-request-status[data-status="4"],
      .mm-request-status[data-status="5"] {
        color: #dc2626;
      }

      .mm-request-duration {
        font-family: 'Monaco', 'Menlo', monospace;
      }

      .mm-request-details {
        margin-top: 8px;
      }

      .mm-request-summary {
        cursor: pointer;
        font-size: 11px;
        color: #6b7280;
        user-select: none;
        padding: 4px 0;
      }

      .mm-request-summary:hover {
        color: #374151;
      }

      .mm-request-response {
        margin: 4px 0 0 0;
        padding: 8px 12px;
        background: #fff;
        border-radius: 4px;
        font-size: 11px;
        font-family: 'Monaco', 'Menlo', monospace;
        color: #374151;
        overflow-x: auto;
        max-height: 200px;
        overflow-y: auto;
      }

      .mm-hidden {
        display: none;
      }
    `;
    }
  }
  class PanelWithCallbacks extends Panel {
    constructor(onAddRule, callbacks, onCreateFromRequest) {
      super(onAddRule, callbacks.onEdit, onCreateFromRequest);
      this.callbacks = callbacks;
    }
    onToggleRule(id) {
      this.callbacks.onToggle(id);
    }
    onEditRule(id, rule) {
      this.callbacks.onEdit(id, rule);
    }
    onDeleteRule(id) {
      this.callbacks.onDelete(id);
    }
  }
  class MockMonkey {
    constructor() {
      this.recorder = new RequestRecorder();
      this.manager = new MockManager();
      this.interceptor = new Interceptor(this.manager, this.recorder);
      this.i18n = I18n.getInstance();
      this.panel = new PanelWithCallbacks(
        (rule) => this.handleAddRule(rule),
        {
          onToggle: (id) => this.handleToggleRule(id),
          onEdit: (id, rule) => this.handleEditRule(id, rule),
          onDelete: (id) => this.handleDeleteRule(id)
        }
      );
      this.recorder.subscribe((requests) => {
        this.panel.updateNetworkRequests(requests);
      });
    }
    /**
     * Get singleton instance
     */
    static getInstance() {
      if (!MockMonkey.instance) {
        MockMonkey.instance = new MockMonkey();
      }
      return MockMonkey.instance;
    }
    /**
     * Start MockMonkey
     */
    start() {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => this.init());
      } else {
        this.init();
      }
    }
    /**
     * Initialize
     */
    init() {
      this.interceptor.start();
      this.panel.init();
      this.updateRulesList();
      console.log("[MockMonkey] Started! Click the 🐵 button in the bottom right to open the management panel");
    }
    /**
     * Add rule
     */
    handleAddRule(rule) {
      this.manager.add(rule);
      this.updateRulesList();
      console.log("[MockMonkey] Rule added");
    }
    /**
     * Toggle rule status
     */
    handleToggleRule(id) {
      const enabled = this.manager.toggle(id);
      this.updateRulesList();
      console.log(`[MockMonkey] Rule ${enabled ? "enabled" : "disabled"}`);
    }
    /**
     * Edit rule
     */
    handleEditRule(id, rule) {
      const success = this.manager.update(id, {
        pattern: rule.pattern,
        response: rule.response,
        options: rule.options
      });
      if (success) {
        this.updateRulesList();
        console.log("[MockMonkey] Rule updated");
      } else {
        console.error("[MockMonkey] Rule update failed: rule not found");
      }
    }
    /**
     * Delete rule
     */
    handleDeleteRule(id) {
      if (confirm(`[MockMonkey] ${this.i18n.t("common.confirmDelete")}`)) {
        this.manager.remove(id);
        this.updateRulesList();
        console.log("[MockMonkey] Rule deleted");
      }
    }
    /**
     * Update rules list
     */
    updateRulesList() {
      const rules = this.manager.getAll().map((rule) => ({
        id: rule.id,
        patternStr: rule.pattern instanceof RegExp ? rule.pattern.toString() : rule.pattern,
        response: rule.response,
        enabled: rule.enabled,
        delay: rule.options.delay || 0,
        status: rule.options.status || 200
      }));
      this.panel.updateRules(rules);
    }
  }
  MockMonkey.getInstance().start();
  window.mockMonkey = {
    add: (pattern, response, options) => {
      MockMonkey.getInstance()["manager"].add({ pattern, response, options });
      MockMonkey.getInstance()["updateRulesList"]();
    },
    remove: (pattern) => {
      MockMonkey.getInstance()["manager"].removeByPattern(pattern);
      MockMonkey.getInstance()["updateRulesList"]();
    },
    clear: () => {
      MockMonkey.getInstance()["manager"].clear();
      MockMonkey.getInstance()["updateRulesList"]();
    },
    list: () => {
      const manager = MockMonkey.getInstance()["manager"];
      console.log("[MockMonkey] Current rules:");
      manager.getAll().forEach((rule) => {
        console.log(`  ${rule.enabled ? "✓" : "✗"} ${rule.pattern}`, rule);
      });
    },
    listRequests: () => {
      const recorder = MockMonkey.getInstance()["recorder"];
      console.log("[MockMonkey] Network request records:");
      recorder.getRequests().forEach((req) => {
        console.log(`  ${req.mocked ? "🟢 MOCK" : "⚪ REAL"} ${req.method} ${req.url}`, req);
      });
    },
    clearRequests: () => {
      const recorder = MockMonkey.getInstance()["recorder"];
      recorder.clear();
      console.log("[MockMonkey] Network request records cleared");
    },
    manager: MockMonkey.getInstance()["manager"],
    recorder: MockMonkey.getInstance()["recorder"]
  };
})();
