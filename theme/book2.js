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

    if (window.localStorage) {
        window.localStorage.setItem('mdbook-theme', 'navy');
        if (!window.localStorage.getItem('mdbook-sidebar')) {
            window.localStorage.setItem('mdbook-sidebar', 'visible');
        }
    }

    // Initialize file explorer if present
    const initExplorer = () => {
        if (!document.getElementById('uncle-bob-explorer')) return;

        const fileData = [
            { name: "Bonus.java", path: "Bonus.java", content: "package ubConferenceCenter;\n\nimport java.util.List;\n\npublic interface Bonus {\n    void checkAndAdd(List<RentalItem> items, List<RentalItem> bonusItems);\n}" },
            { name: "CatalogItem.java", path: "CatalogItem.java", content: "package ubConferenceCenter;\n\npublic interface CatalogItem {\n    boolean isEligibleForDiscount(int days);\n    int getDiscountedPrice(int days);\n    int getUnitPrice();\n    double getTaxRate();\n    String getName();\n}" },
            { name: "RentalItem.java", path: "RentalItem.java", content: "package ubConferenceCenter;\n\npublic record RentalItem(String type,\n                         int days,\n                         int unitPrice,\n                         int price,\n                         int tax) {\n}" },
            { name: "RentalOrder.java", path: "RentalOrder.java", content: "package ubConferenceCenter;\n\nimport java.util.ArrayList;\nimport java.util.List;\n\npublic class RentalOrder {\n    public record Totals(int subtotal, int tax) {\n    }\n\n    private String customerName;\n    private int subtotal = 0;\n    private int tax = 0;\n    private RentalReceipt receipt = new RentalReceipt();\n    private List<Bonus> bonuses = new ArrayList<>();\n\n    public RentalOrder(String customerName) {\n        this.customerName = customerName;\n    }\n\n    public void addBonus(Bonus bonus) {\n        bonuses.add(bonus);\n    }\n\n    public void rent(CatalogItem item, int days) {\n        int unitPrice = item.getUnitPrice();\n        int price = item.getDiscountedPrice(days);\n        int thisTax = (int) Math.round(price * item.getTaxRate());\n        receipt.add(new RentalItem(item.getName(), days,\n                unitPrice, price, thisTax));\n        subtotal += price;\n        tax += thisTax;\n    }\n\n    public RentalItem[] getReceipt() {\n        return receipt.finalize(bonuses);\n    }\n\n    public String getCustomerName() {\n        return customerName;\n    }\n\n    public Totals getTotals() {\n        return new Totals(subtotal, tax);\n    }\n}" },
            { name: "RentalReceipt.java", path: "RentalReceipt.java", content: "package ubConferenceCenter;\n\nimport java.util.ArrayList;\nimport java.util.List;\n\npublic class RentalReceipt {\n    private List<RentalItem> items = new ArrayList<>();\n\n    public void add(RentalItem item) {\n        items.add(item);\n    }\n\n    public RentalItem[] finalize(List<Bonus> bonuses) {\n        List<RentalItem> finalItems = new ArrayList<>(this.items);\n        finalItems.addAll(addBonuses(bonuses));\n        return finalItems.toArray(new RentalItem[0]);\n    }\n\n    private List<RentalItem> addBonuses(List<Bonus> bonuses) {\n        List<RentalItem> bonusItems = new ArrayList<>();\n        for (Bonus bonus : bonuses)\n            bonus.checkAndAdd(items, bonusItems);\n        return bonusItems;\n    }\n}" },
            { name: "bonuses/", type: "folder", children: [
                { name: "CookieBonus.java", path: "bonuses/CookieBonus.java", content: "package ubConferenceCenter.bonuses;\n\nimport ubConferenceCenter.Bonus;\nimport ubConferenceCenter.RentalItem;\n\nimport java.util.List;\n\npublic class CookieBonus implements Bonus {\n    public void checkAndAdd(List<RentalItem> items,\n                            List<RentalItem> bonusItems) {\n        boolean largeRoomFiveDays = items.stream().anyMatch(\n                item -> item.type().equals(\"LARGE_ROOM\") && item.days() == 5);\n        boolean coffeeFiveDays = items.stream().anyMatch(\n                item -> item.type().equals(\"COFFEE\") && item.days() == 5);\n        if (largeRoomFiveDays && coffeeFiveDays)\n            bonusItems.add(new RentalItem(\"COOKIES\", 5, 0, 0, 0));\n    }\n}" }
            ]},
            { name: "catalogItems/", type: "folder", children: [
                { name: "Coffee.java", path: "catalogItems/Coffee.java", content: "package ubConferenceCenter.catalogItems;\n\nimport ubConferenceCenter.CatalogItem;\n\npublic class Coffee implements CatalogItem {\n    public boolean isEligibleForDiscount(int days) {\n        return false;\n    }\n\n    public int getDiscountedPrice(int days) {\n        return getUnitPrice() * days;\n    }\n\n    public int getUnitPrice() {\n        return 10;\n    }\n\n    public double getTaxRate() {\n        return 0.0;\n    }\n\n    public String getName() {\n        return \"COFFEE\";\n    }\n}" },
                { name: "Cookies.java", path: "catalogItems/Cookies.java", content: "package ubConferenceCenter.catalogItems;\n\nimport ubConferenceCenter.CatalogItem;\n\npublic class Cookies implements CatalogItem {\n    public boolean isEligibleForDiscount(int days) {\n        return false;\n    }\n\n    public int getDiscountedPrice(int days) {\n        return getUnitPrice() * days;\n    }\n\n    public int getUnitPrice() {\n        return 15;\n    }\n\n    public double getTaxRate() {\n        return 0;\n    }\n\n    public String getName() {\n        return \"COOKIES\";\n    }\n}" },
                { name: "LargeRoom.java", path: "catalogItems/LargeRoom.java", content: "package ubConferenceCenter.catalogItems;\n\nimport ubConferenceCenter.CatalogItem;\n\npublic class LargeRoom implements CatalogItem {\n    public boolean isEligibleForDiscount(int days) {\n        return days == 5;\n    }\n\n    public int getDiscountedPrice(int days) {\n        double discountRate = (days == 5) ? 0.9 : 1.0;\n        return (int) Math.round(getUnitPrice() * days * discountRate);\n    }\n\n    public int getUnitPrice() {\n        return 150;\n    }\n\n    public double getTaxRate() {\n        return 0.05;\n    }\n\n    public String getName() {\n        return \"LARGE_ROOM\";\n    }\n}" },
                { name: "SmallRoom.java", path: "catalogItems/SmallRoom.java", content: "package ubConferenceCenter.catalogItems;\n\nimport ubConferenceCenter.CatalogItem;\n\npublic class SmallRoom implements CatalogItem {\n    public String getName() {\n        return \"SMALL_ROOM\";\n    }\n\n    public boolean isEligibleForDiscount(int days) {\n        return days == 5;\n    }\n\n    public int getDiscountedPrice(int days) {\n        double discountRate = (days == 5) ? 0.9 : 1.0;\n        return (int) Math.round(getUnitPrice() * days * discountRate);\n    }\n\n    public int getUnitPrice() {\n        return 100;\n    }\n\n    public double getTaxRate() {\n        return 0.05;\n    }\n}" }
            ]}
        ];
        window.initFileExplorer('uncle-bob-explorer', fileData);
    };

    // Call initExplorer immediately
    initExplorer();


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

