/**
 * Wuasi Box - Sistema de Gestión de Embalajes
 * Archivo JavaScript Principal
 * Versión: 3.0.1
 * Autor: Equipo Wuasi Box
 * Fecha: Marzo 2024
 */

// Configuración global del sistema
const WuasiBoxConfig = {
    version: '3.0.1',
    apiUrl: 'http://localhost:5000/api', // URL del backend
    itemsPerPage: 25,
    defaultCurrency: 'USD',
    dateFormat: 'dd/mm/yyyy',
    companyName: 'Wuasi Box',
    logoUrl: '../assets/logo.png'
};

// Clase principal para manejo de productos
class ProductManager {
    constructor() {
        this.products = [];
        this.currentProduct = null;
        this.filters = {
            category: '',
            search: '',
            minPrice: 0,
            maxPrice: 10000,
            stockLevel: 'all'
        };
    }

    // Cargar productos desde el backend
    async loadProducts() {
        try {
            console.log('Cargando productos...');
            // En un sistema real, esto haría una petición al backend
            // const response = await fetch(`${WuasiBoxConfig.apiUrl}/products`);
            // this.products = await response.json();
            
            // Por ahora usamos datos de ejemplo
            this.products = this.getSampleProducts();
            return this.products;
        } catch (error) {
            console.error('Error al cargar productos:', error);
            this.showError('No se pudieron cargar los productos. Por favor intente más tarde.');
            return [];
        }
    }

