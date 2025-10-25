/*!
 * Lunr Japanese Support
 * Copyright (C) 2024 - Simplified Japanese tokenizer for Lunr.js
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define(factory)
  } else if (typeof exports === 'object') {
    // Node
    module.exports = factory()
  } else {
    // Browser
    factory()(root.lunr);
  }
}(this, function () {
  return function (lunr) {
    /* Lunr Japanese language support */
    lunr.jp = function () {
      this.pipeline.reset();
      this.pipeline.add(
        lunr.jp.tokenizer,
        lunr.jp.stopWordFilter,
        lunr.jp.stemmer
      );
    };

    /* Japanese tokenizer with improved handling */
    lunr.jp.tokenizer = function (obj) {
      if (!arguments.length || obj == null || obj == undefined) return []
      if (Array.isArray(obj)) return obj.map(function (t) { return lunr.utils.asString(t).toLowerCase() })

      var str = obj.toString().toLowerCase();
      var tokens = [];

      // Improved Japanese text splitting
      // Split by various delimiters including Japanese punctuation
      var delimiters = /[\s\u3000\u3001\u3002\u300C\u300D\u300E\u300F\u3010\u3011\uFF08\uFF09\uFF01\uFF1F\uFF0C\uFF0E\u30FB\u2026]+/;
      var parts = str.split(delimiters);

      for (var i = 0; i < parts.length; i++) {
        var part = parts[i];
        if (!part || part.length === 0) continue;

        // Handle different character types
        var currentToken = '';
        var currentType = null;

        for (var j = 0; j < part.length; j++) {
          var char = part[j];
          var charCode = char.charCodeAt(0);
          var charType = getCharType(charCode);

          if (currentType === null) {
            currentType = charType;
            currentToken = char;
          } else if (currentType === charType) {
            // Continue building the current token
            currentToken += char;
          } else {
            // Type changed, save current token and start new one
            if (currentToken.length > 0) {
              tokens.push(new lunr.Token(currentToken, {}));

              // For CJK characters, also create n-gram tokens for better matching
              if (currentType === 'cjk' && currentToken.length > 1) {
                for (var n = 0; n < currentToken.length - 1; n++) {
                  tokens.push(new lunr.Token(currentToken.substr(n, 2), {}));
                }
              }
            }
            currentType = charType;
            currentToken = char;
          }
        }

        // Don't forget the last token
        if (currentToken.length > 0) {
          tokens.push(new lunr.Token(currentToken, {}));

          // For CJK characters, also create n-gram tokens
          if (currentType === 'cjk' && currentToken.length > 1) {
            for (var n = 0; n < currentToken.length - 1; n++) {
              tokens.push(new lunr.Token(currentToken.substr(n, 2), {}));
            }
          }
        }
      }

      return tokens;
    };

    function getCharType(charCode) {
      // CJK Unified Ideographs
      if ((charCode >= 0x4E00 && charCode <= 0x9FFF) ||
          // Hiragana
          (charCode >= 0x3040 && charCode <= 0x309F) ||
          // Katakana
          (charCode >= 0x30A0 && charCode <= 0x30FF) ||
          // Full-width Katakana
          (charCode >= 0xFF65 && charCode <= 0xFF9F) ||
          // CJK Extension A
          (charCode >= 0x3400 && charCode <= 0x4DBF)) {
        return 'cjk';
      }
      // Latin characters and numbers
      else if ((charCode >= 0x0041 && charCode <= 0x005A) ||
               (charCode >= 0x0061 && charCode <= 0x007A) ||
               (charCode >= 0x0030 && charCode <= 0x0039)) {
        return 'latin';
      }
      // Other
      else {
        return 'other';
      }
    }

    /* Japanese stop word filter */
    lunr.jp.stopWordFilter = lunr.generateStopWordFilter(
      'これ それ あれ この その あの ここ そこ あそこ こちら どこ だれ なに なん 何 私 貴方 貴方方 我々 私達 あの人 あのかた 彼女 彼 です あります おります います は が の に を で え から まで より も どの と し それで しかし'.split(' ')
    );

    /* Japanese stemmer (simplified - just returns the token as-is) */
    lunr.jp.stemmer = function () {
      return function (token) {
        return token;
      }
    }();

    lunr.Pipeline.registerFunction(lunr.jp.stemmer, 'stemmer-jp');
    lunr.Pipeline.registerFunction(lunr.jp.stopWordFilter, 'stopWordFilter-jp');
    lunr.Pipeline.registerFunction(lunr.jp.tokenizer, 'tokenizer-jp');
  };
}));