// File Explorer functionality
window.initFileExplorer = function(explorerId, fileData) {
    const explorer = document.getElementById(explorerId);
    if (!explorer) return;

    // Handle file selection
    explorer.addEventListener('click', function(e) {
        const fileItem = e.target.closest('.file-tree-item');
        const folderItem = e.target.closest('.file-tree-folder');

        if (folderItem) {
            // Toggle folder
            const children = folderItem.nextElementSibling;
            folderItem.classList.toggle('expanded');
            if (children && children.classList.contains('file-tree-children')) {
                children.classList.toggle('expanded');
            }
        } else if (fileItem) {
            // Select file
            const filePath = fileItem.dataset.file;
            const file = findFile(fileData, filePath);

            if (file) {
                // Update active state
                explorer.querySelectorAll('.file-tree-item').forEach(item => {
                    item.classList.remove('active');
                });
                fileItem.classList.add('active');

                // Update content panel
                displayFileContent(explorer, file);
            }
        }
    });

    function findFile(data, path) {
        for (const item of data) {
            if (item.path === path) return item;
            if (item.children) {
                const found = findFile(item.children, path);
                if (found) return found;
            }
        }
        return null;
    }

    function displayFileContent(explorer, file) {
        const contentPanel = explorer.querySelector('.file-content-panel');
        const escapedContent = escapeHtml(file.content);

        contentPanel.innerHTML = `
            <div class="file-content-header">
                <div class="file-content-title">${escapeHtml(file.name)}</div>
            </div>
            <pre class="file-content-code"><code class="language-java">${escapedContent}</code></pre>
        `;

        // Trigger syntax highlighting
        const codeBlock = contentPanel.querySelector('pre code');
        if (codeBlock) {
            // Highlight.js 10.x uses highlightBlock (highlightElement is 11.x+)
            if (window.hljs && window.hljs.highlightBlock) {
                window.hljs.highlightBlock(codeBlock);
            } else if (window.hljs && window.hljs.highlightElement) {
                window.hljs.highlightElement(codeBlock);
            } else if (typeof hljs !== 'undefined' && hljs.highlightBlock) {
                hljs.highlightBlock(codeBlock);
            } else {
                console.warn('highlight.js not available');
            }
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Build the file tree HTML
    function buildFileTree(files) {
        let html = '<ul class="file-tree">';

        files.forEach(file => {
            if (file.type === 'folder') {
                html += `<li class="file-tree-folder">${escapeHtml(file.name)}</li>`;
                html += '<ul class="file-tree-children">';
                file.children.forEach(child => {
                    html += `<li class="file-tree-item" data-file="${escapeHtml(child.path)}">${escapeHtml(child.name)}</li>`;
                });
                html += '</ul>';
            } else {
                html += `<li class="file-tree-item" data-file="${escapeHtml(file.path)}">${escapeHtml(file.name)}</li>`;
            }
        });

        html += '</ul>';
        return html;
    }

    // Build the explorer
    explorer.innerHTML = `
        <div class="file-tree-panel">
            ${buildFileTree(fileData)}
        </div>
        <div class="file-content-panel">
            <div class="file-content-placeholder">
                Select a file from the tree to view its contents
            </div>
        </div>
    `;
};
