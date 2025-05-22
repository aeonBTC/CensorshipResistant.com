document.addEventListener('DOMContentLoaded', function() {
    // Select all method cards and detail panels
    const methodCards = document.querySelectorAll('.method-card');
    const detailPanels = document.querySelectorAll('.detail-panel');
    const backButtons = document.querySelectorAll('.action-button.back');
    const panelsContainer = document.querySelector('.panels-container');
    
    // Adjust container height based on largest panel
    function updateContainerHeight() {
        let maxHeight = 0;
        detailPanels.forEach(panel => {
            // Only consider active panels for height calculation, as inactive ones are display:none
            if (panel.classList.contains('active')) {
                if (panel.offsetHeight > maxHeight) {
                    maxHeight = panel.offsetHeight;
                }
            }
        });
        if (maxHeight > 0) {
            panelsContainer.style.minHeight = `${maxHeight}px`;
        } else {
            panelsContainer.style.minHeight = '0px'; // Ensure container collapses if no panel is active
        }
    }
    
    // Initialize with first panel active if none active
    let hasActivePanel = false;
    detailPanels.forEach(panel => {
        if (panel.classList.contains('active')) {
            hasActivePanel = true;
        }
    });
    
    // Add click event to each method card
    methodCards.forEach(card => {
        card.addEventListener('click', function() {
            const method = this.getAttribute('data-method');
            const detailPanel = document.getElementById(`${method}-details`);
            
            // First make current active panel invisible
            detailPanels.forEach(panel => {
                if (panel.classList.contains('active')) {
                    panel.classList.remove('active');
                }
            });
            
            // Highlight selected method card
            methodCards.forEach(c => {
                c.classList.remove('active');
            });
            
            this.classList.add('active');
            
            // Show the selected panel with animation
            // Short delay to ensure transitions don't conflict
            setTimeout(() => {
                detailPanel.classList.add('active');
                updateContainerHeight();
                
                // Remove auto-scrolling to prevent screen jumping
            }, 50);
        });

        // Add subtle blue glow effect on hover
        card.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 5px 15px rgba(77, 171, 247, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                this.style.boxShadow = '';
            }
        });
    });
    
    // Set initial container height
    window.addEventListener('load', updateContainerHeight);
    window.addEventListener('resize', updateContainerHeight);
    
    // Add click event to back buttons
    backButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Hide all detail panels
            detailPanels.forEach(panel => {
                panel.classList.remove('active');
            });
            
            // Remove active class from method cards
            methodCards.forEach(card => {
                card.classList.remove('active');
                card.style.boxShadow = '';
            });
            
            // Scroll back to method cards
            document.querySelector('.flowchart-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        
        // Add subtle blue glow effect on hover for back buttons
        button.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 0 10px rgba(77, 171, 247, 0.2)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.boxShadow = '';
        });
    });
}); 