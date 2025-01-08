// Populate the sidebar
//
// This is a script, and not included directly in the page, to control the total size of the book.
// The TOC contains an entry for each page, so if each page includes a copy of the TOC,
// the total size of the page becomes O(n**2).
class MDBookSidebarScrollbox extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.innerHTML = '<ol class="chapter"><li class="chapter-item expanded "><a href="index.html"><strong aria-hidden="true">1.</strong> Introduction</a></li><li class="chapter-item expanded "><a href="chapter_1.html"><strong aria-hidden="true">2.</strong> Chapter 1: Clean Code</a></li><li class="chapter-item expanded "><a href="chapter_2.html"><strong aria-hidden="true">3.</strong> Chapter 2: Meaningful Names</a></li><li class="chapter-item expanded "><a href="chapter_3.html"><strong aria-hidden="true">4.</strong> Chapter 3: Functions</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="chapter_31.html"><strong aria-hidden="true">4.1.</strong> Small!</a></li><li class="chapter-item expanded "><a href="chapter_32.html"><strong aria-hidden="true">4.2.</strong> One Level of Abstraction per Function</a></li><li class="chapter-item expanded "><a href="chapter_33.html"><strong aria-hidden="true">4.3.</strong> Switch Statements</a></li><li class="chapter-item expanded "><a href="chapter_34.html"><strong aria-hidden="true">4.4.</strong> Use Descriptive Names</a></li><li class="chapter-item expanded "><a href="chapter_35.html"><strong aria-hidden="true">4.5.</strong> Function Arguments</a></li><li class="chapter-item expanded "><a href="chapter_36.html"><strong aria-hidden="true">4.6.</strong> Have No Side Effects</a></li><li class="chapter-item expanded "><a href="chapter_37.html"><strong aria-hidden="true">4.7.</strong> Error Handling</a></li><li class="chapter-item expanded "><a href="chapter_38.html"><strong aria-hidden="true">4.8.</strong> How Do You Write Functions Like This?</a></li></ol></li><li class="chapter-item expanded "><a href="chapter_4.html"><strong aria-hidden="true">5.</strong> Chapter 4: Comments</a></li><li class="chapter-item expanded "><a href="chapter_5.html"><strong aria-hidden="true">6.</strong> Chapter 5: Formatting</a></li><li class="chapter-item expanded "><a href="chapter_6.html"><strong aria-hidden="true">7.</strong> Chapter 6: Objects and Data Structures</a></li><li class="chapter-item expanded "><a href="chapter_7.html"><strong aria-hidden="true">8.</strong> [DRAFT] Chapter 7: Error Handling</a></li><li class="chapter-item expanded "><div><strong aria-hidden="true">9.</strong> Chapter 8: Boundaries</div></li><li class="chapter-item expanded "><a href="chapter_9.html"><strong aria-hidden="true">10.</strong> Chapter 9: Unit Tests</a></li><li class="chapter-item expanded "><a href="chapter_10.html"><strong aria-hidden="true">11.</strong> [DRAFT] Chapter 10: Classes</a></li><li class="chapter-item expanded "><a href="chapter_11.html"><strong aria-hidden="true">12.</strong> Chapter 11: Systems</a></li><li class="chapter-item expanded "><a href="chapter_12.html"><strong aria-hidden="true">13.</strong> Chapter 12: Emergence</a></li><li class="chapter-item expanded "><a href="chapter_13.html"><strong aria-hidden="true">14.</strong> Chapter 13: Concurrency</a></li><li class="chapter-item expanded "><a href="chapter_14.html"><strong aria-hidden="true">15.</strong> [DRAFT] Chapter 14: Successive Refinement</a></li><li class="chapter-item expanded "><div><strong aria-hidden="true">16.</strong> Chapter 15: JUnit Internals</div></li><li class="chapter-item expanded "><div><strong aria-hidden="true">17.</strong> Chapter 16: Refactoring SerialDate</div></li><li class="chapter-item expanded affix "><li class="spacer"></li><li class="chapter-item expanded "><a href="drafts.html"><strong aria-hidden="true">18.</strong> Drafts</a></li></ol>';
        // Set the current, active page, and reveal it if it's hidden
        let current_page = document.location.href.toString();
        if (current_page.endsWith("/")) {
            current_page += "index.html";
        }
        var links = Array.prototype.slice.call(this.querySelectorAll("a"));
        var l = links.length;
        for (var i = 0; i < l; ++i) {
            var link = links[i];
            var href = link.getAttribute("href");
            if (href && !href.startsWith("#") && !/^(?:[a-z+]+:)?\/\//.test(href)) {
                link.href = path_to_root + href;
            }
            // The "index" page is supposed to alias the first chapter in the book.
            if (link.href === current_page || (i === 0 && path_to_root === "" && current_page.endsWith("/index.html"))) {
                link.classList.add("active");
                var parent = link.parentElement;
                if (parent && parent.classList.contains("chapter-item")) {
                    parent.classList.add("expanded");
                }
                while (parent) {
                    if (parent.tagName === "LI" && parent.previousElementSibling) {
                        if (parent.previousElementSibling.classList.contains("chapter-item")) {
                            parent.previousElementSibling.classList.add("expanded");
                        }
                    }
                    parent = parent.parentElement;
                }
            }
        }
        // Track and set sidebar scroll position
        this.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                sessionStorage.setItem('sidebar-scroll', this.scrollTop);
            }
        }, { passive: true });
        var sidebarScrollTop = sessionStorage.getItem('sidebar-scroll');
        sessionStorage.removeItem('sidebar-scroll');
        if (sidebarScrollTop) {
            // preserve sidebar scroll position when navigating via links within sidebar
            this.scrollTop = sidebarScrollTop;
        } else {
            // scroll sidebar to current active section when navigating via "next/previous chapter" buttons
            var activeSection = document.querySelector('#sidebar .active');
            if (activeSection) {
                activeSection.scrollIntoView({ block: 'center' });
            }
        }
        // Toggle buttons
        var sidebarAnchorToggles = document.querySelectorAll('#sidebar a.toggle');
        function toggleSection(ev) {
            ev.currentTarget.parentElement.classList.toggle('expanded');
        }
        Array.from(sidebarAnchorToggles).forEach(function (el) {
            el.addEventListener('click', toggleSection);
        });
    }
}
window.customElements.define("mdbook-sidebar-scrollbox", MDBookSidebarScrollbox);
