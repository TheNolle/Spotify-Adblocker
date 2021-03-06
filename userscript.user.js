// ==UserScript==
// @name         Spotify AdBlocker
// @namespace   thenolle.studios.spotify.addskipper

// @copyright    2021, TheNolle Studios
// @license      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @version      Release.0.2.9-(Public.Release)

// @author       TheNolle Studios
// @description           Skip Spotify's ads for you before it plays! (So you won't be disturbed by a pesky ad)

// @supportURL   https://github.com/TheNolle/Spotify-Adblocker/issues/new/choose
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

  // Create a new localStorage + Displays an Alert Box on First Use
    var FirstUse = localStorage.getItem('FirstUse') || '';
    if (FirstUse != 'No') {
     alert(`_________________________________________________________________________
                                Thank you for using our script!

You can join our Discord (https://discord.gg/yUgp7k8) to support us!
And also that if you encounter any bugs with our script, you can leave a [Bug Report] on the github (https://github.com/TheNolle)
                                                                                - TheNolle Studios
_________________________________________________________________________
`);
     localStorage.setItem('FirstUse','No');
    }

!async function () {

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
