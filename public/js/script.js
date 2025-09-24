// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()

// Tax toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.getElementById("switchCheckDefault");
    const taxInfo = document.getElementsByClassName("tax-info");

    if (toggleButton && taxInfo.length > 0) {
        toggleButton.addEventListener("click", () => {
            for (const info of taxInfo) {
                if (toggleButton.checked) {
                    info.style.display = "inline";
                } else {
                    info.style.display = "none";
                }
            }
        });
    }
});

// Enhanced search suggestions functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const suggestionsDiv = document.getElementById('searchSuggestions');
    
    if (!searchInput || !suggestionsDiv) return;
    
    let debounceTimer;
    let currentFocus = -1;

    // Enhanced suggestions with more variety and better organization
    const suggestions = [
        { type: 'category', text: 'Beachfront Properties', icon: 'fa-umbrella-beach', category: 'Beachfront' },
        { type: 'category', text: 'Mountain Retreats', icon: 'fa-mountain', category: 'Mountains' },
        { type: 'category', text: 'Historic Castles', icon: 'fa-fort-awesome', category: 'Castles' },
        { type: 'category', text: 'Luxury Pools', icon: 'fa-person-swimming', category: 'Amazing Pools' },
        { type: 'category', text: 'Camping Adventures', icon: 'fa-campground', category: 'Camping' },
        { type: 'category', text: 'Farm Stays', icon: 'fa-cow', category: 'Farm' },
        { type: 'category', text: 'Arctic Getaways', icon: 'fa-snowflake', category: 'Arctic' },
        { type: 'category', text: 'Cozy Beds', icon: 'fa-bed', category: 'Beds' },
        { type: 'category', text: 'Iconic Cities', icon: 'fa-mountain-city', category: 'Iconic Cities' },
        { type: 'location', text: 'Bali, Indonesia', icon: 'fa-location-dot' },
        { type: 'location', text: 'New York City, USA', icon: 'fa-location-dot' },
        { type: 'location', text: 'Tokyo, Japan', icon: 'fa-location-dot' },
        { type: 'location', text: 'Paris, France', icon: 'fa-location-dot' },
        { type: 'location', text: 'Maldives', icon: 'fa-location-dot' },
        { type: 'location', text: 'Swiss Alps, Switzerland', icon: 'fa-location-dot' },
        { type: 'location', text: 'Tuscany, Italy', icon: 'fa-location-dot' },
        { type: 'location', text: 'Santorini, Greece', icon: 'fa-location-dot' }
    ];

    searchInput.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        const query = this.value.trim();
        currentFocus = -1;

        if (query.length < 2) {
            hideSuggestions();
            return;
        }

        debounceTimer = setTimeout(() => {
            showSuggestions(query);
        }, 300);
    });

    function showSuggestions(query) {
        const filteredSuggestions = suggestions.filter(suggestion =>
            suggestion.text.toLowerCase().includes(query.toLowerCase())
        );

        if (filteredSuggestions.length === 0) {
            hideSuggestions();
            return;
        }

        let suggestionsHTML = '';
        filteredSuggestions.slice(0, 8).forEach((suggestion, index) => {
            suggestionsHTML += `
                <div class="suggestion-item" data-index="${index}" onclick="selectSuggestion('${suggestion.text}', '${suggestion.category || ''}')">
                    <div class="suggestion-icon">
                        <i class="fa-solid ${suggestion.icon}"></i>
                    </div>
                    <div class="suggestion-content">
                        <div class="suggestion-title">${highlightMatch(suggestion.text, query)}</div>
                        <div class="suggestion-type">${suggestion.type}</div>
                    </div>
                </div>
            `;
        });

        suggestionsDiv.innerHTML = suggestionsHTML;
        suggestionsDiv.style.display = 'block';
    }

    function highlightMatch(text, query) {
        const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
        return text.replace(regex, '<strong>$1</strong>');
    }

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function hideSuggestions() {
        suggestionsDiv.style.display = 'none';
        currentFocus = -1;
    }

    // Handle keyboard navigation
    searchInput.addEventListener('keydown', function(e) {
        const suggestions = document.querySelectorAll('.suggestion-item');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            currentFocus++;
            if (currentFocus >= suggestions.length) currentFocus = 0;
            addActive(suggestions);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            currentFocus--;
            if (currentFocus < 0) currentFocus = suggestions.length - 1;
            addActive(suggestions);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (currentFocus > -1 && suggestions[currentFocus]) {
                suggestions[currentFocus].click();
            } else {
                document.querySelector('.search-form').submit();
            }
        } else if (e.key === 'Escape') {
            hideSuggestions();
            searchInput.blur();
        }
    });

    function addActive(suggestions) {
        removeActive(suggestions);
        if (currentFocus >= 0 && suggestions[currentFocus]) {
            suggestions[currentFocus].classList.add('suggestion-active');
        }
    }

    function removeActive(suggestions) {
        suggestions.forEach(suggestion => {
            suggestion.classList.remove('suggestion-active');
        });
    }

    // Hide suggestions when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.search-wrapper')) {
            hideSuggestions();
        }
    });

    // Show suggestions on focus if there's a value
    searchInput.addEventListener('focus', function() {
        if (this.value.trim().length >= 2) {
            showSuggestions(this.value.trim());
        }
    });

    // Clear search functionality
    const clearButtons = document.querySelectorAll('.clear-search-btn');
    clearButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            searchInput.value = '';
            hideSuggestions();
            window.location.href = this.href;
        });
    });
});

// Global function for selecting suggestions
function selectSuggestion(text, category) {
    const searchInput = document.getElementById('searchInput');
    const suggestionsDiv = document.getElementById('searchSuggestions');
    
    if (searchInput) {
        searchInput.value = text;
    }
    
    if (suggestionsDiv) {
        suggestionsDiv.style.display = 'none';
    }
    
    // If it's a category suggestion, redirect to category filter
    if (category) {
        window.location.href = `/listings?category=${encodeURIComponent(category)}`;
    } else {
        // Submit the search form
        const searchForm = document.querySelector('.search-form');
        if (searchForm) {
            searchForm.submit();
        }
    }
}

// Search term highlighting in results
function highlightSearchTerms() {
    // This will be populated by EJS template if there's a search query
    const searchQuery = window.searchQuery;
    
    if (searchQuery && searchQuery.trim()) {
        const searchTerm = searchQuery.toLowerCase();
        const titles = document.querySelectorAll('.card-text b');
        const locations = document.querySelectorAll('.card-text small');
        
        function highlightInElement(element, term) {
            const text = element.textContent.toLowerCase();
            if (text.includes(term)) {
                const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
                element.innerHTML = element.textContent.replace(regex, '<mark style="background-color: #fff3cd; padding: 1px 3px; border-radius: 3px;">$1</mark>');
            }
        }
        
        function escapeRegExp(string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }
        
        titles.forEach(title => highlightInElement(title, searchTerm));
        locations.forEach(location => highlightInElement(location, searchTerm));
    }
}

// Initialize highlighting when DOM is loaded
document.addEventListener('DOMContentLoaded', highlightSearchTerms);