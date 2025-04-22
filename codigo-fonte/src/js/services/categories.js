document.addEventListener('DOMContentLoaded', function () {
    // Load categories into dropdowns
    function loadCategories() {
        const currentUser = Storage.getCurrentUser();
        if (!currentUser) return;

        const categories = Storage.getUserCategories(currentUser.id);

        // Update category dropdown in add task form
        const categorySelect = document.getElementById('taskCategory');
        const editCategorySelect = document.getElementById('editTaskCategory');
        const categoryFilter = document.getElementById('categoryFilter');

        if (categorySelect) {
            categorySelect.innerHTML = '';
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
        }

        if (editCategorySelect) {
            editCategorySelect.innerHTML = '';
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                editCategorySelect.appendChild(option);
            });
        }

        if (categoryFilter) {
            // Keep the "All Categories" option
            const allOption = categoryFilter.options[0];
            categoryFilter.innerHTML = '';
            categoryFilter.appendChild(allOption);

            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categoryFilter.appendChild(option);
            });
        }
    }

    // Save new category
    const saveCategoryBtn = document.getElementById('saveCategoryBtn');
    if (saveCategoryBtn) {
        saveCategoryBtn.addEventListener('click', function () {
            const categoryName = document.getElementById('categoryName').value;
            const categoryColor = document.getElementById('categoryColor').value;

            if (!categoryName) {
                alert('Category name is required');
                return;
            }

            const currentUser = Storage.getCurrentUser();

            const newCategory = {
                id: Storage.generateId(),
                name: categoryName,
                color: categoryColor,
                userId: currentUser.id
            };

            const categories = Storage.getCategories();
            categories.push(newCategory);
            Storage.saveCategories(categories);

            // Close modal and reset form
            const modal = bootstrap.Modal.getInstance(document.getElementById('addCategoryModal'));
            modal.hide();
            document.getElementById('categoryName').value = '';

            // Reload categories
            loadCategories();
        });
    }

    // Initialize
    loadCategories();

    // Export functions for use in other scripts
    window.CategoryManager = {
        loadCategories
    };
});