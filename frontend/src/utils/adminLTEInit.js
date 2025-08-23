export const initAdminLTE = () => {
  console.log('Initializing AdminLTE components...');
  
  // Initialize sidebar toggle
  const initSidebar = () => {
    const sidebarToggle = document.querySelector('[data-widget="pushmenu"]');
    if (sidebarToggle) {
      // Remove any existing event listeners
      const newToggle = sidebarToggle.cloneNode(true);
      sidebarToggle.parentNode.replaceChild(newToggle, sidebarToggle);
      
      newToggle.addEventListener('click', (e) => {
        e.preventDefault();
        document.body.classList.toggle('sidebar-collapsed');
        
        // Store sidebar state
        const isCollapsed = document.body.classList.contains('sidebar-collapsed');
        localStorage.setItem('sidebarCollapsed', isCollapsed);
      });
    }
    
    // Restore sidebar state
    const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (sidebarCollapsed) {
      document.body.classList.add('sidebar-collapsed');
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }
  };

  // Initialize dropdown menus
  const initDropdowns = () => {
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    
    dropdownToggles.forEach(toggle => {
      // Clean up existing listeners
      const newToggle = toggle.cloneNode(true);
      toggle.parentNode.replaceChild(newToggle, toggle);
      
      newToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const menu = newToggle.nextElementSibling;
        if (menu && menu.classList.contains('dropdown-menu')) {
          // Close other open menus
          document.querySelectorAll('.dropdown-menu.show').forEach(openMenu => {
            if (openMenu !== menu) {
              openMenu.classList.remove('show');
            }
          });
          
          // Toggle current menu
          menu.classList.toggle('show');
        }
      });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.matches('.dropdown-toggle') && 
          !e.target.closest('.dropdown-menu') &&
          !e.target.closest('.dropdown-toggle')) {
        document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
          menu.classList.remove('show');
        });
      }
    });
  };

  // Initialize tooltips
  const initTooltips = () => {
    const tooltips = document.querySelectorAll('[title]');
    tooltips.forEach(element => {
      element.setAttribute('data-bs-toggle', 'tooltip');
      element.setAttribute('data-bs-placement', 'top');
    });
  };

  // Initialize all components
  const initializeAll = () => {
    initSidebar();
    initDropdowns();
    initTooltips();
    
    // Add any other AdminLTE initializations here
    console.log('AdminLTE initialization complete');
  };

  // Run initialization after a short delay to ensure DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAll);
  } else {
    setTimeout(initializeAll, 100);
  }
};

// Export for manual initialization if needed
export default initAdminLTE;