    // Guardar un producto nuevo
    async saveProduct(productData) {
        try {
            console.log('Guardando producto:', productData);
            
            // Validar datos del producto
            if (!this.validateProduct(productData)) {
                throw new Error('Datos del producto inválidos');
            }
            
            // En un sistema real, esto enviaría al backend
            // const response = await fetch(`${WuasiBoxConfig.apiUrl}/products`, {
            //     method: 'POST',
            //     headers: {'Content-Type': 'application/json'},
            //     body: JSON.stringify(productData)
            // });
            
            // Simular respuesta del servidor
            const newProduct = {
                ...productData,
                id: this.generateId(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            this.products.push(newProduct);
            this.showSuccess('Producto guardado exitosamente');
            
            return newProduct;
        } catch (error) {
            console.error('Error al guardar producto:', error);
            this.showError('Error al guardar el producto: ' + error.message);
            return null;
        }
    }

    // Actualizar producto existente
    async updateProduct(productId, updates) {
        try {
            const index = this.products.findIndex(p => p.id === productId);
            if (index === -1) {
                throw new Error('Producto no encontrado');
            }
            
            // En un sistema real, esto enviaría al backend
            // const response = await fetch(`${WuasiBoxConfig.apiUrl}/products/${productId}`, {
            //     method: 'PUT',
            //     headers: {'Content-Type': 'application/json'},
            //     body: JSON.stringify(updates)
            // });
            
            this.products[index] = {
                ...this.products[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            
            this.showSuccess('Producto actualizado exitosamente');
            return this.products[index];
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            this.showError('Error al actualizar el producto: ' + error.message);
            return null;
        }
    }

    // Eliminar producto
    async deleteProduct(productId) {
        try {
            if (!confirm('¿Está seguro de eliminar este producto? Esta acción no se puede deshacer.')) {
                return false;
            }
            
            // En un sistema real, esto enviaría al backend
            // const response = await fetch(`${WuasiBoxConfig.apiUrl}/products/${productId}`, {
            //     method: 'DELETE'
            // });
            
            this.products = this.products.filter(p => p.id !== productId);
            this.showSuccess('Producto eliminado exitosamente');
            return true;
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            this.showError('Error al eliminar el producto: ' + error.message);
            return false;
        }
    }

    // Buscar productos
    searchProducts(filters = {}) {
        let results = [...this.products];
        
        // Aplicar filtros
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            results = results.filter(product => 
                product.name.toLowerCase().includes(searchTerm) ||
                product.code.toLowerCase().includes(searchTerm) ||
                product.description?.toLowerCase().includes(searchTerm) ||
                product.category.toLowerCase().includes(searchTerm)
            );
        }
        
        if (filters.category) {
            results = results.filter(product => product.category === filters.category);
        }
        
        if (filters.minPrice > 0) {
            results = results.filter(product => product.price >= filters.minPrice);
        }
        
        if (filters.maxPrice < 10000) {
            results = results.filter(product => product.price <= filters.maxPrice);
        }
        
        if (filters.stockLevel && filters.stockLevel !== 'all') {
            results = results.filter(product => {
                const stockPercentage = (product.stock / product.minStock) * 100;
                switch(filters.stockLevel) {
                    case 'critical': return stockPercentage < 10;
                    case 'low': return stockPercentage < 25;
                    case 'medium': return stockPercentage >= 25 && stockPercentage <= 75;
                    case 'high': return stockPercentage > 75;
                    case 'out': return product.stock === 0;
                    default: return true;
                }
            });
        }
        
        return results;
    }

    // Obtener estadísticas
    getStatistics() {
        const totalProducts = this.products.length;
        const totalValue = this.products.reduce((sum, product) => sum + (product.price * product.stock), 0);
        const criticalProducts = this.products.filter(p => p.stock < p.minStock).length;
        const averageRotation = totalProducts > 0 ? 
            this.products.reduce((sum, p) => sum + (p.rotation || 2.3), 0) / totalProducts : 0;
        
        const categories = {};
        this.products.forEach(product => {
            categories[product.category] = (categories[product.category] || 0) + 1;
        });
        
        return {
            totalProducts,
            totalValue,
            criticalProducts,
            averageRotation: averageRotation.toFixed(1),
            categories
        };
    }

    // Métodos auxiliares
    validateProduct(product) {
        const requiredFields = ['name', 'category', 'price', 'stock', 'minStock'];
        for (const field of requiredFields) {
            if (!product[field] && product[field] !== 0) {
                this.showError(`El campo ${field} es requerido`);
                return false;
            }
        }
        
        if (product.price <= 0) {
            this.showError('El precio debe ser mayor a 0');
            return false;
        }
        
        if (product.stock < 0) {
            this.showError('El stock no puede ser negativo');
            return false;
        }
        
        return true;
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'} 
                                 alert-dismissible fade show position-fixed`;
        notification.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
        `;
        
        const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
        notification.innerHTML = `
            <i class="fas fa-${icon} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // Datos de ejemplo para desarrollo
    getSampleProducts() {
        return [
            {
                id: '1',
                code: 'WBS-100-0001',
                name: 'Cinta Transparente 48mm x 50m',
                category: 'Cintas Transparentes',
                brand: '3M',
                price: 4.99,
                stock: 150,
                minStock: 20,
                supplier: 'Distribuidora Central SA',
                location: 'A-01-02',
                description: 'Cinta adhesiva transparente para embalaje general',
                createdAt: '2024-01-15T10:30:00Z',
                updatedAt: '2024-03-10T14:20:00Z',
                status: 'active',
                rotation: 2.8
            },
            {
                id: '2',
                code: 'WBS-100-0002',
                name: 'Cinta Transparente 24mm x 25m',
                category: 'Cintas Transparentes',
                brand: 'Scotch',
                price: 3.50,
                stock: 89,
                minStock: 30,
                supplier: 'Embalajes SA',
                location: 'A-01-03',
                description: 'Cinta adhesiva transparente para usos generales',
                createdAt: '2024-02-10T09:15:00Z',
                updatedAt: '2024-03-12T11:45:00Z',
                status: 'active',
                rotation: 3.2
            },
            {
                id: '3',
                code: 'WBS-200-0001',
                name: 'Envoplast Industrial 20 micras',
                category: 'Envoplast',
                brand: 'StretchPro',
                price: 89.99,
                stock: 25,
                minStock: 5,
                supplier: 'Plásticos Industriales SA',
                location: 'B-02-01',
                description: 'Película estirable para pallets industriales',
                createdAt: '2024-01-20T08:45:00Z',
                updatedAt: '2024-03-08T16:30:00Z',
                status: 'active',
                rotation: 1.5
            },
            {
                id: '4',
                code: 'WBS-300-0001',
                name: 'Cinta Aislante 19mm x 20m',
                category: 'Cinta Aislante',
                brand: '3M',
                price: 6.50,
                stock: 5,
                minStock: 20,
                supplier: 'Electricidad Total',
                location: 'C-01-01',
                description: 'Cinta aislante para usos eléctricos',
                createdAt: '2024-01-10T14:20:00Z',
                updatedAt: '2024-03-15T10:15:00Z',
                status: 'active',
                rotation: 3.2
            },
            {
                id: '5',
                code: 'WBS-500-0001',
                name: 'Tirro de Papel 24mm x 50m',
                category: 'Tirro de Papel',
                brand: 'MaskingPro',
                price: 4.25,
                stock: 8,
                minStock: 15,
                supplier: 'Papeles Especiales',
                location: 'D-03-02',
                description: 'Cinta de papel para pintura y enmascaramiento',
                createdAt: '2024-02-20T11:30:00Z',
                updatedAt: '2024-03-09T09:45:00Z',
                status: 'active',
                rotation: 2.1
            }
        ];
    }
}

// Clase para manejo del formulario
class FormHandler {
    constructor(formId) {
        this.form = document.getElementById(formId);
        if (!this.form) {
            console.error(`Formulario con ID ${formId} no encontrado`);
            return;
        }
        
        this.fields = {};
        this.errors = {};
        this.init();
    }

    init() {
        // Configurar validación en tiempo real
        this.form.querySelectorAll('input, select, textarea').forEach(field => {
            if (field.name) {
                this.fields[field.name] = field;
                
                // Validación al perder foco
                field.addEventListener('blur', () => this.validateField(field));
                
                // Limpiar error al escribir
                field.addEventListener('input', () => this.clearError(field));
            }
        });

        // Configurar envío del formulario
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    validateField(field) {
        const value = field.value.trim();
        const name = field.name;
        this.errors[name] = null;

        // Validaciones básicas
        if (field.required && !value) {
            this.errors[name] = 'Este campo es requerido';
        } else if (field.type === 'email' && value && !this.isValidEmail(value)) {
            this.errors[name] = 'Email inválido';
        } else if (field.type === 'number') {
            const min = parseFloat(field.min);
            const max = parseFloat(field.max);
            const numValue = parseFloat(value);
            
            if (!isNaN(min) && numValue < min) {
                this.errors[name] = `El valor mínimo es ${min}`;
            } else if (!isNaN(max) && numValue > max) {
                this.errors[name] = `El valor máximo es ${max}`;
            }
        } else if (field.dataset.minLength && value.length < parseInt(field.dataset.minLength)) {
            this.errors[name] = `Mínimo ${field.dataset.minLength} caracteres`;
        } else if (field.dataset.maxLength && value.length > parseInt(field.dataset.maxLength)) {
            this.errors[name] = `Máximo ${field.dataset.maxLength} caracteres`;
        }

        // Mostrar/ocultar error
        this.displayError(field);
        
        return !this.errors[name];
    }

    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    displayError(field) {
        const errorElement = field.parentElement.querySelector('.invalid-feedback') || 
                           this.createErrorElement(field);
        
        if (this.errors[field.name]) {
            field.classList.add('is-invalid');
            field.classList.remove('is-valid');
            errorElement.textContent = this.errors[field.name];
            errorElement.style.display = 'block';
        } else {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
            errorElement.style.display = 'none';
        }
    }

    createErrorElement(field) {
        const errorElement = document.createElement('div');
        errorElement.className = 'invalid-feedback';
        field.parentElement.appendChild(errorElement);
        return errorElement;
    }

    clearError(field) {
        field.classList.remove('is-invalid');
        const errorElement = field.parentElement.querySelector('.invalid-feedback');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    validateAll() {
        let isValid = true;
        
        Object.values(this.fields).forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateAll()) {
            this.showFormError('Por favor corrija los errores en el formulario');
            return;
        }
        
        // Obtener datos del formulario
        const formData = this.getFormData();
        
        // Mostrar indicador de carga
        const submitButton = this.form.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Procesando...';
        submitButton.disabled = true;
        
        try {
            // En un sistema real, aquí enviaríamos los datos al backend
            // const response = await this.submitToBackend(formData);
            
            // Simular envío exitoso
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            this.showFormSuccess('Formulario enviado exitosamente');
            this.form.reset();
            
            // Resetear clases de validación
            Object.values(this.fields).forEach(field => {
                field.classList.remove('is-valid');
            });
            
        } catch (error) {
            this.showFormError('Error al enviar el formulario: ' + error.message);
        } finally {
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    }

    getFormData() {
        const data = {};
        Object.entries(this.fields).forEach(([name, field]) => {
            if (field.type === 'checkbox') {
                data[name] = field.checked;
            } else if (field.type === 'number') {
                data[name] = parseFloat(field.value) || 0;
            } else {
                data[name] = field.value.trim();
            }
        });
        return data;
    }

    showFormError(message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger alert-dismissible fade show';
        alertDiv.innerHTML = `
            <i class="fas fa-exclamation-circle me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        this.form.insertBefore(alertDiv, this.form.firstChild);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    showFormSuccess(message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success alert-dismissible fade show';
        alertDiv.innerHTML = `
            <i class="fas fa-check-circle me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        this.form.insertBefore(alertDiv, this.form.firstChild);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

// Clase para manejo de tablas de datos
class DataTable {
    constructor(tableId, options = {}) {
        this.table = document.getElementById(tableId);
        if (!this.table) {
            console.error(`Tabla con ID ${tableId} no encontrada`);
            return;
        }
        
        this.options = {
            searchable: true,
            sortable: true,
            pagination: true,
            itemsPerPage: 10,
            ...options
        };
        
        this.data = [];
        this.filteredData = [];
        this.currentPage = 1;
        this.sortColumn = null;
        this.sortDirection = 'asc';
        
        this.init();
    }

    init() {
        // Crear estructura de la tabla si no existe
        if (!this.table.querySelector('thead')) {
            this.createTableStructure();
        }
        
        // Agregar controles si es necesario
        if (this.options.searchable) {
            this.addSearchControl();
        }
        
        if (this.options.pagination) {
            this.addPaginationControls();
        }
        
        // Configurar eventos de ordenación
        if (this.options.sortable) {
            this.setupSorting();
        }
    }

    createTableStructure() {
        // Implementar según la estructura de datos
        console.log('Creando estructura de tabla...');
    }

    setData(data) {
        this.data = data;
        this.filteredData = [...data];
        this.render();
    }

    render() {
        if (!this.table) return;
        
        const tbody = this.table.querySelector('tbody');
        if (!tbody) {
            console.error('No se encontró tbody en la tabla');
            return;
        }
        
        tbody.innerHTML = '';
        
        // Calcular datos para la página actual
        const startIndex = (this.currentPage - 1) * this.options.itemsPerPage;
        const endIndex = startIndex + this.options.itemsPerPage;
        const pageData = this.filteredData.slice(startIndex, endIndex);
        
        // Renderizar filas
        pageData.forEach((item, index) => {
            const row = this.createRow(item, startIndex + index);
            tbody.appendChild(row);
        });
        
        // Actualizar paginación
        if (this.options.pagination) {
            this.updatePagination();
        }
        
        // Actualizar contador de resultados
        this.updateResultsCount();
    }

    createRow(item, index) {
        // Debe ser implementado según la estructura de datos
        const row = document.createElement('tr');
        row.innerHTML = `<td>${index + 1}</td><td>${JSON.stringify(item)}</td>`;
        return row;
    }

    addSearchControl() {
        const container = this.table.parentElement;
        const searchDiv = document.createElement('div');
        searchDiv.className = 'mb-3';
        searchDiv.innerHTML = `
            <div class="input-group">
                <span class="input-group-text"><i class="fas fa-search"></i></span>
                <input type="text" class="form-control" id="searchTable" 
                       placeholder="Buscar...">
            </div>
        `;
        
        container.insertBefore(searchDiv, this.table);
        
        const searchInput = searchDiv.querySelector('input');
        searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    }

    handleSearch(searchTerm) {
        if (!searchTerm.trim()) {
            this.filteredData = [...this.data];
        } else {
            const term = searchTerm.toLowerCase();
            this.filteredData = this.data.filter(item => 
                Object.values(item).some(value => 
                    value && value.toString().toLowerCase().includes(term)
                )
            );
        }
        
        this.currentPage = 1;
        this.render();
    }

    addPaginationControls() {
        const container = this.table.parentElement;
        const paginationDiv = document.createElement('div');
        paginationDiv.className = 'd-flex justify-content-between align-items-center mt-3';
        paginationDiv.innerHTML = `
            <div class="pagination-info"></div>
            <nav>
                <ul class="pagination mb-0">
                    <li class="page-item"><a class="page-link" href="#" data-page="prev">‹</a></li>
                    <li class="page-item"><a class="page-link" href="#" data-page="next">›</a></li>
                </ul>
            </nav>
        `;
        
        container.appendChild(paginationDiv);
        
        this.paginationInfo = paginationDiv.querySelector('.pagination-info');
        this.paginationNav = paginationDiv.querySelector('.pagination');
        
        this.paginationNav.addEventListener('click', (e) => {
            e.preventDefault();
            const target = e.target.closest('a');
            if (!target) return;
            
            const pageAction = target.dataset.page;
            if (pageAction === 'prev' && this.currentPage > 1) {
                this.currentPage--;
            } else if (pageAction === 'next' && 
                      this.currentPage < Math.ceil(this.filteredData.length / this.options.itemsPerPage)) {
                this.currentPage++;
            } else if (!isNaN(pageAction)) {
                this.currentPage = parseInt(pageAction);
            }
            
            this.render();
        });
    }

    updatePagination() {
        if (!this.paginationNav) return;
        
        const totalPages = Math.ceil(this.filteredData.length / this.options.itemsPerPage);
        
        // Limpiar paginación
        this.paginationNav.innerHTML = '';
        
        // Botón anterior
        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${this.currentPage === 1 ? 'disabled' : ''}`;
        prevLi.innerHTML = `<a class="page-link" href="#" data-page="prev">‹</a>`;
        this.paginationNav.appendChild(prevLi);
        
        // Números de página
        const maxVisible = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
        
        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageLi = document.createElement('li');
            pageLi.className = `page-item ${i === this.currentPage ? 'active' : ''}`;
            pageLi.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
            this.paginationNav.appendChild(pageLi);
        }
        
        // Botón siguiente
        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${this.currentPage === totalPages ? 'disabled' : ''}`;
        nextLi.innerHTML = `<a class="page-link" href="#" data-page="next">›</a>`;
        this.paginationNav.appendChild(nextLi);
    }

    updateResultsCount() {
        if (!this.paginationInfo) return;
        
        const total = this.filteredData.length;
        const start = Math.min((this.currentPage - 1) * this.options.itemsPerPage + 1, total);
        const end = Math.min(this.currentPage * this.options.itemsPerPage, total);
        
        this.paginationInfo.textContent = `Mostrando ${start}-${end} de ${total} resultados`;
    }

    setupSorting() {
        const headers = this.table.querySelectorAll('thead th[data-sortable]');
        headers.forEach(header => {
            header.style.cursor = 'pointer';
            header.addEventListener('click', () => this.handleSort(header));
        });
    }

    handleSort(header) {
        const column = header.dataset.sort;
        
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }
        
        // Actualizar indicadores visuales
        this.updateSortIndicators(header);
        
        // Ordenar datos
        this.sortData();
        this.render();
    }

    updateSortIndicators(currentHeader) {
        const headers = this.table.querySelectorAll('thead th[data-sortable]');
        headers.forEach(header => {
            header.classList.remove('sort-asc', 'sort-desc');
            if (header === currentHeader) {
                header.classList.add(`sort-${this.sortDirection}`);
            }
        });
    }

    sortData() {
        if (!this.sortColumn) return;
        
        this.filteredData.sort((a, b) => {
            let valA = a[this.sortColumn];
            let valB = b[this.sortColumn];
            
            // Convertir a números si es posible
            if (!isNaN(valA) && !isNaN(valB)) {
                valA = parseFloat(valA);
                valB = parseFloat(valB);
            }
            
            // Ordenar
            if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }
}

// Utilidades generales
const WuasiBoxUtils = {
    // Formatear fecha
    formatDate(date, format = WuasiBoxConfig.dateFormat) {
        const d = new Date(date);
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        
        if (format === 'dd/mm/yyyy') {
            return `${day}/${month}/${year}`;
        } else if (format === 'mm/dd/yyyy') {
            return `${month}/${day}/${year}`;
        } else if (format === 'yyyy-mm-dd') {
            return `${year}-${month}-${day}`;
        }
        
        return d.toLocaleDateString();
    },
    
    // Formatear moneda
    formatCurrency(amount, currency = WuasiBoxConfig.defaultCurrency) {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },
    
    // Generar código de producto
    generateProductCode(category) {
        const categoryCodes = {
            'Cintas Transparentes': '100',
            'Envoplast': '200',
            'Cinta Aislante': '300',
            'Cinta de Oficina': '400',
            'Tirro de Papel': '500',
            'Flejes Plásticos': '600',
            'Películas Estirables': '700',
            'Material de Protección': '800'
        };
        
        const code = categoryCodes[category] || '999';
        const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `WBS-${code}-${randomNum}`;
    },
    
    // Calcular margen de ganancia
    calculateMargin(purchasePrice, salePrice) {
        if (!purchasePrice || purchasePrice <= 0) return 0;
        return ((salePrice - purchasePrice) / purchasePrice) * 100;
    },
    
    // Validar stock mínimo
    validateStock(currentStock, minStock) {
        if (currentStock < minStock) {
            return {
                status: 'critical',
                message: `Stock crítico (${currentStock} < ${minStock})`
            };
        } else if (currentStock < minStock * 1.5) {
            return {
                status: 'warning',
                message: `Stock bajo (${currentStock})`
            };
        } else {
            return {
                status: 'good',
                message: `Stock adecuado (${currentStock})`
            };
        }
    },
    
    // Exportar datos a diferentes formatos
    exportData(data, format = 'csv', filename = 'wuasi-box-data') {
        let content, mimeType, extension;
        
        switch(format) {
            case 'csv':
                content = this.convertToCSV(data);
                mimeType = 'text/csv';
                extension = 'csv';
                break;
            case 'json':
                content = JSON.stringify(data, null, 2);
                mimeType = 'application/json';
                extension = 'json';
                break;
            case 'excel':
                // Para Excel necesitaríamos una librería como SheetJS
                console.warn('Exportación a Excel requiere librería adicional');
                return false;
            default:
                console.error('Formato de exportación no soportado');
                return false;
        }
        
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return true;
    },
    
    convertToCSV(data) {
        if (!Array.isArray(data) || data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const rows = data.map(row => 
            headers.map(header => {
                const value = row[header];
                // Escapar comillas y agregar comillas si contiene comas
                const escaped = String(value).replace(/"/g, '""');
                return escaped.includes(',') ? `"${escaped}"` : escaped;
            }).join(',')
        );
        
        return [headers.join(','), ...rows].join('\n');
    },
    
    // Cargar archivo
    async loadFile(file, type = 'json') {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('No se proporcionó archivo'));
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    let data;
                    if (type === 'json') {
                        data = JSON.parse(e.target.result);
                    } else if (type === 'text') {
                        data = e.target.result;
                    } else if (type === 'binary') {
                        data = e.target.result;
                    }
                    resolve(data);
                } catch (error) {
                    reject(new Error('Error al procesar el archivo: ' + error.message));
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Error al leer el archivo'));
            };
            
            if (type === 'json' || type === 'text') {
                reader.readAsText(file);
            } else if (type === 'binary') {
                reader.readAsArrayBuffer(file);
            }
        });
    }
};

// Inicialización global del sistema
document.addEventListener('DOMContentLoaded', function() {
    console.log('Wuasi Box System v' + WuasiBoxConfig.version + ' initialized');
    
    // Inicializar gestor de productos
    window.productManager = new ProductManager();
    
    // Configurar tooltips de Bootstrap
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Configurar popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
    
    // Manejar modales
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('shown.bs.modal', function() {
            console.log('Modal abierto:', this.id);
        });
    });
    
    // Actualizar fecha en elementos con clase .current-date
    document.querySelectorAll('.current-date').forEach(el => {
        el.textContent = WuasiBoxUtils.formatDate(new Date());
    });
    
    // Configurar validación de formularios
    const forms = document.querySelectorAll('.needs-validation');
    forms.forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });
});

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.WuasiBox = {
        Config: WuasiBoxConfig,
        ProductManager: ProductManager,
        FormHandler: FormHandler,
        DataTable: DataTable,
        Utils: WuasiBoxUtils
    };
}

export { ProductManager, FormHandler, DataTable, WuasiBoxUtils };