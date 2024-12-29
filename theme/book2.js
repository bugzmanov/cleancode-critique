// theme/book.js
"use strict";

window.addEventListener('load', function() {
// giscus
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', 'bugzmanov/cleancode-critique');
    script.setAttribute('data-repo-id', 'R_kgDONchmig');
    script.setAttribute('data-category', 'General');
    script.setAttribute('data-category-id', 'DIC_kwDONchmis4ClKA3');
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'bottom');
    script.setAttribute('data-theme', 'dark_dimmed');
    script.setAttribute('data-lang', 'en');
    script.crossOrigin = 'anonymous';
    script.async = true;

    // Create a div for giscus
    const giscusDiv = document.createElement('div');
    giscusDiv.className = 'giscus';
    
    // Add the div before the script
    const content = document.querySelector('.content');
    content.appendChild(giscusDiv);
    // Add the script after the div
    document.body.appendChild(script);

// goat counter

    (function goat() {
        const script = document.createElement('script');
        script.async = true;
        script.src = '//gc.zgo.at/count.js';
        script.setAttribute('data-goatcounter', 'https://bugzmanov.goatcounter.com/count');
        // Add the script to the document head
        document.head.appendChild(script);
    })();

// random animations and stuff
    document.querySelectorAll('.collapsible-header').forEach(header => {
        header.addEventListener('click', () => {
            const parent = header.parentElement;
            parent.classList.toggle('active');
        });
    });
});
//
// Load your custom CSS
        document.addEventListener('DOMContentLoaded', function() {
            const triggers = document.querySelectorAll('.code-comment-trigger');

            triggers.forEach(trigger => {
                trigger.addEventListener('click', function(e) {
                    const comment = this.nextElementSibling;
                    
                    // Close all other comments
                    document.querySelectorAll('.code-comment.active').forEach(c => {
                        if (c !== comment) {
                            c.classList.remove('active');
                        }
                    });
                    
                    comment.classList.toggle('active');
                    e.stopPropagation();
                });
            });

            // Close comments when clicking outside
            document.addEventListener('click', function() {
                document.querySelectorAll('.code-comment.active').forEach(comment => {
                    comment.classList.remove('active');
                });
            });
        });
