// ==UserScript==
// @name         Spotify AdBlocker
// @namespace   thenolle.studios.spotify.addskipper

// @copyright    2020, TheNolle Studios
// @license      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @version      Beta.0.2.8-(Private.Beta)

// @author       TheNolle Studios
// @description           Skip Spotify's ads for you before it plays! (So you won't be disturbed by a pesky ad)

// @supportURL   https://github.com/TheNolle/Spotify-Adblocker/issues
// @updateURL    https://github.com/TheNolle/Spotify-Adblocker/raw/master/userscript.user.js
// @downloadURL  https://github.com/TheNolle/Spotify-Adblocker/raw/master/userscript.user.js

// @compatible  firefox, Tampermonkey || Violentmonkey
// @compatible  chrome, Tampermonkey
// @compatible  edge, Tampermonkey

// @match        https://*.spotify.com/*
// @match        http://*.spotify.com/*

// @grant        none

// @run-at       document-start
// ==/UserScript==

!async function () {

    // Alert box wich launch when on the website
    alert(`_______________________________________________________________________

Hewoo, so you have a copy of my script huh?

Well, I hope it's TheNolle or TheNolle Studios who gave you this!
  You can add me on discord <TheNolle#3792> to report any bugs with it!
     Or simply join the discord ( https://discord.gg/yUgp7k8 ).

*****************************************************************
*  I know this box is annoying, but as soon as I find a way of  *
*  showing it only once, i'll do it !                           *
*****************************************************************

⚠ This script is in its release version, but it doesn't mean it's
   100% working! You are asked to transfer me any problems you could
   have with it (with screens if possible) as soon as you can! ⚠

                                 Kiss ❤
                                                            - TheNolle

_______________________________________________________________________
`)

    async function queryAsync(query) {
        return new Promise(resolve => {
            const interval = setInterval(() => {
                const element = document.querySelector(query);
                if (element) {
                    clearInterval(interval);
                    return resolve(element);
                }
            }, 250);
        });
    }

    /**
     * Inject a middleware function in a object or instance
     * @param ctx Object or instance
     * @param fn Function name
     * @param middleware Middleware function
     * @param transform Transform function result
     */
    function inject({ctx, fn, middleware, transform}) {
        const original = ctx[fn];
        ctx[fn] = function () {
            if (!middleware || middleware.call(this, ...arguments) !== false) {
                const result = original.call(this, ...arguments);
                return transform ? transform.call(this, result, ...arguments) : result;
            }
        };
    }

    const nowPlayingBar = await queryAsync('.now-playing-bar');
    const playButton = await queryAsync('button[title=Play], button[title=Pause]');

    let audio;

    inject({
        ctx: document,
        fn: 'createElement',
        transform(result, type) {

            if (type === 'audio') {
                audio = result;
            }

            return result;
        }
    });

    let playInterval;
    new MutationObserver(() => {
        const link = document.querySelector('.now-playing > a');

        if (link) {

            if (!audio) {
                return console.error('Audio-element not found!');
            }

            if (!playButton) {
                return console.error('Play-button not found!');
            }

            // console.log('Ad found', audio, playButton, nowPlayingBar);

            audio.src = '';
            playButton.click();
            if (!playInterval) {
                playInterval = setInterval(() => {
                    if (!document.querySelector('.now-playing > a') && playButton.title === 'Pause') {
                        clearInterval(playInterval);
                        playInterval = null;
                    } else {
                        playButton.click();
                    }
                }, 500);
            }
        }
    }).observe(nowPlayingBar, {
        characterData: true,
        childList: true,
        attributes: true,
        subtree: true
    });

    // Hide upgrade-button and captcha-errors, we don't what to see that.
    const style = document.createElement('style');
    style.innerHTML = `
        [aria-label="Upgrade to Premium"],
        body > div:not(#main) {
            display: none !important;
        }
    `;

    document.body.appendChild(style);
}();
